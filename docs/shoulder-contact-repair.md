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
- Dorsal scapular and thoracodorsal branches retain the shared rest-space
  deformation field. A tested topology-aware branching solution remains
  future work. This implementation is not a whole-body contact solver.

`npm run check` exercises loading, failure/retry, and the real scene/worker
code with GPU drawing stubbed. `npm run check:motion` includes source identity,
reset, seam, deterministic replay, bilateral shoulder, and thoracic-cable
checks. Numerical pass results do not establish anatomical correctness or
real iPad rendering/performance.

`scripts/fit-thoracic-cables.mjs` reproduces the selected cable fit from source
atlas chunks and the prepared nerve stream. `scripts/review-shoulder-pose.mjs`
and `scripts/render-shoulder-review.py` render actual source geometry for
offline review; these images are not browser screenshots.
