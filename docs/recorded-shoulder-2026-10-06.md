# Recorded shoulder follow-up: partial repair

The owner's recording shows severe artifacts before elbow flexion. A replay
using approximately 32 degrees flexion, 162 abduction and 28 internal rotation
exposed extreme local mesh-edge extension in the raw tissue deformation.
This diagnostic is measured before the scene's surface guards; it is not a
measurement of physiological fibre strain or of the final rendered mesh.

Changes in this patch:

- Pectoralis minor uses its inferior-to-superior span for the rib-to-coracoid
  attachment blend, not its narrow medial-to-lateral span.
- Other scapular-profile muscles distribute the existing medial-to-lateral
  blend across their full span. Serratus anterior retains its separate mapping.
- A regression sweeps from neutral to the recorded shoulder pose and includes
  a combined elbow/forearm/wrist pose. Both sides are tested before surface
  correction. Existing continuity, reset and attachment tests remain required.

Pectoralis minor's peak raw edge ratio in this replay falls from about 7.0 to
1.79; rhomboid major from about 4.6 to 2.60. These are mesh diagnostics, not
acceptable biological stretch limits. The new guard is deliberately capable
of rejecting the old implementation, without loosening existing tests.

An experimental neurovascular carrier modification worsened other branches
and was discarded. The released neurovascular field is unchanged. Vessel
looping, full shoulder anatomy, fibre architecture, and real iPad appearance
are NOT certified repaired by this patch.

Attachment reference: University of Washington Radiology muscle atlas,
https://rad.washington.edu/muscle-atlas/pectoralis-minor/ . The coordinate-based
blend is an approximation and is not a replacement for measured attachments.
