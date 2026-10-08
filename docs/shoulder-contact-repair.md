# Shoulder contact and thoracic cable repair

The source atlas is a surface reference, not a physiologically validated rig.
This change improves geometric attachment behaviour; it is not a clinical
simulation or an assertion of equivalence to AnatomyLearning.

- The scapular blade centre follows a rib-bounds elliptical shell. Upward
  rotation uses a source blade-plane normal rather than the humeral swing
  axis. A coupled solve preserves clavicle length, SC pivot, and AC connection.
- The lateral thoracic arteries/veins and long thoracic nerves use source
  iso-geodesic centreline contours and a fixed-collar rod solve. Their distal
  thoracic courses no longer inherit humeral motion. Original vertices,
  triangles, names, caps, and disconnected source components are retained.
- Dorsal scapular arteries now use welded source-edge geodesic coordinates:
  the proximal 10% retains the shared parent field, transitioning smoothly to
  the scapular carrier by 70%. No nearest-centreline projection is used, so
  neighbouring branches cannot select unrelated centreline segments.
  `scripts/fit-scapular-branches.mjs` reproduces the mapping from source meshes.
  The anterior proximal arterial cap is selected within the upper quarter;
  the superior arch is not mistaken for the inlet.
- Dorsal scapular nerves and thoracodorsal structures retain their existing
  field. Applying the arterial guide to dorsal scapular nerves increased
  measured stretch and was rejected. This is not a whole-body contact solver.

The new arterial regression exercises 74 poses per side, including negative
angles, combined extremes, and both reported poses. Maximum source triangle
edge ratio (>0.2 mm edges) decreased from 4.094/4.361 to 1.583/1.614 on
left/right. Proximal parent-field discrepancy was zero; distal attachment
error was below 0.0001 mm. These are geometric diagnostics, not physiological
strain limits. Source hashes, source seams, and exact neutral reset are checked.

`npm run check` exercises loading, failure/retry, and the real scene/worker
code with GPU drawing stubbed. `npm run check:motion` includes source identity,
reset, seam, deterministic replay, bilateral shoulder, and thoracic-cable
checks. Numerical pass results do not establish anatomical correctness or
real iPad rendering/performance.

`scripts/fit-thoracic-cables.mjs` reproduces the selected cable fit from source
atlas chunks and the prepared nerve stream. `scripts/review-shoulder-pose.mjs`
and `scripts/render-shoulder-review.py` render actual source geometry for
offline review; these images are not browser screenshots.
