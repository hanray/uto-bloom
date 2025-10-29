import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { createOrganicLeafGeometry } from '../../utils/plantGeneration/createOrganicLeafGeometry';
import { createCentralStem, createPetioleCurve, createPetioleMesh } from './utils/createStemAndPetiole';
import { createSDFLeafBaseMaterial } from './materials/SDFLeafBase_CLEAN';
import { createSDFLeafEmissiveMaterial } from './materials/SDFLeafEmissive_CLEAN';
import { calculateMoistureScore } from '../../utils/plantGeneration/colorMapping';

// Import sparkle texture
import sparkleTextureUrl from '../../assets/textures/texture2.png';

/**
 * ProceduralPlant - Monstera Deliciosa with Stem + Petiole System
 * SDF materials with natural green colors
 */
function ProceduralPlant({ moisture = 343, speciesProfile }) {
  // Refs for leaves (base + emissive layers)
  const leavesBaseRef = useRef();
  const leavesEmissiveRef = useRef();
  
  // Refs for stem and petioles
  const petiolesGroupRef = useRef();
  const centralStemRef = useRef();
  
  // Stalk group ref for unified sway animation
  const stalkGroupRef = useRef();
  const timeRef = useRef(0);
  
  // Material refs for uniform updates
  const baseMatRef = useRef();
  const emissiveMatRef = useRef();
  
  // Load sparkle texture
  const sparkleTexture = useLoader(THREE.TextureLoader, sparkleTextureUrl);
  
  // Configure texture
  useEffect(() => {
    if (sparkleTexture) {
      sparkleTexture.wrapS = THREE.RepeatWrapping;
      sparkleTexture.wrapT = THREE.RepeatWrapping;
      sparkleTexture.minFilter = THREE.LinearFilter;
      sparkleTexture.magFilter = THREE.LinearFilter;
    }
  }, [sparkleTexture]);
  
  // Calculate moisture score for material
  const moistureScore = calculateMoistureScore(moisture, speciesProfile.healthThresholds);
  
  // Natural green color (instead of cyan/magenta neon)
  const leafColor = useMemo(() => {
    // Base: Rich forest green
    const baseGreen = new THREE.Color(0.18, 0.45, 0.22);
    
    // Healthy: Brighter, more saturated green
    const healthyGreen = new THREE.Color(0.25, 0.55, 0.28);
    
    // Dry: More olive/yellowish green
    const dryGreen = new THREE.Color(0.35, 0.48, 0.20);
    
    // Interpolate based on moisture
    if (moistureScore > 0.6) {
      // Healthy range: interpolate to bright green
      const t = (moistureScore - 0.6) / 0.4;
      return new THREE.Color().lerpColors(baseGreen, healthyGreen, t);
    } else {
      // Dry range: interpolate to olive
      const t = moistureScore / 0.6;
      return new THREE.Color().lerpColors(dryGreen, baseGreen, t);
    }
  }, [moistureScore, speciesProfile]);
  
  // Get leaf parameters from species profile
  const leafParams = speciesProfile.leaf || speciesProfile.leaves;
  const leafCount = leafParams.count || 12;
  const layers = leafParams.layers || 2; // Reduced for performance
  const segments = leafParams.segments || [32, 8];
  const size = leafParams.size || [0.42, 0.56];
  const organic = leafParams.organic || {
    ribCurvature: 0.18,
    archConcavity: 0.22,
    tipTwist: 0.35,
    thickness: 0.007,
    rimCurl: 0.15,
    noiseAmp: 0.0015
  };
  const totalInstances = leafCount * layers;
  
  // Create organic leaf geometry with curvature (mature version as base)
  const leafletGeometry = useMemo(() => {
    const shape = leafParams.shape || {};
    
    const geom = createOrganicLeafGeometry({
      width: size[0] * 2,
      height: size[1],
      segmentsX: segments[0],
      segmentsY: segments[1],
      ribCurvature: organic.ribCurvature,
      archConcavity: organic.archConcavity,
      tipTwist: organic.tipTwist,
      thickness: organic.thickness,
      rimCurl: organic.rimCurl,
      // FEATURE FLAG: Enable fenestrations/splits for Monstera only
      useCutMasks: leafParams.useCutMasks || false,
      // Use mature level - we'll limit via shader masking for young leaves
      maturity: 0.85,
      // Fenestrations from JSON
      fenCount: shape.fenestrationCount || 8,
      fenInner: 0.22,
      fenOuter: 0.78,
      fenSize: shape.fenestrationSize || 0.12,
      fenAspect: shape.fenestrationElongation || 2.2,
      fenBias: shape.fenestrationBias || 0.35,
      // Edge splits from JSON
      splitCount: shape.splitFrequency || 7,
      splitDepth: shape.splitDepth || 0.35,
      splitTaper: shape.splitTaper || 0.6
    });
    
    // Add instance attributes for shader optimization
    const leafIndexArray = new Float32Array(totalInstances);
    const layerIdArray = new Float32Array(totalInstances);
    const seedArray = new Float32Array(totalInstances);
    
    for (let i = 0; i < totalInstances; i++) {
      const leafIndex = Math.floor(i / layers);
      const layerId = i % layers;
      
      leafIndexArray[i] = leafIndex;
      layerIdArray[i] = layerId;
      seedArray[i] = Math.random(); // Per-instance random seed
    }
    
    geom.setAttribute('aLeafIndex', new THREE.InstancedBufferAttribute(leafIndexArray, 1));
    geom.setAttribute('aLayerId', new THREE.InstancedBufferAttribute(layerIdArray, 1));
    geom.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedArray, 1));
    
    return geom;
  }, [size, segments, organic, totalInstances, leafCount, layers]);
  
  // Create SDF leaf materials with enhanced bioluminescence
  const sdfMaterials = useMemo(() => {
    if (!sparkleTexture) return null;
    
    const materialConfig = speciesProfile.material || {};
    
    return {
      base: createSDFLeafBaseMaterial({
        healthColor: leafColor,
        moisture: moistureScore,
        blueNoiseTexture: sparkleTexture,
        leafCount: leafCount,
        layers: layers,
        layerOffset: leafParams.layerOffset || 0.0025,
        blueNoiseScale: leafParams.blueNoiseScale || 4.0,
        useCutMasks: leafParams.useCutMasks || false,
        // Biolumen parameters from JSON
        transmission: materialConfig.transmission || 0.45,
        thickness: materialConfig.thickness || 0.002,
        ior: materialConfig.ior || 1.45,
        clearcoat: materialConfig.clearcoat || 0.35,
        clearcoatRoughness: materialConfig.clearcoatRoughness || 0.10,
        roughness: materialConfig.roughness || 0.15,
        uBacklight: materialConfig.uBacklight || 0.8,
        uVeinGloss: materialConfig.uVeinGloss || 0.85,
        uIridescence: materialConfig.uIridescence || 0.35,
        fresnelStrength: materialConfig.fresnelStrength || 0.75,
        fresnelPower: materialConfig.fresnelPower || 2.5,
        edgeGlowColor: materialConfig.edgeGlowColor || [0.6, 0.9, 0.7],
        backlightAmplification: materialConfig.backlightAmplification || 0.4,
        veinTransmissionBlock: materialConfig.veinTransmissionBlock || 0.6,
        internalGlowColor: materialConfig.internalGlowColor || [0.4, 0.7, 0.4],
        gradientCenterColor: materialConfig.gradientCenterColor || [0.2, 0.4, 0.2],
        gradientEdgeColor: materialConfig.gradientEdgeColor || [0.5, 0.8, 0.4],
        gradientStrength: materialConfig.gradientStrength || 0.7
      }),
      emissive: createSDFLeafEmissiveMaterial({
        healthColor: leafColor,
        moisture: moistureScore,
        sparkleTexture: sparkleTexture,
        leafCount: leafCount,
        layers: layers,
        layerOffset: leafParams.layerOffset || 0.0025,
        blueNoiseScale: leafParams.blueNoiseScale || 4.0,
        useCutMasks: leafParams.useCutMasks || false
      })
    };
  }, [sparkleTexture, leafColor, moistureScore, leafCount, layers, leafParams, speciesProfile]);
  
  // Store material refs
  useEffect(() => {
    if (!sdfMaterials) return;
    baseMatRef.current = sdfMaterials.base;
    emissiveMatRef.current = sdfMaterials.emissive;
  }, [sdfMaterials]);
  
  // Create central stem mesh
  const centralStem = useMemo(() => {
    if (!speciesProfile.stem) return null;
    return createCentralStem(speciesProfile.stem);
  }, [speciesProfile]);
  
  // Store stem ref for pulsing animation
  useEffect(() => {
    if (centralStem) {
      centralStemRef.current = centralStem;
    }
  }, [centralStem]);

  // Create simple plant pot
  const potGeometry = useMemo(() => {
    // Cylindrical pot with slight taper
    const segments = 32;
    const height = 0.8;
    const topRadius = 0.5;
    const bottomRadius = 0.4;
    
    const geometry = new THREE.CylinderGeometry(
      topRadius,    // top radius
      bottomRadius, // bottom radius
      height,       // height
      segments,     // radial segments
      1,           // height segments
      false        // open ended
    );
    
    return geometry;
  }, []);

  // Position leaves with stem and petiole system
  useEffect(() => {
    if (!leavesBaseRef.current || !leavesEmissiveRef.current) return;
    if (!petiolesGroupRef.current) return;
    
    const cluster = speciesProfile.cluster || { spiralTurn: 137.5, radius: 0.42, elevation: 0.12 };
    const petioleSpec = speciesProfile.petiole || {};
    const stemSpec = speciesProfile.stem || {};
    
    const spiralAngle = cluster.spiralTurn || 137.5;
    const baseRadius = cluster.radius;
    const elevation = cluster.elevation;
    const stemHeight = stemSpec.height || 0.55;
    
    const dummy = new THREE.Object3D();
    
    // Clear previous petioles
    while (petiolesGroupRef.current.children.length > 0) {
      petiolesGroupRef.current.remove(petiolesGroupRef.current.children[0]);
    }
    
    let instanceIndex = 0;
    
    for (let leafIndex = 0; leafIndex < leafCount; leafIndex++) {
      // Calculate spiral position for this leaf
      const angle = (leafIndex * spiralAngle * Math.PI / 180);
      const heightOnStem = (leafIndex / leafCount) * stemHeight;
      
      // Stem attachment point (on central stem)
      const stemAttach = new THREE.Vector3(0, heightOnStem, 0);
      
      // VARIED PETIOLE LENGTH (like reference photos)
      // Lower leaves have longer petioles reaching outward
      // Upper leaves have shorter petioles, more compact
      const petioleHeightFactor = 1.0 - (heightOnStem / stemHeight); // 1.0 at base, 0.0 at top
      const petioleLengthVariation = 0.7 + petioleHeightFactor * 0.8; // 0.7-1.5x length
      const adjustedPetioleLength = (petioleSpec.length || 0.55) * petioleLengthVariation;
      
      // Create adjusted petiole spec
      const adjustedPetioleSpec = {
        ...petioleSpec,
        length: adjustedPetioleLength
      };
      
      // Leaf position (outward from stem)
      const radiusVar = 1.0 + 0.15 * Math.sin(leafIndex * 0.9);
      const radius = baseRadius * radiusVar;
      const leafX = Math.cos(angle) * radius;
      const leafZ = Math.sin(angle) * radius;
      const leafY = heightOnStem + elevation * 0.5; // Slightly raised
      const leafPosition = new THREE.Vector3(leafX, leafY, leafZ);
      
      // Create petiole curve and mesh with adjusted length
      const curve = createPetioleCurve(stemAttach, leafPosition, adjustedPetioleSpec);
      const petioleMesh = createPetioleMesh(curve, adjustedPetioleSpec);
      petiolesGroupRef.current.add(petioleMesh);
      
      // Random jitter from JSON
      const yawJitter = (Math.random() - 0.5) * (leafParams.yawJitter || 0.18);
      const pitchJitter = (Math.random() - 0.5) * (leafParams.pitchJitter || 0.12);
      const tiltUp = leafParams.tiltUp || 0.35;
      
      // Size variation: 3-5 big leaves, rest small (half size)
      const v = leafIndex / (leafCount - 1);
      
      // Determine if this is a "big" leaf (mature) or "small" leaf (young/immature)
      // First ~3-5 leaves are big, rest are small
      const bigLeafCount = Math.floor(leafCount * 0.5); // ~50% are big
      const isBigLeaf = leafIndex < bigLeafCount;
      
      let scaleFactor;
      if (isBigLeaf) {
        // BIG MATURE LEAVES: Base size with variation (80%-120%)
        const sizeVariation = 0.8 + Math.random() * 0.4;
        scaleFactor = 1.0 * sizeVariation;
      } else {
        // SMALL IMMATURE LEAVES: Half size with variation (40%-60% of big leaves)
        const sizeVariation = 0.8 + Math.random() * 0.4;
        scaleFactor = 0.5 * sizeVariation;
      }
      
      // RARE gravity droop: only ~20% of leaves droop significantly
      const droopChance = Math.random();
      let droopAngle = 0.0;
      if (droopChance < 0.2) {
        // Rare heavy droop (large mature leaves)
        const leafWeight = scaleFactor * scaleFactor;
        droopAngle = leafWeight * 0.4;
      } else if (droopChance < 0.4) {
        // Occasional slight droop
        droopAngle = Math.random() * 0.15;
      }
      // else: 60% of leaves point upward with no droop
      
      // PHOTOTROPISM: Leaves orient towards sun position [3, 4, 2]
      const sunPosition = new THREE.Vector3(3, 4, 2);
      const leafToSun = new THREE.Vector3().subVectors(sunPosition, leafPosition);
      leafToSun.normalize();
      
      // Calculate angle towards sun (stronger for upper leaves, weaker for lower)
      const phototropismStrength = 0.5 + (heightOnStem / stemHeight) * 0.5; // 0.5-1.0
      const targetDirection = new THREE.Vector3()
        .addVectors(
          new THREE.Vector3(0, 1, 0), // Base upward
          leafToSun.multiplyScalar(phototropismStrength * 1.5) // Pull towards sun
        )
        .normalize();
      
      // Create each layer for this leaf
      for (let layerId = 0; layerId < layers; layerId++) {
        dummy.position.copy(leafPosition);
        
        // Orient leaf towards sun + apply jitter + droop
        const lookTarget = new THREE.Vector3()
          .copy(targetDirection)
          .add(leafPosition);
        
        dummy.lookAt(lookTarget);
        dummy.rotateX(-(Math.PI / 2) + tiltUp + pitchJitter - droopAngle);
        dummy.rotateZ(yawJitter);
        
        // Apply size variation
        dummy.scale.setScalar(scaleFactor);
        
        dummy.updateMatrix();
        leavesBaseRef.current.setMatrixAt(instanceIndex, dummy.matrix);
        leavesEmissiveRef.current.setMatrixAt(instanceIndex, dummy.matrix);
        
        instanceIndex++;
      }
    }
    
    // Mark for update
    leavesBaseRef.current.instanceMatrix.needsUpdate = true;
    leavesEmissiveRef.current.instanceMatrix.needsUpdate = true;
  }, [leafCount, layers, speciesProfile, leafParams, totalInstances]);

  // Animation loop - update SDF uniforms + subtle global sway + stem pulsing
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Global stem sway
    if (stalkGroupRef.current) {
      stalkGroupRef.current.rotation.z = Math.sin(timeRef.current * 0.3) * 0.02;
      stalkGroupRef.current.rotation.x = Math.sin(timeRef.current * 0.25) * 0.015;
    }
    
    // STEM AND PETIOLE PULSING (subtle breathing effect)
    const pulseSpeed = 0.8; // Slow pulse
    const pulseIntensity = 0.35; // Visible glow (increased from 0.15)
    
    // Animate central stem
    if (centralStemRef.current && centralStemRef.current.material) {
      const mat = centralStemRef.current.material;
      const pulse = Math.sin(timeRef.current * pulseSpeed) * 0.5 + 0.5; // 0-1
      mat.emissiveIntensity = pulse * pulseIntensity;
      mat.needsUpdate = true;
    }
    
    // Animate petioles (each with slight phase offset)
    if (petiolesGroupRef.current) {
      petiolesGroupRef.current.children.forEach((petioleMesh) => {
        if (petioleMesh.material && petioleMesh.material.userData.pulsePhase !== undefined) {
          const mat = petioleMesh.material;
          const phase = mat.userData.pulsePhase;
          const pulse = Math.sin(timeRef.current * pulseSpeed + phase) * 0.5 + 0.5;
          mat.emissiveIntensity = pulse * pulseIntensity * 0.8; // Slightly dimmer than stem
          mat.needsUpdate = true;
        }
      });
    }
    
    // Update SDF material uniforms
    if (baseMatRef.current && baseMatRef.current.userData.uniforms) {
      const uniforms = baseMatRef.current.userData.uniforms;
      uniforms.uTime.value = timeRef.current;
      uniforms.uMoisture.value = moistureScore;
      uniforms.uHealthColor.value.copy(leafColor);
    }
    
    if (emissiveMatRef.current && emissiveMatRef.current.userData.uniforms) {
      const uniforms = emissiveMatRef.current.userData.uniforms;
      uniforms.uTime.value = timeRef.current;
      uniforms.uMoisture.value = moistureScore;
      uniforms.uHealthColor.value.copy(leafColor);
    }
  });

  return (
    <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
      {/* Show loading state while texture loads */}
      {!sdfMaterials && (
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}
      
      {sdfMaterials && (
        <>
          {/* Dark plane under stem for depth/separation */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>

          {/* Plant pot - solid with subtle reflection */}
          <mesh geometry={potGeometry} position={[0, -1.1, 0]}>
            <meshStandardMaterial 
              color="#2a2a2a"
              roughness={0.6}
              metalness={0.2}
            />
          </mesh>

          {/* Unified stalk group - enables global sway */}
          <group ref={stalkGroupRef} position={[0, -0.95, 0]}>
            {/* Central stem - connect to pot */}
            {centralStem && (
              <primitive 
                object={centralStem} 
                ref={centralStemRef}
              />
            )}
            
            {/* Petioles group - dynamically populated */}
            <group ref={petiolesGroupRef} />

            {/* SDF Leaves - Base translucent pass with natural green */}
            <instancedMesh 
              ref={leavesBaseRef}
              args={[leafletGeometry, sdfMaterials.base, totalInstances]}
            />

            {/* SDF Leaves - Subtle emissive rim (not overpowering) */}
            <instancedMesh 
              ref={leavesEmissiveRef}
              args={[leafletGeometry, sdfMaterials.emissive, totalInstances]}
            />
          </group>
        </>
      )}
    </group>
  );
}

export default ProceduralPlant;
