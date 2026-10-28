// Edit the unpacked v7 deck: Bắp Ngọt slide (slide8.xml) -> 3 farmer pictures; new blank team slide (slide15.xml).
const fs = require("fs");
const path = require("path");
const { buildTiming } = require("../build/anim");

const UN = path.join(__dirname, "un");
const WAV = path.join(__dirname, "..", "build", "aud", "wav");
const E = (inch) => Math.round(inch * 914400);
const rd = (p) => fs.readFileSync(path.join(UN, p), "utf8");
const wr = (p, s) => fs.writeFileSync(path.join(UN, p), s);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function block(xml, name) {
  const re = new RegExp(`<p:(sp|pic)>(?:(?!</p:\\1>).)*?name="${name}"[\\s\\S]*?</p:\\1>`);
  const m = xml.match(re);
  if (!m) throw new Error("no shape " + name);
  return m[0];
}
function removeShapes(xml, test) {
  return xml.replace(/<p:(sp|pic)>[\s\S]*?<\/p:\1>/g, (b) => {
    const n = (b.match(/name="([^"]*)"/) || [])[1];
    return test(n) ? "" : b;
  });
}
const isStep = (n) => /^(c|ci|cn|b|a)\d$/.test(n);
const setXfrm = (b, x, y, w, h) => b.replace(/<a:off x="\d+" y="\d+"\/><a:ext cx="\d+" cy="\d+"\/>/, `<a:off x="${E(x)}" y="${E(y)}"/><a:ext cx="${E(w)}" cy="${E(h)}"/>`);
const setId = (b, id, name) => b.replace(/<p:cNvPr id="\d+" name="[^"]*"/, `<p:cNvPr id="${id}" name="${name}"`);
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }

function sndRels(rels, used) {
  for (const n of used) {
    const media = `ppt/media/sfx_${n}.wav`;
    if (!fs.existsSync(path.join(UN, media))) fs.copyFileSync(path.join(WAV, n + ".wav"), path.join(UN, media));
    if (!rels.includes(`Id="rIdSfx${n}"`))
      rels = rels.replace("</Relationships>", `<Relationship Id="rIdSfx${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/sfx_${n}.wav"/></Relationships>`);
  }
  return rels;
}
function retime(xml, fx, opt) {
  const ids = {}, sp = {};
  for (const m of xml.matchAll(/<p:(sp|pic)>\s*<p:nv(?:Sp|Pic)Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"/g)) { ids[m[3]] = m[2]; sp[m[3]] = m[1] === "sp"; }
  const t = buildTiming(fx, (n) => ids[n], (n) => sp[n], { sndRid: (n) => "rIdSfx" + n, ...opt(ids) });
  return { xml: xml.replace(/<p:timing>[\s\S]*<\/p:timing>/, t), ids };
}
const headerFx = [
  { n: "ribbon", e: "flyT", d: 0, t: 1000, s: "whoosh" },
  { n: "mascot", e: "spin", d: 700, t: 800, l: "wiggle", lo: { amp: 300000, t: 450 }, s: "boing" },
  { n: "cloud", e: "fade", d: 300, t: 700, l: "drift", lo: { amp: 0.03, t: 4000 } },
  { n: "decor", e: "pop", d: 1100, t: 600, l: "drift", lo: { amp: 0.015, dy: -0.025, t: 1800 } },
];

// ---------------- slide 8: Đội Bắp Ngọt ----------------
{
  let x = rd("ppt/slides/slide8.xml");
  let rels = rd("ppt/slides/_rels/slide8.xml.rels");
  const tplCard = block(x, "c0"), tplLabel = block(x, "cn0"), tplPic = block(x, "ci0");
  x = removeShapes(x, isStep);
  x = x.replace("<a:t>Quy trình làm nghề nông: trồng lúa</a:t>", "<a:t>Công việc của bác nông dân</a:t>");

  const items = [
    ["trongtrot", "Trồng trọt", "Trồng lúa, rau, cây ăn quả", "43A047", "splash"],
    ["channuoi", "Chăn nuôi", "Nuôi gà, vịt, lợn, bò", "F29E02", "cluck"],
    ["nongtruong", "Làm ở nông trường", "Cánh đồng lớn, nhiều máy móc", "1E88E5", "tractor"],
  ];
  let nextId = Math.max(...[...x.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => +m[1])) + 1;
  let shapes = "";
  const fx = [...headerFx, { n: "topic", e: "pop", d: 1500, t: 600, s: "pop2" }];
  items.forEach(([img, title, cap, col, snd], g) => {
    const cx0 = 0.6 + g * 4.12;
    // card
    let card = setXfrm(setId(tplCard, nextId++, "w" + g), cx0, 2.42, 3.9, 4.18).replace(/(<a:ln w="\d+"><a:solidFill><a:srgbClr val=")[0-9A-F]{6}/, `$1${col}`);
    card = card.replace(/<a:gd name="adj" fmla="val \d+"\/>/, '<a:gd name="adj" fmla="val 8000"/>');
    // picture fitted into 3.5 x 2.75 box
    const media = `ppt/media/farmer_${img}.png`;
    fs.copyFileSync(path.join(__dirname, "img", `f_${img}.png`), path.join(UN, media));
    rels = rels.replace("</Relationships>", `<Relationship Id="rIdFarm${g}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/farmer_${img}.png"/></Relationships>`);
    const [pw, ph] = pngSize(path.join(UN, media));
    let h = 2.75, w = (h * pw) / ph; if (w > 3.5) { w = 3.5; h = (w * ph) / pw; }
    let pic = setXfrm(setId(tplPic, nextId++, "wi" + g), cx0 + (3.9 - w) / 2, 2.55 + (2.75 - h) / 2, w, h)
      .replace(/descr="[^"]*"/, `descr="${esc(title)}"`).replace(/r:embed="rId\d+"/, `r:embed="rIdFarm${g}"`);
    // title + caption
    const lab = setXfrm(setId(tplLabel, nextId++, "wn" + g), cx0 + 0.1, 5.38, 3.7, 0.5)
      .replace(/sz="1800"/g, 'sz="2200"').replace(/(<a:rPr[^>]*><a:solidFill><a:srgbClr val=")[0-9A-F]{6}/, `$1${col}`)
      .replace(/<a:t>[^<]*<\/a:t>/, `<a:t>${esc(title)}</a:t>`);
    const capS = setXfrm(setId(tplLabel, nextId++, "wc" + g), cx0 + 0.1, 5.9, 3.7, 0.45)
      .replace(/sz="1800"/g, 'sz="1500"').replace(/<a:rPr lang="en-US"/, '<a:rPr lang="en-US" b="1"')
      .replace(/(<a:rPr[^>]*><a:solidFill><a:srgbClr val=")[0-9A-F]{6}/, "$1455A64")
      .replace(/typeface="Segoe UI Black"/g, 'typeface="Segoe UI"')
      .replace(/<a:t>[^<]*<\/a:t>/, `<a:t>${esc(cap)}</a:t>`);
    shapes += card + pic + lab + capS;
    fx.push(
      { n: "w" + g, e: "zoom", d: 0, t: 500, c: true, s: snd },
      { n: "wi" + g, e: "pop", d: 250, t: 600, l: "bob", lo: { amp: 0.008, t: 1200 } },
      { n: "wn" + g, e: "flyB", d: 550, t: 500 },
      { n: "wc" + g, e: "fade", d: 750, t: 400 }
    );
  });
  // keep the music icon on top: insert new shapes before it
  const music = block(x, "bgmusic");
  x = x.replace(music, shapes + music);
  rels = sndRels(rels, ["whoosh", "boing", "pop2", "splash", "cluck", "tractor"]);
  const r = retime(x, fx, (ids) => ({ musicSpid: ids["bgmusic"], musicVol: 0.5 }));
  wr("ppt/slides/slide8.xml", r.xml);
  wr("ppt/slides/_rels/slide8.xml.rels", rels);
  console.log("slide8 ok, shapes:", Object.keys(r.ids).join(","));
}

// ---------------- slide 15 (new, after Bắp Ngọt): blank team slide ----------------
{
  let x = rd("ppt/slides/slide15.xml");
  let rels = rd("ppt/slides/_rels/slide15.xml.rels");
  x = removeShapes(x, (n) => isStep(n) || n === "topic" || n === "bgmusic");
  rels = rels.replace(/<Relationship Id="rId[12]" Type="[^"]*(?:media|audio)" Target="\.\.\/media\/[^"]*\.mp3"\/>/g, "");
  rels = sndRels(rels, ["whoosh", "boing"]);
  const r = retime(x, headerFx, () => ({}));
  wr("ppt/slides/slide15.xml", r.xml);
  wr("ppt/slides/_rels/slide15.xml.rels", rels);
  console.log("slide15 ok, shapes:", Object.keys(r.ids).join(","), "mp3 rels left:", (rels.match(/\.mp3/g) || []).length);
}

// ---------------- section membership for the new slide ----------------
{
  let p = rd("ppt/presentation.xml");
  const newId = p.match(/<p:sldId id="(\d+)" r:id="rId\d+"\/>(?=[\s\S]*<\/p:sldIdLst>)/g);
  const id = Math.max(...[...p.matchAll(/<p:sldId id="(\d+)"/g)].map((m) => +m[1]));
  if (!p.includes(`<p14:sldId id="${id}"/>`)) p = p.replace('<p14:sldId id="263"/>', `<p14:sldId id="263"/><p14:sldId id="${id}"/>`);
  wr("ppt/presentation.xml", p);
  console.log("section: added slide id", id);
}
