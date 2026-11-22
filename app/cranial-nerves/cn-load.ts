import * as T from 'three';
import {fetchModelBuffer} from '../model-download';
import {indexArray, normalArray, positionArray, type PackedPart} from '../stream-geometry';
import type {NerveCatalogue} from '../nerve-stream';

/** Loading only the meshes an animation needs from the site's own packages (no new files): the main atlas stream, the facial muscles, the schematic (paokao) package and the
 *  nerve stream. Every package is fetched once and only the chunks that hold a wanted mesh are downloaded. */

interface StreamPart extends PackedPart {id: string; name: string; chunk: number}
interface StreamManifest {parts: StreamPart[]; chunks: {url: string; gzip: string; bytes: number; gzipBytes?: number}[]}
export interface LoadedMesh {name: string; source: 'atlas' | 'facial' | 'paokao' | 'nerve'; geometry: T.BufferGeometry}

const base = () => import.meta.env.BASE_URL;
const url = (p: string) => base() + p.replace(/^\//, '');
const json = async (path: string, compressed: boolean, signal: AbortSignal) => JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${base()}${path}`, 0, compressed, signal)));
/** a mesh name without its side, lower case: "Superficial part of right masseter" → "superficial part of masseter" */
export const sideless = (name: string) => name.toLowerCase().replace(/\b(left|right)\b\s?/g, '').replace(/\s+/g, ' ').trim();
export const sideOf = (name: string): 'left' | 'right' | null => /\bleft\b|\.l(\.\d+)?$/i.test(name) ? 'left' : /\bright\b|\.r(\.\d+)?$/i.test(name) ? 'right' : null;

async function fromStream(path: string, source: LoadedMesh['source'], keep: (name: string) => boolean, signal: AbortSignal, progress: () => void) {
  const manifest = await json(path, true, signal) as StreamManifest;
  const seen = new Set<string>(), parts = manifest.parts.filter(p => {if (!keep(p.name) || seen.has(p.name)) return false; seen.add(p.name); return true;});
  const chunks = [...new Set(parts.map(p => p.chunk))], buffers = new Map<number, ArrayBuffer>();
  // one package that fails leaves its meshes out; the rest of the animation still loads
  await Promise.all(chunks.map(async c => {
    const ch = manifest.chunks[c];
    try {
      let buf: ArrayBuffer;
      try {buf = await fetchModelBuffer(url(ch.gzip), ch.bytes, true, signal);} catch (e) {if (signal.aborted) throw e; buf = await fetchModelBuffer(url(ch.url), ch.bytes, false, signal);}
      buffers.set(c, buf);
    } catch (e) {if (signal.aborted) throw e; console.warn('package not loaded', ch.url, e);}
    progress();
  }));
  return parts.filter(p => buffers.has(p.chunk)).map(p => {
    const buf = buffers.get(p.chunk)!, g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(positionArray(buf, p), 3));
    g.setAttribute('normal', new T.BufferAttribute(normalArray(buf, p), 3, true));
    g.setIndex(new T.BufferAttribute(indexArray(buf, p), 1)); g.computeBoundingBox(); g.computeBoundingSphere();
    return {name: p.name, source, geometry: g} as LoadedMesh;
  });
}

async function fromNerves(keep: (name: string) => boolean, signal: AbortSignal, progress: () => void) {
  const catalogue = await json('models/nerve-stream.json', false, signal) as NerveCatalogue;
  const wanted = catalogue.chunks.filter(c => c.meshes.some(m => keep(m.name)));
  const out: LoadedMesh[] = [];
  await Promise.all(wanted.map(async chunk => {
    let buf: ArrayBuffer;
    try {buf = await fetchModelBuffer(url(chunk.url), chunk.bytes, true, signal);} catch (e) {if (signal.aborted) throw e; console.warn('package not loaded', chunk.url, e); progress(); return;}
    for (const m of chunk.meshes) {
      if (!keep(m.name)) continue;
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(new Float32Array(buf, m.positions, m.vertexCount * 3).slice(), 3));
      g.setIndex(new T.BufferAttribute(new Uint32Array(buf, m.indices, m.indexCount).slice(), 1));
      g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
      out.push({name: m.name, source: 'nerve', geometry: g});
    }
    progress();
  }));
  return out;
}

export interface Wanted {atlas: (n: string) => boolean; facial: (n: string) => boolean; paokao: (n: string) => boolean; nerve: (n: string) => boolean}
/** Loads the wanted meshes of all four packages; `progress` gets a share 0–100. */
export async function loadSiteMeshes(w: Wanted, signal: AbortSignal, progress: (percent: number) => void): Promise<LoadedMesh[]> {
  let done = 0, total = 40; // a guess until the manifests are read; it only drives the loading percentage
  const tick = () => {done++; progress(Math.min(99, Math.round(done / total * 100)));};
  const lists = await Promise.all([
    fromStream('models/atlas-stream.json.gz', 'atlas', w.atlas, signal, tick),
    fromStream('models/facial/facial-stream.json.gz', 'facial', w.facial, signal, tick),
    fromStream('models/paokao/paokao-stream.json.gz', 'paokao', w.paokao, signal, tick),
    fromNerves(w.nerve, signal, tick),
  ]);
  total = done; progress(100);
  return lists.flat();
}
