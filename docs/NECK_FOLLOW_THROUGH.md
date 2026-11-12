# Neck follow-through correction

Scope: head/neck only. Leg kinematics and leg skin-weight equations are unchanged.

- Scene invalidation explicitly includes `bodyMotion`, independently of rigid part transforms.
- Cervical soft-tissue movement begins above the thoracic inlet rather than freezing all vertices below C7. The anterior transition reaches head movement lower than the posterior transition to accommodate the lower jaw.
- Sternocleidomastoid, splenius capitis, semispinalis capitis and longus capitis blend from their proximal frame to the skull; the chest-end origin of SCM stays fixed. Deep vertebral attachments retain the cervical field.
- Hyoid and laryngeal cartilage meshes use one blended rigid transform per structure instead of bending their surfaces. Strap muscles and trachea use the continuous anterior neck field.
- Head artery/vein bindings no longer rotate whole cervical tubes rigidly with the skull. Equal vascular/nerve rest points share the same continuous field (except explicitly cranial or vertebral attachments).

These are conservative visual attachment envelopes, not a validated musculoskeletal, airway, swallowing or nerve-strain simulation. They cannot guarantee absence of collision or reproduce individual anatomy. Source meshes may have pre-existing seams.

Attachment references consulted: OpenStax Anatomy and Physiology 2e, section 11.3 (https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back); SCM fascicular study (https://pubmed.ncbi.nlm.nih.gov/27807639/). The envelopes themselves are implementation approximations, not measurements from these sources.

Validation: actual atlas meshes in neutral, flexion, extension, both rotations, both lateral bends and a compound pose; finite vertices, moving SCM/trachea/hyoid/laryngeal cartilage, rigid throat shape, fixed origins, exact neutral, and existing lower-limb regression. Legacy nerve meshes tested separately. Browser preview was blocked by ERR_BLOCKED_BY_CLIENT; this is not browser/device QA.
