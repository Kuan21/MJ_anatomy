import type {OrganSectionState} from './organ-detail-layout';

/** English and Taiwan Chinese text of one card field. */
export interface Bi {en: string; zh: string}
/** Card of one structure. Fields are filled by structure type: organs and regions (location, relations, supply, nerves, function); ducts and ligaments (course, connections, contents). */
export interface OrganCard {
  /** Position in the body and in the organ. */
  loc?: Bi;
  /** Neighbouring structures. */
  rel?: Bi;
  /** Course and connections (ducts, ligaments, vessels inside the organ). */
  course?: Bi;
  /** What passes through / what is contained. */
  contents?: Bi;
  blood?: Bi;
  nerve?: Bi;
  fn?: Bi;
  note?: Bi;
  /** Keys of related structures (shown as links). */
  links?: string[];
}
export interface OrganGroupDef {id: string; en: string; zh: string; /** peel order: layer < peel is removed; -1 = never peeled */ layer: number; on: boolean}
export interface OrganPartDef {
  key: string;
  en: string;
  zh: string;
  group: string;
  color: string;
  opacity?: number;
  /** Surface marking: a set of triangles of the host mesh (channel 'zone' = partition of the surface, 'line' = strips and patches over it). */
  mark?: {host: string; channel: 'zone' | 'line'; values: number[]};
  /** Built by us from the shape of the neighbouring structures (shown as 示意). */
  schematic?: boolean;
  /** Quiz: false = not asked (an aggregate of other markings). */
  quiz?: false;
  /** Quiz category of the structure (default: the organ's own system); vessels and nerves are asked as arteries, veins and nerves. */
  quizSystem?: 'viscera' | 'arterial' | 'venous' | 'nervous';
  /** Quiz side of a paired structure (default midline). */
  side?: 'left' | 'right' | 'midline';
  /** No mesh: the card only. */
  cardOnly?: boolean;
  card?: OrganCard;
}
/** A one-click arrangement of the groups: the listed groups are shown, the others hidden; `ghost` groups are drawn as a faint shell for orientation; `glass` makes the organ wall see-through. */
export interface OrganPreset {id: string; en: string; zh: string; show: string[]; ghost?: string[]; glass?: boolean; zones?: boolean}
export interface OrganDef {
  id: string;
  /** "胃" */
  zh: string;
  en: string;
  manifest: string;
  groups: OrganGroupDef[];
  parts: OrganPartDef[];
  /** Meshes (manifest ids) that make up the organ itself; context meshes are left out of the framing and the section range. */
  coreGroups: string[];
  /** Explanation of the layers, in order. */
  peelNote: string;
  scope: string[];
  /** Groups whose meshes turn see-through with the glass switch (default: the wall of the organ). */
  glassGroups?: string[];
  /** One-click arrangements shown above the structure list (organ only, one system at a time, everything). */
  presets?: OrganPreset[];
  /** Default state of the surface-zone colouring. */
  zonesDefault?: boolean;
}
export type OrganView = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'fit';
export interface OrganViewState {
  hiddenGroups: string[];
  hiddenParts: string[];
  peel: number;
  isolate: string[] | null;
  selectedIds: string[];
  section: OrganSectionState;
  zones: boolean;
  /** Groups drawn as a faint shell (not clickable) even if they are hidden. */
  ghost: string[];
  /** The organ wall is see-through, so the vessels and nerves behind it show. */
  glass: boolean;
  command: {id: number; view: OrganView; focus?: string[]};
}
