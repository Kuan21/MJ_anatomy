/** Which Z-Anatomy joint nodes the atlas draws, and what each one is. No imports on purpose: scripts/prepare-search-index.mjs uses the same rule, so search lists only tissues that are drawn. */
export type JointKind='fibrocartilage'|'capsule'|'ligament'|'membrane'|'fat pad';
// Z-Anatomy includes capsules and ligaments, not a complete hyaline-cartilage segmentation. Never relabel those structures as articular cartilage.
export function jointKind(name:string):JointKind{
 const n=name.toLowerCase();
 return /labrum|meniscus|articular disc|interpubic disc|symphysis/.test(n)?'fibrocartilage':/capsul/.test(n)?'capsule':/membrane/.test(n)?'membrane':/fat pad/.test(n)?'fat pad':'ligament';
}
export function includeJoint(name:string){
 const n=name.toLowerCase();
 // Left out: triradiate cartilage (developmental anatomy, not an adult atlas), the intervertebral discs with their nuclei pulposi and the interosseous
 // membranes of forearm and leg (the main atlas draws all of these already, so they would only be duplicates).
 // The fibular collateral ligament of this file is a 240-vertex prism: the tendon batch draws it as a rounded cord between measured attachment points (scripts/paokao-structures/ligaments-lower-limb.mjs).
 if(/triradiate|intervertebral disc|nucleus pulposus|interosseous membrane|^fibular collateral ligament/.test(n))return false;
 // Drawn: ligaments, capsules, labra, menisci, articular discs, the intercostal, obturator and quadrangular membranes, the pubic and sacrococcygeal symphyses and the infrapatellar fat pad.
 return /ligament|capsul|labrum|meniscus|articular disc|interpubic disc|frenula|membrane|fat pad|symphysis/.test(n);
}
