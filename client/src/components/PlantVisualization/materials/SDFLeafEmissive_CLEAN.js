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
    sparkleTexture = null
  } = options;

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    color: healthColor
  });

  // Store uniforms for external updates
  material.userData.uniforms = {
    uTime: { value: 0 },
    uMoisture: { value: moisture },
    uHealthColor: { value: healthColor.clone() },
    uSparkleTexture: { value: sparkleTexture },
    uMaxGlow: { value: 1.1 } // Cap glow to prevent clipping
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

    // Add varyings to vertex shader (at the top)
    shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
      #include <project_vertex>
      vUv = uv;
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
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `
      vec4 diffuseColor = vec4( diffuse, opacity );
      
      vec2 leafUV = vUv * 2.0 - 1.0;
      
      // Same SDF shape as base
      float dist = length(leafUV / vec2(0.8, 1.0));
      float frill = sin(atan(leafUV.y, leafUV.x) * 8.0 + uTime * 0.5) * 0.1;
      dist += frill * smoothstep(0.7, 1.0, dist);
      float alpha = 1.0 - smoothstep(0.95, 1.05, dist);
      
      if (alpha < 0.01) discard;
      
      // Edge glow (simple radial gradient from center) - CAPPED
      float edgeGlow = smoothstep(0.6, 1.0, dist) * 2.0;
      edgeGlow = min(edgeGlow, uMaxGlow); // Cap to prevent clipping
      vec3 rimGlow = uHealthColor * edgeGlow;
      
      // === SPARKLE SYSTEM 1: Flowing sparkles (original) ===
      vec3 flowingSparkles = vec3(0.0);
      
      // Multi-layer sparkles with different speeds
      vec2 sparkleUV1 = vUv * 2.0 + vec2(uTime * 0.2, uTime * 0.1);
      vec2 sparkleUV2 = vUv * 2.8 - vec2(uTime * 0.15, uTime * 0.18);
      vec2 sparkleUV3 = vUv * 3.5 + vec2(uTime * 0.12, -uTime * 0.08);
      
      float sparkle1 = texture2D(uSparkleTexture, sparkleUV1).r;
      float sparkle2 = texture2D(uSparkleTexture, sparkleUV2).r;
      float sparkle3 = texture2D(uSparkleTexture, sparkleUV3).r;
      
      sparkle1 = step(0.70, sparkle1);
      sparkle2 = step(0.75, sparkle2);
      sparkle3 = step(0.80, sparkle3);
      
      float combinedFlowing = max(max(sparkle1, sparkle2), sparkle3 * 0.8);
      flowingSparkles = uHealthColor * combinedFlowing * 15.0;
      flowingSparkles *= 0.7 + sin(uTime * 4.0 + vUv.x * 15.0) * 0.3;
      
      // === SPARKLE SYSTEM 2: Anchored twinkling points ===
      vec3 anchoredSparkles = vec3(0.0);
      
      // Use leaf UV (anchored to geometry, not flowing)
      vec2 anchoredUV = vUv + vec2(0.04 * uTime, 0.0); // Very slow drift
      
      // Sample blue noise with tiling
      float noiseValue = texture2D(uSparkleTexture, anchoredUV * 4.0).r;
      
      // Low density threshold (0.04-0.08)
      float sparklePoint = step(0.94, noiseValue); // ~6% density
      
      // Twinkle effect (frame-based dither simulation with time)
      float twinkle = 0.5 + 0.5 * sin(uTime * 3.0 + noiseValue * 100.0);
      sparklePoint *= twinkle;
      
      // Per-sparkle alpha clamped to 0.6, premultiplied
      float sparkleAlpha = min(sparklePoint, 0.6);
      anchoredSparkles = uHealthColor * sparkleAlpha * 8.0;
      
      // Combine both sparkle systems + rim
      vec3 finalColor = rimGlow + flowingSparkles + anchoredSparkles;
      
      // Cap final glow
      finalColor = min(finalColor, vec3(uMaxGlow));
      
      // Additive blending (alpha used for intensity control)
      diffuseColor = vec4(finalColor, alpha * 0.5);
      `
    );

    material.userData.shader = shader;
  };

  return material;
}

export default createSDFLeafEmissiveMaterial;
