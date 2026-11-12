/** Timing of the camera glide that frames a structure (Focus, search, Isolate): one fixed-length ease-out
 * measured on the wall clock, so a slow frame rate shortens the number of steps, never the time it takes. */
export const CAMERA_TWEEN_MS=300;
export const easeOutCubic=(k:number)=>1-(1-k)**3;
/** Progress of a tween started at `start`: `k` is the linear share of the duration already elapsed (0–1),
 * `e` the eased share to interpolate with, `done` true once the duration has passed. */
export function tweenProgress(start:number,now:number,duration=CAMERA_TWEEN_MS){
 const k=Math.min(1,Math.max(0,(now-start)/duration));
 return {k,e:easeOutCubic(k),done:k>=1};
}
