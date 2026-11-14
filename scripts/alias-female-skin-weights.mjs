// The female skin (id HRAF-skin, built by prepare-female.mjs) has the same vertices and triangles as the male skin, only the groin is reshaped, so it is skinned with the male
// skin's weights: they are copied under its id in skin-weights.json.gz. Run after prepare-skin-weights.mjs (which rewrites the file); safe to run again.
import fs from 'node:fs';
import {gunzipSync, gzipSync} from 'node:zlib';
const file = new URL('../public/models/skin-weights.json.gz', import.meta.url), female = new URL('../public/models/female/female-stream.json.gz', import.meta.url);
const data = JSON.parse(gunzipSync(fs.readFileSync(file))), fm = JSON.parse(gunzipSync(fs.readFileSync(female)));
const fs_ = fm.parts.find(p => p.id === 'HRAF-skin'), male = data.parts.FJ2810;
if (!fs_ || !male) { console.error('female skin alias: missing ' + (!fs_ ? 'the female skin part' : 'the male skin weights')); process.exit(1); }
if (fs_.vertexCount !== male.vertexCount) { console.error(`female skin alias: vertex count ${fs_.vertexCount} differs from the male skin's ${male.vertexCount}`); process.exit(1); }
if (JSON.stringify(data.parts['HRAF-skin']) !== JSON.stringify({...male, name: 'Skin'})) { data.parts['HRAF-skin'] = {...male, name: 'Skin'}; fs.writeFileSync(file, gzipSync(Buffer.from(JSON.stringify(data)), {level: 9})); }
console.log(`Female skin weights: ${male.vertexCount} vertices share the male skin's weights.`);
