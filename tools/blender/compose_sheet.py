"""Composite enemy option tiles (written by enemy_options.py) into labelled sheets."""
import glob, json, os, sys
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]
for spec in glob.glob(os.path.join(d, '_sheet_*.json')):
    s = json.load(open(spec))
    ims = [(Image.open(p), lab) for p, lab in s['tiles']]
    w, h = ims[0][0].size
    cols = s['cols']; rows = (len(ims) + cols - 1) // cols
    bar = int(h * 0.09)
    out = Image.new('RGB', (cols * w, rows * (h + bar)), (14, 14, 17))
    dr = ImageDraw.Draw(out)
    try:
        font = ImageFont.truetype('arialbd.ttf', int(bar * 0.5))
    except Exception:
        font = ImageFont.load_default()
    for i, (im, lab) in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * (h + bar)
        out.paste(im.convert('RGB'), (x, y))
        dr.text((x + 14, y + h + bar * 0.2), lab, fill=(235, 225, 210), font=font)
    out.save(s['out'])
    print('sheet', s['out'])
