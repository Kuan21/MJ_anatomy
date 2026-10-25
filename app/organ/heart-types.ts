export interface HeartPart {
  id: string;
  name: string;
  chinese: string;
  group: string;
  system: 'cardiac' | 'arterial' | 'venous';
  description: {zh: string; en: string};
  chunk: number;
  vertexCount: number;
  indexCount: number;
  bounds: [number[], number[]];
  positions: number;
  normals: number;
  indices: number;
}
export interface HeartGroup {id: string; label: string; english: string}
export interface HeartChunk {url: string; gzip: string; bytes: number; gzipBytes: number}
export interface HeartCatalogue {version: 1; source: string; license: string; attribution: string; groups: HeartGroup[]; parts: HeartPart[]; chunks: HeartChunk[]}

export type SectionAxis = 'none' | 'coronal' | 'sagittal' | 'transverse';
export interface SectionState {axis: SectionAxis; offset: number; flip: boolean}
export type HeartView = 'front' | 'back' | 'left' | 'right' | 'top' | 'fit';
export interface HeartViewState {
  hiddenGroups: string[];
  selectedId: string | null;
  section: SectionState;
  ghostChambers: boolean;
  command: {id: number; view: HeartView};
}
/** Atlas axes: +x is the body's left, +y up, +z anterior. A coronal cut moves along z, a sagittal cut along x, a transverse cut along y. */
export const SECTION_AXES: Record<Exclude<SectionAxis, 'none'>, {index: 0 | 1 | 2; label: string; english: string}> = {
  coronal: {index: 2, label: '冠狀切面（前後）', english: 'Coronal'},
  sagittal: {index: 0, label: '矢狀切面（左右）', english: 'Sagittal'},
  transverse: {index: 1, label: '橫斷切面（上下）', english: 'Transverse'},
};
