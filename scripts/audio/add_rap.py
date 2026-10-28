# Slide 3: click-to-play rap audio (mic button) + pause/resume button. No autoplay. Pure XML edit so existing animations stay intact.
import re, zipfile
from PIL import Image

SRC, OUT = "src.pptx", "Kham-pha-nghe-nong-v10.pptx"
SLIDE, RELS, NOTES = "ppt/slides/slide3.xml", "ppt/slides/_rels/slide3.xml.rels", "ppt/notesSlides/notesSlide3.xml"
E = lambda inch: int(round(inch * 914400))

z = zipfile.ZipFile(SRC)
files = {n: z.read(n) for n in z.namelist()}
x = files[SLIDE].decode("utf8")
rels = files[RELS].decode("utf8")
ct = files["[Content_Types].xml"].decode("utf8")

files["ppt/media/nhac-rap.mp3"] = open("nhac-rap.mp3", "rb").read()
files["ppt/media/mic_btn.png"] = open("mic_btn.png", "rb").read()
if 'Extension="mp3"' not in ct:
    ct = ct.replace("<Default ", '<Default Extension="mp3" ContentType="audio/mpeg"/><Default ', 1)
rels = rels.replace("</Relationships>",
    '<Relationship Id="rIdRapA" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/nhac-rap.mp3"/>'
    '<Relationship Id="rIdRapM" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="../media/nhac-rap.mp3"/>'
    '<Relationship Id="rIdRapImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/mic_btn.png"/>'
    "</Relationships>")

sid = max(int(v) for v in re.findall(r'<p:cNvPr id="(\d+)"', x)) + 1   # mic (audio) shape
pid = sid + 1                                                          # pause button
w, h = Image.open("mic_btn.png").size
bh = 1.6; bw = bh * w / h
mx, my = 11.35, 2.1
pic = (f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="micbtn" descr="Bấm để nghe nhạc rap">'
       '<a:hlinkClick r:id="" action="ppaction://media"/></p:cNvPr><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>'
       '<p:nvPr><a:audioFile r:link="rIdRapA"/><p:extLst><p:ext uri="{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}">'
       '<p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="rIdRapM"/></p:ext></p:extLst></p:nvPr></p:nvPicPr>'
       '<p:blipFill><a:blip r:embed="rIdRapImg"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
       f'<p:spPr><a:xfrm><a:off x="{E(mx)}" y="{E(my)}"/><a:ext cx="{E(bw)}" cy="{E(bh)}"/></a:xfrm>'
       '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>')
pw_, ph_ = 1.9, 0.52
font = '<a:latin typeface="Segoe UI Black" pitchFamily="34" charset="0"/><a:ea typeface="Segoe UI Black" pitchFamily="34" charset="-122"/><a:cs typeface="Segoe UI Black" pitchFamily="34" charset="-120"/>'
pill = (f'<p:sp><p:nvSpPr><p:cNvPr id="{pid}" name="pausebtn" descr="Dừng hoặc phát tiếp"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr><a:xfrm><a:off x="{E(mx + bw / 2 - pw_ / 2)}" y="{E(my + bh + 0.08)}"/><a:ext cx="{E(pw_)}" cy="{E(ph_)}"/></a:xfrm>'
        '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst></a:prstGeom>'
        '<a:solidFill><a:srgbClr val="FF8F00"/></a:solidFill><a:ln w="38100"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>'
        '<a:effectLst><a:outerShdw blurRad="76200" dist="38100" dir="3600000" algn="bl" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="25000"/></a:srgbClr></a:outerShdw></a:effectLst></p:spPr>'
        '<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="ctr"/><a:lstStyle/>'
        '<a:p><a:pPr marL="0" indent="0" algn="ctr"><a:buNone/></a:pPr><a:r><a:rPr lang="vi-VN" sz="1500" dirty="0"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
        + font + '</a:rPr><a:t>Dừng / Tiếp</a:t></a:r></a:p></p:txBody></p:sp>')
x = x.replace("</p:spTree>", pic + pill + "</p:spTree>", 1)

nid = max(int(v) for v in re.findall(r'<p:cTn id="(\d+)"', x))
def n():
    global nid
    nid += 1
    return nid
tg = lambda s: f'<p:tgtEl><p:spTgt spid="{s}"/></p:tgtEl>'
cl = lambda s: f'<p:cond evt="onClick" delay="0">{tg(s)}</p:cond>'

# gentle pulse on the mic after the slide's own animations have finished
pulse = (f'<p:par><p:cTn id="{n()}" presetID="6" presetClass="emph" presetSubtype="0" accel="50000" decel="50000" autoRev="1" '
         f'repeatCount="indefinite" fill="hold" grpId="1" nodeType="withEffect"><p:stCondLst><p:cond delay="3600"/></p:stCondLst>'
         f'<p:childTnLst><p:animScale><p:cBhvr><p:cTn id="{n()}" dur="700" fill="hold"/>{tg(sid)}</p:cBhvr><p:by x="108000" y="108000"/></p:animScale>'
         '</p:childTnLst></p:cTn></p:par>')
m = re.search(r'nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="\d+" fill="hold"><p:stCondLst>.*?</p:stCondLst><p:childTnLst>'
              r'<p:par><p:cTn id="\d+" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>', x, re.S)
assert m, "auto group not found"
x = x[:m.end()] + pulse + x[m.end():]

def call(cmd, preset, dur, trig):
    return (f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{n()}" presetID="{preset}" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="{cmd}"><p:cBhvr><p:cTn id="{n()}" dur="{dur}" fill="hold"/>{tg(sid)}</p:cBhvr></p:cmd>'
            f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')

def iseq(trigger_shape, body):
    return (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{n()}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq">'
            f'<p:stCondLst>{cl(trigger_shape)}</p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>{body}</p:childTnLst></p:cTn>'
            f'<p:nextCondLst>{cl(trigger_shape)}</p:nextCondLst></p:seq>')

DUR = 59700
# mic click -> play from start (same structure PowerPoint writes: first click + later clicks both restart)
play_body = (f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
             f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
             f'<p:par><p:cTn id="{n()}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
             f'<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="{n()}" dur="{DUR}" fill="hold"/>{tg(sid)}</p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
             f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
             f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
             f'<p:par><p:cTn id="{n()}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
             f'<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="{n()}" dur="{DUR}" fill="hold"/>{tg(sid)}</p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
play = iseq(sid, play_body)
audio = (f'<p:audio><p:cMediaNode vol="90000"><p:cTn id="{n()}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
         f'<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>{tg(sid)}</p:cMediaNode></p:audio>')
pause = iseq(pid, call("togglePause", 2, 1, None))

end_main = x.index("</p:seq>", x.index('nodeType="mainSeq"')) + len("</p:seq>")
x = x[:end_main] + play + audio + pause + x[end_main:]

# credit in speaker notes
nt = files[NOTES].decode("utf8")
add = ("\\nÂM THANH: nhạc rap cắt từ video TikTok @huyen.nguyen.gvmn (59,7 giây). Bấm vào hình micro để phát từ đầu; bấm nút “Dừng / Tiếp” để tạm dừng hoặc phát tiếp; chuyển slide thì nhạc tự dừng.").replace("\\n", "\n")
i = nt.index("</a:t>", nt.index("Chuyển sang bài mới"))
nt = nt[:i] + add + nt[i:]

files[SLIDE] = x.encode("utf8"); files[RELS] = rels.encode("utf8"); files["[Content_Types].xml"] = ct.encode("utf8"); files[NOTES] = nt.encode("utf8")
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zo:
    for name in ["[Content_Types].xml"] + [k for k in files if k != "[Content_Types].xml"]:
        zo.writestr(name, files[name])
print("ok mic", sid, "pause", pid)
