// Post-process a pptxgenjs deck: add slide transitions + auto-play animations (OOXML timing tree).
const fs = require("fs");
const JSZip = require("jszip");

const NS_MC = "http://schemas.openxmlformats.org/markup-compatibility/2006";
const NS_P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main";
const NS_P15 = "http://schemas.microsoft.com/office/powerpoint/2012/main";

function transitionXml(t, snd) {
  // t: {ns:'p14'|'p15', el:'<p14:ripple/>', dur}; snd: {rid, name}
  const dur = t.dur || 1500;
  const sa = snd ? `<p:sndAc><p:stSnd><p:snd r:embed="${snd.rid}" name="${snd.name}.wav"/></p:stSnd></p:sndAc>` : "";
  return `<mc:AlternateContent xmlns:mc="${NS_MC}"><mc:Choice xmlns:p14="${NS_P14}" xmlns:p15="${NS_P15}" Requires="${t.ns}">` +
    `<p:transition spd="slow" p14:dur="${dur}">${t.el}${sa}</p:transition></mc:Choice>` +
    `<mc:Fallback><p:transition spd="slow"><p:fade/>${sa}</p:transition></mc:Fallback></mc:AlternateContent>`;
}

function buildTiming(effects, idOf, isSp, opt = {}) {
  let id = 2;
  const nid = () => ++id;
  const tgt = (s) => `<p:tgtEl><p:spTgt spid="${s}"/></p:tgtEl>`;
  const attrs = (...a) => `<p:attrNameLst>${a.map((x) => `<p:attrName>${x}</p:attrName>`).join("")}</p:attrNameLst>`;
  const vis = (s) => `<p:set><p:cBhvr><p:cTn id="${nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${tgt(s)}${attrs("style.visibility")}</p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
  const anim = (s, attr, dur, kf, extra = "") =>
    `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${nid()}" dur="${dur}" fill="hold"${extra}/>${tgt(s)}${attrs(attr)}</p:cBhvr><p:tavLst>` +
    kf.map(([tm, v]) => `<p:tav tm="${tm}"><p:val><p:strVal val="${v}"/></p:val></p:tav>`).join("") + `</p:tavLst></p:anim>`;
  const fade = (s, dur) => `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${nid()}" dur="${dur}"/>${tgt(s)}</p:cBhvr></p:animEffect>`;
  const wipe = (s, dur) => `<p:animEffect transition="in" filter="wipe(left)"><p:cBhvr><p:cTn id="${nid()}" dur="${dur}"/>${tgt(s)}</p:cBhvr></p:animEffect>`;
  const rot = (s, by, dur, extra = "") => `<p:animRot by="${by}"><p:cBhvr><p:cTn id="${nid()}" dur="${dur}" fill="hold"${extra}/>${tgt(s)}${attrs("r")}</p:cBhvr></p:animRot>`;
  const motion = (s, path, dur, extra = "") => `<p:animMotion origin="layout" path="${path}" pathEditMode="relative"><p:cBhvr><p:cTn id="${nid()}" dur="${dur}" fill="hold"${extra}/>${tgt(s)}${attrs("ppt_x", "ppt_y")}</p:cBhvr></p:animMotion>`;
  const scale = (s, pct, dur, extra = "") => `<p:animScale><p:cBhvr><p:cTn id="${nid()}" dur="${dur}" fill="hold"${extra}/>${tgt(s)}</p:cBhvr><p:by x="${pct}" y="${pct}"/></p:animScale>`;

  const bounceIn = (from, to) => [[0, from], [62000, to], [76000, `${to}-0.025`], [88000, to], [94000, `${to}-0.008`], [100000, to]];
  const overshoot = (from, to, sign) => [[0, from], [72000, `${to}${sign}0.02`], [88000, `${to}${sign === "+" ? "-" : "+"}0.006`], [100000, to]];
  const ENTR = {
    // name: [presetID, subtype, builder]
    fade: [10, 0, (s, t) => vis(s) + fade(s, t)],
    appear: [1, 0, (s) => vis(s)],
    wipe: [22, 8, (s, t) => vis(s) + wipe(s, t)],
    zoom: [53, 16, (s, t) => vis(s) + anim(s, "ppt_w", t, [[0, "0"], [100000, "#ppt_w"]]) + anim(s, "ppt_h", t, [[0, "0"], [100000, "#ppt_h"]]) + fade(s, t)],
    pop: [53, 16, (s, t) => {
      const k = (p) => [[0, "0"], [60000, `#${p}*1.15`], [82000, `#${p}*0.94`], [100000, `#${p}`]];
      return vis(s) + anim(s, "ppt_w", t, k("ppt_w")) + anim(s, "ppt_h", t, k("ppt_h")) + fade(s, Math.round(t * 0.4));
    }],
    spin: [31, 0, (s, t) => vis(s) + anim(s, "ppt_w", t, [[0, "0"], [100000, "#ppt_w"]]) + anim(s, "ppt_h", t, [[0, "0"], [100000, "#ppt_h"]]) + rot(s, 21600000, t) + fade(s, Math.round(t * 0.5))],
    flyT: [2, 1, (s, t) => vis(s) + anim(s, "ppt_x", t, [[0, "#ppt_x"], [100000, "#ppt_x"]]) + anim(s, "ppt_y", t, bounceIn("0-#ppt_h/2", "#ppt_y"))],
    flyB: [2, 4, (s, t) => vis(s) + anim(s, "ppt_x", t, [[0, "#ppt_x"], [100000, "#ppt_x"]]) + anim(s, "ppt_y", t, overshoot("1+#ppt_h/2", "#ppt_y", "-"))],
    flyL: [2, 8, (s, t) => vis(s) + anim(s, "ppt_x", t, overshoot("0-#ppt_w/2", "#ppt_x", "+")) + anim(s, "ppt_y", t, [[0, "#ppt_y"], [100000, "#ppt_y"]])],
    flyR: [2, 2, (s, t) => vis(s) + anim(s, "ppt_x", t, overshoot("1+#ppt_w/2", "#ppt_x", "-")) + anim(s, "ppt_y", t, [[0, "#ppt_y"], [100000, "#ppt_y"]])],
  };
  // loop timing attributes live on the effect cTn (that's how PowerPoint itself writes "repeat until end of slide")
  const SMOOTH = ` accel="50000" decel="50000" autoRev="1"`;
  const LOOP = {
    // name: [presetClass, presetID, effect-cTn attrs, builder]
    bob: ["path", 0, SMOOTH, (s, o) => motion(s, `M 0 0 L 0 -${o.amp || 0.018} E`, o.t || 900)],
    drift: ["path", 0, SMOOTH, (s, o) => motion(s, `M 0 0 L ${o.amp || 0.03} ${o.dy || 0} E`, o.t || 3500)],
    across: ["path", 0, "", (s, o) => motion(s, `M ${o.from} 0 L ${o.to} ${o.dy || 0} E`, o.t || 9000)],
    spin: ["emph", 8, "", (s, o) => rot(s, 21600000, o.t || 14000)],
    pulse: ["emph", 6, SMOOTH, (s, o) => scale(s, o.amp || 107000, o.t || 700)],
    wiggle: ["emph", 8, SMOOTH, (s, o) => rot(s, o.amp || 420000, o.t || 260)],
  };

  const sndSub = (cid, name) => `<p:subTnLst><p:audio><p:cMediaNode><p:cTn id="${nid()}" display="0" masterRel="sameClick"><p:stCondLst><p:cond evt="begin" delay="0"><p:tn val="${cid}"/></p:cond></p:stCondLst><p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn><p:tgtEl><p:sndTgt r:embed="${opt.sndRid(name)}" name="${name}.wav"/></p:tgtEl></p:cMediaNode></p:audio></p:subTnLst>`;
  const M = opt.musicSpid;
  const mediaCall = (cmd, preset, node) => `<p:par><p:cTn id="${nid()}" presetID="${preset}" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="${node}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="${cmd}"><p:cBhvr><p:cTn id="${nid()}" dur="1" fill="hold"/>${tgt(M)}</p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>`;
  // effects with c:true start a new on-click group; everything before the first one auto-plays
  const groups = [[]];
  for (const e of effects) {
    if (e.c) groups.push([]);
    groups[groups.length - 1].push(e);
  }
  const bld = new Set();
  const groupXml = groups.map((g, gi) => {
    if (!g.length) return "";
    const pars = buildPars(g, gi > 0);
    if (gi === 0 && M) pars.unshift(mediaCall("playFrom(0.0)", 1, "withEffect"));
    const cond = gi === 0
      ? `<p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>`
      : `<p:cond delay="indefinite"/>`;
    return `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst>${cond}</p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      pars.join("") + `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  });
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>` +
    groupXml.join("") +
    `</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>` +
    `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>` +
    (M && !process.env.NOINTER ? musicNodes() : "") +
    `</p:childTnLst></p:cTn></p:par></p:tnLst>` + (bld.size ? `<p:bldLst>${[...bld].join("")}</p:bldLst>` : "") + `</p:timing>`;

  function musicNodes() {
    const click = `<p:cond evt="onClick" delay="0">${tgt(M)}</p:cond>`;
    // click the music-note icon to pause / resume (same as PowerPoint's own media trigger)
    const inter = `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${nid()}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst>${click}</p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>` +
      `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      mediaCall("togglePause", 2, "clickEffect") +
      `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:nextCondLst>${click}</p:nextCondLst></p:seq>`;
    const audio = `<p:audio><p:cMediaNode vol="${Math.round((opt.musicVol || 0.5) * 100000)}"${opt.musicSlides ? ` numSld="${opt.musicSlides}"` : ""}><p:cTn id="${nid()}"${opt.musicOnce ? "" : ' repeatCount="indefinite"'} fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>${tgt(M)}</p:cMediaNode></p:audio>`;
    if (process.env.ONLYAUDIO) return audio;
    if (process.env.ONLYINTER) return inter;
    if (process.env.AUDIOFIRST) return audio + inter;
    return inter + audio;
  }

  function buildPars(list, isClick) {
  const pars = [];
  let first = true;
  const node = () => { const n = isClick && first ? "clickEffect" : "withEffect"; first = false; return n; };
  for (const e of list) {
    if (e.cmd === "stopMusic") {
      if (!M) throw new Error("stopMusic needs a media shape");
      pars.push(mediaCall("stop", 2, node()));
      continue;
    }
    const s = idOf(e.n);
    if (s == null) throw new Error("missing shape " + e.n);
    if (e.e) {
      const [pid, sub, fn] = ENTR[e.e];
      const t = e.t || 800;
      const cid = nid();
      pars.push(`<p:par><p:cTn id="${cid}" presetID="${pid}" presetClass="entr" presetSubtype="${sub}" fill="hold" grpId="0" nodeType="${node()}"><p:stCondLst><p:cond delay="${e.d || 0}"/></p:stCondLst><p:childTnLst>${fn(s, t)}</p:childTnLst>${e.s && !process.env.NOFX ? sndSub(cid, e.s) : ""}</p:cTn></p:par>`);
      if (isSp(e.n)) bld.add(`<p:bldP spid="${s}" grpId="0" animBg="1"/>`);
    }
    if (e.x) {   // exit: fade out then hide (wrong answers)
      const t = e.xt || 500, cid = nid();
      const body = `<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="${nid()}" dur="${t}"/>${tgt(s)}</p:cBhvr></p:animEffect>` +
        `<p:set><p:cBhvr><p:cTn id="${nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="${t - 1}"/></p:stCondLst></p:cTn>${tgt(s)}${attrs("style.visibility")}</p:cBhvr><p:to><p:strVal val="hidden"/></p:to></p:set>`;
      pars.push(`<p:par><p:cTn id="${cid}" presetID="10" presetClass="exit" presetSubtype="0" fill="hold" grpId="2" nodeType="${node()}"><p:stCondLst><p:cond delay="${e.xd || 0}"/></p:stCondLst><p:childTnLst>${body}</p:childTnLst>${e.xs && !process.env.NOFX ? sndSub(cid, e.xs) : ""}</p:cTn></p:par>`);
      if (isSp(e.n)) bld.add(`<p:bldP spid="${s}" grpId="2" animBg="1"/>`);
    }
    if (e.g) {   // emphasis: grow (+ optional move) and stay (correct answer)
      const t = e.g.t || 700, cid = nid(), sm = ' accel="40000" decel="40000"';
      pars.push(`<p:par><p:cTn id="${cid}" presetID="6" presetClass="emph" presetSubtype="0" fill="hold" grpId="3" nodeType="${node()}"><p:stCondLst><p:cond delay="${e.gd || 0}"/></p:stCondLst><p:childTnLst>${scale(s, e.g.pct || 125000, t, sm)}</p:childTnLst>${e.gs && !process.env.NOFX ? sndSub(cid, e.gs) : ""}</p:cTn></p:par>`);
      if (e.g.dx !== undefined)
        pars.push(`<p:par><p:cTn id="${nid()}" presetID="0" presetClass="path" presetSubtype="0" fill="hold" grpId="3" nodeType="withEffect"><p:stCondLst><p:cond delay="${e.gd || 0}"/></p:stCondLst><p:childTnLst>${motion(s, `M 0 0 L ${e.g.dx} ${e.g.dy} E`, t, sm)}</p:childTnLst></p:cTn></p:par>`);
    }
    if (e.l) {
      const [cls, pid, attrs, fn] = LOOP[e.l];
      const start = e.ld != null ? e.ld : (e.d || 0) + (e.e ? e.t || 800 : 0);
      const cid = nid();
      pars.push(`<p:par><p:cTn id="${cid}" presetID="${pid}" presetClass="${cls}" presetSubtype="0"${attrs} repeatCount="indefinite" fill="hold" grpId="1" nodeType="${node()}"><p:stCondLst><p:cond delay="${start}"/></p:stCondLst><p:childTnLst>${fn(s, e.lo || {})}</p:childTnLst></p:cTn></p:par>`);
      if (isSp(e.n)) bld.add(`<p:bldP spid="${s}" grpId="1" animBg="1"/>`);
    }
  }
  return pars;
  }
}

async function addMotion(file, slidesSpec, wavDir) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  let ct = await zip.file("[Content_Types].xml").async("string");
  ct = ct.replace(/<Default Extension="mp3" ContentType="[^"]*"\/>/, '<Default Extension="mp3" ContentType="audio/mpeg"/>');
  if (!ct.includes('Extension="wav"')) ct = ct.replace("<Default ", '<Default Extension="wav" ContentType="audio/x-wav"/><Default ');
  zip.file("[Content_Types].xml", ct);
  const added = new Set();
  for (let i = 0; i < slidesSpec.length; i++) {
    const p = `ppt/slides/slide${i + 1}.xml`, rp = `ppt/slides/_rels/slide${i + 1}.xml.rels`;
    let xml = await zip.file(p).async("string");
    let rels = await zip.file(rp).async("string");
    // pptxgenjs can give a media shape the same cNvPr id as another shape: renumber duplicates
    {
      const seen = new Set();
      let next = Math.max(...[...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => +m[1])) + 1;
      xml = xml.replace(/<p:cNvPr id="(\d+)"/g, (m0, id) => (seen.has(id) ? `<p:cNvPr id="${next++}"` : (seen.add(id), m0)));
    }
    const ids = {}, sp = {};
    // map cNvPr name -> id, and whether it's a p:sp (vs p:pic)
    const re = /<p:(sp|pic)>\s*<p:nv(?:Sp|Pic)Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"/g;
    let m;
    while ((m = re.exec(xml))) { ids[m[3]] = m[2]; sp[m[3]] = m[1] === "sp"; }
    const spec = slidesSpec[i];
    const sndRid = (name) => {
      const rid = "rIdSfx" + name.replace(/\W/g, "");
      if (!added.has(name)) { zip.file(`ppt/media/sfx_${name}.wav`, fs.readFileSync(`${wavDir}/${name}.wav`)); added.add(name); }
      if (!rels.includes(`Id="${rid}"`))
        rels = rels.replace("</Relationships>", `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/sfx_${name}.wav"/></Relationships>`);
      return rid;
    };
    let add = "";
    if (spec.trans) add += transitionXml(spec.trans, spec.snd && !process.env.NOTR ? { rid: sndRid(spec.snd), name: spec.snd } : null);
    const opt = { sndRid };
    if (spec.music && !process.env.NOMUSIC && (!process.env.MS || process.env.MS.split(',').includes(String(i + 1)))) {
      opt.musicSpid = ids["bgmusic"]; opt.musicVol = spec.music.vol; opt.musicSlides = spec.music.slides; opt.musicOnce = spec.music.once;
      if (!opt.musicSpid) throw new Error("no bgmusic shape on slide " + (i + 1));
      xml = xml.replace("<a:videoFile r:link=", "<a:audioFile r:link=");
    }
    if (spec.fx && spec.fx.length) add += buildTiming(spec.fx, (n) => ids[n], (n) => sp[n], opt);
    if (!xml.includes("</p:clrMapOvr>")) throw new Error("no clrMapOvr in " + p);
    xml = xml.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + add);
    zip.file(p, xml);
    zip.file(rp, rels);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { addMotion, buildTiming };
