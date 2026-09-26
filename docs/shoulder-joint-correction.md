# Shoulder joint correction

The old runtime used the proximal endpoint of the entire humerus bounding box as its shoulder pivot. That point includes the lateral tuberosity and is not the articular head centre. Under the all-maximum control pose, the fitted head centre moved 58.7 mm relative to its scapular socket frame.

`fit-shoulder-landmarks.py` fits a sphere to the proximal medial humeral surface in the current BodyParts3D rest coordinate frame. This is a mesh-derived approximation, not an independently measured clinical landmark. The selected patches have approximately 1.4 mm radial RMS fit error. The runtime and soft-tissue rig use the same fitted centre. Its scapular-frame position is preserved at every pose. `test-soft-tissue.mjs` checks 150 combined poses, including elbow/forearm/wrist maxima.

The shoulder swing and wrist axes use conservative combined envelopes. Axial shoulder rotation is constrained in the displayed pose rather than silently scaled after displaying a different value. These are educational model constraints, not population ROM measurements or a validated collision solver.

The source atlas contains costal and laryngeal cartilage but no separately identified glenohumeral articular cartilage or glenoid labrum. Optional cyan/blue overlays use selected source bone triangles offset by 0.7 mm and are explicitly labelled estimated illustrations. They follow their parent humerus/scapula and respect visibility/focus. They are not measured cartilage thickness, segmented labrum, capsule, or a synovial-cavity reconstruction. They do not change kinematics.

Anatomical reference for the distinction between the humeral head, glenoid, cartilage and labrum: https://pmc.ncbi.nlm.nih.gov/articles/PMC6251069/ . No claim of physiological validation is made. Muscle collision and a specimen-specific joint-surface model remain outstanding.
