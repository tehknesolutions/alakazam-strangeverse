# M15-F — Tecnomage character pipeline

## Immediate runtime contract

- Character base: `public/assets/characters/tecnomage.gltf` (Universal Base Character-derived SuperHero male).
- Face contract: `Eyebrows`, `Eyes`, and `SuperHero_Male` must remain visible. The current glTF also contains a `Head` bone and Face meshes.
- Runtime locomotion/combat currently uses the humanoid skeleton directly so the project no longer selects arbitrary animation names such as zombie locomotion.
- Movement states: `IDLE`, `WALK`, `RUN`, `SPRINT`, `DODGE`.
- Combat states: `ATTACK_LIGHT`, `ATTACK_HEAVY`, `PULSE`.
- Controls: WASD run, Ctrl walk, Shift sprint, Space dodge, J light attack, K heavy attack, Q pulse.

## Animation-library split for the next binary ingest

Use the original Quaternius **Universal Animation Library** as the locomotion source because it explicitly covers directional locomotion, jog and sprint.

Use **Universal Animation Library 2** as the complementary combat/action source: melee combos, parkour and other specialized actions. Do not use zombie locomotion as a locomotion fallback.

Before enabling any external clip in runtime:

1. enumerate the exact clip names from the ingested GLB;
2. approve an explicit state -> exact clip mapping;
3. reject any `Zombie*` clip for the Tecnomage player;
4. verify forward axis / foot sliding / loop behavior in browser;
5. preserve the skeleton-driven procedural pose as a safe fallback.

## Acceptance gate

M15-F is not visually accepted until browser QA confirms:

- face, eyes and hair render correctly;
- forward movement faces the actual travel direction;
- no zombie locomotion;
- walk/run/sprint are visually distinct;
- tree, rock and world-bound collision remain solid;
- light attack, heavy attack, dodge and Pulse return cleanly to locomotion;
- camera does not pass through solid blockers.
