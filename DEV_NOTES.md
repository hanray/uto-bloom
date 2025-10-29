# Development Notes - SDF Liquid-Cloth Leaves Implementation

## Phase 1: Foundation & Wiring

### Completed Items

#### 2025-10-29: Initial Scaffolding ✓
- Created `leafDefines.glsl` with shared SDF primitives, noise utilities, and constants
  - Oblong/heart-shaped leaf SDF formula
  - Domain warp for frilled edges
  - Flow field for sparkle advection
  - Thickness estimation from SDF
  
- Created `SDFLeafBase.js` (translucent base pass)
  - Premultiplied alpha blending
  - Wrap diffuse (fake SSS) with configurable wrap factor
  - Transmittance calculation via Beer-Lambert law
  - Layer offset support (uLayerId uniform)
  - Soft edge fadeout with smoothstep
  
- Created `SDFLeafEmissive.js` (rim + sparkle overlay)
  - Additive blending
  - Fresnel rim with power=4
  - Blue-noise based sparkles with flow advection
  - Moisture-driven sparkle density
  
- Created `blueNoiseGenerator.js` utility
  - Procedural 256×256 tileable texture (Bayer dither + hash)
  - Note: Replace with proper blue-noise PNG in production
  
- Created `SHADER_TUNING.md` documentation
  - Default uniform values per performance tier
  - Per-species override structure
  - Debug mode reference
  - Bloom configuration guidance

#### 2025-10-29: ProceduralPlant Integration ✓
- Imported SDF material creators and blue-noise generator
- Created 4 material instances (3 base layers + 1 emissive)
- Replaced single `leavesRef` with 4 instanced mesh refs (one per pass/layer)
- Updated leaf positioning logic to apply transforms to all 4 instances
- Modified useFrame animation loop:
  - Update uTime, uMoisture, uHealthColor on all SDF materials
  - Sparkle density scales with moisture (0.3→1.0)
  - Droop deformation applied to all leaf layers simultaneously
- Updated JSX return to render 4 instancedMesh components
- Preserved existing leaf count (20 instances = 4 clusters × 5 leaflets)
- Trunk and pot rendering unchanged

### Known Issues / TODO

- [ ] **UVs**: Current leaf geometry uses ShapeGeometry which may not provide proper UVs for SDF shader (shader expects vUv in 0..1). Need to verify or manually set UVs on leafletGeometry.
  
- [ ] **Blue-noise texture quality**: Current procedural texture is a placeholder. For production:
  - Download proper tileable blue-noise (e.g., from Christoph Peters' repo)
  - Place in `client/src/assets/textures/blue-noise-256.png`
  - Update ProceduralPlant to load via TextureLoader instead of generator
  
- [ ] **Performance tiers not implemented**: Currently renders 3 base layers always. Need:
  - Device detection helper (userAgent + dpr + leafCount)
  - LEAF_TIER define (HI/MID/LOW)
  - Conditional layer count (HI:3, MID:2, LOW:1)
  - SDF_STEPS override per tier
  
- [ ] **Debug mode not wired**: uDebugMask uniform exists but not exposed via props or query param
  
- [ ] **Species profile hooks**: leafSDF config keys not yet read from species JSON
  
- [ ] **Bloom post-processing**: Need to verify existing bloom settings or add conservative UnrealBloomPass if not present

### Testing Plan

- [ ] **Overlap test**: Render 5+ leaves stacked — verify no nuclear whites, depth readable
- [ ] **Healthy state (moisture=0.85)**: Check cyan/green tint, bright rim, dense sparkles
- [ ] **Dry state (moisture=0.25)**: Check warm tint, droop animation, reduced sparkles
- [ ] **React churn**: Profile with React DevTools — ensure no re-renders from uniform updates
- [ ] **Performance**: Measure FPS on desktop (target 60fps) and mid-mobile (target 30fps)

### Screenshots

(Will be added after local verification)

---

## Next Steps (Immediate)

1. **Fix UVs**: Add explicit UV attribute to leafletGeometry or use PlaneGeometry instead of ShapeGeometry
2. **Test locally**: Run dev server, navigate to plant view, verify SDF leaves render
3. **Add debug mode**: Wire `?debug=true` query param to toggle uDebugMask
4. **Implement tiers**: Add LEAF_TIER detection and conditional layer rendering
5. **Replace blue-noise**: Download proper texture and load via TextureLoader

---

## Code Locations

### New Files
- `client/src/components/PlantVisualization/materials/common/leafDefines.glsl`
- `client/src/components/PlantVisualization/materials/SDFLeafBase.js`
- `client/src/components/PlantVisualization/materials/SDFLeafEmissive.js`
- `client/src/utils/blueNoiseGenerator.js`
- `docs/SHADER_TUNING.md`

### Modified Files
- `client/src/components/PlantVisualization/ProceduralPlant.jsx`
  - Imports: Added SDF materials and blue-noise generator
  - Refs: Changed from single leavesRef to 4 refs (base layers + emissive)
  - Materials: Created 4 SDF material instances in useMemo
  - Positioning: Updated useEffect to apply transforms to all 4 instances
  - Animation: Updated useFrame to update SDF uniforms
  - JSX: Replaced single instancedMesh with 4 instancedMesh components

### Unchanged
- `PlantCanvas.jsx` — still renders ProceduralPlant
- Species profiles — no changes required (optional leafSDF keys for future)
- Trunk/pot rendering — preserved as-is

---

## Performance Notes

- Each layer adds 1 draw call per leaf batch (currently 3 base + 1 emissive = 4 calls)
- Premultiplied alpha on base layers prevents overdraw issues
- Additive blend on emissive layer is cheap (no depth write)
- SDF fragment cost is ~16 instructions (cheap for 16 steps)
- Blue-noise lookup + flow adds ~10-15% fragment cost
- Total expected: 60fps on desktop with 500+ leaves (HI tier)

---

## Debugging Commands

```bash
# Run dev server
cd client && npm run dev

# Enable debug mode (add to URL)
?debug=true

# Profile React renders
# In browser: React DevTools → Profiler → Record

# Check FPS
# In browser: DevTools → Performance → Record 5s
```

---

**Last Updated:** 2025-10-29  
**Status:** Phase 1 scaffolding complete, pending UV fix and local testing
