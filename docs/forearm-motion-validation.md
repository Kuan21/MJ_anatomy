# Forearm and pectoral follower correction

Scope: 48 bilateral forearm muscle meshes, the two lateral pectoral nerve
objects, and the two pectoral branches of the thoraco-acromial arteries.
Other nerves and vessels retain their existing solvers; this change is not
a claim that all anatomy or all extreme poses have been corrected.

Forearm muscles now have bone-specific carriers rather than the generic
neurovascular field. Bone-to-bone muscles do not inherit wrist movement.
Longitudinal muscle sections redistribute extension along their route;
digital tendon collars transition smoothly to the rigid hand transform.
Short/transverse pronator quadratus, supinator and anconeus use their own
bone-weight fields rather than a longitudinal fibre guide.

Pectoral terminal branches follow the existing sternocostal muscle fan.
Their proximal collars retain the shared neurovascular field. Source
topology distinguishes disconnected chest twigs from the proximal plexus
component, preventing each twig from being incorrectly dragged toward an
independent proximal attachment. Source hashes guard the fitted data.

Reproduce the fitted data after preparing source streams:

```
node scripts/prepare-draco.mjs
node scripts/prepare-nerve-stream.mjs
node scripts/prepare-model-stream.mjs
node scripts/fit-pectoral-followers.mjs
npm run check
npm run check:motion
npm run build -- --base /MJ_anatomy/
```

The new regression uses 28 bilateral compound poses (elbow 0/70/140 degrees,
forearm rotation -80/0/80, wrist flexion -70/0/70, plus a combined shoulder
pose). It checks finite geometry, coincident seams, source hashes, neutral
reset, wrist isolation, digital tendon attachments, and pectoral parent/host
collars. A mesh-edge stretch bound detects spikes; it is not a physiological
strain limit. These are geometric educational approximations, not a
force-based simulation or clinical/anatomical validation. CPU scene tests
stub GPU drawing and cannot substitute for an iPhone/iPad WebGL review.

## Follow-up: bent muscle sections

Section calibre now uses the redistributed route's arc length, not the chord
across a bent section. Curvature alone must not introduce false compression
and local inflation. Upper-arm biceps/triceps/brachialis sections also swing
towards the route tangent while retaining the carrier's axial twist and
attachment collars. This swing is intentionally not applied to forearm
multi-tendon meshes: it failed their existing spike regression.

`test-muscle-sections.mjs` independently prescribes a curved route, measures
middle-section radius and perpendicularity, and checks 108 real upper-arm
muscle/pose combinations. It includes the reported elbow 140°, pronation 80°,
wrist flexion -23° and ulnar deviation 19°; shoulder angles are swept because
they were not visible in the user's screenshot. This improves the geometric
solver but does not add muscle-to-muscle collision or clinical validation.

## Follow-up: wrist and forearm joint landmarks

Whole-shaft bounding-box centres placed the old wrist pivot posterior to the
actual distal radius/carpal contact. `fit-forearm-landmarks.mjs` fits radial
and ulnar head centres from source surface bands, and the wrist from equal
weight scaphoid/radius and lunate/radius nearest-contact patches. Both the
rigid motion builder and soft-tissue skeleton use the same fitted wrist.
These are approximate geometric landmarks, not clinical joint centres.

`test-forearm-joints.mjs` checks 72 bilateral combinations, including the
reported shoulder 74° flexion/147° abduction, elbow 140°, forearm -80°,
wrist 17°/-29°. It checks source proximity, rotation-axis invariance,
hand/radius wrist continuity and isolation of forearm bones from wrist-only
changes. Shoulder regression also includes this exact reported pose.

Shoulder volume projection now uses squared-gradient normalization and
fractional vertex mobility, rather than equal-length displacement for tiny
and large surface gradients. Attachments remain pinned. This is a numerical
stability correction, not a claim that all shoulder contours or nerve routes
are anatomically correct. Actual iPad/iPhone WebGL review is still required.

## Follow-up: axillary terminal nerves and shoulder folds

The bilateral superior lateral brachial cutaneous nerves and muscular branches
of the axillary nerves now retain their original proximal junction collars,
while terminal portions follow fixed, overlapping deltoid surface patches.
These patches transfer displacement from the completed shoulder solve, not a
different intermediate pose. They are computed in source space and never
reselected during movement. Missing host meshes retain the carrier fallback;
nerve-only visibility still evaluates the hidden deltoid hosts. No nerve mesh
is removed or shortened. Run `fit-deltoid-nerve-followers.mjs` after preparing
the original atlas/nerve streams to regenerate the source-hashed mapping.

A nearest-triangle normal-offset experiment was rejected because it produced
large nerve spikes at surface folds. The accepted smooth displacement field
is an approximation, not measured nerve sliding or an anatomical validation.
`test-deltoid-followers.mjs` covers 20 bilateral branch/pose combinations,
including raised shoulder and maximum elbow/forearm angles, checking exact
neutral, source identity, translation covariance, coincident seams, unchanged
axillary collars, a spike guard and separation from the solved deltoid.

Shoulder surfaces additionally resist adjacent triangles hinging into sharp
creases using compliant cross-edge diagonals. Existing volume, attachment,
clearance, seam and deterministic-reset checks remain unchanged (41 poses per
side). This is an incremental local correction; broad chest contours, other
nerve branches, muscle-to-muscle collision and device WebGL rendering are not
certified by these tests.
