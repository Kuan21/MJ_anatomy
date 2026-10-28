/** One card of a brain structure, written for this atlas (English first; the Chinese text is added later).
 * `rel` lists English names of other structures of the model; the viewer turns the ones it finds into buttons that highlight them. */
export interface BrainFact {
  loc: string; fn: string; rel: string[]; blood: string;
  /** Brodmann area, cortex only: left out for nuclei, white matter, ventricles and vessels */
  ba?: string;
  /** interlobar sulci and fissures: the two regions the groove separates */
  borders?: string;
  /** main nuclei of a region card that have no mesh of their own */
  nuclei?: {name: string; text: string}[];
  /** one card shared by several similar structures (set by markSharedFacts) */
  shared?: boolean;
  /** shared card: which structures it describes, written on the card */
  group?: string;
}
