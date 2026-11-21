// Arteries of the abdomen and pelvis that the atlas lacks (A4–A5 of docs/exam2-abdomen-gap.md and the artery list of docs/qa-report.md): each is one continuous tube along a
// smooth centre line (schematic). It starts on the axis of its real parent artery, at a point clear of the organs around it, follows the standard course between the
// neighbouring structures (points placed in the gap between them, measured on the atlas meshes) and ends on the surface of the organ it supplies.
//   oesophageal branches   left gastric artery (at the cardia) and left inferior phrenic artery (at the hiatus) → the abdominal oesophagus
//   supraduodenal artery   gastroduodenal artery → upper border and front of the superior part of the duodenum
//   jejunal arteries       left side of the superior mesenteric artery, below the third part of the duodenum → the mesenteric border of the proximal jejunum
//   superior suprarenal    inferior phrenic artery → upper part of the suprarenal gland (several small branches)
//   ovarian artery         front of the aorta below the renal arteries → down on psoas major → across the pelvic brim → suspensory ligament → ovary (female mode)
//   median sacral artery   back of the aorta just above its bifurcation → down the front of L5, the sacrum and the coccyx (midline)
//   iliolumbar artery      posterior trunk of the internal iliac artery → up and laterally behind psoas → iliac fossa (iliac branch) and psoas (lumbar branch)
//   middle rectal artery   anterior trunk of the internal iliac artery → medially above the pelvic floor → lower rectum
//   inferior rectal artery internal pudendal artery (pudendal canal) → medially across the ischioanal fossa → anal canal and external anal sphincter
//   inferior vesical       anterior trunk of the internal iliac artery → base of the bladder, seminal vesicle and prostate (male)
import {sub, add, mul, unit, len, lerp, dot} from '../lib/paokao-util.mjs';
import {closest} from '../lib/heart-geom.mjs';

const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右'}, {w: 'Left', l: 'left', sx: 1, zh: '左'}];

export default function abdomenArteries(U, built = []) {
  const out = [];
  const signed = (name, p) => { const c = closest(U.mesh(name), p), d = len(sub(p, c.point)); return dot(sub(p, c.point), c.normal) < 0 ? -d : d; };
  /** Point on the axis of vessel `name` nearest `seed` that lies clear of every mesh of `avoid` (a branch leaves its parent outside the organ it enters). */
  const startOn = (name, seed, avoid = [], clear = .0015) => {
    const list = [...U.V(name)].sort((a, b) => len(sub(a, seed)) - len(sub(b, seed)));
    for (const v of list.slice(0, 4000)) { const c = U.cen(name, v, .003); if (avoid.every(o => !U.has(o) || signed(o, c) > clear)) return c; }
    throw new Error(`startOn: no free point on ${name} near ${seed}`);
  };
  const wall = (organ, p, off = .0006) => U.onSurface(organ, p, off);
  /** The free point near `p` in the gap between the meshes `names` (outside all of them and of `avoid`). */
  const gap = (names, p, avoid = [], r = .008) => U.locate(names.filter(U.has), p, {r, step: .002, avoid: avoid.filter(U.has)});
  const A = 'arterial';
  const artery = (name, zh, parent, tubes, card, extra = {}) => out.push({name, zh, system: A, kind: 'artery', parent, tubes, card, refs: [], ...extra});

  // ---------------- oesophageal branches of the left gastric and left inferior phrenic arteries (abdominal oesophagus)
  {
    const E = 'Esophagus', em = U.mesh(E);
    /** Centre of the oesophagus at height y (the mean of its outline in the horizontal plane through y). */
    const centre = y => { const P = em.positions, I = em.indices, pts = []; for (let t = 0; t < I.length; t += 3) for (const [i, j] of [[0, 1], [1, 2], [2, 0]]) { const a = I[t + i] * 3, b = I[t + j] * 3; if ((P[a + 1] - y) * (P[b + 1] - y) < 0) { const k = (y - P[a + 1]) / (P[b + 1] - P[a + 1]); pts.push([P[a] + k * (P[b] - P[a]), y, P[a + 2] + k * (P[b + 2] - P[a + 2])]); } } return pts.reduce((c, p) => add(c, mul(p, 1 / pts.length)), [0, 0, 0]); };
    /** Point on the wall of the oesophagus at height y on the side `dir` (horizontal), lifted off it. */
    const side = (y, dir, lift = .0011) => wall(E, add(centre(y), mul(unit(dir), .02)), lift);
    const lga = 'Left gastric artery', o = startOn(lga, U.extreme(lga, [0, 1, 0]), ['Stomach']);
    // the lower oesophagus of the model runs inside the stomach mesh up to about 1.215 m: the branch climbs on the front of the cardia and reaches the oesophagus above it
    artery('Esophageal branch of left gastric artery', '左胃動脈食道支', lga, [{pts: [o, wall('Stomach', add(o, [-.004, .007, -.003]), .0018), wall('Stomach', add(o, [-.007, .012, -.008]), .0016), side(1.222, [.2, 0, 1]), side(1.232, [.2, 0, 1])], r: [.0007, .0004]}],
      {origin: ['Left gastric artery, where it reaches the cardia', '左胃動脈到達賁門處'], course: ['Ascends on the abdominal oesophagus and through the oesophageal hiatus', '沿腹段食道上行，穿過食道裂孔'], supply: ['The abdominal oesophagus; joins the oesophageal branches of the thoracic aorta', '腹段食道；與胸主動脈的食道支吻合']});
    const lipa = 'Left inferior phrenic artery', p0 = startOn(lipa, [.0255, 1.2082, -.0139], [E, 'Stomach']);
    artery('Esophageal branch of left inferior phrenic artery', '左下膈動脈食道支', lipa, [{pts: [p0, lerp(p0, side(1.214, [.7, 0, -1]), .5), side(1.214, [.7, 0, -1]), side(1.224, [.5, 0, -1])], r: [.0006, .0004]}],
      {origin: ['Left inferior phrenic artery, near the oesophageal hiatus', '左下膈動脈，靠近食道裂孔'], course: ['Passes medially to the back and left side of the abdominal oesophagus', '向內側走到腹段食道的後面與左側'], supply: ['The abdominal oesophagus and the cardia', '腹段食道與賁門']});
  }

  // ---------------- supraduodenal artery
  {
    const gda = 'Trunk of gastroduodenal artery', o = startOn(gda, [-.0065, 1.153, .0405], ['Duodenum', 'Pancreas']);
    const t1 = wall('Duodenum', [-.02, 1.156, .04], .0012), t2 = wall('Duodenum', [-.026, 1.15, .048], .0008);
    artery('Supraduodenal artery', '上十二指腸動脈', gda, [{pts: [o, lerp(o, t1, .5), t1, t2], r: [.0007, .0004]}],
      {origin: ['Usually the gastroduodenal artery (sometimes the common or proper hepatic artery or the right gastric artery)', '通常起自胃十二指腸動脈（有時起自肝總動脈、肝固有動脈或胃右動脈）'], course: ['Short vessel to the upper border of the superior part of the duodenum', '短小，走到十二指腸上部的上緣'], supply: ['The upper and front surfaces of the first 2–3 cm of the superior part of the duodenum', '十二指腸上部起始 2–3 公分的上面與前面']});
  }

  // ---------------- jejunal arteries
  {
    const sma = 'Trunk of superior mesenteric artery', jej = 'Proximal part of jejunum';
    const free = p => gap([jej], p, ['Pancreas', 'Duodenum', 'Transverse colon', 'Left kidney']);
    // below the third part of the duodenum, which the artery crosses in front of; each ends on the mesenteric border of the nearest loop to the left and in front
    const tubes = [[1.062, [.03, -.004, .012]], [1.052, [.032, -.007, .014]], [1.042, [.03, -.01, .016]], [1.032, [.026, -.012, .018]]].map(([y, dir]) => {
      const c = U.axisAt(sma, y, [-.006, y, .045]), o = add(c, [.0025, 0, 0]), t = wall(jej, add(o, dir), .0008), m = free(lerp(o, t, .5));
      return {pts: [o, lerp(o, m, .5), m, t], r: [.0011, .0007]};
    });
    artery('Jejunal arteries', '空腸動脈', sma, tubes,
      {origin: ['Left side of the superior mesenteric artery (about 4–6 arteries; with the ileal arteries 15–18 in all)', '腸繫膜上動脈左側（約四至六條；與迴腸動脈合計十五至十八條）'], course: ['Run between the two layers of the mesentery, join in one or two rows of arterial arcades and end as long straight arteries (vasa recta) to the wall', '在小腸繫膜兩層之間走，連成一至兩排動脈弓，再以長而直的直動脈到腸壁'], supply: ['The jejunum', '空腸']});
  }

  // ---------------- superior suprarenal arteries: several small branches of the inferior phrenic artery to the upper part of the suprarenal gland
  for (const S of SIDES) {
    const ipa = `${S.w} inferior phrenic artery`, gl = `${S.w} adrenal gland`, g = U.mesh(gl), top = g.hi[1], c = U.pca(gl).c;
    const tubes = [-.008, 0, .008].map(dz => {
      const aim = [c[0], top - .004, c[2] + dz], t = wall(gl, aim, .0006), o = startOn(ipa, add(t, [0, .012, 0]), [gl, 'Diaphragm']);
      return {pts: [o, lerp(o, add(t, [0, .006, 0]), .5), add(t, [0, .004, 0]), t], r: [.0006, .0004]};
    });
    artery(`${S.w} superior suprarenal artery`, `${S.zh}上腎上腺動脈`, ipa, tubes,
      {origin: ['Inferior phrenic artery (usually several small branches)', '下膈動脈（通常為數條小分支）'], course: ['Descend from the inferior phrenic artery under the diaphragm to the upper part of the suprarenal gland', '由下膈動脈在橫膈下方下行，到腎上腺上部'], supply: ['The upper part of the suprarenal gland', '腎上腺上部']});
  }

  // ---------------- ovarian arteries (female): from the aorta below the renal arteries, down on psoas, across the pelvic brim, in the suspensory ligament to the ovary
  for (const S of SIDES) {
    const ao = 'Abdominal aorta', ov = `${S.w} ovary`, lig = `${S.w} suspensory ligament of ovary`, ps = `${S.w} psoas major`;
    if (!U.has(ov) || !U.has(lig)) continue;
    const o = startOn(ao, [S.sx * .008, 1.098, .028], ['Left renal vein', 'Inferior vena cava']);
    const onPsoas = y => wall(ps, [S.sx * .03, y, .03], .006), ligTop = U.extreme(lig, [0, 1, 0]), ligMid = U.cen(lig, lerp(ligTop, U.extreme(lig, [0, -1, 0]), .5), .004), t = wall(ov, U.pca(ov).c, .0006);
    artery(`${S.w} ovarian artery`, `${S.zh}卵巢動脈`, ao, [{pts: [o, S.sx < 0 ? [-.012, 1.075, .034] : [.016, 1.085, .022], onPsoas(1.06), onPsoas(1.02), add(ligTop, [0, .012, .006]), ligTop, ligMid, t], r: [.0011, .0007], samples: 50}],
      {origin: ['Front of the abdominal aorta, just below the renal arteries (about L2)', '腹主動脈前面，腎動脈稍下方（約第二腰椎）'], course: ['Descends on psoas major behind the peritoneum, crosses the ureter and the external iliac vessels at the pelvic brim and runs in the suspensory ligament of the ovary to the ovary', '在腹膜後沿腰大肌下行，越過輸尿管與髂外血管進入骨盆，經卵巢懸韌帶到卵巢'], supply: ['The ovary and the lateral part of the uterine tube; joins the ovarian branch of the uterine artery', '卵巢與輸卵管外側部；與子宮動脈卵巢支吻合']}, {sex: 'female'});
  }

  // ---------------- median sacral artery: from the back of the aorta above its bifurcation, down the midline of L5, the sacrum and the coccyx
  {
    const ao = 'Abdominal aorta', bottom = U.extreme(ao, [0, -1, 0]), o = startOn(ao, add(bottom, [0, .006, -.008]), ['Fifth lumbar vertebra']);
    const front = (bone, y, off = .0013) => wall(bone, U.extreme(bone, [0, 0, 1], {x: [-.008, .008], y: [y - .004, y + .004]}), off);
    const path = [o, front('Fifth lumbar vertebra', 1.01), front('Fifth lumbar vertebra', .995), front('Sacrum', .975), front('Sacrum', .955), front('Sacrum', .935), front('Sacrum', .915)];
    artery('Median sacral artery', '正中薦動脈', ao, [{pts: path, r: [.0010, .0006], samples: 40}],
      {origin: ['Back of the abdominal aorta, just above its bifurcation', '腹主動脈後面，分叉處稍上方'], course: ['Descends in the midline in front of L4–L5, the sacrum and the coccyx', '在正中線沿第四、五腰椎、薦骨與尾骨前面下行'], supply: ['The sacrum and coccyx, the back of the rectum and the lowest lumbar region (small lumbar and lateral sacral branches)', '薦骨與尾骨、直腸後面與最下腰部（細小的腰支與薦外側支）']});
  }

  // ---------------- branches of the internal iliac artery: iliolumbar, middle rectal, inferior vesical (male); inferior rectal from the internal pudendal artery
  for (const S of SIDES) {
    const iia = `${S.w} internal iliac artery`, top = U.extreme(iia, [0, 1, 0]);
    // iliolumbar: from the back of the trunk, up and laterally behind psoas to the iliac fossa (iliac branch) and to psoas (lumbar branch)
    {
      const o = startOn(iia, add(top, [0, -.012, -.008]), []), bend = gap([`${S.w} psoas major`, 'Sacrum'], [S.sx * .045, 1.0, -.03], [`${S.w} hip bone`]);
      const iliac = wall(`${S.w} hip bone`, [S.sx * .075, .99, -.02], .002), lumbar = wall(`${S.w} psoas major`, [S.sx * .04, 1.03, -.05], .003);
      artery(`${S.w} iliolumbar artery`, `${S.zh}髂腰動脈`, iia, [{pts: [o, lerp(o, bend, .5), bend, iliac], r: [.0016, .0009]}, {pts: [bend, lerp(bend, lumbar, .5), lumbar], r: [.0011, .0007]}],
        {origin: ['Posterior trunk of the internal iliac artery', '髂內動脈後幹'], course: ['Ascends laterally in front of the sacro-iliac joint and behind the obturator nerve and the external iliac vessels, to the medial border of psoas, and divides into lumbar and iliac branches', '在薦髂關節前方、閉孔神經與髂外血管後方向外上行至腰大肌內側緣，分為腰支與髂支'], supply: ['Psoas major, quadratus lumborum and iliacus, the ilium and the cauda equina (spinal branch)', '腰大肌、腰方肌與髂肌、髂骨及馬尾（脊支）']});
    }
    // middle rectal: medially from the anterior trunk to the lower rectum above the pelvic floor
    {
      const o = startOn(iia, [S.sx * .03, .945, -.04], []), t = wall('Rectum', [S.sx * .03, .9, -.06], .0016);
      artery(`${S.w} middle rectal artery`, `${S.zh}中直腸動脈`, iia, [{pts: [o, gap(['Rectum'], lerp(o, t, .5), ['Urinary bladder', 'Sacrum', `${S.w} seminal vesicle`]), t], r: [.0010, .0006]}],
        {origin: ['Anterior trunk of the internal iliac artery (often with the inferior vesical or the vaginal artery)', '髂內動脈前幹（常與膀胱下動脈或陰道動脈共幹）'], course: ['Runs medially above the pelvic floor to the lower rectum', '在骨盆底上方向內走到直腸下段'], supply: ['The muscle of the lower rectum, joining the superior and inferior rectal arteries; in the male also the seminal vesicle and prostate', '直腸下段肌層，與上、下直腸動脈吻合；男性也供應精囊與前列腺']});
    }
    // inferior vesical (male): to the base of the bladder, the seminal vesicle and the prostate
    {
      const sv = `${S.w} seminal vesicle`, o = startOn(iia, [S.sx * .03, .95, -.035], []), t = wall(sv, [S.sx * .03, .885, -.03], .0008), t2 = wall('Prostate', [S.sx * .015, .865, -.015], .0008);
      artery(`${S.w} inferior vesical artery`, `${S.zh}下膀胱動脈`, iia, [{pts: [o, gap([sv, 'Urinary bladder'], lerp(o, t, .5), ['Rectum']), t, t2], r: [.0010, .0006]}],
        {origin: ['Anterior trunk of the internal iliac artery (male; in the female the vaginal artery takes its place)', '髂內動脈前幹（男性；女性由陰道動脈取代）'], course: ['Runs medially and down to the base of the bladder', '向內下走到膀胱底'], supply: ['The base of the bladder, the lower ureter, the seminal vesicle, the ductus deferens and the prostate', '膀胱底、輸尿管下段、精囊、輸精管與前列腺']}, {sex: 'male'});
    }
    // inferior rectal: from the internal pudendal artery in the pudendal canal, medially across the ischioanal fossa to the anal canal
    {
      const ip = built.find(b => b.name === `${S.w} internal pudendal artery`)?.tubes?.[0]?.pts; if (!ip) throw new Error(`abdomen arteries: ${S.w} internal pudendal artery not built yet`);
      const o = ip.at(-1), t = wall('External anal sphincter', [S.sx * .012, .845, -.075], .0008);
      artery(`${S.w} inferior rectal artery`, `${S.zh}下直腸動脈`, `${S.w} internal pudendal artery`, [{pts: [o, gap(['External anal sphincter'], lerp(o, t, .5), ['Rectum', `${S.w} hip bone`]), t], r: [.0009, .0005]}],
        {origin: ['Internal pudendal artery, in the pudendal canal', '陰部內動脈（在陰部管內）'], course: ['Crosses the ischioanal fossa medially with the inferior rectal nerve', '與下直腸神經一起向內橫過坐骨肛門窩'], supply: ['The anal canal below the pectinate line, the external anal sphincter and the perianal skin', '齒狀線以下的肛管、肛門外括約肌與肛門周圍皮膚']});
    }
  }
  return out;
}
