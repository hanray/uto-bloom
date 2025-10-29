import * as THREE from 'three';
import leafDefinesGLSL from './common/leafDefines.glsl?raw';

/**
 * SDFLeafEmissive - Rim/fresnel + blue-noise sparkles pass
 * Blending: additive
 * Single layer per leaf
 */
export function createSDFLeafEmissiveMaterial(options = {}) {
  const {
    healthColor = new THREE.Color(0x00ff00),
    moisture = 0.5,
    time = 0,
    sparkleSpeed = 0.5,
    sparkleDensity = 0.8,
    blueNoiseTexture = null
  } = options;

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    color: healthColor,
    // Force UV usage by adding a dummy map (will be overridden)
    map: new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
  });

  // Store uniforms for external updates
  material.userData.uniforms = {
    uTime: { value: time },
    uMoisture: { value: moisture },
    uHealthColor: { value: healthColor },
    uSparkleSpeed: { value: sparkleSpeed },
    uSparkleDensity: { value: sparkleDensity },
    uBlueNoise: { value: blueNoiseTexture }
  };

  // Inject shader code
  material.onBeforeCompile = (shader) => {
    // Add uniforms
    shader.uniforms = {
      ...shader.uniforms,
      ...material.userData.uniforms
    };

    // Prepend defines
    shader.fragmentShader = `
      ${leafDefinesGLSL}
      
      uniform float uTime;
      uniform float uMoisture;
      uniform vec3 uHealthColor;
      uniform float uSparkleSpeed;
      uniform float uSparkleDensity;
      uniform sampler2D uBlueNoise;
      
      varying vec3 vViewPosition;
      varying vec3 vWorldNormal;
      
      ${shader.fragmentShader}
    `;

    shader.vertexShader = `
      varying vec3 vViewPosition;
      varying vec3 vWorldNormal;
      
      ${shader.vertexShader}
    `;

    // Inject after mvPosition is computed (after project_vertex)
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
      #include <project_vertex>
      vViewPosition = -mvPosition.xyz;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      `
    );

    // Replace fragment main - use proper UV check
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `
      vec4 diffuseColor = vec4( diffuse, opacity );
      
      // Compute leaf-space UV - use built-in vUv from Three.js
      #ifdef USE_UV
        vec2 leafUV = vUv * 2.0 - 1.0;
      #else
        // Fallback if no UVs (shouldn't happen with PlaneGeometry)
        vec2 leafUV = vec2(0.0);
      #endif
      
      // SDF for masking
      float sdf = sdLeaf(leafUV);
      float alpha = smoothstep(0.15, -0.05, sdf); // Match base pass range
      if (alpha < 0.01) discard;
      
      // Fresnel/rim
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vWorldNormal);
      float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 4.0);
      
      // Rim contribution - MASSIVE BOOST for visibility
      vec3 rimColor = uHealthColor * fresnel * 2.0; // Boosted from 0.8 to 2.0
      
      // === Sparkles ===
      vec3 sparkleColor = vec3(0.0);
      
      // Sample sparkle texture (tiled)
      vec2 noiseUV = fract(leafUV * 3.0 + 0.5); // Increased tiling for more sparkles
      float noise = texture2D(uBlueNoise, noiseUV).r;
      
      // Animate phase - FASTER for more obvious animation
      float phase = fract(uTime * uSparkleSpeed * 0.3); // Tripled speed
      noise = fract(noise + phase);
      
      // Threshold to points - LOWER threshold for MORE sparkles
      float sparkle = step(0.85, noise) * uSparkleDensity; // Lowered from 0.92
      
      // Flow advection (drift along veins)
      vec2 flow = flowField(leafUV);
      float flowPhase = dot(flow, leafUV) * 0.5 + uTime * uSparkleSpeed * 0.1;
      sparkle *= (0.5 + 0.5 * sin(flowPhase * 6.28318));
      
      // Thickness modulation (more sparkles in thicker areas)
      float thickness = estimateThickness(sdf, leafUV);
      sparkle *= mix(0.5, 1.5, uMoisture) * smoothstep(0.0, 0.05, thickness); // Boosted range
      
      sparkleColor = uHealthColor * sparkle * 2.0; // Doubled sparkle brightness
      
      // Combine rim + sparkles
      vec3 emissive = rimColor + sparkleColor;
      
      diffuseColor = vec4(emissive, alpha);
      `
    );

    // Store compiled shader
    material.userData.shader = shader;
  };

  return material;
}

export default createSDFLeafEmissiveMaterial;
