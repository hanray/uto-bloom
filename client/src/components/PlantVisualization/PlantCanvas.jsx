import { Canvas, useThree, extend, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import ProceduralPlant from './ProceduralPlant';
import { useSmoothMoisture } from '../../hooks/useSmoothMoisture';

// Extend with postprocessing
extend({ EffectComposer, RenderPass, UnrealBloomPass });

// Bloom effect component
function Effects() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setSize(size.width, size.height);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom settings locked to prevent clipping
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.75,  // strength: 0.65-0.85 range
      0.40,  // radius: 0.35-0.45 range
      0.91   // threshold: 0.90-0.92 range (higher = less bloom)
    );
    composer.addPass(bloomPass);
    
    composerRef.current = composer;
  }, [gl, scene, camera, size]);

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1);

  return null;
}

// Import species profiles
import pothosProfile from '../../data/species-profiles/common/pothos.json';

// Species map for easy lookup
const SPECIES_PROFILES = {
  'pothos': pothosProfile,
  // Add more as we create them
};

function PlantCanvas({ moisture, species = 'pothos' }) {
  // Smooth noisy sensor data
  const smoothedMoisture = useSmoothMoisture(moisture);

  // Get species profile, fallback to pothos
  const speciesProfile = SPECIES_PROFILES[species] || pothosProfile;
  
  return (
    <div style={{ width: '100%', height: '432px', background: '#000000', borderRadius: '12px' }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        frameloop="always"
        gl={{ 
          antialias: true, 
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9
        }}
        onCreated={({ gl }) => gl.setClearColor('#000000')}
      >
        <color attach="background" args={['#000000']} />

        {/* Dramatic lighting for contrast and depth */}
        {/* Low ambient for contrast */}
        <ambientLight intensity={0.15} color="#0a0a0f" />
        
        {/* Back/side key light for rim and depth */}
        <directionalLight 
          position={[-3, 2, -4]} 
          intensity={0.6} 
          color="#ffffff" 
        />
        
        {/* Soft fill from camera side */}
        <directionalLight 
          position={[2, 1, 3]} 
          intensity={0.15} 
          color="#8888aa" 
        />

        <Suspense fallback={null}>
          <ProceduralPlant moisture={smoothedMoisture} speciesProfile={speciesProfile} />
        </Suspense>

        {/* Bloom post-processing for glow effect */}
        <Effects />

        {/* Allow user to zoom/pan (no rotate to keep plant framing) */}
        <OrbitControls enableDamping={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}

export default PlantCanvas;
