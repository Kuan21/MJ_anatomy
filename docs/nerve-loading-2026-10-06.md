# Peripheral nerve loading repair

The reported screenshot shows one failed supplementary task and missing visible
peripheral nerves. It does not identify the failed network/decode operation.

The original scene-loading test returned an empty group for every GLB. It could
therefore pass while displaying no peripheral nerve meshes. The scene now loads
lossless position/index packages prepared from the original nervous.glb, with
world transforms baked once. Draco decoding happens at build time. Packages are
content addressed, cached, and individually retriable. Successful packages remain
installed if another package fails. Source names and ancestor labels are retained.

The expanded real-geometry integration test caught a second defect: the geometric
intracranial exclusion rule discarded named brachial plexus roots. Explicitly
bound peripheral nerves now bypass that heuristic. The test requires all 98
curated upper-limb source names exactly once in the assembled scene, and injects
a failed nerve package to test retention and retry. It still stubs GPU drawing.

This change does not repair neurovascular routing or physiological muscle motion.
Offline rendering of the actual posed serratus and arteries at 32/162/48 degrees
confirmed floating vascular curves and inadequate chest-wall conformity despite
the previous mesh-edge tests passing. Those tests are insufficient visual or
anatomical acceptance criteria. No further unvalidated motion adjustment is
included in this loading repair.
