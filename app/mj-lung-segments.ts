import data from './mj-lung-segments.json';

/**
 * Bronchopulmonary segments (肺段). The atlas has the segmental bronchi as real meshes ("… segmental bronchial tree"); it has no model of the segments themselves,
 * so the territory of each segment on the lobe surface is a schematic partition (示意分區) built by scripts/paokao-structures/lung-segments.mjs: every triangle of a lobe
 * goes to the segment whose bronchus is nearest. The bronchus and the territory of a segment share one colour here.
 * Right lung: the usual 10 segments. Left lung: 8 (apicoposterior S1+2 and anteromedial basal S7+8 are merged).
 */
export interface LungSegmentDef{key:string;side:'left'|'right';lobe:'upper'|'middle'|'lower';number:string;color:string;en:string;zh:string;trees:string[];bronchus:[string,string];relations:[string,string];clinical?:[string,string];aliases:{en:string[];zh:string[]}}
export const LUNG_SEGMENTS=data.segments as unknown as LungSegmentDef[];
export const LUNG_SEGMENT_KIND='segment';
const byTree=new Map<string,string>(LUNG_SEGMENTS.flatMap(s=>s.trees.map(t=>[t.toLowerCase(),s.key] as [string,string])));
const byName=new Map<string,LungSegmentDef>(LUNG_SEGMENTS.map(s=>[s.en.toLowerCase(),s]));
/** The segment a part belongs to: its territory patch (kind "segment") by name, or one of the meshes of its segmental bronchial tree. */
export function lungSegmentKey(p:{name:string;kind?:string;system?:string}):string|undefined{
 const n=p.name.toLowerCase();
 if(p.kind===LUNG_SEGMENT_KIND)return byName.get(n)?.key;
 return p.system==='respiratory'||p.system===undefined?byTree.get(n):undefined;
}
export const lungSegmentByKey=(key:string)=>LUNG_SEGMENTS.find(s=>s.key===key);
export const lungSegmentByName=(name:string)=>byName.get(name.toLowerCase());
export const LOBE_LABEL:Record<LungSegmentDef['lobe'],[string,string]>={upper:['Upper lobe','上葉'],middle:['Middle lobe','中葉'],lower:['Lower lobe','下葉']};
