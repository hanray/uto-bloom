import * as THREE from 'three';

/**
 * createOrganicLeafGeometry - Monstera leaf with optional fenestrations and splits
 * @param {Object} options - Configuration parameters
 * @returns {THREE.BufferGeometry} - Leaf geometry with masks for holes/splits
 */
export function createOrganicLeafGeometry({
  width = 1.0,
  height = 1.0,
  segmentsX = 64,
  segmentsY = 24,
  ribCurvature = 0.12,
  archConcavity = 0.15,
  tipTwist = 0.20,
  thickness = 0.004,
  rimCurl = 0.08,
  // Feature flag (non-breaking)
  useCutMasks = false,
  // Fenestrations (interior holes)
  fenCount = 8,
  fenInner = 0.22,      // start along midrib (y)
  fenOuter = 0.78,      // end along midrib (y)
  fenSize = 0.12,       // normalized half-height
  fenAspect = 2.2,      // ellipse ratio
  fenBias = 0.35,       // push toward midrib
  // Edge splits (deep cuts)
  splitCount = 7,
  splitDepth = 0.35,    // how deep cuts run inward
  splitTaper = 0.6,     // thinner near tip
  // Maturity control (0.0 = juvenile, 1.0 = mature)
  maturity = 1.0,       // controls whether cuts appear
  seed = 12345
} = {}) {
  
  // Create base plane geometry
  const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
  
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  const count = positions.count;
  
  // Build masks for fenestrations and splits
  const fenMask = new Float32Array(count).fill(1.0);
  const splitMask = new Float32Array(count).fill(1.0);
  
  // Only compute masks if feature is enabled
  if (useCutMasks && maturity > 0.3) { // Only mature leaves get cuts
    
    // ========== BILATERAL SYMMETRY IMPLEMENTATION ==========
    // Define splits first - they create the "lobes" between which fenestrations sit
    
    const actualSplitCount = Math.ceil(splitCount * maturity);
    const splitsPerSide = actualSplitCount;
    const splits = [];
    
    // Generate splits with PERFECT bilateral symmetry
    for (let i = 0; i < splitsPerSide; i++) {
      // Distribute splits from 25% to 90% along midrib
      const t = i / (splitsPerSide - 1 || 1);
      const yPos = THREE.MathUtils.lerp(0.25, 0.90, t);
      
      // Deeper splits in middle (40-60% zone), shallower at base and tip
      const middleFactor = 1.0 - Math.abs(t - 0.5) * 2.0; // 0 at ends, 1 at middle
      const depthScale = 0.7 + middleFactor * 0.5; // 0.7-1.2 range
      
      // Width variation (3-8mm simulated)
      const widthScale = 0.8 + Math.random() * 0.4; // Some variation
      
      // Angle from midrib (35-50°, we'll use 42° average)
      const angleFromMidrib = 42 * (Math.PI / 180);
      
      // LEFT split (negative X)
      splits.push({ 
        y: yPos,
        side: -1, // left side
        depthScale: depthScale * maturity,
        widthScale: widthScale,
        angle: angleFromMidrib
      });
      
      // RIGHT split (positive X) - MIRRORED with ±5% tolerance
      const mirrorTolerance = 0.05;
      const yMirrorOffset = (Math.random() - 0.5) * mirrorTolerance;
      splits.push({ 
        y: yPos + yMirrorOffset, // slight asymmetry
        side: 1, // right side
        depthScale: depthScale * maturity * (0.95 + Math.random() * 0.1), // ±5% depth variation
        widthScale: widthScale * (0.95 + Math.random() * 0.1),
        angle: angleFromMidrib
      });
    }
    
    // ========== FENESTRATIONS (Internal Holes) ==========
    // Positioned in the "lobes" BETWEEN splits, never touching edges
    
    const actualFenCount = Math.floor(fenCount * Math.max(0, (maturity - 0.5) / 0.5));
    const holes = [];
    
    // Calculate lobe centers (between adjacent splits)
    const lobes = [];
    for (let i = 0; i < splitsPerSide - 1; i++) {
      const split1Y = splits[i * 2].y; // Left split
      const split2Y = splits[(i + 1) * 2].y; // Next left split
      const lobeCenterY = (split1Y + split2Y) / 2;
      lobes.push(lobeCenterY);
    }
    
    // Place 0-2 fenestrations per lobe zone with bilateral symmetry
    const holesPerLobe = Math.min(2, Math.ceil(actualFenCount / lobes.length));
    
    for (let lobeIdx = 0; lobeIdx < lobes.length; lobeIdx++) {
      const lobeCenterY = lobes[lobeIdx];
      
      // Only add holes to middle lobes (25-70% zone from midrib)
      if (lobeCenterY < 0.25 || lobeCenterY > 0.70) continue;
      
      for (let h = 0; h < holesPerLobe; h++) {
        // Position in lobe: 30-60% from midrib to edge
        const radiusFromCenter = THREE.MathUtils.lerp(0.30, 0.60, 0.45 + Math.random() * 0.2);
        
        // Offset beside the vein (not on it) - 15% offset
        const veinOffset = 0.15;
        const xPosFromMidrib = radiusFromCenter + veinOffset * (Math.random() - 0.5);
        
        // Angle: 42° from midrib (parallel to splits)
        const angle = 42 * (Math.PI / 180);
        
        // Size variation (larger in middle lobes, smaller near margins)
        const sizeScale = 0.8 + Math.random() * 0.4;
        
        // Elongation: 3:1 to 4:1 aspect ratio
        const aspectScale = 0.85 + Math.random() * 0.30; // 3.0 - 3.9x elongation
        
        // LEFT hole
        holes.push({ 
          y: lobeCenterY + (Math.random() - 0.5) * 0.05, // slight jitter
          x: -xPosFromMidrib,
          sizeScale: sizeScale,
          aspectScale: aspectScale,
          angle: angle
        });
        
        // RIGHT hole (MIRRORED with ±8% tolerance)
        const mirrorTolerance = 0.08;
        holes.push({ 
          y: lobeCenterY + (Math.random() - 0.5) * mirrorTolerance * 0.1,
          x: xPosFromMidrib * (0.92 + Math.random() * 0.16), // ±8% position variation
          sizeScale: sizeScale * (0.92 + Math.random() * 0.16), // ±8% size variation
          aspectScale: aspectScale,
          angle: angle
        });
      }
    }
    
    const vertex = new THREE.Vector3();
    
    // Apply masks
    for (let i = 0; i < count; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      const u = uvs.getX(i); // [0, 1]
      const v = uvs.getY(i); // [0, 1]
      const x = u * 2.0 - 1.0; // [-1, 1], midrib at 0
      const y = v; // [0, 1] base → tip
      
      // -------- Fenestrations (elongated holes BETWEEN splits) --------
      for (const h of holes) {
        // Elongated ellipse oriented at angle
        const dx = x - h.x;
        const dy = y - h.y;
        
        // Rotate by hole angle for proper orientation
        const cosA = Math.cos(h.angle);
        const sinA = Math.sin(h.angle);
        const rotDx = dx * cosA - dy * sinA;
        const rotDy = dx * sinA + dy * cosA;
        
        // Aspect ratio: 3.5:1 (length:width)
        const holeAspect = fenAspect * h.aspectScale;
        const distX = rotDx * holeAspect;
        const distY = rotDy;
        const d = Math.sqrt(distX * distX + distY * distY);
        
        // Size (larger holes in middle, smaller toward edges)
        const r = fenSize * h.sizeScale * (0.9 + 0.2 * y);
        
        // Soft edge for organic look (slightly irregular)
        const irregularity = 0.12;
        const softEdge = THREE.MathUtils.smoothstep(d, r * (0.8 + irregularity), r * (1.1 + irregularity));
        fenMask[i] *= softEdge;
        
        if (fenMask[i] < 0.1) {
          fenMask[i] = 0.0;
          break;
        }
      }
      
      // -------- Edge splits (cuts FROM margin TOWARD midrib) --------
      for (const s of splits) {
        const dy = Math.abs(y - s.y);
        
        // Width of split (3-8mm simulated, narrows as it extends inward)
        const baseBandWidth = 0.020 * s.widthScale;
        const bandWidth = baseBandWidth;
        const row = Math.exp(-(dy * dy) / (2.0 * bandWidth * bandWidth));
        
        if (row > 0.15) {
          // Depth: 40-60% toward center, exponential taper
          const baseDepth = splitDepth * s.depthScale;
          const taperExponent = 2.2;
          const reach = baseDepth * Math.pow(1.0 - y * 0.3, taperExponent);
          
          // Split starts at EDGE and cuts INWARD
          const cutXStart = 1.0; // Edge position
          const cutXEnd = 1.0 - reach; // Inner termination point
          
          const margin = Math.abs(x);
          
          // Only cut on the correct side
          if ((s.side < 0 && x < 0) || (s.side > 0 && x > 0)) {
            if (margin > cutXEnd && margin <= cutXStart) {
              // Smooth taper toward inner termination (rounded end)
              const cutProgress = (margin - cutXEnd) / (reach);
              const cutEdge = THREE.MathUtils.smoothstep(cutProgress, 0.0, 0.15) * row;
              splitMask[i] *= cutEdge;
              
              // Push outward slightly to open the gap
              const push = (margin - cutXEnd) * 0.012 * s.depthScale;
              vertex.x += Math.sign(x) * push;
              positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
              
              if (splitMask[i] < 0.1) {
                splitMask[i] = 0.0;
                break;
              }
            }
          }
        }
      }
    }
  }
  
  // Apply organic curvature to all vertices
  const vertex = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    const u = uvs.getX(i); // [0, 1]
    const v = uvs.getY(i); // [0, 1]
    const x = u * 2.0 - 1.0; // [-1, 1], midrib at 0
    const y = v; // [0, 1] base → tip
    
    // -------- Organic curvature --------
    // Midrib curvature (gentle arch along length)
    const ribBend = Math.sin(v * Math.PI) * ribCurvature;
    vertex.z += ribBend * (1.0 - Math.abs(x));
    
    // Concave arch (sides dip down)
    const arch = Math.pow(Math.abs(x), 2) * archConcavity;
    vertex.z -= arch * v;
    
    // Tip twist
    if (v > 0.7) {
      const twistAmount = (v - 0.7) / 0.3 * tipTwist;
      const cosT = Math.cos(twistAmount);
      const sinT = Math.sin(twistAmount);
      const rotX = vertex.x * cosT - vertex.z * sinT;
      const rotZ = vertex.x * sinT + vertex.z * cosT;
      vertex.x = rotX;
      vertex.z = rotZ;
    }
    
    // Rim curl (edges curl up)
    const edgeFactor = Math.pow(Math.abs(x), 3);
    vertex.z += edgeFactor * rimCurl * v;
    
    // Thickness (tiny bevel at edges)
    const edge = THREE.MathUtils.smoothstep(Math.abs(x), 0.85, 1.0);
    vertex.z += edge * 0.002;
    
    // Midrib ridge
    const spine = 1.0 - Math.pow(Math.abs(x), 3.0);
    vertex.z += spine * 0.0015;
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  // Always add mask attributes (dummy or real)
  geometry.setAttribute('aFenMask', new THREE.BufferAttribute(fenMask, 1));
  geometry.setAttribute('aSplitMask', new THREE.BufferAttribute(splitMask, 1));
  
  geometry.computeVertexNormals();
  
  return geometry;
}
