// "Path from the root" highlight: the parent table, the name logic (both sides), and the wiring in the scene (only when asked for, never moves the camera, own colour).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
await build({entryPoints: [file('scripts/lib/vessel-path-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: file('.sites-runtime/vessel-path-test.mjs'), loader: {'.json': 'json'}, logLevel: 'error'});
const m = await import(file('.sites-runtime/vessel-path-test.mjs'));
const {mirrorName, pathAbove, pathHighlightNames, plainName, VESSEL_PARENTS: P} = m;

// the other side of a name
assert.equal(mirrorName('Right radial artery'), 'Left radial artery');
assert.equal(mirrorName('Left lateral cord of brachial plexus'), 'Right lateral cord of brachial plexus');
assert.equal(mirrorName('Median nerve.r.001'), 'Median nerve.l', 'nerve suffix, duplicate suffix dropped');
assert.equal(mirrorName('Pectoral branch of left thoraco-acromial artery'), 'Pectoral branch of right thoraco-acromial artery', 'lower-case side inside a name');
assert.equal(mirrorName('Arch of aorta'), 'Arch of aorta', 'a midline structure is its own mirror');
assert.equal(plainName('Sciatic nerve.l.001'), 'Sciatic nerve.l');

// the table: every parent chain ends, and each end is a root the anatomy names (the aorta, a vena cava, a spinal nerve root, a plexus-less nerve trunk)
const ROOTS = /^(Arch of aorta|Superior vena cava|Inferior vena cava|(Right|Left) C[5-8] spinal nerve|Sciatic nerve\.[lr]|Sympathetic trunk\.[lr]|Vagus nerve \(X\)\.[lr]|Posterior interventricular branch of right coronary artery)$/;
const ends = new Set(); let loops = 0;
for (const c of Object.keys(P)) { const seen = new Set([c]), stack = [...P[c]]; let guard = 0; while (stack.length && guard++ < 1000) { const x = stack.pop(); if (x === c) { loops++; break; } if (seen.has(x)) continue; seen.add(x); if (P[x]) stack.push(...P[x]); else ends.add(x); } }
assert.equal(loops, 0, 'no parent chain loops back');
const strays = [...ends].filter(e => !ROOTS.test(e));
assert.deepEqual(strays, [], `every chain ends at a root (stray ends: ${strays.join('; ')})`);
assert.ok(Object.keys(P).length > 250, 'the table has the arteries, veins and nerves it had');

// paths
const up = pathAbove('Right radial artery'); assert.deepEqual(up.slice(0, 3), ['Right brachial artery', 'Right axillary artery', 'Right subclavian artery']); assert.equal(up.at(-1), 'Arch of aorta');
assert.ok(pathAbove('Left lateral thoracic vein').includes('Superior vena cava'), 'a vein of the chest wall reaches the superior vena cava');
assert.ok(pathAbove('Right femoral vein').includes('Inferior vena cava'), 'a leg vein reaches the inferior vena cava');
const cubital = pathAbove('Right median cubital vein'); assert.ok(cubital.includes('Right cephalic vein') && cubital.includes('Right basilic vein'), 'two parents: both are on the path');
assert.ok(pathAbove('Median nerve.l').some(n => /lateral root of median nerve/.test(n)) && pathAbove('Median nerve.l').some(n => /medial root of median nerve/.test(n)), 'median nerve: both roots');
assert.ok(pathAbove('Musculocutaneous nerve.r').includes('Right lateral cord of brachial plexus') && pathAbove('Musculocutaneous nerve.r').includes('Right C5 spinal nerve'), 'a nerve of the arm reaches the spinal nerves through trunk and cord');
assert.deepEqual(pathAbove('Arch of aorta'), [], 'a root has nothing above it');
assert.deepEqual(pathAbove('No such structure'), [], 'an unknown name has nothing above it');
assert.deepEqual(pathAbove('Right radial artery', {'Right radial artery': ['A'], A: ['B'], B: ['A']}), ['A', 'B'], 'a loop in a table does not hang');

// both sides: the other side's structure and its path, never the selected structure itself
const both = pathHighlightNames(['Left radial artery']);
assert.ok(both.has('Right radial artery') && both.has('Right brachial artery') && both.has('Left brachial artery') && both.has('Arch of aorta'), 'both sides, up to the aorta');
assert.ok(!both.has('Left radial artery'), 'the selected structure is not part of its path');
assert.equal(pathHighlightNames(['Arch of aorta']).size, 0, 'a root selected: nothing else lights up');
assert.equal(pathHighlightNames(['Left brachial plexus whatever']).size, 0, 'a structure of no table: nothing lights up');
assert.deepEqual([...pathHighlightNames(['Left radial artery', 'Left brachial artery'])].filter(n => n === 'Left brachial artery'), [], 'a second selected structure is not lit as a path');

// the scene: off unless asked, own colour and code, camera untouched
const scene = fs.readFileSync(file('app/scene.tsx'), 'utf8'), page = fs.readFileSync(file('app/page.tsx'), 'utf8');
assert.match(scene, /selectionPath=false/, 'the path highlight is off unless the page asks for it');
assert.match(page, /<AnatomyScene[\s\S]*?bodyArea=\{topRegion\} selectionPath\/>/, 'the atlas page asks for it');
assert.match(scene, /PATH_CODE=60/); assert.match(scene, /pathNow\.ids\.has\(p\.id\)\?PATH_CODE:0/, 'path parts get the path code in the selection texture, only when not selected themselves');
assert.match(scene, /selCode >= 30\.0 && selCode < 100\.0/, 'the shader tells the path code from the pick codes');
assert.ok(!/pathNow[^;]*camera|path[^;]*controls\.target/i.test(scene.slice(scene.indexOf('const pathOf'), scene.indexOf('const pathOf') + 900)), 'the path code never touches the camera');
console.log(`Vessel path OK: ${Object.keys(P).length} structures with a parent, ${ends.size} roots, both sides, off unless asked for.`);
