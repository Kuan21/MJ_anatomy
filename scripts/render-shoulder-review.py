"""Render the actual exported source meshes, not a browser/GPU screenshot."""
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
root=Path(__file__).resolve().parent.parent
cases=json.loads((root/'.sites-runtime/shoulder-comparison.json').read_text())
fig=plt.figure(figsize=(16,10))
for row,case in enumerate(cases):
 for col,(field,az,label) in enumerate([('base',145,'Source neutral'),('before',145,'Previous branch motion'),('after',145,'Updated branch motion')]):
  ax=fig.add_subplot(2,3,row*3+col+1,projection='3d')
  for mesh in case['rows']:
   if mesh['system']=='arterial' and 'dorsal scapular' not in mesh['name']: continue
   vertices=np.array(mesh[field]).reshape(-1,3); faces=vertices[np.array(mesh['idx']).reshape(-1,3)]
   color={'skeletal':'#dacba9','muscular':'#b96b60','arterial':'#e72731','venous':'#315db7'}.get(mesh['system'],'#e5c833')
   ax.add_collection3d(Poly3DCollection(faces,facecolors=color,linewidths=0,shade=True))
  ax.set(xlim=(-.01,.49),ylim=(1.1,1.6),zlim=(-.25,.25),title=f'Pose {row+1}: {label}')
  ax.view_init(elev=10,azim=az,vertical_axis='y');ax.set_box_aspect((1,1,1));ax.set_axis_off()
fig.tight_layout();fig.savefig(root/'.sites-runtime/shoulder-contact-review.png',dpi=140)
