import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMoistureColorThree, calculateMoistureScore } from '../../utils/plantGeneration/colorMapping';

/**
 * ProceduralPlant - Money Tree (Pachira aquatica)
 * Simple emissive glowing leaves with neon color palette
 */
function ProceduralPlant({ moisture = 343, speciesProfile }) {
  // Refs
  const leavesRef = useRef();
  const trunkMaterialRef = useRef();
  const leafMaterialRef = useRef();
  const timeRef = useRef(0);
  
  // Get health color based on moisture
  const healthColorHex = getMoistureColorThree(moisture, speciesProfile.healthThresholds);
  const healthColor = new THREE.Color(healthColorHex);
  
  // Target color for smooth transitions
  const targetColorRef = useRef(healthColor.clone());
  const currentColorRef = useRef(healthColor.clone());
  
  // Trunk geometry
  const trunkGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      0.05,  // top radius
      0.08,  // bottom radius - thicker at base
      2.5,   // height - tall
      16,    // segments - smooth cylinder
      1
    );
    
    return geometry;
  }, []);

  // Create realistic palmate leaf (one leaflet with proper shape)
  // NOTE: Using PlaneGeometry for proper UVs - SDF shader will handle the leaf shape
  const leafletGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.5, 1.0, 1, 1);
    
    // Add subtle curvature to make leaves look 3D
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      // Curve outward along the length
      positions[i + 2] = Math.sin((y + 0.5) * Math.PI) * 0.05;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

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

  // Calculate moisture score for material properties
  const moistureScore = calculateMoistureScore(moisture, speciesProfile.healthThresholds);
  
  // Get health color (neon palette) - already declared at top
  const healthColor = new THREE.Color(healthColorHex);
  
  // Target color for smooth transitions
  const targetColorRef = useRef(healthColor.clone());
  const currentColorRef = useRef(healthColor.clone());

  // Position palmate leaf clusters realistically (applied to all SDF layer instances)
  useEffect(() => {
    const allLeafRefs = [
      leavesBaseLayer0Ref.current,
      leavesBaseLayer1Ref.current,
      leavesBaseLayer2Ref.current,
      leavesEmissiveRef.current
    ];
    
    // Only proceed if all refs are ready
    if (allLeafRefs.some(ref => !ref)) return;
    
    const clusterCount = 4; // 4 main leaf clusters
    const leafletsPerCluster = 5; // 5 leaflets per palmate leaf
    const dummy = new THREE.Object3D();
    
    let leafletIndex = 0;
    
    for (let cluster = 0; cluster < clusterCount; cluster++) {
      // Position clusters around top of trunk
      const clusterAngle = (cluster / clusterCount) * Math.PI * 2 + Math.random() * 0.3;
      const clusterHeight = 1.0 + (Math.random() - 0.5) * 0.3;
      const clusterRadius = 0.1 + Math.random() * 0.05;
      
      // Central stem position
      const stemX = Math.cos(clusterAngle) * clusterRadius;
      const stemZ = Math.sin(clusterAngle) * clusterRadius;
      
      // Create 5 leaflets radiating from center (palmate pattern)
      for (let leaflet = 0; leaflet < leafletsPerCluster; leaflet++) {
        // Spread leaflets in a fan (like fingers on a hand)
        const fanAngle = (leaflet - 2) * 0.35; // Center leaflet at 0, others spread ±0.35 rad
        const outwardDistance = 0.8 + (Math.abs(leaflet - 2) * 0.1); // Center leaflet longest
        
        // Calculate leaflet position
        const leafletAngle = clusterAngle + fanAngle;
        dummy.position.set(
          stemX + Math.cos(leafletAngle) * outwardDistance,
          clusterHeight + 0.2,
          stemZ + Math.sin(leafletAngle) * outwardDistance
        );
        
        // Orient leaflet upward and outward
        const targetX = stemX + Math.cos(leafletAngle) * 3;
        const targetZ = stemZ + Math.sin(leafletAngle) * 3;
        dummy.lookAt(targetX, clusterHeight + 1.5, targetZ);
        
        // Rotate to face upward
        dummy.rotateX(-Math.PI / 2);
        
        // Add natural droop
        dummy.rotateX(0.2 + Math.random() * 0.1);
        
        // Slight rotation variation
        dummy.rotateZ((Math.random() - 0.5) * 0.2);
        
        // Size variation (center leaflets slightly larger)
        const sizeVariation = leaflet === 2 ? 1.1 : 0.9 + Math.random() * 0.2;
        dummy.scale.setScalar(sizeVariation);
        
        dummy.updateMatrix();
        
        // Apply same transform to all leaf layers
        allLeafRefs.forEach(ref => {
          if (ref) ref.setMatrixAt(leafletIndex, dummy.matrix);
        });
        
        leafletIndex++;
      }
    }
    
    // Mark all instance matrices for update
    allLeafRefs.forEach(ref => {
      if (ref) ref.instanceMatrix.needsUpdate = true;
    });
  }, [speciesProfile]);

  // Update target color when moisture changes
  useEffect(() => {
    targetColorRef.current.set(healthColor);
  }, [healthColor]);

  // Animation loop - update SDF material uniforms
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // 1. Pulsing glow animation
    const pulseSpeed = THREE.MathUtils.lerp(0.5, 2.0, 1 - moistureScore);
    const pulseCycle = Math.sin(timeRef.current * pulseSpeed * Math.PI * 2) * 0.5 + 0.5;
    
    // Update trunk material
    if (trunkMaterialRef.current) {
      trunkMaterialRef.current.emissiveIntensity = 0.3 + pulseCycle * 0.2;
    }
    
    // 2. Smooth color transitions
    currentColorRef.current.lerp(targetColorRef.current, delta * 2);
    if (trunkMaterialRef.current) {
      trunkMaterialRef.current.color.copy(currentColorRef.current);
      trunkMaterialRef.current.emissive.copy(currentColorRef.current);
    }
    
    // 3. Update SDF material uniforms (all layers)
    const sdfMats = [baseLayer0MatRef, baseLayer1MatRef, baseLayer2MatRef, emissiveMatRef];
    sdfMats.forEach(matRef => {
      if (matRef.current && matRef.current.userData.uniforms) {
        const uniforms = matRef.current.userData.uniforms;
        uniforms.uTime.value = timeRef.current;
        uniforms.uMoisture.value = moistureScore;
        uniforms.uHealthColor.value.copy(currentColorRef.current);
        
        // Sparkle density scales with moisture (emissive only)
        if (matRef === emissiveMatRef && uniforms.uSparkleDensity) {
          uniforms.uSparkleDensity.value = THREE.MathUtils.lerp(0.3, 1.0, moistureScore);
        }
      }
    });
    
    // 4. Leaf droop when dry (applied to all layer instances)
    if (moistureScore < 0.5) {
      const allLeafRefs = [
        leavesBaseLayer0Ref.current,
        leavesBaseLayer1Ref.current,
        leavesBaseLayer2Ref.current,
        leavesEmissiveRef.current
      ];
      
      const droopAmount = (0.5 - moistureScore) * 2;
      const clusterCount = 4;
      const leafletsPerCluster = 5;
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < clusterCount * leafletsPerCluster; i++) {
        // Get matrix from first layer (they're all identical positions)
        if (allLeafRefs[0]) {
          allLeafRefs[0].getMatrixAt(i, dummy.matrix);
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
          
          // Droop leaflets downward
          dummy.rotation.x += droopAmount * 0.2;
          
          dummy.updateMatrix();
          
          // Apply drooped transform to all layers
          allLeafRefs.forEach(ref => {
            if (ref) ref.setMatrixAt(i, dummy.matrix);
          });
        }
      }
      
      // Mark all for update
      allLeafRefs.forEach(ref => {
        if (ref) ref.instanceMatrix.needsUpdate = true;
      });
    }
  });

  return (
    <group rotation={[0, 0, 0]} position={[0, -1.2, 0]}>
      {/* Plant pot - solid with subtle glow */}
      <mesh geometry={potGeometry} position={[0, -1.1, 0]}>
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Trunk - solid with artistic glow */}
      <mesh geometry={trunkGeometry}>
        <meshStandardMaterial 
          ref={trunkMaterialRef}
          color={healthColor}
          emissive={healthColor}
          emissiveIntensity={0.4}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* SDF Leaves - Base translucent pass (3 layers for depth) */}
      <instancedMesh 
        ref={leavesBaseLayer0Ref}
        args={[leafletGeometry, sdfMaterials.baseLayer0, 20]}
      />
      <instancedMesh 
        ref={leavesBaseLayer1Ref}
        args={[leafletGeometry, sdfMaterials.baseLayer1, 20]}
      />
      <instancedMesh 
        ref={leavesBaseLayer2Ref}
        args={[leafletGeometry, sdfMaterials.baseLayer2, 20]}
      />

      {/* SDF Leaves - Emissive overlay (rim + sparkles) */}
      <instancedMesh 
        ref={leavesEmissiveRef}
        args={[leafletGeometry, sdfMaterials.emissive, 20]}
      />
    </group>
  );
}

export default ProceduralPlant;
