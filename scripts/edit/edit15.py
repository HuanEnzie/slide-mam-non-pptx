"""v14 -> v15 (all edits on the unpacked deck in ./un)
 audio : slide 2 & 3 louder, slide 4 quieter, slide 3 music cut to 15 s, slide 8 music replaced by the user's new track
 slide 7 (Cải Xanh) : tools = cày, quang gánh, bừa + NEW kéo, xe rùa
 slide 10 (Bắp Ngọt): củ sắn->khoai tây, lúa picture fixed, su hào->cà rốt, táo->ổi
 slide 13 (Trò chơi 2): picture -> seed-art bông lúa / bắp ngô / súp lơ
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
esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def blk(x, name):
    m = re.search(r'<p:(sp|pic)>(?:(?!</p:\1>).)*?name="%s"[\s\S]*?</p:\1>' % re.escape(name), x)
    if not m:
        raise KeyError(name)
    return m.group(0)

def set_xfrm(b, x, y, w, h):
    return re.sub(r'<a:off x="-?\d+" y="-?\d+"/><a:ext cx="\d+" cy="\d+"/>', f'<a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/>', b, count=1)

def geo(b):
    return [int(v) / 914400 for v in re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/><a:ext cx="(\d+)" cy="(\d+)"/>', b).groups()]

def add_rel(rels, rid, typ, target):
    assert f'Id="{rid}"' not in rels
    return rels.replace("</Relationships>", f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/{typ}" Target="../media/{target}"/></Relationships>')

def rel_target(rels, rid):
    m = re.search(r'<Relationship [^>]*Id="%s"[^>]*>' % rid, rels).group(0)
    return re.search(r'Target="\.\./(media/[^"]+)"', m).group(1)

def put_media(src, name):
    shutil.copy(src, f"{UN}/ppt/media/{name}")

def fit_in(img_path, bx, by, bw, bh, align="center"):
    """largest size of the image inside the box, centred; returns x,y,w,h in inches"""
    iw, ih = Image.open(img_path).size
    s = min(bw / iw, bh / ih)
    w, h = iw * s, ih * s
    return bx + (bw - w) / 2, by + (bh - h) / 2, w, h

def notes_path(n):
    return "ppt/notesSlides/" + re.search(r"notesSlides/(notesSlide\d+\.xml)", rd(RL(n))).group(1)

def edit_notes(n, pairs):
    p = notes_path(n); t = rd(p)
    for a, b in pairs:
        assert a in t, (n, a)
        t = t.replace(a, b)
    wr(p, t)

# =====================================================================  AUDIO
def swap_audio(slide, rid, new_file, vol=None, dur=None):
    rels = rd(RL(slide))
    media = rel_target(rels, rid)
    shutil.copy(new_file, f"{UN}/ppt/{media}")
    x = rd(SL(slide))
    if vol is not None:
        x, n = re.subn(r'<p:cMediaNode vol="\d+"', f'<p:cMediaNode vol="{vol}"', x)
        assert n == 1, (slide, n)
    if dur is not None:
        x, n = re.subn(r'(cmd="playFrom\(0\.0\)"><p:cBhvr><p:cTn id="\d+" dur=")\d+', r"\g<1>%d" % dur, x)
        assert n >= 1, (slide, "dur")
    wr(SL(slide), x)
    return media

print("audio:",
      swap_audio(2, "rIdClapA", "aud/clap.mp3", vol=100000),
      swap_audio(3, "rIdRapA", "aud/rap.mp3", vol=100000, dur=15000),
      swap_audio(4, "rIdtaoA", "aud/tao.mp3", vol=70000),
      swap_audio(16, "rIdbgmA", "aud/new.mp3", dur=54900))
edit_notes(3, [("nhạc rap cắt từ video TikTok @huyen.nguyen.gvmn (59,7 giây).", "nhạc rap cắt từ video TikTok @huyen.nguyen.gvmn, chỉ giữ 15 giây đầu.")])
edit_notes(16, [("NHẠC: 3 phút 3 giây, lấy từ video TikTok @trandungbgyt; phát ở bước 3",
                 "NHẠC: 54,9 giây, lấy từ video nhạc do cô cung cấp (đã thay nhạc cũ); phát ở bước 3")])

# =====================================================================  SLIDE 10  (Bắp Ngọt, nông sản) = slide5.xml
x = rd(SL(5)); rels = rd(RL(5))
swaps = [("g0i0", "g0l0", "cut/khoaitay.png", "potato", "Khoai tây", "rIdN10a", "p15_khoaitay.png"),
         ("g0i1", "g0l1", "cut/lua.png", "rice", "Lúa", "rIdN10b", "p15_lua.png"),
         ("g1i1", "g1l1", "cut/carot.png", "carrot", "Cà rốt", "rIdN10c", "p15_carot.png"),
         ("g1i3", "g1l3", "cut/oi.png", "guava", "Ổi", "rIdN10d", "p15_oi.png")]
for pic, lab, src, descr, label, rid, mname in swaps:
    old = blk(x, pic)
    ox, oy, ow, oh = geo(old)
    put_media(src, mname)
    rels = add_rel(rels, rid, "image", mname)
    nx, ny, nw, nh = fit_in(src, ox + ow / 2 - 0.85, oy, 1.7, 1.08)
    new = re.sub(r'r:embed="[^"]+"', f'r:embed="{rid}"', old)
    new = re.sub(r'descr="[^"]*"', f'descr="{descr}"', new)
    new = set_xfrm(new, nx, ny, nw, nh)
    x = x.replace(old, new)
    lb = blk(x, lab)
    x = x.replace(lb, re.sub(r"<a:t>[^<]*</a:t>", f"<a:t>{label}</a:t>", lb, count=1))
wr(SL(5), x); wr(RL(5), rels)
edit_notes(5, [("1) Lương thực (củ sắn, lúa, ngô, khoai lang)", "1) Lương thực (khoai tây, lúa, ngô, khoai lang)"),
               ("2) Rau, củ, quả (rau cải, su hào, cà chua, táo)", "2) Rau, củ, quả (rau cải, cà rốt, cà chua, ổi)")])

# =====================================================================  SLIDE 13  (Trò chơi 2) = slide13.xml
x = rd(SL(13)); rels = rd(RL(13))
old = blk(x, "seedArt")
ox, oy, ow, oh = geo(old)
put_media("cut/seedart_all.png", "p15_seedart.png")
rels = add_rel(rels, "rIdN13a", "image", "p15_seedart.png")
nx, ny, nw, nh = fit_in("cut/seedart_all.png", ox, oy, ow, oh)
new = re.sub(r'r:embed="[^"]+"', 'r:embed="rIdN13a"', old)
new = re.sub(r'descr="[^"]*"', 'descr="Ba bức tranh làm từ hạt: bông lúa, bắp ngô và súp lơ"', new)
x = x.replace(old, set_xfrm(new, nx, ny, nw, nh))
assert "cải xanh…" in x
x = x.replace("cải xanh…", "súp lơ…")
wr(SL(13), x); wr(RL(13), rels)
edit_notes(13, [("bông lúa, bắp ngô, cải xanh", "bông lúa, bắp ngô, súp lơ")])

# =====================================================================  SLIDE 7  (Cải Xanh, dụng cụ) = slide6.xml
x = rd(SL(6)); rels = rd(RL(6))
ids = {m.group(2): m.group(1) for m in re.finditer(r'<p:cNvPr id="(\d+)" name="([^"]+)"', x)}
DEL = [1, 2, 3, 4, 6]
del_ids = {ids[f"{p}{k}"] for k in DEL for p in ("t", "ti", "tn", "tu")}
for k in DEL:
    for p in ("t", "ti", "tn", "tu"):
        x = x.replace(blk(x, f"{p}{k}"), "")
# new cards cloned from card 0
nid = max(int(v) for v in re.findall(r'<p:cNvPr id="(\d+)"', x)) + 1
NEW = [(8, "Cái kéo", "Cắt cành, cắt rau, cắt hoa", "1E88E5", "cut/keo.png", "keo", "rIdN7a", "p15_keo.png"),
       (9, "Xe rùa", "Chở đất, chở nông sản", "00897B", "cut/xerua.png", "wheelbarrow", "rIdN7b", "p15_xerua.png")]
tpl = {p: blk(x, f"{p}0") for p in ("t", "ti", "tn", "tu")}
tpl_ids = {p: ids[f"{p}0"] for p in tpl}
new_ids = {}
add_xml = ""
for k, name, use, col, src, descr, rid, mname in NEW:
    put_media(src, mname); rels = add_rel(rels, rid, "image", mname)
    card = re.sub(r'<p:cNvPr id="\d+" name="t0"', f'<p:cNvPr id="{nid}" name="t{k}"', tpl["t"]); new_ids[f"t{k}"] = str(nid); nid += 1
    card = re.sub(r'(<a:ln w="\d+"><a:solidFill><a:srgbClr val=")[0-9A-F]{6}', r"\g<1>" + col, card, count=1)
    pic = re.sub(r'<p:cNvPr id="\d+" name="ti0"', f'<p:cNvPr id="{nid}" name="ti{k}"', tpl["ti"]); new_ids[f"ti{k}"] = str(nid); nid += 1
    pic = re.sub(r'r:embed="[^"]+"', f'r:embed="{rid}"', pic); pic = re.sub(r'descr="[^"]*"', f'descr="{descr}"', pic)
    tn = re.sub(r'<p:cNvPr id="\d+" name="tn0"', f'<p:cNvPr id="{nid}" name="tn{k}"', tpl["tn"]); new_ids[f"tn{k}"] = str(nid); nid += 1
    tn = re.sub(r"<a:t>[^<]*</a:t>", f"<a:t>{esc(name)}</a:t>", tn, count=1)
    tn = re.sub(r'(<a:rPr[^>]*><a:solidFill><a:srgbClr val=")[0-9A-F]{6}', r"\g<1>" + col, tn, count=1)
    tu = re.sub(r'<p:cNvPr id="\d+" name="tu0"', f'<p:cNvPr id="{nid}" name="tu{k}"', tpl["tu"]); new_ids[f"tu{k}"] = str(nid); nid += 1
    tu = re.sub(r"<a:t>[^<]*</a:t>", f"<a:t>{esc(use)}</a:t>", tu, count=1)
    add_xml += card + pic + tn + tu
music = blk(x, "bgmusic")
x = x.replace(music, add_xml + music)
# layout: 3 on top, 2 centred below
ORDER = [0, 5, 7, 8, 9]
CW, CH, GAP = 3.6, 2.0, 0.35
pos = [(0.92 + i * (CW + GAP), 2.42) for i in range(3)] + [(2.895 + i * (CW + GAP), 4.57) for i in range(2)]
SRC = {0: None}
for (k, (cx, cy)) in zip(ORDER, pos):
    card = blk(x, f"t{k}"); x = x.replace(card, set_xfrm(card, cx, cy, CW, CH))
    pic = blk(x, f"ti{k}")
    r = re.search(r'r:embed="([^"]+)"', pic).group(1)
    media = rel_target(rels, r)
    px, py, pw, ph = fit_in(f"{UN}/ppt/{media}", cx + 0.2, cy + 0.08, CW - 0.4, 1.12)
    x = x.replace(pic, set_xfrm(pic, px, py, pw, ph))
    tn = blk(x, f"tn{k}"); _, _, _, th = geo(tn); x = x.replace(tn, set_xfrm(tn, cx + 0.1, cy + 1.22, CW - 0.2, th))
    tu = blk(x, f"tu{k}"); _, _, _, uh = geo(tu); x = x.replace(tu, set_xfrm(tu, cx + 0.1, cy + 1.6, CW - 0.2, uh))
# ---- timing: drop the deleted cards' click groups, clone card 0's group for the two new cards
def top_pars(inner):
    out, depth, start = [], 0, None
    for m in re.finditer(r"<(/?)p:par>", inner):
        if m.group(1) == "":
            if depth == 0: start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0: out.append((start, m.end()))
    return out
a = x.index('nodeType="mainSeq"'); s0 = x.index("<p:childTnLst>", a) + len("<p:childTnLst>")
e0 = x.index("</p:childTnLst></p:cTn><p:prevCondLst>", s0)
inner = x[s0:e0]
groups = [inner[s:e] for s, e in top_pars(inner)]
card_group = lambda k: next(g for g in groups if f'spid="{ids[f"t{k}"]}"' in g)
tpl_group = card_group(0)
keep = [g for g in groups if not any(f'spid="{i}"' in g for i in del_ids)]
assert len(keep) == len(groups) - len(DEL), (len(keep), len(groups))
nxt = [max(int(v) for v in re.findall(r'<p:cTn id="(\d+)"', x))]
def clone(g, mapping):
    for old_id, new_id in mapping.items():
        g = g.replace(f'spid="{old_id}"', f'spid="@{new_id}"')
    idmap = {}
    for oid in re.findall(r'<p:cTn id="(\d+)"', g):
        if oid not in idmap:
            nxt[0] += 1; idmap[oid] = nxt[0]
    g = re.sub(r'<p:cTn id="(\d+)"', lambda m: f'<p:cTn id="{idmap[m.group(1)]}"', g)
    g = re.sub(r'<p:tn val="(\d+)"/>', lambda m: f'<p:tn val="{idmap[m.group(1)]}"/>' if m.group(1) in idmap else m.group(0), g)
    return g.replace('spid="@', 'spid="')
clones = [clone(tpl_group, {tpl_ids[p]: new_ids[f"{p}{k}"] for p in tpl_ids}) for k in (8, 9)]
# insert clones after the last card group (before the PLAY group of the music)
last_card = max(i for i, g in enumerate(keep) if any(f'spid="{ids[f"t{k}"]}"' in g for k in ORDER[:3]))
final = keep[:last_card + 1] + clones + keep[last_card + 1:]
x = x[:s0] + "".join(final) + x[e0:]
# build list: drop deleted shapes, add the new sp shapes with the same attributes card 0 had
bl = re.search(r"<p:bldLst>.*?</p:bldLst>", x, re.S).group(0)
entries = re.findall(r"<p:bldP [^>]*/>", bl)
entries = [e for e in entries if re.search(r'spid="(\d+)"', e).group(1) not in del_ids]
tmpl = {p: next(e for e in entries if f'spid="{tpl_ids[p]}"' in e) for p in ("t", "tn", "tu")}
for k in (8, 9):
    for p in ("t", "tn", "tu"):
        entries.append(tmpl[p].replace(f'spid="{tpl_ids[p]}"', f'spid="{new_ids[f"{p}{k}"]}"'))
x = x.replace(bl, "<p:bldLst>" + "".join(entries) + "</p:bldLst>")
wr(SL(6), x); wr(RL(6), rels)
edit_notes(6, [("Mỗi lần bấm chuột hiện 1 dụng cụ (8 lần): cái cày, cái cuốc, cái liềm, cái xẻng, cái cào, quang gánh, bình tưới, cái bừa.",
                "Mỗi lần bấm “tới” hiện 1 dụng cụ (5 lần): cái cày, quang gánh, cái bừa, cái kéo, xe rùa.")])
print("slide 7: cards", ORDER, "| groups", len(groups), "->", len(final))
print("done")
