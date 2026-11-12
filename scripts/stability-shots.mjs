// Fixed-view screenshots of a built site and the before/after comparison for a PR.
//   node scripts/stability-shots.mjs --after dist [--before <dist of main>] [--out /tmp/claude-0/stability-shots] [--only whole,head]
// --before is a production build of main (npm run build -- --outDir <dir> in a main checkout); without it only the after set is made. Uses vite preview (never the dev server).
import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const after = arg('after', 'dist'), before = arg('before'), out = arg('out', '/tmp/claude-0/stability-shots'), only = arg('only', '');
fs.mkdirSync(out, {recursive: true});
const serve = (dist, port) => new Promise((res, rej) => {
  const p = spawn('npx', ['vite', 'preview', '--outDir', path.resolve(dist), '--port', String(port), '--host', '127.0.0.1', '--strictPort'], {stdio: ['ignore', 'pipe', 'inherit']});
  p.stdout.on('data', d => { if (/Local|127\.0\.0\.1/.test(String(d))) res(p); }); p.on('error', rej); setTimeout(() => res(p), 15000);
});
const shoot = (port, tag) => spawnSync('node', ['scripts/browser/stability-shots.cjs', String(port), out, tag, only], {stdio: 'inherit', env: {...process.env, NODE_PATH: process.env.NODE_PATH || '/opt/node-tools/node_modules'}});
const jobs = [[after, 5871, 'after'], ...(before ? [[before, 5872, 'before']] : [])];
for (const [dist, port, tag] of jobs) { const s = await serve(dist, port); try { shoot(port, tag); } finally { s.kill(); } }
if (before) spawnSync('python3', ['scripts/stability-compare.py', out, out, path.join(out, 'compare')], {stdio: 'inherit'});
console.log('Screenshots in ' + out);
