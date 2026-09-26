# Joint anatomy supplement

The former atlas had very little joint connective tissue. Two tensor fasciae
latae muscles were incorrectly classified as connective tissue and as upper
limbs, leaving two green objects behind during arm motion. They now belong to
lower-limb muscles and have lower-limb motion bindings.

## Data and presentation

Source: nqwrc/3d-anatomy, revision
`8ca3b7421bcfbe88b85859eb1983d5cf79f21749`, derived from Z-Anatomy and
BodyParts3D. Attribution and licenses are in `public/models/joints-LICENSE.txt`
and the site's Source panel. Adapted mesh data remains CC BY-SA 4.0.

- 285 named supplementary joint structures: 25 fibrocartilage structures,
  34 capsules and 226 ligament-category structures.
- 178 bone-associated surface patches derived from the source skeletal GLB's
  **Cartilage material**, covering the major limb joints, digits and parts of
  the craniovertebral/vertebral articulations.
- Existing atlas intervertebral discs, costal and other standalone cartilages
  remain owned by the existing atlas; they are not duplicated. Developmental
  triradiate cartilage is excluded from this adult model.
- All additions follow Connective tissue visibility and regional focus. The
  common motion panel in all four regions has an articular-surface toggle.
  Capsules are translucent; fibrocartilage and bone surface patches are blue.
- Isolate and exploded layouts suppress the supplement. Supplementary objects
  are not yet independently searchable/selectable in the structure inspector.

## Registration and movement

The source skeleton and target atlas are different geometries. Corresponding
named bones are similarity-registered with fixed bone-length scale and trimmed
ICP. Source cartilage material labels are transferred to target bone triangles;
these triangles are offset by **0.35 mm for display**, not measured thickness.
Target bone geometry defines placement, avoiding detached overlay surfaces.
Source joint tissues use the same bone registration field. Glenoid/acetabular
rims attach rigidly to their socket bone and menisci to the tibia. Other tissues
use the existing educational dual-quaternion attachment fields.

Reproduce the geometry with Python/numpy/scipy and the repository's Node tools:

1. Clone the pinned source into `.sites-runtime/joint-source`.
2. Run `node scripts/prepare-draco.mjs`.
3. Run `node scripts/decode-joint-source.mjs`.
4. Run `python scripts/register-joint-anatomy.py`.

The compressed, generated surface data is committed. Builds expand it locally
and download/hash-check the pinned joints GLB. No runtime third-party CDN is
needed. Bone registration residuals are recorded in joint-registration.json.

## Verification and remaining limits

Checks exercise the real GLB meshes, both shoulder socket attachments, all four
body-motion rigs, exact neutral reset and layer/isolate/explosion suppression.
The existing motion suite now uses the same system normalization as the UI.
Offline geometry views were inspected for shoulder, wrist, hip and knee; source
registration substantially reduced visible hip/knee misalignment. This is not
an anatomical validation of every imported ligament attachment.

These are reference surfaces and educational attachments, not a complete
cartilage segmentation or a physiological motion solver. The existing joint
angle envelopes remain unchanged. There is no ligament-strain constraint,
contact/collision solver, meniscal sliding, wrist intercarpal kinematics or full
finger/toe articulation. Muscle deformation at extreme combined angles is not
certified as realistic. Do not infer individual human ROM from these meshes.
Middle-ear articulations and source/target structures without reliable named
correspondence are not supplemented. The implementation does not claim every
human joint is complete.
