"""Register complete source cervical vessels using shared endpoint landmarks."""
import json,gzip,numpy as np
from pathlib import Path
root=Path(__file__).resolve().parents[1];atlas=json.loads((root/'public/models/atlas.json').read_text());rows=json.loads((root/'.sites-runtime/source-neck-vessels.json').read_text());parts={p['name'].lower():p for p in atlas['parts']}
def geom(p):return np.fromfile(root/('public'+atlas['chunks'][p['chunk']]['url']),dtype='<f4',count=p['vertexCount']*3,offset=p['positions']).reshape(-1,3)
def tip(v,top):
 y=v[:,1];a=y.max()-.002 if top else y.min()+.002;return v[y>=a if top else y<=a].mean(0)
landmarks=[]
for r in rows:
 n=r['name'].lower();side='left' if n.endswith('.l') or n.startswith('left') else 'right';kind='internal jugular vein' if 'jugular' in n else 'common carotid artery' if 'common' in n else 'internal carotid artery' if 'internal' in n else None
 if not kind:continue
 p=parts[f'{side} {kind}'];v=np.array(r['vertices']).reshape(-1,3);top=kind=='internal carotid artery';a=tip(v,top);b=tip(geom(p),top);landmarks.append((a,b))
A=np.array([a for a,b in landmarks]);D=np.array([b-a for a,b in landmarks]);out=[]
for r in rows:
 n=r['name'].lower();side='left' if n.endswith('.l') or n.startswith('left') else 'right';kind='internal jugular vein' if 'jugular' in n else 'internal carotid artery' if 'internal' in n else 'common carotid artery';p=parts[f'{side} {kind}'];v=np.array(r['vertices']).reshape(-1,3);dist=((v[:,None,:]-A[None,:,:])**2).sum(2);w=1/np.maximum(dist,1e-12)**2;v+=w@D/w.sum(1)[:,None]
 out.append({'name':r['name'],'parentId':p['id'],'system':'venous' if 'vein' in n else 'arterial','positions':v.round(7).flatten().tolist(),'indices':r['indices']})
data=json.dumps({'source':'Z-Anatomy via nqwrc/3d-anatomy at 8ca3b7421bcfbe88b85859eb1983d5cf79f21749; CC BY-SA 4.0; shared endpoint registration','vessels':out},separators=(',',':')).encode();(root/'public/models/neck-vessels.json.gz').write_bytes(gzip.compress(data,mtime=0));(root/'public/models/neck-vessels.json').write_bytes(data)
print(len(out),'vessels',len(data),'bytes; endpoint displacement max mm',np.linalg.norm(D,axis=1).max()*1000)
