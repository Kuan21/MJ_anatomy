# BodyParts3D 3.0 supplement: structures missing from the 4.0 export

BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan.

These adapted data remain licensed under [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/). Do not relabel them with the 4.0 archive's CC BY 4.0 license.

Source: BodyParts3D 3.0 (release 20110915, 95% polygon-reduction OBJ archive) as converted to binary STL by [Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D) at commit `f0eeb6e843380cfe6b83797cf8c3e1af74de5e61`. Each of the 28 files is pinned by sha256 in `scripts/supplement-parts.json` and verified at build time. [Archive license](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html).

Structures: left and right latissimus dorsi, rectus abdominis, internal oblique, transversus abdominis, pyramidalis, quadratus lumborum, spinalis cervicis, multifidus, inguinal ligament, extensor digitorum brevis, temporoparietalis, depressor septi nasi; the right longus colli parts; aponeurosis of epicranius. They exist in the 3.0 release but were not exported to the 4.0 atlas the viewer is built from.

Changes: vertices welded; similarity-registered to the 4.0 coordinate frame (scale 1.0594, millimetres/Z-up to metres/Y-up) plus a smooth displacement field fitted on 270 bones that both releases contain, because the two releases are not one rigid body (the similarity alone is 12 mm off at the ribs and 30 mm off at the feet; held-out error with the field: median 1.3 mm, 90th percentile 5.6 mm); simplified with meshoptimizer quadric simplification to at most 16,000 triangles per piece (relative error < 0.1%); normals recomputed and quantized to Int16; indexed binary packaging in gzip packages. Registration is for educational visualization, not patient-specific measurement or specialist validation.

Lung lobes (FMA7333, FMA7383, FMA7337, FMA7370, FMA7371) get extra processing, still derived only from the BodyParts3D 3.0 meshes (no other source): Taubin smoothing at full resolution (30 iterations, lambda 0.5, mu -0.53) before simplification to 24,000 triangles per lobe, a smoothed fissure carving, a light second smoothing pass and angle-weighted normals (`scripts/lib/lung-mesh.mjs`, `scripts/lib/lung-fissures.mjs`). The parietal pleura is a watertight envelope of the closed lung offset by 5 mm (`scripts/lib/lung-envelope.mjs`). Nothing was drawn or added by hand.
