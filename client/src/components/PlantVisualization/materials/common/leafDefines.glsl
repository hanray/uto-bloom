// leafDefines.glsl - Shared constants and utilities for SDF liquid-cloth leaves
// Used by both base (translucent) and emissive passes

// SDF parameters
#define SDF_ASPECT 2.5          // Leaf aspect ratio (length/width)
#define SDF_STEPS 16            // Raymarch steps (HI tier)
#define EDGE_SOFTNESS 0.04      // Soft edge width
#define FRILL_AMPLITUDE 0.08    // Domain warp amplitude for ruffled edges
#define FRILL_FREQUENCY 8.0     // Ripple frequency

// Translucency
#define SIGMA_T 2.5             // Absorption coefficient
#define WRAP_FACTOR 0.65        // Wrap diffuse factor (fake SSS)

// Emissive/sparkle
#define FRESNEL_POWER 4.0       // Rim light falloff
#define SPARKLE_THRESHOLD 0.92  // Blue-noise cutoff
#define SPARKLE_SIZE 0.015      // Point size
#define MIDRIB_DIRECTION vec2(0.0, 1.0) // Centerline for flow

// Uniforms (declared in materials, documented here)
// uniform float uTime;
// uniform float uMoisture;         // 0..1 normalized
// uniform vec3 uHealthColor;       // RGB color from moisture mapping
// uniform float uEdgeSoftness;     // Override default
// uniform float uFrillAmp;
// uniform float uSigmaT;
// uniform float uSparkleSpeed;
// uniform float uSparkleDensity;
// uniform int uLayerId;            // 0, 1, 2 for layering
// uniform sampler2D uBlueNoise;    // Tiled 256x256

// === SDF primitives ===

// Oblong/heart-shaped leaf SDF (2D in leaf-space)
float sdLeaf(vec2 p) {
  // Elongated ellipse with a heart-like pinch at base
  float aspect = SDF_ASPECT;
  vec2 q = p;
  
  // Heart shape: two circles + cone bottom
  q.y = q.y + 0.3; // shift down slightly
  float r1 = length(q - vec2(0.3, 0.0)) - 0.4;
  float r2 = length(q - vec2(-0.3, 0.0)) - 0.4;
  float cone = (q.y * 1.5) + abs(q.x) - 0.8;
  
  float d = min(min(r1, r2), cone);
  
  // Stretch vertically for aspect ratio
  d *= (1.0 / aspect);
  
  return d;
}

// Domain warp for frilled edges
vec2 domainWarp(vec2 p, float time) {
  // Simple value noise approximation (cheap)
  float n = sin(p.x * FRILL_FREQUENCY + time * 0.3) * cos(p.y * FRILL_FREQUENCY * 0.7);
  return p + n * FRILL_AMPLITUDE * vec2(cos(p.y * 3.0), sin(p.x * 3.0));
}

// === Noise utilities ===

// Simple 2D value noise (cheap approximation)
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // smoothstep
  
  float a = sin(dot(i, vec2(127.1, 311.7)));
  float b = sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7)));
  float c = sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7)));
  float d = sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7)));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Flow field along midrib (simple gradient toward centerline)
vec2 flowField(vec2 p) {
  // Distance to centerline (x=0)
  float distToCenterline = abs(p.x);
  // Flow upward along Y, with slight convergence toward center
  return normalize(vec2(-sign(p.x) * 0.2, 1.0));
}

// === Thickness estimation ===

// Estimate thickness from SDF (thicker near center, thin at edges)
float estimateThickness(float sdf, vec2 p) {
  // Normalize by leaf size
  float centerDist = length(p) / SDF_ASPECT;
  float thick = smoothstep(0.5, 0.0, centerDist) * 0.1; // max 0.1 units at center
  return thick * smoothstep(0.1, -0.05, sdf); // fade near edge
}
