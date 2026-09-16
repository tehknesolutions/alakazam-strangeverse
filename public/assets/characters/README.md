# Tecnomage runtime asset contract — M14-WEB-B2

Canonical runtime path: `public/assets/characters/tecnomage.glb`.

The runtime loads this file asynchronously. If it is absent, invalid, or incompatible, `TecnomageController` keeps the procedural fallback active and the game remains playable.

## Animation-name mapping
Animation clips are detected case-insensitively:
- `IDLE` -> IDLE
- `WALK` -> WALK
- `RUN` or `JOG` -> RUN
- `SPRINT` -> SPRINT
- `DODGE` or `ROLL` -> DODGE
- `PULSE`, `CAST`, or `SPELL` -> PULSE

Missing states fall back to RUN/IDLE rather than failing runtime.

## Asset gate
Before adding a binary GLB, record its creator, original source, license, download date/version, modifications, and local path in `ASSET_PROVENANCE.md`. Do not commit an externally sourced binary whose redistribution terms have not been verified.
