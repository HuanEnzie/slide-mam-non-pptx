// Hoạt động góc — chủ đề Nghề nghiệp (6 slides)
const fs = require("fs");
const path = require("path");
const pptxgen = require(path.join(__dirname, "..", "build", "node_modules", "pptxgenjs"));
const { addMotion } = require("../build/anim");

const ST = path.join(__dirname, "st");
const AUD = path.join(__dirname, "..", "build", "aud");
const OUT = path.join(__dirname, "Hoat-dong-goc.pptx");
const FONT = "Segoe UI Black";
const FONT_B = "Segoe UI";
const W = 13.333;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Hoạt động góc – Chủ đề Nghề nghiệp";
pres.author = "Từ Thị Thảo";
pres.company = "Trường Mầm non Võ Cường";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT_B };

// ---------- helpers ----------
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
function stk(s, name, x, y, h, objectName) {
  const f = path.join(ST, name + ".png");
  const [pw, ph] = pngSize(f);
  s.addImage({ path: f, x, y, w: (h * pw) / ph, h, objectName: objectName || name, altText: name });
}
function fit(s, img, cx, top, maxW, maxH, name) {
  const [pw, ph] = pngSize(path.join(ST, img + ".png"));
  let h = maxH, w = (h * pw) / ph;
  if (w > maxW) { w = maxW; h = (w * ph) / pw; }
  s.addImage({ path: path.join(ST, img + ".png"), x: cx - w / 2, y: top + (maxH - h) / 2, w, h, objectName: name, altText: img });
}
function bg(s, file) { s.addImage({ path: path.join(ST, file), x: 0, y: 0, w: W, h: 7.5, objectName: "bg", altText: "Nền" }); }
const shadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 3, angle: 60, opacity: 0.25 });
const tShadow = () => ({ type: "outer", color: "000000", blur: 3, offset: 2, angle: 50, opacity: 0.3 });
const PAL = ["E53935", "FB8C00", "43A047", "1E88E5", "8E24AA", "EC407A", "00897B"];
function rainbowRuns(text, opts = {}, palette = PAL) {
  const words = text.split(" ");
  return words.map((w, i) => ({ text: w + (i < words.length - 1 ? " " : ""), options: { color: palette[i % palette.length], ...opts } }));
}
function badge(s, name, txt, x, y, d, fill) {
  s.addText(txt, { shape: pres.shapes.OVAL, x, y, w: d, h: d, fill: { color: fill }, line: { color: "FFFFFF", width: 4 }, fontFace: FONT, fontSize: Math.round(d * 34), color: "FFFFFF", align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: name });
}
function pill(s, name, txt, x, y, w, h, fill, size, extra = {}) {
  s.addText(txt, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: h / 2, x, y, w, h, fill: { color: fill }, line: { color: "FFFFFF", width: 3 }, fontFace: FONT, fontSize: size, color: "FFFFFF", align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: name, ...extra });
}
function card(s, name, x, y, w, h, col) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.25, fill: { color: "FFFFFF", transparency: 3 }, line: { color: col, width: 3.5 }, shadow: shadow(), objectName: name });
}
function label(s, text, x, y, w, h, size, color, name, font = FONT_B, align = "center") {
  s.addText(text, { x, y, w, h, fontFace: font, fontSize: size, bold: font === FONT_B, color, align, valign: "middle", margin: 0, isTextBox: true, objectName: name });
}
function bgMusic(s, file) {
  const cover = "data:image/png;base64," + fs.readFileSync(path.join(ST, "i_art.png")).toString("base64");
  s.addMedia({ type: "audio", path: path.join(AUD, "mus", file + ".mp3"), x: 12.62, y: 6.76, w: 0.6, h: 0.6, cover, objectName: "bgmusic" });
}
// ribbon header used on slides 3–5
function header(s, { title, img, fill, edge, decor, size = 40 }) {
  stk(s, "cloud2", 0.35, 0.3, 0.85, "cloud");
  s.addText(title, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.55, x: 3.0, y: 0.25, w: 7.33, h: 1.1, fill: { color: fill }, line: { color: "FFFFFF", width: 4 },
    fontFace: FONT, fontSize: size, color: "FFFFFF", align: "center", valign: "middle", margin: 0, outline: { size: 1.5, color: edge }, shadow: shadow(), objectName: "ribbon",
  });
  stk(s, img, 1.95, 0.02, 1.6, "mascot");
  stk(s, decor[0], decor[1], decor[2], decor[3], "decor");
  return [
    { n: "ribbon", e: "flyT", d: 0, t: 1000, s: "whoosh" },
    { n: "mascot", e: "spin", d: 700, t: 800, l: "wiggle", lo: { amp: 300000, t: 450 }, s: "boing" },
    { n: "cloud", e: "fade", d: 300, t: 700, l: "drift", lo: { amp: 0.03, t: 4000 } },
    { n: "decor", e: "pop", d: 1100, t: 600, l: "drift", lo: { amp: 0.015, dy: -0.025, t: 1800 } },
  ];
}

const specs = [];
const T = {
  curtains: { ns: "p15", el: `<p15:prstTrans prst="curtains"/>`, dur: 2500 },
  ripple: { ns: "p14", el: `<p14:ripple/>`, dur: 1400 },
  curl: { ns: "p15", el: `<p15:prstTrans prst="pageCurlDouble"/>`, dur: 1600 },
  vortex: { ns: "p14", el: `<p14:vortex dir="r"/>`, dur: 2200 },
  airplane: { ns: "p15", el: `<p15:prstTrans prst="airplane"/>`, dur: 2000 },
  glitter: { ns: "p14", el: `<p14:glitter dir="l" pattern="hexagon"/>`, dur: 2000 },
};

// ================= 1 — Chào mừng =================
pres.addSection({ title: "Mở đầu" });
{
  const s = pres.addSlide({ sectionTitle: "Mở đầu" });
  bg(s, "bg_garden.jpg");
  stk(s, "sun2", 0.25, 0.12, 1.55, "sun");
  stk(s, "cloud2", 11.0, 0.3, 1.0, "cloud");
  s.addText(
    [{ text: "UBND PHƯỜNG VÕ CƯỜNG", options: { fontSize: 16, color: "1565C0", breakLine: true } }, { text: "TRƯỜNG MẦM NON VÕ CƯỜNG", options: { fontSize: 22, color: "D32F2F" } }],
    { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.5, x: 3.67, y: 0.2, w: 6.0, h: 1.0, fill: { color: "FFFFFF", transparency: 8 }, line: { color: "FFB300", width: 3 }, fontFace: FONT, align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: "header" }
  );
  s.addText(rainbowRuns("Chào mừng các cô về dự hội giảng và thăm lớp"), { x: 0.9, y: 1.28, w: 11.53, h: 0.8, fontFace: FONT, fontSize: 30, align: "center", valign: "middle", outline: { size: 2.5, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "welcome" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.1, y: 2.25, w: 7.13, h: 4.75, rectRadius: 0.35, fill: { color: "FFFFFF", transparency: 8 }, line: { color: "66BB6A", width: 4, dashType: "dash" }, shadow: shadow(), objectName: "card" });
  pill(s, "tag", "Hoạt động", 5.42, 2.45, 2.5, 0.5, "FF7043", 16);
  s.addText(rainbowRuns("HOẠT ĐỘNG GÓC", {}, ["E53935", "43A047", "1E88E5"]), { x: 3.25, y: 2.98, w: 6.83, h: 1.05, fontFace: FONT, fontSize: 44, align: "center", valign: "middle", margin: 0, shadow: tShadow(), isTextBox: true, objectName: "title" });
  const rows = [
    ["star", "Chủ đề: ", "Nghề nghiệp", "F29E02"],
    ["bee", "Lớp: ", "5 – 6 tuổi số 1", "E53935"],
    ["ladybug", "Giáo viên: ", "Từ Thị Thảo", "EC407A"],
    ["wheelbarrow", "Đơn vị thực hiện: ", "Trường Mầm non Võ Cường", "2E9E44"],
  ];
  rows.forEach(([ic, lab, val, col], i) => {
    const y = 4.28 + i * 0.64;
    fit(s, ic, 3.83, y, 0.6, 0.5, "ic" + i);
    s.addText([{ text: lab, options: { bold: true, color: col } }, { text: val, options: { bold: true, color: "37474F" } }], { x: 4.25, y, w: 5.85, h: 0.5, fontFace: FONT_B, fontSize: 19, valign: "middle", margin: 0, isTextBox: true, objectName: "row" + i });
  });
  stk(s, "girl2", 0.3, 2.85, 3.9, "girl");
  stk(s, "boy2", 10.35, 2.85, 3.9, "boy");
  stk(s, "bee", 2.2, 2.0, 0.75, "bee");
  s.addNotes("Slide chào mừng – Hoạt động góc, chủ đề Nghề nghiệp. Hiệu ứng tự chạy khi mở slide, không cần bấm chuột.");
  specs.push({
    trans: T.curtains, snd: "sweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 1000, l: "spin" },
      { n: "cloud", e: "fade", d: 0, t: 800, l: "drift", lo: { amp: 0.04, t: 4000 } },
      { n: "header", e: "flyT", d: 200, t: 1100, s: "whoosh" },
      { n: "girl", e: "flyL", d: 600, t: 1000, l: "bob", s: "girl" },
      { n: "boy", e: "flyR", d: 1400, t: 1000, l: "bob", lo: { t: 1000 }, s: "hiya" },
      { n: "welcome", e: "pop", d: 1200, t: 800 },
      { n: "card", e: "zoom", d: 1800, t: 600 },
      { n: "tag", e: "pop", d: 2300, t: 500 },
      { n: "title", e: "pop", d: 2600, t: 800, l: "pulse", lo: { amp: 105000, t: 900 }, s: "sparkle" },
      ...rows.flatMap((_, i) => [{ n: "ic" + i, e: "spin", d: 3300 + i * 300, t: 500, s: "pop" }, { n: "row" + i, e: "flyR", d: 3300 + i * 300, t: 600 }]),
      { n: "bee", e: "pop", d: 1500, t: 600, l: "drift", lo: { amp: 0.03, dy: -0.04, t: 1600 } },
    ],
  });
}

// ================= 2 — Ổn định tổ chức =================
{
  const s = pres.addSlide({ sectionTitle: "Mở đầu" });
  bg(s, "bg_garden.jpg");
  stk(s, "sun2", 0.3, 0.2, 1.35, "sun");
  stk(s, "bee", 10.6, 0.5, 1.1, "bee");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.9, y: 1.4, w: 7.53, h: 3.0, rectRadius: 0.6, fill: { color: "FFFFFF", transparency: 6 }, line: { color: "FFCA28", width: 5 }, shadow: shadow(), objectName: "panel" });
  badge(s, "badge", "1", 2.4, 0.9, 1.3, "E53935");
  s.addText([{ text: "Ổn định ", options: { color: "E53935" } }, { text: "tổ chức", options: { color: "1E88E5" } }], { x: 3.1, y: 1.7, w: 7.13, h: 1.2, fontFace: FONT, fontSize: 54, align: "center", valign: "middle", margin: 0, shadow: tShadow(), isTextBox: true, objectName: "title" });
  pill(s, "sub", "Gây hứng thú", 4.67, 3.1, 4.0, 0.9, "FF8F00", 32);
  stk(s, "girl2", 0.45, 3.35, 3.8, "girl");
  stk(s, "boy2", 10.3, 3.4, 3.75, "boy");
  stk(s, "wheelbarrow", 4.3, 5.0, 1.95, "wheel");
  stk(s, "scarecrow", 7.6, 4.55, 2.5, "scare");
  s.addNotes("Ổn định tổ chức – gây hứng thú: cô và trẻ hát bài “Lớn lên cháu lái máy cày” hoặc trò chuyện về nghề nông, khu vườn của bác nông dân và các sản phẩm nghề nông. Cô giới thiệu: hôm nay lớp mình có các góc chơi về chủ đề Nghề nghiệp.");
  specs.push({
    trans: T.ripple, snd: "magicsweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 900, l: "spin" },
      { n: "panel", e: "zoom", d: 200, t: 600 },
      { n: "badge", e: "spin", d: 600, t: 800, l: "pulse", lo: { amp: 112000, t: 500 }, s: "boing" },
      { n: "title", e: "pop", d: 900, t: 800, s: "sparkle" },
      { n: "sub", e: "flyB", d: 1500, t: 800, l: "wiggle", lo: { amp: 240000, t: 400 }, s: "pop2" },
      { n: "girl", e: "flyL", d: 1900, t: 900, l: "bob" },
      { n: "boy", e: "flyR", d: 2100, t: 900, l: "bob", lo: { t: 1000 } },
      { n: "wheel", e: "flyL", d: 2600, t: 1200, l: "wiggle", lo: { amp: 150000, t: 300 }, s: "boing" },
      { n: "scare", e: "pop", d: 3200, t: 600, l: "wiggle", lo: { amp: 240000, t: 700 }, s: "laugh" },
      { n: "bee", e: "pop", d: 3600, t: 600, l: "drift", lo: { amp: 0.03, dy: -0.03, t: 900 }, s: "chirp" },
    ],
  });
}

// ================= 3 — Thỏa thuận chơi =================
pres.addSection({ title: "Hoạt động góc" });
const corners = [
  ["i_build", "pl_build", "pd_build", "Góc xây dựng", "Xây khu vườn của bác nông dân", "8D6E63", "Khu vườn bác nông dân"],
  ["i_shop", "pl_shop", "pd_shop", "Góc phân vai", "Cửa hàng bán nông sản", "E53935", "Cửa hàng nông sản"],
  ["i_art", "pl_art", "pd_art", "Góc nghệ thuật", "Sáng tạo tranh từ nông sản", "8E24AA", "Tranh từ nông sản"],
  ["i_book", "pl_book", "pd_book", "Góc học tập", "Làm album chủ đề nghề nghiệp", "1E88E5", "Album nghề nghiệp"],
];
{
  const s = pres.addSlide({ sectionTitle: "Hoạt động góc" });
  bg(s, "bg_soft.jpg");
  const fx = header(s, { title: "THỎA THUẬN CHƠI", img: "girl2", fill: "2E9E44", edge: "1B5E20", decor: ["bee", 11.6, 0.3, 0.95] });
  corners.forEach(([ic, , , name, act, col], k) => {
    const x = 0.59 + k * 3.1, y = 1.6, cx = x + 1.425;
    card(s, "c" + k, x, y, 2.85, 3.25, col);
    fit(s, ic, cx, y + 0.12, 2.45, 1.5, "ci" + k);
    label(s, name, x + 0.08, y + 1.7, 2.69, 0.46, 20, col, "cn" + k, FONT);
    label(s, act, x + 0.15, y + 2.18, 2.55, 0.9, 16, "37474F", "ca" + k);
    fx.push(
      { n: "c" + k, e: "zoom", d: 0, t: 450, c: true, s: "bells" },
      { n: "ci" + k, e: "spin", d: 200, t: 600, l: "bob", lo: { amp: 0.008, t: 1100 } },
      { n: "cn" + k, e: "flyB", d: 500, t: 500 },
      { n: "ca" + k, e: "fade", d: 700, t: 400 }
    );
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.59, y: 5.05, w: 12.15, h: 1.6, rectRadius: 0.3, fill: { color: "FFFFFF", transparency: 3 }, line: { color: "FB8C00", width: 3.5, dashType: "dash" }, shadow: shadow(), objectName: "rules" });
  label(s, "Khi chơi,\nbé nhớ nhé!", 0.75, 5.2, 2.35, 1.3, 22, "E65100", "rulesT", FONT);
  const rules = [["r_hug", "Chơi đoàn kết"], ["r_share", "Không tranh giành"], ["r_shh", "Nói nhỏ nhẹ"], ["r_tidy", "Cất đồ chơi gọn gàng"]];
  fx.push({ n: "rules", e: "zoom", d: 0, t: 500, c: true, s: "positive" }, { n: "rulesT", e: "pop", d: 300, t: 500 });
  rules.forEach(([ic, txt], j) => {
    const cx = 4.2 + j * 2.34;
    fit(s, ic, cx, 5.12, 1.6, 1.05, "ri" + j);
    label(s, txt, cx - 1.18, 6.18, 2.36, 0.4, 15, "37474F", "rl" + j);
    fx.push({ n: "ri" + j, e: "pop", d: 700 + j * 450, t: 500, s: "pop" }, { n: "rl" + j, e: "fade", d: 850 + j * 450, t: 400 });
  });
  s.addNotes(
    "THỎA THUẬN CHƠI. Mỗi lần bấm chuột hiện 1 góc chơi (4 lần), lần thứ 5 hiện “Khi chơi, bé nhớ nhé!”.\n" +
    "Góc xây dựng: xây khu vườn của bác nông dân (hàng rào, luống rau, cây ăn quả, ngôi nhà). Góc phân vai: cửa hàng bán nông sản (người bán – người mua, sắp xếp rau củ quả, trứng, sữa). Góc nghệ thuật: sáng tạo tranh từ nông sản (dán hạt gạo, đậu xanh, đậu đỏ, ngô hạt). Góc học tập: làm album chủ đề nghề nghiệp (cắt, dán tranh các nghề).\n" +
    "Gợi ý hỏi trẻ: Con thích chơi ở góc nào? Ở góc đó con sẽ chơi gì? Con chơi với bạn nào? Khi chơi con cần nhớ điều gì?"
  );
  specs.push({ trans: T.curl, snd: "whoosh", fx });
}

// ================= 4 — Quá trình chơi =================
{
  const s = pres.addSlide({ sectionTitle: "Hoạt động góc" });
  bg(s, "bg_soft.jpg");
  const fx = header(s, { title: "QUÁ TRÌNH CHƠI", img: "boy2", fill: "1E88E5", edge: "0D47A1", decor: ["ladybug", 11.6, 0.35, 0.85] });
  corners.forEach(([, pl, , name, act, col], k) => {
    const x = k % 2 ? 6.83 : 0.6, y = k < 2 ? 1.6 : 4.2;
    card(s, "p" + k, x, y, 5.9, 2.42, col);
    fit(s, pl, x + 1.6, y + 0.12, 2.95, 2.18, "pi" + k);
    label(s, name, x + 3.15, y + 0.55, 2.65, 0.5, 21, col, "pn" + k, FONT, "left");
    label(s, act, x + 3.15, y + 1.08, 2.6, 0.85, 16, "37474F", "pa" + k, FONT_B, "left");
    fx.push(
      { n: "p" + k, e: "zoom", d: 1700 + k * 650, t: 500, s: "pop" },
      { n: "pi" + k, e: "pop", d: 1950 + k * 650, t: 600, l: "bob", lo: { amp: 0.006, t: 1300 + k * 150 } },
      { n: "pn" + k, e: "flyR", d: 2150 + k * 650, t: 500 },
      { n: "pa" + k, e: "fade", d: 2350 + k * 650, t: 400 }
    );
  });
  bgMusic(s, "goc_play");
  s.addNotes(
    "QUÁ TRÌNH CHƠI. Các góc tự hiện lần lượt khi mở slide; nhạc nền nhẹ (“Owies Ukulele” – Mixkit) tự phát và lặp lại – bấm biểu tượng ở góc phải dưới để tạm dừng/phát tiếp.\n" +
    "Cô bao quát, đến từng góc gợi ý, nhập vai chơi cùng trẻ: Góc xây dựng – Bác nông dân trồng gì trong vườn? Hàng rào xây thế nào? Góc phân vai – Cô mua 1 bó rau, bao nhiêu tiền? Góc nghệ thuật – Con dùng hạt gì để làm bông lúa? Góc học tập – Đây là nghề gì? Con dán tranh nghề nào vào album?\n" +
    "Khuyến khích trẻ liên kết các góc: cửa hàng nông sản nhập rau từ khu vườn, tranh từ nông sản được đưa vào album nghề nghiệp."
  );
  specs.push({ trans: T.vortex, snd: "whoosh", fx, music: { file: "goc_play", vol: 0.4 } });
}

// ================= 5 — Nhận xét kết quả chơi =================
{
  const s = pres.addSlide({ sectionTitle: "Hoạt động góc" });
  bg(s, "bg_harvest.jpg");
  const fx = header(s, { title: "NHẬN XÉT KẾT QUẢ CHƠI", img: "medal", fill: "FB8C00", edge: "A64600", decor: ["star", 11.6, 0.25, 1.0], size: 32 });
  corners.forEach(([, , pd, , , col, prod], k) => {
    const x = 0.59 + k * 3.1, y = 1.6, cx = x + 1.425;
    card(s, "r" + k, x, y, 2.85, 3.55, col);
    fit(s, pd, cx, y + 0.12, 2.5, 1.9, "rp" + k);
    label(s, prod, x + 0.1, y + 2.08, 2.65, 0.75, 18, col, "rn" + k, FONT);
    fx.push(
      { n: "r" + k, e: "zoom", d: 0, t: 450, c: true, s: "pop2" },
      { n: "rp" + k, e: "pop", d: 250, t: 600 },
      { n: "rn" + k, e: "flyB", d: 500, t: 500 }
    );
    for (let j = 0; j < 3; j++) {
      stk(s, "star", cx - 0.95 + j * 0.65, y + 2.9, 0.52, `rs${k}${j}`);
      fx.push({ n: `rs${k}${j}`, e: "spin", d: 900 + j * 300, t: 450, s: j === 2 ? "fairywin" : undefined });
    }
  });
  pill(s, "praise", "Cả lớp cùng khen: Bé chơi ngoan – Bé sáng tạo giỏi!", 2.4, 5.4, 8.53, 0.78, "E53935", 22);
  stk(s, "medal", 1.45, 5.15, 1.3, "medal2");
  fx.push(
    { n: "praise", e: "pop", d: 0, t: 600, c: true, l: "pulse", lo: { amp: 104000, t: 700 }, s: "applause" },
    { n: "medal2", e: "spin", d: 300, t: 700, l: "wiggle", lo: { amp: 300000, t: 400 } }
  );
  s.addNotes(
    "NHẬN XÉT KẾT QUẢ CHƠI. Bấm chuột 4 lần để hiện sản phẩm từng góc (mỗi góc có 3 ngôi sao), lần thứ 5 hiện lời khen cả lớp kèm tiếng vỗ tay. Cô có thể chèn ảnh chụp sản phẩm thật của trẻ đè lên hình minh họa.\n" +
    "Cô cùng trẻ đi tham quan các góc: mời “kỹ sư” góc xây dựng giới thiệu khu vườn của bác nông dân; “người bán hàng” kể đã bán được những nông sản gì; trẻ góc nghệ thuật giới thiệu bức tranh làm từ hạt gì; trẻ góc học tập giới thiệu album có những nghề nào.\n" +
    "Cô nhận xét, tuyên dương trẻ chơi đoàn kết, sáng tạo; nhắc nhở nhẹ nhàng; cho trẻ cất dọn đồ chơi gọn gàng."
  );
  specs.push({ trans: T.airplane, snd: "whoosh", fx });
}

// ================= 6 — Kết thúc =================
pres.addSection({ title: "Kết thúc" });
{
  const s = pres.addSlide({ sectionTitle: "Kết thúc" });
  bg(s, "bg_garden.jpg");
  stk(s, "sun2", 0.3, 0.2, 1.45, "sun");
  stk(s, "cloud2", 11.0, 0.35, 1.0, "cloud");
  [5.6, 6.45, 7.3].forEach((x, i) => stk(s, "star", x - 0.3, 0.45 + (i === 1 ? -0.15 : 0), i === 1 ? 0.95 : 0.75, "st" + i));
  s.addText(rainbowRuns("Cảm ơn các cô!", {}, ["E53935", "FB8C00", "43A047", "1E88E5"]), { x: 1.5, y: 1.75, w: 10.33, h: 1.4, fontFace: FONT, fontSize: 66, align: "center", valign: "middle", margin: 0, outline: { size: 3, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "title" });
  s.addText("Chúc các cô sức khỏe – Chúc các bé chăm ngoan, học giỏi!", { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.45, x: 1.67, y: 3.3, w: 10.0, h: 0.9, fill: { color: "FFFFFF", transparency: 8 }, line: { color: "FF8F00", width: 3 }, fontFace: FONT_B, fontSize: 22, bold: true, color: "E65100", align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: "wish" });
  stk(s, "girl2", 0.8, 4.35, 3.0, "girl");
  stk(s, "wheelbarrow", 3.55, 5.25, 1.9, "wheel");
  stk(s, "scarecrow", 7.85, 4.45, 2.75, "scare");
  stk(s, "boy2", 10.45, 4.35, 3.0, "boy");
  stk(s, "bee", 1.6, 1.5, 0.6, "bee");
  s.addNotes("Kết thúc hoạt động: cô nhận xét chung, cho trẻ cất dọn đồ chơi và chuyển hoạt động.");
  specs.push({
    trans: T.glitter, snd: "sweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 900, l: "spin" },
      { n: "cloud", e: "fade", d: 0, t: 800, l: "drift", lo: { amp: 0.04, t: 4000 } },
      ...[0, 1, 2].map((i) => ({ n: "st" + i, e: "spin", d: 300 + i * 250, t: 600, l: "pulse", lo: { amp: 110000, t: 500 + i * 100 }, s: i === 2 ? "fairywin" : undefined })),
      { n: "title", e: "pop", d: 1300, t: 900, l: "pulse", lo: { amp: 106000, t: 700 }, s: "applause" },
      { n: "wish", e: "flyB", d: 2000, t: 800 },
      { n: "girl", e: "flyB", d: 2600, t: 700, l: "bob", s: "girl" },
      { n: "wheel", e: "flyB", d: 3100, t: 700, l: "wiggle", lo: { amp: 150000, t: 300 }, s: "boing" },
      { n: "scare", e: "flyB", d: 3500, t: 700, l: "wiggle", lo: { amp: 240000, t: 700 }, s: "laugh" },
      { n: "boy", e: "flyB", d: 3900, t: 700, l: "bob", lo: { t: 1000 }, s: "hiya" },
      { n: "bee", e: "appear", d: 4400, s: "chirp", l: "across", ld: 4400, lo: { from: -0.2, to: 0.95, dy: -0.03, t: 9000 } },
    ],
  });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await addMotion(OUT, specs, path.join(AUD, "wav"));
  console.log("wrote", OUT);
})();
