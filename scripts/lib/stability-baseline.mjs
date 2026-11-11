// Shared by normal checks and baseline updates. Updating must never accept a regression.
export function compareBaseline(known, findings, checks) {
  const scope = new Set(checks), current = new Map(), invalid = [];
  for (const [key, value] of Object.entries(known)) {
    if (!Number.isFinite(value?.measure) || value.measure < 0 || !value.reason?.trim()) invalid.push(key);
  }
  for (const f of findings) {
    if (!scope.has(f.check) || f.key !== `${f.check}|${f.id}${f.sub ? '|' + f.sub : ''}` ||
        !Number.isFinite(f.measure) || f.measure < 0 || current.has(f.key)) invalid.push(f.key);
    current.set(f.key, f);
  }
  const bad = findings.filter(f => !Object.hasOwn(known, f.key) || f.measure > known[f.key].measure + 1e-9);
  const gone = Object.keys(known).filter(k => scope.has(k.split('|')[0]) && !current.has(k));
  // No caller may accidentally save a partially updated baseline on failure.
  if (invalid.length || bad.length) return {invalid, bad, gone, next: null};
  const next = {};
  for (const [key, value] of Object.entries(known)) {
    if (!scope.has(key.split('|')[0])) next[key] = {...value};
    else if (current.has(key)) next[key] = {...value, measure: Math.min(value.measure, current.get(key).measure)};
  }
  return {invalid, bad, gone, next};
}
