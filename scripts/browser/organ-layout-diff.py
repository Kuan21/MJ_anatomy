#!/usr/bin/env python3
"""Pixel comparison of two screenshot sets made by organ-layout-shots.cjs.
usage: organ-layout-diff.py <dir> <labelA> <labelB> <size>
Per step: differing pixels outside the 3D canvases (must be 0) and inside them (renderer noise), with the bounding box of the outside difference."""
import json, sys, warnings
warnings.simplefilter("ignore")
from PIL import Image, ImageChops
d, a, b, size = sys.argv[1:5]
rects = {k: v for k, v in json.load(open(f'{d}/{a}-{size}-rects.json')).items()}
rb = json.load(open(f'{d}/{b}-{size}-rects.json'))
bad = 0
for step in sorted(rects):
    A = Image.open(f'{d}/{a}-{size}-{step}.png').convert('RGB'); B = Image.open(f'{d}/{b}-{size}-{step}.png').convert('RGB')
    if A.size != B.size: print(f'{step}: size differs {A.size} {B.size}'); bad += 1; continue
    diff = ImageChops.difference(A, B).convert('L').point(lambda v: 255 if v else 0)
    inside = 0
    both = {tuple(r) for r in rects[step] + rb.get(step, [])}
    for r in both:
        c = diff.crop(r); inside += sum(1 for v in c.getdata() if v)
    # blank the canvases (union of both runs) and count what is left
    for r in both: diff.paste(0, r)
    outside = sum(1 for v in diff.getdata() if v); box = diff.getbbox()
    print(f'{step}: outside-canvas diff px = {outside}{"" if not outside else " bbox=" + str(box)}; inside-canvas diff px = {inside}'); bad += outside > 0
sys.exit(1 if bad else 0)
