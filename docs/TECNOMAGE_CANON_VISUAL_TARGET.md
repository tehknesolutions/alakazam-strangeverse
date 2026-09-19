# Tecnomage Prime — Canon Visual Target

Status: **APPROVED TARGET / 2026-09-19**

The four user-supplied orthographic/concept views (front, back and both profiles) are the visual target for the in-game Tecnomage Prime.

## Runtime baseline

The latest user playtest was judged **6/10 relative to this target**.

That score is the baseline for V2.8C. It is not a score for the isolated GLB or the earlier beauty previews; it is specifically the perceived character quality in real browser gameplay.

## Invariants

1. **Hero silhouette**
   - structured shoulders;
   - narrow/controlled torso;
   - marked waist;
   - long split coat/panels;
   - substantial boots;
   - clear asymmetry driven by the Nexus arm.

2. **Coat language**
   - charcoal/black dominant;
   - integrated ivory panels;
   - restrained thin ritual-gold lines;
   - subtle sigil/technical ornament;
   - ivory must read as garment construction, not floating plates.

3. **Nexus gauntlet**
   - a coherent arcano-technological device, not a cyan strip;
   - large forearm core;
   - metal/gold housing and rails;
   - secondary energy nodes;
   - articulated glove/hand identity;
   - cyan reserved for energy cores.

4. **Tiferet**
   - front: central cyan core framed by ritual-gold structure;
   - back: large readable compass/astrolabe-like identity mark;
   - must remain recognizable in normal TPS distance.

5. **Material hierarchy**
   - skin, hair, cloth, leather, dark metal, ritual gold, ivory and cyan energy must remain visually separable in the game renderer.

## Production gates

### V2.8C — Runtime Visual Parity
Recover as much of the target as possible without changing hero geometry:
- PBR response;
- character lighting;
- ACES/exposure;
- shadow quality;
- TPS framing;
- emissive readability.

### V2.8D — Canon Geometry Upgrade
Only after V2.8C browser comparison:
- full Nexus architecture;
- front/back Tiferet structure;
- shoulders/collar/hood;
- integrated coat panels;
- waist/belts;
- boots/hands where the runtime comparison proves geometry is the limiting factor.

### V2.8E — Material & Detail Authoring
- leather/cloth/metal/ivory/gold separation;
- roughness/normal detail;
- seams and restrained micro-detail;
- sigil/technical engraving;
- authored emissive masks.

## Approval rule

No isolated beauty render can approve the hero.

Every promotion must compare:
1. canonical target;
2. Web runtime static;
3. Web runtime in motion;
4. normal TPS distance;
5. front/profile/back identity where relevant.

The goal is not to copy every incidental buckle or AI-concept inconsistency. The goal is to preserve the repeated visual language and identity across the four approved views.
