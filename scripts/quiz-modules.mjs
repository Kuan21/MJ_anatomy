// Compile the actual pure TypeScript modules for build-time catalogue generation
// and Node regression tests. Keep browser and generated catalogue rules identical.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import ts from 'typescript';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function quizModule(relative) {
  const output = path.join(root, '.sites-runtime/quiz-modules');
  const written = new Set();
  function compile(file) {
    if (written.has(file)) return;
    written.add(file);
    let js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext},
    }).outputText;
    js = js.replace(/import (\w+) from ['"]([^'"]+\.json)['"];?/g, (_, name, ref) =>
      `const ${name} = ${fs.readFileSync(path.resolve(root, path.dirname(file), ref), 'utf8')};`);
    js = js.replace(/from ['"](\.[^'"]+)['"]/g, (_, ref) => {
      const dependency = path.normalize(path.join(path.dirname(file), ref + '.ts'));
      compile(dependency);
      return `from '${ref}.mjs'`;
    });
    const target = path.join(output, file.replace(/\.ts$/, '.mjs'));
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, js);
  }
  compile(relative);
  return import(pathToFileURL(path.join(output, relative.replace(/\.ts$/, '.mjs'))).href);
}
