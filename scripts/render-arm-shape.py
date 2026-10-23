"""Offline source-mesh comparison, not a browser screenshot."""
import json, sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import PolyCollection
from matplotlib.colors import to_rgb
root=Path(__file__).resolve().parent.parent/'.sites-runtime'
label=sys.argv[1] if len(sys.argv)>1 else 'candidate'
data=json.loads((root/f'arm-shape-{label}.json').read_text())
fig=plt.figure(figsize=(15,15),facecolor='#edf0f1')
colors={'biceps':'#c66c5c','triceps':'#c49b75','arm':'#bb7969','forearm':'#c87669','cuff':'#af7879','deltoid':'#d49690','coraco':'#ac7760','bone':'#f0e6ce'}
for row,(case,content) in enumerate(data.items()):
 for col,group in enumerate(['all','upper','forearm']):
  ax=fig.add_subplot(4,3,row*3+col+1,facecolor='#edf0f1')
  points=[];faces=[];rgba=[]
  for mesh in content['rows']:
   if group=='upper' and mesh['profile'] not in ['biceps','triceps','arm','bone']:continue
   if group=='upper' and any(n in mesh['name'] for n in ['ulna','radius','scapula']):continue
   if group=='forearm' and mesh['profile'] not in ['forearm','bone']:continue
   if group=='forearm' and any(n in mesh['name'] for n in ['humerus','scapula']):continue
   v=np.array(mesh['vertices']).reshape(-1,3);points.append(v)
   f=v[np.array(mesh['indices']).reshape(-1,3)]
   normals=np.cross(f[:,1]-f[:,0],f[:,2]-f[:,0]);normals/=np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-12)
   shade=.45+.55*np.abs(normals@np.array([.3,.4,-.866]))
   rgba.append(np.clip(np.array(to_rgb(colors[mesh['profile']]))[None,:]*shade[:,None],0,1));faces.append(f)
  faces=np.concatenate(faces);rgba=np.concatenate(rgba);order=np.argsort(-faces[:,:,2].mean(axis=1))
  ax.add_collection(PolyCollection(faces[order,:,:2],facecolors=rgba[order],edgecolors='none'))
  p=np.concatenate(points);lo=p.min(axis=0);hi=p.max(axis=0);pad=max(hi-lo)*.05
  ax.set(xlim=(lo[0]-pad,hi[0]+pad),ylim=(lo[1]-pad,hi[1]+pad));ax.set_aspect('equal');ax.set_axis_off();ax.set_title(f'{case} / {group}')
fig.suptitle(f'Actual atlas geometry — {label}',fontsize=18)
fig.tight_layout();fig.savefig(root/f'arm-shape-{label}.png',dpi=130)
