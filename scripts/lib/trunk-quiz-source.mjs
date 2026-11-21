// Abdomen and pelvis quizzes: which structures of the main site's models are asked, and the other wordings of their names that the required-structure list uses.
// The region of a structure is the one the main site's region bar gives it (app/mj-region-bar.ts); app/quiz/trunk.ts sets aside what the organ detail modes or another region's quiz ask.
// Everything here is pure data work on names; the meshes are copied unchanged by scripts/prepare-quiz.mjs.
import fs from 'node:fs';
import {quizModule} from '../quiz-modules.mjs';
import {canonKey, requiredKeys, splitNames, zhKey} from './required-match.mjs';

const root = new URL('../../', import.meta.url);
const lc = s => s[0].toLowerCase() + s.slice(1);

/** Chinese names the profile table has no (or an English) entry for. The model's own English name stays; only the Chinese is added here. */
export const TRUNK_ZH = {
  'sigmoid colon': '乙狀結腸', 'jejunum': '空腸', 'ileum': '迴腸', 'taenia mesocolica': '結腸繫膜帶', 'taenia omentalis': '網膜帶', 'taenia libera': '游離結腸帶',
  'pancreatic duct': '胰管', 'ileocecal junction': '迴盲交界', 'transverse mesocolon': '橫結腸繫膜', 'mesentery of small intestine': '小腸繫膜', 'mesoappendix': '闌尾繫膜',
};

/** The candidates of a region: one row per atlas or course-package mesh that is in the region by the region bar rules and is not set aside by app/quiz/trunk.ts. Rows carry the decision (`reason` = why not asked). */
export async function trunkCandidates(region, {atlasParts, packageParts}) {
  const {anatomicalSide, correctedPartName} = await quizModule('app/mj-part-regions.ts');
  const {buildRegionIndex} = await quizModule('app/mj-region-bar.ts');
  const {structureProfile} = await quizModule('app/mj-structure-info.ts');
  const trunk = await quizModule('app/quiz/trunk.ts');
  const all = [...atlasParts.map(part => ({part, from: 'atlas'})), ...packageParts.map(part => ({part, from: 'package'}))];
  const index = buildRegionIndex(all.map(x => x.part));
  const rows = [];
  for (const {part, from} of all) {
    const tags = index.tags.get(part.id), raw = correctedPartName(part);
    const wanted = region === 'abdomen' ? (tags && [...tags].some(t => t.startsWith('abdomen'))) || (part.system === 'skeletal' && /^(?:left|right) hip bone$|^sacrum$/i.test(raw)) : false;
    if (!wanted) continue;
    const system = trunk.trunkSystem(part.system, raw);
    if (!system) continue;
    let side = anatomicalSide(part);
    if (trunk.IDENTITY_SIDE.test(raw)) side = 'midline';
    const merge = trunk.TRUNK_MERGE[raw.toLowerCase()];
    let name = merge?.name ?? raw.replace(/^./, c => c.toUpperCase());
    if (side !== 'midline' && !/\b(left|right)\b/i.test(name)) name = `${side === 'left' ? 'Left' : 'Right'} ${lc(name)}`;
    const profile = structureProfile(name, part.system, {...part, name});
    const zhRaw = merge?.chinese ?? TRUNK_ZH[name.toLowerCase().replace(/\b(left|right)\b/g, '').trim()] ?? profile.chinese;
    const chinese = zhRaw && !/[a-z]/i.test(zhRaw) ? (side !== 'midline' && !/^[左右]/.test(zhRaw) ? (side === 'left' ? '左' : '右') + zhRaw : zhRaw) : undefined;
    const reason = (region === 'abdomen' ? trunk.abdomenExclusion(raw) : null) ?? (chinese ? null : 'no-chinese-name');
    rows.push({part, from, raw, name, side, system, atlasSystem: part.system, chinese, reason, layer: system === 'trunkorgan' && region === 'abdomen' ? trunk.abdomenLayerOf(name) : undefined});
  }
  return rows;
}

/** Wordings of the required-structure list: for every asked structure that one list entry names (English name, the list's alias table or Chinese name), the list's own names that differ from the structure's. */
export function requiredAliases(region, structures) {
  const file = region === 'abdomen' ? 'abdomen.json' : null;
  const out = new Map(), coverage = {required: 0, asked: [], notAsked: []};
  if (!file) return {aliases: out, coverage};
  const dir = new URL('docs/required-structures/', root);
  const required = JSON.parse(fs.readFileSync(new URL(file, dir), 'utf8')).structures.filter(r => r.expect3d);
  const aliasFile = new URL(`aliases-${region}.json`, dir);
  const aliasTable = fs.existsSync(aliasFile) ? JSON.parse(fs.readFileSync(aliasFile, 'utf8')).aliases : [];
  const identity = /\b(?:left|right) (?:gastric|gastro-?epiploic|colic|hepatic|portal)\b/i;
  const keyOf = (name, forceSide = false) => forceSide || identity.test(name) ? 'id:' + name.toLowerCase().replace(/[^a-z0-9]+/g, '') : canonKey(name);
  const zhOf = (zh, sided) => zhKey(zh, sided);
  const byEn = new Map(), byZh = new Map();
  const put = (map, key, s) => {if (!key) return; const set = map.get(key) ?? map.set(key, new Set()).get(key); set.add(s);};
  for (const s of structures) {
    const ident = identity.test(s.name), paired = s.side !== 'midline';
    put(byEn, keyOf(s.name), s);
    if (s.chinese) put(byZh, zhOf(s.chinese, paired && !ident), s);
  }
  for (const r of required) {
    coverage.required++;
    const found = new Set();
    const names = [r.en, ...aliasTable.filter(a => a.id === r.id).map(a => a.site)];
    for (const n of names) for (const k of (identity.test(n) ? [keyOf(n)] : requiredKeys(n))) for (const s of byEn.get(k) ?? []) found.add(s);
    if (!found.size && r.zh) for (const s of byZh.get(zhOf(r.zh, false)) ?? []) found.add(s);
    // a list entry that is not one structure (or one left/right pair) is a group name, not an alias of any of them
    if (!found.size) {coverage.notAsked.push(r.id); continue;}
    coverage.asked.push(r.id);
    if (found.size > 2) continue;
    for (const s of found) {
      const paired = s.side !== 'midline' && !identity.test(s.name), zhPlain = paired ? (s.chinese ?? '').replace(/^[左右]/, '') : s.chinese ?? '';
      const row = out.get(s.id) ?? out.set(s.id, {en: new Set(), zh: new Set()}).get(s.id);
      const mainEn = splitNames(r.en)[0], plain = t => t.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/[^a-z0-9]+/g, '');
      if (mainEn && plain(mainEn) !== plain(s.name)) row.en.add(mainEn.replace(/\b(left|right)\b\s*/gi, '').trim());
      const zh = r.zh.replace(/[（(].*$/, '').trim();
      if (zh && zh !== zhPlain) row.zh.add(zh.replace(/^[左右]/, ''));
    }
  }
  const result = new Map();
  for (const [id, row] of out) {
    const aliases = {};
    if (row.en.size) aliases.en = [...row.en];
    if (row.zh.size) aliases.zh = [...row.zh];
    if (aliases.en || aliases.zh) result.set(id, aliases);
  }
  return {aliases: result, coverage};
}
