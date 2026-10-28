"""Attach click-to-play audio (icon button + pause/resume pill) to a slide of an UNPACKED pptx.
No autoplay. Pure XML edit, so the slide's existing animations stay intact.
Structure copied from what PowerPoint itself writes (play trigger on the icon, 'togglePause' trigger on the pill)."""
import os, re
from PIL import Image

E = lambda inch: int(round(inch * 914400))
FONT = ('<a:latin typeface="Segoe UI Black" pitchFamily="34" charset="0"/><a:ea typeface="Segoe UI Black" pitchFamily="34" charset="-122"/>'
        '<a:cs typeface="Segoe UI Black" pitchFamily="34" charset="-120"/>')


def add_audio(un, slide_no, mp3_src, icon_src, icon_xyh, pill_xywh, dur_ms, tag, notes_text=None, notes_template_no=7,
              pill_font=1500, pill_fill="FF8F00", pulse_delay=3600, vol=90000, descr="Bấm để nghe nhạc"):
    rd = lambda p: open(os.path.join(un, p), encoding="utf8").read()
    wr = lambda p, s: open(os.path.join(un, p), "w", encoding="utf8").write(s)
    sl, rl = f"ppt/slides/slide{slide_no}.xml", f"ppt/slides/_rels/slide{slide_no}.xml.rels"
    x, rels = rd(sl), rd(rl)

    # media files
    for src, dst in ((mp3_src, f"ppt/media/{tag}.mp3"), (icon_src, f"ppt/media/{tag}_icon.png")):
        with open(src, "rb") as f, open(os.path.join(un, dst), "wb") as g:
            g.write(f.read())
    ct = rd("[Content_Types].xml")
    if 'Extension="mp3"' not in ct:
        ct = ct.replace("<Default ", '<Default Extension="mp3" ContentType="audio/mpeg"/><Default ', 1)
    R = lambda s: f"rId{tag}{s}"
    rels = rels.replace("</Relationships>",
        f'<Relationship Id="{R("A")}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/{tag}.mp3"/>'
        f'<Relationship Id="{R("M")}" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="../media/{tag}.mp3"/>'
        f'<Relationship Id="{R("I")}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{tag}_icon.png"/>'
        "</Relationships>")

    sid = max(int(v) for v in re.findall(r'<p:cNvPr id="(\d+)"', x)) + 1
    pid = sid + 1
    ix, iy, ih = icon_xyh
    w, h = Image.open(icon_src).size
    iw = ih * w / h
    pic = (f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="{tag}_btn" descr="{descr}"><a:hlinkClick r:id="" action="ppaction://media"/></p:cNvPr>'
           '<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr>'
           f'<a:audioFile r:link="{R("A")}"/><p:extLst><p:ext uri="{{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}}">'
           f'<p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="{R("M")}"/></p:ext></p:extLst></p:nvPr></p:nvPicPr>'
           f'<p:blipFill><a:blip r:embed="{R("I")}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
           f'<p:spPr><a:xfrm><a:off x="{E(ix)}" y="{E(iy)}"/><a:ext cx="{E(iw)}" cy="{E(ih)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>')
    px, py, pw, ph = pill_xywh
    pill = (f'<p:sp><p:nvSpPr><p:cNvPr id="{pid}" name="{tag}_pause" descr="Dừng hoặc phát tiếp"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{E(px)}" y="{E(py)}"/><a:ext cx="{E(pw)}" cy="{E(ph)}"/></a:xfrm>'
            '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst></a:prstGeom>'
            f'<a:solidFill><a:srgbClr val="{pill_fill}"/></a:solidFill><a:ln w="38100"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>'
            '<a:effectLst><a:outerShdw blurRad="76200" dist="38100" dir="3600000" algn="bl" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="25000"/></a:srgbClr></a:outerShdw></a:effectLst></p:spPr>'
            '<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="ctr"/><a:lstStyle/>'
            f'<a:p><a:pPr marL="0" indent="0" algn="ctr"><a:buNone/></a:pPr><a:r><a:rPr lang="vi-VN" sz="{pill_font}" dirty="0"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>{FONT}</a:rPr>'
            '<a:t>Dừng / Tiếp</a:t></a:r></a:p></p:txBody></p:sp>')
    x = x.replace("</p:spTree>", pic + pill + "</p:spTree>", 1)

    nid = max(int(v) for v in re.findall(r'<p:cTn id="(\d+)"', x))

    def n():
        nonlocal nid
        nid += 1
        return nid

    tg = lambda s: f'<p:tgtEl><p:spTgt spid="{s}"/></p:tgtEl>'
    cl = lambda s: f'<p:cond evt="onClick" delay="0">{tg(s)}</p:cond>'
    pulse = (f'<p:par><p:cTn id="{n()}" presetID="6" presetClass="emph" presetSubtype="0" accel="50000" decel="50000" autoRev="1" repeatCount="indefinite" fill="hold" grpId="1" nodeType="withEffect">'
             f'<p:stCondLst><p:cond delay="{pulse_delay}"/></p:stCondLst><p:childTnLst><p:animScale><p:cBhvr><p:cTn id="{n()}" dur="700" fill="hold"/>{tg(sid)}</p:cBhvr><p:by x="108000" y="108000"/></p:animScale></p:childTnLst></p:cTn></p:par>')
    m = re.search(r'nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="\d+" fill="hold"><p:stCondLst>.*?</p:stCondLst><p:childTnLst>'
                  r'<p:par><p:cTn id="\d+" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>', x, re.S)
    assert m, "auto-start group not found on slide %d" % slide_no
    x = x[:m.end()] + pulse + x[m.end():]

    def three(cmd, preset, dur):
        return (f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:par><p:cTn id="{n()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:par><p:cTn id="{n()}" presetID="{preset}" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:cmd type="call" cmd="{cmd}"><p:cBhvr><p:cTn id="{n()}" dur="{dur}" fill="hold"/>{tg(sid)}</p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')

    def iseq(trigger, body):
        return (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{n()}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq">'
                f'<p:stCondLst>{cl(trigger)}</p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>{body}</p:childTnLst></p:cTn>'
                f'<p:nextCondLst>{cl(trigger)}</p:nextCondLst></p:seq>')

    play = iseq(sid, three("playFrom(0.0)", 1, dur_ms) + three("playFrom(0.0)", 1, dur_ms).replace('<p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn', '<p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn', 1))
    audio = (f'<p:audio><p:cMediaNode vol="{vol}"><p:cTn id="{n()}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
             f'<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>{tg(sid)}</p:cMediaNode></p:audio>')
    pause = iseq(pid, three("togglePause", 2, 1))
    end_main = x.index("</p:seq>", x.index('nodeType="mainSeq"')) + len("</p:seq>")
    x = x[:end_main] + play + audio + pause + x[end_main:]

    # speaker notes: append to existing notes, or create a notes page for this slide
    esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    if notes_text:
        existing = re.search(r'Target="\.\./notesSlides/(notesSlide\d+\.xml)"', rels)
        if existing:
            p = f"ppt/notesSlides/{existing.group(1)}"
            nt = rd(p)
            i = nt.index("</a:t>")
            wr(p, nt[:i] + esc("\n" + notes_text) + nt[i:])
        else:
            tpl = rd(f"ppt/notesSlides/notesSlide{notes_template_no}.xml")
            wr(f"ppt/notesSlides/notesSlide{slide_no}.xml", re.sub(r"<a:t>[^<]*</a:t>", f"<a:t>{esc(notes_text)}</a:t>", tpl, count=1))
            wr(f"ppt/notesSlides/_rels/notesSlide{slide_no}.xml.rels", rd(f"ppt/notesSlides/_rels/notesSlide{notes_template_no}.xml.rels").replace(f"../slides/slide{notes_template_no}.xml", f"../slides/slide{slide_no}.xml"))
            rels = rels.replace("</Relationships>", f'<Relationship Id="rIdNotes{slide_no}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide{slide_no}.xml"/></Relationships>')
            if f"/ppt/notesSlides/notesSlide{slide_no}.xml" not in ct:
                ct = ct.replace("</Types>", f'<Override PartName="/ppt/notesSlides/notesSlide{slide_no}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/></Types>')
    wr(sl, x)
    wr(rl, rels)
    wr("[Content_Types].xml", ct)
    return sid, pid
