"""v22 -> v23
 slide 5 : card 3 'Làm ở nông trường' -> 'Làm ở cánh đồng' (new picture, tractor sfx -> bird chirp)
 slide 8 : bgm louder (+4.7 dB, set in the media file, vol 100%)
 slide 10: ổi -> táo; remove 'Gia đình gà' and 'Bò sữa' (and their animations); re-centre trứng + sữa
"""
import re, shutil, sys
from lxml import etree
sys.stdout.reconfigure(encoding="utf-8")
UN = "un"
rd = lambda p: open(f"{UN}/{p}", encoding="utf8").read()
wr = lambda p, s: open(f"{UN}/{p}", "w", encoding="utf8").write(s)
NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main"}

def set_xfrm(b, x, y, w, h):
    return re.sub(r'<a:off x="-?\d+" y="-?\d+"/><a:ext cx="\d+" cy="\d+"/>', f'<a:off x="{int(x)}" y="{int(y)}"/><a:ext cx="{int(w)}" cy="{int(h)}"/>', b, count=1)
def blk(x, name):
    m = re.search(r'<p:(sp|pic)><p:nv(?:Sp|Pic)Pr><p:cNvPr id="\d+" name="%s"[\s\S]*?</p:\1>' % re.escape(name), x)
    if not m: raise KeyError(name)
    return m.group(0)
def xfrm(b):
    return tuple(map(int, re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/><a:ext cx="(\d+)" cy="(\d+)"', b).groups()))
def fit(img, bx, by, bw, bh):
    from PIL import Image
    iw, ih = Image.open(img).size
    s = min(bw / iw, bh / ih); w, h = iw * s, ih * s
    return bx + (bw - w) / 2, by + (bh - h) / 2, w, h
def retarget(rels, rid, target):
    n = re.subn(r'(<Relationship Id="%s"[^>]*Target=")[^"]*(")' % rid, r'\g<1>%s\g<2>' % target, rels)
    assert n[1] == 1, rid
    return n[0]

# ---------------- slide 5 = slide8.xml ----------------
shutil.copy("gen/field_cut2_s.png", f"{UN}/ppt/media/p23_field.png")
x, r = rd("ppt/slides/slide8.xml"), rd("ppt/slides/_rels/slide8.xml.rels")
r = retarget(r, "rIdFarm2", "../media/p23_field.png")
r = retarget(r, "rIdSfxtractor", "../media/audio14.wav")          # bird chirp instead of engine
x = x.replace('name="tractor.wav"', 'name="chirp.wav"')
pic = blk(x, "wi2")
bx, by, bw, bh = 8343402, 2331720, 3045949, 2514600
npic = set_xfrm(pic, *fit("gen/field_cut2_s.png", bx, by, bw, bh)).replace('descr="Làm ở nông trường"', 'descr="Bác nông dân gặt lúa trên cánh đồng"')
x = x.replace(pic, npic)
for a, b in [("<a:t>Làm ở nông trường</a:t>", "<a:t>Làm ở cánh đồng</a:t>"),
             ("<a:t>Cánh đồng lớn, nhiều máy móc</a:t>", "<a:t>Cấy lúa, gặt lúa trên đồng</a:t>")]:
    assert a in x; x = x.replace(a, b)
wr("ppt/slides/slide8.xml", x); wr("ppt/slides/_rels/slide8.xml.rels", r)
n = rd("ppt/notesSlides/notesSlide8.xml")
a = "3) Làm việc ở nông trường (cánh đồng lớn, dùng nhiều máy móc)."
assert a in n
wr("ppt/notesSlides/notesSlide8.xml", n.replace(a, "3) Làm việc ở cánh đồng (cấy lúa, gặt lúa trên đồng)."))

# ---------------- slide 8 = slide16.xml (bgm louder) ----------------
shutil.copy("bgm_new.mp3", f"{UN}/ppt/media/bgm.mp3")
x = rd("ppt/slides/slide16.xml")
assert '<p:cMediaNode vol="90000">' in x
wr("ppt/slides/slide16.xml", x.replace('<p:cMediaNode vol="90000">', '<p:cMediaNode vol="100000">'))

# ---------------- slide 10 = slide5.xml ----------------
shutil.copy("gen/apple_cut2_s.png", f"{UN}/ppt/media/p23_apple.png")
x, r = rd("ppt/slides/slide5.xml"), rd("ppt/slides/_rels/slide5.xml.rels")
r = retarget(r, "rIdN10d", "../media/p23_apple.png")
pic = blk(x, "g1i3"); ox, oy, ow, oh = xfrm(pic)
npic = set_xfrm(pic, *fit("gen/apple_cut2_s.png", ox - 40000, oy - 20000, ow + 80000, oh + 40000)).replace('descr="guava"', 'descr="apple"')
x = x.replace(pic, npic)
assert "<a:t>Ổi</a:t>" in x; x = x.replace("<a:t>Ổi</a:t>", "<a:t>Táo</a:t>")
n = rd("ppt/notesSlides/notesSlide5.xml")
a = "cà chua, ổi) – 3) Sản phẩm chăn nuôi (trứng gà, sữa, gia đình gà, bò sữa)."
assert a in n
wr("ppt/notesSlides/notesSlide5.xml", n.replace(a, "cà chua, táo) – 3) Sản phẩm chăn nuôi (trứng gà, sữa)."))

# remove chicken family + cow (shapes, effects, build entries)
ids = {}
for nm in ["g2i2", "g2l2", "g2i3", "g2l3"]:
    ids[nm] = int(re.search(r'<p:cNvPr id="(\d+)" name="%s"' % nm, x).group(1))
    x = x.replace(blk(x, nm), "")
R = set(map(str, ids.values())); print("removed ids", sorted(R))
root = etree.fromstring(x.encode("utf8"))
def tg(el): return {t.get("spid") for t in el.iter("{%s}spTgt" % NS["p"])}
removed = 0
for par in list(root.iter("{%s}par" % NS["p"])):
    if par.getparent() is None: continue
    s = tg(par)
    if s and s <= R:
        parent = par.getparent()
        # only remove maximal pars
        anc = parent; maximal = True
        while anc is not None:
            if anc.tag == "{%s}par" % NS["p"] and tg(anc) <= R: maximal = False; break
            anc = anc.getparent()
        if maximal and par.getparent() is not None:
            par.getparent().remove(par); removed += 1
print("effects removed:", removed)
for b in list(root.iter("{%s}bldP" % NS["p"])):
    if b.get("spid") in R: b.getparent().remove(b)
x = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True).decode("utf8")
assert not any(f'spid="{i}"' in x for i in R)

# re-centre eggs + milk, bigger
E = 1.4
eg, ml = blk(x, "g2i0"), blk(x, "g2i1"); le, lm = blk(x, "g2l0"), blk(x, "g2l1")
(ex, ey, ew, eh), (mx, my, mw, mh) = xfrm(eg), xfrm(ml)
ew2, eh2, mw2, mh2 = ew * E, eh * E, mw * E, mh * E
cx = 8083296 + 3566160 / 2; gap = 300000
x0 = cx - (ew2 + gap + mw2) / 2; top = 3480000
pe = (x0, top, ew2, eh2); pm = (x0 + ew2 + gap, top, mw2, mh2)
x = x.replace(eg, set_xfrm(eg, *pe)).replace(ml, set_xfrm(ml, *pm))
LW, LH, ly = 1691640, 380000, top + eh2 + 120000
x = x.replace(le, set_xfrm(le, pe[0] + ew2 / 2 - LW / 2, ly, LW, LH).replace('sz="1600"', 'sz="2000"'))
x = x.replace(lm, set_xfrm(lm, pm[0] + mw2 / 2 - LW / 2, ly, LW, LH).replace('sz="1600"', 'sz="2000"'))
wr("ppt/slides/slide5.xml", x); wr("ppt/slides/_rels/slide5.xml.rels", r)
print("done")
