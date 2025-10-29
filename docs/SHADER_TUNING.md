# Shader Tuning Guide - SDF Liquid-Cloth Leaves

## Default Values & Performance Tiers

### HIGH (Desktop, 60fps target)
- SDF_STEPS: 16
- Layers: 3
- Sparkles: enabled
- Bloom: threshold 0.8, radius 0.5, strength 1.0

### MID (Mid-range mobile, 30fps target)
- SDF_STEPS: 12
- Layers: 2
- Sparkles: enabled
- Bloom: threshold 0.85, radius 0.4, strength 0.8

### LOW (Low-end mobile, fallback)
- SDF_STEPS: 8
- Layers: 1
- Sparkles: disabled or reduced
- Bloom: minimal or disabled

## Tunable Uniforms

### Base Pass (SDFLeafBase)

**uEdgeSoftness** (default: 0.04)
- Controls alpha fadeout at leaf edge
- Lower = crisper edge, higher = softer/translucent edge
- Range: 0.02–0.08
- Tune per species (waxy leaves: 0.02, soft leaves: 0.06)

**uFrillAmp** (default: 0.08)
- Amplitude of ruffled/chiffon edge distortion
- Lower = smooth edge, higher = more frilled
- Range: 0.0–0.15
- Herbs/basil: 0.1–0.12, succulents: 0.02

**uSigmaT** (default: 2.5)
- Absorption coefficient for transmittance
- Lower = more light passes through (thin/pale leaves)
- Higher = less transmittance (thick/dark leaves)
- Range: 1.0–5.0
- Fiddle leaf fig: 3.5, spider plant: 1.8

### Emissive Pass (SDFLeafEmissive)

**uSparkleSpeed** (default: 0.5)
- Animation speed of sparkle phase/drift
- Range: 0.1–1.0
- Healthy plants: 0.6, stressed: 0.3

**uSparkleDensity** (default: 0.8)
- Multiplier for sparkle visibility
- Range: 0.0–1.0
- Overwatered: 0.5, optimal: 0.9

## Debug Modes

Enable via `debug=true` prop or query param `?debug=true`:

**uDebugMask** values:
- 0: Normal rendering
- 1: Show SDF distance field (grayscale)
- 2: Show thickness map (red channel)
- 3: Show sparkle mask (white points on black)
- 4: Show fresnel/rim only

## Per-Species Overrides

Add to species JSON profile:

```json
{
  "leafSDF": {
    "edgeSoftness": 0.05,
    "frillAmp": 0.1,
    "sigmaT": 2.0,
    "sparkleSpeed": 0.4,
    "sparkleDensity": 0.7,
    "layers": 2
  }
}
```

If keys are absent, shader defaults are used (no breaking changes).

## Moisture-Driven Behavior

### Healthy (moisture > 0.7)
- Health color: cyan/green tones
- Sparkle density: full (0.8–1.0)
- Rim: bright, cool
- Transmittance: higher (lighter, translucent)

### Dry (moisture < 0.3)
- Health color: warm yellow/orange
- Sparkle density: reduced (0.3–0.5)
- Rim: dimmer, warmer
- Transmittance: lower (thicker, less glow)

## Bloom Settings (Post-Processing)

Conservative values to avoid blown-out whites:

```javascript
{
  threshold: 0.8,   // Only bloom bright emissive areas
  radius: 0.5,      // Moderate halo spread
  strength: 0.8–1.0 // Subtle glow enhancement
}
```

Avoid:
- threshold < 0.5 (blooms everything, loses detail)
- radius > 1.0 (halo too large, obscures leaves)
- strength > 1.5 (nuclear whites, depth loss)

## Performance Notes

- Each layer = 1 additional draw call per leaf instance batch
- Sparkles add ~15% fragment cost (blue-noise texture lookup + flow)
- SDF raymarch cost scales linearly with SDF_STEPS
- On low-end devices, consider disabling emissive pass entirely and relying only on base pass with reduced layers

## Troubleshooting

**Leaves look flat/no depth:**
- Increase layers to 3
- Check uLayerId is cycling 0→1→2 correctly
- Verify layer offset in shader (0.005 per layer)

**Edges too sharp/aliased:**
- Increase uEdgeSoftness (0.06+)
- Enable MSAA on Canvas (antialias: true)

**Sparkles crawl randomly (not along veins):**
- Check flowField function (should return upward/centerward vector)
- Verify noiseUV tiling (fract call present)

**Nuclear whites when overlapping:**
- Reduce bloom strength
- Lower emissive scalar in rim calculation (currently 0.3)
- Check premultiplied alpha on base pass

**React re-render churn:**
- Ensure uniforms updated in useFrame, not via props
- Materials stored in refs, not state
- No color.set() in render body

## Blue-Noise Texture

Expected format:
- 256×256 px
- 8-bit grayscale PNG
- Tileable (seamless wrap)
- Free sources: Christoph Peters' repo, Moments in Graphics

Place in: `client/src/assets/textures/blue-noise-256.png`

Load via TextureLoader, set wrapS/wrapT to RepeatWrapping.
