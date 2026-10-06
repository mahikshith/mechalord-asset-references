"""Package unmodified normal-game screenshots as a timed motion receipt."""
from pathlib import Path
import json
from PIL import Image

folder = Path(__file__).resolve().parents[2] / "delivery" / "gameplay-truth-proof"
frames = json.loads((folder / "motion-frames.json").read_text())
images = [Image.open(frame["path"]).convert("RGB") for frame in frames]
durations = [max(20, round((b["time"] - a["time"]) / 10) * 10)
             for a, b in zip(frames, frames[1:])]
durations.append(durations[-1])
images[0].save(folder / "normal-live-walking.gif", save_all=True,
               append_images=images[1:], duration=durations, loop=0, optimize=False)
for old, new in (("normal-boss-core.jpg", "normal-act2-after-transfer.jpg"),
                 ("normal-reward-choice.jpg", "normal-act3-live.jpg")):
    source = folder / old
    target = folder / new
    if source.exists() and not target.exists():
        source.rename(target)
print(f"Recorded {len(images)} normal-game frames over {sum(durations)}ms; no replay controller.")
