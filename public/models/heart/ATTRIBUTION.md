# Heart detail model

The heart, semilunar valves, coronary arteries, cardiac veins and adjoining great vessels in `heart-detail.json.gz` are taken from the Z-Anatomy cardiovascular export published at [nqwrc/3d-anatomy](https://github.com/nqwrc/3d-anatomy) (commit `8ca3b7421bcfbe88b85859eb1983d5cf79f21749`, `public/models/cardiovascular.glb`, sha256 pinned in `scripts/heart-parts.json`).

The atrioventricular valve apparatus (the cusps of the bicuspid and tricuspid valves, the papillary muscles and the chordae tendineae) is rebuilt by this project: the source cusps and papillary muscles (Z-Anatomy, plus three pieces from BodyParts3D 4.0, CC BY 4.0, The Database Center for Life Science, the atlas this site already ships, moved by the mean offset of five structures present in both models) are used only as references for where each cusp lies along the annulus and where each papillary muscle is rooted; none of their geometry is shown. The aortic cusps are moved a few millimetres in the plane of the aortic orifice to sit on its centre. The superior and inferior venae cavae are Z-Anatomy pieces. The right marginal branch, the posterior interventricular branch, the diagonal branches, the small cardiac vein and the anterior cardiac veins are merged BodyParts3D 4.0 pieces moved by the same offset.

Made by this project (marked "MJ 補建" / "MJ schematic shell" on the cards; no third-party geometry): the three pericardial layers (offsets of the BodyParts3D heart walls, `scripts/prepare-serous.mjs`), the cusps, papillary muscles and chordae tendineae of the atrioventricular valves (`scripts/lib/heart-valves.mjs`: cusps hang from the annulus ring found in the Z-Anatomy chambers, columns rise from the wall, cords run from the papillary tips to the cusps), and the structures the sources lack — crista terminalis, pectinate muscles, interatrial septum, fossa ovalis, right and left auricles, interventricular septum, trabeculae carneae, septomarginal trabecula, supraventricular crest, conus arteriosus, aortic vestibule, sinoatrial nodal artery, left marginal branch and the transverse and oblique pericardial sinuses. They are built on the Z-Anatomy chambers from textbook anatomy by `scripts/lib/heart-mj.mjs`; positions and shapes are schematic.

Licence: the content is a derivative of BodyParts3D made by Z-Anatomy.

- "BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan"
- "Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0"

Derivative works must be distributed under the same licence; this adapted data remains CC BY-SA.

The same repository also bundles Kidney (lissiecowley, CC BY-NC 4.0), Anatomy of the Inner Ear (University of Dundee, CC BY-NC-SA 4.0) and Brainder / White matter (licence not stated). None of those pieces is used: only the 38 heart-related nodes listed in `scripts/heart-parts.json` are decoded.

Changes: the allow-listed nodes are decoded from Draco, welded, given smooth normals quantised to Int16 and packed into gzip packages; Chinese (Taiwan terminology) and English names and short descriptions were added. Geometry is otherwise unchanged. Educational visualisation only.
