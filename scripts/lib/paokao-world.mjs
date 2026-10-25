// Read access to every mesh the viewer draws (atlas, supplement, serous, heart, female, nerves), by English name, for building structures that sit on them.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {meshOf, closest, sub, add, mul, unit, len, lerp, dot, cross} from './heart-geom.mjs';

const root = new URL('../../', import.meta.url), models = new URL('public/models/', root);
const read = f => fs.readFileSync(new URL(f, models));
const f32 = (b, o, n) => new Float32Array(b.buffer.slice(b.byteOffset + o, b.byteOffset + o + n * 4)), u32 = (b, o, n) => new Uint32Array(b.buffer.slice(b.byteOffset + o, b.byteOffset + o + n * 4));

export function loadWorld({paokao = false} = {}) {
  const entries = [];   // {name, system, positions, indices} (lazy)
  const bufs = new Map(), buffer = (url, gz) => { if (!bufs.has(url)) { const b = read(url.replace(/^\/models\//, '')); bufs.set(url, gz ? gunzipSync(b) : b); } return bufs.get(url); };
  const atlas = JSON.parse(read('atlas.json'));
  for (const p of atlas.parts) entries.push({name: p.name, id: p.id, concept: p.conceptId, system: p.system, load: () => { const b = buffer(atlas.chunks[p.chunk].url); return {positions: f32(b, p.positions, p.vertexCount * 3), indices: u32(b, p.indices, p.indexCount)}; }});
  for (const f of ['supplement/supplement-stream.json.gz', 'serous/serous-stream.json.gz', 'female/female-stream.json.gz']) {
    const m = JSON.parse(gunzipSync(read(f)));
    for (const p of m.parts) entries.push({name: p.name, id: p.id, system: p.system, load: () => { const b = buffer(m.chunks[p.chunk].url); return {positions: f32(b, p.positions, p.vertexCount * 3), indices: u32(b, p.indices, p.indexCount)}; }});
  }
  if (paokao) {
    const m = JSON.parse(gunzipSync(read('paokao/paokao-stream.json.gz')));
    for (const p of m.parts) entries.push({name: p.name, id: p.id, concept: p.conceptId, system: p.system, load: () => { const b = buffer(m.chunks[p.chunk].url); return {positions: f32(b, p.positions, p.vertexCount * 3), indices: u32(b, p.indices, p.indexCount)}; }});
  }
  const nerves = JSON.parse(read('nerve-stream.json').toString());
  for (const c of nerves.chunks) for (const m of c.meshes) entries.push({name: m.name.replace(/\.[lr]\.001$/, m.name.endsWith('.l.001') ? '.l' : '.r').replace(/\.001$/, ''), id: m.name, system: 'nervous', raw: m.name, load: () => { const b = buffer(c.url, true); return {positions: f32(b, m.positions, m.vertexCount * 3), indices: u32(b, m.indices, m.indexCount)}; }});
  const cache = new Map();
  /** Geometry that is not on disk yet (structures built in this run) so later specs and the topology check can refer to it by name. */
  const addExtra = (name, system, geometry) => { entries.push({name, id: 'extra:' + name, system, load: () => geometry}); cache.delete(name); };
  const find = (name) => {
    const n = name.toLowerCase(), exact = entries.filter(e => e.name.toLowerCase() === n);
    if (exact.length) return exact;
    // Some paired structures are stored once without a side word ("Internal thoracic vein" is the left one): accept it when it lies on the requested side.
    const m = /^(left|right) (.+)$/.exec(n); if (!m) return [];
    const sx = m[1] === 'left' ? 1 : -1;
    return entries.filter(e => e.name.toLowerCase() === m[2] && (() => { const g = e.load(); let x = 0; for (let i = 0; i < g.positions.length; i += 3) x += g.positions[i]; return Math.sign(x) === sx; })());
  };
  /** One mesh made of every part with this exact name (several parts can share a name). */
  function mesh(name) {
    if (cache.has(name)) return cache.get(name);
    const list = find(name); if (!list.length) throw new Error(`paokao: no mesh named "${name}"`);
    let pos = [], idx = [];
    for (const e of list) { const g = e.load(), base = pos.length / 3; pos = pos.concat(Array.from(g.positions)); for (const i of g.indices) idx.push(i + base); }
    const m = meshOf(Float32Array.from(pos), Uint32Array.from(idx)); cache.set(name, m); return m;
  }
  const has = name => find(name).length > 0;
  return {mesh, has, entries, find, addExtra};
}
export {closest, sub, add, mul, unit, len, lerp, dot, cross};
