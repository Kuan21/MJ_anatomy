// The vessel-end audit (scripts/audit-vessel-ends.mjs) decides what is a vessel by the source system plus NOT_VESSELS; the viewer decides by displaySystem (app/mj-system-classifier.ts).
// The two must agree for every part of the atlas, or end pieces are built for parts the viewer shows as something else (the hepatovenous segments: liver tissue, 2026-11-21).
import fs from 'node:fs';
import esbuild from 'esbuild';
import {fileURLToPath} from 'node:url';
import {atlas, NOT_VESSELS} from './audit-vessel-ends.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
const out = file('.sites-runtime/display-system.mjs');
await esbuild.build({entryPoints: [file('app/mj-system-classifier.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error', external: ['three']});
const {displaySystem} = await import(out + '?t=' + Date.now());
const isV = s => s === 'arterial' || s === 'venous';
const wrong = atlas.parts.filter(p => isV(NOT_VESSELS.test(p.name) ? 'digestive' : p.system) !== isV(displaySystem(p)));
const listed = atlas.parts.filter(p => NOT_VESSELS.test(p.name) && isV(p.system)).length;
if (wrong.length) { console.error(`FAIL vessel audit systems: ${wrong.length} part(s) the audit and the viewer classify differently, e.g. ${wrong.slice(0, 5).map(p => p.name).join(', ')}`); process.exit(1); }
// negative control: without NOT_VESSELS the hepatovenous segments would be audited as veins
const without = atlas.parts.filter(p => isV(p.system) !== isV(displaySystem(p))).length;
if (!without) { console.error('FAIL vessel audit systems: the negative control found no difference (the check is broken)'); process.exit(1); }
console.log(`PASS vessel audit systems: ${atlas.parts.length} parts, the audit and the viewer agree on every vessel (${listed} liver segments are kept out of the audit).`);
