# Serratus and posterior neurovascular follow-up

This is a targeted geometric repair, not a validated physiological simulation.

- Fit separate serratus rib and scapular candidate attachment patches from the
  source bone surfaces. Interpolate influence using distances along the welded
  muscle mesh rather than its world-Z coordinate. Hash-check the source positions
  before applying the baked weights. The offline fitter is reproducible with
  `node scripts/fit-serratus-attachments.mjs --write`; it does not run during loading.
- The insertion frame is explicitly scapular, not humeral. Existing humeral
  attachment datasets retain their previous default.
- Transfer posteromedial proximal neurovascular influence from the humeral to
  scapular carrier using a continuous spatial partition. Keep the same field
  across vessel/nerve names and object boundaries to preserve coincident junctions.
- Extend the recorded-posture regression to flexion 32, abduction 162, rotation
  48 degrees, both sides. Include both serratus muscles and all 162 curated
  upper-limb neurovascular meshes. Retain earlier pectoralis/rhomboid checks.

The 14-pose serratus checks have maximum raw mesh-edge ratios 2.765 (left) and
2.676 (right); the screenshot neurovascular check has maxima 3.770 and 3.675.
These ratios detect mesh spikes, **not** biological tissue strain. Shared-point
continuity tests cannot prove that separate source meshes have correct anatomical
connections in the first place.

Limitations: attachment patches are proximity-based candidates, not expert-labelled
insertions. This does not implement chest-wall collision/contact, a nerve sliding
solver, active serratus fibre mechanics, or validated vascular compliance. GPU/iPad
appearance and performance are not verified by these CPU regressions. No anatomy
is hidden, removed, or substituted to pass these tests.
