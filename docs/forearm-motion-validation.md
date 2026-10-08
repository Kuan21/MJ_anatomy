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
