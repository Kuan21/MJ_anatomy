# Joint motion table (internal)

Internal data for the planned muscle animation / joint motion mode. Lives in `docs/` and `app/data/`; the `check`, `note` and `_doc` fields must never be rendered on the site. Nothing is wired into the UI or the 3D scene yet.

Files: `app/data/joint-motion/joints.json` (data), `app/joint-motion.ts` (typed loader), `scripts/test-joint-motion-table.mjs` (validation, part of `npm run check`).

## Reading the table

One entry per joint, each with `movements`. A movement and its opposite are two entries sharing an axis line with the sign flipped. Ranges run from 0 to `max` in the movement's own direction.

- Frame (same as `app/biomechanics-v2/body-motion.ts`): x = left-right (+x Left), y = up, z = anterior. Right-handed.
- Rotation: positive angle = right-hand rotation about `axis`. Flexion = about +x, turning left = about +y, left lateral flexion = about -z. These match `BodyPose` (`flexion`, `rotation`, `sideBend` positive = flexion, left, left).
- `kind: translation` uses mm along `axis`.
- `pivot`: coordinate or `null`; `pivotLandmark` says in words where it is. `null` means "needs landmark".
- Muscle lists use the lower-case keys of the site muscle facts; `side` is relative to the movement direction. Muscles that should be there but are not in the site facts go in `unlistedMuscles` (the test fails if a listed name later appears in the facts, so the entry gets moved to a role list).
- `proximal` / `distal` use atlas part names exactly (validated against `public/models/atlas.json`).
- `codeMapping` links a movement to a `BodyPose` key so the test can compare with `BODY_LIMITS`.

To edit: change the JSON, run `node scripts/test-joint-motion-table.mjs` and `node scripts/check-zh.mjs`.

## Coverage

Filled (first batch, head and neck, 18 movements):
- Temporomandibular joint: depression, elevation, protrusion, retrusion, lateral excursion left/right.
- Atlanto-occipital joint: flexion, extension, lateral flexion left/right.
- Atlanto-axial joint: rotation left/right.
- Cervical spine overall: flexion, extension, lateral flexion left/right, rotation left/right.

Missing: every pivot coordinate (all `null`); individual C2-C7 segments; thoracic/lumbar spine; shoulder girdle, upper limb, hip, knee, ankle, hand and foot joints; TMJ translation sub-components of opening.

Muscles absent from the site facts: multifidus, rotatores cervicis, interspinales cervicis, intertransversarii cervicis.

## Discrepancies with existing limits (not changed)

Table values (approximate textbook range for the whole cervical spine) versus `BODY_LIMITS.head`: flexion 50 vs 40; extension 60 vs 35; lateral flexion 45 vs 30; rotation 80 vs 60. `HUMAN_JOINTS['cervical-spine']` in `articulation-registry.ts` has a third set (flexion -30 to 35, rotation 55, sideBend 25). The code values are narrower on purpose (conservative educational envelopes, see `HEAD_LEG_MOTION.md`).

## Open questions

1. Should the motion mode use the textbook ranges in this table or keep the narrower code envelopes?
2. Which atlas landmarks may be used for the TMJ condyle and the dens pivots? Deriving them from the Mandible, temporal bone and Axis bounds is possible but needs a visual check.
3. TMJ opening: rotation 0-25 degrees plus forward glide, or a single combined angle?
4. Add multifidus, rotatores and intertransversarii to the site muscle facts so they can be listed?
5. Is a joint-specific range of motion per side (left/right) needed, or are mirrored movements enough?

All numbers are approximate; the final anatomical check is done by the user.
