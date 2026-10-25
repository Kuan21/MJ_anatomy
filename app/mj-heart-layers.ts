import type {Part} from './anatomy';

/** Interior of the heart in the main atlas: valve leaflets, papillary muscles and the blood-filled cavities. They show once the heart is opened. */
const INTERIOR=/papillary|valve|leaflet|cusp|cavity of/i;
export const isHeartInterior=(part:Part)=>part.system==='cardiac'&&INTERIOR.test(part.name);
/** Closed heart (default): only the outside is drawn. Opened heart: everything. */
export const matchesHeartLayer=(part:Part,open:boolean|undefined)=>open||!isHeartInterior(part);

/** Organ-surface shells drawn translucent: lung lobes and the serous membranes (pleura, pericardium) built around the organs. */
export const isShellSurface=(name:string)=>/^(?:upper|middle|lower) lobe of (?:right |left )?lung$|pleura|pericardi/i.test(name);
