import {SYNONYMS} from './synonyms';
import type {QuizStructure} from './catalogue';
import {structureProfile} from '../mj-structure-info';
import type {SystemId} from '../anatomy';
import paokaoAliases from '../../docs/paokao-aliases.json';

/** How a typed name is judged for the level-2 quiz (看結構寫名稱). Pure functions: the page, the tests and the REVIEW_LOG table all use these. */
export type AnswerLanguage = 'en' | 'zh' | 'any';
export type NameResult = 'correct' | 'close' | 'wrong';
export interface NameOptions {language: AnswerLanguage; needSide: boolean}
export interface Accepted {en: string[]; zh: string[]}
type Named = Pick<QuizStructure, 'name' | 'chinese'> & {side?: string; system?: string};

const SIDE_EN = /\b(left|right)\b/g, SIDE_WORD = /\b(left|right)\b/;
/** "Septomarginal trabecula (moderator band)" → ["septomarginal trabecula (moderator band)", "septomarginal trabecula", "moderator band"] */
function withBrackets(name: string): string[] {
  const out = [name], match = name.match(/^(.*?)\s*[（(]([^）)]+)[）)]\s*(.*)$/);
  if (match) out.push(`${match[1]} ${match[3]}`.trim(), match[2].trim());
  return out;
}
const unique = <T,>(items: T[]) => [...new Set(items)];
const isPaired = (s: {side?: string}) => s.side === 'left' || s.side === 'right';
export const cleanKey = (name: string) => name.toLowerCase().replace(SIDE_EN, '').replace(/\s+/g, ' ').trim();

/**
 * A part of a muscle named "<part> part|head|belly of <muscle>". For most muscles the parts are a description of one muscle (clavicular part of pectoralis major,
 * humeral head of pronator teres), so the name of the whole muscle is a right answer for a part. Muscles whose heads are learned as separate structures keep asking for the head.
 */
export const HEADS_REQUIRED = new Set(['biceps brachii', 'triceps brachii', 'biceps femoris', 'quadriceps femoris']);
const PART_OF_MUSCLE = /^(.+?) (?:part|head|belly) of (?:(?:right|left) )?(.+)$/i;
export interface WholeMuscle {en: string; zh?: string; muscle: string; headsRequired: boolean}
export function wholeMuscleOf(structure: Named): WholeMuscle | null {
  const match = structure.name.match(PART_OF_MUSCLE);
  if (!match) return null;
  const muscle = match[2].trim(), side = structure.name.match(SIDE_WORD)?.[1];
  // "右三角肌肩峰部" → "右三角肌"; "右斜方肌升部（下部纖維）" → "右斜方肌". The Chinese part name is kept only when the muscle ends with 肌.
  const zh = structure.chinese?.match(/^([左右]?[^（）]*?肌)(.+)$/)?.[1];
  return {en: side ? `${side} ${muscle}` : muscle, zh, muscle: muscle.toLowerCase(), headsRequired: HEADS_REQUIRED.has(muscle.toLowerCase())};
}

/** The course checklist writes some structures differently from the model (docs/paokao-aliases.json: note name → model name(s)). A row that names one structure is an accepted name for it;
 * a group name (iliopsoas, quadriceps femoris, thenar muscles, plantar interossei) names several structures and is only close for any one of them. */
const ALIAS_ROWS = Object.entries(paokaoAliases as Record<string, string[]>);
export function checklistAliases(structure: Named): {exact: string[]; group: string[]} {
  const key = cleanKey(structure.name), exact: string[] = [], group: string[] = [];
  for (const [note, models] of ALIAS_ROWS) if (models.some(m => cleanKey(m) === key)) (models.length === 1 ? exact : group).push(note);
  return {exact, group};
}
const partOfName = (x: string, y: string) => x.endsWith(` of ${y}`) || x.includes(` of ${y} `) || x.endsWith(` of the ${y}`) || x.includes(` of the ${y} `);
/** The name the main site shows for this structure (the Netter-style spelling: quadratus plantae for flexor accessorius, 1st rib for first rib, coxal bone for hip bone), when it is another spelling
 * of the same structure. The site shows the branches of a nerve under the nerve's own name; that is a parent, not a spelling, and is never accepted here. */
export function siteName(structure: Named): {en?: string; zh?: string} {
  if (!structure.system) return {};
  // A part of a muscle (clavicular part of pectoralis major, spinal part of deltoid) is answered with the muscle's name (wholeMuscleOf), not with the site's other wording of the part.
  if (wholeMuscleOf(structure)) return {};
  const profile = structureProfile(structure.name, structure.system as SystemId);
  const paired = isPaired(structure), key = (n: string) => paired ? cleanKey(n) : n.toLowerCase().replace(/\s+/g, ' ').trim();
  const out: {en?: string; zh?: string} = {};
  if (profile.english) {const a = key(profile.english), b = key(structure.name); if (a && a !== b && !partOfName(b, a) && !partOfName(a, b)) out.en = profile.english;}
  if (profile.chinese && structure.chinese && profile.chinese !== structure.chinese && !structure.chinese.includes(profile.chinese.replace(/^[左右]/, ''))) out.zh = profile.chinese;
  return out;
}

/** Every name that is right for a structure: its own English and Chinese names, names in brackets, the rows of the synonym table, and for a part of a muscle the whole muscle. */
export function acceptedNames(structure: Named): Accepted {
  const paired = isPaired(structure);
  // Left/right is part of the identity of a midline structure (left atrium, left coronary cusp), so its row is keyed with the word; paired structures are keyed without it.
  const row = SYNONYMS[structure.name.toLowerCase()] ?? SYNONYMS[cleanKey(structure.name)];
  const whole = wholeMuscleOf(structure);
  const wholeEn = whole && !whole.headsRequired ? [whole.en] : [], wholeZh = whole && !whole.headsRequired && whole.zh ? [whole.zh] : [];
  const site = siteName(structure), aliases = checklistAliases(structure).exact;
  const en = [...withBrackets(structure.name), ...(row?.en ?? []), ...wholeEn, ...(site.en ? [site.en] : [])];
  const zh = [...(structure.chinese ? withBrackets(structure.chinese) : []), ...(row?.zh ?? []), ...wholeZh, ...(site.zh ? [site.zh] : [])];
  // Paired structures carry their side in the name ("…of right pectoralis major"); a synonym row applies to both sides, so the side words are put back where the name has them.
  const side = paired ? structure.name.match(SIDE_WORD)?.[1]?.toLowerCase() : undefined;
  const zhSide = paired ? (structure.chinese?.startsWith('左') ? '左' : structure.chinese?.startsWith('右') ? '右' : '') : '';
  const sided = (names: string[], text: string | undefined) => names.map(n => text && !SIDE_WORD.test(n) ? `${text} ${n}` : n);
  return {en: unique([...en, ...sided([...(row?.en ?? []), ...aliases], side)]), zh: unique([...zh, ...(row?.zh ?? []).map(n => zhSide && !/^[左右]/.test(n) ? zhSide + n : n)])};
}

/** Simplified characters that occur in anatomical names, mapped to the traditional form the quiz uses. */
const SIMPLIFIED: Record<string, string> = Object.fromEntries('侧側 内內 剑劍 动動 区區 丛叢 圆圓 压壓 夹夾 对對 层層 属屬 带帶 干幹 张張 后後 耻恥 枢樞 桡橈 横橫 气氣 浅淺 沟溝 浆漿 无無 状狀 窦竇 节節 结結 经經 维維 网網 缘緣 缝縫 总總 纤纖 脉脈 胫脛 脑腦 肠腸 腘膕 脏臟 与與 叶葉 荐薦 触觸 贵貴 迹跡 跖蹠 轴軸 回迴 远遠 钝鈍 钩鉤 锐銳 锯鋸 锥錐 锁鎖 长長 门門 闭閉 间間 阔闊 隐隱 静靜 韧韌 头頭 颈頸 体體 髌髕 髋髖 鱼魚 窝窩 颅顱 胆膽 肾腎 关關 机機 转轉 线線 术術 发發 齿齒 腭顎 颊頰 颞顳 额額 项項 颚顎 荚莢 过過 边邊 连連 导導 听聽 视視 块塊 两兩 双雙 单單 环環 杆桿 梁樑 槛檻 组組 织織 骶薦'.split(' ').map(pair => [pair[0], pair[1]]));
/** Abbreviations of the course handouts: "radial n." = radial nerve, "brachial a." = brachial artery, "cephalic v." = cephalic vein, "lig." = ligament, "br." = branch. */
const ABBREVIATIONS: Array<[RegExp, string]> = [[/\bnn\.(?=\s|$)/g, ' nerves '], [/\bn\.(?=\s|$)|\bn$/g, ' nerve '], [/\baa\.(?=\s|$)/g, ' arteries '], [/\ba\.(?=\s|$)|\ba$/g, ' artery '], [/\bvv\.(?=\s|$)/g, ' veins '], [/\bv\.(?=\s|$)|\bv$/g, ' vein '], [/\bmm\.(?=\s|$)/g, ' muscles '], [/\bm\.(?=\s|$)|\bm$/g, ' muscle '], [/\bligg?\.(?=\s|$)/g, ' ligament '], [/\bbr\.(?=\s|$)/g, ' branch ']];

const ORDINALS: Record<string, string> = {first: '1st', second: '2nd', third: '3rd', fourth: '4th', fifth: '5th', sixth: '6th', seventh: '7th', eighth: '8th', ninth: '9th', tenth: '10th', eleventh: '11th', twelfth: '12th'};
const VERTEBRA: Record<string, string> = {c: 'cervical', t: 'thoracic', l: 'lumbar', s: 'sacral'};
const nth = (n: string) => n + (n === '1' ? 'st' : n === '2' ? 'nd' : n === '3' ? 'rd' : 'th');
/**
 * Letters, digits and Chinese characters only; lower case; "the", "muscle(s)", hyphens, brackets and spaces ignored; 臺 = 台; simplified characters read as traditional; n./a./v./m./lig. expanded.
 * The side word is taken out of the name; when it must be kept it goes to the front, so "Left acromial part of deltoid" and "Acromial part of left deltoid" (and 左側／左) read the same.
 */
export function normalize(text: string, keepSide: boolean): string {
  let t = text.normalize('NFKC').toLowerCase().replace(/臺/g, '台').replace(/[㐀-鿿]/g, c => SIMPLIFIED[c] ?? c);
  for (const [pattern, word] of ABBREVIATIONS) t = t.replace(pattern, word);
  // "first rib" = "1st rib", "T10 vertebra" = "tenth thoracic vertebra", "set of perforating arteries" = "perforating arteries": the two spellings the site and the model use for the same thing
  t = t.replace(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\b/g, m => ORDINALS[m]);
  t = t.replace(/\b([ctls])(\d{1,2})\b(?=\s+vertebra)/g, (_, level: string, n: string) => `${nth(n)} ${VERTEBRA[level]}`);
  t = t.replace(/\bset of\b/g, ' ');
  t = t.replace(/\b(the|of the)\b/g, ' ').replace(/\bmuscles?\b/g, ' ');
  const side = t.match(SIDE_WORD)?.[1] ?? (/[左右]/.exec(t)?.[0] ?? '');
  t = t.replace(SIDE_EN, ' ').replace(/[左右]側?/g, '');
  const body = t.replace(/[^a-z0-9㐀-鿿]+/g, '');
  return keepSide && side ? side + body : body;
}

export function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

const isChinese = (s: string) => /[㐀-鿿]/.test(s);
/** Close = one slip in a short name, up to two in a long one (more than 8 letters); Chinese: one character in a name of four or more. */
function closeLimit(expected: string) {
  return isChinese(expected) ? (expected.length >= 4 ? 1 : 0) : expected.length > 8 ? 2 : expected.length >= 4 ? 1 : 0;
}
/** Pairs of words that name different structures (rhomboid major / minor, 腓骨長肌 / 腓骨短肌): swapping one for the other is a different answer, never a slip of the pen. */
export const OPPOSITES: Array<[string, string]> = [['major', 'minor'], ['longus', 'brevis'], ['medial', 'lateral'], ['anterior', 'posterior'], ['superior', 'inferior'], ['superficial', 'deep'], ['internal', 'external'], ['proximal', 'distal'], ['ascending', 'descending'], ['maximus', 'minimus'], ['大', '小'], ['長', '短'], ['內', '外'], ['前', '後'], ['上', '下'], ['淺', '深'], ['升', '降'], ['近', '遠']];
export function opposed(input: string, expected: string): boolean {
  return OPPOSITES.some(([a, b]) => (expected.includes(a) && !expected.includes(b) && input.includes(b) && !input.includes(a)) || (expected.includes(b) && !expected.includes(a) && input.includes(a) && !input.includes(b)));
}

/**
 * Part and whole by name: "anterior cusp of pulmonary valve" is a part of "pulmonary valve". `part`: a is a part of b; `whole`: b is a part of a. A part named instead of its whole
 * (or the whole instead of a part) is close, not wrong, and is never scored as correct. Left/right is dropped for paired structures only: the papillary muscles of the right ventricle
 * are not a part of the left ventricle.
 */
export function relationOf(a: Named, b: Named): 'part' | 'whole' | null {
  const key = (s: Named) => isPaired(s) ? cleanKey(s.name) : s.name.toLowerCase().replace(/\s+/g, ' ').trim();
  const ka = key(a), kb = key(b);
  if (!ka || !kb || ka === kb) return null;
  const partOf = (x: string, y: string) => x.endsWith(` of ${y}`) || x.includes(` of ${y} `);
  return partOf(ka, kb) ? 'part' : partOf(kb, ka) ? 'whole' : null;
}
export type NameRelation = 'typed-part' | 'typed-whole';

/** `correct`: equals an accepted name. `close`: within the limit of one. Anything else is `wrong`. */
export function judgeName(typed: string, structure: Named, options: NameOptions, related: Named[] = []): {result: NameResult; best?: string; relation?: NameRelation; relatedName?: string} {
  // Only a laterality word of a paired structure may be left out; "left atrium" is a different structure from "right atrium".
  const keepSide = options.needSide || !isPaired(structure);
  const input = normalize(typed, keepSide);
  if (!input) return {result: 'wrong'};
  // When the side must be given, a missing or wrong side is an error, never "close".
  const requireSide = options.needSide && isPaired(structure);
  const sideOf = (t: string) => /\bleft\b|左/i.test(t) ? 'left' : /\bright\b|右/i.test(t) ? 'right' : '';
  const accepted = acceptedNames(structure);
  const names = options.language === 'en' ? accepted.en : options.language === 'zh' ? accepted.zh : [...accepted.en, ...accepted.zh];
  let best: string | undefined, bestDistance = Infinity;
  for (const name of names) {
    const expected = normalize(name, keepSide);
    if (!expected) continue;
    if (expected === input) return {result: 'correct', best: name};
    if (requireSide && sideOf(typed) !== sideOf(name)) continue;
    if (opposed(input, expected)) continue;
    const d = distance(input, expected);
    if (d <= closeLimit(expected) && d < bestDistance) {best = name; bestDistance = d;}
  }
  if (best) return {result: 'close', best};
  // The whole muscle for a head that has to be named (biceps, triceps, biceps femoris) is close, never right.
  const whole = wholeMuscleOf(structure);
  if (whole?.headsRequired) {
    const wholeNames = options.language === 'en' ? [whole.en] : options.language === 'zh' ? [whole.zh ?? ''] : [whole.en, whole.zh ?? ''];
    if (wholeNames.some(n => n && normalize(n, keepSide) === input)) return {result: 'close', relation: 'typed-whole', relatedName: whole.en};
  }
  // A checklist group name that includes this structure (iliopsoas for iliacus, quadriceps femoris for rectus femoris, thenar muscles for opponens pollicis) is close, never right.
  if (options.language !== 'zh') for (const group of checklistAliases(structure).group) if (normalize(group, false) === normalize(typed, false)) return {result: 'close', relation: 'typed-whole', relatedName: group};
  // The name of a part of the target (or of the whole it belongs to) is close, but never right.
  for (const other of related) {
    const rel = relationOf(other, structure);
    if (rel && judgeName(typed, other, options).result === 'correct') return {result: 'close', relation: rel === 'part' ? 'typed-part' : 'typed-whole', relatedName: other.name};
  }
  return {result: 'wrong'};
}

/** The spelling to show after a close answer: the accepted name in the language the learner was typing. */
export function preferredName(structure: Pick<QuizStructure, 'name' | 'chinese'>, typed: string, language: AnswerLanguage): string {
  const zh = isChinese(typed) || language === 'zh';
  return zh ? structure.chinese ?? structure.name : structure.name;
}
