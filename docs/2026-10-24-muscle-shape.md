# Local muscle folding correction

This is a further correction to a6cc5ab, not a claim that every anatomical
motion error has been resolved.

## What changed

The existing edge-distance and whole-muscle volume constraints allowed local
parts of a belly to turn inside out while the total volume still passed its
test. The solver now builds overlapping signed-volume cells through the
original muscle's thickness and corrects local inversions.

The same stage now covers long upper-arm and forearm muscles in both the
worker and main-thread fallback. Biceps/triceps heads share coincident source
vertices; other muscles remain separate. Endpoint and rigid hand-tendon
attachments remain fixed. Longitudinal strain is estimated from the curved
material route, avoiding false contraction caused by measuring a chord across
a bent elbow. Neutral/reset returns exactly to the source mesh.

No meshes were removed, swapped, clipped or hidden. No joint ranges were
reduced. Source models and the existing loading/cache improvements are retained.

## Verification and reproduction

- `npm run check`: type checking, atlas mapping, loading/retry recovery and
  actual scene CPU integration, including worker and fallback paths.
- `npm run check:motion`: existing bone, shoulder, forearm, nerve, trunk and
  body regressions, plus the new `test-muscle-cells.mjs` check.
- New material-cell regression: 70 muscles on both sides, 5 poses each,
  including combined elevation, elbow flexion, pronation and wrist movement.
  Across 204,280 eligible cell/pose samples, inverted cells fell from 7,204
  to 196 (97.28% reduction). Maximum whole-mesh volume error was 0.2774%.
  Fixed attachments, finite output and exact neutral reset passed.
- Existing shoulder regression: 16 shoulder muscles across 41 poses per
  side; maximum bulk-volume error 0.16%, maximum measured edge ratio 2.97x.
- `node scripts/review-arm-shape.mjs candidate` and
  `python scripts/render-arm-shape.py candidate` export/render actual atlas
  geometry for offline review after the motion modules have been compiled by
  the tests. These are not browser screenshots.

## Known limits

The residual inversion count is not zero. These overlapping geometric cells
are not a validated physiological finite-element mesh, and their statistics
are not an anatomical accuracy percentage. The solver does not establish
correct muscle-bone or muscle-muscle contact in every pose. Existing nerve
continuity/follower tests pass but do not certify absence of every nerve gap
or displacement. Dynamic extreme poses are still unsuitable as a sole source
for anatomical study.

GPU drawing is stubbed in scene tests. The available cloud browser cannot
initialize WebGL; real Safari/iPad rendering has not been verified here.
The atlas still has no actual latissimus dorsi mesh; this update does not add
one or make the catalogue's text-only mention into a 3-D structure.
