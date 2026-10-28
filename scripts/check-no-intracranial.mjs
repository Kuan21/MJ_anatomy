// The main atlas must not draw brain or brain-stem pieces of the nerve overlay inside the skull (they showed as yellow blocks).
// 1. Names in app/biomechanics-v2/blocked-overlay-meshes.json may not appear in any main-atlas data file.
// 2. Nothing of the nerve overlay inside the cranial cavity may be anything but a cranial nerve, ganglion or the schematic suboccipital model.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const read = f => fs.readFileSync(f);
const blocked = JSON.parse(read('app/biomechanics-v2/blocked-overlay-meshes.json')).names;
assert.ok(blocked.length >= 35, 'blocked list shrank');
const scan = ['app/biomechanics-v2/body-nerve-bindings.json', 'app/biomechanics-v2/nerve-bindings.json', 'public/models/nerve-stream.json', 'public/models/atlas.json',
  ...fs.readdirSync('public/models').filter(f => /^(search|quiz-).*\.json$/.test(f)).map(f => 'public/models/' + f)];
const bad = [];
for (const file of scan) {
  if (!fs.existsSync(file)) continue;
  const text = read(file).toString('utf8');
  for (const name of blocked) if (text.includes(JSON.stringify(name))) bad.push(`${name} in ${file}`);
}
assert.deepEqual(bad, [], `Blocked intracranial meshes are back in the data:\n${bad.join('\n')}`);

const atlas = JSON.parse(read('public/models/atlas.json'));
const vault = atlas.parts.filter(p => /^(frontal bone|left parietal bone|right parietal bone|left temporal bone|right temporal bone|occipital bone|sphenoid bone|ethmoid)$/i.test(p.name));
assert.ok(vault.length >= 6, 'cranial bones not found');
const box = [0, 1, 2].map(k => [Math.min(...vault.map(p => p.bounds[0][k])), Math.max(...vault.map(p => p.bounds[1][k]))]);
const inside = c => c.every((v, k) => v > box[k][0] && v < box[k][1]);
const stream = JSON.parse(read('public/models/nerve-stream.json'));
const cranialNerve = /nerve|ganglion|ganglia/i, centralNames = /nucle|sulcus|gyr|pole|vermis|pyramid|tract|lemniscus|peduncle|colliculus|ventric|cerebell|brain|lobe|lobule|fissure|striat|\bpons\b|medulla oblongata|decussation|fasciculus|capsule|choroid/i;
let checked = 0;
const wrong = [];
for (const chunk of stream.chunks) {
  const raw = zlib.gunzipSync(read('public' + chunk.url));
  for (const m of chunk.meshes) {
    const pos = new Float32Array(raw.buffer.slice(raw.byteOffset + m.positions, raw.byteOffset + m.positions + m.vertexCount * 12));
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) {mn[k] = Math.min(mn[k], pos[i + k]); mx[k] = Math.max(mx[k], pos[i + k]);}
    if (!inside(mn.map((v, k) => (v + mx[k]) / 2))) continue;
    checked++;
    if (!m.schematic && (!cranialNerve.test(m.name) || centralNames.test(m.name.replace(/nerve/gi, '')))) wrong.push(m.name);
  }
}
assert.deepEqual(wrong, [], `Not a cranial nerve, but inside the skull: ${wrong.join('; ')}`);
console.log(`No intracranial brain pieces: ${blocked.length} blocked meshes absent from every data file; ${checked} overlay meshes inside the skull are all cranial nerves or the schematic model.`);
