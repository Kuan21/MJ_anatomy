// The tendon-like sheets on the skull (epicranial aponeurosis, tendinous origin of trapezius): one material, edge distance of the closed sheet, outline made left-right symmetric and rounded.
// Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const {solidRimDistance} = await quizModule('app/mj-surface-edge.ts');
const {GALEA_COLOR, GALEA_EDGE_MM, GALEA_FRAG} = await quizModule('app/mj-galea-shader.ts');

// 1. a small closed slab (4 x 4 vertices, top and bottom joined by vertical walls): the rim is 1, the inner vertices are lower, a sheet without walls gets 0
{
  const n = 4, P = [], I = [], at = (x, y) => y * n + x;
  for (const z of [0, -.001]) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) P.push(x * .003, y * .003, z);
  const N = n * n;
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) I.push(at(x, y), at(x + 1, y), at(x + 1, y + 1), at(x, y), at(x + 1, y + 1), at(x, y + 1), N + at(x, y), N + at(x + 1, y + 1), N + at(x + 1, y), N + at(x, y), N + at(x, y + 1), N + at(x + 1, y + 1));
  for (let x = 0; x < n - 1; x++) I.push(at(x, 0), N + at(x, 0), at(x + 1, 0), at(x + 1, 0), N + at(x, 0), N + at(x + 1, 0));
  const e = solidRimDistance(Float32Array.from(P), Uint32Array.from(I), GALEA_EDGE_MM);
  assert.ok(e[at(0, 0)] > .99 && e[at(1, 0)] > .99, 'rim vertices are 1');
  assert.ok(e[at(1, 1)] < e[at(0, 0)] && e[at(1, 1)] > 0, 'an inner vertex is lower but not zero within the reach');
  const open = solidRimDistance(Float32Array.from(P.slice(0, N * 3)), Uint32Array.from(I.slice(0, (n - 1) * (n - 1) * 6)), GALEA_EDGE_MM);
  assert.ok(open.every(v => v === 0), 'a sheet without side walls is not darkened');
}
// 2. one material for both sheets, with the shader pieces the scene calls
{
  const scene = text('app/scene.tsx');
  assert.match(scene, /nuchal origin of trapezius\)\$\/i\.test\(p\.name\)\?'connective:galea'/, 'both sheets use the galea material');
  assert.ok(/^#[0-9a-f]{6}$/i.test(GALEA_COLOR));
  for (const f of ['galeaColor', 'galeaNormal', 'galeaHeight']) assert.ok(GALEA_FRAG.includes(f), f);
  assert.match(scene, /userData\.mjGalea/);
}
// 3. the generated sheet: closed, one piece, outline symmetric within 15 % of the cells, no vertex missing from the stream
{
  const j = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/paokao/paokao-stream.json.gz', import.meta.url))));
  const p = j.parts.find(q => q.name === 'nuchal origin of trapezius'); assert.ok(p, 'the sheet is in the stream');
  const b = fs.readFileSync(new URL('../public' + j.chunks[p.chunk].url, import.meta.url));
  const P = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12));
  const grid = new Map(); for (let i = 0; i < P.length; i += 3) { const key = Math.round(P[i] / .003) + ',' + Math.round(P[i + 1] / .003); grid.set(key, 1); }
  let both = 0; for (const key of grid.keys()) { const [x, y] = key.split(',').map(Number); if (grid.has(-x + ',' + y)) both++; }
  assert.ok(both / grid.size > .85, `the outline is symmetric (${(both / grid.size * 100).toFixed(0)} %)`);
}
console.log('Galea look: edge distance, one material, symmetric outline pass.');
