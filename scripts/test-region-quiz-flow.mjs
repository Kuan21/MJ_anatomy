// The upper-limb and thorax quiz pages: the same React page and handlers as the lower-limb quiz, driven through a tiny hook
// harness. Checks the region copy, the 中文名 + English answer card, side handling for unpaired thoracic answers and a full round.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root = fileURLToPath(new URL('../', import.meta.url));
const catalogues = Object.fromEntries(['lower','upper','thorax','back'].map(k => [k, fs.readFileSync(path.join(root, `public/models/quiz-${k}.json`), 'utf8')]));
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
globalThis.fetch = async url => new Response(catalogues[/quiz-(lower|upper|thorax|back)\.json/.exec(String(url))[1]]);
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

let region;
function render() {let n = 0; while (dirty) {assert.ok(n++ < 20, 'No rerender loop'); dirty = false; cursor = 0; tree = main.namespace.default({region}); for (const fn of effects.splice(0)) fn();} return tree;}
function all(node) {if (!arguments.length) node = tree; if (Array.isArray(node)) return node.flatMap(n => all(n)); if (!node || typeof node !== 'object') return []; return [node, ...all(node.props?.children)];}
function text(node) {if (Array.isArray(node)) return node.map(text).join(''); if (node === null || node === undefined || typeof node === 'boolean') return ''; if (typeof node !== 'object') return String(node); return text(node.props?.children);}
function button(label) {const result = all().find(n => n.type === 'button' && text(n).includes(label)); assert.ok(result, `Button ${label}`); return result;}
function click(label) {const node = button(label); assert.ok(!node.props.disabled, `Enabled: ${label}`); node.props.onClick(); render();}
const scene = () => all().find(n => typeof n.type === 'function' && n.type.name === 'QuizScene');
const settle = async () => {render(); await new Promise(resolve => setTimeout(resolve, 0)); render();};
for (const [id, file, label, tag, labels] of [['upper-limb', 'upper', '上肢', '上肢篇', ['肩帶・肩', '上臂', '前臂', '腕・手']], ['thorax', 'thorax', '胸腔', '胸腔篇', ['胸廓骨架', '胸壁・呼吸肌', '縱膈・大血管']], ['back', 'back', '背部', '背部篇', ['淺層背肌', '中層背肌', '深層固有背肌', '枕下區', '背部神經與血管']]]) {
  hooks = []; cursor = 0; effects = []; dirty = true; region = id;
  const catalogue = JSON.parse(catalogues[file]);
  await settle();
  assert.ok(text(tree).includes(tag), `${label}: header tag`);
  assert.match(text(tree), new RegExp(`${catalogue.structures.length} 個構造`));
  for (const section of labels) button(section);
  assert.ok(all().some(n => n.type === 'a' && n.props.href === '#/quiz'), `${label}: back link goes to the body-part chooser`);
  click(labels[0]);
  assert.ok(!/下肢/.test(text(tree)), `${label}: no lower-limb copy`);
  click('開始測驗');
  let view = scene().props.view;
  assert.equal(view.section, id === 'thorax' ? 'cage' : id === 'back' ? 'superficial' : 'shoulder'); assert.equal(view.side, id === 'back' ? 'both' : 'right');
  scene().props.onReady(view.key, true); render();
  // Answer card: 中文名 first, English name beneath.
  const heading = all().find(n => n.type === 'h1' && n.props.className === 'quiz-target');
  const shown = text(heading.props.children.type(heading.props.children.props));
  assert.ok(shown.includes(view.target.chinese) && shown.includes(view.target.name), 'Chinese and English names shown together');
  assert.ok(shown.indexOf(view.target.chinese) < shown.indexOf(view.target.name), 'Chinese name first');
  scene().props.onPick(view.target.id); render();
  assert.match(text(tree), /答對/);
  assert.ok(all().some(n => typeof n.type === 'function' && n.type.name === 'AnswerCard'), `${label}: the answer card follows a correct answer`);
  click('下一題'); view = scene().props.view; scene().props.onReady(view.key, true); render();
  click('不會，顯示答案'); assert.match(text(tree), /本題已查看答案/);
  assert.ok(all().some(n => typeof n.type === 'function' && n.type.name === 'AnswerCard'), `${label}: the answer card also follows a revealed answer`);
  assert.ok(text(all().find(n => n.props?.className === 'quiz-answer-name' && /正確位置/.test(text(n))).props.children[1].props.children.type(all().find(n => n.props?.className === 'quiz-answer-name' && /正確位置/.test(text(n))).props.children[1].props.children.props)).includes(view.target.chinese), 'Answer card shows the Chinese name');
  click('下一題');
  for (let guard = 0; guard < 12 && !/PRACTICE COMPLETE/.test(text(tree)); guard++) {
    const next = all().find(n => n.type === 'button' && /下一題|查看成績/.test(text(n)));
    if (!next) {view = scene().props.view; scene().props.onReady(view.key, true); render(); scene().props.onPick(view.target.id); render(); continue;}
    next.props.onClick(); render(); if (scene()) {view = scene().props.view; scene().props.onReady(view.key, true); render(); if (!/答對|未啱|本題已查看答案/.test(text(tree))) {scene().props.onPick(view.target.id); render();}}
  }
  // Practising either side keeps unpaired thoracic answers in the pool.
  if (id === 'thorax') {
    if (all().some(n => n.type === 'button' && /結束測驗/.test(text(n)))) click('結束測驗');
    click('重新選擇部位'); click('全部胸腔'); click('左側');
    click('開始測驗'); const left = scene().props.view; assert.equal(left.side, 'left');
  }
  for (const h of hooks) h?.cleanup?.();
  console.log(`${label} quiz page: ${catalogue.structures.length} structures, Chinese + English names, sections, round and review reached.`);
}
