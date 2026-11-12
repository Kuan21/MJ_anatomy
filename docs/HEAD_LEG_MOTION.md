# Head/neck and lower-limb motion

Motion Lab now has Head/neck, Upper limb and Lower limb selectors. Head/neck exposes flexion/extension, axial rotation and lateral bending. Lower limb exposes left/right selection, hip flexion/extension, abduction and rotation, knee flexion, ankle dorsiflexion/plantarflexion, presets and reset. Switching motion regions resets the previous region; this version edits one region at a time. Existing anatomy selection and system visibility remain available.

## Implementation

- An exact ID/name manifest binds 607 atlas head/neck-related pieces and 131 pieces per leg. The focused head view excludes long trunk meshes while their bind data remains available. A second exact source-name manifest identifies 119 legacy nerve nodes for the new regions.
- Seven cervical bone frames plus the skull form a parent chain. Rotation is distributed across the chain with a larger upper-cervical yaw contribution. Skull, jaw, teeth, gingiva and nasal structures share the skull frame. This is not a jaw-opening model.
- The pelvis stays fixed. Hip, knee and ankle form a parent chain. Femur, tibia/fibula and foot bones remain rigid. Patella has an approximate half-knee tracking frame, not a calibrated patellofemoral contact solution. Hip/ankle pivots are estimated from atlas bone bounds.
- Continuous spatial weights drive CPU dual-quaternion deformation of soft tissues and selected nerves. All segments share the same region field. The same output updates picking and visible merged geometry. Immutable rest positions and a single active-region choice prevent accumulated drift or stale transforms when returning to the upper limb.
- Upper-limb pectoral nerve branches now use a trunk-to-humerus attachment envelope shared with the pectoral fan, rather than the generic arm field.

## Validation

TypeScript and production build pass. The actual atlas meshes pass six head/neck poses and seven poses on each leg: 4,831,824 posed vertices; exact neutral reset, finite positions, rigid bone determinants, parent-child joint pivot continuity and fixed root origins. Facial/dental mappings are independently asserted to remain on the skull. All 119 new nerve nodes (206,991 decoded vertices) pass compound motion and exact reset. Existing nine-pose upper-limb regression and 98-node nerve regression still pass.

Offline projections of actual meshes were inspected. An early dental/nasal binding error discovered during visual inspection was corrected before publication. Browser preview remains unavailable in the current environment, so browser/device validation is not claimed.

These are conservative educational motion envelopes, not clinical range-of-motion measurements or physiological simulation. Full fibre activation, volume constraints, wrapping/contact, weight bearing, inverse kinematics and patient-specific attachment calibration remain outside this implementation. Lower-limb nerve geometry comes from a separate atlas and is not individually registered to every digit.
