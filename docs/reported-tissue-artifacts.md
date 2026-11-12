# Reported tissue artefacts, 27 September 2026

Reproduced the user's shoulder pose (flexion 68°, abduction 150°) and neck pose (extension 35°, left rotation 60°).

## Causes and repairs

- The supplementary scaphotrapeziotrapezoidal wrist ligament matched the broad `trapezoid` shoulder regular expression. Both wrist ligaments received shoulder rather than hand transforms and floated beside the torso. Wrist territory now takes precedence. Every vertex is checked against the hand frame at the reported pose.
- Thyrohyoid membranes sampled different cervical rotations per vertex while the adjacent cartilages each used a separate rigid carrier. The laryngeal assembly now shares a rigid carrier during head motion, including its intrinsic connective tissues. This is a head-motion approximation; swallowing and laryngeal articulation are not implemented.
- Pectoralis-major extension was concentrated in the outer 12% of the mesh. Replace this with distributed fibre-fan insertion displacement, with the thoracic/clavicular origin retained and insertion orientation blended at the terminal end. At the reported left-arm pose, the largest triangle-edge length ratios decreased from 15.68/10.49/11.05 to 2.47/1.74/1.96 for abdominal/clavicular/sternocostal parts. These are mesh distortion measurements, not physiological muscle-strain claims. A regression gate detects ratios over 3 for both sides.
- The axillary cable envelope assigned more humeral rotation proximally than distally. It now shares the parent vessel's continuous proximal-to-distal field, reducing disagreements between adjacent named segments.

## Validation and limits

Actual atlas mesh tests cover the reported poses, wrist attachment, laryngeal shape preservation, neutral reset, muscle edge stretch, branch field continuity and existing lower-limb behavior. Offline before/after mesh renders supplement the tests. The browser environment did not provide WebGL, so these are not browser screenshots.

This fixes identified animation defects. It does not establish physiological muscle volume, wrapping/contact, universal vascular continuity or patient-specific ranges of motion. Extreme shoulder combinations still require anatomy review and a contact-aware muscle model.
