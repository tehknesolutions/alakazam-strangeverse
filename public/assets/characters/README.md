# Tecnomage runtime asset contract — V2.8

Canonical hero runtime entry point:

`public/assets/characters/tecnomage-prime-v2.8-runtime-q.glb`

Compatibility fallbacks, in order:

1. `tecnomage-prime-v2.8-runtime-optimized.glb`
2. legacy `tecnomage.gltf`
3. procedural debug character

The V2.8 controller loads the GLB asynchronously. Failure of the new hero asset must not make the game unplayable.

## V2.8 hero runtime budget

- GLB: 1,508,728 bytes (~1.439 MiB)
- SHA-256: `c521867422f071f69855087c0495a47f11cc907601951e10f525bef55999be7c`
- active geometry: 63,529 triangles
- skin: 71 joints
- embedded runtime clips: 8
- required extension: `KHR_mesh_quantization`
- also uses `KHR_materials_emissive_strength`

The quantized runtime was checked against the float runtime by CPU skinning in rest pose and animated samples. Maximum observed world-space position delta was ~1.513e-05 model units.

## Embedded animation mapping

- `IDLE` → `UAL1_Idle_Loop`
- `WALK` → `UAL1_Walk_Loop`
- `RUN` → `UAL1_Jog_Fwd_Loop`
- `SPRINT` → `UAL1_Sprint_Loop`
- `DODGE` → `UAL1_Roll`
- `PULSE` → `UAL1_Spell_Simple_Shoot`
- `ATTACK_LIGHT` → `UAL1_Sword_Attack`
- `ATTACK_HEAVY` → `UAL2_Sword_Heavy_Combo`

The V2.8 controller uses `THREE.AnimationMixer` for the hero. Locomotion clips loop; dodge, pulse and attacks are one-shot actions with short cross-fades. The legacy procedural bone animation remains only as a compatibility fallback.

## Visual/runtime behavior

The V2.8 hero already carries Tiferet/Nexus identity materials. The controller therefore does not add the old procedural chest octahedron to the new hero. Pulse temporarily boosts the emissive intensity of Nexus/Tiferet materials already present in the model.

`SkinnedMesh.frustumCulled` is disabled for the first integration pass to avoid stale animated bounds hiding skinned pieces in the browser. This can be revisited after runtime bounding volumes are authored and validated.

## Asset gate

Every published runtime asset must have provenance and integrity data recorded in `ASSET_PROVENANCE.md` and `MANIFEST.sha256`. The legacy Quaternius character remains available only as fallback.
