# Add a click-to-play clapping button to slide 2 (no autoplay). Pure XML edit so all existing animations stay intact.
import re, shutil, zipfile, os
from PIL import Image

SRC, OUT = "src.pptx", "Kham-pha-nghe-nong-v9.pptx"
SLIDE, RELS = "ppt/slides/slide2.xml", "ppt/slides/_rels/slide2.xml.rels"
E = lambda inch: int(round(inch * 914400))

z = zipfile.ZipFile(SRC)
files = {n: z.read(n) for n in z.namelist()}
x = files[SLIDE].decode("utf8")
rels = files[RELS].decode("utf8")
ct = files["[Content_Types].xml"].decode("utf8")

# media
files["ppt/media/clap4s.mp3"] = open("clap4s.mp3", "rb").read()
files["ppt/media/clap_btn.png"] = open("clap_btn.png", "rb").read()
if 'Extension="mp3"' not in ct:
    ct = ct.replace("<Default ", '<Default Extension="mp3" ContentType="audio/mpeg"/><Default ', 1)
rels = rels.replace("</Relationships>",
    '<Relationship Id="rIdClapA" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/clap4s.mp3"/>'
    '<Relationship Id="rIdClapM" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="../media/clap4s.mp3"/>'
    '<Relationship Id="rIdClapImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/clap_btn.png"/>'
    "</Relationships>")

# button picture = the audio shape itself (bottom, between the chick and the girl)
sid = max(int(v) for v in re.findall(r'<p:cNvPr id="(\d+)"', x)) + 1
w, h = Image.open("clap_btn.png").size
bh = 1.45; bw = bh * w / h
pic = (f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="clapbtn" descr="Bấm để phát tiếng vỗ tay">'
       '<a:hlinkClick r:id="" action="ppaction://media"/></p:cNvPr><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>'
       '<p:nvPr><a:audioFile r:link="rIdClapA"/><p:extLst><p:ext uri="{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}">'
       '<p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="rIdClapM"/></p:ext></p:extLst></p:nvPr></p:nvPicPr>'
       '<p:blipFill><a:blip r:embed="rIdClapImg"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
       f'<p:spPr><a:xfrm><a:off x="{E(8.82)}" y="{E(5.62)}"/><a:ext cx="{E(bw)}" cy="{E(bh)}"/></a:xfrm>'
       '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>')
x = x.replace("</p:spTree>", pic + "</p:spTree>", 1)

# timing
nid = max(int(v) for v in re.findall(r'<p:cTn id="(\d+)"', x))
def n():
    global nid
    nid += 1
    return nid
tgt = f'<p:tgtEl><p:spTgt spid="{sid}"/></p:tgtEl>'
click = f'<p:cond evt="onClick" delay="0">{tgt}</p:cond>'

# 1) gentle "press me" pulse, joins the slide's auto-start group
pulse = (f'<p:par><p:cTn id="{n()}" presetID="6" presetClass="emph" presetSubtype="0" accel="50000" decel="50000" autoRev="1" '
         f'repeatCount="indefinite" fill="hold" grpId="1" nodeType="withEffect"><p:stCondLst><p:cond delay="4200"/></p:stCondLst>'
         f'<p:childTnLst><p:animScale><p:cBhvr><p:cTn id="{n()}" dur="700" fill="hold"/>{tgt}</p:cBhvr><p:by x="108000" y="108000"/></p:animScale>'
         '</p:childTnLst></p:cTn></p:par>')
m = re.search(r'nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="\d+" fill="hold"><p:stCondLst>.*?</p:stCondLst><p:childTnLst>'
              r'<p:par><p:cTn id="\d+" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>', x, re.S)
assert m, "auto group not found"
x = x[:m.end()] + pulse + x[m.end():]

# 2) click the button -> play from the start (PowerPoint's own "trigger: on click of" structure)
inter = (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{n()}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq">'
         f'<p:stCondLst>{click}</p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>'
         f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
         f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
         f'<p:par><p:cTn id="{n()}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect">'
         f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)">'
         f'<p:cBhvr><p:cTn id="{n()}" dur="4000" fill="hold"/>{tgt}</p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>'
         f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
         f'<p:nextCondLst>{click}</p:nextCondLst></p:seq>')
audio = (f'<p:audio><p:cMediaNode vol="90000"><p:cTn id="{n()}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
         f'<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>{tgt}</p:cMediaNode></p:audio>')
# main sequence ends with its nextCondLst + </p:seq>
end_main = x.index("</p:seq>", x.index('nodeType="mainSeq"')) + len("</p:seq>")
x = x[:end_main] + inter + x[end_main:]
tail = "</p:childTnLst></p:cTn></p:par></p:tnLst>"
i = x.index(tail)
x = x[:i] + audio + x[i:]

files[SLIDE] = x.encode("utf8"); files[RELS] = rels.encode("utf8"); files["[Content_Types].xml"] = ct.encode("utf8")
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zo:
    for name in ["[Content_Types].xml"] + [k for k in files if k != "[Content_Types].xml"]:
        zo.writestr(name, files[name])
print("ok, button id", sid)
