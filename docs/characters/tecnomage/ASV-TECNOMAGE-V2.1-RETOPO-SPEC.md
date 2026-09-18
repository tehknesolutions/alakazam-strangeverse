# ASV — Tecnomago Prime V2.1
## Retopo + Authorial Edit Spec

**ASV = Alakazam StrangeVerse**

Source reviewed: `ASV-tecnomago-model-3D-01.glb`

Status: `APPROVED_FOR_RETOPO_AND_AUTHORIAL_REFINEMENT`

The source is a high-poly visual base, not a game-ready character.

## Frozen source audit

- GLB 2.0
- ~18.33 MiB
- 1 mesh
- ~318k vertices
- ~289,184 triangles
- 1 material
- 2 embedded 4096×4096 WebP textures
- 0 skins
- 0 animations

## Visual decision

Keep the major silhouette, especially the long coat, hair mass, boots and overall heroic proportions. Do not preserve generated micro-detail indiscriminately.

The biggest authorial gaps are:
1. Nexus gauntlet identity.
2. Tiferet / Convergence chest language.
3. TPS-readable back sigil.
4. Excess fantasy-generic accessory noise.
5. Lack of production topology for cloth and deformation.

## LOD targets

### LOD0 — hero gameplay
Target: **55k–65k triangles**

- Head + face: 7k–9k
- Hair: 5k–7k
- Visible body: 6k–8k
- Coat + tails: 15k–18k
- Nexus gauntlet: 7k–9k
- Legs + boots: 8k–10k
- Tiferet details + sockets: 3k–4k

### LOD1
Target: **30k–35k triangles**

### LOD2
Target: **12k–18k triangles**

## Required object split

- `ASV_BODY`
- `ASV_HEAD`
- `ASV_HAIR`
- `ASV_COAT_UPPER`
- `ASV_COAT_TAIL_L`
- `ASV_COAT_TAIL_C`
- `ASV_COAT_TAIL_R`
- `ASV_GAUNTLET_NEXUS_R`
- `ASV_LEGS`
- `ASV_BOOTS`
- `ASV_TIFERET_DETAILS`
- `ASV_WEAPON_SOCKET`
- `ASV_FOCUS_SOCKET`

## Topology rules

1. Automatic decimation is never accepted as final topology.
2. Shoulder, elbow, wrist, hip, knee and ankle need clean deformation loops.
3. Face needs loops for eyelids, mouth, jaw and expression deformation.
4. Coat must use real cloth topology, not disconnected generated shards.
5. Coat tails remain separate deformation panels.
6. Nexus gauntlet must read as one cohesive equipment system, not floating ornaments.
7. Bake high-poly micro-detail into normal / ORM maps instead of carrying it as geometry.
8. Preserve the major source silhouette before changing secondary details.

## Region actions

| Region | Action | Priority | Direction |
|---|---|---:|---|
| Face | KEEP + REFINE | High | Preserve proportions, clean planes and expression loops |
| Hair | KEEP + REFINE | High | Preserve mass; reduce noisy micro-spikes |
| Chest | REMODEL | Critical | Smaller geometric Tiferet/Convergence emblem |
| Right gauntlet | REMODEL | Critical | Cohesive Nexus shell + gold frame + cyan channels |
| Left arm | SIMPLIFY | Medium | Reduce symmetric fantasy armor language |
| Waist | SIMPLIFY 30–40% | High | Remove redundant buckles/rings/straps |
| Coat front | KEEP + RETOPO | Critical | Preserve silhouette/asymmetry; clean cloth topology |
| Coat back | KEEP + RETOPO | Critical | Preserve volumes around shoulders/spine/pelvis |
| Coat tails | KEEP + REBUILD TOPOLOGY | Critical | 3 deformable panels + secondary bones |
| Legs | KEEP + SIMPLIFY | Medium | Preserve proportions, clean knee/ankle zones |
| Boots | KEEP + RETOPO | Medium | Preserve silhouette, bake micro-detail |
| Back sigil | ADD / REMODEL | Critical | Elegant TPS-readable Convergence/Tiferet mark |

## Authorial priorities

### P0 — mandatory before rig
- Remodel Manopla Nexus.
- Remodel chest Tiferet / Convergence language.
- Add TPS-readable back sigil.
- Remove ~30–40% of redundant waist micro-accessories.
- Retopo coat tails.

### P1 — before visual lock
- Face cleanup.
- Hair-clump cleanup.
- Reduce symmetric fantasy-armor cues.
- Harmonize shin guards and boots with torso design.

### P2 — polish
- seam placement
- leather stitching
- engraved gold lines
- emissive channel masks
- micro-surface detail

## Material plan

Use controlled material roles rather than the generated single mega-material:

- `M_SKIN`
- `M_HAIR`
- `M_FABRIC_CHARCOAL`
- `M_IVORY_STRUCTURED`
- `M_LEATHER`
- `M_COLD_METAL`
- `M_RITUAL_GOLD`
- `M_NEXUS_EMISSIVE`

### Texture target

Hero LOD0:
- 2K skin
- 2K costume atlas
- optional 2K coat/gauntlet
- shared 1K emissive/mask maps

Do not retain 4K textures by default for the web build unless visual QA proves they are necessary.

## Rig plan

Reuse / retarget the established ASV humanoid animation contract.

Secondary coat chains:
- `coat_tail_L_01 -> coat_tail_L_02`
- `coat_tail_C_01 -> coat_tail_C_02`
- `coat_tail_R_01 -> coat_tail_R_02`

Optional:
- `coat_side_L`
- `coat_side_R`

These bones provide secondary motion without requiring expensive browser cloth simulation.

## Critical animation QA

Must pass:
- Idle
- Walk
- Sprint
- Roll
- Sword Combo
- Pulse / cast

Stress zones:
- armpit
- inside elbow
- Nexus wrist
- pelvis / coat
- knee under coat
- coat tails during Roll
- boot flexion

## Visual gate

Do not branch production Hod/Yesod from this mesh until Tecnomago Prime reaches **>= 8/10**.

Required captures:
- front
- 3/4 front
- side
- back
- 3/4 back
- face close-up
- Nexus gauntlet close-up
- Sprint
- Roll
- Sword Combo

## V2.1 acceptance

V2.1 is complete when:
- high-poly source is locked and untouched;
- clean LOD0 retopo exists;
- object split follows this contract;
- UVs are clean/non-overlapping unless intentionally mirrored;
- material IDs are assigned;
- Nexus/Tiferet edits are modeled;
- mesh can enter humanoid rigging without topology changes.
