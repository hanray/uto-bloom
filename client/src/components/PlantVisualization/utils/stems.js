import * as THREE from 'three';

/**
 * Creates a bent stem with gentle S-curve
 * @returns {Object} { geometry, curve } - TubeGeometry and the CatmullRomCurve3
 */
export function createBentStem({
  height = 1.0,
  radius = 0.03,
  segments = 30,
  bendAmp = 0.08,
  bendFreq = 1.0
}) {
  // Build a centerline spline with a gentle S-bend in X
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * height;
    const x = Math.sin(t * Math.PI * bendFreq) * bendAmp;
    const z = 0;
    pts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
  
  // Tube around spline = stem
  const tubularSegs = Math.max(segments * 3, 24);
  const geo = new THREE.TubeGeometry(curve, tubularSegs, radius, 12, false);
  
  return { geometry: geo, curve };
}

/**
 * Creates a curved petiole (leaf stalk) from node to leaf
 * @returns {Object} { geometry, endPoint, tangent } - Where the leaf should attach
 */
export function createPetioleTube({
  start,
  dir,                 // outward from stem (normalized)
  up = new THREE.Vector3(0, 1, 0),
  length = 0.45,
  baseRadius = 0.008,
  tipRadius = 0.004,
  curve = 0.35         // 0..1 curvature toward gravity
}) {
  // 3-point curve: node → mid (bent) → tip
  const p0 = start.clone();
  const p2 = start.clone().addScaledVector(dir, length);

  // Bend mid downward a little and forward along the petiole
  const gravity = new THREE.Vector3(0, -1, 0);
  const lateral = dir.clone().cross(up).normalize(); // sideways
  const bend = gravity.multiplyScalar(length * curve * 0.35)
                .add(lateral.multiplyScalar(length * curve * 0.12));

  const p1 = start.clone()
    .addScaledVector(dir, length * 0.55)
    .add(bend);

  const curve3 = new THREE.CatmullRomCurve3([p0, p1, p2], false);
  const tubularSegs = 24;
  
  // Simple constant radius for MVP (can add taper later)
  const geo = new THREE.TubeGeometry(curve3, tubularSegs, baseRadius, 8, false);
  
  return { 
    geometry: geo, 
    endPoint: p2, 
    tangent: curve3.getTangent(0.98) 
  };
}

/**
 * Creates simple stem and petiole materials
 */
export function createStemMaterial({ color, emissive, emissiveIntensity }) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    roughness: 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
}

export function createPetioleMaterial({ color, emissive, emissiveIntensity }) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    roughness: 0.45,
    metalness: 0.08,
    side: THREE.DoubleSide
  });
}
