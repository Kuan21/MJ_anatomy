import type {Part,SystemId} from './anatomy';
import {organOwner} from './mj-organ-owners';
import {TENDON_OWNERS} from './mj-tendon-owners';

/**
 * Owner structures: one generic display rule for everything that only makes sense together with another structure.
 *
 * 1. A tendon, a tendon sheath (including the dorsal compartments of the wrist) and the palmar aponeurosis follow their muscle (retinacula, ligaments and capsules do not). The owner muscle parts of every tendon come from the tendon cut specs (scripts/tendon/*.mjs, written to
 *    app/mj-tendon-owners.ts by scripts/prepare-tendon-owners.mjs); the tendon is shown by exactly the rules that show its muscle
 *    (region, side, layer and depth filters, Hide, Isolate) and, being a child of Muscles in the left panel, also needs the Muscles switch.
 * 2. A vessel or nerve that lies INSIDE an organ (coronary arteries, intrapulmonary branches, intrahepatic branches ...) needs the switch of that
 *    organ as well as its own system switch. Vessels and nerves that only pass by (aorta, venae cavae, phrenic and vagus nerves ...) have no owner.
 *
 * The organ table is data (app/mj-organ-owners.ts, classification list in docs/organ-owners.md).
 */
export {organOwner};
export interface Owners{
 /** tendon part id -> atlas ids of the muscle parts it was cut from */muscleOf:Map<string,string[]>;
 /** muscle part id -> tendon part ids */tendonsOf:Map<string,string[]>;
 /** in-organ vessel or nerve part id -> switch of its owner organ */organ:Map<string,SystemId>;
 byId:Map<string,Part>;
}

export function buildOwners(parts:Part[]):Owners{
 const byName=new Map<string,Part[]>(),byId=new Map<string,Part>();
 for(const p of parts){byId.set(p.id,p);const a=byName.get(p.name);if(a)a.push(p);else byName.set(p.name,[p]);}
 const table=TENDON_OWNERS,muscleOf=new Map<string,string[]>(),tendonsOf=new Map<string,string[]>(),organ=new Map<string,SystemId>();
 for(const p of parts){
  if(p.system==='tendon'||p.system==='connective'){
   const ids=(table[p.name]??[]).flatMap(n=>(byName.get(n)??[]).filter(q=>q.system==='muscular').map(q=>q.id));
   if(ids.length){muscleOf.set(p.id,ids);for(const m of ids){const a=tendonsOf.get(m);if(a)a.push(p.id);else tendonsOf.set(m,[p.id]);}}
  }
  const o=organOwner(p);if(o)organ.set(p.id,o);
 }
 return{muscleOf,tendonsOf,organ,byId};
}

/** The parts whose rules decide whether `p` is shown: its owner muscles for a tendon, otherwise the part itself. */
export function ruleParts(o:Owners,p:Part):Part[]{
 const ids=o.muscleOf.get(p.id);
 if(!ids)return[p];
 const out=ids.map(id=>o.byId.get(id)).filter((q):q is Part=>!!q);
 return out.length?out:[p];
}

/** Switches an in-organ vessel or tendon needs besides its own system: false when one of them is off. */
export function ownerSwitchesOn(o:Owners,p:Part,visible:{has(s:SystemId):boolean}):boolean{
 const organ=o.organ.get(p.id);
 if(organ&&!visible.has(organ))return false;
 // a tendon is a child of Muscles: with Muscles off it is always hidden, whatever the Tendons switch says; tendon sheaths and the palmar aponeurosis (connective tissue that has owner muscles) likewise
 if((p.system==='tendon'||o.muscleOf.has(p.id))&&!visible.has('muscular'))return false;
 return true;
}

/** Owner muscle parts of the selected tendons: shown faded as a reference whatever the Muscles switch and the filters say. */
export function referenceMuscles(o:Owners,selected:Iterable<string>):Set<string>{
 const out=new Set<string>(),sel=new Set(selected);
 for(const id of sel)for(const m of o.muscleOf.get(id)??[])if(!sel.has(m))out.add(m);
 return out;
}
