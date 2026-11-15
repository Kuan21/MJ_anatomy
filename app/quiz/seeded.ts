/** Small deterministic generator (FNV-1a seed, mulberry32 steps): the same seed always gives the same sequence. */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619);}
  return () => {h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296;};
}
/** Deterministic shuffle (Fisher-Yates driven by the seed). */
export function seededShuffle<T>(values: readonly T[], seed: string): T[] {
  const next = seededRandom(seed), out = [...values];
  for (let i = out.length - 1; i > 0; i--) {const j = Math.floor(next() * (i + 1)); [out[i], out[j]] = [out[j], out[i]];}
  return out;
}
