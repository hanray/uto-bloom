import * as THREE from 'three';
import leafDefinesGLSL from './common/leafDefines.glsl?raw';

/**
 * SDFLeafBase - Translucent base pass with SDF silhouette, frilled edges, wrap diffuse, transmittance
 * Blending: premultiplied alpha, transparent
 * Layers: drawn 2-3 times with slight offsets (uLayerId uniform)
 */
export function createSDFLeafBaseMaterial(options = {}) {
  const {
    healthColor = new THREE.Color(0x00ff00),
    moisture = 0.5,
    time = 0,
    layerId = 0,
    edgeSoftness = 0.04,
    frillAmp = 0.08,
    sigmaT = 2.5,
    blueNoiseTexture = null
  } = options;

  const material = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    color: healthColor,
    roughness: 0.4,
    metalness: 0.0,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0
  });

  // Store uniforms for external updates
  material.userData.uniforms = {
    uTime: { value: time },
    uMoisture: { value: moisture },
    uHealthColor: { value: healthColor },
    uLayerId: { value: layerId },
    uEdgeSoftness: { value: edgeSoftness },
    uFrillAmp: { value: frillAmp },
    uSigmaT: { value: sigmaT },
    uBlueNoise: { value: blueNoiseTexture }
  };

  // Inject SDF shader code via onBeforeCompile
  material.onBeforeCompile = (shader) => {
    // Add uniforms
    shader.uniforms = {
      ...shader.uniforms,
      ...material.userData.uniforms
    };

    // Prepend defines and utilities
    shader.fragmentShader = `
      ${leafDefinesGLSL}
      
      uniform float uTime;
      uniform float uMoisture;
      uniform vec3 uHealthColor;
      uniform int uLayerId;
      uniform float uEdgeSoftness;
      uniform float uFrillAmp;
      uniform float uSigmaT;
      uniform sampler2D uBlueNoise;
      
      ${shader.fragmentShader}
    `;

    // Replace main shader logic
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      
      // Compute leaf-space UV - use built-in vUv from Three.js
      #ifdef USE_UV
        vec2 leafUV = vUv * 2.0 - 1.0; // center at origin, -1..1
      #else
        // Fallback if no UVs (shouldn't happen with PlaneGeometry)
        vec2 leafUV = vec2(0.0);
      #endif
      
      // Apply layer offset (tiny normal/view warping)
      float layerOffset = float(uLayerId) * 0.005;
      vec3 viewDir = normalize(vViewPosition);
      leafUV += viewDir.xy * layerOffset;
      
      // Domain warp for frilled edges
      vec2 warpedUV = domainWarp(leafUV, uTime);
      
      // Compute SDF
      float sdf = sdLeaf(warpedUV);
      
      // DEBUG: Make alpha much more forgiving to see the shape
      float alpha = smoothstep(0.15, -0.05, sdf); // Wider range, shows more
      
      // Discard if fully transparent
      if (alpha < 0.01) discard;
      
      // Estimate thickness
      float thickness = estimateThickness(sdf, leafUV);
      
      // Wrap diffuse (fake subsurface)
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5)); // simple directional
      float NdotL = dot(vNormal, lightDir);
      float wrap = (NdotL + 0.65) / (1.0 + 0.65); // WRAP_FACTOR
      wrap = clamp(wrap, 0.0, 1.0);
      
      // Transmittance
      float T = exp(-uSigmaT * thickness);
      vec3 transmittedColor = uHealthColor * T;
      
      // Combine diffuse + transmittance
      vec3 finalColor = mix(diffuseColor.rgb, transmittedColor, 0.3) * wrap;
      
      // Add MUCH MORE base emissive glow so leaves are always visible and glowing
      finalColor += uHealthColor * 0.8; // Boosted from 0.3 to 0.8
      
      // Layer tint variation (subtle)
      float layerTint = 1.0 - float(uLayerId) * 0.05;
      finalColor *= layerTint;
      
      // Premultiplied alpha output with MORE opacity
      gl_FragColor = vec4(finalColor * alpha, alpha * 0.95); // Boosted from 0.8 to 0.95
      `
    );

    // Store compiled shader for debugging
    material.userData.shader = shader;
  };

  return material;
}

export default createSDFLeafBaseMaterial;
