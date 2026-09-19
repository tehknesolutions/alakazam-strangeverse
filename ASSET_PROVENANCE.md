# Asset Provenance

## M14-WEB-A

This checkpoint intentionally contains no third-party binary assets. The Golden Square geometry is procedural Three.js content so the Web runtime can be validated before external art is introduced.

### Approved sourcing policy
- Prefer CC0/public-domain assets.
- Record creator, source URL, license, downloaded version/date, and local paths before integration.
- Quaternius is the primary candidate source for stylized nature, humanoid bases and animation-compatible content.
- Poly Haven may supply selected CC0 materials/HDRIs/environment elements after visual-style review.
- External assets are raw material; hero characters, Shimokodes, glyphs, Nexus structures and technomagic VFX require Strangeverse-specific art direction.

### Fallback rule
External asset failure must not prevent the core test scene from loading. Procedural/debug substitutes remain available during development.

## M14-WEB-B2.2 — Universal Base Character ingest

- Creator/source: Quaternius — Universal Base Characters [Standard]
- Source artifact supplied for integration: `Universal Base Characters[Standard].zip`
- Source artifact SHA-256: `fdbf1804c90dfc1ea03e992bff7da2dfd1a79318e13270a660180f9308455f40`
- License evidence: package-local `License_Standard.txt`, CC0 1.0 Universal / Public Domain Dedication
- Selected source model: `Base Characters/Godot - UE/Superhero_Male_FullBody.gltf`
- Rig audit: glTF 2.0; 1 skin; 3 meshes; 69 nodes; no embedded animation clips
- Runtime role: temporary humanoid Tecnomage base, not final Alakazam/Strangeverse hero art
- Modification policy: textures may be web-optimized; source rig/skin hierarchy must remain intact until animation compatibility is verified
- Animation gate remains separate: locomotion/action clips must be sourced, licensed, mapped and browser-tested before M14-WEB-B2 is closed.

## V2.8 — Tecnomage Prime runtime candidate

- Project asset: `tecnomage-prime-v2.8-runtime-q.glb`
- Visual source lineage: project-generated Tecnomage Prime V2.7Y, ultimately derived from the user-supplied/generated Hunyuan3D 2.1 character source and subsequent ASV procedural/semantic refinement passes.
- Runtime role: primary Tecnomage Prime / Tiferet hero candidate for the Web runtime.
- V2.8 runtime SHA-256: `c521867422f071f69855087c0495a47f11cc907601951e10f525bef55999be7c`
- Runtime size: 1,508,728 bytes (~1.439 MiB)
- Active geometry: 63,529 triangles
- Rig: 1 skin / 71 joints
- Runtime animation subset: 8 embedded clips
- Quantization: shared affine int16 normalized POSITION + int8 normalized NORMAL via `KHR_mesh_quantization`; uint8 normalized weights; uint16 normalized UV where retained.
- Validation: structural GLB reference/range audit passed with 0 errors; skin weight sums are exact after quantization; CPU skinning comparison against the float runtime showed maximum sampled world-space delta ~1.513e-05 model units.
- Redistribution note: this section records project lineage and technical transformation; it does not make a new legal claim about third-party model-generator licensing.
- Legacy fallback: the Quaternius CC0 `tecnomage.gltf` remains available if the V2.8 hero cannot be loaded.
