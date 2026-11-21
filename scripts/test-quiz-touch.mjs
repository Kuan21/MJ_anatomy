// Touch targets of the study pages (Learn, Quiz, mock exam) on an iPad: every control keeps a hit area of at least 44 x 44 points. Reads the style sheet only; no browser. Prints counts only.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url).pathname;
const MIN = 44;
const css = fs.readFileSync(root + 'app/quiz/quiz.css', 'utf8');
// flat list of rules; rules inside @media blocks are included, so a smaller value in a narrow-screen block fails the check as well
const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(m => ({sel: m[1].split(',').map(x => x.trim()), body: m[2]}));
const px = (body, prop) => { const m = body.match(new RegExp(`(?:^|[;{])\\s*${prop}\\s*:\\s*([0-9.]+)px`)); return m ? +m[1] : null; };
const sizes = (sel, prop) => rules.filter(r => r.sel.includes(sel)).map(r => px(r.body, prop)).filter(v => v !== null);

// [selector, needs min-width too]: the header switch (學習 / Quiz / 模擬考試), the view buttons, answer and option buttons, the setup page choices, submit and close style buttons
const targets = [
  ['.quiz-app .mode-nav-link', true], ['.quiz-view-buttons>button', true], ['.quiz-segmented>button', true], ['.quiz-text-button', true], ['.quiz-neighbours button', true], ['.quiz-error button', true],
  ['.quiz-back', false], ['.quiz-quiet', false], ['.quiz-primary', false], ['.quiz-tool-button', false], ['.quiz-context-toggle', false], ['.quiz-saved-row .quiz-secondary', false], ['.quiz-source', false],
  ['.quiz-region-grid>button', false], ['.quiz-system-grid>button', false], ['.quiz-level-grid>button', false], ['.quiz-app .setup-region-main', false], ['.quiz-app .setup-expand', false], ['.quiz-app .setup-sections>button', false],
  ['.quiz-app .exam-side>button', false], ['.quiz-name-input', false], ['.setup-custom input', false], ['button.quiz-review-item', false], ['.quiz-learn-link', false], ['.quiz-app button.lesson-item', false],
];
let n = 0;
for (const [sel, wide] of targets) {
  const heights = sizes(sel, 'min-height');
  assert.ok(heights.length > 0, `${sel}: declares a min-height`);
  assert.ok(heights.every(h => h >= MIN), `${sel}: every min-height is at least ${MIN} (found ${heights.join(', ')})`);
  if (wide) { const widths = sizes(sel, 'min-width'); assert.ok(widths.length > 0 && widths.every(w => w >= MIN), `${sel}: min-width at least ${MIN} (found ${widths.join(', ') || 'none'})`); }
  n++;
}
// the submit button of the typing box keeps its text on one line (it was squeezed into a vertical column on a narrow card)
assert.ok(rules.some(r => r.sel.includes('.quiz-name-actions>button') && /white-space\s*:\s*nowrap/.test(r.body)), 'the buttons of the typing box do not wrap their text');
// the view buttons wrap instead of running off the stage when there are many of them (brain: nine)
assert.ok(rules.some(r => r.sel.includes('.quiz-view-buttons') && /flex-wrap\s*:\s*wrap/.test(r.body) && /max-width/.test(r.body)), 'the view buttons wrap inside the stage');
console.log(`quiz touch targets: ${n} controls at ${MIN} points or more`);
