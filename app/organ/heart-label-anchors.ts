import * as T from 'three';
import type {Pt} from './label-leaders';

export interface SurfacePoint {world: T.Vector3; screen: Pt}
export interface VisibilityOptions {
  camera: T.PerspectiveCamera; width: number; height: number;
  /** drawn parts that hide what lies behind them (see-through ones are left out by the caller) */
  occluders: T.Mesh[];
  /** true when a point (a sample, or a ray hit) is cut away by a section plane or by the opened chamber's cut: it neither shows nor hides anything */
  cutAway: (mesh: T.Mesh, point: T.Vector3) => boolean;
  samples?: number;
}

/**
 * Points of the given meshes that the camera really sees: a ray from the camera to the point must not meet any drawn part before it. Points that are behind a wall,
 * behind another structure, outside the view or cut away are not returned, so a structure that is hidden from this view gets no point and therefore no leader line.
 * The result is sorted best first: nearest the middle of the visible area.
 */
export function visibleSurfacePoints(meshes: T.Mesh[], o: VisibilityOptions): SurfacePoint[] {
  const raycaster = new T.Raycaster(), origin = o.camera.position.clone(), found: SurfacePoint[] = [], v = new T.Vector3();
  const per = Math.max(8, Math.floor((o.samples ?? 48) / Math.max(1, meshes.length)));
  o.camera.updateMatrixWorld();
  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false);
    const position = mesh.geometry.getAttribute('position'), step = Math.max(1, Math.floor(position.count / per));
    for (let i = 0; i < position.count; i += step) {
      v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      if (o.cutAway(mesh, v)) continue;
      const ndc = v.clone().project(o.camera);
      if (ndc.z > 1 || Math.abs(ndc.x) > .96 || Math.abs(ndc.y) > .96) continue;
      const dir = v.clone().sub(origin), distance = dir.length();
      raycaster.set(origin, dir.normalize()); raycaster.far = distance - .002;
      let hidden = false;
      for (const hit of raycaster.intersectObjects(o.occluders, false)) if (!o.cutAway(hit.object as T.Mesh, hit.point)) {hidden = true; break;}
      if (!hidden) found.push({world: v.clone(), screen: {x: (ndc.x * .5 + .5) * o.width, y: (-ndc.y * .5 + .5) * o.height}});
    }
  }
  if (!found.length) return found;
  const mx = found.reduce((s, p) => s + p.screen.x, 0) / found.length, my = found.reduce((s, p) => s + p.screen.y, 0) / found.length;
  return found.sort((a, b) => Math.hypot(a.screen.x - mx, a.screen.y - my) - Math.hypot(b.screen.x - mx, b.screen.y - my));
}
