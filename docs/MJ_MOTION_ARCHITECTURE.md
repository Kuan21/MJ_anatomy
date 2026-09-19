# MJ Anatomy — Upper-limb motion architecture (V1)

## Principle
The anatomical catalogue hierarchy and the movement hierarchy are intentionally separate.

Human Atlas / BodyParts3D remains the source of individually selectable anatomy. Motion is applied by an MJ kinematic layer that maps anatomical structures to joint transforms. This avoids using system/layer membership as a skeleton.

## First validated chain
Thorax → sternoclavicular frame → clavicle → acromioclavicular frame → scapula → glenohumeral frame → humerus → elbow frame → ulna → radioulnar frame → radius → hand.

## Motion targets
1. Shoulder flexion / extension
2. Shoulder abduction / adduction
3. Humeral internal / external rotation
4. Elbow flexion / extension
5. Forearm pronation / supination

## Anatomical requirements
- Shoulder elevation must not be represented as humeral rotation alone. The implementation must allow clavicular elevation and scapular upward rotation in addition to glenohumeral motion.
- Elbow flexion is defined around a humeral/forearm joint frame rather than a global XYZ axis.
- Pronation/supination must not rotate radius and ulna as one rigid forearm. The ulna is the reference while the radius rotates relative to it; the hand follows the distal radius.
- Joint limits are explicit and conservative until validated visually.
- Motion must be reversible without accumulating transform drift.

## Soft tissues
V1 validates bone kinematics first. Muscles, nerves and vessels must not be rigidly re-parented to arbitrary bone pivots.

Later motion support will use structure-specific attachment/anchor metadata:
- muscle: origin + insertion + optional intermediate path anchors
- nerve/vessel: ordered path anchors
- connective tissue: attachment regions

## Validation order
1. Bone-only motion
2. Origin/insertion markers
3. Muscle path following
4. Neurovascular path following
5. Region-by-region expansion

This file is an implementation contract: do not sacrifice anatomically coherent movement in order to make every soft-tissue mesh move immediately.
