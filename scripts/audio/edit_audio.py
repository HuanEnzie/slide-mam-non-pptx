import re, sys
sys.path.insert(0, ".")
sys.stdout.reconfigure(encoding="utf-8")
from add_audio import add_audio
UN = "un"
rd = lambda p: open(f"{UN}/{p}", encoding="utf8").read()
wr = lambda p, s: open(f"{UN}/{p}", "w", encoding="utf8").write(s)
blk = lambda x, n: re.search(r'<p:(sp|pic)>(?:(?!</p:\1>).)*?name="%s".*?</p:\1>' % n, x, re.S).group(0)

# ---- slide 17 (new closing slide, copy of "Cảm ơn các cô!") -> text
x = rd("ppt/slides/slide17.xml")
t = blk(x, "title"); nt = t
for a, b in (("Cảm ", "KẾT "), ("ơn ", "THÚC "), ("các ", "HOẠT "), ("cô!", "ĐỘNG")):
    assert f"<a:t>{a}</a:t>" in nt, a
    nt = nt.replace(f"<a:t>{a}</a:t>", f"<a:t>{b}</a:t>")
nt = nt.replace('sz="6600"', 'sz="5400"')
x = x.replace(t, nt)
w = blk(x, "wish"); nw = w.replace("Chúc các cô sức khỏe – Chúc các bé chăm ngoan, học giỏi!", "Cả lớp cùng hát: Lớn lên cháu lái máy cày").replace('sz="2200"', 'sz="2600"')
assert nw != w
x = x.replace(w, nw)
wr("ppt/slides/slide17.xml", x)

# ---- audio: closing slide <- YouTube song (198.97 s)
add_audio(UN, 17, "mus/lon-len-chau-lai-may-cay.mp3", "../build/st/music.png", (8.85, 0.35, 1.1), (8.6, 1.52, 1.9, 0.46), 198972, "song",
          notes_text="KẾT THÚC HOẠT ĐỘNG. Bấm vào biểu tượng nốt nhạc để phát bài hát “Lớn lên cháu lái máy cày” (kênh Gà Con Music, YouTube, 3 phút 19 giây); bấm nút “Dừng / Tiếp” để tạm dừng hoặc phát tiếp; chuyển slide thì nhạc tự dừng. Cô và các con cùng hát, vận động theo nhạc rồi chào tạm biệt.",
          descr="Bấm để nghe bài hát Lớn lên cháu lái máy cày")
# ---- audio: photo slide (slide 16) <- TikTok track (183.56 s)
add_audio(UN, 16, "mus/nhac-tiktok.mp3", "../build/st/music.png", (12.5, 6.74, 0.64), (10.9, 6.83, 1.5, 0.46), 183562, "bgm",
          notes_text="NHẠC: bấm vào biểu tượng nốt nhạc góc phải dưới để phát nhạc nền (3 phút 3 giây, lấy từ video TikTok @trandungbgyt); bấm “Dừng / Tiếp” để tạm dừng hoặc phát tiếp; chuyển slide thì nhạc tự dừng.",
          pill_font=1300, pulse_delay=3600, descr="Bấm để nghe nhạc")

# ---- order + sections
p = rd("ppt/presentation.xml")
lst = re.search(r"<p:sldIdLst>.*?</p:sldIdLst>", p, re.S).group(0)
ent = {m.group(1): m.group(0) for m in re.finditer(r'<p:sldId id="(\d+)" r:id="rId\d+"/>', lst)}
order = ["256","257","258","259","263","270","261","271","262","260","264","265","266","267","268","272","269"]
assert sorted(order) == sorted(ent), (sorted(order), sorted(ent))
p = p.replace(lst, "<p:sldIdLst>" + "".join(ent[i] for i in order) + "</p:sldIdLst>")
sec = lambda ids: "".join(f'<p14:sldId id="{i}"/>' for i in ids)
p = re.sub(r'(<p14:section name="Mở đầu"[^>]*><p14:sldIdLst>).*?(</p14:sldIdLst>)', lambda m: m.group(1) + sec(order[:2]) + m.group(2), p, flags=re.S)
p = re.sub(r'(<p14:section name="Bài mới"[^>]*><p14:sldIdLst>).*?(</p14:sldIdLst>)', lambda m: m.group(1) + sec(order[2:15]) + m.group(2), p, flags=re.S)
p = re.sub(r'(<p14:section name="Kết thúc"[^>]*><p14:sldIdLst>).*?(</p14:sldIdLst>)', lambda m: m.group(1) + sec(order[15:]) + m.group(2), p, flags=re.S)
wr("ppt/presentation.xml", p)
print("done; order", ",".join(order))
