# Shoulder muscle candidate — 1 October 2026

Status: implemented in the review branch, NOT deployed or anatomically validated.
This supersedes the previous note that the shoulder solver was entirely unchanged.

## Implementation

- Refit origin/insertion influence against the source clavicle, scapula and
  humerus triangles, retaining source coordinates. The clavicular deltoid's
  proximal frame is now explicitly the clavicle. Other shoulder profiles use
  the scapula. Candidate attachment patches use a 3 mm surface-distance cutoff
  inside the previous proximal/distal regions; this is a geometric fit, not
  independently measured attachment anatomy.
- Between these patches, influence varies with surface-geodesic distance.
  Disconnected islands in the supraspinatus, teres major and spinal deltoid use
  a spatial-distance fallback (9, 5 and 8 unique vertices respectively per
  side), without welding separate components. The generated manifest records
  this fallback and a rest-coordinate fingerprint; mismatched source geometry
  is rejected instead of receiving stale fitted weights.
- Added a shoulder-only position-based solver: longitudinal/transverse strain
  targets, internal links between opposite-facing surfaces of the same muscle,
  signed bulk-volume preservation, a fitted humeral-head sphere contact guard,
  and a final local edge-stretch guard. Pins stay on their existing bone poses.
  All three deltoid heads share exact coincident nodes; unrelated anatomy is
  never welded together. Cuff profiles are solved separately, including teres
  major because the existing binding manifest groups it there (teres major is
  not anatomically a rotator-cuff muscle).
- Hidden shoulder parts participate in the same solve, so isolation does not
  change the remaining head's geometry. Rendering still respects visibility.
  Bone-only mode does not enable the muscle solver.

The strain target uses an approximate spherical wrapping length between the
attachment-patch centroids and reciprocal transverse scaling. The current
fibre-direction approximation is longitudinal Y for deltoid and X for cuff
profiles, not measured per-fibre directions. Skinning initializes the solve;
this is not a force-generating muscle or a fully reconstructed wrapping path.
Bulk volume is evaluated on source triangle surfaces; source holes and islands
mean it is a geometric diagnostic, not a measured tissue volume.

Conceptual reference for attachment points and wrapping objects:
https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53090145
No OpenSim solver implementation or third-party model assets were copied.

## Checks performed

`npm run check:shoulder` exercises 8 muscles per side over 40 poses each:
abduction/flexion sweeps to 165 degrees, extension, axial rotations, raised-arm
rotations, and the previously reported mixed pose. It checks:

- exact neutral reset and deterministic re-evaluation from rest;
- fixed attachment points and coincident source seams;
- free vertices outside the fitted head proxy, within numerical tolerance;
- less than 5% signed bulk-volume error (observed maximum 4.93%);
- a local triangle-edge spike gate of 3.5x for edges longer than 0.2 mm
  (observed maximum 3.11x on a 0.213 mm edge of right teres major).

The edge gate is a mesh-quality threshold, NOT a physiological fibre-strain
limit. It was added after an early candidate passed bulk-volume checks but
produced 8–20x local edge spikes. It does not establish absence of every fold.

TypeScript, atlas/region checks, existing upper-limb and nerve regressions,
surface regressions and Vite compilation pass. Vite compilation bypassed asset
preparation; the complete asset-dependent CI suite still has to pass remotely.
The shoulder gate is included in `check:motion` for that CI run.

Offline actual-mesh comparisons were inspected at neutral, 90-degree abduction
and the reported mixed elevated-arm pose. They show a fuller deltoid envelope
than the previous candidate, but remain insufficient for release acceptance.
The browser rejected the local preview with `ERR_BLOCKED_BY_CLIENT`; interactive
WebGL, mobile performance and full visibility/camera acceptance were not tested.

## Remaining limitations / release gate

This is not yet evidence that the entire shoulder behaves like a real person.
Full bone-surface contact, muscle-to-muscle contact, self-intersection checks,
validated per-head fibre directions and neurovascular sliding paths are absent.
The artery/nerve carrier is unchanged; continuity tests do not establish that
these structures avoid or slide along the newly solved muscles.

Do not merge/deploy this candidate as a complete physiological repair. First
inspect front/back/side animation across the control range in a working preview,
including layer isolation and mobile input. Validate and refine the fitted
attachment regions and fibre directions against anatomical references.

To reproduce the fitted data after intentionally changing source geometry:
run `node scripts/test-soft-tissue.mjs` to compile shared modules, then
`node scripts/inspect-shoulder-attachments.mjs --write`, review its patches and
fallback counts, and rerun the complete checks. The generator without `--write`
only writes a candidate under `.sites-runtime/`.
