// Fine bony features of the skull and the sixth cervical vertebra, marked on the bone surface where they lie (no floating models): the foramina, canals, fissures, processes, fossae and lines of
// the head and neck bones. Each one is a thin patch lifted 0.4 mm off the bone it belongs to, so it can be searched, picked and quizzed, and it rides the skull with the head rig.
//
// How the positions were found (the BodyParts3D skull is a coarse mesh, so some openings are only pits or are not modelled at all):
//   - openings that are real through-holes of the mesh were found by casting rays along the hole (foramen ovale, foramen rotundum, superior orbital fissure, foramen magnum, foramen lacerum);
//   - openings that other atlas structures pass through were put where that structure meets the bone (optic canal, inferior orbital fissure, supraorbital and infraorbital foramen: the
//     same centres the eye detail view uses; carotid canal: where the internal carotid artery meets the petrous bone; external acoustic meatus: the porus of the ear model);
//   - small pits of the mesh were used where they sit at the textbook position (mental, mandibular, sphenopalatine, greater and lesser palatine foramina);
//   - the rest (foramen spinosum, pterygoid canal, stylomastoid foramen, petrotympanic fissure, internal acoustic meatus, hypoglossal canal, the infratemporal crest and the
//     boundaries between the wings and body of the sphenoid) were placed from the textbook relation to those measured points and are approximate.
// Every patch is built by scripts/paokao-structures/*.mjs the same way as landmarks.mjs; scripts/check-schematic-models.mjs checks that each patch lies on its bone.
import {sub, add, mul, len} from '../lib/paokao-util.mjs';

const SIDES = [{w: 'Right', zh: '右', sx: -1}, {w: 'Left', zh: '左', sx: 1}];
const MM = .001, P = (x, y, z) => [x * MM, y * MM, z * MM], m = v => v * 1000;

export default function headBoneLandmarks(U) {
  const out = [];
  const bone = (name) => name;
  /** One structure: a patch (or several, one per bone) with its bilingual card. `parts` = [{bone, geometry}] ; the first part carries the structure, the others are siblings (same name, same card, own bone). */
  const mark = (name, zh, parts, [bonePhrase, boneZh], [descEn, descZh], [relEn, relZh]) => {
    parts.forEach((p, i) => {
      if (!p.geometry.indices.length) throw new Error(`head-bone landmark ${name}: empty patch on ${p.bone}`);
      const geometry = largest(p.geometry);
      out.push({name, zh, system: 'skeletal', kind: 'landmark', parent: p.bone, geometry: [geometry], cap: geometry.indices.length / 3 > 3000 ? 1500 : undefined, ...(i ? {sibling: true} : {}),
        card: {origin: [bonePhrase, boneZh], course: [descEn, descZh], supply: [relEn, relZh]}, refs: []});
    });
  };
  const sided = (S, en, zh) => [`${S.w} ${en}`, `${S.zh}${zh}`];
  /** Disc of surface around a point (the point is moved onto the bone first when it is not on it). */
  const disc = (b, c, r) => U.surfacePatch(b, U.onSurface(b, c, 0), r, .0004);
  /** Surface within r of a polyline (a canal axis, a ridge, a line). */
  const along = (b, pts, r, off = .0004) => U.patchWhere(b, U.nearPolyline(pts, r), off, U.nearPolyline(pts, r + .004), Math.max(.0007, r / 5));
  /** Surface where a predicate on the centre of the triangle (millimetres) holds, with a refined outline. */
  const where = (b, keep, near) => U.patchWhere(b, tr => keep(tr.mid.map(m)), .0004, p => near(p.map(m)), .0012);
  const surf = (b, p) => U.onSurface(b, p, 0);
  /** Keep only the largest connected piece of a patch (a stray sliver of the outline would count as a detached fragment). */
  const largest = g => {
    const n = g.positions.length / 3, par = Int32Array.from({length: n}, (_, i) => i), find = i => { while (par[i] !== i) i = par[i] = par[par[i]]; return i; };
    for (let t = 0; t < g.indices.length; t += 3) { par[find(g.indices[t])] = find(g.indices[t + 1]); par[find(g.indices[t + 1])] = find(g.indices[t + 2]); }
    const cnt = new Map(); for (let t = 0; t < g.indices.length; t += 3) { const r = find(g.indices[t]); cnt.set(r, (cnt.get(r) ?? 0) + 1); }
    let best = -1, bc = -1; for (const [r, c] of cnt) if (c > bc) { bc = c; best = r; }
    const map = new Map(), pos = [], idx = [];
    for (let t = 0; t < g.indices.length; t += 3) if (find(g.indices[t]) === best) for (let k = 0; k < 3; k++) { const v = g.indices[t + k]; if (!map.has(v)) { map.set(v, pos.length / 3); pos.push(g.positions[v * 3], g.positions[v * 3 + 1], g.positions[v * 3 + 2]); } idx.push(map.get(v)); }
    return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
  };
  /** True when the point (millimetres) is within r (mm) of any of the polylines (each a list of points in metres). */
  const nearAny = (lines, r) => { const f = lines.map(l => U.nearPolyline(l, r * MM)); return p => f.some(g => g(p.map(v => v * MM))); };

  // ================= Mandible (one mesh; sides told apart by x)
  const MAND = 'Mandible';
  const mental = {1: P(21.2, 1514.4, 57.9), '-1': P(-22.2, 1514.4, 57.5)}, mandFor = {1: P(37.0, 1545.5, 11.0), '-1': P(-38.1, 1545.3, 12.0)};
  // the angle: the lowest-back corner of each ramus
  const angle = S => U.extreme(MAND, P(0, -1, -.9), {x: S.sx > 0 ? [.020, .065] : [-.065, -.020], z: [-.015, .030]});
  for (const S of SIDES) {
    const side = x => S.sx * x > 18;
    mark(...sided(S, 'mental foramen', '頦孔'), [{bone: MAND, geometry: disc(MAND, mental[S.sx], .0035)}], ['On the mandible', '下頜骨'],
      ['Opening on the outer surface of the body of the mandible below the second premolar, about halfway between the upper and lower borders; the mandibular canal ends here', '位於下頜體外側面、第二小臼齒下方，約在上、下緣之間；下頜管在此終止'],
      ['Transmits the mental nerve and vessels, the terminal branches of the inferior alveolar nerve and artery', '通過頦神經與頦血管（下牙槽神經與動脈的終末分支）']);
    mark(...sided(S, 'mandibular foramen', '下頜孔'), [{bone: MAND, geometry: disc(MAND, mandFor[S.sx], .0035)}], ['On the mandible', '下頜骨'],
      ['Opening on the inner surface of the ramus, about halfway between its front and back borders; it leads into the mandibular canal and is partly covered by a small flap, the lingula', '位於下頜枝內側面、約在前後緣中間的開口，通往下頜管；前方有一小片骨瓣（下頜小舌）遮蓋'],
      ['The inferior alveolar nerve and vessels enter here; the sphenomandibular ligament attaches to the lingula', '下牙槽神經與血管由此進入；蝶下頜韌帶附著於下頜小舌']);
    const A = angle(S), mfLine = [surf(MAND, mandFor[S.sx])], nearMF = nearAny([mfLine], 9.8);
    mark(...sided(S, 'angle of mandible', '下頜角'), [{bone: MAND, geometry: U.patchWhere(MAND, tr => side(m(tr.mid[0])) && len(sub(tr.mid, A)) < .011, .0004, p => len(sub(p, A)) < .015, .0012)}], ['On the mandible', '下頜骨'],
      ['The rounded corner where the lower border of the body meets the back border of the ramus; it is more open in the adult than in the child and the old', '下頜體下緣與下頜枝後緣相接的圓角；成人的角度比幼兒與老人更接近直角'],
      ['Insertion of the masseter on the outside and of the medial pterygoid on the inside; the stylomandibular ligament attaches near it', '外側為咬肌止點，內側為內翼肌止點；莖突下頜韌帶附著於其附近']);
    mark(...sided(S, 'ramus of mandible', '下頜枝'), [{bone: MAND, geometry: where(MAND, ([x, y, z]) => side(x) && y < 1561 && ((z - 13) / 15) ** 2 + ((y - 1544) / 15.5) ** 2 < 1 + .30 * Math.sin(z * .75 + y * .5) + .15 * Math.sin(z * .31 - y * .67) && len(sub(P(x, y, z), A)) > .0175 && !nearMF([x, y, z]), ([x, y, z]) => side(x) && y < 1566 && ((z - 13) / 19) ** 2 + ((y - 1544) / 19) ** 2 < 1.6)}], ['On the mandible', '下頜骨'],
      ['The broad, nearly vertical plate that rises from the back of the body of the mandible; it carries the coronoid process in front and the condylar process behind, with the mandibular notch between them', '由下頜體後端向上升起、近乎垂直的寬板；前方連冠狀突，後方連髁突，兩者之間為下頜切跡'],
      ['Insertion of the masseter on its outer surface and of the medial pterygoid on its inner surface; the mandibular foramen opens on the inside', '外側面為咬肌止點，內側面為內翼肌止點；內側有下頜孔開口']);
    mark(...sided(S, 'coronoid process of mandible', '下頜骨冠狀突'), [{bone: MAND, geometry: where(MAND, ([x, y, z]) => side(x) && y > 1563 && z > 22.5, ([x, y, z]) => side(x) && y > 1558 && z > 17)}], ['On the mandible', '下頜骨'],
      ['Thin, triangular plate that projects upward from the front of the ramus, in front of the mandibular notch', '由下頜枝前部向上突出的薄三角形骨板，位於下頜切跡前方'],
      ['Insertion of the temporalis, which also reaches down the front border of the ramus', '顳肌止點，肌腱並沿下頜枝前緣向下延伸']);
    mark(...sided(S, 'condylar process of mandible', '下頜骨髁突'), [{bone: MAND, geometry: where(MAND, ([x, y, z]) => side(x) && y > 1566 && z <= 20.5, ([x, y, z]) => side(x) && y > 1561 && z < 26)}], ['On the mandible', '下頜骨'],
      ['The upward projection at the back of the ramus: a narrow neck topped by a smooth head that fits into the mandibular fossa of the temporal bone', '下頜枝後部向上的突起：細窄的頸部上方為光滑的髁頭，嵌入顳骨的下頜窩'],
      ['The head forms the temporomandibular joint; the lateral pterygoid inserts into a pit on the front of the neck', '髁頭構成顳顎關節；外翼肌止於頸部前面的小凹']);
  }

  // ================= Frontal bone: supraorbital foramen
  for (const S of SIDES) {
    mark(...sided(S, 'supraorbital foramen', '眶上孔'), [{bone: 'Frontal bone', geometry: disc('Frontal bone', P(S.sx * 26.6, 1621.5, 69.8), .0035)}], ['On the frontal bone', '額骨'],
      ['Opening in the upper margin of the orbit, a little more than 2 cm from the midline and on the same vertical line as the infraorbital foramen; in many skulls it is an open notch instead of a closed foramen', '位於眼眶上緣、距正中線略多於 2 公分處，與眶下孔大致在同一條垂直線上；不少顱骨上它是切跡而不是閉合的孔'],
      ['Transmits the supraorbital nerve and vessels, which turn up onto the forehead', '通過眶上神經與眶上血管，向上到前額']);
  }

  // ================= Maxilla: infraorbital foramen, pterygomaxillary fissure
  for (const S of SIDES) {
    const mx = `${S.w} maxilla`;
    mark(...sided(S, 'infraorbital foramen', '眶下孔'), [{bone: mx, geometry: disc(mx, P(S.sx * 26.2, 1568.2, 60.7), .0035)}], ['On the maxilla', '上頜骨'],
      ['Opening on the front of the maxilla about 1 cm below the infraorbital margin; it is the front end of the infraorbital canal', '位於上頜骨前面、眶下緣下方約 1 公分處的開口，是眶下管的前端出口'],
      ['Transmits the infraorbital nerve and vessels onto the face', '眶下神經與眶下血管由此出到面部']);
    const pmf = [P(S.sx * 28, 1586, 29.5), P(S.sx * 24, 1564, 29.5)];
    mark(...sided(S, 'pterygomaxillary fissure', '翼上頜裂'), [{bone: mx, geometry: along(mx, pmf, .0032)}], ['Between the maxilla and the pterygoid process of the sphenoid bone', '位於上頜骨與蝶骨翼突之間'],
      ['Narrow vertical gap behind the maxilla, between its back surface and the front of the pterygoid process; it joins the infratemporal fossa to the pterygopalatine fossa', '上頜骨後方的垂直窄縫，介於上頜骨後面與翼突前緣之間；使顳下窩與翼顎窩相通'],
      ['Transmits the third part of the maxillary artery and the posterior superior alveolar nerves and vessels', '通過上頜動脈第三段與後上牙槽神經、血管']);
  }

  // ================= Palatine bones: sphenopalatine, greater and lesser palatine foramina
  for (const S of SIDES) {
    const pb = `${S.w} palatine bone`, sx = S.sx;
    mark(...sided(S, 'sphenopalatine foramen', '蝶顎孔'), [{bone: pb, geometry: disc(pb, P(sx * 13.0, 1578.5, 31.5), .0034)}], ['On the palatine bone', '顎骨'],
      ['Opening on the side wall of the nasal cavity, between the orbital and sphenoidal processes of the palatine bone, joining the pterygopalatine fossa to the nasal cavity', '位於鼻腔外側壁、顎骨眶突與蝶突之間的開口，使翼顎窩與鼻腔相通'],
      ['Transmits the sphenopalatine artery and vein and the nasopalatine and posterior superior nasal nerves', '通過蝶顎動脈、靜脈，以及鼻顎神經與後上鼻神經']);
    mark(...sided(S, 'greater palatine foramen', '大顎孔'), [{bone: pb, geometry: disc(pb, P(sx * 15.6, 1557, 41.7), .0033)}], ['On the palatine bone', '顎骨'],
      ['Opening on the underside of the hard palate near its outer border, at the lower end of the greater palatine canal, in line with the last molar', '位於硬顎下面近外緣處，是大顎管的下端出口，約與最後一顆臼齒同一直線'],
      ['Transmits the greater palatine nerve and vessels, which run forward on the hard palate', '通過大顎神經與大顎血管，向前行於硬顎']);
    mark(...sided(S, 'lesser palatine foramen', '小顎孔'), [{bone: pb, geometry: disc(pb, P(sx * 21.6, 1555.7, 28.5), .0030)}], ['On the palatine bone', '顎骨'],
      ['One or more small openings behind the greater palatine foramen, on the pyramidal process of the palatine bone', '位於大顎孔後方、顎骨錐突上的一個或數個小孔'],
      ['Transmits the lesser palatine nerves and vessels to the soft palate and tonsil', '通過小顎神經與小顎血管，分布到軟顎與扁桃體']);
  }

  // ================= Sphenoid bone (one mesh; sides told apart by x)
  const SPH = 'Sphenoid bone';
  const ovale = {1: [P(24.3, 1591, 1.5), P(24.3, 1579, 1.5)], '-1': [P(-25.0, 1591, 1.5), P(-25.0, 1579, 1.5)]};
  const rotundum = {1: [P(16.5, 1598, 9.5), P(16.5, 1598, 19.5)], '-1': [P(-17.8, 1598, 9.5), P(-17.8, 1598, 19.5)]};
  const sof = {1: [P(15, 1603.5, 19), P(25.5, 1610.5, 19)], '-1': [P(-15, 1603.5, 19), P(-26.5, 1610.5, 19)]};
  const crestOf = sx => [P(sx * 46, 1596, 26), P(sx * 50, 1593, 12), P(sx * 52, 1592, 0), P(sx * 48, 1590, -6)];
  // everything marked on the sphenoid as an opening or crest is cut out of the wings, body and plates, so no two patches share a face
  const SPH_HOLES = [1, -1].flatMap(sx => [ovale[sx], rotundum[sx], sof[sx], [P(sx * 10.9, 1608, 17.2)], [surf(SPH, P(sx * 31, 1584, -4.5))], [P(sx * 17, 1584, 5)], crestOf(sx)].map((l, i) => ({l, r: [6.3, 4.3, 5.2, 6.3, 9.2, 4.4, 4.3][i]})));
  const inHole = p => SPH_HOLES.some(h => nearAny([h.l], h.r)(p));
  for (const S of SIDES) {
    const sx = S.sx, side = x => sx * x > 9;
    mark(...sided(S, 'optic canal', '視神經管'), [{bone: SPH, geometry: disc(SPH, P(sx * 10.9, 1608, 17.2), .0045)}], ['On the sphenoid bone, in the root of the lesser wing', '蝶骨小翼根部'],
      ['Short canal through the lesser wing at the apex of the orbit, medial to the superior orbital fissure; it joins the middle cranial fossa to the orbit', '穿過蝶骨小翼的短管，位於眼眶尖端、眶上裂內側；連接中顱窩與眼眶'],
      ['Transmits the optic nerve with its meninges and the ophthalmic artery', '通過視神經（連同腦膜）與眼動脈']);
    mark(...sided(S, 'superior orbital fissure', '眶上裂'), [{bone: SPH, geometry: along(SPH, sof[sx], .0032)}], ['Between the lesser and greater wings of the sphenoid bone', '位於蝶骨小翼與大翼之間'],
      ['Slanting cleft that joins the middle cranial fossa to the orbit, lateral to the optic canal', '斜行的裂隙，位於視神經管外側，連接中顱窩與眼眶'],
      ['Transmits the oculomotor, trochlear and abducens nerves, the lacrimal, frontal and nasociliary branches of the ophthalmic nerve, and the superior ophthalmic vein', '通過動眼、滑車與外旋（外展）神經，眼神經的淚、額與鼻睫分支，以及上眼靜脈']);
    mark(...sided(S, 'foramen rotundum', '圓孔'), [{bone: SPH, geometry: along(SPH, rotundum[sx], .0027)}], ['On the greater wing of the sphenoid bone', '蝶骨大翼'],
      ['Round canal that runs forward through the greater wing, below the inner end of the superior orbital fissure, from the middle cranial fossa to the pterygopalatine fossa', '由前向後穿過蝶骨大翼的圓形管道，位於眶上裂內端下方，連接中顱窩與翼顎窩'],
      ['Transmits the maxillary nerve (the second division of the trigeminal nerve)', '通過上頜神經（三叉神經第二支）']);
    mark(...sided(S, 'foramen ovale', '卵圓孔'), [{bone: SPH, geometry: along(SPH, ovale[sx], .0045)}], ['On the greater wing of the sphenoid bone', '蝶骨大翼'],
      ['Oval opening in the floor of the middle cranial fossa, behind and lateral to the foramen rotundum, leading down into the infratemporal fossa', '位於中顱窩底的卵圓形開口，在圓孔後外側，向下通往顳下窩'],
      ['Transmits the mandibular nerve (the third division of the trigeminal nerve), the accessory meningeal artery and emissary veins', '通過下頜神經（三叉神經第三支）、副腦膜動脈與導靜脈']);
    mark(...sided(S, 'foramen spinosum', '棘孔'), [{bone: SPH, geometry: disc(SPH, SPH_HOLES.find(h => h.r === 9.2 && h.l[0][0] * sx > 0).l[0], .0028)}], ['On the greater wing of the sphenoid bone', '蝶骨大翼'],
      ['Small opening behind and lateral to the foramen ovale, near the spine of the sphenoid bone', '位於卵圓孔後外側、蝶骨棘附近的小孔'],
      ['Transmits the middle meningeal artery and vein and the meningeal branch of the mandibular nerve', '通過腦膜中動脈、靜脈與下頜神經的腦膜支']);
    mark(...sided(S, 'pterygoid canal', '翼管'), [{bone: SPH, geometry: disc(SPH, P(sx * 17, 1584, 5), .0026)}], ['At the root of the pterygoid process of the sphenoid bone', '蝶骨翼突根部'],
      ['Canal through the root of the pterygoid process, from the front of the foramen lacerum to the pterygopalatine fossa; its back opening is marked here', '穿過翼突根部的管道，由破裂孔前方通到翼顎窩；此處標示其後方開口'],
      ['Transmits the nerve of the pterygoid canal (greater and deep petrosal nerves) and the artery of the pterygoid canal', '通過翼管神經（大岩神經與深岩神經）與翼管動脈']);
    mark(...sided(S, 'greater wing of sphenoid bone', '蝶骨大翼'), [{bone: SPH, geometry: where(SPH, ([x, y, z]) => side(x) && y >= 1583 && z < 24 && !(sx * x < 29 && y > 1605 && z > 13) && !inHole([x, y, z]), ([x, y, z]) => side(x) && y >= 1579 && z < 28)}], ['On the sphenoid bone', '蝶骨'],
      ['The wide, curved plate that spreads out from the side of the body; its inner face forms part of the floor of the middle cranial fossa and its outer faces look into the temporal and infratemporal fossae and into the orbit', '由蝶骨體兩側向外展開的寬而彎的骨板；內面構成中顱窩底的一部分，外面朝向顳窩、顳下窩與眼眶'],
      ['Pierced by the foramen rotundum, foramen ovale and foramen spinosum; the upper head of the lateral pterygoid arises from its infratemporal surface', '有圓孔、卵圓孔與棘孔穿過；外翼肌上頭起於其顳下面']);
    mark(...sided(S, 'lesser wing of sphenoid bone', '蝶骨小翼'), [{bone: SPH, geometry: where(SPH, ([x, y, z]) => sx * x > 9 && sx * x < 28 && y > 1607 && z > 14 && z < 36 && !inHole([x, y, z]), ([x, y, z]) => sx * x > 4 && sx * x < 31 && y > 1602 && z > 10 && z < 40)}], ['On the sphenoid bone', '蝶骨'],
      ['The thin, pointed plate that spreads out from the upper front of the body, forming the ridge between the anterior and middle cranial fossae and the roof of the superior orbital fissure', '由蝶骨體前上方向外延伸的薄而尖的骨板，構成前顱窩與中顱窩之間的骨嵴，也是眶上裂的上界'],
      ['The optic canal runs through its root; its inner end forms the anterior clinoid process', '視神經管穿過其根部；內側端形成前床突']);
    const medial = ([x, y]) => sx * x > 12 && sx * x < 19 && y < 1577, lateral = ([x, y]) => sx * x >= 20 && sx * x < 36 && y < 1577;
    mark(...sided(S, 'medial plate of pterygoid process', '翼突內側板'), [{bone: SPH, geometry: where(SPH, medial, ([x, y]) => sx * x > 10 && sx * x < 22 && y < 1580)}], ['On the sphenoid bone', '蝶骨'],
      ['The narrower, longer plate of the pterygoid process; its lower end curls outward into the pterygoid hamulus and its inner face forms part of the wall of the back of the nasal cavity', '翼突較窄而長的骨板；下端向外彎成翼鉤，內面構成鼻腔後部側壁的一部分'],
      ['The tendon of tensor veli palatini turns round the hamulus; the pterygomandibular raphe and the superior pharyngeal constrictor attach here', '顎帆張肌的肌腱繞過翼鉤；翼下頜縫與上咽縮肌附著於此']);
    mark(...sided(S, 'lateral plate of pterygoid process', '翼突外側板'), [{bone: SPH, geometry: where(SPH, lateral, ([x, y]) => sx * x > 17 && sx * x < 39 && y < 1580)}], ['On the sphenoid bone', '蝶骨'],
      ['The broad, flat plate of the pterygoid process, which faces the infratemporal fossa on its outer side', '翼突寬而扁的骨板，外側面朝向顳下窩'],
      ['Origin of the lower head of the lateral pterygoid on its outer surface and of the deep head of the medial pterygoid on its inner surface', '外面為外翼肌下頭起點，內面為內翼肌深頭起點']);
    const crest = crestOf(sx);
    mark(...sided(S, 'infratemporal crest', '顳下嵴'), [{bone: SPH, geometry: along(SPH, crest, .0026)}], ['On the greater wing of the sphenoid bone', '蝶骨大翼'],
      ['Horizontal ridge on the outer side of the greater wing that divides its upper (temporal) surface from its lower (infratemporal) surface', '蝶骨大翼外側的橫行骨嵴，將其上方的顳面與下方的顳下面分開'],
      ['Origin of the upper head of the lateral pterygoid below it; the temporalis lies above it', '其下方為外翼肌上頭起點；顳肌位於其上方']);
  }
  {
    // the body of the sphenoid is one structure across the midline
    mark('Body of sphenoid bone', '蝶骨體', [{bone: SPH, geometry: where(SPH, ([x, y, z]) => Math.abs(x) <= 7 && z <= 28 && !inHole([x, y, z]), ([x, y, z]) => Math.abs(x) <= 9 && z <= 31)}], ['On the sphenoid bone', '蝶骨'],
      ['The central, cube-like part of the sphenoid bone; it contains the sphenoid sinuses and carries the pituitary fossa (sella turcica) on its upper surface', '蝶骨中央的立方形部分；內含蝶竇，上面有容納腦下垂體的蝶鞍'],
      ['The wings and pterygoid processes spring from its sides; the internal carotid artery and the cavernous sinus lie against its sides', '兩側長出大翼、小翼與翼突；頸內動脈與海綿竇緊貼其兩側']);
  }

  // ================= Temporal bone
  for (const S of SIDES) {
    const tb = `${S.w} temporal bone`, sx = S.sx, zb = `${S.w} zygomatic bone`;
    // external acoustic meatus: the porus of the ear model (public/models/ear) and the canal axis towards the drum
    mark(...sided(S, 'external acoustic meatus', '外耳道'), [{bone: tb, geometry: disc(tb, P(sx * 62, 1585, -19.5), .0060)}], ['On the temporal bone', '顳骨'],
      ['The canal from the outer opening beside the ear to the tympanic membrane, about 2.5 cm long; its outer third is cartilage and its inner two thirds are bone, formed mainly by the tympanic part of the temporal bone', '由耳旁外口通到鼓膜的管道，長約 2.5 公分；外側三分之一為軟骨、內側三分之二為骨，主要由顳骨鼓部構成'],
      ['The tympanic membrane closes its inner end; the temporomandibular joint lies in front of it and the mastoid process behind it', '內端由鼓膜封閉；顳顎關節在其前方，乳突在其後方']);
    mark(...sided(S, 'mandibular fossa', '下頜窩'), [{bone: tb, geometry: disc(tb, P(sx * 42.5, 1585.8, -5.7), .0075)}], ['On the temporal bone', '顳骨'],
      ['Oval hollow on the underside of the temporal bone, just in front of the external acoustic meatus and below the root of the zygomatic arch, directly above the head of the mandible', '顳骨下面的橢圓形凹陷，位於外耳道前方、顴弓根部下方，正對下頜骨髁頭上方'],
      ['Receives the head of the mandible, with the articular disc between them, to form the temporomandibular joint', '容納下頜骨髁頭，中間隔著關節盤，構成顳顎關節']);
    mark(...sided(S, 'articular tubercle', '關節結節'), [{bone: tb, geometry: disc(tb, P(sx * 42.5, 1588, 4.5), .0045)}], ['On the temporal bone', '顳骨'],
      ['Transverse bony ridge on the underside of the root of the zygomatic arch, in front of the mandibular fossa; also called the articular eminence', '位於顴弓根部下面、下頜窩前方的橫向骨嵴，又稱關節隆起'],
      ['The head of the mandible and the articular disc glide forward onto it when the mouth opens wide', '大張口時，下頜骨髁頭與關節盤向前滑到其上']);
    mark(...sided(S, 'petrotympanic fissure', '岩鼓裂'), [{bone: tb, geometry: disc(tb, P(sx * 42.5, 1583.5, -10.5), .0030)}], ['On the temporal bone', '顳骨'],
      ['Narrow slit just behind the mandibular fossa, between the tympanic part and the petrous part of the temporal bone', '位於下頜窩正後方、顳骨鼓部與岩部之間的狹縫'],
      ['Transmits the chorda tympani nerve and the anterior tympanic artery; the anterior ligament of the malleus passes through it', '通過鼓索神經與前鼓室動脈；錘骨前韌帶也經由此縫']);
    mark(...sided(S, 'stylomastoid foramen', '莖乳突孔'), [{bone: tb, geometry: disc(tb, P(sx * 40, 1571, -22), .0032)}], ['On the temporal bone, between the styloid and mastoid processes', '顳骨，莖突與乳突之間'],
      ['Small round opening on the underside of the temporal bone, behind the base of the styloid process and in front of the mastoid process; it is the lower end of the facial canal', '位於顳骨下面、莖突基部後方與乳突前方的小圓孔，是顏面神經管的下端出口'],
      ['Transmits the facial nerve out of the skull and the stylomastoid artery', '顏面神經由此出顱，並有莖乳突動脈通過']);
    // carotid canal: from its opening on the underside of the petrous part (in front of the jugular foramen) to the apex, where the internal carotid artery of the atlas meets the bone
    const canal = [P(sx * 24, 1571, -12), P(sx * 20, 1577, -8), P(sx * 21, 1578, -8)].map(p => U.onSurface(tb, p, 0));
    mark(...sided(S, 'carotid canal', '頸動脈管'), [{bone: tb, geometry: along(tb, canal, .0032)}], ['In the petrous part of the temporal bone', '顳骨岩部'],
      ['Canal that starts on the underside of the petrous part, in front of the jugular foramen, turns forward and medially inside the bone and ends at the apex of the petrous part', '起於顳骨岩部下面、頸靜脈孔前方，在骨內轉向前內側，終止於岩部尖端的管道'],
      ['Transmits the internal carotid artery with its sympathetic plexus and venous plexus', '通過頸內動脈及其交感神經叢與靜脈叢']);
    mark(...sided(S, 'internal acoustic meatus', '內耳道'), [{bone: tb, geometry: disc(tb, P(sx * 27, 1590, -23), .0045)}], ['On the back of the petrous part of the temporal bone', '顳骨岩部後面'],
      ['Short canal, about 1 cm long, that opens on the back surface of the petrous part facing the posterior cranial fossa and ends blindly at the inner ear', '約 1 公分長的短管，開口於岩部後面、朝向後顱窩，盲端連到內耳'],
      ['Transmits the facial nerve, the vestibulocochlear nerve and the labyrinthine artery', '通過顏面神經、前庭耳蝸神經與迷路動脈']);
    // foramen lacerum: the through-hole between the petrous apex, the body of the sphenoid and the basilar part of the occipital bone
    const lac = P(sx * 13, 1585, -3.7), host = U.dist(tb, lac) <= U.dist('Sphenoid bone', lac) ? tb : 'Sphenoid bone';
    mark(...sided(S, 'foramen lacerum', '破裂孔'), [{bone: host, geometry: along(host, [P(sx * 13, 1581, -3.7), P(sx * 13, 1589, -3.7)], .0036)}], ['At the apex of the petrous part of the temporal bone', '顳骨岩部尖端'],
      ['Irregular gap between the apex of the petrous part, the body of the sphenoid bone and the basilar part of the occipital bone; in life it is mostly filled with cartilage', '位於顳骨岩部尖端、蝶骨體與枕骨基底部之間的不規則裂隙；活體時大部分由軟骨填滿'],
      ['The internal carotid artery crosses its upper part without passing through it; the greater petrosal nerve joins the deep petrosal nerve here to form the nerve of the pterygoid canal', '頸內動脈由其上方越過但並不穿過；大岩神經在此與深岩神經會合成翼管神經']);
    // zygomatic arch: the zygomatic process of the temporal bone and the temporal process of the zygomatic bone
    // axis of the arch measured on the two bones (x about 60 mm lateral, y about 1582-1588): the band within 4.5 mm of it on each bone
    const axis = [P(sx * 58, 1587, -5), P(sx * 60, 1584.5, 6), P(sx * 61, 1583, 16), P(sx * 61, 1581, 26), P(sx * 59, 1582, 34)];
    const archT = along(tb, axis, .0045), archZ = along(zb, axis, .0045);
    mark(...sided(S, 'zygomatic arch', '顴弓'), [{bone: tb, geometry: archT}, {bone: zb, geometry: archZ}].filter(p => p.geometry.indices.length), ['Formed by the temporal bone and the zygomatic bone', '由顳骨與顴骨共同構成'],
      ['Bony bar along the side of the face, formed behind by the zygomatic process of the temporal bone and in front by the temporal process of the zygomatic bone, joined by an oblique suture', '沿面部側面走行的骨橋，後方由顳骨顴突、前方由顴骨顳突構成，兩者以斜行骨縫相接'],
      ['Origin of the masseter from its lower border; the temporal fascia attaches to its upper border and the temporalis passes under it', '咬肌起於其下緣；顳筋膜附著於其上緣，顳肌由其深面通過']);
  }

  // ================= Occipital bone: foramen magnum, hypoglossal canal
  {
    const OCC = 'Occipital bone';
    const rim = []; for (let i = 0; i <= 36; i++) { const a = i / 36 * Math.PI * 2; rim.push(surf(OCC, P(-.7 + 17.8 * Math.cos(a), 1560, -40.4 + 19.5 * Math.sin(a)))); }
    const nearJug = nearAny([[P(-15, 1559.5, -23)]], 13);   // the jugular foramen patch of landmarks.mjs lies on the rim here
    mark('Foramen magnum', '枕骨大孔', [{bone: OCC, geometry: U.patchWhere(OCC, tr => U.nearPolyline(rim, .0028)(tr) && !nearJug(tr.mid.map(m)), .0004, U.nearPolyline(rim, .0068), .0007)}], ['In the occipital bone, in the floor of the posterior cranial fossa', '枕骨，後顱窩底'],
      ['The large oval opening in the base of the skull, between the basilar part in front, the condylar parts at the sides and the squamous part behind', '顱底的大橢圓形開口，前方為枕骨基底部，兩側為髁部，後方為鱗部'],
      ['Transmits the lower end of the medulla oblongata where it becomes the spinal cord, the meninges, the vertebral arteries, the spinal arteries and the spinal roots of the accessory nerves', '通過延腦下端與脊髓的交界、腦脊膜、椎動脈、脊髓動脈與副神經脊髓根']);
    for (const S of SIDES) {
      const hc = [P(S.sx * 16, 1568, -27), P(S.sx * 23, 1562, -31)].map(p => surf(OCC, p));
      mark(...sided(S, 'hypoglossal canal', '舌下神經管'), [{bone: OCC, geometry: along(OCC, hc, .0030)}], ['In the occipital bone, above the occipital condyle', '枕骨，枕髁上方'],
        ['Short canal that runs forward and outward through the condylar part, just above the front half of the occipital condyle, from the posterior cranial fossa to the base of the skull', '穿過枕骨髁部的短管，位於枕髁前半上方，由後顱窩向前外斜行到顱底'],
        ['Transmits the hypoglossal nerve (cranial nerve XII) and a small meningeal branch of the ascending pharyngeal artery', '通過舌下神經（第十二對腦神經）與咽升動脈的小腦膜支']);
    }
  }

  // ================= Sixth cervical vertebra: carotid tubercle
  for (const S of SIDES) {
    const c6 = 'Sixth cervical vertebra', at = U.extreme(c6, [S.sx * .5, 0, 1], {x: S.sx > 0 ? [.012, .035] : [-.035, -.012], z: [-.03, -.005]});
    mark(...sided(S, 'carotid tubercle', '頸動脈結節'), [{bone: c6, geometry: disc(c6, at, .0042)}], ['On the sixth cervical vertebra', '第六頸椎'],
      ['The large anterior tubercle of the transverse process of the sixth cervical vertebra, which can be felt at the side of the neck at the level of the cricoid cartilage', '第六頸椎橫突的大型前結節，在環狀軟骨高度的頸側可摸到'],
      ['The common carotid artery runs just in front of it and can be pressed back against it; the longus colli and scalenus anterior attach near it', '頸總動脈走在其正前方，可向後壓向此結節；頸長肌與前斜角肌附著於其附近']);
  }

  return out;
}
