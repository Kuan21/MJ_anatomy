// Whole-body audit of vessels, nerves, schematic tendons and ligaments against the skeleton, on the meshes the viewer draws:
// name-vs-position bands (a 'tibial' vessel must lie in the leg ...), left/right against the name, fragmentation (separate pieces with a gap),
// bone penetration (vertices behind the nearest bone surface) and floating ligaments. Reports only; changes nothing.
//   node scripts/audit-body-structures.mjs [out.json]      writes work/body-structure-audit.json by default and prints a summary
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const OUT=process.argv[2]||root+'work/body-structure-audit.json';
fs.mkdirSync(root+'work',{recursive:true});
const {atlas,geometry}=loadFullAtlas();
const rawAtlas=JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8'));
const rawById=new Map(rawAtlas.parts.map(p=>[p.id,p]));
const bufCache=new Map();const buf=u=>{if(!bufCache.has(u))bufCache.set(u,fs.readFileSync(root+'public'+u));return bufCache.get(u);};
// ---- bones with normals (atlas raw buffers: float32 positions, int16 normals)
const BONE_SKIP=/gingiva|tooth|teeth|molar|incisor|canine|premolar|cartilage|disc|meniscus|labrum|fibularis|tibialis|iliotibial|subscapularis|levator/i;
const bones=[];
for(const p of rawAtlas.parts){if(p.system!=='skeletal'||BONE_SKIP.test(p.name))continue;const b=buf(rawAtlas.chunks[p.chunk].url);
 const P=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),N=new Int16Array(b.buffer,b.byteOffset+p.normals,p.vertexCount*3);bones.push({name:p.name,id:p.id,P,N,bounds:p.bounds});}
const CELL=0.006;const key=(x,y,z)=>((Math.floor(x/CELL)+4096)*8192+(Math.floor(y/CELL)+4096))*8192+(Math.floor(z/CELL)+4096);
const H=new Map();let nb=0;
bones.forEach((b,bi)=>{for(let i=0;i<b.P.length;i+=3){const k=key(b.P[i],b.P[i+1],b.P[i+2]);let a=H.get(k);if(!a)H.set(k,a=[]);a.push(bi,i);nb++;}});
console.error('bones',bones.length,'vertices',nb);
const nearestBone=(x,y,z)=>{let best=null,bd=0.006*0.006;const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL),cz=Math.floor(z/CELL);
 for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const a=H.get(((cx+dx+4096)*8192+(cy+dy+4096))*8192+(cz+dz+4096));if(!a)continue;
  for(let j=0;j<a.length;j+=2){const b=bones[a[j]],i=a[j+1];const ex=x-b.P[i],ey=y-b.P[i+1],ez=z-b.P[i+2];const d=ex*ex+ey*ey+ez*ez;if(d<bd){bd=d;best={b,i,ex,ey,ez,d:Math.sqrt(d)};}}}
 if(!best)return null;const b=best.b,i=best.i;const nx=b.N[i]/32767,ny=b.N[i+1]/32767,nz=b.N[i+2]/32767;const nl=Math.hypot(nx,ny,nz)||1;
 return {bone:b.name,d:best.d,signed:(best.ex*nx+best.ey*ny+best.ez*nz)/nl};};
// ---- nerve stream
const ns=JSON.parse(fs.readFileSync(root+'public/models/nerve-stream.json','utf8'));const gz=new Map();
const nerveParts=[];for(const c of ns.chunks)for(const m of c.meshes){nerveParts.push({id:m.name,name:m.name.replace(/\.(l|r)\.001$/,'.$1').replace(/\.001$/,''),system:'nervous',stream:'nerve-stream',load:()=>{if(!gz.has(c.url))gz.set(c.url,zlib.gunzipSync(fs.readFileSync(root+'public'+c.url)));const b=gz.get(c.url);return {positions:new Float32Array(b.buffer.slice(b.byteOffset+m.positions,b.byteOffset+m.positions+m.vertexCount*12)),indices:new Uint32Array(b.buffer.slice(b.byteOffset+m.indices,b.byteOffset+m.indices+m.indexCount*4))};}});}
// ---- queries
const LIG=/ligament|retinaculum|aponeurosis|sheath|compartment of wrist|raphe|tendinous arch|pes anserinus|membrane|hiatus$/i;
const SPACE=/fossa|triangle|tunnel|space|snuffbox|hiatus/i;
const items=[];
for(const p of atlas.parts){
 if(['arterial','venous'].includes(p.system))items.push({p,kind:p.stream==='vessel-ends'?'vessel-end':(p.stream==='paokao'?'vessel-schematic':'vessel'),load:()=>geometry(p)});
 else if(p.system==='nervous'&&(p.stream==='paokao'||!/brain|cerebr|cortex|gyrus|lobe|nucleus|thalam|pallid|putamen|caudate|colliculus|peduncle|pons|medulla|hippocamp|amygdal|fornix|corpus|capsule|tract|ventricle|commissure|striatum|insula|operculum|claustrum|septum|olive|pyramid|tegment|tectum|vermis|hemisphere|folium|lingula|tonsil|flocculus|pineal|pituitary|infundibul|mammillary|chiasm|geniculate|lemniscus|fasciculus|radiation|stria|habenul|subthalam|accumbens|cuneus|precuneus|uncus|fissure|sulcus|cingul|spinal cord|segment|horn of spinal|cauda|conus|filum|cistern/i.test(p.name)))items.push({p,kind:p.stream==='paokao'?'nerve-schematic':'nerve',load:()=>geometry(p)});
 else if(p.system==='tendon')items.push({p,kind:'tendon-schematic',load:()=>geometry(p)});
 else if(p.system==='connective'&&LIG.test(p.name)&&!SPACE.test(p.name))items.push({p,kind:p.stream==='paokao'?'ligament-schematic':'ligament',load:()=>geometry(p)});
}
for(const n of nerveParts)items.push({p:{id:n.id,name:n.name,system:'nervous',stream:'nerve-stream'},kind:'nerve',load:n.load});
console.error('items',items.length);
// ---- helpers
const comps=(P,I)=>{const n=P.length/3;const q=new Map();const map=new Int32Array(n);for(let i=0;i<n;i++){const k=Math.round(P[i*3]*20000)+','+Math.round(P[i*3+1]*20000)+','+Math.round(P[i*3+2]*20000);let r=q.get(k);if(r===undefined){r=i;q.set(k,r);}map[i]=r;}
 const par=new Int32Array(n).map((_,i)=>i);const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};const u=(a,b)=>{a=f(a);b=f(b);if(a!==b)par[a]=b;};
 for(let t=0;t<I.length;t+=3){u(map[I[t]],map[I[t+1]]);u(map[I[t+1]],map[I[t+2]]);}
 const groups=new Map();for(let i=0;i<n;i++){const r=f(map[i]);let g=groups.get(r);if(!g)groups.set(r,g={n:0,lo:[9,9,9],hi:[-9,-9,-9]});g.n++;for(let k=0;k<3;k++){const v=P[i*3+k];if(v<g.lo[k])g.lo[k]=v;if(v>g.hi[k])g.hi[k]=v;}}
 return [...groups.values()].sort((a,b)=>b.n-a.n);};
const boxGap=(a,b)=>{let s=0;for(let k=0;k<3;k++){const d=Math.max(0,a.lo[k]-b.hi[k],b.lo[k]-a.hi[k]);s+=d*d;}return Math.sqrt(s);};
const volArea=(P,I)=>{let A=0,V=0;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx;A+=Math.hypot(cx,cy,cz)/2;V+=(P[a]*cx+P[a+1]*cy+P[a+2]*cz)/6;}return {A,V:Math.abs(V)};};
// ---- name bands (metres). [yLo,yHi, limb] limb: 'upper' |x|>=0.13, 'lower' |x|<=0.19, null any
const BANDS=[
 [/cerebr|cerebell|ophthalmic|meningeal|maxillary|mandibular|temporal|olfactory|optic|oculomotor|trochlear|trigeminal|abducens|facial nerve|vestibulocochlear|cochlear|vestibular|infraorbital|supraorbital|alveolar|buccal|mental nerve|lacrimal|nasal|palatine|basilar|communicating artery|choroidal|lenticulostriate|labyrinthine|transverse sinus|cavernous|petrosal|ethmoidal|angular|supratrochlear|zygomatic|tympanic|chorda|lingual nerve|mylohyoid|intermediate nerve|callosomarginal|pericallosal|thalamo|pontine|striate|frontobasal|frontal artery|parietal artery|sulcus|gyrus|occipital artery|sigmoid sinus/i,'head',[1.45,1.80],null],
 [/carotid|jugular|vertebral artery|vertebral vein|thyroid|lingual|facial (artery|vein)|vagus|cervical|accessory nerve|hypoglossal|glossopharyngeal|laryngeal|pharyngeal|occipital|auricular|supraclavicular/i,'neck',[1.30,1.72],null],
 [/plantaris/i,'leg/knee',[0.02,0.58],'lower'],
 [/plantar|dorsalis pedis|metatarsal|tarsal|calcane|hallucis|pedis|arcuate artery of (right|left )?foot|digital.*(foot|toe)|toe|cutaneous nerve of foot|distal perforating/i,'foot',[0.0,0.14],'lower'],
 [/tibial|fibular|peroneal|sural|crural|interosseous.*leg|genicular|popliteal|gastrocnemius|soleus/i,'leg/knee',[0.02,0.58],'lower'],
 [/femoral|profunda femoris|circumflex femoral|\bperforating arter|\bperforating vein|obturator|sciatic|gluteal|pudendal|piriformis|quadratus femoris|saphenous|adductor|descending genicular/i,'thigh/hip',[0.30,1.08],'lower'],
 [/palmar|metacarpal|pollicis|princeps|digital.*(hand|finger)|finger|carpal|radialis indicis|thenar|hypothenar|lumbrical/i,'hand',[0.68,0.95],'upper'],
 [/root of median|cords? of brachial|trunk of brachial|division of (superior|middle|inferior) trunk|axillary|subscapular|circumflex humeral|thoracoacromial|thoraco-acromial|suprascapular|circumflex scapular|thoracodorsal|lateral thoracic|long thoracic|dorsal scapular|pectoral nerve/i,'shoulder',[1.10,1.50],null],
 [/radial|ulnar|interosseous.*forearm|antebrachial|median nerve|brachioradialis/i,'forearm',[0.76,1.20],'upper'],
 [/brachial|brachii|musculocutaneous|collateral/i,'arm',[0.95,1.46],'upper'],
 [/intercostal|internal thoracic|pulmonary|coronary|cardiac|azygos|hemiazygos|thoracic aorta|subclavian|brachiocephalic|bronchial|oesophageal|esophageal|mediastinal|pericardi|superior vena cava|\bmarginal|interventricular|ventricular|atrial|conus|septal|superior phrenic|musculophrenic|phrenic nerve|mammary/i,'thorax',[1.05,1.50],null],
 [/hepatic|splenic|renal|mesenteric|gastric|gastro|colic|celiac|coeliac|ileal|jejunal|pancrea|portal|suprarenal|gonadal|testicular|ovarian|lumbar|cystic|duodenal|epiploic|omental|sigmoid artery|sigmoid vein|appendicular|ileocolic|inferior vena cava|abdominal aorta|iliolumbar|inferior phrenic/i,'abdomen',[0.80,1.40],null],
 [/iliac|vesical|uterine|rectal|sacral|vaginal|prostatic|dorsal (artery|vein|nerve) of penis|clitoris|cremasteric|epigastric|circumflex iliac|genitofemoral|ilioinguinal|ilio-inguinal|iliohypogastric|lateral femoral cutaneous/i,'pelvis',[0.70,1.15],null],
];
const bandOf=name=>{for(const [re,label,y,limb] of BANDS)if(re.test(name))return {label,y,limb};return null;};
// ---- run
const rows=[];let done=0;const t0=Date.now();
for(const it of items){
 const g=it.load();const P=g.positions,I=g.indices;const n=P.length/3;if(!n)continue;
 const lo=[9,9,9],hi=[-9,-9,-9];for(let i=0;i<n;i++)for(let k=0;k<3;k++){const v=P[i*3+k];if(v<lo[k])lo[k]=v;if(v>hi[k])hi[k]=v;}
 const c=[0,1,2].map(k=>(lo[k]+hi[k])/2);
 const r={id:it.p.id,name:it.p.name,kind:it.kind,system:it.p.system,stream:it.p.stream||'atlas',n,lo:lo.map(v=>Math.round(v*1000)),hi:hi.map(v=>Math.round(v*1000)),flags:[]};
 // side
 const sideName=/\b(right|left)\b|\.(r|l)$|\b(right|left)$/i.exec(it.p.name);const side=sideName?(sideName[0].toLowerCase().includes('r')?'right':'left'):null;
 const SIDE_SKIP=/ventricle|atrium|coronary|cardiac|\bmarginal|conus|interventricular|septal|hepatic|portal|lobe|colliculus|cerebr|brachium|pulmonary|lumbar vein|gastro/i;
 if(!SIDE_SKIP.test(it.p.name)&&side==='right'&&c[0]>0.012)r.flags.push('side: named right, centre x=+'+Math.round(c[0]*1000)+' mm');
 if(!SIDE_SKIP.test(it.p.name)&&side==='left'&&c[0]<-0.012)r.flags.push('side: named left, centre x='+Math.round(c[0]*1000)+' mm');
 // band
 const band=bandOf(it.p.name);
 if(band){r.band=band.label;const [yl,yh]=band.y;const tol=0.04;
  const outside=Math.max(0,yl-tol-lo[1])+Math.max(0,hi[1]-yh-tol);const ext=hi[1]-lo[1]||0.001;
  if(c[1]<yl-tol||c[1]>yh+tol)r.flags.push(`band: centre y=${Math.round(c[1]*1000)} outside ${band.label} (${Math.round(yl*1000)}–${Math.round(yh*1000)})`);
  else if(outside/ext>0.4&&outside>0.05)r.flags.push(`band: ${Math.round(outside*1000)} mm of ${Math.round(ext*1000)} mm extent outside ${band.label}`);
  const ax=Math.abs(c[0]);if(band.limb==='upper'&&ax<0.12&&!/trunk|cord|division|plexus/i.test(it.p.name))r.flags.push(`limb: ${band.label} name but |x|=${Math.round(ax*1000)} mm (trunk/lower-limb range)`);
  if(band.limb==='lower'&&ax>0.20&&!/cutaneous/i.test(it.p.name))r.flags.push(`limb: ${band.label} name but |x|=${Math.round(ax*1000)} mm (upper-limb range)`);
 }
 // components
 if(it.kind!=='vessel-end'){const cs=comps(P,I);r.components=cs.length;
  if(cs.length>1){const big=cs.filter(x=>x.n>=30);const tiny=cs.length-big.length;let maxGap=0;for(let i=1;i<big.length;i++){let g=9;for(let j=0;j<i;j++)g=Math.min(g,boxGap(big[i],big[j]));maxGap=Math.max(maxGap,g);}
   r.maxGap=Math.round(maxGap*1000);r.tinyComponents=tiny;
   if(maxGap>0.012)r.flags.push(`broken: ${big.length} separate pieces, largest gap ${Math.round(maxGap*1000)} mm`);
   if(tiny>0&&cs[0].n>200)r.flags.push(`fragments: ${tiny} orphan piece(s) under 30 vertices`);}}
 // bone penetration + floating
 {const stride=Math.max(1,Math.floor(n/1500));let inside=0,tested=0,deepest=0,near=0;const by=new Map();let minD=1;
  for(let i=0;i<n;i+=stride){tested++;const nbn=nearestBone(P[i*3],P[i*3+1],P[i*3+2]);if(!nbn)continue;near++;if(nbn.d<minD)minD=nbn.d;if(nbn.signed<-0.0015){inside++;if(-nbn.signed>deepest)deepest=-nbn.signed;by.set(nbn.bone,(by.get(nbn.bone)||0)+1);}}
  r.insidePct=Math.round(inside/tested*1000)/10;r.deepest=Math.round(deepest*10000)/10;r.nearBonePct=Math.round(near/tested*100);
  if(by.size)r.insideBones=[...by.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>k+' '+Math.round(v/tested*100)+'%');
  if(r.insidePct>=5||deepest>0.004)r.flags.push(`in bone: ${r.insidePct}% of vertices (deepest ${r.deepest} mm; ${(r.insideBones||[]).join(', ')})`);
  if(/tendon|ligament/.test(it.kind)&&near===0)r.flags.push('floating: no vertex within 6 mm of any bone');
 }
 // vessel end spikes: extent vs parent radius
 if(it.kind==='vessel-end'){const parent=atlas.parts.find(q=>q.id===it.p.id.slice(0,-4));if(parent){const pg=geometry(parent);const {A,V}=volArea(pg.positions,pg.indices);const rad=A?2*V/A:0;const ext=Math.hypot(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]);r.parentRadius=Math.round(rad*10000)/10;r.extent=Math.round(ext*1000);if(ext>0.15)r.flags.push(`end piece: extent ${Math.round(ext*1000)} mm vs parent radius ${r.parentRadius} mm`);}}
 rows.push(r);if(++done%200===0)console.error(done,'/',items.length,Math.round((Date.now()-t0)/1000)+'s');
}
fs.writeFileSync(OUT,JSON.stringify({generated:new Date().toISOString(),bones:bones.length,rows},null,0));
const flagged=rows.filter(r=>r.flags.length);
console.error('rows',rows.length,'flagged',flagged.length);
const byKind={};for(const r of rows){const k=byKind[r.kind]??={total:0,flagged:0};k.total++;if(r.flags.length)k.flagged++;}
console.log(JSON.stringify(byKind));
