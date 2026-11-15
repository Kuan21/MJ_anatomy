// Pure helpers for the required-structure check (no file access): name normalisation and matching.
// A name is reduced to a key that ignores case, punctuation, hyphens, left/right words, .l/.r suffixes, numbering suffixes,
// plural endings and the word "muscle", so "Frontalis muscle", "Frontalis" and "left frontalis.l.001" are the same key.
// Artery, vein and nerve are NOT dropped: "facial artery" and "facial nerve" must stay different.

const RANK = {'PRESENT': 3, 'CONCEPT-ONLY': 2, 'CARD-ONLY': 1};

/** The main name and any bracketed alternative names, e.g. "Optic disc (blind spot)" gives ["Optic disc", "blind spot"]. */
export function splitNames(name) {
  const text = String(name ?? '');
  const main = text.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const alts = [...text.matchAll(/\(([^)]*)\)/g)].map(m => m[1].trim()).filter(a => /[A-Za-z]{4}/.test(a) && !/^(?:CN|V\d|[IVX]+\b)/i.test(a));
  return [main, ...alts].filter(Boolean);
}

const singular = w => {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && /(?:sses|uses|ches|shes|xes)$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !/(?:ss|us|is|as|os)$/.test(w)) return w.slice(0, -1);
  return w;
};

/** Canonical key of one English name; '' when nothing is left. */
export function canonKey(name) {
  let s = String(name ?? '').toLowerCase().replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\.(?:[lr]|j|g)(?=\.|$)/g, ' ').replace(/\.\d{1,3}$/g, ' ').replace(/\.\d{3}\b/g, ' ');
  s = s.replace(/humour/g, 'humor').replace(/caecum/g, 'cecum').replace(/oesoph/g, 'esoph').replace(/fibre/g, 'fiber');
  s = s.replace(/\b(?:left|right|bilateral)\b/g, ' ').replace(/&/g, ' and ').replace(/['’]s\b/g, '').replace(/['’]/g, '');
  s = s.replace(/[^a-z0-9]+/g, ' ').trim();
  const words = s.split(' ').filter(w => w && w !== 'the' && w !== 'musculus').map(singular).filter(w => w !== 'muscle');
  return words.join('');
}

/** The key used for de-duplicating the required list (main name only). */
export const requiredKey = en => canonKey(splitNames(en)[0] ?? en);

/** Keys a required name may be found under: its main name and bracketed alternatives. */
export const requiredKeys = en => [...new Set(splitNames(en).map(canonKey).filter(Boolean))];

/** Canonical key of a Traditional Chinese name. `sided` removes a leading 左/右 (only when the English name carried a side word). */
export function zhKey(zh, sided = false) {
  let s = String(zh ?? '').replace(/[（(][^）)]*[）)]/g, '').replace(/[\s·、,，.]/g, '');
  if (sided) s = s.replace(/^[左右]/, '');
  return s.replace(/臺/g, '台');
}

const PART_OF = /^(?:[a-z\- ]+? )?(?:part|head|belly|portion|segment|division|zone|trunk|trunks|root|roots|cord|cords|lobe|limb|body) of (?:the )?(.+)$/i;
/** A structure drawn only in pieces counts as present: "Superficial part of right masseter" makes "Masseter" present. */
export function parentNames(name) {
  const m = PART_OF.exec(String(name ?? '').replace(/\([^)]*\)/g, ' ').trim());
  return m && /[a-z]{4}/i.test(m[1]) ? [m[1]] : [];
}

/** Index of what the site shows: english and zh keys to the best status seen. */
export function createIndex() { return {en: new Map(), zh: new Map(), ids: 0}; }

const put = (map, key, status, source) => {
  if (!key) return;
  const old = map.get(key);
  if (!old || RANK[status] > RANK[old.status]) map.set(key, {status, source});
};

/** Registers one site structure. `names` are English names, `zh` its Chinese name(s). */
export function addToIndex(index, {names = [], zh = [], status = 'PRESENT', source = ''}) {
  index.ids++;
  const sided = names.some(n => /\b(?:left|right)\b|\.[lr](?:\.|$)/i.test(n));
  for (const n of names) for (const k of requiredKeys(n)) put(index.en, k, status, source);
  for (const n of names) for (const parent of parentNames(n)) for (const k of requiredKeys(parent)) put(index.en, k, status, source + ':parent');
  for (const z of [].concat(zh)) put(index.zh, zhKey(z, sided), status, source);
}

/** Status of a required structure: matched by English name first, then by Chinese name (reported as ALIAS), then by the alias table. */
export function classify(entry, index, aliasSites = []) {
  let best = null;
  // Earlier candidates win ties: English name, then the alias table, then the Chinese name.
  const consider = (hit, via) => { if (hit && (!best || RANK[hit.status] > RANK[best.hit.status])) best = {hit, via}; };
  for (const k of requiredKeys(entry.en)) consider(index.en.get(k), 'en');
  for (const site of aliasSites) for (const k of requiredKeys(site)) consider(index.en.get(k), 'alias');
  if (entry.zh) consider(index.zh.get(zhKey(entry.zh)), 'zh');
  if (!best) return {status: 'MISSING', via: '', source: ''};
  const status = best.via !== 'en' && best.hit.status === 'PRESENT' ? 'ALIAS' : best.hit.status;
  return {status, via: best.via, source: best.hit.source};
}
