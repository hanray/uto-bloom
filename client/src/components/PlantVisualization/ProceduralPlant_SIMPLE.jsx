import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMoistureColorThree, calculateMoistureScore } from '../../utils/plantGeneration/colorMapping';

/**
 * ProceduralPlant - Money Tree (Pachira aquatica)
 * SIMPLE VERSION: Emissive glowing leaves with neon color palette
 */
function ProceduralPlant({ moisture = 343, speciesProfile }) {
  const leavesRef = useRef();
  const trunkMaterialRef = useRef();
  const timeRef = useRef(0);
  
  const targetColorRef = useRef(new THREE.Color());
  const currentColorRef = useRef(new THREE.Color());

  // Trunk geometry
  const trunkGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      0.05,  // top radius
      0.08,  // bottom radius - thicker at base
      2.5,   // height
      16,    // segments
      1
    );
    return geometry;
  }, []);

  // Simple plane geometry for leaves
  const leafletGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.5, 1.0, 1, 1);
    
    // Add subtle curvature
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      positions[i + 2] = Math.sin((y + 0.5) * Math.PI) * 0.05;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  // Plant pot geometry
  const potGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      0.5,   // top radius
      0.4,   // bottom radius
      0.8,   // height
      32,    // segments
      1,
      false
    );
    return geometry;
  }, []);

  // Calculate moisture score
  const moistureScore = calculateMoistureScore(moisture, speciesProfile.healthThresholds);
  
  // Get health color
  const healthColorHex = getMoistureColorThree(moisture, speciesProfile.healthThresholds);

  // Position leaves in palmate clusters
  useEffect(() => {
    if (!leavesRef.current) return;
    
    const clusterCount = 4;
    const leafletsPerCluster = 5;
    const dummy = new THREE.Object3D();
    let leafletIndex = 0;
    
    for (let cluster = 0; cluster < clusterCount; cluster++) {
      const clusterAngle = (cluster / clusterCount) * Math.PI * 2 + Math.random() * 0.3;
      const clusterHeight = 1.0 + (Math.random() - 0.5) * 0.3;
      const clusterRadius = 0.1 + Math.random() * 0.05;
      
      const stemX = Math.cos(clusterAngle) * clusterRadius;
      const stemZ = Math.sin(clusterAngle) * clusterRadius;
      
      for (let leaflet = 0; leaflet < leafletsPerCluster; leaflet++) {
        const fanAngle = (leaflet - 2) * 0.35;
        const outwardDistance = 0.8 + (Math.abs(leaflet - 2) * 0.1);
        
        const leafletAngle = clusterAngle + fanAngle;
        dummy.position.set(
          stemX + Math.cos(leafletAngle) * outwardDistance,
          clusterHeight + 0.2,
          stemZ + Math.sin(leafletAngle) * outwardDistance
        );
        
        const targetX = stemX + Math.cos(leafletAngle) * 3;
        const targetZ = stemZ + Math.sin(leafletAngle) * 3;
        dummy.lookAt(targetX, clusterHeight + 1.5, targetZ);
        
        dummy.rotateX(-Math.PI / 2);
        dummy.rotateX(0.2 + Math.random() * 0.1);
        dummy.rotateZ((Math.random() - 0.5) * 0.2);
        
        const sizeVariation = leaflet === 2 ? 1.1 : 0.9 + Math.random() * 0.2;
        dummy.scale.setScalar(sizeVariation);
        
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(leafletIndex, dummy.matrix);
        
        leafletIndex++;
      }
    }
    
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [speciesProfile]);

  // Update target color when moisture changes
  useEffect(() => {
    targetColorRef.current.set(healthColorHex);
  }, [healthColorHex]);

  // Animation loop
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Pulsing glow
    const pulseSpeed = THREE.MathUtils.lerp(0.5, 2.0, 1 - moistureScore);
    const pulseCycle = Math.sin(timeRef.current * pulseSpeed * Math.PI * 2) * 0.5 + 0.5;
    
    // Smooth color transition
    currentColorRef.current.lerp(targetColorRef.current, delta * 2);
    
    // Update trunk material
    if (trunkMaterialRef.current) {
      trunkMaterialRef.current.color.copy(currentColorRef.current);
      trunkMaterialRef.current.emissive.copy(currentColorRef.current);
      trunkMaterialRef.current.emissiveIntensity = 0.3 + pulseCycle * 0.2;
    }
    
    // Leaf droop when dry
    if (moistureScore < 0.5 && leavesRef.current) {
      const droopAmount = (0.5 - moistureScore) * 2;
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < 20; i++) {
        leavesRef.current.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.rotation.x += droopAmount * 0.2;
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group rotation={[0, 0, 0]} position={[0, -1.2, 0]}>
      {/* Plant pot */}
      <mesh geometry={potGeometry} position={[0, -1.1, 0]}>
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Trunk */}
      <mesh geometry={trunkGeometry}>
        <meshStandardMaterial 
          ref={trunkMaterialRef}
          color={healthColorHex}
          emissive={healthColorHex}
          emissiveIntensity={0.5}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Leaves - SIMPLE emissive glow */}
      <instancedMesh 
        ref={leavesRef}
        args={[leafletGeometry, null, 20]}
      >
        <meshStandardMaterial 
          color={healthColorHex}
          emissive={healthColorHex}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.1}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.95}
        />
      </instancedMesh>
    </group>
  );
}

export default ProceduralPlant;
