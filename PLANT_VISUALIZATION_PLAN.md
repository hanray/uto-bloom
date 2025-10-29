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

✅ Phase-1 "done" gates (must pass all)

Soft rim + see-through center visible with bloom OFF.

Sparkles are anchored points (no streaking when camera moves).

5 leaves overlapping don't nuke to white; depth still reads.

Moisture changes shift hue & sparkle density smoothly.

**STATUS: ✅ COMPLETE** - All gates passed, dark triangles fixed, sparkle blowout clamped.

---

Phase 2 — Geometry Upgrade (subdivided mesh + vertex deformation)

**STATUS: ✅ COMPLETE** - Monstera species with subdivided 48×12 geometry, golden spiral layout, membrane waves, twist, spine, and blue-noise displacement working.

Goal: The leaf reads as draped membrane, not a flat quad.

2A) Subdivided leaf ribbon

Built 48×12 mesh (Monstera) / 32×8 (generic) with UV in leaf-space (x∈[-1,1], y∈[0,1]).

2B) Layered sheets

3 layers per leaf instance, computed via `gl_InstanceID` deterministically.

Tiny normal offset per layer (0.0025) for parallax.

2C) "Liquid cloth" vertex motion

Membrane waves, center twist, midrib ridge, blue-noise micro-undulation in vertex shader.

2D) Instancing & orientation

9 leaves × 3 layers = 27 instances for Monstera.

Golden spiral layout: `angle = leafIndex × 135°`.

Per-instance phase and curlAmp computed via hash functions.

2E) Species JSON system

Created `monstera-deliciosa.json` (primary) and `genericPlant.json` (fallback).

Data-driven: leaf count, segments, size, spiral angle, layers all from JSON.

**Files Modified:**
- `ProceduralPlant.jsx` - Instance system, spiral layout, subdivided geometry
- `SDFLeafBase_CLEAN.js` - Vertex deformation injection
- `SDFLeafEmissive_CLEAN.js` - Matching vertex deformation
- `PlantCanvas.jsx` - Species loader
- `monstera-deliciosa.json` - Full species spec
- `genericPlant.json` - Renamed from pothos.json

---

Phase 3 — Procedural Organic Geometry (MVP)

**STATUS: 🔄 PENDING APPROVAL**

Goal: Keep recipe → factory → shader flow intact, but upgrade geometry so each leaf has true curvature, vein definition, and natural spread — all generated procedurally.

3A) JSON / Recipe Updates (monstera-deliciosa.json)

Extend schema (non-breaking):

```json
"leaf": {
  "segmentsXY": [48, 12],
  "sizeXY": [0.65, 0.9],
  "ribCurvature": 0.12,
  "archConcavity": 0.1,
  "tipTwist": 0.05,
  "holeDensity": 0.5,
  "holeRadiusRange": [0.04, 0.08],
  "depth": 0.004
},
"stem": {
  "radius": 0.015,
  "height": 0.12
},
"layout": {
  "leafCount": 9,
  "spiralAngleDeg": 135,
  "radius": 0.9,
  "elevationStep": 0.08,
  "layers": 3
}
```

3B) Geometry Builder – createOrganicLeafGeometry()

CPU-side replacement for createLeafRibbon():

- Arched midrib curve
- Concave cross-section scoop
- Tip twist
- Optional double-sided with thickness
- Outputs single reusable geometry with 3D curvature

3C) Fenestrations (Monstera holes) - MVP Shader Approach

Fragment shader mask first:
```glsl
float holePattern = sin(uv.x*12.0) * cos(uv.y*8.0);
if (holePattern > 0.85 && uv.y > 0.2) discard;
```

Real geometry deletion deferred to later optimization.

3D) Instance Layout (tuned constants)

Add natural spread variation:
```js
const r = species.layout.radius * (0.8 + 0.05 * Math.sin(leafIndex));
rotation.x = THREE.MathUtils.degToRad(5 + Math.random()*10);
rotation.z = THREE.MathUtils.degToRad(Math.sin(angle)*4);
```

3E) Stem Attachment (lightweight)

Tiny cylinder per instance or separate instanced stem mesh.

3F) Shader Simplification

Now that macro-shape is in geometry:
- Keep only micro-motion (waves < 0.002)
- Remove heavy sin-bend terms
- Keep sparkle / blue-noise modulation

3G) Performance Guardrails

- 48×12 × 9 × 3 ≈ 15k verts (trivial)
- Still one InstancedMesh per pass
- No extra draw calls
- Bloom, sparkles, color logic untouched

---

Phase 4 — Polish & Systemization

Stardust emitter along high-curvature/rim (tiny GPU particles).

Stem as translucent ribbon-tube with a faint inner swirl.

Species profiles (JSON): SDF aspect, frillAmp, curl amplitudes, layer count, sparkle density (so you can scale to 10–20 plants quickly).

Mobile fallback: 1 layer, no vertex blue-noise, reduced bloom.

---

Objective

Make each leaf read like a draped, translucent membrane (not a flat plate) using a subdivided ribbon, multi-sheet layering, micro-waves, and blue-noise displacement—without sculpting. Drive layout and styling from a species JSON so we can later swap to a Monstera profile.

1) Data model (species JSON) — minimal schema for Phase 2

Don’t author Monstera yet; use this to create genericPlant.json.

{
  "id": "generic-plant",
  "leaf": {
    "count": 12,
    "clusters": 3,
    "segmentsXY": [32, 8],          // ribbon subdivisions
    "sizeXY": [0.42, 0.56],         // X=half-width, Y=length
    "tiltUp": 0.28,                 // radians; natural upward pitch
    "yawJitter": 0.35,              // random ± yaw per leaf
    "pitchJitter": 0.12,            // random ± pitch per leaf
    "layers": 3,                    // sheet count
    "layerOffset": 0.0025,          // normal offset per layer
    "curlAmp": 1.0,                 // multiplier for twist/waves
    "blueNoiseScale": 4.0
  },
  "cluster": {
    "radius": 0.55,                 // ring radius for leaf bases
    "spiralTurn": 137.5,            // golden-angle spiral
    "elevation": 0.06               // slight vertical offset per leaf
  },
  "material": {
    "baseAlpha": 0.6,
    "emissiveBase": 0.4,
    "emissivePulse": 0.15
  }
}


Later, the Monstera JSON will override: leaf count, aspect ratio, fenestration mask, petiole lengths, orientation rules, etc.

2) Geometry construction (CPU)

Build a shared leaf ribbon (Plane in leaf-space) with 32×8 segments, UV in x∈[-1,1], y∈[0,1].

Apply a tiny inner radius recess near y≈0 to avoid self-intersection (r -= 0.02 within a small disc).

Use instancing for leaves. For each instance you set:

leafIndex, clusterIndex, phase, curlAmp, instanceColor (optional tint),

instance matrix with position (spiral around stem), yaw/pitch jitter and global tiltUp.

Layout (spiral):

angle_i = i * radians(spiralTurn);
pos = vec3( cos(angle_i), elevation*i, sin(angle_i) ) * cluster.radius;

3) Layered sheets (GPU or CPU)

For each leaf instance, draw 2–3 sheets:

Pass a uLayerId (0,1,2) or encode via instance color’s alpha.

In the vertex shader: transformed += normal * (layerId * layerOffset);

Slight per-layer tint/phase offset:

wavePhase += 0.8 * layerId;

tint = mix(1.0, 0.92, layerId); (in fragment)

4) Vertex shader deformation (membrane motion)

Use your numbers (with curlAmp support) exactly; wire them to uniforms/attributes.

// Inputs: uv in leaf-space, normal, instance attrs: aPhase, aCurlAmp, aLeafIndex, aClusterIndex, aLayerId
// Uniforms: uTime, uBlueNoise (sampler2D), uBlueScale, uLayerOffset

// membrane waves
float w1 = sin(uv.x*6.2831 + uTime*0.30 + aPhase) * 0.006 * (1.0 - uv.y);
float w2 = sin(uv.y*12.566 + uTime*0.12 + aPhase*0.5) * 0.003;
transformed += normal * (aCurlAmp * (w1 + w2));

// center twist
float twist = (0.10 * (1.0 - uv.y)) * aCurlAmp;
mat3 R = mat3(
  cos(twist), -sin(twist), 0.0,
  sin(twist),  cos(twist), 0.0,
  0.0,         0.0,        1.0
);
transformed = R * transformed;

// subtle midrib
float spine = 1.0 - pow(abs(uv.x), 3.0);
transformed += normal * (spine * 0.004 * aCurlAmp);

// blue-noise micro-undulation
float bn = texture(uBlueNoise, uv * uBlueScale + vec2(uTime*0.05, 0.0)).r;
transformed += normal * ((bn - 0.5) * 0.002);

5) Materials & passes (two-material stack)

Base (translucent) pass: handles depth & rim readability.

transparent:true, depthWrite:true, premultipliedAlpha:true.

Add subtle Fresnel to base color for edge readability (as shared earlier).

Emissive pass: additive glow & sparkles.

blending:AdditiveBlending, depthWrite:false, transparent:true.

Clamp emissive in shader (min(glow, uMaxGlow)), use blue-noise sparkles in leaf UV.

Post-FX: UnrealBloomPass with conservative values
(threshold 0.90–0.92, strength 0.65–0.85, radius 0.35–0.45).

6) Instancing attributes (R3F)

aPhase (float): random [0, 2π] per leaf.

aCurlAmp (float): 0.8–1.2.

aLeafIndex (int), aClusterIndex (int), aLayerId (0..layers-1).

Optional: aTint (vec3) slight per-leaf tint.

Keep leaf count at 12 while tuning; you can scale later.

7) Blue-noise & sparkles

Use the tiled 256×256 8-bit blue-noise we prepped; set uBlueScale = 4.0.

Sparkles in fragment (emissive pass), anchored to leaf UV (not screen), density 0.04–0.08, twinkle by nudging the threshold with sin(uTime).

8) Lighting (for membrane read)

Ambient ≤ 0.15, back/side directional 0.6 @ [-3,2,-4], soft fill 0.15 near camera.

Tone mapping: ACESFilmic, exposure ~ 0.9.

9) File changes (exact touch-points)

ProceduralPlant.jsx

Load genericPlant.json.

Build shared ribbon geometry (32×8).

Create instanced buffers & attributes (phase, curlAmp, layerId, etc.).

Spawn two meshes per leaf (base & emissive) that share the same instanced attributes.

SDFLeafBase_CLEAN.js → extend to accept layerId, Fresnel, premultiplied alpha.

SDFLeafEmissive_CLEAN.js → add clamp, sparkles (blue-noise), and per-layer phase.

colorMapping.js → unchanged (still drives health color & emissive intensity).

Asset: ensure uBlueNoise sampler is wired (tile mode: repeat).

10) Acceptance criteria (Phase 2: genericPlant)

AC-1 Readability (bloom OFF):
With bloom disabled, leaf edges and midrib are still legible; overlapping leaves don’t blow out to white.

AC-2 Membrane depth:
With 2–3 layers enabled, rotating the camera reveals a subtle thickness/parallax (no z-fighting).

AC-3 Motion quality:
Micro-waves & blue-noise undulation are subtle (no seasick flapping), and center-twist reads near the petiole.

AC-4 Sparkles:
Sparkles appear as anchored dots following leaf UV, lightly twinkling (no streaks), and density scales with moisture.

AC-5 Performance:
Desktop 60 fps with 12 leaves × 3 layers (≈ 12–15k verts). Draw calls remain bounded (instancing confirmed).

11) Agent checklist (tick-off)

 Add genericPlant.json (schema above) and loader.

 Build shared 32×8 ribbon geometry in leaf-space.

 Implement instancing attributes (aPhase, aCurlAmp, aLeafIndex, aClusterIndex, aLayerId).

 Spawn base and emissive meshes sharing instance buffers.

 Vertex shader: paste membrane, twist, spine, blue-noise code; add uBlueNoise, uBlueScale, uTime.

 Fragment shader (emissive): blue-noise sparkles, clamp glow, premultiplied alpha.

 Tone mapping ACES + bloom parameters adjusted to conservative values.

 Lighting rig set (ambient ≤0.15, back/side dir 0.6, soft fill 0.15).

 Verify AC-1..AC-5 with screenshots (bloom OFF & ON).

 Commit as Phase 2 (genericPlant), keep feature-flagged species switch.

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