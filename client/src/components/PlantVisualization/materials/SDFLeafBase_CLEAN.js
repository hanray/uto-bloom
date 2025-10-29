import * as THREE from 'three';

/**
 * SDFLeafBase - Clean translucent base pass
 * Blending: premultiplied alpha
 * Purpose: Main leaf body with frilled edges
 */
export function createSDFLeafBaseMaterial(options = {}) {
  const {
    healthColor = new THREE.Color(0x00ff00),
    moisture = 0.5
  } = options;

  const material = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 1.0,
    depthWrite: true, // Base pass handles depth
    depthTest: true,
    side: THREE.DoubleSide,
    // Premultiplied alpha blending
    premultipliedAlpha: true,
    color: healthColor,
    roughness: 0.5,
    metalness: 0.0
  });

  // Store uniforms for external updates
  material.userData.uniforms = {
    uTime: { value: 0 },
    uMoisture: { value: moisture },
    uHealthColor: { value: healthColor.clone() }
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
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vUv = uv;
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
      `
    );

    // Simple SDF leaf shape with frilled edges
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `
      vec4 diffuseColor = vec4( diffuse, opacity );
      
      // Convert UV to centered coordinates (-1 to 1)
      vec2 leafUV = vUv * 2.0 - 1.0;
      
      // Simple leaf shape (ellipse)
      float dist = length(leafUV / vec2(0.8, 1.0));
      
      // Frilled edges using noise
      float frill = sin(atan(leafUV.y, leafUV.x) * 8.0 + uTime * 0.5) * 0.1;
      dist += frill * smoothstep(0.7, 1.0, dist);
      
      // SDF to alpha
      float alpha = 1.0 - smoothstep(0.95, 1.05, dist);
      
      if (alpha < 0.01) discard;
      
      // Apply health color with slight translucency
      vec3 baseColor = uHealthColor * (0.7 + uMoisture * 0.3);
      
      // Add Fresnel rim for readability without bloom
      // Use MeshStandardMaterial's built-in vNormal and vViewPosition
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);
      float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.5);
      vec3 rimTint = mix(uHealthColor * 0.35, uHealthColor, 0.5);
      baseColor += rimTint * (0.15 * fres); // subtle rim highlight
      
      // Premultiplied alpha output
      diffuseColor = vec4(baseColor * alpha, alpha);
      `
    );

    material.userData.shader = shader;
  };

  return material;
}

export default createSDFLeafBaseMaterial;
