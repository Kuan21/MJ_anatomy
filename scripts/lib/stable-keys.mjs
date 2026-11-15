// Stable identifiers for the known-violation lists (docs/stability-known.json, docs/vessel-motion-exceptions.json).
// The schematic structures are numbered PK-n / PKC-n in build order, so adding or removing one structure moves every later number and a list keyed by the number then
// points at the wrong structure. Inside these lists a PK / PKC id is therefore written as its name: `PK:<name>`, with `#<k>` (k = 1, 2, ... in id order) only when several
// structures of the same kind share one name. Atlas ids (FJ..., HRAF-...) do not move and stay as they are. A `-END` suffix (connector piece) is kept.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

export const PK_ID = /^(PKC?)-(\d+)(-END)?$/;
export const PK_TOKEN = /^(PKC?):(.+?)(#\d+)?(-END)?$/s;
const PK_IN_TEXT = /\bPKC?-\d+(?:-END)?(?![\w-])/g;

/** parts: [{id, name}] (any order). Returns converters between the numbered ids and the stable tokens for exactly this list. */
export function makeStableIds(parts) {
  const groups = new Map();   // `${prefix}|${name}` -> [numeric ids ascending]
  for (const p of parts) { const m = PK_ID.exec(p.id ?? ''); if (!m || m[3]) continue; const k = `${m[1]}|${p.name}`; (groups.get(k) ?? groups.set(k, []).get(k)).push(+m[2]); }
  for (const l of groups.values()) l.sort((a, b) => a - b);
  const byToken = new Map(), nameOf = new Map();
  for (const p of parts) nameOf.set(p.id, p.name);
  const tokenOfBase = id => {
    const m = PK_ID.exec(id); if (!m) return id;
    const name = nameOf.get(`${m[1]}-${m[2]}`); if (name === undefined) return null;
    const l = groups.get(`${m[1]}|${name}`);
    return `${m[1]}:${name}${l.length > 1 ? '#' + (l.indexOf(+m[2]) + 1) : ''}${m[3] ?? ''}`;
  };
  for (const p of parts) { const t = PK_ID.test(p.id) ? tokenOfBase(p.id) : null; if (t) byToken.set(t, p.id); }
  return {
    /** the stable token of one id (PK-12 -> `PK:Name`); ids that are not PK / PKC come back unchanged; a PK id that is not in the list gives null */
    token: id => PK_ID.test(id ?? '') ? tokenOfBase(id) : id,
    /** the numbered id of one stable token, or null when no structure of that name (and number) exists any more; other ids come back unchanged */
    id: token => { const m = PK_TOKEN.exec(token ?? ''); if (!m) return token; const base = byToken.get(`${m[1]}:${m[2]}${m[3] ?? ''}`); return base === undefined ? null : base + (m[4] ?? ''); },
    /** every PK / PKC id inside a longer text replaced by its stable token (text with an unknown PK id keeps that id, which the list check reports) */
    text: s => String(s).replace(PK_IN_TEXT, id => tokenOfBase(id.replace(/-END$/, '')) === null ? id : tokenOfBase(id.replace(/-END$/, '')) + (id.endsWith('-END') ? '-END' : '')),
  };
}

/** the PK / PKC structures of the schematic stream as built now: [{id, name}] */
export function loadPaokaoList() {
  const f = fileURLToPath(new URL('../../public/models/paokao/paokao-stream.json.gz', import.meta.url));
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(f))).parts.map(p => ({id: p.id, name: p.name}));
}

/** The identifiers a list key refers to: every `|`-separated piece that looks like a structure id (FJ..., HRAF-..., PK:..., nerve:...). Poses, sides and kinds are not ids. */
export const ID_PIECE = /^(FJ\d+M?|HRAF-[\w-]+|PKC?:.+|nerve:.+|[A-Z]{2,6}-\d+)(-END)?$/s;
export const idsOfKey = key => String(key).split('|').filter(s => ID_PIECE.test(s));
