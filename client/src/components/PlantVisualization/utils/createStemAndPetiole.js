import * as THREE from 'three';

/**
 * Create a tapered central stem
 * @param {Object} stemSpec - Stem configuration from species profile
 * @returns {THREE.Mesh} - Stem mesh with green material
 */
export function createCentralStem(stemSpec) {
  const {
    height = 0.55,
    radiusBase = 0.028,
    radiusTop = 0.016,
    radialSegs = 10,
    color = [0.23, 0.40, 0.25]
  } = stemSpec;

  // Create tapered cylinder (top, bottom, height, radialSegs)
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBase,
    height,
    radialSegs,
    1 // height segments
  );

  // Position so base is at origin, extends upward
  geometry.translate(0, height / 2, 0);

  // Pulsing green material (subtle emissive)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().fromArray(color),
    roughness: 0.8,
    metalness: 0.0,
    emissive: new THREE.Color().fromArray(color),
    emissiveIntensity: 0.0 // Will be animated
  });
  
  // Store userData for animation
  material.userData = {
    baseColor: new THREE.Color().fromArray(color),
    pulsePhase: 0
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

/**
 * Create a cubic bezier curve from stem attachment to leaf position
 * @param {THREE.Vector3} p0 - Attachment point on stem
 * @param {THREE.Vector3} pLeaf - Leaf base position
 * @param {Object} spec - Petiole configuration
 * @returns {THREE.CubicBezierCurve3} - Curved path for petiole
 */
export function createPetioleCurve(p0, pLeaf, spec) {
  const {
    curveOut = 0.10,
    curveUp = 0.12
  } = spec;

  // Direction from stem to leaf
  const direction = new THREE.Vector3().subVectors(pLeaf, p0).normalize();

  // First control point: curve out and up from stem
  const c1 = new THREE.Vector3()
    .copy(p0)
    .addScaledVector(direction, curveOut)
    .add(new THREE.Vector3(0, curveUp, 0));

  // Second control point: interpolate toward leaf
  const c2 = new THREE.Vector3().lerpVectors(c1, pLeaf, 0.6);

  // Create cubic bezier curve
  return new THREE.CubicBezierCurve3(p0, c1, c2, pLeaf);
}

/**
 * Create a tapered tube mesh along a curve
 * @param {THREE.Curve} curve - Curve path for the petiole
 * @param {Object} spec - Petiole configuration
 * @returns {THREE.Mesh} - Petiole mesh with green material
 */
export function createPetioleMesh(curve, spec) {
  const {
    radiusBase = 0.010,
    radiusTip = 0.006,
    radialSegs = 8,
    tubeSegs = 24,
    twistDeg = 8,
    color = [0.23, 0.40, 0.25]
  } = spec;

  // Taper function using smoothstep for natural transition
  const radiusFunction = (t) => {
    const smoothT = smoothstep(0.0, 1.0, t);
    return THREE.MathUtils.lerp(radiusBase, radiusTip, smoothT);
  };

  // Create tube geometry along curve
  const geometry = new THREE.TubeGeometry(
    curve,
    tubeSegs,
    radiusBase, // will be modified by radius function
    radialSegs,
    false // not closed
  );

  // Apply tapering by modifying vertex positions
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    // Determine which tube segment this vertex belongs to
    const segmentIndex = Math.floor(i / (radialSegs + 1));
    const t = segmentIndex / tubeSegs;
    
    // Calculate radius at this point
    const radius = radiusFunction(t);
    
    // Get distance from tube center (in XZ plane relative to curve)
    const centerPoint = curve.getPointAt(t);
    const distFromCenter = Math.sqrt(
      Math.pow(vertex.x - centerPoint.x, 2) +
      Math.pow(vertex.z - centerPoint.z, 2)
    );
    
    // Scale vertex position to match desired radius
    if (distFromCenter > 0.0001) {
      const scale = radius / radiusBase;
      vertex.x = centerPoint.x + (vertex.x - centerPoint.x) * scale;
      vertex.z = centerPoint.z + (vertex.z - centerPoint.z) * scale;
    }
    
    // Apply subtle twist along length
    const twistAngle = (t * twistDeg * Math.PI / 180);
    const cos = Math.cos(twistAngle);
    const sin = Math.sin(twistAngle);
    const dx = vertex.x - centerPoint.x;
    const dz = vertex.z - centerPoint.z;
    vertex.x = centerPoint.x + dx * cos - dz * sin;
    vertex.z = centerPoint.z + dx * sin + dz * cos;
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  // Pulsing green material (subtle emissive)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().fromArray(color),
    roughness: 0.8,
    metalness: 0.0,
    emissive: new THREE.Color().fromArray(color),
    emissiveIntensity: 0.0 // Will be animated
  });
  
  // Store userData for animation
  material.userData = {
    baseColor: new THREE.Color().fromArray(color),
    pulsePhase: Math.random() * Math.PI * 2 // Random phase offset
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

/**
 * Smoothstep interpolation function
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Value to interpolate
 * @returns {number} - Smoothly interpolated value
 */
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
