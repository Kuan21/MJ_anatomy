# Integrated soft-tissue motion update

The main atlas Motion Lab now uses the bone motion palette with a shared soft-tissue deformation stage. The separate Phase 1 skeletal lab remains available.

## Changes

- Replaced independent rigid deltoid-head transforms with normalized dual-quaternion skinning. All three heads share a bind-space envelope, so coincident seam points remain coincident. Proximal influence comes from clavicle/scapula and distal influence from humerus.
- Added pinned-end, longitudinally weighted biceps/triceps/brachialis deformation and a tapered, bounded inverse-length radial response (0.94–1.12). This approximates visible shortening/bulging; it is not physiological force or exact volume simulation.
- Broad pectoral origins remain anchored through a separate attachment profile, rather than moving an entire chest muscle with the arm.
- Forearm tissues, vessels and nerves share a continuous spatial field based on the same skeletal transforms. Vessel segments no longer choose different motion rules from their individual centres. Equal bind-space connection points stay coincident, although gaps already present in source meshes are not reconstructed.
- Explicit IDs/names bind 276 atlas tissue pieces; explicit GLB source names bind 98 upper-limb nerve nodes. GLTFLoader sanitizes Object3D names; the original `userData.name` is now used for anatomy identity, laterality, title and CNS filtering.
- Bundled the existing Three.js Draco decoder locally with its Apache license, eliminating the external decoder request.
- CPU picking and the merged render buffers receive identical deformed positions. Normals and picking bounds are recomputed; reset always starts from immutable rest positions.
- Kept the cranial/legacy CNS filtering and dissection controls. Nerves use normal depth occlusion rather than appearing in front of overlying muscles.
- Added “Raise arm 60°” and “Bend elbow 90°” buttons to the main Motion Lab.
- Bone membership now uses the exact Phase 1 bindings, excluding toe phalanges from hand/wrist calculations.

## Evidence and limits

Passed TypeScript check, atlas/buffer validation, production build, existing skeletal tests, and new geometry tests. On the actual atlas: both sides, six poses (neutral, abduction 60/90/145, elbow 90, compound motion), 1,159,710 posed vertices; neutral error zero; finite geometry; shared deltoid points; pinned endpoint checks; split-tube consistency. All 98 GLB nerve nodes were decoded and 128,232 vertices tested for compound movement and exact reset.

Offline surface projections of the actual deformed meshes were inspected across those six poses. Browser preview access remains blocked by the environment (`ERR_BLOCKED_BY_CLIENT`), so this is not a claim of completed browser/UI or device-performance validation.

This remains a bounded educational approximation: landmarks/weights are estimated from the atlas, not manually calibrated attachments. There is no full tendon sliding, muscle-bone collision solver, physiological activation/force model, FEM, or validation of every high-angle combination. No claim is made that deformation artifacts are impossible or that all prior production bugs are resolved. Main is not merged.

Method reference: Kavan et al., *Geometric Skinning with Approximate Dual Quaternion Blending* (2008), author overview: https://users.cs.utah.edu/~ladislav/dq/index.html . DQS addresses linear-blend collapse; it does not by itself prove anatomical fidelity.

## Recording follow-up: stationary forearm tissue

The user's recording shows a forearm muscle and vessel branches left at rest during shoulder motion. The binding authoring rule checked `brachialis` before an unreachable `brachioradialis` subcase, leaving both brachioradialis meshes unbound. Added exact bindings for both brachioradialis, anconeus, wrist flexor retinacula, circumflex scapular arteries/veins, and dorsal metacarpal arterial sets (12 pieces; 288 total). The latter arterial sets have no side in their names, so laterality is pinned from their inspected atlas coordinates.

The regression now audits the actual union of all four UI motion-focus regions independently of the tissue manifest. Every focused part must have a bone or tissue binding, except explicitly stationary costal cartilage. This catches missing bindings that a test iterating only the binding manifest cannot detect. Added movement assertions for the repaired pieces and a shoulder-flexion combination approximating the recording. Both sides, seven poses, 1,407,462 posed vertices pass, with exact neutral restoration. TypeScript and production build pass. Offline projections inspect the left side used in the recording; live browser verification remains unavailable.

## Extension, hand registration and pectoral fan follow-up

- Upper-arm vertical drags now select shoulder flexion/extension; horizontal drags retain abduction. Extension is available to -45 degrees and has a dedicated preset. Wrist flexion/extension range is now ±45 degrees with a side-aware extension preset. Negative shoulder flexion no longer incorrectly invokes upward scapular rhythm.
- Decoding the independent nerve GLB revealed a distal hand landmark at y=0.70182711 m, versus the atlas middle-finger bone tip at approximately y=0.7315 m. A shared monotone, smooth wrist-anchored rest-space registration brings the distal nerve extent to the atlas tip minus a 2 mm soft-tissue allowance. All nerve segments use the same field before binding, preserving identical-point joins and proximal locations. This corrects longitudinal atlas mismatch; it is not a per-digit or patient-specific anatomical registration.
- Pectoralis major now uses a narrower distal attachment envelope and blends frame displacements instead of dual-quaternion rotations across the broad fan. The medial origin remains on the thorax (or clavicle for the clavicular head). Distal attachment follows the humerus. No wrist or forearm transform affects this muscle.
- Actual-mesh regression: both sides, nine poses, 1,809,594 posed vertices; posterior movement for extension, exact chest invariance under wrist motion, finite geometry, anchored attachments and exact neutral restoration. All 98 nerve nodes/128,232 vertices pass registration extent and unchanged proximal coordinate checks, compound movement and reset. TypeScript and build pass.

These changes remain educational approximations, without muscle wrapping/collision or physiological fibre activation. Browser interaction/device verification remains unavailable in this environment.
