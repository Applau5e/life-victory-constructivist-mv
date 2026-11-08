"""Produce photo halftones and lightweight loop textures for real-time Studio playback."""
import math
from pathlib import Path
import re
import sys
import numpy as np
from PIL import Image, ImageOps

public = Path(__file__).resolve().parents[1] / "public"
dest = public / "print"
dest.mkdir(exist_ok=True)
ink = np.array([20,18,16])
paper = np.array([237,227,204])
for path in (public / "art").glob("*.png"):
    if sys.argv[1:] and path.stem not in sys.argv[1:]:
        continue
    final = dest / (path.stem + ".webp")
    if final.exists() and final.stat().st_mtime >= path.stat().st_mtime:
        continue
    if path.stem.startswith(("T-01-", "T-03-")):
        with Image.open(path) as source:
            im = source.convert("RGB")
            im.thumbnail((1280,720), Image.Resampling.LANCZOS)
            im.save(final, quality=80)
        continue
    if not re.fullmatch(r"(H|C|CR|HD|O)-\d\d",path.stem) or path.stem=="H-00":
        continue
    with Image.open(path) as source:
        im=source.convert("RGBA")
    im.thumbnail((1920,1800),Image.Resampling.LANCZOS)
    w,h=im.size
    luminance=np.asarray(ImageOps.grayscale(im),dtype=np.float32)/255
    y,x=np.ogrid[:h,:w]
    step=8.5 if path.stem=="H-10" else 6.5
    # A 45-degree dot lattice. The smooth sinusoidal rank fills dark areas between dots.
    u=(x+y)*(math.sqrt(.5)*2*math.pi/step)
    v=(x-y)*(math.sqrt(.5)*2*math.pi/step)
    screen=(np.cos(u)+np.cos(v))*.25+.5
    threshold=np.clip((screen-(1-luminance))*6+.5,0,1)
    tone=.82*threshold+.18*luminance
    rgb=(ink+(paper-ink)*tone[:,:,None]).astype("uint8")
    printed=Image.fromarray(rgb)
    printed.putalpha(im.getchannel("A"))
    printed.save(final,quality=90,alpha_quality=100,method=3)
