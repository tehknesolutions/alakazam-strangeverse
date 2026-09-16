# Tecnomage runtime asset contract — M14-WEB-B2.2

Canonical runtime entry point: `public/assets/characters/tecnomage.gltf`.

The glTF references the companion `tecnomage.bin` plus local textures in this directory. The runtime loads the glTF asynchronously. If it is absent, invalid, or incompatible, `TecnomageController` keeps the procedural fallback active and the game remains playable.

## Animation-name mapping
Animation clips are detected case-insensitively:
- `IDLE` -> IDLE
- `WALK` -> WALK
- `RUN` or `JOG` -> RUN
- `SPRINT` -> SPRINT
- `DODGE` or `ROLL` -> DODGE
- `PULSE`, `CAST`, or `SPELL` -> PULSE

Missing states fall back to RUN/IDLE rather than failing runtime. The controller explicitly initializes the first IDLE transition after a successful model load, so a future embedded IDLE clip can start immediately.

## Asset gate
For every externally sourced asset, record creator, original source, license, download date/version, modifications, local paths, and integrity hashes in `ASSET_PROVENANCE.md` / `MANIFEST.sha256`. Do not commit externally sourced content whose redistribution terms have not been verified.
