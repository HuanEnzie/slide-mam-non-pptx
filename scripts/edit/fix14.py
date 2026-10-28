"""v13 -> v14
 1) slide 11 (Quy trình) replaces blank slide 6; title -> "QUY TRÌNH LÀM VIỆC CỦA BÁC NÔNG DÂN"
 2) delete slide 13 (Bé làm bác nông dân)
 3) every music track plays only AFTER all pictures: images on their own Next steps, then Next = play, Next = stop
"""
import re, sys, subprocess
sys.stdout.reconfigure(encoding="utf-8")
UN = "un"
rd = lambda p: open(f"{UN}/{p}", encoding="utf8").read()
wr = lambda p, s: open(f"{UN}/{p}", "w", encoding="utf8").write(s)

# ---------- 1+2: order ----------
p = rd("ppt/presentation.xml")
lst = re.search(r"<p:sldIdLst>.*?</p:sldIdLst>", p, re.S).group(0)
ent = {m.group(1): m.group(0) for m in re.finditer(r'<p:sldId id="(\d+)" r:id="rId\d+"/>', lst)}
order = ["256", "257", "258", "259", "263", "264", "261", "271", "262", "260", "265", "267", "268", "272", "269"]
removed = sorted(set(ent) - set(order))
assert removed == ["266", "270"], removed
p = p.replace(lst, "<p:sldIdLst>" + "".join(ent[i] for i in order) + "</p:sldIdLst>")
sec = lambda ids: "".join(f'<p14:sldId id="{i}"/>' for i in ids)
for name, ids in (("Mở đầu", order[:2]), ("Bài mới", order[2:13]), ("Kết thúc", order[13:])):
    p = re.sub(r'(<p14:section name="%s"[^>]*><p14:sldIdLst>).*?(</p14:sldIdLst>)' % name, lambda m: m.group(1) + sec(ids) + m.group(2), p, flags=re.S)
wr("ppt/presentation.xml", p)

# map id -> slide file
rels = rd("ppt/_rels/presentation.xml.rels")
rid2f = {re.search(r'Id="([^"]+)"', m).group(1): re.search(r'Target="([^"]+)"', m).group(1) for m in re.findall(r"<Relationship [^>]*>", rels)}
id2f = {m.group(1): rid2f[m.group(2)] for m in re.finditer(r'<p:sldId id="(\d+)" r:id="([^"]+)"/>', p)}

# ---------- title of the Quy trình slide ----------
qf = "ppt/" + id2f["264"]
x = rd(qf)
old = "<a:t>QUY TRÌNH CỦA BÁC NÔNG DÂN</a:t>"
assert old in x
rib = re.search(r'<p:sp>(?:(?!</p:sp>).)*?name="ribbon".*?</p:sp>', x, re.S).group(0)
sz = re.search(r'sz="(\d+)"', rib).group(1)
new_rib = rib.replace(old, "<a:t>QUY TRÌNH LÀM VIỆC CỦA BÁC NÔNG DÂN</a:t>").replace(f'sz="{sz}"', 'sz="2600"')
x = x.replace(rib, new_rib)
wr(qf, x)
print("ribbon size", sz, "-> 2600")

# ---------- 3: music after pictures ----------
def dur_ms(slide_file, xml, spid):
    pic = re.search(r'<p:pic><p:nvPicPr><p:cNvPr id="%s".*?</p:pic>' % spid, xml, re.S).group(0)
    rid = re.search(r'audioFile r:link="([^"]+)"', pic).group(1)
    r = rd(slide_file.replace("slides/", "slides/_rels/") + ".rels")
    tgt = re.search(r'<Relationship [^>]*Id="%s"[^>]*Target="([^"]+)"|<Relationship [^>]*Target="([^"]+)"[^>]*Id="%s"' % (rid, rid), r)
    media = (tgt.group(1) or tgt.group(2)).replace("../", "ppt/")
    out = subprocess.run(["D:/ffmpeg/bin/ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{UN}/{media}"], capture_output=True, text=True).stdout
    return int(float(out) * 1000)

def clean_empty(s):
    pat = re.compile(r'<p:par><p:cTn id="\d+" fill="hold"><p:stCondLst>(?:(?!</p:stCondLst>).)*</p:stCondLst><p:childTnLst></p:childTnLst></p:cTn></p:par>', re.S)
    while True:
        n = pat.sub("", s)
        if n == s:
            return s
        s = n

def group(nid, cmd, preset, dur, spid):
    a, b, c, d = nid[0] + 1, nid[0] + 2, nid[0] + 3, nid[0] + 4
    nid[0] += 4
    return (f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{c}" presetID="{preset}" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="{cmd}"><p:cBhvr><p:cTn id="{d}" dur="{dur}" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>'
            f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')

changed = []
for sid in order:
    f = "ppt/" + id2f[sid]
    x = rd(f)
    if 'nodeType="mainSeq"' not in x:
        continue
    a = x.index('nodeType="mainSeq"')
    b = x.index("</p:seq>", a)
    ms = x[a:b]
    auto = list(re.finditer(r'<p:par><p:cTn id="\d+" presetID="\d+" presetClass="mediacall"[^>]*nodeType="(?:withEffect|afterEffect)"[^>]*>.*?</p:par>', ms, re.S))
    auto = [m for m in auto if 'cmd="playFrom' in m.group(0)]
    if not auto:
        continue
    spid = re.search(r'spTgt spid="(\d+)"', auto[0].group(0)).group(1)
    for m in reversed(auto):
        ms = ms[:m.start()] + ms[m.end():]
    ms = clean_empty(ms)
    nid = [max(int(v) for v in re.findall(r'<p:cTn id="(\d+)"', x))]
    d = dur_ms(f, x, spid)
    play = group(nid, "playFrom(0.0)", 1, d, spid)
    stop_m = re.search(r'<p:par><p:cTn id="\d+" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="\d+" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="\d+" presetID="3" presetClass="mediacall"', ms)
    end = ms.rindex("</p:childTnLst></p:cTn><p:prevCondLst>")
    if stop_m:
        ms = ms[:stop_m.start()] + play + ms[stop_m.start():]
    else:
        ms = ms[:end] + play + group(nid, "stop", 3, 1, spid) + ms[end:]
    x = x[:a] + ms + x[b:]
    wr(f, x)
    changed.append((id2f[sid], spid, d))

# notes wording
for sid in order:
    f = id2f[sid]
    r = rd("ppt/" + f.replace("slides/", "slides/_rels/") + ".rels")
    m = re.search(r"notesSlides/(notesSlide\d+\.xml)", r)
    if not m:
        continue
    np_ = f"ppt/notesSlides/{m.group(1)}"
    t = rd(np_); t0 = t
    t = t.replace("Nhạc nền tự phát khi mở slide.", "Nhạc: sau khi hiện hết hình, bấm “tới” để phát nhạc, bấm “tới” lần nữa để dừng nhạc, rồi bấm “tới” để sang slide sau.")
    t = t.replace("1) hiện ảnh 1 và nhạc bắt đầu phát – 2) hiện ảnh 2 – 3) dừng nhạc – 4) sang slide tiếp theo.", "1) hiện ảnh 1 – 2) hiện ảnh 2 – 3) phát nhạc – 4) dừng nhạc – 5) sang slide tiếp theo.")
    t = t.replace("phát cùng lúc với ảnh 1, bấm “tới” ở bước 3 để dừng.", "phát ở bước 3 (sau khi hiện đủ 2 ảnh), dừng ở bước 4.")
    if t != t0:
        wr(np_, t)
print("music moved after pictures on:", changed)
