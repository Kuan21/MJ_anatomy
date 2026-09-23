# MJ Anatomy — biomechanics-v2 / Phase 1

Baseline: `74d093b` (main at checkout). Work branch: `astra/biomechanics-v2`.

## Current implementation audit

1. `app/mj-motion.ts` computes world-space rigid deltas using estimated bounding-box endpoints. It manually composes clavicle/scapula, humeral swing/axial rotation, elbow hinge, radius rotation and wrist transforms. There is no explicit reusable bind-frame hierarchy.
2. Its hand membership regex includes `phalanx` without excluding toes. `handIndices` checks side but not upper-limb identity; foot phalanges can contaminate the neutral hand bounding box and hence wrist estimation. The new module binds all 32 upper-limb bones per side by exact ID/name, excluding toes.
3. Muscles and vessels receive rigid or paired anchor/moving transforms selected by names and spatial bands. `scene.tsx` computes per-vertex heuristic weights and blends positions between the two transforms in both GPU rendering and CPU picking. Separate displacement caps (muscle .24, vessel .16 atlas units) limit stretch but do not conserve volume or enforce attachments or shared vessel endpoints. These are likely mechanisms for membranes, detached attachments and vascular discontinuities; no new visual diagnosis is claimed.
4. Legacy nerves have a separate GLB path. Their geometry blends between arm/forearm/hand transforms using fixed world-Y bands and a .28 displacement cap. Regex-based identity/region filtering and overlay depth handling are separate again. This does not guarantee continuity or correct nerve identity.
5. Existing skull/CNS visibility and GLB label filtering are production stabilization concerns. They are preserved here, not claimed fixed by Phase 1.

## Reuse versus replace

Reuse the atlas catalogue/binary loader, stable part identifiers, rigid `PartTransform` format, renderer, CPU rigid picking, selection and visibility controls. Keep existing production motion untouched for comparison.

Replace manual parent propagation with explicit bind frames and absolute local-pose evaluation. Replace heuristic membership with versioned exact bindings. In later phases, replace uncalibrated pivots with reviewed anatomical landmarks, add shoulder coupling, constrained joint DOFs, then attachment/volume-aware tissue and continuous path models. Do not interpret the hierarchy as proof that every adjacent transform node is an anatomical joint.

## Phase 1 implemented

- Separate `app/biomechanics-v2` module and `?lab=skeleton-v2` entry point.
- Thorax root → clavicle → scapula → humerus → ulna → radius → carpus → hand transform dependency.
- 32 exact bone bindings per side; 8 carpals, 19 metacarpals/phalanges, 5 proximal bones.
- Explicit parent-relative bind translations and local quaternions; `world * inverse(bindWorld)` emits rigid deltas for existing renderer.
- Missing/mismatched bindings fail closed. Nonfinite/zero rotations are rejected.
- No soft-tissue transforms, no broad membership fallback, no frame accumulation.
- Small ±15° axis tests inspect inheritance only. They are deliberately not labeled physiological shoulder/elbow/pronation movements.
- Bone selection, hide, restore, isolate, side switching and whole-skeleton context.

## Validation

`npm run check`; `node scripts/validate-atlas.mjs`; `node scripts/test-skeleton-v2.mjs`; Sites build.

Numerical tests use the actual atlas and cover neutral identity, both-side membership, 32-bone count, no toes/opposite side, parent composition, common elbow pivot continuity, radius motion leaving ulna fixed, downstream hand propagation, rigid determinant, repeat/reset without drift, missing bindings and nonfinite rotation rejection.

The supervised preview server started, but the browser could not reach it (`ERR_BLOCKED_BY_CLIENT`). Visual QA is therefore **not complete**. No anatomical calibration, muscle/nerve/vessel regression pass, or readiness to merge is claimed. Keep this as an isolated development preview until browser review is completed.

## Next gate

Visually check both sides in neutral and small local tests, then review and replace approximate SC/AC/GH/elbow/radioulnar/wrist landmarks. Only after that proceed to shoulder coupling. Do not merge to main.
