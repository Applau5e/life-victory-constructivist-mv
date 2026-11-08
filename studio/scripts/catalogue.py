"""Build the Studio review index from the current version's prompt list and PNGs."""
from pathlib import Path
import json
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public/art"
PROMPTS = (ROOT.parent / "02_生图与抠图提示词.md").read_text(encoding="utf-8")
HEAD = re.compile(r"^### ((?:K|H|C|CR|HD|O|T)-\d\d[a-c]?) (.+)$", re.M)
GROUPS = {"K": "风格与版式", "H": "主角", "C": "合唱团", "CR": "人群",
          "HD": "手部", "O": "道具", "T": "印刷纹理"}
MASKS = {"H-16-legs": "腿部遮罩", "O-02-ring": "座圈遮罩",
         "O-02-water": "水面遮罩", "O-13-lens": "镜头玻璃遮罩"}
files = []
def add(key, title, group, usage):
    path = ART / (key + ".png")
    if not path.is_file():
        return
    with Image.open(path) as im:
        alpha = "A" in im.getbands() and im.getchannel("A").getextrema()[0] < 240
        files.append(dict(id=key, title=title, group=group, usage=usage,
                          width=im.width, height=im.height, alpha=alpha))

entries = list(HEAD.finditer(PROMPTS))
for n, entry in enumerate(entries):
    key, title = entry.groups()
    body = PROMPTS[entry.end():entries[n+1].start() if n+1 < len(entries) else None]
    usage = re.search(r"^- 用途：(.+)$", body, re.M)
    group = GROUPS[key.split("-")[0]]
    title = re.sub(r"（生成[^）]*）", "", title).strip()
    for path in (sorted(ART.glob(key + "-[1-9].png")) if key.startswith("T-") else [ART/(key+".png")]):
        add(path.stem, title, group, usage.group(1) if usage else "")
for key, title in MASKS.items():
    add(key, title, "分层遮罩", "")
src = ROOT / "src"
src.mkdir(exist_ok=True)
(src / "art.json").write_text(json.dumps(files, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"{len(files)} items in the review.")
