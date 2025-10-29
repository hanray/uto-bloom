Plant Visualization — Revised Implementation Plan (Supersedes Photo Pipeline)
North Star (what we’re building)

Liquid-cloth neon leaves rendered with:

a translucent base SDF pass (soft rim, see-through body), and

an additive emissive pass (fresnel rim + anchored micro-sparkles),

plus gentle bloom and a back/side rim light.

Geometry stays procedural & instanced; realism comes from the material, not heavy topology.

Phase 1 — Shader Baseline (finish before anything else)

Goal: A single leaf looks gauzy and alive even with bloom off.

1A) Base translucency pass

Material: transparent:true, premultipliedAlpha:true, depthWrite:false, side: DoubleSide.

Fragment SDF in leaf-space (ellipse/heart) with domain warp near the rim for a frill.

Alpha from SDF: alpha = smoothstep(0.0, uEdgeSoftness, -sdf); with uEdgeSoftness ≈ 0.03–0.05.

Lighting: wrap diffuse (k≈0.65) + subtle transmittance tint toward uHealthColor.

Layers: draw 2 base sheets (desktop: 3) with tiny normal offsets ±0.003–0.007 and a different noise seed per layer.

1B) Emissive pass (additive)

Flags: AdditiveBlending, transparent:true, depthWrite:false.

Fresnel rim: (1−dot(N,V))^3.5 * rimGain, tinted by uHealthColor.

Sparkles: sample a tileable 256×256 blue-noise in leaf-space; threshold to points and advect slowly along a simple flow (midrib direction). Keep them point-like (no smears).

1C) Lighting & bloom

Lights: strong back/side DirectionalLight, soft front fill, low ambient.

Bloom (three’s UnrealBloomPass):
threshold: 0.88, strength: 0.85, radius: 0.40.
If it blows out, lower emissive, don’t crank bloom down first.

1D) Controls & QA (leva panel or simple UI)

Expose: edgeSoftness, frillAmp, sparkleDensity, bloomOn, uMoisture.

Tiering: HI(3 layers), MID(2), LOW(1; no vertex blue-noise).

Screens to capture: single leaf, 5-leaf overlap, moisture sweep 0.25→0.85.

✅ Phase-1 “done” gates (must pass all)

Soft rim + see-through center visible with bloom OFF.

Sparkles are anchored points (no streaking when camera moves).

5 leaves overlapping don’t nuke to white; depth still reads.

Moisture changes shift hue & sparkle density smoothly.

Status Recommendation: From your latest shots, bloom is doing too much. Do one pass to hit the four gates (especially rim visibility with bloom off), then proceed.

Phase 2 — Geometry Upgrade (no sculpting; still procedural)

Goal: The leaf reads as draped membrane, not a flat quad.

2A) Subdivided leaf ribbon

Build a small quad with UV in leaf-space (x∈[-1,1], y∈[0,1]), 32×8 segments.

Slight inner radius at the base to avoid self-intersection.

2B) Layered sheets

Duplicate per instance 2–3 layers (or pass uLayerId).

Tiny normal offset; distinct noise/tint per layer for parallax.

2C) “Liquid cloth” vertex motion

In vertex shader (numbers are deliberately small):

// membrane waves
float w1 = sin(uv.x*6.2831 + uTime*0.30) * 0.006 * (1.0-uv.y);
float w2 = sin(uv.y*12.566 + uTime*0.12) * 0.003;
transformed += normal * (w1 + w2);

// center twist
float twist = 0.10 * (1.0 - uv.y);              // radians near stem
mat3 R = mat3(
  cos(twist), -sin(twist), 0.0,
  sin(twist),  cos(twist), 0.0,
  0.0,         0.0,        1.0
);
transformed = R * transformed;

// midrib (subtle ridge)
float spine = 1.0 - pow(abs(uv.x), 3.0);
transformed += normal * (spine * 0.004);

2D) Vertex blue-noise displacement
float bn = texture(uBlueNoise, uv*4.0 + vec2(uTime*0.05, 0.0)).r;
transformed += normal * ((bn - 0.5) * 0.002); // subtle micro undulation

2E) Instancing & orientation

Keep leaves as instances; add per-instance uniforms: leafIndex, clusterIndex, phase, curlAmp.

Small random yaw/pitch plus a natural upward tilt so they’re not perfectly horizontal.

2F) Optional thin wireframe pass

Same mesh, wireframe:true, ultra-low alpha in additive → vein-like micro lattice under bloom.

✅ Phase-2 “done” gates

Clear parallax between layers when orbiting.

Rim frill no longer aliases at oblique angles.

Back/side light reveals a soft midrib.

Perf meets tier targets (HI/MID/LOW).

Phase 3 — Polish & Systemization

Stardust emitter along high-curvature/rim (tiny GPU particles).

Stem as translucent ribbon-tube with a faint inner swirl.

Species profiles (JSON): SDF aspect, frillAmp, curl amplitudes, layer count, sparkle density (so you can scale to 10–20 plants quickly).

Mobile fallback: 1 layer, no vertex blue-noise, reduced bloom.

What the agent should do right now

Phase-1 corrections (1 sprint):

Raise bloom threshold to 0.88, strength 0.85, radius 0.40.

Ensure the base pass has a visible alpha gradient with bloom OFF.

Convert sparkles to blue-noise thresholded points in leaf-space; slow advection; clamp size.

Reduce emissive rim by ~20% so bloom isn’t carrying the image.

Cut ambient further; keep rim/key from the back/side.

Gate check: attach screenshots proving the four Phase-1 gates.

If gates pass → start Phase-2A..2C: swap leaf plane to the 32×8 mesh and add the vertex motions above (curl, waves, spine). Keep instancing.

Minimal tech notes (keep current code structure)

Materials stay split: SDFLeafBase and SDFLeafEmissive (two draws).

Uniforms to expose:
uTime, uMoisture, uEdgeSoftness, uFrillAmp, uLayerId, uBlueNoise, uSparkleDensity.

Composer stays: single bloom pass with the params above.

Performance tiers: guesstimate leaves×layers → Desktop HI: 12×3, MID: 12×2, Mobile: 8×1.