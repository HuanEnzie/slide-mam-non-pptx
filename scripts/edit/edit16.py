"""v15 -> v16
 slide 13: bring back the kids gluing seeds, now working on bông lúa / bắp ngô / súp lơ
 slide 14 (Kết thúc hoạt động): new look so it no longer mirrors slide 15 (sunset background, left-aligned title, dancing kids)
"""
import re, shutil, sys
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")
UN = "un"
E = lambda inch: int(round(inch * 914400))
rd = lambda p: open(f"{UN}/{p}", encoding="utf8").read()
wr = lambda p, s: open(f"{UN}/{p}", "w", encoding="utf8").write(s)
SL = lambda n: f"ppt/slides/slide{n}.xml"
RL = lambda n: f"ppt/slides/_rels/slide{n}.xml.rels"

def blk(x, name):
    m = re.search(r'<p:(sp|pic)>(?:(?!</p:\1>).)*?name="%s"[\s\S]*?</p:\1>' % re.escape(name), x)
    if not m: raise KeyError(name)
    return m.group(0)
def set_xfrm(b, x, y, w, h):
    return re.sub(r'<a:off x="-?\d+" y="-?\d+"/><a:ext cx="\d+" cy="\d+"/>', f'<a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/>', b, count=1)
def add_rel(rels, rid, typ, target):
    assert f'Id="{rid}"' not in rels
    return rels.replace("</Relationships>", f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/{typ}" Target="../media/{target}"/></Relationships>')
def fit(path, bx, by, bw, bh, valign="center"):
    iw, ih = Image.open(path).size
    s = min(bw / iw, bh / ih); w, h = iw * s, ih * s
    y = by + (bh - h) if valign == "bottom" else by + (bh - h) / 2
    return bx + (bw - w) / 2, y, w, h
def swap_pic(x, rels, name, src, mname, rid, box, descr, valign="center"):
    old = blk(x, name)
    shutil.copy(src, f"{UN}/ppt/media/{mname}")
    rels = add_rel(rels, rid, "image", mname)
    new = re.sub(r'r:embed="[^"]+"', f'r:embed="{rid}"', old)
    new = re.sub(r'descr="[^"]*"', f'descr="{descr}"', new) if 'descr="' in new else new
    new = set_xfrm(new, *fit(src, *box, valign=valign))
    return x.replace(old, new), rels

# ---------------- slide 13 (Trò chơi 2) = slide13.xml ----------------
x, r = rd(SL(13)), rd(RL(13))
x, r = swap_pic(x, r, "seedArt", "cut/kids_seed.png", "p16_kids_seed.png", "rIdN16a", (0.85, 2.45, 4.7, 4.1),
                "Các bé đang dán hạt làm tranh bông lúa, bắp ngô và súp lơ")
wr(SL(13), x); wr(RL(13), r)

# ---------------- slide 14 (Kết thúc hoạt động) = slide17.xml ----------------
x, r = rd(SL(17)), rd(RL(17))
x, r = swap_pic(x, r, "bg", "../build/st/bg_gold.jpg", "p16_bg_gold.jpg", "rIdN16b", (0, 0, 13.333, 7.5), "Nền cánh đồng lúa hoàng hôn")
# stickers
x, r = swap_pic(x, r, "girl", "cut/dance_duo.png", "p16_duo.png", "rIdN16c", (8.9, 1.55, 4.1, 5.3), "Hai bạn nhỏ hát và nhảy cùng micro", valign="bottom")
x, r = swap_pic(x, r, "boy", "cut/dance_trio.png", "p16_trio.png", "rIdN16d", (0.45, 5.15, 3.7, 2.1), "Ba bạn nhỏ nắm tay nhảy múa", valign="bottom")
x, r = swap_pic(x, r, "buffalo", "../build/st/music.png", "p16_notes.png", "rIdN16e", (4.2, 5.4, 1.5, 1.7), "Nốt nhạc", valign="bottom")
x, r = swap_pic(x, r, "rainbow", "../v10/mic_btn.png", "p16_mic.png", "rIdN16f", (6.9, 0.2, 1.4, 1.5), "Micro vui nhộn")
# keep chick + tractor but re-place them for the new composition
chick = blk(x, "chick"); x = x.replace(chick, set_xfrm(chick, 5.85, 5.6, 1.35, 1.58))
trac = blk(x, "tractor"); x = x.replace(trac, set_xfrm(trac, 7.0, 5.2, 2.34, 1.8))
bird = blk(x, "bird"); x = x.replace(bird, set_xfrm(bird, 2.3, 0.4, 0.68, 0.6))
# title: left aligned, two lines, bigger
t = blk(x, "title")
nt = set_xfrm(t, 0.6, 1.25, 7.7, 2.5).replace('algn="ctr"', 'algn="l"').replace('sz="5400"', 'sz="6600"')
x = x.replace(t, nt)
w = blk(x, "wish")
nw = set_xfrm(w, 0.7, 3.95, 7.3, 1.2).replace('sz="2600"', 'sz="2800"')
x = x.replace(w, nw)
wr(SL(17), x); wr(RL(17), r)
print("title size:", re.findall(r'sz="(\d+)"', nt)[:1], "| wish:", re.findall(r'sz="(\d+)"', nw)[:1])
print("done")
