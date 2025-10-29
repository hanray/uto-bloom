import * as THREE from 'three';

/**
 * SDFLeafBase - Enhanced "Biolumen" translucent base pass
 * Blending: premultiplied alpha
 * Features: Transmission, iridescence, vein gloss, backlight amplification
 */
export function createSDFLeafBaseMaterial(options = {}) {
  const {
    healthColor = new THREE.Color(0x00ff00),
    moisture = 0.5,
    blueNoiseTexture = null,
    leafCount = 12,
    layers = 3,
    layerOffset = 0.0025,
    blueNoiseScale = 4.0,
    useCutMasks = false, // Feature flag
    // New biolumen parameters
    transmission = 0.45,
    thickness = 0.002,
    ior = 1.45,
    clearcoat = 0.35,
    clearcoatRoughness = 0.10,
    roughness = 0.15,
    uBacklight = 0.8,
    uVeinGloss = 0.85,
    uIridescence = 0.35,
    fresnelStrength = 0.75,
    fresnelPower = 2.5,
    edgeGlowColor = [0.6, 0.9, 0.7],
    backlightAmplification = 0.4,
    veinTransmissionBlock = 0.6,
    internalGlowColor = [0.4, 0.7, 0.4],
    gradientCenterColor = [0.2, 0.4, 0.2],
    gradientEdgeColor = [0.5, 0.8, 0.4],
    gradientStrength = 0.7
  } = options;

  const material = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 1.0,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    premultipliedAlpha: true,
    color: healthColor,
    roughness: roughness,
    metalness: 0.02,
    transmission: transmission,
    thickness: thickness,
    ior: ior,
    clearcoat: clearcoat,
    clearcoatRoughness: clearcoatRoughness
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
    uBlueNoise: { value: blueNoiseTexture },
    uBlueNoiseScale: { value: blueNoiseScale },
    uLeafCount: { value: leafCount },
    uLayers: { value: layers },
    uLayerOffset: { value: layerOffset },
    // Biolumen uniforms
    uBacklight: { value: uBacklight },
    uVeinGloss: { value: uVeinGloss },
    uIridescence: { value: uIridescence },
    uFresnelStrength: { value: fresnelStrength },
    uFresnelPower: { value: fresnelPower },
    uEdgeGlowColor: { value: new THREE.Vector3().fromArray(edgeGlowColor) },
    uBacklightAmp: { value: backlightAmplification },
    uVeinBlock: { value: veinTransmissionBlock },
    uInternalGlow: { value: new THREE.Vector3().fromArray(internalGlowColor) },
    uGradientCenter: { value: new THREE.Vector3().fromArray(gradientCenterColor) },
    uGradientEdge: { value: new THREE.Vector3().fromArray(gradientEdgeColor) },
    uGradientStrength: { value: gradientStrength }
  };

  // Inject simple SDF shader
  material.onBeforeCompile = (shader) => {
    // Add uniforms
    shader.uniforms = {
      ...shader.uniforms,
      ...material.userData.uniforms
    };

    // Add varyings to vertex shader (only vUv, vViewPosition already exists)
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec2 vUv;
      uniform float uTime;
      uniform sampler2D uBlueNoise;
      uniform float uBlueNoiseScale;
      uniform int uLeafCount;
      uniform int uLayers;
      uniform float uLayerOffset;
      
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
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vUv = uv;
      
      // Pass masks to fragment shader (conditional)
      #ifdef HAS_CUT_MASKS
        vFenMask = aFenMask;
        vSplitMask = aSplitMask;
      #endif
      
      // === PHASE 3: Simplified Micro-Motion (Macro-Shape in Geometry) ===
      
      // Use pre-computed instance attributes (cheaper than gl_InstanceID math)
      float leafIndex = aLeafIndex;
      float layerId = aLayerId;
      
      // Pseudo-random per-leaf values (deterministic from seed)
      float phase = aSeed * 6.28318; // 0-2π
      float curlAmp = 0.9 + aSeed * 0.4; // 0.9-1.3
      
      // Layer offset for parallax thickness
      vec3 layerDisplacement = normal * (layerId * uLayerOffset);
      
      // REDUCED membrane waves (micro-shimmer only, macro-curvature in geometry)
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
      
      // REDUCED spine push (micro-detail only)
      float spine = 1.0 - pow(abs(uv.x), 3.0);
      vec3 spineDisplacement = normal * (spine * 0.0008 * curlAmp);
      
      // REDUCED blue-noise micro-undulation (with mobile fallback)
      float bn = 0.5; // Default fallback
      #ifdef USE_MAP
        bn = texture2D(uBlueNoise, uv * uBlueNoiseScale + vec2(uTime * 0.05, 0.0)).r;
      #endif
      vec3 noiseDisplacement = normal * ((bn - 0.5) * 0.001);
      
      // Apply all deformations (macro-shape already in geometry)
      transformed = twistedPos + layerDisplacement + waveDisplacement + spineDisplacement + noiseDisplacement;
      `
    );

    // Add uniforms and varyings to fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uTime;
      uniform float uMoisture;
      uniform vec3 uHealthColor;
      varying vec2 vUv;
      
      // Biolumen uniforms
      uniform float uBacklight;
      uniform float uVeinGloss;
      uniform float uIridescence;
      uniform float uFresnelStrength;
      uniform float uFresnelPower;
      uniform vec3 uEdgeGlowColor;
      uniform float uBacklightAmp;
      uniform float uVeinBlock;
      uniform vec3 uInternalGlow;
      uniform vec3 uGradientCenter;
      uniform vec3 uGradientEdge;
      uniform float uGradientStrength;
      
      #ifdef HAS_CUT_MASKS
        varying float vFenMask;
        varying float vSplitMask;
      #endif
      `
    );

    // Enhanced bioluminescent shader with transmission, veins, and iridescence
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `
      vec4 diffuseColor = vec4( diffuse, opacity );
      
      // Discard if inside a hole or split (conditional)
      #ifdef HAS_CUT_MASKS
        if (vFenMask < 0.5 || vSplitMask < 0.5) discard;
      #endif
      
      // Convert UV to centered coordinates
      vec2 leafUV = vUv * 2.0 - 1.0;
      
      // Simple leaf shape (ellipse)
      float dist = length(leafUV / vec2(0.8, 1.0));
      
      // Frilled edges
      float frill = sin(atan(leafUV.y, leafUV.x) * 8.0 + uTime * 0.5) * 0.1;
      dist += frill * smoothstep(0.7, 1.0, dist);
      
      // SDF to alpha
      float alpha = 1.0 - smoothstep(0.95, 1.05, dist);
      if (alpha < 0.01) discard;
      
      // === PROCEDURAL VEINS (no textures) ===
      float mid = 1.0 - smoothstep(0.0, 0.12, abs(vUv.x - 0.5));
      float sec = smoothstep(0.0, 1.0, abs(sin(vUv.y * 14.0)) * pow(1.0 - abs(vUv.x - 0.5), 1.2));
      float veinMask = clamp(mid * 0.9 + sec * 0.35, 0.0, 1.0);
      
      // === BASE COLOR ===
      vec3 baseColor = uHealthColor * (0.7 + uMoisture * 0.3);
      
      // Vein darkening
      baseColor *= mix(1.0, 0.86, veinMask * 0.4);
      
      // === WRAPPED DIFFUSE (soft lighting) ===
      vec3 N = normalize(vNormal);
      vec3 V = normalize(-vViewPosition);
      vec3 L = normalize(vec3(1.0, 1.0, 1.0)); // Approximate light direction
      
      float wrap = 0.35;
      float ndl = dot(N, L);
      float diffuse = max((ndl + wrap) / (1.0 + wrap), 0.0);
      
      // === THIN-LEAF TRANSMISSION (backlight) ===
      float backlit = max(dot(-N, L), 0.0);
      backlit = pow(backlit, 0.8);
      
      // Thicker at midrib
      float leafThickness = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 1.8);
      
      // Vein shadow in transmission
      float veinShadow = 1.0 - (veinMask * uVeinBlock);
      
      // Transmission color (bright yellow-green)
      vec3 transCol = vec3(0.55, 0.95, 0.65);
      vec3 sss = transCol * backlit * leafThickness * uBacklight * veinShadow;
      
      // Internal glow when backlit
      vec3 internalGlow = uInternalGlow * backlit * 1.5;
      
      // === CENTER TO EDGE GRADIENT (when backlit) ===
      float distFromCenter = length(vec2(vUv.x - 0.5, 0.0)) * 2.0;
      vec3 gradientColor = mix(uGradientCenter, uGradientEdge, distFromCenter);
      baseColor = mix(baseColor, gradientColor, backlit * uGradientStrength);
      
      // === IRIDESCENT RIM (angle-dependent tint) ===
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), uFresnelPower);
      
      // Blue-to-gold iridescent ramp
      vec3 irRamp = mix(
        vec3(0.18, 0.65, 1.0),  // Cool blue
        vec3(1.0, 0.92, 0.45),  // Warm gold
        clamp(fresnel * 1.6, 0.0, 1.0)
      );
      vec3 iridescence = irRamp * fresnel * uIridescence;
      
      // === ENHANCED FRESNEL EDGE GLOW ===
      vec3 edgeGlow = mix(
        baseColor,
        uEdgeGlowColor,
        fresnel * uFresnelStrength
      );
      
      // === COMPOSE FINAL COLOR ===
      vec3 finalColor = baseColor * diffuse + sss + internalGlow + iridescence + edgeGlow * 0.3;
      
      // Premultiplied alpha output
      diffuseColor = vec4(finalColor * alpha, alpha);
      `
    );

    material.userData.shader = shader;
  };

  return material;
}

export default createSDFLeafBaseMaterial;
