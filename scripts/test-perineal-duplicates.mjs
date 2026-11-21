// The pelvic-floor and anal-sphincter meshes of the atlas come twice (the old mirrored set FJ1449M…FJ1465M, and the set FJ2542…FJ2553 that lies on top of it), and the mesh
// named "superficial perineal muscle" (FJ1450) is the right half of the external anal sphincter (the same 240 vertices as FJ2548). The viewer drops the copies
// (app/anatomy-source-overrides.json) so that every structure is drawn once and the name "superficial perineal muscle" no longer points at the sphincter.
// This checks, on the catalogue the viewer builds: one mesh each for the left and right coccygeus, iliococcygeus, pubococcygeus and puborectalis; one tendinous arch of the levator ani
// and one external anal sphincter half on each side; no mesh named "superficial perineal muscle"; and no two of these meshes lie on top of each other. Prints only pass / fail and counts.
//   node scripts/test-perineal-duplicates.mjs
import {loadFullAtlas} from './lib/full-atlas.mjs';

const {atlas, rawGeometry} = loadFullAtlas({streams: []});
const fails = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const centreX = p => (p.bounds[0][0] + p.bounds[1][0]) / 2;
const SIDED = ['coccygeus', 'iliococcygeus', 'pubococcygeus', 'puborectalis'];
const GROUPS = [...SIDED.flatMap(n => [`Left ${n}`, `Right ${n}`]), 'Tendinous arch of levator ani', 'External anal sphincter'];

/** Problems of a part list: wrong counts, a name that must be gone, and meshes that lie on one another. */
function problems(parts) {
  const out = [], by = n => parts.filter(p => p.name.toLowerCase() === n.toLowerCase());
  if (by('superficial perineal muscle').length) out.push('a mesh is still named "superficial perineal muscle"');
  for (const n of GROUPS) {
    const list = by(n), want = /^(Tendinous arch|External anal)/.test(n) ? 2 : 1;
    if (list.length !== want) out.push(`${n}: ${list.length} mesh(es), expected ${want}`);
    if (want === 2 && list.length === 2 && !(centreX(list[0]) * centreX(list[1]) < 0)) out.push(`${n}: the two halves are not on opposite sides`);
    if (/^Left /.test(n) && list.some(p => centreX(p) <= 0)) out.push(`${n} lies on the right`);
    if (/^Right /.test(n) && list.some(p => centreX(p) >= 0)) out.push(`${n} lies on the left`);
  }
  // two different meshes of this set with (nearly) the same centre and size are the same muscle drawn twice
  const set = parts.filter(p => GROUPS.some(n => n.toLowerCase() === p.name.toLowerCase()) || /superficial perineal/i.test(p.name));
  for (let i = 0; i < set.length; i++) for (let j = i + 1; j < set.length; j++) {
    const a = set[i], b = set[j]; let close = true;
    for (let k = 0; k < 3; k++) if (Math.abs(a.bounds[0][k] - b.bounds[0][k]) > .002 || Math.abs(a.bounds[1][k] - b.bounds[1][k]) > .002) close = false;
    if (close) out.push(`${a.name} (${a.id}) and ${b.name} (${b.id}) lie on top of each other`);
  }
  return out;
}

const bad = problems(atlas.parts.filter(p => /^FJ/.test(p.id)));
ok(bad.length === 0, bad.join('; '));
ok(atlas.parts.filter(p => /^FJ/.test(p.id) && GROUPS.some(n => n.toLowerCase() === p.name.toLowerCase())).every(p => p.vertexCount > 0 && rawGeometry(p).positions.length === p.vertexCount * 3), 'a pelvic-floor or sphincter mesh has no geometry');

// negative run: the checks have to fail on the atlas before the copies were dropped
const raw = JSON.parse((await import('node:fs')).readFileSync(new URL('../public/models/atlas.json', import.meta.url), 'utf8')).parts.filter(p => /^FJ/.test(p.id));
ok(problems(raw).length >= 4, 'negative run: the unfiltered atlas should be flagged');

console.log(fails.length ? `perineal duplicates: ${fails.length} of ${checks} checks FAILED\n${fails.join('\n')}` : `perineal duplicates: ${checks} checks passed`);
process.exit(fails.length ? 1 : 0);
