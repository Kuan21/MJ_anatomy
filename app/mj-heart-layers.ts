import type {Part} from './anatomy';

/** Interior of the heart in the main atlas: valve leaflets, papillary muscles and the blood-filled cavities. They show once the heart is opened. */
const INTERIOR=/papillary|valve|leaflet|cusp|cavity of/i;
export const isHeartInterior=(part:Part)=>part.system==='cardiac'&&INTERIOR.test(part.name);
/** Closed heart (default): only the outside is drawn. Opened heart: everything. */
export const matchesHeartLayer=(part:Part,open:boolean|undefined)=>open||!isHeartInterior(part);

/** Organ-surface shells drawn translucent: lung lobes and the serous membranes (pleura, pericardium) built around the organs.
 * "pericardium" as a whole word: the pericardiophrenic vessels are tubes, not shells, and a shell key without a material dropped their whole package. */
export const isShellSurface=(name:string)=>/^(?:upper|middle|lower) lobe of (?:right |left )?lung$|pleura|pericardium\b/i.test(name);
