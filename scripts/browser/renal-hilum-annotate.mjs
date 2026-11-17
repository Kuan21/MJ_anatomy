// Labels for the AB-01 screenshots (PR description only, never on the site): projects the hilum position of the renal vein, renal artery and renal pelvis of each side
// (median of the vertices 30–42 mm from the midline, within 20 mm of the hilum height; before or after the load-time shift) with the camera recorded by renal-hilum-shots.cjs,
// and draws a dot, a leader line and the English and Chinese name on a copy of each close hilum shot (Python Pillow, wqy-zenhei font). The anchor can lie behind
// another structure in the picture, so the dot is moved to the nearest pixel of the structure's own colour (veins blue, arteries red, ureter and pelvis pale yellow) within 60 px.
// usage: node scripts/browser/renal-hilum-annotate.mjs <outDir> <tag before|after>
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {M, loaded, HILUM} from '../measure-renal-hilum.mjs';
const [out = '/tmp/renal-hilum', tag = 'after'] = process.argv.slice(2), apply = tag !== 'before';
const meta = JSON.parse(fs.readFileSync(`${out}/${tag}-camera.json`, 'utf8'));
const NAMES = {vein: ['Renal vein', '腎靜脈'], artery: ['Renal artery', '腎動脈'], pelvis: ['Renal pelvis', '腎盂']};
const COLOR = {vein: '#2f5f8f', artery: '#9b1c2c', pelvis: '#8a6a1a'};
const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
/** Hilum anchor (metres) of a role: median x, y, z of its vertices in the hilum band. */
function anchor(side, role) {
  const s = M.SPEC[side], sg = side === 'Left' ? 1 : -1, [lo, hi] = HILUM[side], xs = [], ys = [], zs = [];
  for (const id of M.PARTS[side][role]) {
    const L = loaded(id, apply); if (!L) continue;
    if (role === 'artery' && /segmental|suprarenal|Ureteric/.test(L.name)) continue;
    for (let i = 0; i < L.pos.length; i += 3) {
      const u = L.pos[i] * 1e3 * sg, y = L.pos[i + 1] * 1e3;
      if (u < lo || u >= hi || Math.abs(y - s.y) > 20 || (role === 'pelvis' && y < M.PELVIS_Y[1])) continue;
      xs.push(L.pos[i]); ys.push(L.pos[i + 1]); zs.push(L.pos[i + 2]);
    }
  }
  return [median(xs), median(ys), median(zs)];
}
/** Pixel position of a world point in a screenshot (perspective camera, fov 34°, the canvas rectangle and zoom recorded with the shot). */
function project(m, P) {
  const [px, py, pz, tx, ty, tz] = m.camera, f = [tx - px, ty - py, tz - pz], fl = Math.hypot(...f); f.forEach((v, i) => f[i] = v / fl);
  const up = [0, 1, 0]; let r = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]];
  if (Math.hypot(...r) < 1e-6) r = [1, 0, 0]; const rl = Math.hypot(...r); r = r.map(v => v / rl);
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const d = [P[0] - px, P[1] - py, P[2] - pz], x = d[0] * r[0] + d[1] * r[1] + d[2] * r[2], y = d[0] * u[0] + d[1] * u[1] + d[2] * u[2], z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
  const {w, h, left, top} = m.canvas, t = Math.tan(34 / 2 * Math.PI / 180) / (m.zoom || 1), aspect = w / h;
  return [left + (x / (z * t * aspect) * .5 + .5) * w, top + (-y / (z * t) * .5 + .5) * h];
}
const jobs = [];
for (const [file, m] of Object.entries(meta)) {
  const side = /left-hilum/.test(file) ? 'Left' : /right-hilum/.test(file) ? 'Right' : null; if (!side) continue;
  const labels = ['vein', 'artery', 'pelvis'].map(role => ({role, xy: project(m, anchor(side, role)), text: `${NAMES[role][0]}  ${NAMES[role][1]}`, color: COLOR[role]}));
  jobs.push({src: `${out}/${file}`, dst: `${out}/labelled-${file}`, labels, title: `${side === 'Left' ? 'Left 左' : 'Right 右'} · ${tag === 'before' ? '修改前 before' : '修改後 after'}`});
}
const py = `
import json,sys
from PIL import Image,ImageDraw,ImageFont
jobs=json.load(sys.stdin)
for j in jobs:
  im=Image.open(j['src']).convert('RGB');px=im.load();W,H=im.size;s=max(1,W//500)
  def kind(c):
    r,g,b=c
    if b>r+25 and b>g: return 'vein'
    if r>150 and r>g+70 and r>b+60: return 'artery'
    if r>200 and g>180 and b<175 and r-b>45: return 'pelvis'
    return None
  def snap(x,y,role,R=60):
    best=None
    for dy in range(-R,R+1,2):
      for dx in range(-R,R+1,2):
        X,Y=int(x)+dx,int(y)+dy
        if 0<=X<W and 30*s<Y<H and kind(px[X,Y])==role:
          d=dx*dx+dy*dy
          if best is None or d<best[0]: best=(d,X,Y)
    return (best[1],best[2]) if best else (x,y)
  for l in j['labels']: l['xy']=list(snap(l['xy'][0],l['xy'][1],l['role']))
  d=ImageDraw.Draw(im)
  f=ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',14*s);ft=ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',16*s)
  d.rectangle([0,0,W,26*s],fill='white');d.text((8*s,4*s),j['title']+'   (veins blue, arteries red, ureter and renal pelvis pale yellow｜靜脈藍、動脈紅、輸尿管與腎盂淡黃)',fill='black',font=ft)
  for k,l in enumerate(sorted(j['labels'],key=lambda l:l['xy'][1])):
    x,y=l['xy'];tx=W-int(W*0.36);ty=int(H*0.18)+k*int(H*0.2)
    d.line([(x,y),(tx,ty+9*s)],fill=l['color'],width=2*s);d.ellipse([x-5*s,y-5*s,x+5*s,y+5*s],outline='white',fill=l['color'],width=s)
    bb=d.textbbox((tx,ty),l['text'],font=f);d.rectangle([bb[0]-4*s,bb[1]-3*s,bb[2]+4*s,bb[3]+3*s],fill='white',outline=l['color'],width=s);d.text((tx,ty),l['text'],fill=l['color'],font=f)
  im.save(j['dst'])
  print('labelled',j['dst'])
`;
process.stdout.write(execFileSync('python3', ['-c', py], {input: JSON.stringify(jobs)}).toString());
