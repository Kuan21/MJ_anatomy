# Upper-limb review, 28 September 2026

Historical note: the shoulder implementation has since changed in the review
branch. See `shoulder-muscle-candidate-2026-10-01.md` for the latest candidate,
test results and unresolved release gate. The dated observations below remain
a record of the earlier candidate, not its current shoulder implementation.

Base: upstream `591d8a8424d9a76aaba8d1d8054e2d95b6f9daa0`.

## Changes in this candidate

- Upper-limb neurovascular meshes share one rest-space motion field. The old name-dependent scapular and clavicular profiles assigned different transforms to the same branch junction. Coincident rest points now remain coincident regardless of branch name. This does not repair gaps already present in the source atlas or establish collision-free vessel routes.
- Biceps, triceps and arm profiles use longitudinal section guides with bounded reciprocal cross-sectional scaling and preserved attachment collars. The guide is derived from mesh bounds, not validated anatomical fibre tracts; this is still a geometric approximation. Chest fans and broad shoulder sheets retain their upstream solvers.
- Changing a shoulder/arm/forearm/hand region now requests camera framing. Hidden atlas parts no longer enlarge the framing box; visible replacement brain and cervical-vessel structures retain focus support. Side filtering uses the canonical anatomical side instead of a second centroid threshold.
- External nerve visibility respects the selected side in the lower-limb view and the selected subregion during upper-limb motion.

## Validation

- TypeScript and atlas/region checks pass (2,232 runtime meshes).
- Actual upper-limb meshes: both sides, 12 poses, exact neutral reset, pinned attachments, shared deltoid seams and split-tube continuity; 2,442,072 posed vertices checked.
- Added same-point branch-name continuity probes across shoulder, elbow and wrist for all tested poses.
- Existing head/leg regressions: 6,791,399 posed vertices; surface-constraint regressions pass.
- Vite compilation passes. This local compilation bypasses prebuild downloads; complete asset preparation and the remaining asset-dependent gates must run in CI.
- Offline mesh comparisons were inspected. They are not browser or clinical validation.

## Unresolved release blocker

The requested natural shoulder-muscle motion is NOT complete. Applying the experimental section-guide approach to the broad deltoid increased the clavicular-head maximum triangle-edge stretch at the reported raised-arm pose from 2.13 to 5.36. That extension was removed from the candidate. The original shoulder solver remains, including its known shortcomings.

The remaining work is an attachment- and contact-aware shoulder model with measured per-head origin/insertion regions, humeral wrapping paths, and independent neurovascular sliding paths. Mesh continuity and finite coordinates alone cannot establish anatomical realism. Do not describe this candidate as a complete shoulder repair or a physiological simulation.

## Follow-up: reference review, 29 September 2026

Inspected publicly playable examples from `amos_hsiang`'s Instagram series,
including iliacus (`DdiPEJMBe-7`) and different phases of gluteus medius
(`DcxVk1UTqiZ`). These are visual references only. The series' complete videos,
shoulder-specific movement and underlying rig/solver have not been verified.
No media, model assets or code were copied from the account.

Found and corrected a defect in this candidate's arm-fibre implementation:
the attachment-preservation test used the dominant skin weight, inadvertently
pinning the middle of the muscle to the humerus and overriding fibre scaling.
Collars now use the longitudinal end bands. Guide sections are redistributed
by posed arc length, sharing extension along the belly rather than concentrating
it at transitions between bone weights. Biceps/triceps/arm profiles only;
the deltoid and cuff are deliberately not switched to this approximation.

Added independent synthetic tests for both 20% shortening and 25% lengthening:
section positions must distribute that change, mid-belly cross-sectional area
must vary inversely with length, and endpoint calibre must remain unchanged.
Both sides' existing 12-pose, attachment and junction tests still pass, as do
TypeScript and region-focus checks.

Offline comparisons still show limitations. At 90-degree elbow flexion the
maximum triangle-edge length ratio for the left lateral triceps head falls
from 2.36 (upstream) to 1.50. At the reported elevated-shoulder pose, however,
the left short biceps head increases from 1.49 to 1.65. These are mesh-quality
diagnostics, not clinical or browser-rendered validation. The motion route is
still skinning-derived, not a measured fibre path with bone contact; constant
whole-muscle volume and physiological contraction are not established.

The draft remains blocked from release. This follow-up does not complete the
requested natural shoulder simulation, neurovascular sliding/contact or full
camera/selection visual acceptance testing, and must not be deployed as such.
