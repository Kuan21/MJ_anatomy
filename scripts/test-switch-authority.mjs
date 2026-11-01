// The system switches of the left panel decide what is drawn in every mode (UI rule, 2026-11-02): no mode or feature may force a structure on screen while its switch is off.
//  1. Lung view (肺 button / 胸腔 → 肺與胸膜): every call that rebuilds the lung view passes the current state of the Skeleton switch, so a side, label, opacity or
//     bronchi/vessel change never switches the see-through rib cage back on; the Lungs panel has a 胸廓參照 switch that is the Skeleton switch itself (same state, same toggle).
//  2. Scene: a selected structure, the reference muscle of a selected tendon, a picked neck vessel and a picked joint structure are drawn only while their system is on.
//  3. Labels start below the region bar and the top toolbar instead of a fixed 80 px.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const page = text('app/page.tsx'), scene = text('app/scene.tsx'), neck = text('app/biomechanics-v2/neck-vessels.ts'), joints = text('app/biomechanics-v2/joint-anatomy.ts');

// 1. lung view
const calls = [...page.matchAll(/(?<!const )lungParts\(/g)].map(m => page.slice(m.index, m.index + 140));
assert.ok(calls.length >= 3, 'lung view rebuilds found');
for (const a of calls) assert.match(a, /^lungParts\([^;]*?visible\.includes\('skeletal'\)\)/, `a lung-view rebuild must keep the Skeleton switch as it is: ${a.slice(0, 90)}`);
assert.match(page, /visible:\[\.\.\.\(skeleton\?\['skeletal'\]:\[\]\),'respiratory','serous'/, 'the rib cage is in the visible systems only when the Skeleton switch is on');
assert.match(page, /Rib cage reference<\/span>[\s\S]{0,300}checked=\{state\.visible\.includes\('skeletal'\)\} onCheckedChange=\{\(\)=>toggle\('skeletal'\)\}/, 'the 胸廓參照 switch reads and toggles the Skeleton switch itself');
assert.match(page, /checked=\{lungInner\.vessels&&state\.visible\.includes\('arterial'\)&&state\.visible\.includes\('venous'\)\}/, 'the Pulmonary vessels switch shows off when Arteries or Veins are off');

// 2. scene
assert.match(scene, /if\(selection\.has\(p\.id\)&&visible\.has\(p\.system\)&&/, 'a selected structure is drawn only while its system is on');
assert.match(scene, /if\(refMuscles\.has\(p\.id\)\)return visible\.has\('muscular'\);/, 'the reference muscle follows the Muscles switch');
assert.ok(!/if\(refMuscles\.has\(p\.id\)\)return true;/.test(scene), 'no unconditional reference-muscle override');
assert.match(neck, /explode<\.01&&s\.visible\.includes\(r\.system\)&&\(picked\|\|/, 'a picked neck vessel needs its system switch');
assert.match(joints, /explode<\.01&&s\.visible\.includes\('connective'\)&&\(selected\|\|/, 'a picked joint structure needs the Connective switch');
assert.match(page, /\(v\.selection\.has\(p\.id\)&&v\.visible\.has\(p\.system\)\)\|\|\(v\.refMuscles\.has\(p\.id\)&&v\.visible\.has\('muscular'\)\)/, 'the part counter applies the same rule');

// 3. labels
assert.match(scene, /const labelTopLimit=\(rect:DOMRect,fallback:number\)=>\{[^\n]*'\.body-region-nav','\.top-actions','\.identity'/, 'label columns start below the region bar and the toolbar');
assert.equal((scene.match(/labelTopLimit\(rect,/g) ?? []).length, 2, 'both label layers (space labels, part labels) use the limit');
assert.ok(!/Math\.max\(p\.a\.y,lastY\+Math\.max\(27,\(lastH\+bh\)\/2\+5\),80\)/.test(scene), 'no fixed 80 px top for space labels');
assert.ok(!/ly\[k\]=Math\.max\(ly\[k\],Math\.min\(84,hLim\/3\),/.test(scene), 'no fixed 84 px top for part labels');
console.log('Switch authority OK: lung view keeps the Skeleton switch, selection/reference/overlay draws need their system switch, labels start below the top bars.');
