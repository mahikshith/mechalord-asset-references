"""Contact sheet (contact.jpg) and animated GIF (clip.gif) from captured frame_####.png files."""
import glob
import os
import sys
from PIL import Image

d = sys.argv[1]
fs = sorted(glob.glob(os.path.join(d, 'frame_*.png')))
if not fs:
    sys.exit('no frames in ' + d)
picks = [fs[int(i * (len(fs) - 1) / 9)] for i in range(10)]
ims = [Image.open(f).convert('RGB').resize((640, 360)) for f in picks]
sheet = Image.new('RGB', (1280, 360 * 5))
for k, im in enumerate(ims):
    sheet.paste(im, ((k % 2) * 640, (k // 2) * 360))
sheet.save(os.path.join(d, 'contact.jpg'), quality=85)
frames = [Image.open(f).convert('RGB').resize((640, 360)) for f in fs]
frames[0].save(os.path.join(d, 'clip.gif'), save_all=True, append_images=frames[1:], duration=66, loop=0, optimize=True)
print('frames', len(fs))
