// Shared by normal checks and baseline updates. Updating must never accept a regression.
//
// "detached" and "stretch" findings also carry two numbers that do not depend on how many vertices or triangles the mesh happens to have: `fraction` (the share of the sampled points
// that are detached, or of the mesh's triangles that are stretched) and `severity` (how far the worst point is from its bone, in mm; or the worst edge stretch, as a factor).
// A known entry that has both is compared on them: it is worse only when the severity grew past a small tolerance or the share grew by more than FRACTION_TOLERANCE. The raw count
// (`measure`) is then kept for reading but never compared, so re-sampling or replacing a mesh (a different source, a finer or coarser tessellation) does not look like a regression.
// Entries without these numbers, and every other check, keep the original rule (measure may not grow).
export const SEVERITY_TOLERANCE = {detached: 2, stretch: .1}, FRACTION_TOLERANCE = .05;
const hasMetrics = o => Number.isFinite(o?.fraction) && Number.isFinite(o?.severity);

function worse(f, k, adopt) {
  if (hasMetrics(f) && hasMetrics(k) && f.check in SEVERITY_TOLERANCE) return f.severity > k.severity + SEVERITY_TOLERANCE[f.check] + 1e-9 || f.fraction > k.fraction + FRACTION_TOLERANCE + 1e-9;
  if (hasMetrics(f) && adopt && f.check in SEVERITY_TOLERANCE && !hasMetrics(k)) return false;   // one-time move of an entry onto the density-free numbers
  return f.measure > k.measure + 1e-9;
}

export function compareBaseline(known, findings, checks, {adopt = false} = {}) {
  const scope = new Set(checks), current = new Map(), invalid = [];
  for (const [key, value] of Object.entries(known)) {
    if (!Number.isFinite(value?.measure) || value.measure < 0 || !value.reason?.trim()) invalid.push(key);
    if ((value?.fraction !== undefined || value?.severity !== undefined) && (!hasMetrics(value) || value.fraction < 0 || value.severity < 0)) invalid.push(key);
  }
  for (const f of findings) {
    if (!scope.has(f.check) || f.key !== `${f.check}|${f.id}${f.sub ? '|' + f.sub : ''}` ||
        !Number.isFinite(f.measure) || f.measure < 0 || current.has(f.key)) invalid.push(f.key);
    current.set(f.key, f);
  }
  const bad = findings.filter(f => !Object.hasOwn(known, f.key) || worse(f, known[f.key], adopt));
  const gone = Object.keys(known).filter(k => scope.has(k.split('|')[0]) && !current.has(k));
  // No caller may accidentally save a partially updated baseline on failure.
  if (invalid.length || bad.length) return {invalid, bad, gone, next: null};
  const next = {};
  for (const [key, value] of Object.entries(known)) {
    if (!scope.has(key.split('|')[0])) next[key] = {...value};
    else if (current.has(key)) {
      const f = current.get(key), entry = {...value, measure: Math.min(value.measure, f.measure)};
      if (hasMetrics(f) && f.check in SEVERITY_TOLERANCE) {
        if (hasMetrics(value)) { entry.fraction = Math.min(value.fraction, f.fraction); entry.severity = Math.min(value.severity, f.severity); }
        else if (adopt) { entry.fraction = f.fraction; entry.severity = f.severity; }
      }
      next[key] = entry;
    }
  }
  return {invalid, bad, gone, next};
}
