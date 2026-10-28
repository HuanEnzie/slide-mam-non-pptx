// v18 -> v19
//  * delete "Trò chơi 2: Sáng tạo tranh từ hạt" (slide13.xml, id 268)
//  * old "Trò chơi 1: Cấy lúa thần tốc" becomes "Trò chơi 2"
//  * new "Trò chơi 1: Rung chuông vàng" = 1 intro slide + 7 quiz slides (colour-coded answers, one click reveals the answer)
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { buildTiming } = require("../build/anim");

const UN = "un";
const SK = "C:/Users/Acer/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/56ca2020-6017-4e8a-b5f4-c7d83981e5d5/efd3dbb2-b668-4ec3-a5be-1508a9741380/skills/pptx/scripts";
const WAV = "../build/aud/wav";
const E = (i) => Math.round(i * 914400);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rd = (p) => fs.readFileSync(`${UN}/${p}`, "utf8");
const wr = (p, s) => fs.writeFileSync(`${UN}/${p}`, s);
const pngSize = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

const SHADOW = '<a:effectLst><a:outerShdw blurRad="76200" dist="38100" dir="3600000" algn="bl" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="25000"/></a:srgbClr></a:outerShdw></a:effectLst>';
const COL = {
  red: { n: "ĐỎ", c: "E53935", t: "FFFFFF", name: "đỏ" },
  purple: { n: "TÍM", c: "8E24AA", t: "FFFFFF", name: "tím" },
  green: { n: "XANH LÁ", c: "43A047", t: "FFFFFF", name: "xanh lá" },
  yellow: { n: "VÀNG", c: "FBC02D", t: "5D3A00", name: "vàng" },
};
const GOLD = "F29E02", BROWN = "8D5300";

function txRun(t, o) {
  const font = o.f === "R" ? "Segoe UI" : "Segoe UI Black";
  return `<a:r><a:rPr lang="vi-VN" sz="${Math.round(o.sz * 100)}"${o.b ? ' b="1"' : ""} dirty="0">${o.ln ? `<a:ln w="${o.lnw || 19050}"><a:solidFill><a:srgbClr val="${o.ln}"/></a:solidFill></a:ln>` : ""}<a:solidFill><a:srgbClr val="${o.color || "000000"}"/></a:solidFill><a:latin typeface="${font}" pitchFamily="34" charset="0"/><a:ea typeface="${font}" pitchFamily="34" charset="-122"/><a:cs typeface="${font}" pitchFamily="34" charset="-120"/></a:rPr><a:t>${esc(t)}</a:t></a:r>`;
}
const para = (runs, algn = "ctr", sz = 18) => `<a:p><a:pPr marL="0" indent="0" algn="${algn}"><a:buNone/></a:pPr>${runs}<a:endParaRPr lang="vi-VN" sz="${sz * 100}" dirty="0"/></a:p>`;

class SlideB {
  constructor(file, no) { this.file = file; this.no = no; this.n = 1; this.xml = ""; this.ids = {}; this.isSp = {}; this.media = {}; this.sfx = new Set(); this.r = 10; }
  id(name) { if (this.ids[name]) throw new Error("dup " + name); this.ids[name] = String(++this.n); return this.ids[name]; }
  rel(key, file) { if (!this.media[key]) this.media[key] = { rid: "rIdG" + ++this.r, file }; return this.media[key].rid; }
  box(name, o) {
    const id = this.id(name); this.isSp[name] = true;
    const geom = o.geom || "roundRect";
    const fill = o.fill ? `<a:solidFill><a:srgbClr val="${o.fill}">${o.alpha ? `<a:alpha val="${o.alpha}"/>` : ""}</a:srgbClr></a:solidFill>` : "<a:noFill/>";
    const line = o.line ? `<a:ln w="${Math.round((o.lw || 3) * 12700)}"><a:solidFill><a:srgbClr val="${o.line}"/></a:solidFill>${o.dash ? '<a:prstDash val="dash"/>' : ""}</a:ln>` : "<a:ln><a:noFill/></a:ln>";
    const ins = E(o.ins || 0);
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr${o.txBox ? ' txBox="1"' : ""}/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(o.x)}" y="${E(o.y)}"/><a:ext cx="${E(o.w)}" cy="${E(o.h)}"/></a:xfrm><a:prstGeom prst="${geom}"><a:avLst>${geom === "roundRect" ? `<a:gd name="adj" fmla="val ${o.adj ?? 50000}"/>` : ""}</a:avLst></a:prstGeom>${fill}${line}${o.shadow === false ? "" : SHADOW}</p:spPr><p:txBody><a:bodyPr wrap="square" lIns="${ins}" tIns="${Math.round(ins / 2)}" rIns="${ins}" bIns="${Math.round(ins / 2)}" rtlCol="0" anchor="${o.anchor || "ctr"}"/><a:lstStyle/>${o.paras || '<a:p><a:endParaRPr lang="vi-VN"/></a:p>'}</p:txBody></p:sp>`;
  }
  pic(name, key, x, y, w, h, descr, file) {
    const id = this.id(name); this.isSp[name] = false;
    const rid = this.rel(key, file || `cut/${key}.png`);
    return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="${name}" descr="${esc(descr || name)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${E(x)}" y="${E(y)}"/><a:ext cx="${E(w)}" cy="${E(h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
  }
  fit(name, key, bx, by, bw, bh, descr, valign = "center", file) {
    const [iw, ih] = pngSize(file || `cut/${key}.png`);
    const s = Math.min(bw / iw, bh / ih), w = iw * s, h = ih * s;
    const y = valign === "bottom" ? by + bh - h : valign === "top" ? by : by + (bh - h) / 2;
    return this.pic(name, key, bx + (bw - w) / 2, y, w, h, descr, file);
  }
  grp(name, x, y, w, h, kids) {
    const id = this.id(name); this.isSp[name] = false;
    return `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="${E(x)}" y="${E(y)}"/><a:ext cx="${E(w)}" cy="${E(h)}"/><a:chOff x="${E(x)}" y="${E(y)}"/><a:chExt cx="${E(w)}" cy="${E(h)}"/></a:xfrm></p:grpSpPr>${kids}</p:grpSp>`;
  }
  sndRid(name) { this.sfx.add(name); return "rIdSfx" + name; }
}

// ---- transitions
const TRANS = {
  ripple: { ns: "p14", el: "<p14:ripple/>", dur: 900 },
  vortex: { ns: "p14", el: '<p14:vortex dir="r"/>', dur: 1500 },
};
function transitionXml(t) {
  return `<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main" Requires="${t.ns}"><p:transition spd="slow" p14:dur="${t.dur}">${t.el}</p:transition></mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>`;
}

// ---- notes
const notesTpl = rd("ppt/notesSlides/notesSlide9.xml");
function notesXml(lines) {
  const ps = lines.map((l) => `<a:p><a:r><a:rPr lang="vi-VN" dirty="0"/><a:t>${esc(l)}</a:t></a:r></a:p>`).join("");
  return notesTpl.replace(/(<p:ph type="body" idx="1"\/><\/p:nvPr><\/p:nvSpPr><p:spPr\/><p:txBody><a:bodyPr\/><a:lstStyle\/>)[\s\S]*?(<\/p:txBody>)/, `$1${ps}$2`);
}

function finish(S, trans, fx, notes) {
  const timing = buildTiming(fx, (n) => S.ids[n], (n) => S.isSp[n], { sndRid: (n) => S.sndRid(n) });
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld name="Slide ${S.no}"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${S.xml}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>${transitionXml(trans)}${timing}</p:sld>`;
  let rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>' +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${S.no}.xml"/>`;
  for (const [key, m] of Object.entries(S.media)) {
    const ext = path.extname(m.file).slice(1);
    const name = `g19_${key}.${ext}`;
    if (!fs.existsSync(`${UN}/ppt/media/${name}`)) fs.copyFileSync(m.file, `${UN}/ppt/media/${name}`);
    rels += `<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${name}"/>`;
  }
  for (const n of S.sfx) {
    if (!fs.existsSync(`${UN}/ppt/media/sfx_${n}.wav`)) fs.copyFileSync(`${WAV}/${n}.wav`, `${UN}/ppt/media/sfx_${n}.wav`);
    rels += `<Relationship Id="rIdSfx${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/sfx_${n}.wav"/>`;
  }
  rels += "</Relationships>";
  wr(`ppt/slides/${S.file}`, xml);
  wr(`ppt/slides/_rels/${S.file}.rels`, rels);
  wr(`ppt/notesSlides/notesSlide${S.no}.xml`, notesXml(notes));
  wr(`ppt/notesSlides/_rels/notesSlide${S.no}.xml.rels`, rd("ppt/notesSlides/_rels/notesSlide9.xml.rels").replace("../slides/slide9.xml", `../slides/${S.file}`));
  let ct = rd("[Content_Types].xml");
  const ov = `/ppt/notesSlides/notesSlide${S.no}.xml`;
  if (!ct.includes(ov)) ct = ct.replace("</Types>", `<Override PartName="${ov}" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/></Types>`);
  wr("[Content_Types].xml", ct);
}

// ------------------------------------------------------------------ header shared by all game slides
function header(S, title, titleSize, rightText) {
  let x = "";
  x += S.pic("bg", "bg_gold", 0, 0, 13.333, 7.5, "Nền cánh đồng lúa", "../build/st/bg_gold.jpg");
  x += S.fit("cloud", "cloud", 0.35, 0.3, 1.2, 0.85, "Mây");
  x += S.box("ribbon", { x: 3.0, y: 0.25, w: 7.33, h: 1.1, adj: 50000, fill: GOLD, line: "FFFFFF", lw: 4, paras: para(txRun(title, { sz: titleSize, color: "FFFFFF", ln: BROWN, lnw: 19050 })) });
  x += S.fit("mascot", "bell", 1.78, 0.0, 1.3, 1.5, "Chuông vàng", "center");
  if (rightText) x += S.box("badge", { x: 10.75, y: 0.38, w: 2.2, h: 0.8, fill: "E53935", line: "FFFFFF", lw: 3, paras: para(txRun(rightText, { sz: 24, color: "FFFFFF" })) });
  return x;
}
const headerFx = (withBadge) => [
  { n: "ribbon", e: "flyT", d: 0, t: 1000, s: "whoosh" },
  { n: "mascot", e: "spin", d: 600, t: 800, l: "wiggle", lo: { amp: 300000, t: 450 }, s: "bells" },
  { n: "cloud", e: "fade", d: 300, t: 700, l: "drift", lo: { amp: 0.03, t: 4000 } },
  ...(withBadge ? [{ n: "badge", e: "pop", d: 900, t: 600, s: "pop2" }] : []),
];

// ------------------------------------------------------------------ questions
const Q = [
  { q: "Đâu là hình ảnh bác nông dân?", correct: 1, ans: "hình bác nông dân (nón lá, cầm cuốc)",
    opts: [["red", "q1_doctor", "Bác sĩ"], ["purple", "q1_farmer", "Bác nông dân"], ["green", "q1_teacher", "Cô giáo"], ["yellow", "q1_builder", "Chú công nhân xây dựng"]] },
  { q: "Nơi làm việc của bác nông dân?", correct: 3, ans: "cánh đồng lúa",
    opts: [["red", "q2_hospital", "Bệnh viện (bác sĩ)"], ["purple", "q2_school", "Lớp học (cô giáo)"], ["green", "q2_site", "Công trường xây dựng"], ["yellow", "q2_field", "Cánh đồng (bác nông dân)"]] },
  { q: "Bác nông dân làm công việc gì?", correct: 0, ans: "bác nông dân đang trồng trọt (chăm sóc rau, lúa)",
    opts: [["red", "q3_plant", "Trồng trọt"], ["purple", "q3_fire", "Chữa cháy"], ["green", "q3_chef", "Nấu ăn"], ["yellow", "q3_painter", "Vẽ tranh"]] },
  { q: "Ngoài trồng trọt, bác nông dân còn làm công việc gì?", correct: 2, ans: "chăn nuôi (cho gà, vịt, lợn, bò ăn)",
    opts: [["red", "q4_tailor", "May quần áo"], ["purple", "q4_bus", "Lái xe buýt"], ["green", "q4_livestock", "Chăn nuôi"]] },
  { q: "Đâu là dụng cụ nghề nông?", correct: 1, ans: "cái cuốc",
    opts: [["red", "q5_stetho", "Ống nghe (bác sĩ)"], ["purple", "q5_hoe", "Cái cuốc"], ["green", "q5_pan", "Chảo (đầu bếp)"], ["yellow", "q5_chalk", "Hộp phấn (cô giáo)"]] },
  { q: "Đâu là sản phẩm nghề nông?", correct: 0, ans: "giỏ rau củ quả, lúa, ngô",
    opts: [["red", "q6_basket", "Rau củ quả, lúa, ngô"], ["purple", "q6_vase", "Bình hoa"], ["green", "q6_shirt", "Áo sơ mi"], ["yellow", "q6_chair", "Chiếc ghế"]] },
  { q: "Hãy sắp xếp quy trình trồng trọt của bác nông dân?", correct: 2, ans: "Làm đất → Gieo trồng → Chăm sóc → Thu hoạch", seq: true,
    opts: [["red", [2, 1, 3, 4]], ["purple", [1, 3, 2, 4]], ["green", [1, 2, 3, 4]]] },
];
const STEP = { 1: "Làm đất", 2: "Gieo trồng", 3: "Chăm sóc", 4: "Thu hoạch" };

function questionSlide(file, no, qi) {
  const d = Q[qi], S = new SlideB(file, no);
  S.xml += header(S, "RUNG CHUÔNG VÀNG", 36, `CÂU ${qi + 1}/7`);
  const long = d.q.length > 36;
  S.xml += S.box("banner", { x: 0.9, y: 1.5, w: 11.53, h: 0.85, adj: 50000, fill: "FFFFFF", line: BROWN, lw: 4, paras: para(txRun(d.q, { sz: long ? 25 : 30, color: "5D3A00" })) });
  const fx = [...headerFx(true), { n: "banner", e: "pop", d: 1300, t: 700, s: "sparkle" }];
  const revealFx = [];
  const n = d.opts.length;
  let correctName = null, cxCorrect = 0, cyCorrect = 0, tCenterY = 4.87, scale = 120000;
  if (!d.seq) {
    const cw = n === 4 ? 2.85 : 3.7, gap = n === 4 ? 0.3 : 0.45, total = n * cw + (n - 1) * gap, x0 = (13.333 - total) / 2;
    const cardY = 3.1, cardH = 3.3, chipH = 0.98, chipY = cardY - 0.5, gy = chipY, gh = cardY + cardH - chipY;
    d.opts.forEach(([ck, key, label], i) => {
      const c = COL[ck], x = x0 + i * (cw + gap);
      let kids = S.box(`card${i}`, { x, y: cardY, w: cw, h: cardH, adj: 9000, fill: "FFFFFF", alpha: 97000, line: c.c, lw: 6 });
      kids += S.fit(`img${i}`, key, x + 0.12, cardY + 0.55, cw - 0.24, cardH - 0.65, label);
      kids += S.box(`chip${i}`, { x: x + 0.1, y: chipY, w: cw - 0.2, h: chipH, adj: 50000, fill: c.c, line: "FFFFFF", lw: 4, paras: para(txRun(c.n, { sz: n === 4 ? 30 : 34, color: c.t })) });
      S.xml += S.grp(`opt${i}`, x, gy, cw, gh, kids);
      fx.push({ n: `opt${i}`, e: "pop", d: 1900 + i * 450, t: 600, s: "pop" });
      if (i === d.correct) { correctName = `opt${i}`; cxCorrect = x + cw / 2; cyCorrect = gy + gh / 2; }
    });
    S.xml += S.box("hint", { x: 3.2, y: 6.78, w: 6.93, h: 0.55, adj: 50000, fill: "FFFFFF", line: GOLD, lw: 3, paras: para(txRun("Các con chọn đáp án theo MÀU nhé!", { sz: 20, color: BROWN })) });
    fx.push({ n: "hint", e: "fade", d: 1900 + n * 450 + 200, t: 500 });
    d._geom = { cxCorrect, cyCorrect };
  } else {
    // sequencing question: three coloured rows, each with the four steps in some order
    const rx = 0.87, rw = 11.6, rh = 1.45, rys = [2.65, 4.2, 5.75];
    d.opts.forEach(([ck, order], i) => {
      const c = COL[ck], y = rys[i];
      let kids = S.box(`card${i}`, { x: rx, y, w: rw, h: rh, adj: 14000, fill: "FFFFFF", alpha: 97000, line: c.c, lw: 6 });
      kids += S.box(`chip${i}`, { x: rx + 0.12, y: y + 0.12, w: 2.1, h: rh - 0.24, adj: 30000, fill: c.c, line: "FFFFFF", lw: 4, paras: para(txRun(c.n, { sz: 22, color: c.t })) });
      order.forEach((st, k) => {
        const sx = rx + 2.55 + k * 2.2;
        kids += S.fit(`img${i}_${k}`, `step${st}`, sx, y + 0.08, 1.55, 0.98, STEP[st]);
        kids += S.box(`cap${i}_${k}`, { x: sx - 0.2, y: y + 1.07, w: 1.95, h: 0.32, geom: "rect", txBox: true, shadow: false, paras: para(txRun(STEP[st], { sz: 14, color: "37474F", f: "R", b: true }), "ctr", 14) });
        kids += S.box(`no${i}_${k}`, { x: sx - 0.25, y: y + 0.06, w: 0.42, h: 0.42, geom: "ellipse", fill: c.c, line: "FFFFFF", lw: 2, shadow: false, paras: para(txRun(String(k + 1), { sz: 15, color: c.t })) });
        if (k < 3) kids += S.box(`ar${i}_${k}`, { x: sx + 1.6, y: y + 0.4, w: 0.42, h: 0.38, geom: "rightArrow", fill: c.c, line: "FFFFFF", lw: 1.5, shadow: false });
      });
      S.xml += S.grp(`opt${i}`, rx, y, rw, rh, kids);
      fx.push({ n: `opt${i}`, e: "pop", d: 1900 + i * 500, t: 600, s: "pop" });
      if (i === d.correct) { correctName = `opt${i}`; cxCorrect = rx + rw / 2; cyCorrect = y + rh / 2; }
    });
    tCenterY = 4.2; scale = 108000;
    d._geom = { cxCorrect, cyCorrect };
  }
  // ---- reveal decorations (appear on the click)
  let extra = "";
  const bellX = d.seq ? 0.9 : 1.2, bellY = d.seq ? 5.2 : 3.3, bellH = d.seq ? 1.9 : 2.6;
  extra += S.fit("okbell", "bell", bellX, bellY, 2.6, bellH, "Chuông vàng", "center");
  const pillX = d.seq ? 4.3 : (d.opts.length === 3 ? 9.25 : 9.05), pillY = d.seq ? 5.6 : 3.95, pillW = d.seq ? 4.7 : 3.7;
  extra += S.box("ok", { x: pillX, y: pillY, w: pillW, h: 1.05, adj: 50000, fill: "2E9E44", line: "FFFFFF", lw: 5, paras: para(txRun("ĐÚNG RỒI!", { sz: d.seq ? 38 : 36, color: "FFFFFF", ln: "1B5E20" })) });
  const sp = d.seq ? [[9.45, 5.4, 0.95], [11.15, 5.85, 0.8], [12.1, 5.15, 0.65]] : [[pillX - 0.1, pillY - 1.1, 0.95], [pillX + pillW - 0.7, pillY + 1.15, 0.9], [pillX + pillW - 0.4, pillY - 0.85, 0.7]];
  sp.forEach(([sx, sy, sh], k) => (extra += S.fit(`ok_star${k}`, "star", sx, sy, sh, sh, "Ngôi sao")));
  S.xml += extra;
  // ---- reveal timeline = ONE click
  const g = d._geom;
  const dx = ((13.333 / 2) - g.cxCorrect) / 13.333, dy = (tCenterY - g.cyCorrect) / 7.5;
  const rv = [];
  d.opts.forEach((o, i) => {
    if (i !== d.correct) rv.push({ n: `opt${i}`, x: 1, xt: 450, xd: 0 });
  });
  if (!d.seq) rv.push({ n: "hint", x: 1, xt: 400, xd: 0 });
  rv[0].c = true;
  rv.push({ n: correctName, g: { pct: scale, t: 750, dx: dx.toFixed(4), dy: dy.toFixed(4) }, gd: 250, gs: "bells" });
  rv.push({ n: "ok", e: "pop", d: 1000, t: 600, s: "fairywin" });
  rv.push({ n: "okbell", e: "pop", d: 1150, t: 600, l: "wiggle", lo: { amp: 330000, t: 380 } });
  sp.forEach((_, k) => rv.push({ n: `ok_star${k}`, e: "spin", d: 1300 + k * 170, t: 500, s: k === 0 ? "sparkle" : undefined }));
  const notes = [
    `CÂU ${qi + 1}/7 – ${d.q}`,
    `Đáp án đúng: màu ${COL[d.opts[d.correct][0]].name.toUpperCase()} – ${d.ans}.`,
    "Cách bấm “tới” trên bút trình chiếu: slide tự hiện câu hỏi và các đáp án (mỗi đáp án một màu). Cô đọc câu hỏi, các đội thảo luận và chọn MÀU. Bấm “tới” 1 lần để hiện đáp án đúng (đáp án sai mờ đi, đáp án đúng phóng to ra giữa kèm tiếng chuông). Bấm “tới” lần nữa để sang câu tiếp theo.",
    "Các đáp án: " + d.opts.map(([ck, a, label], i) => `${COL[ck].name} = ${d.seq ? a.map((s) => STEP[s]).join(" – ") : label}${i === d.correct ? " (ĐÚNG)" : ""}`).join("; ") + ".",
  ];
  finish(S, TRANS.ripple, [...fx, ...rv], notes);
}


function sequenceSlide(file, no) {
  const d = Q[6], S = new SlideB(file, no);
  S.xml += header(S, "RUNG CHUÔNG VÀNG", 36, "CÂU 7/7");
  S.xml += S.box("banner", { x: 0.9, y: 1.5, w: 11.53, h: 0.85, adj: 50000, fill: "FFFFFF", line: BROWN, lw: 4, paras: para(txRun(d.q, { sz: 25, color: "5D3A00" })) });
  S.xml += S.fit("bigbell", "bell", 4.6, 2.65, 4.1, 3.5, "Chuông vàng", "center");
  S.xml += S.box("hint", { x: 3.2, y: 6.45, w: 6.93, h: 0.7, adj: 50000, fill: "FFFFFF", line: GOLD, lw: 3, paras: para(txRun("Các con cùng suy nghĩ nhé!", { sz: 26, color: BROWN })) });
  S.xml += S.box("ans", { x: 5.17, y: 2.5, w: 3.0, h: 0.7, adj: 50000, fill: "2E9E44", line: "FFFFFF", lw: 4, paras: para(txRun("ĐÁP ÁN", { sz: 28, color: "FFFFFF", ln: "1B5E20" })) });
  const cols = ["8D6E63", "43A047", "8E24AA", "F29E02"];
  const cw = 2.6, gap = 0.6, x0 = (13.333 - (4 * cw + 3 * gap)) / 2, cy = 3.6, ch = 3.1;
  for (let i = 0; i < 4; i++) {
    const x = x0 + i * (cw + gap), st = i + 1;
    let kids = S.box(`stpCard${i}`, { x, y: cy, w: cw, h: ch, adj: 9000, fill: "FFFFFF", alpha: 97000, line: cols[i], lw: 6 });
    kids += S.fit(`stpImg${i}`, `step${st}`, x + 0.12, cy + 0.5, cw - 0.24, ch - 1.2, STEP[st]);
    kids += S.box(`stpCap${i}`, { x: x + 0.05, y: cy + ch - 0.7, w: cw - 0.1, h: 0.6, geom: "rect", txBox: true, shadow: false, paras: para(txRun(STEP[st], { sz: 24, color: cols[i] })) });
    kids += S.box(`stpNo${i}`, { x: x - 0.12, y: cy - 0.36, w: 0.85, h: 0.85, geom: "ellipse", fill: cols[i], line: "FFFFFF", lw: 4, paras: para(txRun(String(st), { sz: 30, color: "FFFFFF" })) });
    S.xml += S.grp(`stp${i}`, x - 0.12, cy - 0.36, cw + 0.12, ch + 0.36, kids);
    if (i < 3) S.xml += S.box(`arr${i}`, { x: x + cw + 0.07, y: cy + 1.2, w: 0.46, h: 0.5, geom: "rightArrow", fill: GOLD, line: "FFFFFF", lw: 2, shadow: false });
  }
  const stars = [[0.35, 2.55, 0.8], [12.2, 2.55, 0.8], [6.3, 6.85, 0.55]];
  stars.forEach(([sx, sy, sh], k) => (S.xml += S.fit(`ok_star${k}`, "star", sx, sy, sh, sh, "Ngôi sao")));
  const fx = [...headerFx(true),
    { n: "banner", e: "pop", d: 1300, t: 700, s: "sparkle" },
    { n: "bigbell", e: "pop", d: 1900, t: 700, l: "wiggle", lo: { amp: 280000, t: 450 } },
    { n: "hint", e: "fade", d: 2500, t: 500 }];
  const rv = [{ n: "bigbell", x: 1, xt: 450, xd: 0, c: true }, { n: "hint", x: 1, xt: 400, xd: 0 },
    { n: "ans", e: "pop", d: 500, t: 600, s: "sparkle" }];
  for (let i = 0; i < 4; i++) {
    rv.push({ n: `stp${i}`, e: "pop", d: 1000 + i * 800, t: 650, s: "pop" });
    if (i < 3) rv.push({ n: `arr${i}`, e: "wipe", d: 1650 + i * 800, t: 400 });
  }
  stars.forEach((_, k) => rv.push({ n: `ok_star${k}`, e: "spin", d: 4300 + k * 170, t: 500, s: k === 0 ? "fairywin" : undefined }));
  const notes = [
    `CÂU 7/7 – ${d.q}`,
    "Câu này không có đáp án để chọn theo màu: slide chỉ hiện câu hỏi. Cô hỏi các cháu (miệng) – các cháu trả lời.",
    "Bấm “tới” 1 lần để hiện đáp án: Làm đất → Gieo trồng → Chăm sóc → Thu hoạch (bốn bước lần lượt hiện ra kèm số thứ tự). Bấm “tới” lần nữa để sang slide tiếp theo.",
  ];
  finish(S, TRANS.ripple, [...fx, ...rv], notes);
}

function introSlide(file, no) {
  const S = new SlideB(file, no);
  S.xml += header(S, "TRÒ CHƠI 1", 40, null);
  S.xml += S.box("topic", { x: 3.37, y: 1.55, w: 6.6, h: 0.72, adj: 50000, fill: "FFFFFF", line: BROWN, lw: 4, paras: para(txRun("RUNG CHUÔNG VÀNG", { sz: 28, color: "B26A00" })) });
  S.xml += S.fit("bigbell", "bell", 0.7, 2.45, 4.3, 3.7, "Chuông vàng", "center");
  const chips = [["red", 0.65, 6.05], ["purple", 3.0, 6.05], ["green", 0.65, 6.7], ["yellow", 3.0, 6.7]];
  chips.forEach(([ck, x, y], i) => (S.xml += S.box(`chip${i}`, { x, y, w: 2.3, h: 0.6, adj: 50000, fill: COL[ck].c, line: "FFFFFF", lw: 3, paras: para(txRun(COL[ck].n, { sz: 22, color: COL[ck].t })) })));
  const card = (name, y, h, title, text, col) => {
    let x = S.box(`${name}Card`, { x: 5.4, y, w: 7.4, h, adj: 8000, fill: "FFFFFF", alpha: 97000, line: col, lw: 5 });
    x += S.box(`${name}Title`, { x: 5.75, y: y + 0.15, w: 6.7, h: 0.5, geom: "rect", txBox: true, shadow: false, paras: para(txRun(title, { sz: 22, color: col }), "l", 22) });
    x += S.box(`${name}Text`, { x: 5.75, y: y + 0.7, w: 6.75, h: h - 0.85, geom: "rect", txBox: true, shadow: false, anchor: "t", paras: para(txRun(text, { sz: 18, color: "37474F", f: "R", b: true }), "l", 18) });
    return x;
  };
  S.xml += card("how", 2.55, 2.3, "CÁCH CHƠI", "Cô đọc câu hỏi, trên màn hình hiện ra các đáp án. Mỗi đáp án có một màu riêng: đỏ, tím, xanh lá, vàng. Các đội thảo luận rồi chọn đáp án theo màu.", "E65100");
  S.xml += card("rule", 5.05, 1.95, "LUẬT CHƠI", "Có 7 câu hỏi về nghề nông. Đội nào trả lời đúng thì được rung chuông vàng! Câu 7 cô hỏi, các con cùng trả lời rồi cô hiện đáp án.", "2E7D32");
  const fx = [...headerFx(false),
    { n: "topic", e: "pop", d: 1200, t: 600, s: "pop2" },
    { n: "bigbell", e: "pop", d: 1500, t: 700, l: "wiggle", lo: { amp: 300000, t: 420 }, s: "bells" },
    ...chips.map((_, i) => ({ n: `chip${i}`, e: "pop", d: 2300 + i * 300, t: 500, s: "pop" })),
    { n: "howCard", e: "flyR", d: 2000, t: 800 }, { n: "howTitle", e: "fade", d: 2500, t: 400 }, { n: "howText", e: "fade", d: 2700, t: 500 },
    { n: "ruleCard", e: "flyR", d: 3300, t: 800 }, { n: "ruleTitle", e: "fade", d: 3800, t: 400 }, { n: "ruleText", e: "fade", d: 4000, t: 500 },
  ];
  const notes = [
    "TRÒ CHƠI 1: RUNG CHUÔNG VÀNG",
    "Gồm 7 câu hỏi về nghề nông. Câu 1–6: mỗi câu hiện 3–4 đáp án bằng hình ảnh, mỗi đáp án một màu (đỏ, tím, xanh lá, vàng) để trẻ chọn theo màu; bấm “tới” 1 lần để hiện đáp án đúng (phóng to kèm tiếng chuông), bấm “tới” lần nữa để sang câu sau. Câu 7: chỉ hiện câu hỏi, cô hỏi miệng rồi bấm “tới” để hiện đáp án.",
    "Câu 1: Đâu là hình ảnh bác nông dân? – Câu 2: Nơi làm việc của bác nông dân? – Câu 3: Bác nông dân làm công việc gì? – Câu 4: Ngoài trồng trọt, bác nông dân còn làm công việc gì? – Câu 5: Đâu là dụng cụ nghề nông? – Câu 6: Đâu là sản phẩm nghề nông? – Câu 7: Hãy sắp xếp quy trình trồng trọt của bác nông dân.",
    "Phần “Cách chơi” và “Luật chơi” trên slide là gợi ý – cô có thể chỉnh lại cho phù hợp (cách trẻ chọn màu: giơ thẻ màu, chạy về vòng màu hoặc chỉ tay vào màu...).",
  ];
  finish(S, TRANS.vortex, fx, notes);
}

// ------------------------------------------------------------------ main
const run = (...a) => execFileSync("python", [`${SK}/add_slide.py`, "un/", ...a], { encoding: "utf8" });
const created = [];
let after = "slide10.xml";                       // "Phần 2: Nhà nông thi tài"
for (let i = 0; i < 8; i++) {
  const out = run("slide9.xml", "--after", after);
  const m = out.match(/Created ppt\/slides\/(slide(\d+)\.xml)/);
  created.push({ file: m[1], no: +m[2] });
  after = m[1];
}
console.log("new slides:", created.map((c) => c.file).join(", "));
introSlide(created[0].file, created[0].no);
for (let qi = 0; qi < 6; qi++) questionSlide(created[qi + 1].file, created[qi + 1].no, qi);
sequenceSlide(created[7].file, created[7].no);

// ---- old "Trò chơi 1" (slide12.xml) -> "Trò chơi 2"
{
  let x = rd("ppt/slides/slide12.xml");
  if (!x.includes("<a:t>TRÒ CHƠI 1</a:t>")) throw new Error("ribbon text not found");
  x = x.replace("<a:t>TRÒ CHƠI 1</a:t>", "<a:t>TRÒ CHƠI 2</a:t>");
  wr("ppt/slides/slide12.xml", x);
  const r = rd("ppt/slides/_rels/slide12.xml.rels");
  const np = "ppt/notesSlides/" + r.match(/notesSlides\/(notesSlide\d+\.xml)/)[1];
  let t = rd(np); const t0 = t;
  t = t.replace(/TRÒ CHƠI 1/g, "TRÒ CHƠI 2").replace(/Trò chơi 1/g, "Trò chơi 2").replace(/trò chơi 1/g, "trò chơi 2");
  wr(np, t); console.log("slide12 notes changed:", t !== t0);
}

// ---- slide order, delete slide13 (id 268), sections
{
  let p = rd("ppt/presentation.xml");
  const lst = p.match(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/)[0];
  const ent = [...lst.matchAll(/<p:sldId id="(\d+)" r:id="(rId\d+)"\/>/g)].map((m) => ({ id: m[1], xml: m[0], rid: m[2] }));
  const rels = rd("ppt/_rels/presentation.xml.rels");
  const fileOf = (rid) => rels.match(new RegExp(`<Relationship [^>]*Id="${rid}"[^>]*>`))[0].match(/Target="slides\/(slide\d+\.xml)"/)[1];
  const byFile = Object.fromEntries(ent.map((e) => [fileOf(e.rid), e]));
  const newIds = created.map((c) => byFile[c.file].id);
  const base = ent.map((e) => e.id).filter((id) => id !== "268" && !newIds.includes(id));
  const at = base.indexOf("265");
  const order = [...base.slice(0, at + 1), ...newIds, ...base.slice(at + 1)];
  const byId = Object.fromEntries(ent.map((e) => [e.id, e]));
  p = p.replace(lst, "<p:sldIdLst>" + order.map((id) => byId[id].xml).join("") + "</p:sldIdLst>");
  const sec = (ids) => ids.map((i) => `<p14:sldId id="${i}"/>`).join("");
  const iK = order.indexOf("272");           // "Kết thúc hoạt động" starts the last section
  p = p.replace(/(<p14:section name="Mở đầu"[^>]*><p14:sldIdLst>)[\s\S]*?(<\/p14:sldIdLst>)/, (m, a, b) => a + sec(order.slice(0, 2)) + b)
       .replace(/(<p14:section name="Bài mới"[^>]*><p14:sldIdLst>)[\s\S]*?(<\/p14:sldIdLst>)/, (m, a, b) => a + sec(order.slice(2, iK)) + b)
       .replace(/(<p14:section name="Kết thúc"[^>]*><p14:sldIdLst>)[\s\S]*?(<\/p14:sldIdLst>)/, (m, a, b) => a + sec(order.slice(iK)) + b);
  wr("ppt/presentation.xml", p);
  console.log("order:", order.join(","), "| total", order.length);
}
console.log("done");
