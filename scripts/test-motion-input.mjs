import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const file=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TSX);
const names=['buildShownMotion','commitMotionPose','applyMotionPose','nudgeJoint','stopMotionAnimation'];
const declarations=[];
function visit(node){if(ts.isVariableDeclaration(node)&&names.includes(node.name.getText(file)))declarations.push('const '+node.getText(file)+';');ts.forEachChild(node,visit);}visit(file);
assert.equal(declarations.length,names.length);
const code=ts.transpileModule(declarations.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const frames=new Map(),motionTargetRef={current:{shoulderAbduction:0}},motionInputSide={current:'right'},motionPoseRef={current:{}},smoothMotionFrame={current:null};
let number=0,displayed,side='right';const focus=['shoulder'];let state={cameraFocusNonce:17,focusParts:focus};
const context={atlas:{},motionEnabled:true,studySide:'right',motionTargetRef,motionInputSide,motionPoseRef,smoothMotionFrame,
 buildUpperLimbMotion(_atlas,shown,pose){return{transforms:{[shown]:pose},warnings:[]};},constrainPose:p=>p,
 setMotionPose:p=>{displayed=p;},setMotionEdit(){},setError(){},setTopRegion(){},setMotionSide(){},setStudySide:s=>{side=s;},
 setState:update=>{state=update(state);},MOTION_LIMITS:{shoulderAbduction:[-20,165]},
 requestAnimationFrame:fn=>{const id=++number;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)
};
const api=new Function(...Object.keys(context),code+'return {'+names.join(',')+'};')(...Object.values(context));
api.applyMotionPose({shoulderAbduction:30});api.applyMotionPose({shoulderAbduction:60});
assert.equal(displayed.shoulderAbduction,60,'slider immediately follows latest input');assert.equal(frames.size,1,'coalesce input; no animation backlog');
api.nudgeJoint('left','shoulderAbduction',5);
assert.equal(side,'left');assert.equal(displayed.shoulderAbduction,65);
const flush=()=>{const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn());};flush();
assert.equal(state.partTransforms.left.shoulderAbduction,65,'queued frame uses current side, not stale closure');
assert.equal(state.cameraFocusNonce,17,'joint drag never refocuses the camera');assert.equal(state.focusParts,focus,'drag preserves chosen anatomy');assert.equal(frames.size,0,'no motion continues after the last input');
api.applyMotionPose({shoulderAbduction:90});api.stopMotionAnimation();flush();
assert.equal(state.partTransforms.left.shoulderAbduction,65,'cancelling a queued input prevents rebound');
console.log('PASS input: latest angle/side, one queued frame, fixed camera and anatomy, no post-release smoothing or cancelled-frame rebound.');
