import re, sys
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")
UN = "un"
rd = lambda p: open(f"{UN}/{p}", encoding="utf8").read()
wr = lambda p, s: open(f"{UN}/{p}", "w", encoding="utf8").write(s)
blk = lambda x, n: re.search(r'<p:(sp|pic)>(?:(?!</p:\1>).)*?name="%s".*?</p:\1>' % n, x, re.S).group(0)
xfrm = lambda b: re.search(r'<a:off x="-?\d+" y="-?\d+"/><a:ext cx="\d+" cy="\d+"/>', b).group(0)
descr = lambda b: re.search(r'descr="([^"]*)"', b).group(1)
def rel_target(rels, rid):
    m = re.search(r'<Relationship [^>]*Id="%s"[^>]*>' % rid, rels).group(0)
    return re.search(r'Target="([^"]+)"', m).group(1)
def set_rel_target(rels, rid, new):
    m = re.search(r'<Relationship [^>]*Id="%s"[^>]*>' % rid, rels).group(0)
    return rels.replace(m, re.sub(r'Target="[^"]+"', f'Target="{new}"', m))
embed_id = lambda b: re.search(r'r:embed="([^"]+)"', b).group(1)

A, B, BL = 8, 5, 15          # A = "công việc" slide (was Bắp Ngọt), B = "nông sản" slide (was Lúa Vàng), BL = blank slide after A
xa, xb, xbl = (rd(f"ppt/slides/slide{i}.xml") for i in (A, B, BL))
ra, rb, rbl = (rd(f"ppt/slides/_rels/slide{i}.xml.rels") for i in (A, B, BL))

# remember Lúa Vàng pieces (currently on B) and Bắp Ngọt pieces (currently on A)
LUA = {"mascot": blk(xb, "mascot"), "decor": blk(xb, "decor")}
BAP = {"mascot": blk(xa, "mascot"), "decor": blk(xa, "decor")}
lua_t = {k: rel_target(rb, embed_id(LUA[k])) for k in LUA}
bap_t = {k: rel_target(ra, embed_id(BAP[k])) for k in BAP}
lua_mp3 = {rid: rel_target(rb, rid) for rid in ("rId2", "rId1")}
bap_mp3 = {rid: rel_target(ra, rid) for rid in ("rId2", "rId1")}

def retitle(x, to):
    """to='LUA' or 'BAP': recolor + rename ribbon, recolor topic"""
    rib = blk(x, "ribbon"); new = rib
    if to == "LUA":
        new = new.replace("FF6F00", "F29E02").replace("A64600", "8D5300").replace("ĐỘI BẮP NGỌT", "ĐỘI LÚA VÀNG")
    else:
        new = new.replace("F29E02", "FF6F00").replace("8D5300", "A64600").replace("ĐỘI LÚA VÀNG", "ĐỘI BẮP NGỌT")
    assert new != rib
    x = x.replace(rib, new)
    try:
        top = blk(x, "topic")
        nt = top.replace("E65100", "E68A00") if to == "LUA" else top.replace("E68A00", "E65100")
        x = x.replace(top, nt)
    except AttributeError:
        pass
    return x

def put_piece(x, rels, name, piece, target):
    """put the other team's mascot/decor into this slide: reuse this slide's own relationship id, retarget it"""
    cur = blk(x, name)
    rid = embed_id(cur)
    rels = set_rel_target(rels, rid, target)
    new = re.sub(r'<p:cNvPr id="\d+"', re.search(r'<p:cNvPr id="\d+"', cur).group(0), piece, count=1)
    new = re.sub(r'r:embed="[^"]+"', f'r:embed="{rid}"', new)
    return x.replace(cur, new), rels

# --- slide A (công việc) -> Lúa Vàng
xa = retitle(xa, "LUA")
for k in ("mascot", "decor"):
    xa, ra = put_piece(xa, ra, k, LUA[k], lua_t[k])
for rid in ("rId2", "rId1"):
    ra = set_rel_target(ra, rid, lua_mp3[rid])
# --- slide B (nông sản) -> Bắp Ngọt
xb = retitle(xb, "BAP")
for k in ("mascot", "decor"):
    xb, rb = put_piece(xb, rb, k, BAP[k], bap_t[k])
for rid in ("rId2", "rId1"):
    rb = set_rel_target(rb, rid, bap_mp3[rid])
# --- blank slide after A -> Lúa Vàng
xbl = retitle(xbl, "LUA")
for k in ("mascot", "decor"):
    xbl, rbl = put_piece(xbl, rbl, k, LUA[k], lua_t[k])
for i, (x, r) in {A: (xa, ra), B: (xb, rb), BL: (xbl, rbl)}.items():
    wr(f"ppt/slides/slide{i}.xml", x); wr(f"ppt/slides/_rels/slide{i}.xml.rels", r)

# --- notes: chants/music move with the team; team names in the body follow the new owner
def notes_path(i):
    return "ppt/notesSlides/" + re.search(r"notesSlides/(notesSlide\d+\.xml)", rd(f"ppt/slides/_rels/slide{i}.xml.rels")).group(1)
na, nb = rd(notes_path(A)), rd(notes_path(B))
pat = re.compile(r"<a:t>(KHẨU HIỆU.*?)\n(Đội (?:Lúa Vàng|Bắp Ngọt) giới thiệu.*?)</a:t>", re.S)
ma, mb = pat.search(na), pat.search(nb)
head_a, body_a, head_b, body_b = ma.group(1), ma.group(2), mb.group(1), mb.group(2)
assert "Bắp Ngọt" in head_a and "Lúa Vàng" in head_b
body_a2 = body_a.replace("Đội Bắp Ngọt", "Đội Lúa Vàng")
body_b2 = body_b.replace("Đội Lúa Vàng", "Đội Bắp Ngọt")
wr(notes_path(A), na.replace(ma.group(0), f"<a:t>{head_b}\n{body_a2}</a:t>"))
wr(notes_path(B), nb.replace(mb.group(0), f"<a:t>{head_a}\n{body_b2}</a:t>"))

# --- slide 4: back to Lúa Vàng, Cải Xanh, Bắp Ngọt (swap card0 <-> card2 again)
x = rd("ppt/slides/slide4.xml")
get = lambda n: blk(x, n)
c0, c2, l0, l2, p0, p2 = (get(n) for n in ("card0", "card2", "lab0", "lab2", "m0", "m2"))
lc = lambda b: re.search(r'<a:ln w="\d+"><a:solidFill><a:srgbClr val="([0-9A-F]{6})"', b).group(1)
rc = lambda b: re.search(r'<a:rPr[^>]*><a:solidFill><a:srgbClr val="([0-9A-F]{6})"', b).group(1)
tx = lambda b: re.search(r"<a:t>([^<]*)</a:t>", b).group(1)
geo = lambda b: tuple(map(int, re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/><a:ext cx="(\d+)" cy="(\d+)"', b).groups()))
def recolor_line(b, to):
    w = re.search(r'<a:ln w="(\d+)">', b).group(1)
    return re.sub(r'(<a:ln w="%s"><a:solidFill><a:srgbClr val=")[0-9A-F]{6}' % w, r"\g<1>" + to, b, count=1)
def relabel(b, text, color):
    b = b.replace(f"<a:t>{tx(b)}</a:t>", f"<a:t>{text}</a:t>")
    return re.sub(r'(<a:rPr[^>]*><a:solidFill><a:srgbClr val=")[0-9A-F]{6}', r"\g<1>" + color, b, count=1)
nc0, nc2 = recolor_line(c0, lc(c2)), recolor_line(c2, lc(c0))
nl0, nl2 = relabel(l0, tx(l2), rc(l2)), relabel(l2, tx(l0), rc(l0))
(c0x, _, c0w, _), (c2x, _, c2w, _) = geo(c0), geo(c2)
g0, g2 = geo(p0), geo(p2)
def place(b, other, card_x, card_w, og):
    x0 = round(card_x + card_w / 2 - og[2] / 2)
    b = re.sub(r'r:embed="[^"]+"', f'r:embed="{embed_id(other)}"', b)
    b = re.sub(r'descr="[^"]*"', f'descr="{descr(other)}"', b)
    return re.sub(r'<a:off x="-?\d+" y="-?\d+"/><a:ext cx="\d+" cy="\d+"/>', f'<a:off x="{x0}" y="{geo(b)[1]}"/><a:ext cx="{og[2]}" cy="{og[3]}"/>', b)
np0, np2 = place(p0, p2, c0x, c0w, g2), place(p2, p0, c2x, c2w, g0)
for o, n in ((c0, nc0), (c2, nc2), (l0, nl0), (l2, nl2), (p0, np0), (p2, np2)):
    x = x.replace(o, n)
wr("ppt/slides/slide4.xml", x)
n4 = rd("ppt/notesSlides/notesSlide4.xml")
assert "Bắp Ngọt, Cải Xanh, Lúa Vàng" in n4
wr("ppt/notesSlides/notesSlide4.xml", n4.replace("Bắp Ngọt, Cải Xanh, Lúa Vàng", "Lúa Vàng, Cải Xanh, Bắp Ngọt"))
print("slide 4 labels now:", tx(nl0), "/", tx(l0 if False else get('lab1')), "/", tx(nl2))
print("identity swap done")
