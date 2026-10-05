# Shoulder movement follow-up

Reference supplied by the owner: https://www.instagram.com/reel/DeEuPVbqj7F/
Observed public video frames include labelled subscapularis and teres major,
deep shoulder layers, and a flexed elbow beside the trunk. This was a visual
reference, not a source of measured fibre architecture or physiological limits.
No video assets were copied into the application.

The shoulder solver previously assigned a world-Y longitudinal direction to
deltoid heads and world-X to all cuff-profile members. It now derives a bulk
longitudinal direction separately from each member's pinned attachment
centroids. Axial length and transverse thickness targets retain the existing
volume-preserving strain relation. This is still a geometric approximation,
not a fascicle or muscle-force simulation.

Testing the changed direction exposed a second problem: the final edge guard
could undo the volume preservation and flatten a muscle at high flexion.
Volume projection now alternates with that guard, while attachment mobility
stays zero and head-clearance projection remains last. No acceptance threshold
was loosened. The unchanged 40-pose tests for each side pass: maximum volume
error 0.11%, exact neutral reset, fixed attachments, shared seams and head
clearance. The mesh-edge diagnostic remains 3.11x; this is not physiological
fibre strain or anatomical validation. A new coordinate-rotation regression
checks that strain classification follows the attachments, not world axes.

Real iPad GPU appearance and frame rate remain unverified. Vessel and nerve
continuity tests check the existing geometric followers; this change does not
introduce a validated neurovascular sliding or elasticity model.
