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
