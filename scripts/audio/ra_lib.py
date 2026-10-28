"""v11 -> v12: make the 4 click-to-play audio slides work with a 2-button presenter remote (Next / Previous).
 - audio now plays on a MAIN-SEQUENCE click (the same step a remote's "next" button advances)
 - the mouse-only "Dừng / Tiếp" pill and its trigger are removed
 - the music icon still works with the mouse as an extra (play trigger kept)
 - long tracks get an explicit Stop step, so one more "next" stops the music before leaving the slide
"""
import re, sys
sys.stdout.reconfigure(encoding="utf-8")
UN = "un"
rd = lambda p: open(f"{UN}/{p}", encoding="utf8").read()
wr = lambda p, s: open(f"{UN}/{p}", "w", encoding="utf8").write(s)


def top_pars(inner):
    out, depth, start = [], 0, None
    for m in re.finditer(r"<(/?)p:par>", inner):
        if m.group(1) == "":
            if depth == 0:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                out.append((start, m.end()))
    return out


def call_par(nid, cmd, preset, dur, spid, node):
    return (f'<p:par><p:cTn id="{nid[0]+1}" presetID="{preset}" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="{node}">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="{cmd}"><p:cBhvr><p:cTn id="{nid[0]+2}" dur="{dur}" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>'), nid.__setitem__(0, nid[0] + 2)


def click_group(nid, cmd, preset, dur, spid):
    a = nid[0] + 1; b = nid[0] + 2
    nid[0] += 2
    par, _ = call_par(nid, cmd, preset, dur, spid, "clickEffect")
    return (f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{par}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')


def remove_interactive(x, spid):
    """drop the interactiveSeq whose trigger is shape `spid`"""
    key = f'<p:cond evt="onClick" delay="0"><p:tgtEl><p:spTgt spid="{spid}"/>'
    i = x.index(key)
    s = x.rfind("<p:seq ", 0, i)
    e = x.index("</p:seq>", i) + len("</p:seq>")
    return x[:s] + x[e:]


def shape_id(x, name):
    return re.search(r'<p:cNvPr id="(\d+)" name="%s"' % name, x).group(1)


def remove_shape(x, name):
    m = re.search(r'<p:sp>(?:(?!</p:sp>).)*?name="%s".*?</p:sp>' % name, x, re.S)
    return x.replace(m.group(0), "")


def edit(slide_no, icon, pill, dur, play_with_first_click, stop_step, notes_fix):
    sl = f"ppt/slides/slide{slide_no}.xml"
    x = rd(sl)
    sid = shape_id(x, icon)
    if pill:
        pid = shape_id(x, pill)
        x = remove_interactive(x, pid)
        x = remove_shape(x, pill)
    nid = [max(int(v) for v in re.findall(r'<p:cTn id="(\d+)"', x))]
    ms = x.index('nodeType="mainSeq"')
    inner_start = x.index("<p:childTnLst>", ms) + len("<p:childTnLst>")
    end_tag = "</p:childTnLst></p:cTn><p:prevCondLst>"
    inner_end = x.index(end_tag, inner_start)
    new_groups = ""
    if play_with_first_click:
        # play together with the slide's FIRST click step (card 1)
        inner = x[inner_start:inner_end]
        groups = top_pars(inner)
        gi = next(i for i, (s, e) in enumerate(groups) if 'delay="indefinite"/></p:stCondLst>' in inner[s:e][:160] and "onBegin" not in inner[s:e][:200])
        gs, ge = groups[gi]
        g = inner[gs:ge]
        m = re.search(r'<p:par><p:cTn id="\d+" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>', g)
        par, _ = call_par(nid, "playFrom(0.0)", 1, dur, sid, "withEffect")
        g2 = g[:m.end()] + par + g[m.end():]
        x = x[:inner_start] + inner[:gs] + g2 + inner[ge:] + x[inner_end:]
        inner_end = x.index(end_tag, inner_start)
    else:
        new_groups += click_group(nid, "playFrom(0.0)", 1, dur, sid)
    if stop_step:
        new_groups += click_group(nid, "stop", 3, 1, sid)
    x = x[:inner_end] + new_groups + x[inner_end:]
    wr(sl, x)
    # notes
    rels = rd(f"ppt/slides/_rels/slide{slide_no}.xml.rels")
    nf = re.search(r"notesSlides/(notesSlide\d+\.xml)", rels).group(1)
    nt = rd(f"ppt/notesSlides/{nf}")
    nt2 = notes_fix(nt)
    assert nt2 != nt, f"notes unchanged on slide {slide_no}"
    wr(f"ppt/notesSlides/{nf}", nt2)
    return sid


