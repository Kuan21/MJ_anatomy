import type {Part,SceneState,SystemId} from './anatomy';
import {matchesDepth} from './mj-depth';
import {matchesMuscleLayer} from './mj-muscle-layers';
import {matchesFacialMuscleLayer} from './mj-facial-layers';
import {matchesHeartLayer} from './mj-heart-layers';
import {matchesSex} from './mj-sex';
import {serousLayerKey} from './mj-serous';
import {ownerSwitchesOn,referenceMuscles,ruleParts,type Owners} from './mj-owners';

/**
 * The one place that decides whether a structure passes the display rules (system switches, region focus, Hide, Isolate, depth, muscle layers, owner rules).
 * The scene, the part counter and the visibility test (scripts/test-owner-display.mjs) all use it, so a rule cannot work in one and not in another.
 * A tendon (or a sheath that follows a muscle) is shown only when at least one of its owner muscle parts is shown by every one of those rules; a piece of a
 * multi-muscle tendon has exactly one owner, so hiding that muscle hides the piece.
 */
/** The mound of the pubis and the labia are folds of skin: they hang on the body surface, which is male here. With the body surface switched off they would float in front of the (male) pelvic muscles, so they are shown only together with it. */
export const SKIN_FOLDS=/^(?:mons pubis|(?:left |right )?labium (?:majus|minus))$/i;

export type VisibilityState=Pick<SceneState,'visible'|'selected'|'hiddenParts'|'focusParts'|'isolate'|'depthFilter'|'muscleRegion'|'muscleLayer'|'faceMuscleLayer'|'heartOpen'|'sex'|'hiddenSerous'>;

export function partVisibility(owners:Owners,s:VisibilityState){
 const visible=new Set<SystemId>(s.visible),selection=new Set(s.selected),hidden=new Set(s.hiddenParts??[]),focus=s.focusParts?new Set(s.focusParts):null;
 const ruleVisible=(p:Part,viaOwner=false)=>{
  if(hidden.has(p.id))return false;
  if(SKIN_FOLDS.test(p.name)&&!visible.has('integumentary'))return false;
  if(!matchesDepth(p,s.depthFilter)||!matchesMuscleLayer(p,s.muscleRegion,s.muscleLayer)||!matchesFacialMuscleLayer(p,s.faceMuscleLayer)||!matchesHeartLayer(p,s.heartOpen)||!matchesSex(p,s.sex)||(p.system==='serous'&&(s.hiddenSerous??[]).includes(serousLayerKey(p.name))))return false;
  // Isolate keeps what is selected; the tendons of a selected muscle stay with it
  if(s.isolate)return viaOwner&&selection.has(p.id)&&visible.has(p.system);
  return focus?focus.has(p.id)&&visible.has(p.system):visible.has(p.system);
 };
 /** shown by the filters (selection overrides are applied by the caller) */
 const base=(p:Part)=>{
  if(hidden.has(p.id))return false;
  if(!ownerSwitchesOn(owners,p,visible))return false;
  if(owners.muscleOf.has(p.id))return visible.has(p.system)&&ruleParts(owners,p).some(m=>m!==p&&ruleVisible(m,true));
  return ruleVisible(p);
 };
 return{base,hidden,visible,selection,focus,refMuscles:referenceMuscles(owners,selection)};
}
