import * as THREE from 'three';

/**
 * SDFLeafEmissive - Rim glow + sparkles pass
 * Blending: additive
 * Purpose: Bright glowing edges and twinkling sparkles
 */
export function createSDFLeafEmissiveMaterial(options = {}) {
  const {
    healthColor = new THREE.Color(0x00ff00),
    moisture = 0.5,
    sparkleTexture = null,
    leafCount = 12,
    layers = 3,
    layerOffset = 0.0025,
    blueNoiseScale = 4.0,
    useCutMasks = false // Feature flag
  } = options;

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    premultipliedAlpha: true,
    color: healthColor
  });
  
  // Set shader defines (conditional compilation)
  material.defines = material.defines || {};
  if (useCutMasks) {
    material.defines.HAS_CUT_MASKS = 1;
  }

  // Store uniforms for external updates
  material.userData.uniforms = {
    uTime: { value: 0 },
    uMoisture: { value: moisture },
    uHealthColor: { value: healthColor.clone() },
    uSparkleTexture: { value: sparkleTexture },
    uMaxGlow: { value: 1.3 }, // Cap glow: 1.2-1.4 range to prevent clipping
    uLeafCount: { value: leafCount },
    uLayers: { value: layers },
    uLayerOffset: { value: layerOffset },
    uBlueNoiseScale: { value: blueNoiseScale }
  };

  // Inject emissive shader
  material.onBeforeCompile = (shader) => {
    console.log('🌟 SDFLeafEmissive shader compiling...');
    
    shader.uniforms = {
      ...shader.uniforms,
      ...material.userData.uniforms
    };
    
    console.log('   uSparkleTexture:', shader.uniforms.uSparkleTexture.value);
    console.log('   uHealthColor:', shader.uniforms.uHealthColor.value);

    // Add varyings and uniforms to vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
      varying vec2 vUv;
      uniform float uTime;
      uniform sampler2D uSparkleTexture;
      uniform int uLeafCount;
      uniform int uLayers;
      uniform float uLayerOffset;
      uniform float uBlueNoiseScale;
      
      // Instance attributes (cheaper than deriving from gl_InstanceID)
      attribute float aLeafIndex;
      attribute float aLayerId;
      attribute float aSeed;
      
      // Fenestration and split masks (conditional)
      #ifdef HAS_CUT_MASKS
        attribute float aFenMask;
        attribute float aSplitMask;
        varying float vFenMask;
        varying float vSplitMask;
      #endif
      
      void main() {
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
      #include <project_vertex>
      vUv = uv;
      
      // Pass masks to fragment shader (conditional)
      #ifdef HAS_CUT_MASKS
        vFenMask = aFenMask;
        vSplitMask = aSplitMask;
      #endif
      
      // === PHASE 3: Simplified Micro-Motion (Match Base Material) ===
      
      // Use pre-computed instance attributes
      float leafIndex = aLeafIndex;
      float layerId = aLayerId;
      
      // Pseudo-random per-leaf values
      float phase = aSeed * 6.28318;
      float curlAmp = 0.9 + aSeed * 0.4;
      
      // Add per-layer phase offset for variety
      phase += 0.8 * layerId;
      
      // Layer offset for parallax thickness
      vec3 layerDisplacement = normal * (layerId * uLayerOffset);
      
      // REDUCED membrane waves (micro-shimmer only)
      float w1 = sin(uv.x * 6.2831 + uTime * 0.30 + phase) * 0.001 * (1.0 - uv.y);
      float w2 = sin(uv.y * 12.566 + uTime * 0.12 + phase * 0.5) * 0.0005;
      vec3 waveDisplacement = normal * (curlAmp * (w1 + w2));
      
      // Gentle twist (keep for micro-rotation)
      float twist = (0.10 * (1.0 - uv.y)) * curlAmp;
      float cosT = cos(twist);
      float sinT = sin(twist);
      mat3 R = mat3(
        cosT, -sinT, 0.0,
        sinT,  cosT, 0.0,
        0.0,   0.0,  1.0
      );
      vec3 twistedPos = R * transformed;
      
      // REDUCED spine push
      float spine = 1.0 - pow(abs(uv.x), 3.0);
      vec3 spineDisplacement = normal * (spine * 0.0008 * curlAmp);
      
      // REDUCED blue-noise micro-undulation
      float bn = 0.5;
      #ifdef USE_MAP
        bn = texture2D(uSparkleTexture, uv * uBlueNoiseScale + vec2(uTime * 0.05, 0.0)).r;
      #endif
      vec3 noiseDisplacement = normal * ((bn - 0.5) * 0.001);
      
      // Apply all deformations (macro-shape already in geometry)
      transformed = twistedPos + layerDisplacement + waveDisplacement + spineDisplacement + noiseDisplacement;
      `
    );

    // Add uniforms and varyings to fragment shader (at the top)
    shader.fragmentShader = `
      uniform float uTime;
      uniform float uMoisture;
      uniform vec3 uHealthColor;
      uniform sampler2D uSparkleTexture;
      uniform float uMaxGlow;
      varying vec2 vUv;
      
      #ifdef HAS_CUT_MASKS
        varying float vFenMask;
        varying float vSplitMask;
      #endif
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `
      vec4 diffuseColor = vec4( diffuse, opacity );
      
      // Discard if inside a hole or split (conditional)
      #ifdef HAS_CUT_MASKS
        if (vFenMask < 0.5 || vSplitMask < 0.5) discard;
      #endif
      
      vec2 leafUV = vUv * 2.0 - 1.0;
      
      // Same SDF shape as base
      float dist = length(leafUV / vec2(0.8, 1.0));
      float frill = sin(atan(leafUV.y, leafUV.x) * 8.0 + uTime * 0.5) * 0.1;
      dist += frill * smoothstep(0.7, 1.0, dist);
      float alpha = 1.0 - smoothstep(0.95, 1.05, dist);
      
      if (alpha < 0.01) discard;
      
      // === MICRO-SPARKLES (blue-white-gold temporal twinkle) ===
      
      // Tiny rim (very subtle)
      vec3 N = normalize(vNormal);
      vec3 V = normalize(-vViewPosition);
      float rim = pow(1.0 - dot(N, V), 3.5);
      vec3 rimCol = vec3(0.15, 0.8, 0.5) * 0.06 * rim;
      
      // Blue-white-gold micro-sparkles in UV space
      float n = fract(sin(dot(vUv, vec2(127.1, 311.7))) * 43758.5453); // hash
      float t = fract(n + uTime * 0.35);
      float spark = smoothstep(0.98, 1.0, t); // rare bright pops
      
      // Color mix: cool blue to warm gold
      vec3 sparkCol = mix(vec3(0.2, 0.6, 1.0), vec3(1.0, 0.9, 0.5), n);
      sparkCol *= 0.25; // subtle per-fragment add
      
      // Combine
      vec3 emissive = rimCol + spark * sparkCol;
      
      // Clamp to prevent bloom blowout
      float totalGlow = length(emissive);
      if (totalGlow > uMaxGlow) {
        emissive = normalize(emissive) * uMaxGlow;
      }
      
      // Additive blending output
      diffuseColor = vec4(emissive, alpha * 0.7);
      `
    );

    material.userData.shader = shader;
  };

  return material;
}

export default createSDFLeafEmissiveMaterial;
