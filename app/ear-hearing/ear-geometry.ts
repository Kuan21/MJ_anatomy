import * as T from 'three';
import {fetchModelBuffer} from '../model-download';

interface AtlasPart {id: string; vertexCount: number; indexCount: number; bounds: number[][]; positions: number; normals: number; indices: number}
interface Atlas {bytes: number; gzip: string; parts: AtlasPart[]}

/** The meshes of the ear detail mode, from the same package file (public/models/ear/ear-atlas.*) the detail viewer reads: nothing new is downloaded, and a second
 *  opening of the animation reuses the buffers read the first time. */
let cached: Promise<Map<string, T.BufferGeometry>> | null = null;
export function loadEarGeometries(progress?: (percent: number) => void): Promise<Map<string, T.BufferGeometry>> {
  cached ??= (async () => {
    const base = import.meta.env.BASE_URL, abort = new AbortController();
    const response = await fetch(`${base}models/ear/ear-atlas.json`, {signal: abort.signal});
    if (!response.ok) throw new Error('index');
    const atlas = await response.json() as Atlas;
    progress?.(15);
    const buffer = await fetchModelBuffer(`${base}${atlas.gzip}`, atlas.bytes, true, abort.signal);
    const out = new Map<string, T.BufferGeometry>();
    for (const a of atlas.parts) {
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(buffer, a.positions, a.vertexCount * 3), 3));
      geometry.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, a.normals, a.vertexCount * 3), 3, true));
      geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer, a.indices, a.indexCount), 1));
      geometry.computeBoundingBox(); geometry.computeBoundingSphere();
      out.set(a.id, geometry);
    }
    progress?.(100);
    return out;
  })();
  cached.catch(() => {cached = null;});
  return cached;
}
