# Cervical continuity update

The original common carotid and internal carotid meshes have an approximately 6 cm gap even at rest. Eight replacement meshes include common, internal and external carotids and internal jugular veins on both sides. A continuous landmark displacement field registers their endpoints to the atlas; all branches share one cervical motion field. Original short meshes are replaced only after the supplement loads, and remain available in exploded views.

Source: https://github.com/nqwrc/3d-anatomy at 8ca3b7421bcfbe88b85859eb1983d5cf79f21749, cardiovascular.glb. Z-Anatomy, CC BY-SA 4.0, derived from BodyParts3D, The Database Center for Life Science, CC BY-SA 2.1 Japan. Adapted mesh data is CC BY-SA 4.0; see public/models/joints-LICENSE.txt. Extraction and landmark registration scripts are included.

Suprahyoid and infrahyoid bindings now interpolate between the hyoid and their skull, mandibular or lower-neck attachment regions. Axillary cables use dual quaternion interpolation to reduce blend collapse. Hidden tissue deformation is skipped and newly shown tissue is updated immediately.

Validation: TypeScript, atlas/focus audits, actual-mesh motion suite, production build, and offline neutral/combined-head-pose render. Nine head poses keep all four carotid bifurcation pairs within 2 mm (observed maximum 1.027 mm), with exact neutral reset and layer visibility checks. These checks do not establish continuity at every distal branch or physiological muscle behavior. Browser WebGL visual validation was unavailable in this environment.

Remaining: shoulder muscle attachment and shape quality at extreme combined poses, the reported unidentified white upper-limb fragment, and comprehensive vascular junction validation. This release is a concrete continuity improvement, not a completed physiological simulation.
