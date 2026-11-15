// Repack the existing source anatomy, losslessly, into small per-region quiz packages
// (lower limb, upper limb, thorax). No procedural anatomy, geometry deformation, or runtime Draco.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {BufferGeometry, BufferAttribute} from 'three';
import {planCuts, atlasParts} from './lib/tendon-set.mjs';
import {quizModule} from './quiz-modules.mjs';
import {loadJointRows} from './lib/joint-quiz-source.mjs';
import {loadBrainRows} from './lib/brain-quiz-source.mjs';

const root = new URL('../', import.meta.url);
const models = new URL('public/models/', root);
const output = new URL('stream/', models);
fs.mkdirSync(output, {recursive: true});
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {anatomicalRegion, anatomicalSide, correctedPartName} = await quizModule('app/mj-part-regions.ts');
const {structureProfile, paokaoZh} = await quizModule('app/mj-structure-info.ts');
const {namingOverride, applyZhFixes} = await quizModule('app/mj-naming.ts');
const {SPACES} = await quizModule('app/mj-spaces.ts');
const {SPACE_REGION, resolveSpace, spaceExclusion} = await quizModule('app/quiz/spaces.ts');
const spaceRanges = JSON.parse(fs.readFileSync(new URL('app/space-ranges.json', root), 'utf8'));
const {jointRegion, jointExclusion, jointKey, jointKindOf, JOINT_EXCLUSION_REASONS} = await quizModule('app/quiz/joints.ts');
const {normalize} = await quizModule('app/quiz/naming.ts');
const {brainSectionOf, brainLayerOf, brainSystemOf, BRAIN_EXCLUSION_REASONS, renameSideOk, brainNameClashes, BRAIN_NAME_CLASHES} = await quizModule('app/quiz/brain.ts');
const {headNeckSystem, HN_EXTRA_MUSCLE, HN_EXCLUSION_REASONS, HEADNECK_NERVES, HEADNECK_NERVE_OTHER, HN_ZH, headNeckLayerOf, headNeckNameClashes} = await quizModule('app/quiz/headneck.ts');
const {SCHEMATIC} = await quizModule('app/organ/brain-schematic.ts');
const {brainOverrideOf} = await quizModule('app/organ/brain-overrides.ts');
const {QUIZ_SYSTEMS, QUIZ_REGIONS, LOWER_NERVES, UPPER_NERVES, THORAX_NERVES, THORAX_INCLUDE, BACK_NERVES, BACK_INCLUDE, classifySections} = await quizModule('app/quiz/catalogue.ts');
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('atlas.json', models))));
// BodyParts3D 3.0 structures the 4.0 export left out (latissimus dorsi, multifidus, spinalis cervicis…) are quiz answers too: their packages are read like the atlas chunks.
const supplement = JSON.parse(gunzipSync(fs.readFileSync(new URL('supplement/supplement-stream.json.gz', models))));
// muscles that end at their musculotendinous junction (scripts/tendon/*.mjs) use the cut muscle part, as the viewer does
const {finals: bellies} = (() => { const a = atlasParts(); return planCuts(a.parts, a.read); })();
const supplementBase = atlas.chunks.length;
atlas.chunks.push(...supplement.chunks);
for (const p of supplement.parts) atlas.parts.push({...p, chunk: p.chunk + supplementBase});
// The facial and masticatory muscles are a package of their own on the main site (BodyParts3D 3.0); the head-and-neck quiz reads them like the supplement.
const facial = JSON.parse(gunzipSync(fs.readFileSync(new URL('facial/facial-stream.json.gz', models))));
const facialBase = atlas.chunks.length;
atlas.chunks.push(...facial.chunks);
for (const p of facial.parts) atlas.parts.push({...p, chunk: p.chunk + facialBase});
const nerveStream = JSON.parse(fs.readFileSync(new URL('nerve-stream.json', models)));
const sourceBuffers = new Map();
const lc = s => s[0].toLowerCase() + s.slice(1);
const cleanName = name => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
const PAIRED_THORAX = /\brib\b|intercostal|serratus posterior|levatores costarum|rotator|iliocostalis|longissimus|spinalis|semispinalis|interspinalis|transversus thoracis|subcostal|internal thoracic|musculophrenic|bronchial|pulmonary (?:artery|vein)|superior pulmonary|inferior pulmonary|costocervical|thyrocervical|costal cartilage/i;
const NERVES = {'lower-limb': LOWER_NERVES, 'upper-limb': UPPER_NERVES, thorax: THORAX_NERVES, back: BACK_NERVES, 'head-neck': HEADNECK_NERVES};

// Lung quiz: the lobes (context only, never asked), the main bronchi, the pulmonary arteries and veins and the bronchial artery come from the atlas; the lung surface areas
// and the pulmonary ligaments come from the course-summary package. Nothing is added that the model does not have.
const LUNG_ATLAS = /^(?:upper|middle|lower) lobe of (?:right |left )?lung$|^(?:left main bronchus|right main bronchus proper)$|^(?:left|right) pulmonary artery$|^(?:left|right) (?:superior|inferior) pulmonary vein$|^bronchial artery$/i;
const lungSide = (name, bounds) => /^bronchial artery$/i.test(name) ? 'midline' : (bounds[0][0] + bounds[1][0]) / 2 > 0 ? 'left' : 'right';

/** Which atlas meshes belong to a region's quiz, and on which side (null = leave out). */
function include(region, part) {
  if (region === 'lung') {
    const y = (part.bounds[0][1] + part.bounds[1][1]) / 2;
    return LUNG_ATLAS.test(part.name) && y > 1.17 && y < 1.45 ? lungSide(part.name, part.bounds) : null;
  }
  if (region === 'lower-limb') {
    const hip = /\bhip bone\b|\b(?:common|external|internal) iliac (?:artery|vein)\b|glute|obturator|tensor fasciae|iliopsoas/i.test(part.name);
    if (anatomicalRegion(part) !== 'lower-limb' && !hip) return null;
  } else if (region === 'upper-limb') {
    if (anatomicalRegion(part) !== 'upper-limb') return null;
  } else if (region === 'back') {
    const name = cleanName(correctedPartName(part));
    if (!BACK_INCLUDE[part.system]?.test(name)) return null;
    // Source files also hold side-less duplicates of paired structures; only use the explicitly left/right ones (vertebrae, sacrum and skull are unpaired).
    if (part.system !== 'skeletal' && !/\b(left|right)\b/i.test(part.name)) return null;
  } else {
    const y = (part.bounds[0][1] + part.bounds[1][1]) / 2;
    if (y < 1.04 || y > 1.5 || !THORAX_INCLUDE[part.system]?.test(cleanName(correctedPartName(part)))) return null;
  }
  let side = anatomicalSide(part);
  if (side === 'midline') {
    const x = (part.bounds[0][0] + part.bounds[1][0]) / 2;
    if (region === 'thorax' || region === 'back') side = Math.abs(x) < .012 || (region === 'back' && part.system === 'skeletal' && !/scapula/.test(part.name.toLowerCase())) ? 'midline' : x > 0 ? 'left' : 'right';
    else if (Math.abs(x) < .005) return null;
    else side = x > 0 ? 'left' : 'right';
  }
  // Unpaired thoracic structures (aorta, venae cavae, pulmonary trunk, sternum, vertebrae, diaphragm…) are midline, whatever side they sit on.
  if (region === 'thorax' && !/\b(left|right)\b/i.test(part.name) && !PAIRED_THORAX.test(cleanName(correctedPartName(part)))) return 'midline';
  return side;
}

// Joint soft tissue (category 關節): the tissues of public/models/joints.glb, registered to the atlas bones exactly as the site draws them (scripts/lib/joint-quiz-source.mjs).
// Region, exclusions and names come from app/quiz/joints.ts; every tissue that is not asked is listed with its reason in .sites-runtime/quiz-joints-report.json (docs/quiz-joints-pool.md).
const atlasKeys = new Set(), paokaoParts = JSON.parse(gunzipSync(fs.readFileSync(new URL('paokao/paokao-stream.json.gz', models)))).parts;
for (const part of atlas.parts) atlasKeys.add(jointKey(correctedPartName(part)));
for (const part of paokaoParts) atlasKeys.add(jointKey(part.name));
const jointCandidates = [];
for (const row of await loadJointRows(atlas)) {
  const meshName = String(row.mesh.name), suffix = /\.([lr])(?:\.\d+)?$/i.exec(meshName)?.[1]?.toLowerCase();
  const base = meshName.replace(/\.[lr](?:\.\d+)?$/i, '').replace(/\.00\d$/, '').replace(/^\((.*)\)$/, '$1').trim();
  const positions = row.mesh.geometry.getAttribute('position'), bounds = (() => {const b = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]]; for (let i = 0; i < positions.count; i++) for (let k = 0; k < 3; k++) {const v = positions.array[i * 3 + k]; b[0][k] = Math.min(b[0][k], v); b[1][k] = Math.max(b[1][k], v);} return b;})();
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  // A few source meshes carry no .l/.r suffix: the midline ones are unpaired (symphyses, spinal ligaments); one lies off the midline and takes its side from its position.
  const side = suffix ? (suffix === 'l' ? 'left' : 'right') : Math.abs(x) < .012 ? 'midline' : x > 0 ? 'left' : 'right';
  const name = side === 'midline' ? base : `${side === 'left' ? 'Left' : 'Right'} ${lc(base)}`;
  const region = jointRegion(base, row.region), chineseRaw = structureProfile(name, 'connective').chinese, chinese = chineseRaw && !/[a-z]/i.test(chineseRaw) ? chineseRaw : undefined;
  const reason = jointExclusion(base, region, atlasKeys.has(jointKey(base)), chinese);
  jointCandidates.push({id: `joint:${meshName}:${jointCandidates.length}`, mesh: row.mesh, base, name, side, region, chinese, reason, bounds, kind: jointKindOf(base), anchor: row.anchor.name});
}
// Two different tissues of one region with the same Chinese name could not be told apart by a typed answer.
for (const region of ['lower-limb', 'upper-limb', 'thorax', 'back', 'head-neck']) {
  const seen = new Map();
  for (const c of jointCandidates.filter(c => !c.reason && c.region === region)) {const key = c.chinese + '|' + c.side, other = seen.get(key); if (other && other !== jointKey(c.base)) c.reason = 'name-not-unique'; else seen.set(key, jointKey(c.base));}
}
fs.mkdirSync(new URL('.sites-runtime/', root), {recursive: true});
fs.writeFileSync(new URL('.sites-runtime/quiz-joints-report.json', root), JSON.stringify(jointCandidates.map(({mesh, bounds, id, ...c}) => ({...c, bounds: undefined})).sort((a, b) => a.name.localeCompare(b.name)), null, 1));

const summary = [], spaceReport = [];
for (const region of Object.keys(QUIZ_REGIONS)) {
  const def = QUIZ_REGIONS[region], short = def.file.replace(/^quiz-|\.json$/g, '');
  const items = [], structures = new Map(), hnExcluded = [];
  const groupId = (system, name) => `${system}:${name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
  function add({id, name, chinese, system, side, bounds, source, positions, normals, indices, sections, description, layer, cardFields, availability}) {
    const exactNames = region === 'head-neck' && (system === 'nervous' || system === 'arterial' || system === 'venous');
    const structureId = groupId(system, name);
    let structure = structures.get(structureId);
    if (!structure) {
      structure = {id: structureId, name, chinese, system, side, sections: sections ?? classifySections(region, name, bounds, system), meshIds: [], bounds: bounds.map(b => [...b]), source, ...(description ? {description} : {}), ...(layer ? {layer} : {}), ...(cardFields ? {cardFields} : {}), ...(availability ? {availability} : {}), ...(exactNames ? {exactNames: true} : {})};
      structures.set(structureId, structure);
    }
    structure.meshIds.push(id);
    for (let i = 0; i < 3; i++) {
      structure.bounds[0][i] = Math.min(structure.bounds[0][i], bounds[0][i]);
      structure.bounds[1][i] = Math.max(structure.bounds[1][i], bounds[1][i]);
    }
    items.push({id, structureId, system, side, positions, normals, indices});
  }

  // Brain quiz: the structures come from the brain package (public/models/brain.glb, prepared like the brain viewer does). The rules (sections, layers, exclusions) are app/quiz/brain.ts; the report of every
  // exclusion is written to .sites-runtime/quiz-brain-report.json and turned into docs/quiz-brain-pool.md by scripts/report-quiz-brain.mjs.
  if (region === 'brain') {
    const {rows, dropped} = await loadBrainRows();
    const cardData = JSON.parse(fs.readFileSync(new URL('brain/neuro-cards.json', models), 'utf8')), cardById = new Map(cardData.cards.map(c => [c.id, c]));
    // The card of a structure: the card whose title is the structure's name (brackets ignored); otherwise the one card that points at the structure's mesh; several candidates and none the same name = no card (listed in docs/quiz-card-gaps.md).
    const plain = t => t.toLowerCase().replace(/[^a-z0-9]+/g, ''), unbracketed = t => plain(t.replace(/\([^)]*\)/g, ''));
    const cardOf = en => {
      const cards = (cardData.partCards[en] ?? []).map(id => cardById.get(id)).filter(Boolean);
      const same = cards.filter(c => plain(c.en) === plain(en) || unbracketed(c.en) === unbracketed(en));
      const card = same.length === 1 ? same[0] : cards.length === 1 ? cards[0] : null;
      if (!card) return {card: null, why: cards.length ? 'ambiguous' : 'none'};
      return {card, same: same.length === 1};
    };
    const candidates = rows.map(r => {
      const side = r.part.side === 'mid' ? 'midline' : r.part.side, group = r.part.group;
      const {card, same} = cardOf(r.part.en);
      const fields = card ? card.fields.map(f => ({label: f.label, zh: f.items.join(/[㐀-鿿]/.test(f.items[0]) && !/[㐀-鿿]/.test(f.items[f.items.length - 1]) ? '　' : '；')})) : undefined;
      // A card for a wider concept (the card of the thalamus for the pulvinar) says so in its first line.
      const cardFields = fields ? (same ? fields : [{label: '所屬資料卡', zh: `${card.zh}（${card.en}）`}, ...fields]) : undefined;
      // names and availability that differ from the model (app/organ/brain-overrides.ts, shared with the main brain viewer); the side of an overridden mesh is checked against its position
      const chinese = r.part.zh || undefined, name = r.name, bb = r.geometry.boundingBox, cx = (bb.min.x + bb.max.x) / 2, rule = brainOverrideOf(r.part.was ?? r.part.en, r.part.side);
      if (rule && !renameSideOk(rule, cx)) throw Error(`brain override ${rule.label} (${r.part.side}): the mesh centre x ${cx.toFixed(4)} does not match its side`);
      const availability = rule?.quiz ? {levels: rule.quiz.levels, lessons: rule.quiz.lessons, exam: rule.quiz.exam} : undefined, availabilityReason = rule?.quiz ? '只開放第三級；不入學習關卡與模擬跑考（大體標本表面看不到）' : undefined;   // written on the pool report (docs only, never shipped)
      return {r, side, group, name, chinese, cx, availability, availabilityReason, system: brainSystemOf(group), section: brainSectionOf(group), layer: brainLayerOf(group, r.part.en), cardFields, cardId: card?.id, cardSame: !!same, reason: group === 'meninges' ? 'meninges' : !chinese ? 'no-chinese-name' : null};
    });
    // A typed name must have one right answer: structures that share a name once left and right are set aside (a midline and a paired structure, or two different Chinese names the same) are asked by none of them.
    const idOf = c => `${c.system}:${c.name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
    const clash = new Map();
    const note = (key, c) => {const set = clash.get(key) ?? clash.set(key, new Map()).get(key); set.set(idOf(c), c);};
    for (const c of candidates) if (!c.reason) {note('en:' + normalize(c.name, false), c); note('zh:' + normalize(c.chinese, false), c);}
    for (const members of clash.values()) {
      const list = [...members.values()], sides = new Set(list.map(c => c.side));
      // left + right of one name is the normal pair; anything else that shares a name is a clash
      if (list.length > 1 && !(list.length === 2 && sides.has('left') && sides.has('right') && sides.size === 2 && new Set(list.map(c => c.system)).size === 1)) for (const c of list) c.reason ??= 'name-not-unique';
    }
    const asked = candidates.filter(c => !c.reason);
    // Name clashes of the model's own names (docs/quiz-brain-pool.md 「同名檢查」): every one has to be explained in BRAIN_NAME_CLASHES (checked by scripts/test-quiz-brain.mjs).
    const nameClashes = brainNameClashes(candidates.map(c => ({name: (c.side === 'left' ? 'Left ' : c.side === 'right' ? 'Right ' : '') + (c.r.part.was ?? c.r.part.en), chinese: c.chinese, side: c.side, group: c.group, cx: c.cx, quizName: c.name, quizChinese: c.chinese, status: c.reason ?? 'asked'}))).map(k => ({
      key: k.key, kinds: k.kinds, note: BRAIN_NAME_CLASHES[k.key] ?? null,
      members: k.members.map(m => ({modelName: m.name, modelChinese: m.chinese, side: m.side, group: m.group, centreX: +m.cx.toFixed(4), quizName: m.quizName, quizChinese: m.quizChinese, status: m.status})),
    })).sort((a, b) => a.key.localeCompare(b.key));
    for (const c of asked) {
      const {r} = c, position = r.geometry.getAttribute('position'), index = r.geometry.getIndex(), normal = r.geometry.getAttribute('normal');
      const normals = new Int16Array(normal.count * 3);
      normal.array.forEach((v, i) => {normals[i] = Math.round(v * 32767);});
      const bb = r.geometry.boundingBox, bounds = [bb.min.toArray(), bb.max.toArray()];
      add({id: `brain:${r.part.id}`, name: c.name, chinese: c.chinese, system: c.system, side: c.side, bounds, source: 'Brain Project', sections: [c.section], layer: c.layer, cardFields: c.cardFields, availability: c.availability,
        positions: Buffer.from(new Float32Array(position.array).buffer), normals: Buffer.from(normals.buffer), indices: Buffer.from(new Uint32Array(index.array).buffer)});
    }
    const entry = (name, chinese, group, side, why, extra = {}) => ({name, chinese, group, side, reason: why, ...extra});
    fs.mkdirSync(new URL('.sites-runtime/', root), {recursive: true});
    fs.writeFileSync(new URL('.sites-runtime/quiz-brain-report.json', root), JSON.stringify({
      reasons: BRAIN_EXCLUSION_REASONS,
      nameClashes,
      asked: asked.map(c => ({name: c.name, chinese: c.chinese, group: c.group, side: c.side, system: c.system, section: c.section, layer: c.layer, card: c.cardId ?? null, cardSame: c.cardSame, ...(c.availability ? {availability: c.availability, availabilityReason: c.availabilityReason} : {})})).sort((a, b) => a.name.localeCompare(b.name)),
      excluded: [
        ...candidates.filter(c => c.reason).map(c => entry(c.name, c.chinese, c.group, c.side, c.reason)),
        ...dropped.map(d => entry(d.name ?? d.raw.label, d.part?.zh || undefined, d.part?.group ?? d.raw.cat, d.part ? (d.part.side === 'mid' ? 'midline' : d.part.side) : d.raw.side, d.reason)),
        ...SCHEMATIC.map(s => entry(`${s.side === 'mid' ? '' : s.side === 'left' ? 'Left ' : 'Right '}${s.en}`, `${s.side === 'left' ? '左' : s.side === 'right' ? '右' : ''}${s.zh}`, s.group, s.side === 'mid' ? 'midline' : s.side, 'schematic')),
      ].sort((a, b) => a.reason.localeCompare(b.reason) || a.name.localeCompare(b.name)),
    }, null, 1));
  }

  // Heart quiz: the structures come from the heart detail package (Z-Anatomy), not the atlas.
  if (region === 'heart') {
    const heart = JSON.parse(gunzipSync(fs.readFileSync(new URL('heart/heart-detail.json.gz', models))));
    const heartChunks = heart.chunks.map(c => fs.readFileSync(new URL('public' + c.url, root)));
    for (const part of heart.parts) {
      if (/bifurcation/i.test(part.name)) continue;   // too fine for the course summary (e.g. the bifurcation of the pulmonary trunk)
      const raw = heartChunks[part.chunk];
      add({id: part.id, name: part.name, chinese: part.chinese, system: part.system, side: 'midline', bounds: part.bounds, source: part.origin ? `Z-Anatomy / ${part.origin}` : 'Z-Anatomy', sections: [part.group], description: part.description, origin: part.origin,
        positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12), normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6), indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
    }
  }
  if (region === 'lung') {
    const pk = JSON.parse(gunzipSync(fs.readFileSync(new URL('paokao/paokao-stream.json.gz', models))));
    const pkChunks = pk.chunks.map(c => fs.readFileSync(new URL('public' + c.url, root)));
    for (const part of pk.parts) {
      if (!((part.kind === 'surface' && part.system === 'respiratory') || /pulmonary ligament/i.test(part.name))) continue;
      const side = lungSide(part.name, part.bounds);
      // a side-less name (Groove for aortic arch) gets its side in front, with 左／右 in front of the Chinese name, as every other region does
      const sided = /\b(left|right)\b/i.test(part.name), name = sided ? part.name : `${side === 'left' ? 'Left' : 'Right'} ${lc(part.name)}`;
      const zh = paokaoZh(part.name) ?? undefined, chinese = zh && !sided && !/^[左右]/.test(zh) ? (side === 'left' ? '左' : '右') + zh : zh;
      const raw = pkChunks[part.chunk];
      add({id: part.id, name, chinese, system: 'respiratory', side, bounds: part.bounds, source: 'Lung surface areas',
        positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12), normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6), indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
    }
  }
  // Head-and-neck quiz: the structures of the head and neck that the main site already draws, from the atlas (with the facial and supplement packages), the nerve overlay, the neck-vessel package and the joint tissues.
  // The rules (system, section, exclusions) are app/quiz/headneck.ts; every structure that is not asked is in .sites-runtime/quiz-head-neck-report.json (docs/quiz-head-neck-pool.md).
  if (region === 'head-neck') {
    const streamKeys = new Set(Object.keys(HEADNECK_NERVES).map(k => k.replace(/\s*\([ivx]+\)$/, '')));
    const candidates = [];
    for (const part of atlas.parts) {
      const raw = correctedPartName(part);
      if (anatomicalRegion(part) !== 'head-neck' && !HN_EXTRA_MUSCLE.test(raw)) continue;
      const key = cleanName(raw), cx = (part.bounds[0][0] + part.bounds[1][0]) / 2;
      let side = anatomicalSide(part);
      // a few paired structures carry no left/right in the model (short ciliary nerve, the sets of cervical intertransversarii): the side comes from the position of the mesh
      if (side === 'midline' && /^(?:short ciliary nerve|set of (?:anterior|posterior) cervical intertransversarii)$/.test(key)) side = cx > .012 ? 'left' : cx < -.012 ? 'right' : 'midline';
      let name = raw;
      if (side !== 'midline' && !/\b(left|right)\b/i.test(name)) name = `${side === 'left' ? 'Left' : 'Right'} ${lc(name)}`;
      const decision = headNeckSystem(raw, part.system), excluded = reason => hnExcluded.push({name, chinese: undefined, atlasSystem: part.system, side, reason});
      if ('exclusion' in decision) {excluded(decision.exclusion); continue;}
      if (decision.system === 'nervous' && streamKeys.has(key)) {excluded('duplicate-source'); continue;}
      const profile = structureProfile(name, part.system, {...part, name}), zhBase = HN_ZH[key];
      const zhRaw = zhBase ? (side === 'left' ? '左' : side === 'right' ? '右' : '') + zhBase : profile.chinese;
      const chinese = zhRaw && !/[a-z]/i.test(zhRaw) ? zhRaw : undefined;
      candidates.push({part, name, key, side, system: decision.system, chinese, atlasSystem: part.system});
    }
    // a tendon whose pair is missing in the model cannot be told apart by its name
    for (const c of candidates) if (c.system === 'tendon' && !candidates.some(o => o !== c && o.system === 'tendon' && o.side !== c.side && o.key.replace(/^tendon of /, '') === c.key.replace(/^tendon of /, ''))) c.reason = 'incomplete-pair';
    for (const c of candidates) {
      if (!c.chinese && !c.reason) c.reason = 'no-chinese-name';
      if (c.reason) {hnExcluded.push({name: c.name, chinese: c.chinese, atlasSystem: c.atlasSystem, side: c.side, reason: c.reason}); continue;}
      const {part} = c, chunk = atlas.chunks[part.chunk];
      if (!sourceBuffers.has(part.chunk)) sourceBuffers.set(part.chunk, fs.readFileSync(new URL('public' + chunk.url, root)));
      const raw = sourceBuffers.get(part.chunk);
      add({id: part.id, name: c.name, chinese: c.chinese, side: c.side, system: c.system, bounds: part.bounds, source: 'BodyParts3D', layer: headNeckLayerOf(c.key),
        positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12), normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6), indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
    }
    // The neck-vessel package replaces the atlas meshes of the common and internal carotid arteries and the internal jugular vein on the main site (and holds the external carotid artery); the quiz uses the same meshes.
    const neckVessels = JSON.parse(fs.readFileSync(new URL('neck-vessels.json', models)));
    for (const v of neckVessels.vessels) {
      const m = /^(.*?)\.([lr])$/.exec(v.name), side = m ? (m[2] === 'l' ? 'left' : 'right') : /^left\b/i.test(v.name) ? 'left' : 'right';
      const name = `${side === 'left' ? 'Left' : 'Right'} ${lc((m ? m[1] : v.name.replace(/^(Left|Right) /i, '')))}`;
      const zh = structureProfile(name, v.system).chinese, chinese = zh && !/[a-z]/i.test(zh) ? zh : undefined;
      if (!chinese) {hnExcluded.push({name, atlasSystem: v.system, side, reason: 'no-chinese-name'}); continue;}
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(v.positions), 3));
      geometry.setIndex(new BufferAttribute(new Uint32Array(v.indices), 1));
      geometry.computeVertexNormals(); geometry.computeBoundingBox();
      const normals = new Int16Array(v.positions.length);
      geometry.getAttribute('normal').array.forEach((x, i) => {normals[i] = Math.round(x * 32767);});
      add({id: `neckvessel:${v.name}`, name, chinese, system: v.system, side, bounds: [geometry.boundingBox.min.toArray(), geometry.boundingBox.max.toArray()], source: 'Z-Anatomy',
        positions: Buffer.from(new Float32Array(v.positions).buffer), normals: Buffer.from(normals.buffer), indices: Buffer.from(new Uint32Array(v.indices).buffer)});
      geometry.dispose();
    }
  }
  for (const part of region === 'heart' || region === 'brain' || region === 'head-neck' ? [] : atlas.parts) {
    if (!QUIZ_SYSTEMS.some(s => s.id === part.system)) continue;
    // tendons are asked per region once a region has enough of them (the limbs now; the other regions follow in later batches)
    if (part.system === 'tendon' && region !== 'upper-limb' && region !== 'lower-limb') continue;
    const side = include(region, part);
    if (!side) continue;
    let name = correctedPartName(part);
    if (side !== 'midline' && !/\b(left|right)\b/i.test(name)) name = `${side === 'left' ? 'Left' : 'Right'} ${lc(name)}`;
    const profile = structureProfile(name, part.system, {...part, name});
    // Keep the primary English source term authoritative; never show a half-translated fallback as a verified Chinese name.
    const chinese = profile.chinese && !/[a-z]/i.test(profile.chinese) ? profile.chinese : undefined;
    const chunk = atlas.chunks[part.chunk];
    if (!sourceBuffers.has(part.chunk)) sourceBuffers.set(part.chunk, fs.readFileSync(new URL('public' + chunk.url, root)));
    const raw = sourceBuffers.get(part.chunk);
    const belly = bellies.get(part.id), buf = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength);
    add({id: part.id, name, chinese, side, system: part.system, bounds: belly?.bounds ?? part.bounds, source: 'BodyParts3D',
      positions: belly ? buf(belly.positions) : raw.subarray(part.positions, part.positions + part.vertexCount * 12),
      normals: belly ? buf(belly.normals) : raw.subarray(part.normals, part.normals + part.vertexCount * 6),
      indices: belly ? buf(belly.indices) : raw.subarray(part.indices, part.indices + part.indexCount * 4)});
  }
  // Tendons cut off their muscles (parts of the course-summary package): asked in the region they lie in, like any other structure.
  if (region !== 'heart' && region !== 'lung' && region !== 'brain' && region !== 'head-neck') {
    const pk = JSON.parse(gunzipSync(fs.readFileSync(new URL('paokao/paokao-stream.json.gz', models))));
    const pkChunks = pk.chunks.map(c => fs.readFileSync(new URL('public' + c.url, root)));
    for (const part of pk.parts) {
      if (part.system !== 'tendon' || (region !== 'upper-limb' && region !== 'lower-limb')) continue;
      const q = {...part, system: 'tendon'}, side = include(region, q);
      if (!side) continue;
      const zh = paokaoZh(part.name) ?? undefined, raw = pkChunks[part.chunk];
      add({id: part.id, name: part.name, chinese: zh, side, system: 'tendon', bounds: part.bounds, source: 'BodyParts3D',
        positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12), normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6), indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
    }
  }

  for (const chunk of region === 'heart' || region === 'lung' || region === 'brain' ? [] : nerveStream.chunks) {
    let raw;
    for (const [ordinal, mesh] of chunk.meshes.entries()) {
      let match = /^(.*?)\.([lr])(?:\.\d+)?$/i.exec(mesh.name);
      // One cranial nerve mesh of the model (the right cochlear nerve) has no .l/.r in its name; its side is the side of its position (x < 0 is the right side of the body).
      if (!match && region === 'head-neck') {
        const bare = /^(.*?)\.\d+$/.exec(mesh.name);
        if (bare && NERVES[region][bare[1].toLowerCase()]) {
          raw ??= gunzipSync(fs.readFileSync(new URL('public' + chunk.url, root)));
          const xs = new Float32Array(raw.buffer.slice(raw.byteOffset + mesh.positions, raw.byteOffset + mesh.positions + mesh.vertexCount * 12)).filter((_, i) => i % 3 === 0);
          const middle = (xs.reduce((a, b) => Math.min(a, b)) + xs.reduce((a, b) => Math.max(a, b))) / 2;
          if (Math.abs(middle) > .012) match = [mesh.name, bare[1], middle > 0 ? 'l' : 'r'];
        }
      }
      const definition = match && NERVES[region][match[1].toLowerCase()];
      if (!definition) continue;
      const side = match[2].toLowerCase() === 'l' ? 'left' : 'right';
      const name = `${side === 'left' ? 'Left' : 'Right'} ${lc(match[1])}`;
      raw ??= gunzipSync(fs.readFileSync(new URL('public' + chunk.url, root)));
      const positions = raw.subarray(mesh.positions, mesh.positions + mesh.vertexCount * 12);
      const indices = raw.subarray(mesh.indices, mesh.indices + mesh.indexCount * 4);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions.buffer, positions.byteOffset, mesh.vertexCount * 3), 3));
      geometry.setIndex(new BufferAttribute(new Uint32Array(indices.buffer, indices.byteOffset, mesh.indexCount), 1));
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      const bounds = [geometry.boundingBox.min.toArray(), geometry.boundingBox.max.toArray()];
      // the vagus nerve runs down to the oesophagus and crosses to the other side of the midline below the neck (the thorax quiz asks it too)
      if (region !== 'thorax' && !(region === 'head-neck' && /^vagus nerve/i.test(match[1])) && ((side === 'right' && bounds[1][0] > .035) || (side === 'left' && bounds[0][0] < -.035))) throw Error(`Nerve laterality mismatch: ${mesh.name}`);
      const normals = new Int16Array(mesh.vertexCount * 3);
      geometry.getAttribute('normal').array.forEach((x, i) => {normals[i] = Math.round(x * 32767);});
      add({id: `nerve:${mesh.name}:${ordinal}`, name, chinese: applyZhFixes((side === 'left' ? '左' : '右') + (namingOverride(name) ?? definition.zh)),
        system: definition.system ?? 'nervous', side, bounds, source: definition.schematic ? 'Schematic model' : 'Nervous supplement', positions, normals: Buffer.from(normals.buffer), indices});
      geometry.dispose();
    }
  }

  if (region === 'head-neck') {
    // nerve overlay meshes of the neck that are not asked here (sympathetic structures run along the whole body; the brachial plexus is the upper-limb quiz's)
    const seenOther = new Set();
    for (const chunk of nerveStream.chunks) for (const mesh of chunk.meshes) {
      const match = /^(.*?)\.([lr])(?:\.\d+)?$/i.exec(mesh.name);
      if (!match || !HEADNECK_NERVE_OTHER.test(match[1]) || seenOther.has(match[0])) continue;
      seenOther.add(match[0]);
      const side = match[2].toLowerCase() === 'l' ? 'left' : 'right';
      hnExcluded.push({name: `${side === 'left' ? 'Left' : 'Right'} ${lc(match[1])}`, atlasSystem: 'nervous', side, reason: 'other-region'});
    }
  }

  // Joint soft tissue asked in this region (category 關節).
  for (const c of region === 'heart' || region === 'lung' || region === 'brain' ? [] : jointCandidates) {
    if (c.reason || c.region !== region) continue;
    const geometry = c.mesh.geometry.clone();
    geometry.computeVertexNormals();
    const pos = geometry.getAttribute('position'), index = geometry.index.array, normals = new Int16Array(pos.count * 3);
    geometry.getAttribute('normal').array.forEach((v, i) => {normals[i] = Math.round(v * 32767);});
    const positions = Buffer.from(new Float32Array(pos.array).buffer), indices = Buffer.from(new Uint32Array(index).buffer);
    add({id: c.id, name: c.name, chinese: c.chinese, system: 'joint', side: c.side, bounds: c.bounds, source: 'Z-Anatomy', positions, normals: Buffer.from(normals.buffer), indices});
    geometry.dispose();
  }

  // Head and neck: a typed name must have one right answer. Structures of one system that share a name once left and right are taken out (or one Chinese name on two English names) are not asked.
  if (region === 'head-neck') {
    const clashes = headNeckNameClashes([...structures.values()]), gone = new Set();
    for (const [, list] of clashes) for (const x of list) if (!gone.has(x.id)) {
      gone.add(x.id); hnExcluded.push({name: x.name, chinese: x.chinese, atlasSystem: x.system, side: x.side, reason: 'name-not-unique'});
    }
    for (const id of gone) structures.delete(id);
    for (let i = items.length - 1; i >= 0; i--) if (gone.has(items[i].structureId)) items.splice(i, 1);
  }

  // Limb spaces (category 特殊空間與孔): no mesh of their own; a question draws the structures of this catalogue that the layer panel names as boundary, roof, floor and contents (app/quiz/spaces.ts).
  // Every special region is in .sites-runtime/quiz-spaces-report.json, asked or not, with its reason (docs/quiz-spaces-pool.md).
  if (region === 'lower-limb' || region === 'upper-limb' || region === 'head-neck') {
    const candidates = [...structures.values()].map(({id, name, system, side}) => ({id, name, system, side}));
    const taken = new Set([...structures.values()].map(x => x.name.toLowerCase()));
    for (const def of SPACES) {
      const spaceRegion = SPACE_REGION[def.group];
      if (spaceRegion !== region) continue;
      for (const side of ['left', 'right']) {
        const entry = spaceRanges[def.id]?.[side], found = resolveSpace(def, side, candidates);
        let reason = spaceExclusion(def, spaceRegion, entry?.reach, found);
        const name = `${side === 'left' ? 'Left' : 'Right'} ${def.en.toLowerCase()}`, chinese = (side === 'left' ? '左' : '右') + def.zh;
        if (!reason && taken.has(name.toLowerCase())) reason = 'name-not-unique';
        spaceReport.push({id: def.id, en: def.en, zh: def.zh, side, region, group: def.group, reason, reach: entry?.reach, members: found.members.map(m => ({...m, name: candidates.find(c => c.id === m.id).name})), notDrawn: found.notDrawn});
        if (reason) continue;
        const [cx, cy, cz] = entry.c, r = spaceRanges[def.id].r, h = r * 1.6, bounds = [[cx - h, cy - h, cz - h], [cx + h, cy + h, cz + h]];   // the box the quiz frames: the range sphere of the layer panel, a little wider
        taken.add(name.toLowerCase());
        const id = `space:${def.id}:${side}`;
        structures.set(id, {id, name, chinese, system: 'space', side, sections: classifySections(region, name, bounds, 'space'), meshIds: [], bounds, source: 'Special regions', space: {id: def.id, members: found.members, notDrawn: found.notDrawn}});
      }
    }
  }

  if (region === 'head-neck') {
    fs.mkdirSync(new URL('.sites-runtime/', root), {recursive: true});
    fs.writeFileSync(new URL('.sites-runtime/quiz-head-neck-report.json', root), JSON.stringify({
      reasons: HN_EXCLUSION_REASONS,
      asked: [...structures.values()].map(x => ({name: x.name, chinese: x.chinese, system: x.system, side: x.side, sections: x.sections, source: x.source, ...(x.layer ? {layer: x.layer} : {}), meshes: x.meshIds.length})).sort((a, b) => a.name.localeCompare(b.name)),
      excluded: [...new Map(hnExcluded.map(e => [`${e.reason}|${e.side}|${e.name}`, e])).values()].sort((a, b) => a.reason.localeCompare(b.reason) || a.name.localeCompare(b.name)),
    }, null, 1));
  }
  const packages = [], sides = region === 'thorax' || region === 'back' || region === 'head-neck' || region === 'heart' || region === 'lung' || region === 'brain' ? ['left', 'right', 'midline'] : ['left', 'right'];
  for (const {id: system} of QUIZ_SYSTEMS) for (const side of sides) {
    let buffers = [], bytes = 0, meshes = [];
    const append = data => {
      const padding = (4 - bytes % 4) % 4;
      if (padding) {buffers.push(Buffer.alloc(padding)); bytes += padding;}
      const offset = bytes;
      buffers.push(data); bytes += data.length;
      return offset;
    };
    const flush = () => {
      if (!meshes.length) return;
      const buffer = Buffer.concat(buffers), hash = createHash('sha256').update(buffer).digest('hex').slice(0, 20);
      const name = `quiz-${short}-${hash}.bin`, compressed = gzipSync(buffer, {level: 9});
      fs.writeFileSync(new URL(name, output), buffer);
      fs.writeFileSync(new URL(name + '.gz', output), compressed);
      packages.push({system, side, url: '/models/stream/' + name, gzip: '/models/stream/' + name + '.gz', bytes, gzipBytes: compressed.length, meshes});
      buffers = []; bytes = 0; meshes = [];
    };
    for (const item of items.filter(m => m.system === system && m.side === side)) {
      if (bytes > 420000) flush();
      meshes.push({id: item.id, structureId: item.structureId, positions: append(item.positions), normals: append(item.normals), indices: append(item.indices),
        vertexCount: item.positions.length / 12, indexCount: item.indices.length / 4});
    }
    flush();
  }
  const catalogue = {version: 1, region, structures: [...structures.values()], packages};
  fs.writeFileSync(new URL(def.file, models), JSON.stringify(catalogue));
  const missing = catalogue.structures.filter(s => !s.chinese).length;
  summary.push(`${def.english}: ${catalogue.structures.length} named structures, ${items.length} unchanged meshes, ${(packages.reduce((s, p) => s + p.gzipBytes, 0) / 1e6).toFixed(2)} MB${missing ? `, ${missing} without a Chinese name` : ''}`);
}
for (const g of ['shoulder', 'arm', 'hand', 'lower', 'pelvis', 'head', 'trunk']) for (const def of SPACES.filter(d => d.group === g && !SPACE_REGION[g])) for (const side of ['left', 'right']) spaceReport.push({id: def.id, en: def.en, zh: def.zh, side, region: null, group: g, reason: 'not-limb', members: [], notDrawn: []});
fs.writeFileSync(new URL('.sites-runtime/quiz-spaces-report.json', root), JSON.stringify(spaceReport, null, 1));
console.log('Quiz catalogues — ' + summary.join('; ') + '.');
