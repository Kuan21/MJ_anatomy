# Anatomy data attribution

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

- License: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html (updated 2025-02-27)
- Dataset: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- License terms: https://creativecommons.org/licenses/by/4.0/
- Source geometry: `isa_BP3D_4.0_obj_99.zip`, BodyParts3D 4.0.
- English names and relationships: IS-A and PART-OF concept, element, and inclusion tables from the same archive.
- Publication: Mitsuhashi et al. (2009), BodyParts3D: 3D structure database for anatomical concepts. https://doi.org/10.1093/nar/gkn613

Adaptations: axes and units converted from millimeters/Z-up to meters/Y-up; translated to rest at the stage; geometry simplified using meshoptimizer with 0.2% relative error limit per structure; normals quantized to signed 16-bit; packed into binary chunks; curated display system groupings and colors. The source contains 2,234 individual OBJ meshes; all remain represented. The combined hierarchy contains 3,432 named FMA concepts, which may reference multiple meshes. Original source identity is preserved in the manifest.

Source OBJ comments mention an older CC BY-SA 2.1 Japan license. The official current database license linked above supersedes that legacy text and explicitly permits redistribution and adaptation under CC BY 4.0.

BodyParts3D represents an adult male reference anatomy based on TARO MRI and anatomical illustration refinements. It is not a complete model of every possible human anatomical structure or variation. This interface is educational and is not a clinical tool.

## Female reproductive organs and serous membranes

The sex switch under Organs → Reproductive shows 33 female pelvic structures (ovaries, uterine tubes, uterus and its ligaments, vagina, uterine arteries and veins). They come from Kristen Browne and Heidi Schlehlein, Human Reference Atlas / HuBMAP, *3D Reference Organ Set for Female v1.5* (2023), CC BY 4.0, DOI https://doi.org/10.48539/HBM352.BTSQ.586. Only these 33 meshes are kept (`scripts/data/hra-female-pelvis.json.gz`, extracted once by `scripts/extract-hra-female.mjs`); they are scaled and moved onto the BodyParts3D pelvis by `scripts/prepare-female.mjs`. The pelvic bones, muscles and perineum remain the BodyParts3D male model, so the female organs sit in a male pelvis; this is a known limitation.

The pleura and pericardium layers are schematic shells written by this project (`scripts/prepare-serous.mjs`): each is an offset of the lung lobe or heart wall surface, not a measured structure. The five lung lobes are BodyParts3D 3.0 meshes (CC BY-SA 2.1 Japan, FMA7333, FMA7383, FMA7337, FMA7370, FMA7371).

## Historical assets (not included in the current release)

Earlier repository revisions included female reference anatomy: Kristen Browne and Heidi Schlehlein, Human Reference Atlas / HuBMAP, *3D Reference Organ Set for Female v1.5* (2023). CC BY 4.0. Geometry adapted for this viewer.

- Source DOI: https://doi.org/10.48539/HBM352.BTSQ.586
- Dataset: https://lod.humanatlas.io/ref-organ/united-female/v1.5
- Original GLB: https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb
- License: https://creativecommons.org/licenses/by/4.0/

Adaptations: translated native meter/Y-up coordinates onto the stage, coincident vertices welded and source normals averaged, geometry simplified with a 0.2% per-structure relative error bound, and normals quantized. Colors and display systems are curated for this interface. All 888 source meshes are represented, with 1,073 source nodes available as selectable individual or compound concepts.

This is a reference assembly with whole-body surface and selected organs, including female reproductive anatomy. Its skeleton and muscle coverage is partial. It is not a complete model of every human structure or a single-person scan. Eight placenta/umbilical structures are classified under Pregnancy reference and hidden by default.

Separately licensed additions (BodyParts3D 3.0, CC BY-SA 2.1 Japan, not the 4.0 CC BY terms above): the 47 facial/masticatory muscles (`models/facial/ATTRIBUTION.md`) and 28 structures that the 4.0 export omitted, such as latissimus dorsi and rectus abdominis (`models/supplement/ATTRIBUTION.md`).

## Schematic nerve and vein models (generated for this atlas)

Six structures of the suboccipital and posterior cervical region have no three-dimensional model in BodyParts3D or in the Z-Anatomy export (checked against [LluisV/Z-Anatomy](https://github.com/LluisV/Z-Anatomy) commit `6c7f9016bd5899ac8edafd31b9900c151df42ed6`, CC BY-SA 4.0: `NervousSystem100.fbx`, `CardioVascular41.fbx`, `MuscularSystem100.fbx` and the 1.0 export list contain only the grouping nodes "Cervical plexus" and "Cervical nerves", the "Occipital artery" and "Occipital vein", and no dorsal ramus, occipital, great auricular or suboccipital venous plexus mesh): suboccipital nerve (C1 dorsal ramus), greater occipital nerve (C2), third occipital nerve (C3), lesser occipital nerve, great auricular nerve and suboccipital venous plexus.

They are simplified tube models written by this project (`scripts/lib/nerve-schematics.mjs`): each tube follows the textbook course through landmarks measured on the BodyParts3D atlas meshes (atlas, axis, occipital bone, sternocleidomastoid, suboccipital muscles). They contain no third-party geometry. Calibre, curvature and branching are for orientation only, and every information card is marked 示意模型 (schematic model). The vertebral artery (BodyParts3D) lies 4.4–5.4 mm from the posterior arch of the atlas on both sides (`vertebralArteryReport`), i.e. beside C1 as expected.

## Brain detail mode: cut surfaces and CSF flow (generated for this atlas)

The brain detail mode (`#/organ/brain`) draws the Brain Project model (Z-Anatomy / BodyParts3D, CC BY-SA 4.0, see above) without changes. Two things in it are written by this project and contain no third-party geometry: (1) the solid cut surfaces of a section, built in the browser by rasterising the model's surfaces into a 1.2 mm voxel grid, filling each organ between its own surfaces and labelling tissue by distance to the cortical surface (the 2.4 mm grey-matter rim is schematic, not a measurement); (2) the CSF flow animation, whose ventricles, choroid plexus and superior sagittal sinus are the model's own meshes, while the foramina, apertures, cisterns, subarachnoid space, spinal cord, central canal, lumbar cistern, cauda equina and arachnoid granulations are simplified schematic shapes (the spinal part is shortened and not to scale). Both are marked as schematic in the interface.
