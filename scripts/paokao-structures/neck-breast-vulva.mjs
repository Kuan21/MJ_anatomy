// Structures the notes expect that the atlas lacks: the cervical spinal nerves C1–C8 with their dorsal rami (the C2 dorsal ramus is the root of the greater occipital nerve),
// the female breast (mammary gland, areola, nipple) and the female external genitalia (mons pubis, labia, clitoris, vestibule and its bulbs and glands).
// Female-only parts carry sex: 'female', so they appear with the female organs and stay hidden in the male view.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';
import {fitClitoris} from '../lib/clitoris-place.mjs';

const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];
const CERVICAL = ['Atlas', 'Axis', 'Third cervical vertebra', 'Fourth cervical vertebra', 'Fifth cervical vertebra', 'Sixth cervical vertebra', 'Seventh cervical vertebra', 'First thoracic vertebra'];
const NUM_ZH = ['一', '二', '三', '四', '五', '六', '七', '八'];

export default function neckBreastVulva(U) {
  const out = [], P = (x, y, z) => [x, y, z];

  // ---- Cervical spinal nerves C1–C8 and their dorsal rami
  for (const S of SIDES) {
    const nerves = [], rami = [];
    for (let n = 0; n < 8; n++) {
      const v = U.mesh(CERVICAL[n]), top = v.hi[1] - (n === 0 ? .004 : .0045), cord = U.axisAt('White matter of spinal cord', top, null, .002);
      const lateral = n < 2 ? .0225 : .0165;                       // C1 and C2 leave behind the lateral mass, C3–C8 through the intervertebral foramen
      const root = add(cord, P(S.sx * .0045, 0, .0)), fo = add(cord, P(S.sx * lateral, -.002, .0)), beyond = add(cord, P(S.sx * (lateral + .010), -.010, .004));
      const pts = [root, lerp(root, fo, .5), fo, beyond];
      const dorsalStart = add(cord, P(S.sx * (lateral + .003), -.004, -.001));
      let end;
      if (n === 1) {
        // the C2 dorsal ramus emerges below the lower border of obliquus capitis inferior: the greater occipital nerve (its medial branch) takes over from here
        const oci = U.mesh(`${S.w} obliquus capitis inferior`), y = oci.lo[1] - .0045;
        end = U.onSurface('Axis', P(S.sx * .0225, y, -.058), -.0013);
      } else end = add(cord, P(S.sx * (lateral + .003 - (n === 0 ? .0 : .006)), -.014 - (n < 2 ? .0 : .004), -.036));
      const mid = add(lerp(dorsalStart, end, .5), P(S.sx * .004, 0, 0));
      nerves.push({name: `${S.w} C${n + 1} spinal nerve`, zh: `${S.zh}第${NUM_ZH[n]}頸脊神經`, pts, n});
      rami.push({name: `${S.w} dorsal ramus of C${n + 1} spinal nerve`, zh: `${S.zh}第${NUM_ZH[n]}頸脊神經後支`, pts: [dorsalStart, mid, end], n});
    }
    for (const t of nerves) out.push({
      name: t.name, zh: t.zh, system: 'nervous', kind: 'nerve', tubes: [{pts: t.pts, r: [.0017, .0013], samples: 18}],
      card: {origin: [t.n === 7 ? 'Formed by the union of the ventral and dorsal roots of C8, between the 7th cervical and 1st thoracic vertebrae' : `Formed by the union of the ventral and dorsal roots of C${t.n + 1}, ${t.n === 0 ? 'between the occipital bone and the atlas' : `between ${t.n === 1 ? 'the atlas and the axis' : `the ${['axis', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][t.n - 1]} cervical vertebra and the one below`}`}`,
        t.n === 7 ? '由第八頸神經的腹根與背根合成，位於第七頸椎與第一胸椎之間' : `由第${NUM_ZH[t.n]}頸神經的腹根與背根合成`],
      course: ['Leaves the vertebral canal, then divides at once into a ventral ramus (to the cervical and brachial plexuses) and a dorsal ramus (to the deep back muscles and the skin of the back of the neck and scalp)', '離開椎管後立即分成前支（參與頸神經叢與臂神經叢）與後支（支配深層背肌與後頸、後頭皮膚）'],
      supply: [t.n === 7 ? 'Its ventral ramus contributes to the brachial plexus (C5–T1)' : t.n < 4 ? 'Its ventral ramus contributes to the cervical plexus (C1–C4)' : 'Its ventral ramus contributes to the brachial plexus (C5–T1)', t.n === 7 || t.n >= 4 ? '前支參與臂神經叢（C5–T1）' : '前支參與頸神經叢（C1–C4）']},
      refs: []});
    for (const t of rami) out.push({
      name: t.name, zh: t.zh, system: 'nervous', kind: 'nerve', tubes: [{pts: t.pts, r: [.0011, .0008], samples: 14}],
      card: {origin: [`C${t.n + 1} spinal nerve, just outside the ${t.n < 2 ? 'vertebral arch' : 'intervertebral foramen'}`, `第${NUM_ZH[t.n]}頸脊神經，在${t.n < 2 ? '椎弓' : '椎間孔'}外側`],
        course: [t.n === 0 ? 'The C1 dorsal ramus is the suboccipital nerve: it passes above the posterior arch of the atlas into the suboccipital triangle' : t.n === 1 ? 'The C2 dorsal ramus passes below obliquus capitis inferior and divides: its medial branch is the greater occipital nerve, which pierces semispinalis capitis and trapezius to reach the scalp' : t.n === 2 ? 'The medial branch of the C3 dorsal ramus gives the third occipital nerve to the skin below the external occipital protuberance' : 'Passes backwards between the transverse processes and divides into medial and lateral branches', t.n === 0 ? '第一頸神經後支即枕下神經，由寰椎後弓上方進入枕下三角' : t.n === 1 ? '第二頸神經後支由頭下斜肌下方穿出並分支：內側支即枕大神經，穿過頭半棘肌與斜方肌到達頭皮' : t.n === 2 ? '第三頸神經後支的內側支發出第三枕神經，分布於枕外隆凸下方皮膚' : '向後穿過橫突之間，分成內側支與外側支'],
        supply: [t.n === 0 ? 'Motor to the suboccipital muscles; little or no skin supply' : t.n === 1 ? 'Skin of the back of the scalp up to the vertex (greater occipital nerve); semispinalis capitis and the deep neck muscles' : 'Deep neck muscles of its level and the skin over them', t.n === 0 ? '支配枕下肌；幾乎沒有皮膚感覺支' : t.n === 1 ? '後頭皮至頭頂的皮膚感覺（枕大神經）；頭半棘肌與頸深層肌' : '支配同節段的頸深層肌與其上方皮膚']},
      refs: []});
  }

  // ---- Breast: Human Reference Atlas (HuBMAP) female mammary gland v1.1, registered onto the chest wall of the atlas. The pieces (fat, lobes, main lactiferous ducts and sinuses, nipple,
  // areola with its tubercles, suspensory ligaments) come from scripts/data/hra-female-breast.json.gz (scripts/extract-hra-breast.mjs). The atlas body is male, so the breast is scaled
  // (BREAST_SCALE) to span the 2nd–6th rib, its medial edge is put on the border of the sternum and its nipple on the 4th rib level; its back is then sheared onto the front of pectoralis
  // major (and the sternum) so it lies on the chest wall instead of hanging in front of a flat plane.
  const BREAST_SCALE = .55, hra = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../data/hra-female-breast.json.gz', import.meta.url))));
  const b64 = (t, Type) => { const b = Buffer.from(t, 'base64'); return new Type(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
  const boundsOf = ps => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < ps.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], ps[i + k]); hi[k] = Math.max(hi[k], ps[i + k]); } return {lo, hi}; };
  for (const S of SIDES) {
    const tissue = {}; for (const p of hra.pieces) if (p.side === (S.sx > 0 ? 'L' : 'R')) tissue[p.tissue] = {positions: b64(p.positions, Float32Array), indices: b64(p.indices, Uint32Array)};
    const cl = U.mesh(`${S.w} clavicle`), mcx = (cl.lo[0] + cl.hi[0]) / 2, r4 = U.extreme(`${S.w} fourth rib`, P(S.sx * .2, 0, 1), {}), y4 = r4[1] - .012;
    // Height of the front of the chest wall (the pectoral muscles and the sternum), sampled on a grid and smoothed.
    const wall = [`Sternocostal part of ${S.l} pectoralis major`, `Abdominal part of ${S.l} pectoralis major`, `Clavicular part of ${S.l} pectoralis major`, 'Body of sternum'].filter(n => U.has(n));
    const gx = [], gy = [], X0 = S.sx * .005, DX = S.sx * .008, NX = 26, Y0 = y4 - .16, DY = .008, NY = 48; const Z = Array.from({length: NX}, () => new Float64Array(NY).fill(NaN));
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) { let z = NaN; for (const n of wall) { const h = U.rayHit(n, P(X0 + DX * i, Y0 + DY * j, .3), P(0, 0, -1)); if (h && !(h.point[2] <= z)) z = h.point[2]; } Z[i][j] = z; }
    for (let pass = 0; pass < 40; pass++) { let any = false; for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) if (Number.isNaN(Z[i][j])) { const nb = []; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = Z[i + di]?.[j + dj]; if (v !== undefined && !Number.isNaN(v)) nb.push(v); } if (nb.length) { Z[i][j] = nb.reduce((t, v) => t + v, 0) / nb.length; any = true; } } if (!any) break; }
    for (let pass = 0; pass < 3; pass++) { const C = Z.map(r => Float64Array.from(r)); for (let i = 1; i < NX - 1; i++) for (let j = 1; j < NY - 1; j++) { let t = 0; for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) t += C[i + di][j + dj]; Z[i][j] = t / 9; } }
    const chestZ = (x, y) => { const u = Math.max(0, Math.min(NX - 1.001, (x - X0) / DX)), v = Math.max(0, Math.min(NY - 1.001, (y - Y0) / DY)), i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j; return (Z[i][j] * (1 - fu) + Z[i + 1][j] * fu) * (1 - fv) + (Z[i][j + 1] * (1 - fu) + Z[i + 1][j + 1] * fu) * fv; };
    const F = boundsOf(tissue.fat.positions), medial = S.sx > 0 ? F.lo[0] : F.hi[0], N = boundsOf(tissue.nipple.positions), nip0 = [(N.lo[0] + N.hi[0]) / 2, (N.lo[1] + N.hi[1]) / 2];
    const place = g => { const ps = new Float32Array(g.positions.length); for (let i = 0; i < ps.length; i += 3) { const x = S.sx * .030 + BREAST_SCALE * (g.positions[i] - medial), y = y4 + BREAST_SCALE * (g.positions[i + 1] - nip0[1]); ps[i] = x; ps[i + 1] = y; ps[i + 2] = chestZ(x, y) + .0012 + BREAST_SCALE * (g.positions[i + 2] - F.lo[2]); } return {positions: ps, indices: g.indices}; };
    const put = (tissues, name, zh, kind, card, cap) => out.push({name: `${S.w} ${name}`, zh: `${S.zh}${zh}`, system: 'reproductive', kind, sex: 'female', geometry: tissues.map(t => place(tissue[t])), cap, card, refs: ['Human Reference Atlas 3D Reference Organs: mammary gland, female, v1.1 (CC BY 4.0), Kristen Browne and Heidi Schlehlein']});
    put(['mammary_lobes'], 'mammary gland', '乳腺（乳房）', 'gland', {
      origin: ['Modified sweat gland on the front of the chest, lying on the pectoral fascia over pectoralis major (upper two thirds) and serratus anterior, from the 2nd to the 6th rib', '變形的汗腺，位於前胸壁胸肌筋膜上，覆蓋胸大肌（上三分之二）與前鋸肌，由第二到第六肋'],
      course: ['15–20 lobes drain by lactiferous ducts to the nipple; the suspensory ligaments (of Cooper) run between the gland and the skin; an axillary tail extends to the axilla', '15–20 個乳腺葉經輸乳管通到乳頭；庫柏懸韌帶連接腺體與皮膚；外上方的腋尾伸向腋窩'],
      supply: ['Arteries: lateral thoracic, thoraco-acromial and internal thoracic (medial mammary) branches and the posterior intercostal arteries. Nerves: anterior and lateral cutaneous branches of the 4th–6th intercostal nerves. Lymph: about 75% to the axillary nodes, the rest to the parasternal nodes', '動脈：胸外側動脈、胸肩峰動脈、胸廓內動脈（內側乳房支）與後肋間動脈；神經：第四至第六肋間神經的前、外側皮支；淋巴：約 75% 回流腋淋巴結，其餘到胸骨旁淋巴結']}, 9000);
    put(['fat'], 'adipose tissue of breast', '乳房脂肪組織', 'organ', {
      origin: ['Subcutaneous and retromammary fat that surrounds the gland and gives the breast its shape', '包住乳腺、決定乳房外形的皮下脂肪與乳後脂肪'],
      course: ['Separated from the pectoral fascia by the retromammary space, which lets the breast slide over the chest wall', '與胸肌筋膜之間隔著乳後間隙，使乳房能在胸壁上滑動'],
      supply: ['Same arteries and lymph drainage as the gland', '血液供應與淋巴引流和乳腺相同']}, 6000);
    put(['main_lactiferous_ducts'], 'lactiferous ducts', '輸乳管', 'organ', {
      origin: ['Each lobe drains by one main duct', '每個乳腺葉由一條主輸乳管引流'],
      course: ['Run towards the nipple and widen into the lactiferous sinus just behind it', '朝乳頭走行，在乳頭後方擴大成輸乳竇'],
      supply: ['Carry milk to the nipple; most breast cancers start in the duct lining', '把乳汁送到乳頭；多數乳癌起自輸乳管上皮']}, 4000);
    put(['main_lactiferous_sinuses'], 'lactiferous sinuses', '輸乳竇', 'organ', {
      origin: ['Dilated end of each main lactiferous duct, behind the nipple', '主輸乳管靠近乳頭的膨大末端'],
      course: ['Each opens on the tip of the nipple by its own small pore', '各自以一個小孔開口於乳頭頂端'],
      supply: ['Store a little milk between feeds', '哺乳之間暫存少量乳汁']}, 1200);
    put(['areola', 'areolar_tubercles'], 'areola', '乳暈', 'organ', {
      origin: ['The pigmented skin circle round the nipple', '乳頭周圍有色素的皮膚圓區'],
      course: ['About 3–4 cm across; the small bumps on it (areolar or Montgomery tubercles) are glands that lubricate the nipple', '直徑約 3–4 公分；上面的小突起（蒙哥馬利結節）是潤滑乳頭的腺體'],
      supply: ['Sensory supply by the 4th intercostal nerve', '由第四肋間神經司感覺']}, 2300);
    put(['nipple'], 'nipple', '乳頭', 'organ', {
      origin: ['Centre of the areola, at the 4th intercostal space in the midclavicular line (in the male and in most women)', '乳暈中央，位於第四肋間隙、鎖骨中線（男性與多數女性）'],
      course: ['The lactiferous ducts open on it; smooth muscle fibres make it erect', '輸乳管開口於此；平滑肌使乳頭挺起'],
      supply: ['Dermatome T4; rich in sensory endings', '皮節 T4，感覺神經末梢豐富']}, 1200);
    put(['suspensory_ligaments'], 'suspensory ligament of breast', '乳房懸韌帶（庫柏氏韌帶）', 'ligament', {
      origin: ['Deep fascia over pectoralis major', '胸大肌表面的深筋膜'],
      course: ['Fibrous septa running through the breast between the lobules to the dermis of the skin', '穿過乳腺小葉之間、連到皮膚真皮的纖維隔'],
      supply: ['Support the breast; invasion by cancer can pull on them and dimple the skin', '支撐乳房；乳癌侵犯時牽拉而使皮膚凹陷']}, 5000);
    out[out.length - 1].system = 'connective';
  }

  // ---- Female external genitalia. The clitoris and the bulbs of the vestibule are the Clitoris-MRI-2 model (Bioscope / Romain Dewaele, Thingiverse thing:5027449, CC BY-NC-SA; built from an MRI of a woman
  // without genital cutting, after Abdulcadir et al. 2020, J Sex Med), cut into glans, body, two crura and two bulbs (scripts/extract-clitoris-mri.mjs) and fitted to the female pelvis
  // (scripts/lib/clitoris-place.mjs): the crura against the ischiopubic rami, the glans under the symphysis, the bulbs beside the vagina. The surface of the vulva (mons pubis, labia, vestibule)
  // is not built from shapes any more: it belongs to the female body surface (scripts/lib/female-skin.mjs) and its structures are still to be marked on it.
  {
    const cat = es => { const o = []; for (const e of es) o.push(...e.load().positions); return Float64Array.from(o); };
    const hipAll = [...U.find('Left hip bone'), ...U.find('Right hip bone')].filter(e => /^HRAF-bone/.test(e.id ?? '')), vag = U.find('Vagina').filter(e => /^HRAF-/.test(e.id ?? ''));
    if (!hipAll.length || !vag.length) throw new Error('vulva: the female hip bones or vagina were not found');
    const src = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../data/clitoris-mri2.json.gz', import.meta.url)))), parts = {};
    for (const [k, v] of Object.entries(src.parts)) parts[k] = {positions: b64(v.positions, Float32Array), indices: b64(v.indices, Uint32Array)};
    const fit = fitClitoris(Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.positions])), cat(hipAll), cat(vag));
    const placed = k => { const ps = new Float32Array(parts[k].positions.length); for (let i = 0; i < ps.length; i += 3) ps.set(fit.place([parts[k].positions[i], parts[k].positions[i + 1], parts[k].positions[i + 2]]), i); return {positions: ps, indices: parts[k].indices}; };
    const sideOfPart = k => { const g = placed(k); let cx = 0; for (let i = 0; i < g.positions.length; i += 3) cx += g.positions[i] / (g.positions.length / 3); return cx > 0 ? SIDES[1] : SIDES[0]; };   // by where the part ended up (+x = the body's left)
    const SRC = ['Clitoris-MRI-2 by Bioscope (Romain Dewaele), CC BY-NC-SA, https://www.thingiverse.com/thing:5027449', 'Abdulcadir et al. 2020, J Sex Med 17(9):1590–1602, doi 10.1016/j.jsxm.2020.05.025'];
    const add = (k, name, zh, card, cap) => out.push({name, zh, system: 'reproductive', kind: 'organ', sex: 'female', geometry: [placed(k)], cap, card, refs: SRC});
    add('glans', 'Glans of clitoris', '陰蒂頭', {origin: ['The small rounded tip of the clitoris, at the front of the vulva where the labia minora meet', '陰蒂最前端的小圓頭，位於外陰前方、小陰唇會合處'], course: ['Continues backwards into the body of the clitoris; covered by the prepuce formed by the labia minora; very rich in sensory nerve endings', '向後連接陰蒂體；被小陰唇形成的包皮覆蓋，感覺神經末梢非常豐富'], supply: ['Dorsal nerve of the clitoris (pudendal nerve) and the dorsal artery of the clitoris', '陰蒂背神經（陰部神經）與陰蒂背動脈']}, 2500);
    add('body', 'Body of clitoris', '陰蒂體', {origin: ['The shaft of the clitoris: two corpora cavernosa that lie side by side under the lower border of the pubic symphysis', '陰蒂的主幹：兩條並列的海綿體，位於恥骨聯合下緣下方'], course: ['Runs forwards and bends down under the symphysis to the glans; backwards it divides into the two crura', '向前在恥骨聯合下方彎向下接陰蒂頭；向後分成左右兩個陰蒂腳'], supply: ['Dorsal nerve and dorsal and deep arteries of the clitoris; the suspensory ligament holds it to the symphysis', '陰蒂背神經與陰蒂背動脈、陰蒂深動脈；陰蒂懸韌帶把它固定在恥骨聯合']}, 5000);
    for (const k of ['crusL', 'crusR']) { const S = sideOfPart(k); add(k, `${S.w} crus of clitoris`, `${S.zh}陰蒂腳`, {origin: ['Attached to the inner surface of the ischiopubic ramus, covered by ischiocavernosus', '附著於坐骨恥骨支內面，被坐骨海綿體肌覆蓋'], course: ['Passes forwards and medially along the ramus to join its fellow and form the body of the clitoris', '沿坐骨恥骨支向前內側走行，與對側會合形成陰蒂體'], supply: ['Dorsal nerve of the clitoris (pudendal nerve); deep artery of the clitoris', '陰蒂背神經（陰部神經）；陰蒂深動脈']}, 5000); }
    for (const k of ['bulbL', 'bulbR']) { const S = sideOfPart(k); add(k, `${S.w} bulb of vestibule`, `${S.zh}前庭球`, {origin: ['Erectile tissue on each side of the vaginal orifice, deep to the labia minora', '位於陰道口兩側、小陰唇深面的勃起組織'], course: ['Joined in front by a narrow band under the clitoris; covered by bulbospongiosus', '前方以細帶在陰蒂下方相連；被球海綿體肌覆蓋'], supply: ['Perineal branches of the pudendal nerve; artery of the bulb of the vestibule', '陰部神經會陰支；前庭球動脈']}, 5000); }
    const introitus = U.extreme('Vagina', P(0, -1, 0), {});
    for (const S of SIDES) out.push({name: `${S.w} greater vestibular gland`, zh: `${S.zh}前庭大腺（巴氏腺）`, system: 'reproductive', kind: 'gland', sex: 'female', geometry: [U.ellipsoid(P(S.sx * .0145, introitus[1] - .003, introitus[2] + .004), .0055, .0055, .0055)],
      card: {origin: ['Pea-sized gland behind each vestibular bulb, deep to the posterior part of the labium majus', '位於前庭球後方、大陰唇後部深面的豌豆大小腺體'], course: ['Its duct opens in the groove between the hymen and the labium minus, near the middle of the vestibule', '導管開口於處女膜與小陰唇之間的溝，約在前庭中部'], supply: ['Secretes mucus during arousal; blood supply from the internal pudendal artery', '興奮時分泌黏液；血液供應來自陰部內動脈']}, refs: []});
    fit.report.glansMm = fit.report.glans.map(v => +v.toFixed(1));
  }
  void sub; void mul; void unit; void len;
  return out;
}
