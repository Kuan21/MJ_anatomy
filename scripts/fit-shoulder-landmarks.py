import json,numpy as np
x=json.load(open('public/models/atlas.json'));out={}; patches=[]
def geo(p):
 f='public/models/'+x['chunks'][p['chunk']]['url'].split('/')[-1]
 return np.fromfile(f,dtype='<f4',count=p['vertexCount']*3,offset=p['positions']).reshape(-1,3).astype(float),np.fromfile(f,dtype='<u4',count=p['indexCount'],offset=p['indices']).reshape(-1,3)
for side in ['right','left']:
 h=next(p for p in x['parts'] if p['name'].lower()==side+' humerus');s=next(p for p in x['parts'] if p['name'].lower()==side+' scapula')
 v,i=geo(h); a=v[(v[:,1]>1.38)&(np.abs(v[:,0])<.177)];c=np.linalg.lstsq(np.c_[2*a,np.ones(len(a))],(a*a).sum(1),rcond=None)[0];r=float(np.sqrt(c[3]+(c[:3]**2).sum()));c=c[:3]
 sv,si=geo(s);ds=np.linalg.norm(sv-c,axis=1);near=sv[np.argmin(ds)];axis=(near-c)/np.linalg.norm(near-c)
 out[side]={'humerusId':h['id'],'scapulaId':s['id'],'headCenter':c.tolist(),'headRadius':r,'fitRms':float(np.sqrt(np.mean((np.linalg.norm(a-c,axis=1)-r)**2))),'fitVertices':len(a),'glenoidFacingPoint':near.tolist()}
 for p,v,i in [(h,v,i),(s,sv,si)]:
  tri=v[i];mid=tri.mean(1);d=mid-c;dist=np.linalg.norm(d,axis=1);unit=d/np.maximum(dist[:,None],1e-9)
  if p==h:mask=(mid[:,1]>1.375)&(np.abs(dist-r)<.003)&(unit@axis>.25)
  else:
   n=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);n/=np.maximum(np.linalg.norm(n,axis=1)[:,None],1e-9)
   mask=(dist<r+.007)&(dist>r)&(unit@axis>.65)&(np.abs(mid[:,1]-c[1])<.018)&((n*(-unit)).sum(1)>.25)
  ids=i[mask];verts=v[ids].reshape(-1,3);rad=verts-c;rad/=np.linalg.norm(rad,axis=1)[:,None];verts+=rad*(.0007 if p==h else -.0007)
  patches.append({'parentId':p['id'],'side':side,'surface':'humeral' if p==h else 'glenoid','positions':np.round(verts,7).flatten().tolist()});print(side,p['name'],len(ids),'triangles')
json.dump({'method':'Least-squares sphere on proximal medial humeral surface (y > 1.38 m, abs(x) < 0.177 m), BodyParts3D atlas rest frame. Approximate landmarks; not measured cartilage or clinical validation.','sides':out},open('app/biomechanics-v2/shoulder-landmarks.json','w'),indent=2)
json.dump({'description':'Estimated shoulder cartilage surface overlays offset 0.7 mm from selected source bone triangles. Illustrative only; no measured cartilage, labrum or capsule.','patches':patches},open('app/biomechanics-v2/shoulder-cartilage.json','w'),separators=(',',':'))
