// Retropharyngeal space layer (schematic): a thin layer behind the pharynx wall, skull base to about C6, 2 mm thick, entering no structure by more than 0.3 mm unless the pharynx wall is already inside it.
// 1. extent: from at most y 1.572 m down to at least 1.470 m, at least 30 mm wide at the middle, at most 45 mm; mean thickness between 1.6 and 2.1 mm; the front face is behind every pharynx wall (the layer does not push into the pharynx by more than 0.3 mm);
// 2. no structure is entered by more than 0.3 mm unless the pharynx wall is inside it already (those are listed by scripts/measure-retropharyngeal-space.mjs);
// 3. reverse control: the same layer built without the thinning (no structures to avoid) is caught by check 2.
import assert from 'node:assert/strict';
import {measure} from './measure-retropharyngeal-space.mjs';
const now = measure(), bad = r => r.rows.filter(x => x.verdict === 'violation'), t = now.thickness;
const width = (t.bbox[1][0] - t.bbox[0][0]) * 1000, topY = t.bbox[1][1], botY = t.bbox[0][1];
assert.ok(topY >= 1.568 && topY <= 1.58, `top of the layer y ${topY.toFixed(3)} m (skull base)`);
assert.ok(botY <= 1.470 && botY >= 1.46, `bottom of the layer y ${botY.toFixed(3)} m (about C6)`);
assert.ok(width >= 30 && width <= 45, `width ${width.toFixed(0)} mm`);
assert.ok(t.mean >= 1.6 && t.mean <= 2.1, `mean thickness ${t.mean.toFixed(2)} mm`);
for (const r of now.rows.filter(x => x.pharynx)) assert.ok(r.deepest <= .3, `the layer enters ${r.name} by ${r.deepest.toFixed(2)} mm`);
assert.deepEqual(bad(now).map(x => `${x.name} ${x.deepest.toFixed(1)}`), [], 'structures entered by more than 0.3 mm that the pharynx wall is not inside');
const old = measure({avoid: []});
assert.ok(bad(old).length > 0, 'without the thinning the layer enters some structure and is caught');
console.log(`Retropharyngeal space: ${now.verts} vertices per face, mean thickness ${t.mean.toFixed(2)} mm, y ${(botY * 1000).toFixed(0)} to ${(topY * 1000).toFixed(0)} mm, ${width.toFixed(0)} mm wide; no structure entered by more than 0.3 mm except ${now.rows.filter(x => x.verdict === 'existing').length} where the pharynx wall already is inside; unthinned layer caught (${bad(old).length} structures).`);
