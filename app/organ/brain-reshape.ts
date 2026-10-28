/** The model's fourth ventricle flares at the bottom like an upturned bell and is about 20 % too large. It should be a tent-shaped cavity between the pons and the upper medulla in front
 * and the cerebellum behind (the rhomboid fossa as its floor), narrowing below the lateral recesses into the central canal.
 * The mesh is reshaped when it is loaded: scaled down (length 0.86, width 0.92, depth 0.8) and tapered below its widest level; the end at the cerebral aqueduct stays where it is. */
export function reshapeFourthVentricle(positions: Float32Array): void {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {x0 = Math.min(x0, positions[i]); x1 = Math.max(x1, positions[i]); y0 = Math.min(y0, positions[i + 1]); y1 = Math.max(y1, positions[i + 1]); z1 = Math.max(z1, positions[i + 2]);}
  const cx = (x0 + x1) / 2, span = Math.max(1e-9, y1 - y0), step = (a: number, b: number, v: number) => {const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t);};
  for (let i = 0; i < positions.length; i += 3) {
    const t = (positions[i + 1] - y0) / span;
    const taper = .2 + .8 * step(0, .5, t);          // 0.2 at the lower end (central canal), 1 from the lateral recesses upward
    positions[i] = cx + (positions[i] - cx) * .92 * taper;
    positions[i + 2] = z1 - (z1 - positions[i + 2]) * .8 * (.45 + .55 * taper);
    positions[i + 1] = y1 - (y1 - positions[i + 1]) * .86;
  }
}
