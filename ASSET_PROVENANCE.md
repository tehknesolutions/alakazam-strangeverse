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
