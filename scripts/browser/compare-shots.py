# Side-by-side before/after images with labels and the share of pixels that changed.
# usage: compare-shots.py beforeDir afterDir outDir   (files named <tag>-<side>-<opacity>-<view>.png in both)
import sys, os, numpy as np
from PIL import Image, ImageDraw
b, a, o = sys.argv[1:4]; os.makedirs(o, exist_ok=True)
rows = []
for f in sorted(os.listdir(a)):
    if not f.startswith('after-') or not f.endswith('.png') or f.count('-') < 3: continue
    name = f[len('after-'):]; pb = os.path.join(b, 'before-' + name)
    if not os.path.exists(pb): continue
    A = Image.open(os.path.join(a, f)).convert('RGB'); B = Image.open(pb).convert('RGB')
    d = np.abs(np.asarray(A, int) - np.asarray(B, int)).sum(2) > 24
    share = d.mean() * 100
    W = Image.new('RGB', (A.width * 2 + 30, A.height + 40), 'white'); W.paste(B, (0, 40)); W.paste(A, (A.width + 30, 40))
    t = ImageDraw.Draw(W); t.text((10, 12), 'BEFORE (main)  ' + name[:-4], fill='black'); t.text((A.width + 40, 12), 'AFTER (this PR)  changed pixels %.1f%%' % share, fill='black')
    W.save(os.path.join(o, name)); rows.append((name, share)); print('%-34s changed %.1f%%' % (name, share))
