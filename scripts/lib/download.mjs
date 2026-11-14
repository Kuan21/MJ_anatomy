// Download with retry for build-time fetches of pinned upstream files (raw.githubusercontent.com rate-limits shared CI runners with HTTP 429).
// Retries network errors, timeouts, 408/425/429 and 5xx with exponential back-off and honours Retry-After; other 4xx fail at once.
// Callers still verify the pinned checksum themselves, so a retry can never accept a wrong file.
const RETRYABLE = new Set([408, 425, 429]);

export async function download(url, {label = url, attempts = 6, timeoutMs = 180000, baseDelayMs = 5000, maxDelayMs = 90000, maxRetryAfterMs = 120000, log = console.warn} = {}) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let wait = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(timeoutMs)});
      if (response.ok) return Buffer.from(await response.arrayBuffer());
      last = new Error(`${label} download failed: ${response.status}`);
      if (!RETRYABLE.has(response.status) && response.status < 500) throw Object.assign(last, {fatal: true});
      const retryAfter = Number(response.headers.get('retry-after'));
      if (Number.isFinite(retryAfter) && retryAfter >= 0) wait = Math.min(maxRetryAfterMs, Math.max(wait, retryAfter * 1000));
    } catch (e) {
      if (e.fatal) throw e;
      last = e;
    }
    if (attempt < attempts) {
      log(`${label}: attempt ${attempt}/${attempts} failed (${last.message}); retrying in ${Math.round(wait / 1000)} s`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw last;
}
