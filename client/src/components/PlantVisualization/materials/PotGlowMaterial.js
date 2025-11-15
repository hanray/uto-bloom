import * as THREE from 'three';

export function createPotGlowMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.18, 0.8, 0.22), // soft green
    emissive: new THREE.Color(0.18, 0.8, 0.22),
    emissiveIntensity: 1.2,
    transmission: 0.85,
    thickness: 0.12,
    ior: 1.25,
    roughness: 0.25,
    metalness: 0.0,
    clearcoat: 0.0,
    transparent: true,
    opacity: 0.85
  });
}
