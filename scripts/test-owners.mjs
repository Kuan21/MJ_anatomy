// Display rules that depend on an owner structure (app/mj-owners.ts): tendons follow their muscle, vessels and nerves inside an organ follow the organ switch.
// Pure data checks on the runtime atlas: no browser. The pass/fail line only gives counts.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const root = new URL('../', import.meta.url), tmp = new URL('.sites-runtime/', root);
fs.mkdirSync(fileURLToPath(tmp), {recursive: true});
for (const f of ['mj-part-regions', 'mj-organ-owners', 'mj-tendon-owners', 'mj-owners']) {
  const src = fs.readFileSync(fileURLToPath(new URL(`app/${f}.ts`, root)), 'utf8');
  const js = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(fileURLToPath(new URL(`${f}.mjs`, tmp)), js);
}
const O = await import(new URL('mj-owners.mjs', tmp)), R = await import(new URL('mj-organ-owners.mjs', tmp));
// the base atlas is normalised by the app (app/mj-system-classifier.ts); the streamed packages keep the system they were written with
const {atlas} = loadFullAtlas(), parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)}), owners = O.buildOwners(parts);
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL ' + m); } };
const on = (...ids) => ({has: s => ids.includes(s)});

// ---- tendons
const tendons = parts.filter(p => p.system === 'tendon');
ok(tendons.length > 0, 'no tendon parts');
for (const t of tendons) {
  const m = owners.muscleOf.get(t.id);
  ok(m && m.length > 0, `tendon without an owner muscle: ${t.name}`);
  for (const id of m ?? []) { const mp = owners.byId.get(id); ok(mp.system === 'muscular', `owner of ${t.name} is not a muscle: ${mp.name}`); }
  ok(!O.ownerSwitchesOn(owners, t, on('skeletal', 'tendon')), `tendon ${t.name} is shown with Muscles off`);
  ok(O.ownerSwitchesOn(owners, t, on('muscular', 'tendon')), `tendon ${t.name} is hidden with Muscles on`);
  // a tendon of one side belongs to a muscle of the same side
  const side = /\bleft\b/i.test(t.name) ? 'left' : /\bright\b/i.test(t.name) ? 'right' : null;
  for (const id of m ?? []) { const mn = owners.byId.get(id).name; ok(!side || new RegExp(`\\b${side}\\b`, 'i').test(mn), `${t.name} owned by a muscle of the other side: ${mn}`); }
}
// the muscle of a selected tendon is the reference
const t0 = tendons[0], ref = O.referenceMuscles(owners, [t0.id]);
ok(ref.size === owners.muscleOf.get(t0.id).length, 'reference muscles of a selected tendon');
ok(O.referenceMuscles(owners, [t0.id, ...owners.muscleOf.get(t0.id)]).size === 0, 'a muscle that is selected itself is not a faded reference');
// tendon sheaths, the dorsal compartments of the wrist and the palmar aponeurosis follow their muscle; ligaments, retinacula, capsules and vessel sheaths do not
const followers = /tendon sheath|dorsal compartment of wrist|palmar aponeurosis/i;
const fol = parts.filter(q => q.system === 'connective' && followers.test(q.name));
ok(fol.length === 22, `expected 22 sheaths, compartments and palmar aponeuroses, found ${fol.length}`);
for (const p of fol) {
  const m = owners.muscleOf.get(p.id); ok(m && m.length > 0, `sheath without an owner muscle: ${p.name}`);
  const side = /\bleft\b/i.test(p.name) ? 'left' : 'right';
  for (const id of m ?? []) { const mp = owners.byId.get(id); ok(mp.system === 'muscular' && new RegExp(`\\b${side}\\b`, 'i').test(mp.name), `owner of ${p.name} is wrong: ${mp.name}`); }
  ok(!O.ownerSwitchesOn(owners, p, on('connective')), `${p.name} is shown with Muscles off`);
  ok(O.ownerSwitchesOn(owners, p, on('muscular', 'connective')), `${p.name} is hidden with Muscles on`);
}
const ownerOf = n => (owners.muscleOf.get(parts.find(q => q.name === n)?.id) ?? []).map(id => owners.byId.get(id).name).filter((n, i, a) => a.indexOf(n) === i).sort().join(' | ');
ok(ownerOf('Right common flexor tendon sheath') === 'Right flexor digitorum profundus | Right flexor digitorum superficialis', 'common flexor sheath owners: ' + ownerOf('Right common flexor tendon sheath'));
ok(ownerOf('Left intertubercular tendon sheath') === 'Long head of left biceps brachii', 'intertubercular sheath owner');
ok(ownerOf('Right palmar aponeurosis') === 'Right palmaris longus', 'palmar aponeurosis owner');
for (const p of parts.filter(q => q.system === 'connective' && !followers.test(q.name))) ok(!owners.muscleOf.has(p.id) && O.ownerSwitchesOn(owners, p, on('connective')), `connective ${p.name} must not follow Muscles`);

// ---- organs
const strip = n => n.toLowerCase().replace(/\b(?:left|right) /g, '');
const owner = name => { const p = parts.find(q => strip(q.name) === name.toLowerCase()); ok(!!p, `missing part ${name}`); return p && O.organOwner(p); };
for (const [n, o] of [
  ['Trunk of coronary artery', 'cardiac'], ['Circumflex branch of coronary artery', 'cardiac'], ['Great cardiac vein', 'cardiac'], ['Coronary sinus', 'cardiac'], ['Middle cardiac vein', 'cardiac'],
  ['posterior segmental artery', 'respiratory'], ['upper lobar artery', 'respiratory'], ['Bronchial artery', 'respiratory'], ['Superior lingular vein', 'respiratory'],
  ['hepatic vein', 'digestive'], ['Posterior superior segmental hepatic artery', 'digestive'], ['Esophageal plexus', 'digestive'], ['gastric artery', 'digestive'],
  ['Superior segmental branch of renal artery', 'urinary'], ['uterine artery', 'reproductive'],
  // passing structures: never hidden with an organ
  ['Ascending aorta', null], ['Arch of aorta', null], ['Descending thoracic aorta', null], ['Superior vena cava', null], ['Inferior vena cava', null], ['Brachiocephalic vein', null], ['Azygos vein', null],
  ['Hemiazygos vein', null], ['Pulmonary trunk', null], ['pulmonary artery', 'respiratory'], ['Superior pulmonary vein', 'respiratory'], ['Inferior pulmonary vein', 'respiratory'], ['Renal artery', null], ['Renal vein', null], ['Common hepatic artery', null], ['Trunk of hepatic artery', null], ['Trunk of portal vein', null], ['Hepatic portal vein', null], ['Splenic artery', null], ['Splenic vein', null], ['phrenic nerve', null], ['recurrent laryngeal nerve', null],
  ['Anterior vagal trunk', null], ['Posterior vagal trunk', null], ['Posterior intercostal arteries', null], ['pericardiophrenic artery', null], ['Thoracic duct', null], ['Splenic artery', null],
  ['Hepatic artery proper', null], ['Trunk of renal artery', null], ['Celiac trunk', null], ['Superior mesenteric artery', null], ['Axillary artery', null], ['Femoral artery', null],
]) ok(owner(n) === o, `${n}: owner ${owner(n)} (expected ${o})`);
// the lung's segmental arteries and the kidney's share names but not positions
const seg = parts.filter(p => /segmental artery$/i.test(p.name) && p.system === 'arterial');
ok(seg.some(p => O.organOwner(p) === 'respiratory') && seg.some(p => O.organOwner(p) === 'urinary'), 'segmental arteries split between lung and kidney by position');
// no dead rule, and no vessel of the heart or lung slips through
for (const r of R.ORGAN_RULES) ok(parts.some(p => O.organOwner(p) === r.organ && r.re.test(p.name.toLowerCase().replace(/\b(?:left|right) /g, ''))), `rule never used: ${r.re}`);
for (const p of parts.filter(q => (q.system === 'arterial' || q.system === 'venous') && /coronary|cardiac vein|bronchial (?:artery|branch)/i.test(q.name))) ok(!!owners.organ.get(p.id), `${p.name} has no owner organ`);
// display: with the organ off the in-organ vessels are gone, with it on they are back; passing vessels never depend on it
const heartOff = on('arterial', 'venous', 'nervous', 'skeletal', 'muscular', 'connective', 'tendon'), heartOn = on('arterial', 'venous', 'nervous', 'cardiac');
const coronary = parts.filter(p => /coronary/i.test(p.name) && p.system === 'arterial');
ok(coronary.length > 20 && coronary.every(p => !O.ownerSwitchesOn(owners, p, heartOff) && O.ownerSwitchesOn(owners, p, heartOn)), 'coronary vessels follow the Cardiac switch');
const aorta = parts.filter(p => /^(?:ascending aorta|arch of aorta|descending aorta|descending thoracic aorta|abdominal aorta)$/.test(strip(p.name)));
ok(aorta.length > 0 && aorta.every(p => O.ownerSwitchesOn(owners, p, heartOff)), 'the aorta never follows an organ switch');
const counts = {}; for (const o of owners.organ.values()) counts[o] = (counts[o] ?? 0) + 1;

if (fails) { console.error(`${fails} owner check(s) failed`); process.exit(1); }
console.log(`Owners OK: ${tendons.length} tendon parts each tied to the muscle it belongs to (cut specs, name or proximity: docs/tendon-owners.md); ${owners.organ.size} in-organ vessel/nerve parts (${Object.entries(counts).map(([k, v]) => k + ' ' + v).join(', ')}); passing structures and connective tissue unaffected.`);
