# Heart detail model

The heart, valves (with chordae tendineae), papillary muscles, coronary arteries, cardiac veins and adjoining great vessels in `heart-detail.json.gz` are taken from the Z-Anatomy cardiovascular export published at [nqwrc/3d-anatomy](https://github.com/nqwrc/3d-anatomy) (commit `8ca3b7421bcfbe88b85859eb1983d5cf79f21749`, `public/models/cardiovascular.glb`, sha256 pinned in `scripts/heart-parts.json`).

Licence: the content is a derivative of BodyParts3D made by Z-Anatomy.

- "BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan"
- "Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0"

Derivative works must be distributed under the same licence; this adapted data remains CC BY-SA.

The same repository also bundles Kidney (lissiecowley, CC BY-NC 4.0), Anatomy of the Inner Ear (University of Dundee, CC BY-NC-SA 4.0) and Brainder / White matter (licence not stated). None of those pieces is used: only the 38 heart-related nodes listed in `scripts/heart-parts.json` are decoded.

Changes: the allow-listed nodes are decoded from Draco, welded, given smooth normals quantised to Int16 and packed into gzip packages; Chinese (Taiwan terminology) and English names and short descriptions were added. Geometry is otherwise unchanged. Educational visualisation only.
