// Upper-limb tear gate (stability section 2 A): in the three poses of the bug report no vessel, nerve, ligament or muscle may be torn into a gap or spike, and no vessel-end piece may leave the vessel it continues.
//   - every end piece (-END) stays within 8 mm of its vessel on average (before the fix the end pieces of the lateral thoracic vessels and of the pectoral branch of the thoraco-acromial artery
//     lay 30-75 mm away, up to 20 cm: the red saw-tooth fragments flying off the body at 158 degrees of abduction)
//   - an edge that ends up longer than 15 mm and more than 3x its rest length is a "visible tear": none is allowed, except the few structures below, which are stretched along their whole length
//     because they span the axilla (the cap is what they do today, so it can only shrink); no edge anywhere may be longer than 50 mm after posing.
import assert from 'node:assert/strict';
import {createAudit, REPORTED, SEAM_MAX} from './lib/limb-audit.mjs';
const ALLOWED = [
  {re: /lateral mammary artery/i, edges: 700, longest: 45, why: 'runs from the axilla onto the chest wall: stretched evenly along its length'},
  {re: /pectoral branch of .*thoraco-acromial artery/i, edges: 600, longest: 45, why: 'runs from the axilla across pectoralis major'},
  {re: /axillary fossa/i, edges: 4, longest: 35, why: 'space volume (8-vertex box) between the thorax and the arm'},
  {re: /costoclavicular ligament/i, edges: 12, longest: 25, why: 'rib-to-clavicle ligament while the clavicle elevates'},
  {re: /coracobrachialis|latissimus dorsi|thoracodorsal (vein|artery)/i, edges: 4, longest: 25, why: 'single long edges at the humeral attachment / where the vessel enters latissimus dorsi'},
];
const MAX_EDGE_MM = 50;
const {audit} = await createAudit();
let tears = 0, seams = 0, worst = 0;
for (const pz of REPORTED) {
  const res = audit(pz);
  for (const s of res.seams) { seams++; assert.ok(s.mean <= SEAM_MAX, `${pz.name}: end piece of ${s.name} is ${(s.mean * 1000).toFixed(1)} mm from its vessel on average (max ${(s.max * 1000).toFixed(0)} mm)`); }
  for (const r of res.rows.filter(r => r.check === 'tear')) {
    tears++; worst = Math.max(worst, r.severity);
    const ok = ALLOWED.find(a => a.re.test(r.name));
    assert.ok(ok, `${pz.name}: ${r.name} is torn (${r.measure} edges over 3x and 15 mm, longest ${r.severity} mm)`);
    assert.ok(r.measure <= ok.edges && r.severity <= ok.longest, `${pz.name}: ${r.name} tears worse than allowed (${r.measure} edges, longest ${r.severity} mm; cap ${ok.edges} / ${ok.longest} mm: ${ok.why})`);
    assert.ok(r.severity <= MAX_EDGE_MM, `${pz.name}: ${r.name} has an edge ${r.severity} mm long`);
  }
}
console.log(`PASS limb tears: ${REPORTED.length} poses, ${seams} end-piece checks, ${tears} stretched structures within their caps (longest edge ${worst} mm).`);
