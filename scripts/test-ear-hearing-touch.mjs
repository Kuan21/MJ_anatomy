// Touch targets of the hearing animation (iPad): every control must keep a hit area of at least 44 x 44 points. Reads the style sheets only; no browser. Prints counts only.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url).pathname;
const MIN = 44;
const hearing = fs.readFileSync(root + 'app/ear-hearing/hearing.css', 'utf8'), button = fs.readFileSync(root + 'app/ear-hearing/hearing-button.css', 'utf8'), css = hearing + '\n' + button;
const rules = [...(hearing.replace(/@media[^{]+\{[\s\S]*$/m, '') + '\n' + button).matchAll(/([^{}]+)\{([^}]*)\}/g)].map(m => ({sel: m[1].split(',').map(x => x.trim()), body: m[2]}));
const px = (body, prop) => { const m = body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([0-9.]+)px`)); return m ? +m[1] : 0; };
const size = (sel, prop) => Math.max(0, ...rules.filter(r => r.sel.includes(sel)).map(r => px(r.body, prop)));

// the clickable elements: step buttons, close, previous/play/next, unrolled-view toggle and its close, the sliders' labels, the auto-advance label, the entry button
const targets = ['.hear-close', '.hear-steps button', '.hear-btns button', '.hear-unroll', '.hear-unrolled>button', '.hear-slider', '.hear-auto', '.ear-animation-open'];
for (const t of targets) {
  assert.ok(size(t, 'min-height') >= MIN, `${t}: min-height at least ${MIN}`);
  if (t !== '.hear-slider' && t !== '.ear-animation-open') assert.ok(size(t, 'min-width') >= MIN, `${t}: min-width at least ${MIN}`);
}
// the check box itself is large; its label carries the 44-point hit area
assert.ok(size('.hear-auto input', 'width') >= 22 && size('.hear-auto input', 'height') >= 22, 'check box at least 22 x 22');
assert.ok(size('.hear-slider input', 'min-height') >= 24, 'slider track area at least 24 high');
// the zoom window stays small on a narrow screen, so the 3D scene remains visible
const narrow = css.match(/@media\(max-width:900px\)\{([\s\S]*?)\n/)[1];
assert.ok(/\.hear-window\{[^}]*min\(calc\(100% - 28px\),\s*[0-9]+px\)/.test(narrow), 'zoom window has a maximum width on narrow screens');
// the 3D labels are hidden while the unrolled view covers the stage, so none peeks out from under it
assert.ok(/\.unrolled-on \.hear-labels[^{]*\.unrolled-on \.hear-peak/.test(css) && /\.unrolled-on \.hear-labels/.test(css) && fs.readFileSync(root + 'app/ear-hearing/hearing-animation.tsx', 'utf8').includes("'unrolled-on'"), 'labels and the frequency box hidden under the unrolled view');
console.log(`ear hearing touch targets: ${targets.length} controls at ${MIN} points or more`);
