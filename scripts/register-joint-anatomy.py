"""Transfer Z-Anatomy cartilage labels to the atlas bone surfaces.
Input: decoded, world-space source-bones.json from decode-joint-source.mjs.
Source labels define coverage; target geometry defines placement. Offsets are
visual separation, not measured cartilage thickness or a collision model.
"""
import json,re,numpy as np
from pathlib import Path
from scipy.spatial import cKDTree
from scipy.spatial.transform import Rotation
root=Path(__file__).resolve().parents[1]
src=json.loads((root/'.sites-runtime/source-bones.json').read_text());atlas=json.loads((root/'public/models/atlas.json').read_text())
ordinals=['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth']
def target_name(n):
 side='left' if n.endswith('.l') else 'right' if n.endswith('.r') else ''
 base=n[:-2].lower() if side else n.lower()
 m=re.match(r'(.*phalanx) of (\w+) finger of (hand|foot)',base)
 if m:
  digit=({'first':'thumb','second':'index finger','third':'middle finger','fourth':'ring finger','fifth':'little finger'} if m[3]=='hand' else {'first':'big toe','second':'second toe','third':'third toe','fourth':'fourth toe','fifth':'little toe'})[m[2]]
  return f'{m[1]} of {side} {digit}'
 m=re.match(r'vertebra ([ctl])(\d+)',base)
 if m:return f'{ordinals[int(m[2])-1]} '+{'c':'cervical','t':'thoracic','l':'lumbar'}[m[1]]+' vertebra'
 if base=='navicular bone':return f'navicular bone of {side} foot'
 if base=='triquetrum bone':return f'{side} triquetral'
 base={'atlas (c1)':'atlas','axis (c2)':'axis'}.get(base,base)
 return (side+' '+base).strip()
parts={p['name'].lower():p for p in atlas['parts'] if p['system']=='skeletal'}
groups={}
for r in src:groups.setdefault(r['name'],[]).append(r)
registrations={};patches=[];skipped=[]
for name,rs in groups.items():
 if not any(r.get('material')=='Cartilage' for r in rs) or not any(r.get('material','').startswith('Bone') for r in rs):continue
 n=target_name(name);p=parts.get(n) or parts.get(n.replace(' bone','')) or parts.get(n.replace('navicular bone','navicular bone of foot').replace('triquetrum bone','triquetral bone'))
 if not p:skipped.append(name);continue
 f=root/('public'+atlas['chunks'][p['chunk']]['url']);v=np.fromfile(f,dtype='<f4',count=p['vertexCount']*3,offset=p['positions']).reshape(-1,3);ind=np.fromfile(f,dtype='<u4',count=p['indexCount'],offset=p['indices']).reshape(-1,3)
 # Match the complete corresponding bone, never fit a cartilage patch to an
 # unrelated nearby surface. Positive similarity transforms preserve topology.
 sv=np.concatenate([np.array(r['vertices']).reshape(-1,3) for r in rs]);scale=np.linalg.norm(np.ptp(v,axis=0))/np.linalg.norm(np.ptp(sv,axis=0));R=np.eye(3);t=(v.min(0)+v.max(0))/2-(sv.min(0)+sv.max(0))/2*scale;tree=cKDTree(v)
 for _ in range(45):
  moved=sv@(R*scale).T+t;d,idx=tree.query(moved);keep=d<np.quantile(d,.9)+1e-8;x=sv[keep];y=v[idx[keep]];xm=x.mean(0);ym=y.mean(0);a=x-xm;b=y-ym;u,s,vt=np.linalg.svd(a.T@b);rot=vt.T@u.T
  if np.linalg.det(rot)<0:vt[-1]*=-1;rot=vt.T@u.T
  sc=scale;tr=ym-sc*rot@xm
  if np.linalg.norm(tr-t)<1e-8 and np.linalg.norm(rot-R)<1e-7:break
  scale,R,t=sc,rot,tr
 moved=sv@(R*scale).T+t;err=tree.query(moved)[0];rms=float(np.sqrt(np.mean(err**2)))
 if rms>.012 or not .7<scale<1.3:skipped.append(name);continue
 M=np.eye(4);M[:3,:3]=R*scale;M[:3,3]=t
 registrations[name]={'parentId':p['id'],'matrix':M.T.flatten().round(9).tolist(),'rms':round(rms,6),'sourceBounds':[sv.min(0).round(6).tolist(),sv.max(0).round(6).tolist()]}
 # Sample triangle interiors for source material classification, so sparse
 # bone vertices cannot arbitrarily expand cartilage across an entire shaft.
 samples=[];labels=[]
 for r in rs:
  rv=np.array(r['vertices']).reshape(-1,3)@(R*scale).T+t;ri=np.array(r['indices']).reshape(-1,3);tri=rv[ri];points=np.concatenate([rv,tri.mean(1),(tri[:,0]+tri[:,1])/2,(tri[:,1]+tri[:,2])/2,(tri[:,2]+tri[:,0])/2]);samples.append(points);labels.extend([r.get('material')=='Cartilage']*len(points))
 targetTri=v[ind];centroids=targetTri.mean(1);_,ix=cKDTree(np.concatenate(samples)).query(centroids);selected=np.array(labels)[ix];tri=targetTri[selected]
 if not len(tri):continue
 normal=np.cross(targetTri[:,1]-targetTri[:,0],targetTri[:,2]-targetTri[:,0]);vn=np.zeros_like(v)
 for k in range(3):np.add.at(vn,ind[:,k],normal)
 vn/=np.maximum(1e-12,np.linalg.norm(vn,axis=1))[:,None]
 used,ix=np.unique(ind[selected],return_inverse=True);positions=v[used]+vn[used]*.00035
 patches.append({'name':name,'parentId':p['id'],'positions':positions.round(6).flatten().tolist(),'indices':ix.tolist()})
print('registered',len(registrations),'patches',len(patches),'skipped',skipped)
(root/'app/biomechanics-v2/joint-registration.json').write_text(json.dumps(registrations,separators=(',',':'))+'\n')
(root/'public/models/articular-surfaces.json').write_text(json.dumps({'source':'Z-Anatomy Cartilage material transferred to BodyParts3D bone surfaces; not segmented thickness','patches':patches},separators=(',',':'))+'\n')
print('max bone fit rms',max(r['rms'] for r in registrations.values()))

import gzip
with open(root/'public/models/articular-surfaces.json.gz','wb') as f:f.write(gzip.compress((root/'public/models/articular-surfaces.json').read_bytes(),mtime=0))
