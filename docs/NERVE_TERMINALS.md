# Digital nerve alignment and cranial motion correction

Replaced the previous single-axis hand compression with five-digit, three-dimensional registration. Source terminal landmarks were measured from the decoded legacy digital nerve branches; each target is derived from its corresponding atlas distal phalanx with a small soft-tissue allowance. A shared inverse-distance displacement field tapers to zero at the proximal palm. Adjacent nerve segments use the same field and no source branches are deleted.

Selected facial/trigeminal peripheral branches now follow the skull frame, including low facial branches that previously inherited cervical deformation based on height. Neck nerves retain their neck weights. Normal scalp and facial sensory branches are not shortened merely because skin is hidden.

Validation: all ten digit landmark correspondences are within 1 micrometre numerically, proximal palm/wrist vertices remain unchanged, both upper-limb and body regressions pass, and decoded cranial branches match the skull transform. Actual-mesh hand projections were inspected before/after. TypeScript and production build pass. Browser/device visual validation remains unavailable.

This aligns two different atlas models; it is not a measured individual human nerve-length model. Bone-derived targets are approximate soft-tissue landmarks. Skin clipping and distal histological arborization are not simulated.
