// The pinned upstream files are fetched from raw.githubusercontent.com during the build; the shared CI runners get HTTP 429 now and then.
// download() must retry 429/5xx/network errors (honouring Retry-After), fail at once on other 4xx, and give up after the attempt limit.
import http from 'node:http';
import {download} from './lib/download.mjs';

const hits = {ok429: 0, ok500: 0, gone: 0, always429: 0, retryAfter: 0};
const server = http.createServer((req, res) => {
  const key = req.url.slice(1);
  hits[key] = (hits[key] ?? 0) + 1;
  if (key === 'ok429') return hits[key] <= 2 ? (res.writeHead(429), res.end()) : (res.writeHead(200), res.end('payload'));
  if (key === 'ok500') return hits[key] <= 1 ? (res.writeHead(503), res.end()) : (res.writeHead(200), res.end('payload'));
  if (key === 'gone') return (res.writeHead(404), res.end());
  if (key === 'retryAfter') return hits[key] <= 1 ? (res.writeHead(429, {'Retry-After': '1'}), res.end()) : (res.writeHead(200), res.end('payload'));
  res.writeHead(429); res.end();
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`, quiet = {baseDelayMs: 5, maxDelayMs: 20, log() {}};
const fail = message => {server.close(); console.error(`FAIL: ${message}`); process.exit(1);};

let bytes = await download(base + 'ok429', {...quiet, label: 'a'});
if (bytes.toString() !== 'payload' || hits.ok429 !== 3) fail(`429 must be retried until success (hits ${hits.ok429})`);
bytes = await download(base + 'ok500', {...quiet, label: 'b'});
if (bytes.toString() !== 'payload' || hits.ok500 !== 2) fail(`503 must be retried (hits ${hits.ok500})`);
let threw = false;
try {await download(base + 'gone', {...quiet, label: 'c'});} catch {threw = true;}
if (!threw || hits.gone !== 1) fail(`404 must fail at once (hits ${hits.gone})`);
threw = false;
try {await download(base + 'always429', {...quiet, label: 'd', attempts: 3});} catch (e) {threw = /429/.test(e.message);}
if (!threw || hits.always429 !== 3) fail(`must give up after the attempt limit with the 429 error (hits ${hits.always429})`);
const started = Date.now();
bytes = await download(base + 'retryAfter', {...quiet, label: 'e'});
if (bytes.toString() !== 'payload' || Date.now() - started < 900) fail('Retry-After must be honoured');
server.close();
console.log('Download retry: 429 and 503 retried, 404 fails at once, attempt limit and Retry-After checked.');
