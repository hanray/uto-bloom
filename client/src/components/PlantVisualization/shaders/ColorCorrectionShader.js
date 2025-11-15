// ColorCorrectionShader.js
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import * as THREE from 'three';

const ColorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null },
    lift: { value: 1.1 },
    bias: { value: new THREE.Vector3(0.25, 0.9, 0.45) },
    mixAmount: { value: 0.1 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float lift;
    uniform vec3 bias;
    uniform float mixAmount;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb = pow(color.rgb, vec3(lift));
      color.rgb = mix(color.rgb, bias, mixAmount);
      gl_FragColor = color;
    }
  `
};

export default ColorCorrectionShader;
