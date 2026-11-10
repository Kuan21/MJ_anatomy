# Before/after pairs of the fixed-view screenshots: side-by-side images with the share of pixels that changed, and an index of the changed views.
# usage: stability-compare.py beforeDir afterDir outDir      (files <tag>-<view>-<angle>.png; the tag is the prefix before the first dash: before / after)
import sys, os
import numpy as np
from PIL import Image, ImageDraw
b, a, o = sys.argv[1:4]; os.makedirs(o, exist_ok=True)
rows = []
for f in sorted(os.listdir(a)):
    if not f.startswith('after-') or not f.endswith('.png'): continue
    name = f[len('after-'):]; pb = os.path.join(b, 'before-' + name)
    if not os.path.exists(pb): rows.append((name, None)); continue
    A = Image.open(os.path.join(a, f)).convert('RGB'); B = Image.open(pb).convert('RGB')
    if A.size != B.size: B = B.resize(A.size)
    share = (np.abs(np.asarray(A, int) - np.asarray(B, int)).sum(2) > 24).mean() * 100
    rows.append((name, share))
    if share < 0.05: continue    # identical views are not repeated
    W = Image.new('RGB', (A.width * 2 + 30, A.height + 40), 'white'); W.paste(B, (0, 40)); W.paste(A, (A.width + 30, 40))
    t = ImageDraw.Draw(W); t.text((10, 12), 'BEFORE  ' + name[:-4], fill='black'); t.text((A.width + 40, 12), 'AFTER  changed pixels %.1f%%' % share, fill='black')
    W.save(os.path.join(o, name))
with open(os.path.join(o, 'index.txt'), 'w') as fh:
    for n, s in rows: fh.write('%-40s %s\n' % (n, 'no before image' if s is None else 'changed %.2f%%' % s))
print('%d views compared, %d changed' % (len(rows), sum(1 for _, s in rows if s and s >= 0.05)))
