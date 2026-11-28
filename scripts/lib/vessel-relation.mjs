// Which vessels a cut-off vessel end may be joined to (connector tubes and bridges): only a vessel of the same tree. The atlas vessels are separate meshes, and an end that stops
// a few millimetres short of the "nearest vessel of the same kind" used to be joined to it whatever that vessel was, so a testicular vein ended in an intestinal vein and the hepatic
// veins in the portal vein (check VS-04, VS-05). A pair (A, B) is
//   yes       related: the same name apart from the side (Left/Right), one name contained in the other (Descending aorta / Descending thoracic aorta), a direct parent or child
//             in the registered vessel tree (app/mj-vessel-parents.json; siblings and grandparents are not related), where the tree has no entry for one of the two vessels the two meshes already touch each other (a branch touches its trunk where it leaves it), or both belong to
//             one of the FAMILIES below (the hepatic veins; a trunk and its branches, never two branches of one trunk)
//   unknown   the tree says nothing about one of the two vessels (it is neither in the tree nor touches any vessel): a conservative rule applies, the other vessel must lie within 4 mm
//   no        both are known and not related: never joined, the end is rounded off instead
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export const UNKNOWN_MM = 4;
export const CONTACTS_FILE = 'work/vessel-contacts.json';
/** Trees the registered vessel tree has no entries for. `peers`: every member is part of the same vessel or continues into the others (the segments of a hepatic vein; the superior and inferior epigastric arteries meet in the rectus sheath).
 *  `hub` + `spokes`: a spoke joins its hub (a branch joins its trunk) and two spokes NEVER join each other: the inferior gluteal and the internal pudendal vein each drain into the internal iliac vein, they do not join one another (check VS-09, 2026-11-21). */
const FAMILIES = [
  {peers: /hepatic/i},   // the hepatic veins and arteries
  {hub: /portal|superior mesenteric vein|inferior mesenteric vein|splenic vein/i, spokes: /gastric vein|ileal vein|jejunal vein|colic vein|sigmoid vein/i},   // the portal vein and the veins that drain into it
  {hub: /internal iliac/i, spokes: /gluteal|pudendal|obturator|vesical|middle rectal|uterine|vaginal|lateral sacral|iliolumbar|prostatic/i},   // the internal iliac vessel and its pelvic branches (not the external iliac)
  {peers: /\brenal artery\b/i},   // the renal artery and its divisions and segmental branches (inside the kidney the branches arise from the divisions, which the registered tree does not list)
  {peers: /epigastric/i},
  {hub: /external iliac artery|femoral artery/i, spokes: /inferior epigastric/i},   // the inferior epigastric artery leaves the external iliac artery just above the groin, where the model switches to the femoral artery
];
const inFamily = (na, nb) => FAMILIES.some(f => f.peers ? f.peers.test(na) && f.peers.test(nb) : (f.hub.test(na) && (f.hub.test(nb) || f.spokes.test(nb))) || (f.hub.test(nb) && f.spokes.test(na)));

const PARTITIVE = /\b(?:branch|branches|tributary|tributaries|part|division|set|of)\b/i;
const norm = n => n.replace(/^(?:Left|Right)\s+/i, '').toLowerCase();
const tokens = n => new Set(norm(n).split(/[^a-z0-9]+/).filter(Boolean));
const sideOf = n => { const m = /\b(left|right)\b/i.exec(n); return m ? m[1].toLowerCase() : null; };
const stripEnd = tag => String(tag).replace(/-END$/, '');

/** Pairs of vessel ids whose meshes touch (an end of one lies within 2.5 mm of the other): from the "joined" rows of the end audit. */
export const contactPairs = rows => { const seen = new Set(), out = []; for (const r of rows) if (r.kind === 'joined' && r.nearestSame) { const k = [r.id, r.nearestSame].sort().join('|'); if (!seen.has(k)) { seen.add(k); out.push([r.id, r.nearestSame]); } } return out; };
export const saveContacts = pairs => { fs.mkdirSync(file('work/'), {recursive: true}); fs.writeFileSync(file(CONTACTS_FILE), JSON.stringify(pairs)); };
export const loadContacts = () => { try { return JSON.parse(fs.readFileSync(file(CONTACTS_FILE), 'utf8')); } catch { return null; } };

/** @param nameOf (id) => vessel name, undefined for ids that are not vessels
 *  @param pairs  contact pairs [idA, idB]
 *  @param names  every vessel name (a name "X branch of Y" names Y, or "Trunk of Y", as its parent when such a vessel exists) */
export function makeRelation(nameOf, pairs, names = []) {
  const tree = JSON.parse(fs.readFileSync(file('app/mj-vessel-parents.json'), 'utf8')).parents;
  const byLower = new Map(names.map(n => [n.toLowerCase(), n]));
  const derived = n => { const m = /^.+? (?:branch|tributary|part|division) of (.+)$/i.exec(n); if (!m) return null; const y = m[1].toLowerCase(); return byLower.get(y) ?? byLower.get('trunk of ' + y) ?? null; };
  const parentsOf = n => { const v = tree[n], list = v == null ? [] : Array.isArray(v) ? [...v] : [v], d = derived(n); if (d && !list.includes(d)) list.push(d); return list; };
  const known = new Set(Object.keys(tree)); for (const v of Object.values(tree)) for (const x of (Array.isArray(v) ? v : [v])) known.add(x);
  for (const n of names) { const d = derived(n); if (d) { known.add(n); known.add(d); } }
  const touch = new Map(), link = (a, b) => { if (!touch.has(a)) touch.set(a, new Set()); touch.get(a).add(b); };
  for (const [a, b] of pairs) { link(a, b); link(b, a); }
  const cache = new Map();
  const classify = (a, b) => {
    const na = nameOf(a), nb = nameOf(b); if (!na || !nb) return 'unknown';
    // a vessel of the left side never joins one of the right side (the right internal pudendal vein is not the continuation of the left one)
    const sa = sideOf(na), sb = sideOf(nb); if (sa && sb && sa !== sb) return 'no';
    if (norm(na) === norm(nb)) return 'yes';
    // two spokes of one hub (the inferior gluteal and the internal pudendal vein, both draining into the internal iliac vein) are not joined to each other, even where their meshes touch
    if (FAMILIES.some(f => f.spokes && !f.hub.test(na) && !f.hub.test(nb) && f.spokes.test(na) && f.spokes.test(nb))) return 'no';
    const ta = tokens(na), tb = tokens(nb);
    // one name inside the other (Descending aorta / Descending thoracic aorta); not for "X branch of Y" names, whose words overlap by accident (Acromial branch of … thoraco-acromial artery)
    if (!PARTITIVE.test(na) && !PARTITIVE.test(nb) && ([...ta].every(t => tb.has(t)) || [...tb].every(t => ta.has(t)))) return 'yes';
    const info = id => known.has(nameOf(id));
    // both vessels are in the registered tree: its parent-child links decide (a grandparent is reached through the vessel between, and two meshes that merely touch are not joined)
    if (parentsOf(na).includes(nb) || parentsOf(nb).includes(na)) return 'yes';
    if (inFamily(na, nb)) return 'yes';
    if (info(a) && info(b)) return 'no';
    // the tree is silent about one of them: a mesh that touches the other is its trunk or branch
    if (touch.get(a)?.has(b)) return 'yes';
    const any = id => info(id) || touch.has(id);
    return any(a) && any(b) ? 'no' : 'unknown';
  };
  /** 'yes' | 'unknown' | 'no' for the vessel meshes a and b (ids; an -END piece counts as its vessel). */
  const rel = (a, b) => {
    a = stripEnd(a); b = stripEnd(b); if (a === b || process.env.MJ_NO_RELATION) return 'yes';   // MJ_NO_RELATION=1: every pair related (the old behaviour, for comparisons)
    const k = a < b ? a + '|' + b : b + '|' + a; let v = cache.get(k); if (v === undefined) cache.set(k, v = classify(a, b)); return v;
  };
  const skips = new Map();
  /** Sets of tags to skip in Grid.nearest: everything but the related vessels, and only the unrelated ones. */
  const skipSets = (id, tagsOf) => {
    if (!skips.has(id)) {
      const yesOnly = new Set([id, id + '-END']), noOnly = new Set([id, id + '-END']);
      for (const t of tagsOf) { const r = rel(id, t); if (r !== 'yes') for (const x of [t, t + '-END']) yesOnly.add(x); if (r === 'no') for (const x of [t, t + '-END']) noOnly.add(x); }
      skips.set(id, {yesOnly, noOnly});
    }
    return skips.get(id);
  };
  /** Nearest triangle of a related vessel within `limit` (m), else of a vessel the tree is silent about within UNKNOWN_MM: {d, tag, q, rel}. */
  const nearest = (grid, at, id, limit, tagsOf) => {
    const s = skipSets(id, tagsOf), a = grid.nearest(at, limit, s.yesOnly);   // Grid.nearest searches whole cells, so the distance is checked here
    if (a.tag && a.d <= limit) return {...a, rel: 'yes'};
    const near = Math.min(limit, UNKNOWN_MM / 1000), b = grid.nearest(at, near, s.noOnly);
    return b.tag && b.d <= near ? {...b, rel: rel(id, b.tag)} : {d: Infinity, tag: null, q: null, rel: null};
  };
  return {rel, nearest, skipSets};
}

/** The relation of the atlas vessels, from the contact pairs the end audit saved (work/vessel-contacts.json); the audit is run when there is none yet. */
export async function relationFor(nameOf, names = []) {
  let pairs = loadContacts();
  if (!pairs) { const {auditEnds} = await import('../audit-vessel-ends.mjs'); auditEnds(); pairs = loadContacts() ?? []; }
  return makeRelation(nameOf, pairs, names);
}
