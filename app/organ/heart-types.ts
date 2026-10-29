export interface HeartPart {
  id: string;
  name: string;
  chinese: string;
  group: string;
  system: 'cardiac' | 'arterial' | 'venous';
  description: {zh: string; en: string};
  /** where the geometry comes from when not the Z-Anatomy export itself: 'BodyParts3D 4.0', 'schematic shell' or '示意構造' */
  origin?: string;
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
  /** single catalogue ids hidden on their own (the fine vessel branches while a chamber is open); a user can switch them on again from the list */
  hiddenParts: string[];
  /** the main coronary vessels and the great cardiac vein are drawn as their trunk only (the fine side branches stored in the same part are left out) */
  trunkOnly: boolean;
  selectedId: string | null;
  section: SectionState;
  ghostChambers: boolean;
  /** chamber whose wall is made nearly transparent so its inside shows; its own valves and papillary muscles are drawn even while those groups are hidden */
  openChamber: string | null;
  /** further catalogue ids drawn as selected (a list entry can stand for several pieces, e.g. the three cusps of a valve) */
  highlight: string[];
  /** `look` is an explicit camera direction (atlas axes), `focus` a catalogue id whose bounds the camera frames */
  command: {id: number; view: HeartView; look?: [number, number, number]; focus?: string};
}
/** Atlas axes: +x is the body's left, +y up, +z anterior. A coronal cut moves along z, a sagittal cut along x, a transverse cut along y. */
export const SECTION_AXES: Record<Exclude<SectionAxis, 'none'>, {index: 0 | 1 | 2; label: string; english: string}> = {
  coronal: {index: 2, label: '冠狀切面（前後）', english: 'Coronal'},
  sagittal: {index: 0, label: '矢狀切面（左右）', english: 'Sagittal'},
  transverse: {index: 1, label: '橫斷切面（上下）', english: 'Transverse'},
};
