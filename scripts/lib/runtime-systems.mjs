// The system a part is shown under at run time (app/mj-system-classifier.ts: displaySystem), for build scripts and checks that read the raw atlas.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root = new URL('../../', import.meta.url), tmp = new URL('.sites-runtime/', root);
fs.mkdirSync(fileURLToPath(tmp), {recursive: true});
const src = fs.readFileSync(fileURLToPath(new URL('app/mj-system-classifier.ts', root)), 'utf8');
const js = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText
  .replace(/import sourceOverrides from '\.\/anatomy-source-overrides\.json';?/, `const sourceOverrides=JSON.parse(${JSON.stringify(fs.readFileSync(fileURLToPath(new URL('app/anatomy-source-overrides.json', root)), 'utf8'))});`);
fs.writeFileSync(fileURLToPath(new URL('mj-system-classifier-node.mjs', tmp)), js);
export const {displaySystem} = await import(new URL('mj-system-classifier-node.mjs', tmp));
