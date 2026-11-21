/**
 * A vessel and its end piece are one structure. scripts/prepare-vessel-ends.mjs packs the connectors, bridges and tapers it adds at the ends of a vessel
 * into a separate part with the same name (`<vessel id>-END`). Picked on its own, that part lit up as loose fragments and its card read like a schematic
 * model "generated from the surface of the neighbouring structure". Picking, hovering or labelling either part therefore takes both, and the card is the vessel's.
 */
export const END_SUFFIX='-END';
export const isVesselEnd=(id:string)=>id.endsWith(END_SUFFIX);
/** The vessel a part belongs to: its own id, or for an end piece the id of the vessel it finishes. */
export const vesselBase=(id:string)=>isVesselEnd(id)?id.slice(0,-END_SUFFIX.length):id;
/** Ids selected together when `id` is picked: the vessel first (its card is shown), then its end piece. Parts that are neither come back alone. */
export function vesselUnit(id:string,has:(id:string)=>boolean):string[]{
 const base=vesselBase(id);
 if(!has(base))return [id];
 return has(base+END_SUFFIX)?[base,base+END_SUFFIX]:[base];
}
