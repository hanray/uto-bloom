import { Canvas, useThree, extend, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { Sky } from 'three/examples/jsm/objects/Sky';
import ProceduralPlant from './ProceduralPlant';
import { useSmoothMoisture } from '../../hooks/useSmoothMoisture';

// Extend with postprocessing and Sky
extend({ EffectComposer, RenderPass, UnrealBloomPass, SSAOPass, Sky });

// Bloom + SSAO effect component
function Effects() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setSize(size.width, size.height);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // SSAO for subtle ambient occlusion (very light, contact shadows only)
    const ssaoPass = new SSAOPass(scene, camera, size.width, size.height);
    ssaoPass.kernelRadius = 2; // Very small radius
    ssaoPass.minDistance = 0.01; // Minimum depth difference
    ssaoPass.maxDistance = 0.015; // Very tight range (reduced)
    ssaoPass.output = SSAOPass.OUTPUT.Default;
    
    // Dramatically reduce AO intensity
    // Access the SSAO shader uniforms after creation
    composer.addPass(ssaoPass);
    
    // Set low intensity for SSAO to prevent darkening
    setTimeout(() => {
      if (ssaoPass.ssaoMaterial) {
        ssaoPass.ssaoMaterial.uniforms['aoIntensity'] = { value: 0.15 }; // Very subtle
      }
    }, 0);
    
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

// Sky component with realistic sun
function SkyWithSun() {
  const { scene } = useThree();
  const skyRef = useRef();
  const sunRef = useRef(new THREE.Vector3());
  const timeRef = useRef(0);

  useEffect(() => {
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);
    skyRef.current = sky;

    const skyUniforms = sky.material.uniforms;
    
    // Sky shader parameters - much darker, subtle background
    skyUniforms['turbidity'].value = 30; // Heavy atmospheric haze (very dark)
    skyUniforms['rayleigh'].value = 0.5; // Minimal scattering (darker sky)
    skyUniforms['mieCoefficient'].value = 0.015; // More haze
    skyUniforms['mieDirectionalG'].value = 0.5; // Minimal sun glow

    return () => {
      scene.remove(sky);
      sky.geometry.dispose();
      sky.material.dispose();
    };
  }, [scene]);

  // Animate sun position
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (skyRef.current) {
      const skyUniforms = skyRef.current.material.uniforms;
      
      // Slowly rotating sun (completes full rotation in ~120 seconds)
      const rotationSpeed = 0.005;
      const theta = timeRef.current * rotationSpeed + THREE.MathUtils.degToRad(160);
      
      // Sun position - low on horizon, slowly rotating
      const phi = THREE.MathUtils.degToRad(90 - 1.5); // Very low elevation (1.5° - barely above horizon)
      
      sunRef.current.setFromSphericalCoords(1, phi, theta);
      skyUniforms['sunPosition'].value.copy(sunRef.current);
    }
  });

  return null;
}

// Import species profiles
import monsteraProfile from '../../data/species-profiles/common/monstera-deliciosa.json';
import genericPlantProfile from '../../data/species-profiles/common/genericPlant.json';

// Species map for easy lookup
const SPECIES_PROFILES = {
  'monstera': monsteraProfile,
  'monstera-deliciosa': monsteraProfile,
  'generic-plant': genericPlantProfile,
  'pothos': genericPlantProfile, // Legacy fallback
};

function PlantCanvas({ moisture, species = 'monstera' }) {
  // Smooth noisy sensor data
  const smoothedMoisture = useSmoothMoisture(moisture);

  // Get species profile, fallback to generic
  const speciesProfile = SPECIES_PROFILES[species] || genericPlantProfile;
  
  return (
    <div style={{ width: '100%', height: '432px', background: '#000000', borderRadius: '12px' }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        frameloop="always"
        gl={{ 
          antialias: true, 
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.4
        }}
      >
        {/* Procedural sky with realistic sun */}
        <SkyWithSun />

        {/* Ambient base from sky */}
        <ambientLight intensity={0.35} color="#9098a8" />
        
        {/* Main sun light matching sky position (backlit, subtle) */}
        <directionalLight 
          position={[-3, 2, -4]} 
          intensity={0.5} 
          color="#ffeedd"
          castShadow={false}
        />
        
        {/* Front fill for visibility */}
        <directionalLight 
          position={[2, 3, 4]} 
          intensity={0.6} 
          color="#b0c0d0" 
        />

        <Suspense fallback={null}>
          <ProceduralPlant moisture={smoothedMoisture} speciesProfile={speciesProfile} />
        </Suspense>

        {/* Bloom + SSAO post-processing for depth */}
        <Effects />

        {/* Allow user to zoom/pan (no rotate to keep plant framing) */}
        <OrbitControls enableDamping={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}

export default PlantCanvas;
