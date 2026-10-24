// Execute the actual React page's state and event handlers with a tiny hook
// harness. Scene callbacks are supplied here; test-quiz-viewer covers their real
// geometry/picking implementation. No browser/GPU claims are made by this test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root = fileURLToPath(new URL('../', import.meta.url));
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'public/models/quiz-lower.json')));
let hooks = [], cursor = 0, effects = [], dirty = true, tree;
const changed = (a, b) => !a || !b || a.length !== b.length || a.some((x, i) => x !== b[i]);
const react = {
  useState(initial) {const i = cursor++; hooks[i] ??= {value: typeof initial === 'function' ? initial() : initial}; return [hooks[i].value, next => {const value = typeof next === 'function' ? next(hooks[i].value) : next; if (!Object.is(value, hooks[i].value)) {hooks[i].value = value; dirty = true;}}];},
  useRef(value) {const i = cursor++; return hooks[i] ??= {current: value};},
  useMemo(fn, dependencies) {const i = cursor++; if (!hooks[i] || changed(hooks[i].deps, dependencies)) hooks[i] = {value: fn(), deps: dependencies}; return hooks[i].value;},
  useEffect(fn, dependencies) {const i = cursor++; if (!hooks[i] || changed(hooks[i].deps, dependencies)) {const old = hooks[i]; hooks[i] = {deps: dependencies}; effects.push(() => {old?.cleanup?.(); hooks[i].cleanup = fn();});}},
};
const jsx = (type, props) => ({type, props: props ?? {}});
const icons = ['ArrowLeft', 'ArrowRight', 'Check', 'CheckCircle2', 'ChevronRight', 'Eye', 'Layers', 'RotateCcw', 'Target', 'X', 'XCircle'];
const external = {
  react, 'react/jsx-runtime': {jsx, jsxs: jsx, Fragment: 'fragment'},
  'lucide-react': Object.fromEntries(icons.map(name => [name, name])),
};
globalThis.fetch = async () => new Response(JSON.stringify(catalogue));
const cache = new Map();
async function moduleFor(key) {
  if (cache.has(key)) return cache.get(key);
  let mod;
  const exports = key.endsWith('/viewer.ts') ? {createQuizViewer() {throw Error('Scene must be tested separately');}} : key.endsWith('.css') ? {} : external[key];
  if (exports) mod = new vm.SyntheticModule(Object.keys(exports), function () {for (const [name, value] of Object.entries(exports)) this.setExport(name, value);});
  else {
    const source = ts.transpileModule(fs.readFileSync(key, 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX}}).outputText;
    mod = new vm.SourceTextModule(source, {identifier: key, initializeImportMeta(meta) {meta.env = {BASE_URL: '/'};}});
  }
  cache.set(key, mod); return mod;
}
async function link(spec, ref) {let key = spec; if (spec.startsWith('.')) {key = path.resolve(path.dirname(ref.identifier), spec); if (!fs.existsSync(key)) key += '.ts';} return moduleFor(key);}
const main = await moduleFor(path.join(root, 'app/quiz/page.tsx')); await main.link(link); await main.evaluate();
function render() {let n = 0; while (dirty) {assert.ok(n++ < 20, 'No rerender loop'); dirty = false; cursor = 0; tree = main.namespace.default(); for (const fn of effects.splice(0)) fn();} return tree;}
function all(node) {if (!arguments.length) node = tree; if (Array.isArray(node)) return node.flatMap(n => all(n)); if (!node || typeof node !== 'object') return []; return [node, ...all(node.props?.children)];}
function text(node) {if (Array.isArray(node)) return node.map(text).join(''); if (node === null || node === undefined || typeof node === 'boolean') return ''; if (typeof node !== 'object') return String(node); return text(node.props?.children);}
function button(label) {const result = all().find(n => n.type === 'button' && text(n).includes(label)); assert.ok(result, `Button ${label}`); return result;}
function click(label) {const node = button(label); assert.ok(!node.props.disabled, `Enabled: ${label}`); node.props.onClick(); render();}
const scene = () => all().find(n => typeof n.type === 'function' && n.type.name === 'QuizScene');
render(); await new Promise(resolve => setTimeout(resolve, 0)); render();
assert.match(text(tree), /326 個構造/);
click('膝');
for (const system of ['肌肉Muscles', '神經Nerves', '動脈Arteries', '靜脈Veins']) click(system);
assert.match(text(tree), /今回 4 題/);
click('開始測驗');
let view = scene().props.view;
assert.equal(view.section, 'knee'); assert.equal(view.side, 'right'); assert.equal(view.target.system, 'skeletal');
scene().props.onPick(view.target.id); render(); assert.equal(scene().props.view.answered, false, 'No answer before full geometry readiness');
scene().props.onReady(view.key, true); render();
click('移開遮擋');
scene().props.onPick(view.target.id); render();
assert.equal(scene().props.view.hidden.length, 1); assert.equal(scene().props.view.answered, false, 'Peeling does not score');
click('還原已移開'); assert.equal(scene().props.view.hidden.length, 0);
click('完成移開');
const wrong = catalogue.structures.find(s => s.name === 'Right femur' && s.id !== view.target.id) ?? catalogue.structures.find(s => s.name === 'Right patella');
scene().props.onPick(wrong.id); scene().props.onPick(view.target.id); render();
assert.equal(scene().props.view.pickedId, wrong.id, 'Double tap cannot correct a marked wrong answer');
assert.match(text(tree), /未啱/); assert.match(text(tree), /已答啱 0 \/ 1 題/);
const firstTarget = view.target.id;
click('下一題'); view = scene().props.view;
assert.equal(view.answered, false); assert.equal(view.hidden.length, 0);
scene().props.onReady('stale-old-question', true); render();
assert.ok(button('唔識，顯示答案').props.disabled, 'Stale load completion cannot enable current question');
scene().props.onReady(view.key, true); render();
scene().props.onPick(view.target.id); render();
assert.match(text(tree), /答啱/); assert.match(text(tree), /已答啱 1 \/ 2 題/);
click('下一題'); view = scene().props.view; scene().props.onReady(view.key, true); render(); click('唔識，顯示答案');
assert.match(text(tree), /今題睇答案/); assert.equal(scene().props.view.pickedId, null);
const skippedTarget = view.target.id;
click('下一題'); view = scene().props.view; scene().props.onReady(view.key, true); render(); scene().props.onPick(view.target.id); render(); click('查看成績');
assert.match(text(tree), /完成 4 \/ 4 題，2 題可以再練/);
click('只練錯題'); assert.equal(scene().props.view.target.id, firstTarget);
view = scene().props.view; scene().props.onReady(view.key, true); render(); scene().props.onPick(view.target.id); render(); click('下一題');
assert.equal(scene().props.view.target.id, skippedTarget, 'Mistake review contains exactly wrong and skipped targets');
click('結束測驗'); assert.match(text(tree), /完成 1 \/ 2 題/);
click('重新揀部位'); click('骨骼Bones'); assert.ok(button('開始測驗').props.disabled, 'Empty system selection cannot start');
for (const h of hooks) h?.cleanup?.();
console.log('Quiz React flow passed: section/system setup, readiness, peel/restore, immutable first attempt, correct/wrong/reveal, next, early finish and exact mistake replay.');
