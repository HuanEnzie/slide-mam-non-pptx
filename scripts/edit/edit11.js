// v10 -> v11
//  1) slide 4 (3 teams intro): swap "Lúa Vàng" and "Bắp Ngọt" cards (content swap, so entrance order stays left->right)
//  2) new slide (slide16.xml, copy of "Máy móc ngày nay"): realistic GPT photos of farmer + buffalo
//  3) new slide order: Bắp Ngọt(+its blank slide) first, Cải Xanh, NEW photo slide, Máy móc, Lúa Vàng
const fs = require("fs");
const path = require("path");
const { buildTiming } = require("../build/anim");

const UN = path.join(__dirname, "un");
const WAV = path.join(__dirname, "..", "build", "aud", "wav");
const rd = (p) => fs.readFileSync(path.join(UN, p), "utf8");
const wr = (p, s) => fs.writeFileSync(path.join(UN, p), s);
const E = (inch) => Math.round(inch * 914400);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function block(xml, name) {
  const m = xml.match(new RegExp(`<p:(sp|pic)>(?:(?!</p:\\1>).)*?name="${name}"[\\s\\S]*?</p:\\1>`));
  if (!m) throw new Error("no shape " + name);
  return m[0];
}
const setXfrm = (b, x, y, w, h) => b.replace(/<a:off x="-?\d+" y="-?\d+"\/><a:ext cx="\d+" cy="\d+"\/>/, `<a:off x="${E(x)}" y="${E(y)}"/><a:ext cx="${E(w)}" cy="${E(h)}"/>`);
const setId = (b, id, name) => b.replace(/<p:cNvPr id="\d+" name="[^"]*"/, `<p:cNvPr id="${id}" name="${name}"`);

// ============ 1) slide 4: swap Lúa Vàng <-> Bắp Ngọt ============
{
  let x = rd("ppt/slides/slide4.xml");
  const get = (n) => block(x, n);
  const lineColor = (b) => b.match(/<a:ln w="\d+"><a:solidFill><a:srgbClr val="([0-9A-F]{6})"/)[1];
  const runColor = (b) => b.match(/<a:rPr[^>]*><a:solidFill><a:srgbClr val="([0-9A-F]{6})"/)[1];
  const text = (b) => b.match(/<a:t>([^<]*)<\/a:t>/)[1];
  const geo = (b) => { const m = b.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/><a:ext cx="(\d+)" cy="(\d+)"\/>/); return m.slice(1).map(Number); };
  const embed = (b) => b.match(/r:embed="([^"]+)"/)[1];
  const descr = (b) => b.match(/descr="([^"]*)"/)[1];

  const c0 = get("card0"), c2 = get("card2"), l0 = get("lab0"), l2 = get("lab2"), p0 = get("m0"), p2 = get("m2");
  const col0 = lineColor(c0), col2 = lineColor(c2);
  const recolorLine = (b, from, to) => b.replace(`<a:ln w="${b.match(/<a:ln w="(\d+)"/)[1]}"><a:solidFill><a:srgbClr val="${from}"`, `<a:ln w="${b.match(/<a:ln w="(\d+)"/)[1]}"><a:solidFill><a:srgbClr val="${to}"`);
  const newC0 = recolorLine(c0, col0, col2), newC2 = recolorLine(c2, col2, col0);
  const relabel = (b, fromTxt, toTxt, fromCol, toCol) => b.replace(`<a:t>${fromTxt}</a:t>`, `<a:t>${toTxt}</a:t>`).replace(`<a:srgbClr val="${fromCol}"/></a:solidFill><a:latin`, `<a:srgbClr val="${toCol}"/></a:solidFill><a:latin`);
  const newL0 = relabel(l0, text(l0), text(l2), runColor(l0), runColor(l2));
  const newL2 = relabel(l2, text(l2), text(l0), runColor(l2), runColor(l0));
  // pictures: swap image + alt text + own size, re-centre inside the card
  const [g0x, , g0w, g0h] = geo(p0), [g2x, , g2w, g2h] = geo(p2);
  const [c0x, , c0w] = geo(c0), [c2x, , c2w] = geo(c2);
  const y0 = geo(p0)[1];
  const placeNew = (b, otherB, cardX, cardW, otherW, otherH) => {
    const x0 = Math.round(cardX + cardW / 2 - otherW / 2);
    return b.replace(/r:embed="[^"]+"/, `r:embed="${embed(otherB)}"`).replace(/descr="[^"]*"/, `descr="${descr(otherB)}"`)
      .replace(/<a:off x="-?\d+" y="-?\d+"\/><a:ext cx="\d+" cy="\d+"\/>/, `<a:off x="${x0}" y="${y0}"/><a:ext cx="${otherW}" cy="${otherH}"/>`);
  };
  const newP0 = placeNew(p0, p2, c0x, c0w, g2w, g2h);
  const newP2 = placeNew(p2, p0, c2x, c2w, g0w, g0h);
  for (const [o, n] of [[c0, newC0], [c2, newC2], [l0, newL0], [l2, newL2], [p0, newP0], [p2, newP2]]) x = x.replace(o, n);
  wr("ppt/slides/slide4.xml", x);

  let nt = rd("ppt/notesSlides/notesSlide4.xml");
  if (!nt.includes("Lúa Vàng, Cải Xanh, Bắp Ngọt")) throw new Error("notes4 text not found");
  nt = nt.replace("Lúa Vàng, Cải Xanh, Bắp Ngọt", "Bắp Ngọt, Cải Xanh, Lúa Vàng");
  wr("ppt/notesSlides/notesSlide4.xml", nt);
  console.log("slide4 swapped:", text(l0), "<->", text(l2));
}

// ============ 2) new photo slide (slide16.xml) ============
{
  let x = rd("ppt/slides/slide16.xml");
  let rels = rd("ppt/slides/_rels/slide16.xml.rels");
  const tplCard = block(x, "mcard0"), tplName = block(x, "mname0");
  // drop machine cards
  x = x.replace(/<p:(sp|pic)>(?:(?!<\/p:\1>)[\s\S])*?name="(mcard|mimg|mname|muse)\d"[\s\S]*?<\/p:\1>/g, "");
  for (const n of ["mcard0", "mimg0", "mname0", "muse0", "mcard2", "mimg2", "mname2", "muse2"]) if (x.includes(`name="${n}"`)) throw new Error("left over " + n);

  // ribbon + topic
  x = x.replace("<a:t>MÁY MÓC NGÀY NAY</a:t>", "<a:t>BÁC NÔNG DÂN VÀ CHÚ TRÂU</a:t>");
  let ribbon = block(x, "ribbon");
  let newRibbon = ribbon.replace('<a:srgbClr val="1E88E5"/>', '<a:srgbClr val="8D6E63"/>').replace('<a:srgbClr val="0D47A1"/>', '<a:srgbClr val="4E342E"/>').replace(/sz="4000"/g, 'sz="3000"').replace("MÁY MÓC NGÀY NAY", "BÁC NÔNG DÂN VÀ CHÚ TRÂU");
  x = x.replace(ribbon, newRibbon);
  let topic = block(x, "topic");
  const run = topic.match(/<a:p>[\s\S]*?<\/a:p>/)[0].replace("Ngày nay công nghệ phát triển.", "Trâu là người bạn thân thiết của nhà nông").replace(/sz="1900"/g, 'sz="2200"');
  let newTopic = topic.replace(/<a:p>[\s\S]*<\/a:p>/, run).replace(/1565C0/g, "6D4C41");
  newTopic = setXfrm(newTopic, 2.4, 1.52, 8.53, 0.66);
  x = x.replace(topic, newTopic);

  // mascot = buffalo sticker
  fs.copyFileSync(path.join(__dirname, "..", "build", "st", "buffalo.png"), path.join(UN, "ppt/media/buffalo_mascot.png"));
  fs.copyFileSync(path.join(__dirname, "img", "photo1.jpg"), path.join(UN, "ppt/media/photo_plough.jpg"));
  fs.copyFileSync(path.join(__dirname, "img", "photo2.jpg"), path.join(UN, "ppt/media/photo_path.jpg"));
  rels = rels.replace("</Relationships>",
    '<Relationship Id="rIdBuf" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/buffalo_mascot.png"/>' +
    '<Relationship Id="rIdPh1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/photo_plough.jpg"/>' +
    '<Relationship Id="rIdPh2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/photo_path.jpg"/></Relationships>');
  let mascot = block(x, "mascot");
  const bh = 1.45, bw = bh * 561 / 517;
  x = x.replace(mascot, setXfrm(mascot.replace(/r:embed="[^"]+"/, 'r:embed="rIdBuf"').replace(/descr="[^"]*"/, 'descr="buffalo"'), 1.62, 0.0, bw, bh));

  // two photo cards
  let nextId = Math.max(...[...x.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => +m[1])) + 1;
  const cards = [
    { rid: "rIdPh1", col: "43A047", title: "Cày ruộng cùng chú trâu", alt: "Bác nông dân cày ruộng cùng chú trâu", x: 0.7, snd: "splash" },
    { rid: "rIdPh2", col: "F29E02", title: "Dắt trâu ra đồng", alt: "Bác nông dân dắt trâu đi trên bờ ruộng lúc hoàng hôn", x: 6.93, snd: "chirp" },
  ];
  const fx = [
    { n: "ribbon", e: "flyT", d: 0, t: 1000, s: "whoosh" },
    { n: "mascot", e: "spin", d: 700, t: 800, l: "wiggle", lo: { amp: 300000, t: 450 }, s: "boing" },
    { n: "cloud", e: "fade", d: 300, t: 700, l: "drift", lo: { amp: 0.03, t: 4000 } },
    { n: "decor", e: "pop", d: 1100, t: 600, l: "drift", lo: { amp: 0.015, dy: -0.025, t: 1800 } },
    { n: "topic", e: "pop", d: 1500, t: 600, s: "pop2" },
  ];
  let shapes = "";
  const CW = 5.7, CY = 2.4, CH = 4.3, PW = 5.3, PH = PW / 1.5;
  cards.forEach((c, k) => {
    let card = setXfrm(setId(tplCard, nextId++, "pcard" + k), c.x, CY, CW, CH).replace(/(<a:ln w="\d+"><a:solidFill><a:srgbClr val=")[0-9A-F]{6}/, `$1${c.col}`).replace(/<a:gd name="adj" fmla="val \d+"\/>/, '<a:gd name="adj" fmla="val 6000"/>');
    const pic = `<p:pic><p:nvPicPr><p:cNvPr id="${nextId++}" name="pphoto${k}" descr="${esc(c.alt)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>` +
      `<p:blipFill><a:blip r:embed="${c.rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>` +
      `<p:spPr><a:xfrm><a:off x="${E(c.x + (CW - PW) / 2)}" y="${E(CY + 0.17)}"/><a:ext cx="${E(PW)}" cy="${E(PH)}"/></a:xfrm>` +
      `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 5000"/></a:avLst></a:prstGeom></p:spPr></p:pic>`;
    let name = setXfrm(setId(tplName, nextId++, "pname" + k), c.x + 0.1, CY + 0.17 + PH + 0.08, CW - 0.2, 0.46)
      .replace(/sz="2200"/g, 'sz="2200"').replace(/<a:srgbClr val="E53935"\/>/, `<a:srgbClr val="${c.col}"/>`).replace("<a:t>Máy cày</a:t>", `<a:t>${esc(c.title)}</a:t>`);
    shapes += card + pic + name;
    fx.push(
      { n: "pcard" + k, e: "zoom", d: 0, t: 500, c: true, s: c.snd },
      { n: "pphoto" + k, e: "pop", d: 250, t: 700 },
      { n: "pname" + k, e: "flyB", d: 600, t: 500 }
    );
  });
  x = x.replace("</p:spTree>", shapes + "</p:spTree>");

  // sound relationships (only the ones this slide uses)
  const used = [...new Set(fx.map((e) => e.s).filter(Boolean))];
  for (const n of used) {
    if (!rels.includes(`Id="rIdSfx${n}"`)) {
      const media = `ppt/media/sfx_${n}.wav`;
      if (!fs.existsSync(path.join(UN, media))) fs.copyFileSync(path.join(WAV, n + ".wav"), path.join(UN, media));
      rels = rels.replace("</Relationships>", `<Relationship Id="rIdSfx${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/sfx_${n}.wav"/></Relationships>`);
    }
  }
  // rebuild the animation timeline for the new shapes
  const ids = {}, sp = {};
  for (const m of x.matchAll(/<p:(sp|pic)>\s*<p:nv(?:Sp|Pic)Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"/g)) { ids[m[3]] = m[2]; sp[m[3]] = m[1] === "sp"; }
  const t = buildTiming(fx, (n) => ids[n], (n) => sp[n], { sndRid: (n) => "rIdSfx" + n });
  x = x.replace(/<p:timing>[\s\S]*<\/p:timing>/, t);
  // transition: keep the copied one (same style as the "Máy móc" slide)

  // speaker notes for the new slide
  const notesTxt = "BÁC NÔNG DÂN VÀ CHÚ TRÂU – hình ảnh thực tế. Bấm chuột 2 lần: 1) Bác nông dân cày ruộng cùng chú trâu – 2) Bác nông dân dắt trâu ra đồng.\nGợi ý hỏi trẻ: Bác nông dân đang làm gì? Chú trâu giúp bác việc gì? Bác nông dân làm ra những sản phẩm gì cho chúng mình?\nGợi ý chuyển ý: ngày xưa bác nông dân làm việc cùng chú trâu; ngày nay có thêm nhiều máy móc giúp bác (slide tiếp theo).\nHình ảnh do GPT (gpt-image-2) tạo.";
  const nsrc = rd("ppt/notesSlides/notesSlide7.xml");
  const nbody = nsrc.replace(/<a:t>[^<]*<\/a:t>/, `<a:t>${esc(notesTxt)}</a:t>`);
  wr("ppt/notesSlides/notesSlide16.xml", nbody);
  const nrels = rd("ppt/notesSlides/_rels/notesSlide7.xml.rels").replace("../slides/slide7.xml", "../slides/slide16.xml");
  wr("ppt/notesSlides/_rels/notesSlide16.xml.rels", nrels);
  rels = rels.replace("</Relationships>", '<Relationship Id="rIdNotes16" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide16.xml"/></Relationships>');
  let ct = rd("[Content_Types].xml");
  if (!ct.includes("/ppt/notesSlides/notesSlide16.xml"))
    ct = ct.replace("</Types>", '<Override PartName="/ppt/notesSlides/notesSlide16.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/></Types>');
  if (!/Extension="png"/.test(ct)) throw new Error("png content type missing");
  wr("[Content_Types].xml", ct);

  wr("ppt/slides/slide16.xml", x);
  wr("ppt/slides/_rels/slide16.xml.rels", rels);
  console.log("slide16 built; sounds:", used.join(","), "shapes:", Object.keys(ids).join(","));
}

// ============ 3) order + sections ============
{
  let p = rd("ppt/presentation.xml");
  const list = p.match(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/)[0];
  const entries = [...list.matchAll(/<p:sldId id="(\d+)" r:id="(rId\d+)"\/>/g)].map((m) => ({ id: m[1], rid: m[2], xml: m[0] }));
  const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
  // ids: 256 Chào,257 Ổn định,258 Bài mới,259 Phần 1,260 Lúa,261 Cải,262 Máy móc,263 Bắp,270 Bắp(blank),271 NEW photo,264 Quy trình,265..269
  const order = ["256", "257", "258", "259", "263", "270", "261", "271", "262", "260", "264", "265", "266", "267", "268", "269"];
  if (order.length !== entries.length) throw new Error(`order has ${order.length}, deck has ${entries.length}`);
  p = p.replace(list, "<p:sldIdLst>" + order.map((id) => byId[id].xml).join("") + "</p:sldIdLst>");
  const sec = (name, ids) => ids.map((i) => `<p14:sldId id="${i}"/>`).join("");
  const mid = order.slice(2, 15);   // 258 .. 268  (section "Bài mới")
  p = p.replace(/(<p14:section name="Mở đầu"[^>]*><p14:sldIdLst>)[\s\S]*?(<\/p14:sldIdLst>)/, `$1${sec("", order.slice(0, 2))}$2`)
       .replace(/(<p14:section name="Bài mới"[^>]*><p14:sldIdLst>)[\s\S]*?(<\/p14:sldIdLst>)/, `$1${sec("", mid)}$2`)
       .replace(/(<p14:section name="Kết thúc"[^>]*><p14:sldIdLst>)[\s\S]*?(<\/p14:sldIdLst>)/, `$1${sec("", order.slice(15))}$2`);
  wr("ppt/presentation.xml", p);
  console.log("order:", order.join(","), "| Bài mới section has", mid.length, "slides");
}
