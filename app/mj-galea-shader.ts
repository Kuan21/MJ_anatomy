/**
 * Look of the tendon-like sheets on the skull (the epicranial aponeurosis and the tendinous origin of trapezius below it): one pale grey-beige colour, a fine fibre relief and a soft darker edge.
 * The relief is computed in the fragment shader from the position of the point in the model (no image, no texture): wavy fibres that run from top to bottom over the back of the skull, as the tendon fibres do,
 * plus a very fine grain. It only bends the shading normal, the surface itself stays smooth.
 */
export const GALEA_COLOR='#cdc9ba';
/** How far from the rim of the sheet the soft edge reaches, in millimetres. */
export const GALEA_EDGE_MM=9;
export const GALEA_FRAG=`
varying float vEdge; varying vec3 vFibPos;
float gHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gNoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(gHash(i), gHash(i+vec2(1.0,0.0)), f.x), mix(gHash(i+vec2(0.0,1.0)), gHash(i+vec2(1.0,1.0)), f.x), f.y); }
// height of the fibre relief in metres: bundles about 1.6 mm apart that wander a little, finer fibres about 0.7 mm apart, and a faint grain
float galeaHeight(vec3 p){
  float w = gNoise(vec2(p.x*350.0, p.y*55.0));
  float coarse = sin(p.x*3900.0 + 3.0*w);
  float fine = sin(p.x*9000.0 + 4.0*gNoise(vec2(p.x*900.0, p.y*110.0)));
  float grain = gNoise(vec2(p.x*3500.0, p.y*1400.0)) - 0.5;
  return 0.000022*coarse + 0.000010*fine + 0.000012*grain;
}
vec3 galeaColor(vec3 base, float edge, vec3 p){
  float fibre = gNoise(vec2(p.x*2600.0, p.y*70.0));
  vec3 c = base * (0.96 + 0.08*fibre);
  // towards the muscle that takes over at the border: a warmer, slightly darker tone
  float t = smoothstep(0.0, 1.0, edge);
  return mix(c, vec3(0.36, 0.25, 0.22), 0.7*t);
}
vec3 galeaNormal(vec3 normal, vec3 p, vec3 viewPosition, float faceDirection){
  float h = galeaHeight(p);
  vec2 dH = vec2(dFdx(h), dFdy(h));
  vec3 sX = dFdx(-viewPosition), sY = dFdy(-viewPosition);
  vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
  float det = dot(sX, R1) * faceDirection;
  vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2);
  return normalize(abs(det) * normal - grad);
}
`;
