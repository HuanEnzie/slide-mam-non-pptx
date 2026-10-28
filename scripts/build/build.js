const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { addMotion } = require("./anim");

const ST = path.join(__dirname, "st");
const OUT = path.join(__dirname, "Kham-pha-nghe-nong.pptx");
const FONT = "Segoe UI Black";
const FONT_B = "Segoe UI";
const W = 13.333;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Khám phá nghề nông";
pres.author = "Từ Thị Thảo";
pres.company = "Trường Mầm non Võ Cường";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT_B };

// ---------- helpers ----------
function pngSize(f) {
  const b = fs.readFileSync(f);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}
function stk(s, name, x, y, h, objectName) {
  const f = path.join(ST, name + ".png");
  const [pw, ph] = pngSize(f);
  const w = (h * pw) / ph;
  s.addImage({ path: f, x, y, w, h, objectName: objectName || name, altText: name });
  return { x, y, w, h };
}
function bg(s, file) {
  s.addImage({ path: path.join(ST, file), x: 0, y: 0, w: W, h: 7.5, objectName: "bg", altText: "Nền" });
}
const shadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 3, angle: 60, opacity: 0.25 });
const tShadow = () => ({ type: "outer", color: "000000", blur: 3, offset: 2, angle: 50, opacity: 0.3 });
const PAL = ["E53935", "FB8C00", "43A047", "1E88E5", "8E24AA", "EC407A", "00897B"];
function rainbowRuns(text, opts = {}, palette = PAL) {
  const words = text.split(" ");
  return words.map((w, i) => ({
    text: w + (i < words.length - 1 ? " " : ""),
    options: { color: palette[i % palette.length], ...opts },
  }));
}
function badge(s, name, txt, x, y, d, fill) {
  s.addText(txt, {
    shape: pres.shapes.OVAL, x, y, w: d, h: d, fill: { color: fill }, line: { color: "FFFFFF", width: 4 },
    fontFace: FONT, fontSize: Math.round(d * 34), color: "FFFFFF", align: "center", valign: "middle",
    margin: 0, shadow: shadow(), objectName: name,
  });
}
function pill(s, name, txt, x, y, w, h, fill, size, extra = {}) {
  s.addText(txt, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: h / 2, x, y, w, h, fill: { color: fill },
    line: { color: "FFFFFF", width: 3 }, fontFace: FONT, fontSize: size, color: "FFFFFF",
    align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: name, ...extra,
  });
}

const specs = [];
const T = {
  curtains: { ns: "p15", el: `<p15:prstTrans prst="curtains"/>`, dur: 2500 },
  ripple: { ns: "p14", el: `<p14:ripple/>`, dur: 1400 },
  honeycomb: { ns: "p14", el: `<p14:honeycomb/>`, dur: 2000 },
  vortex: { ns: "p14", el: `<p14:vortex dir="r"/>`, dur: 2200 },
  curl: { ns: "p15", el: `<p15:prstTrans prst="pageCurlDouble"/>`, dur: 1600 },
  airplane: { ns: "p15", el: `<p15:prstTrans prst="airplane"/>`, dur: 2000 },
  conveyor: { ns: "p14", el: `<p14:conveyor dir="l"/>`, dur: 1600 },
  glitter: { ns: "p14", el: `<p14:glitter dir="l" pattern="hexagon"/>`, dur: 2000 },
};

// ================= SLIDE 1 — Chào mừng =================
pres.addSection({ title: "Mở đầu" });
{
  const s = pres.addSlide({ sectionTitle: "Mở đầu" });
  bg(s, "bg_title.jpg");
  stk(s, "sun", 0.25, 0.15, 1.5);
  stk(s, "cloud", 11.0, 0.3, 1.0);
  s.addText(
    [
      { text: "UBND PHƯỜNG VÕ CƯỜNG", options: { fontSize: 16, color: "1565C0", breakLine: true } },
      { text: "TRƯỜNG MẦM NON VÕ CƯỜNG", options: { fontSize: 22, color: "D32F2F" } },
    ],
    {
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.5, x: 3.67, y: 0.2, w: 6.0, h: 1.0,
      fill: { color: "FFFFFF", transparency: 8 }, line: { color: "FFB300", width: 3 }, fontFace: FONT,
      align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: "header",
    }
  );
  s.addText(rainbowRuns("Chào mừng các cô về dự hội giảng và thăm lớp"), {
    x: 0.9, y: 1.28, w: 11.53, h: 0.8, fontFace: FONT, fontSize: 30, align: "center", valign: "middle",
    outline: { size: 2.5, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "welcome",
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.1, y: 2.2, w: 7.13, h: 4.95, rectRadius: 0.35, fill: { color: "FFFFFF", transparency: 8 },
    line: { color: "66BB6A", width: 4, dashType: "dash" }, shadow: shadow(), objectName: "card",
  });
  pill(s, "detai", "Đề tài", 5.67, 2.4, 2.0, 0.48, "FF7043", 16);
  s.addText(rainbowRuns("KHÁM PHÁ NGHỀ NÔNG", {}, ["E53935", "FB8C00", "43A047", "1E88E5"]), {
    x: 3.25, y: 2.92, w: 6.83, h: 0.95, fontFace: FONT, fontSize: 36, align: "center", valign: "middle",
    margin: 0, shadow: tShadow(), isTextBox: true, objectName: "title",
  });
  const rows = [
    ["magnifier", "Lĩnh vực: ", "Phát triển nhận thức", "1E88E5"],
    ["rice", "Chủ đề: ", "Nghề nghiệp", "F29E02"],
    ["chick", "Lớp: ", "5 – 6 tuổi số 1", "E53935"],
    ["flower", "Giáo viên: ", "Từ Thị Thảo", "EC407A"],
    ["cabbage", "Đơn vị thực hiện: ", "Trường Mầm non Võ Cường", "2E9E44"],
  ];
  rows.forEach(([ic, lab, val, col], i) => {
    const y = 4.08 + i * 0.6;
    stk(s, ic, 3.55, y + 0.02, 0.46, "ic" + i);
    s.addText(
      [
        { text: lab, options: { bold: true, color: col } },
        { text: val, options: { bold: true, color: "37474F" } },
      ],
      { x: 4.15, y, w: 5.95, h: 0.5, fontFace: FONT_B, fontSize: 18, valign: "middle", margin: 0, isTextBox: true, objectName: "row" + i }
    );
  });
  stk(s, "boy", 0.3, 2.75, 3.9);
  stk(s, "girl", 10.45, 2.75, 3.9);
  stk(s, "butterfly", 2.05, 1.95, 0.8);
  s.addNotes("Slide chào mừng. Hiệu ứng tự chạy khi mở slide, không cần bấm chuột.");
  specs.push({
    trans: T.curtains, snd: "sweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 1000, l: "spin" },
      { n: "cloud", e: "fade", d: 0, t: 800, l: "drift", lo: { amp: 0.04, t: 4000 } },
      { n: "header", e: "flyT", d: 200, t: 1100, s: "whoosh" },
      { n: "boy", e: "flyL", d: 600, t: 1000, l: "bob", s: "hiya" },
      { n: "girl", e: "flyR", d: 1400, t: 1000, l: "bob", lo: { t: 1000 }, s: "girl" },
      { n: "welcome", e: "pop", d: 1200, t: 800 },
      { n: "card", e: "zoom", d: 1800, t: 600 },
      { n: "detai", e: "pop", d: 2300, t: 500 },
      { n: "title", e: "pop", d: 2600, t: 800, l: "pulse", lo: { amp: 105000, t: 900 }, s: "sparkle" },
      ...rows.flatMap((_, i) => [
        { n: "ic" + i, e: "spin", d: 3300 + i * 280, t: 500, s: "pop" },
        { n: "row" + i, e: "flyR", d: 3300 + i * 280, t: 600 },
      ]),
      { n: "butterfly", e: "pop", d: 1500, t: 600, l: "drift", lo: { amp: 0.02, dy: -0.04, t: 2200 } },
    ],
  });
}

// ================= SLIDE 2 — Ổn định tổ chức =================
{
  const s = pres.addSlide({ sectionTitle: "Mở đầu" });
  bg(s, "bg_title.jpg");
  stk(s, "sun", 0.3, 0.2, 1.3);
  stk(s, "music", 10.3, 0.45, 1.5);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 2.9, y: 1.4, w: 7.53, h: 3.0, rectRadius: 0.6, fill: { color: "FFFFFF", transparency: 6 },
    line: { color: "FFCA28", width: 5 }, shadow: shadow(), objectName: "panel",
  });
  badge(s, "badge", "1", 2.4, 0.9, 1.3, "E53935");
  s.addText(
    [
      { text: "Ổn định ", options: { color: "E53935" } },
      { text: "tổ chức", options: { color: "1E88E5" } },
    ],
    { x: 3.1, y: 1.7, w: 7.13, h: 1.2, fontFace: FONT, fontSize: 54, align: "center", valign: "middle", margin: 0, shadow: tShadow(), isTextBox: true, objectName: "title" }
  );
  pill(s, "sub", "Gây hứng thú", 4.67, 3.1, 4.0, 0.9, "FF8F00", 32);
  stk(s, "boy", 0.5, 3.35, 3.8);
  stk(s, "girl", 10.4, 3.4, 3.75);
  stk(s, "tractor", 4.5, 4.85, 2.0);
  stk(s, "chick", 7.35, 5.25, 1.6);
  s.addNotes("Ổn định tổ chức – gây hứng thú: cô và trẻ hát bài \"Lớn lên cháu lái máy cày\" hoặc trò chuyện về nghề nông.");
  specs.push({
    trans: T.ripple, snd: "magicsweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 900, l: "spin" },
      { n: "panel", e: "zoom", d: 200, t: 600 },
      { n: "badge", e: "spin", d: 600, t: 800, l: "pulse", lo: { amp: 112000, t: 500 }, s: "boing" },
      { n: "title", e: "pop", d: 900, t: 800, s: "sparkle" },
      { n: "sub", e: "flyB", d: 1500, t: 800, l: "wiggle", lo: { amp: 240000, t: 400 }, s: "pop2" },
      { n: "boy", e: "flyL", d: 1900, t: 900, l: "bob" },
      { n: "girl", e: "flyR", d: 2100, t: 900, l: "bob", lo: { t: 1000 } },
      { n: "tractor", e: "flyL", d: 2600, t: 1400, l: "wiggle", lo: { amp: 150000, t: 180 }, s: "tractor" },
      { n: "chick", e: "pop", d: 3200, t: 600, l: "bob", lo: { amp: 0.03, t: 350 }, s: "cluck" },
      { n: "music", e: "pop", d: 3700, s: "bells", t: 600, l: "drift", lo: { amp: 0.015, dy: -0.03, t: 900 } },
    ],
  });
}

// ================= SLIDE 3 — Bài mới =================
pres.addSection({ title: "Bài mới" });
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  bg(s, "bg_gold.jpg");
  stk(s, "sun", 11.15, 0.0, 1.6);
  stk(s, "bird", 6.0, 0.35, 0.75);
  badge(s, "badge", "2", 2.75, 1.65, 1.35, "1E88E5");
  s.addText(
    [
      { text: "BÀI ", options: { color: "E53935" } },
      { text: "MỚI", options: { color: "2E9E44" } },
    ],
    { x: 4.3, y: 1.2, w: 6.4, h: 2.0, fontFace: FONT, fontSize: 96, valign: "middle", margin: 0, outline: { size: 3, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "title" }
  );
  stk(s, "rice", 2.2, 4.1, 2.75);
  stk(s, "cabbage", 5.55, 4.0, 2.85);
  stk(s, "corn", 8.85, 4.0, 2.85);
  s.addNotes("Chuyển sang bài mới.");
  // bird: x 6.0 of 13.333 → fraction 0.45; fly from off-left to off-right
  specs.push({
    trans: T.honeycomb, snd: "sweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 900, l: "spin" },
      { n: "badge", e: "spin", d: 300, t: 800, l: "pulse", lo: { amp: 112000, t: 500 } },
      { n: "title", e: "pop", d: 700, t: 900, l: "pulse", lo: { amp: 104000, t: 800 }, s: "fairywin" },
      { n: "rice", e: "flyB", d: 1700, t: 800, l: "bob", s: "boing" },
      { n: "cabbage", e: "flyB", d: 2100, t: 800, l: "bob", lo: { t: 800 }, s: "boing" },
      { n: "corn", e: "flyB", d: 2500, t: 800, l: "bob", lo: { t: 1000 }, s: "boing" },
      { n: "bird", e: "appear", d: 2600, s: "chirp", l: "across", ld: 2600, lo: { from: -0.55, to: 0.6, dy: 0.04, t: 8000 } },
    ],
  });
}

// ================= SLIDE 4 — Phần 1 =================
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  bg(s, "bg_title.jpg");
  stk(s, "magnifier", 0.7, 0.9, 3.0);
  stk(s, "boy", 2.4, 2.9, 4.2);
  pill(s, "tag", "PHẦN 1", 6.0, 0.8, 2.6, 0.75, "FB8C00", 28);
  s.addText("Nhà nông khám phá", {
    x: 6.0, y: 1.65, w: 6.9, h: 1.25, fontFace: FONT, fontSize: 48, color: "2E7D32", valign: "middle",
    margin: 0, outline: { size: 3, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "title",
  });
  const teams = [["rice", "Lúa Vàng", "F29E02"], ["cabbage", "Cải Xanh", "2E9E44"], ["corn", "Bắp Ngọt", "FF6F00"]];
  teams.forEach(([img, label, col], i) => {
    const x = 6.0 + i * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.3, w: 2.0, h: 2.75, rectRadius: 0.3, fill: { color: "FFFFFF", transparency: 5 },
      line: { color: col, width: 4 }, shadow: shadow(), objectName: "card" + i,
    });
    const [pw, ph] = pngSize(path.join(ST, img + ".png"));
    const h = 1.75, w = (h * pw) / ph;
    stk(s, img, x + (2.0 - w) / 2, 3.42, h, "m" + i);
    s.addText(label, { x, y: 5.3, w: 2.0, h: 0.6, fontFace: FONT, fontSize: 20, color: col, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "lab" + i });
  });
  s.addNotes("Phần 1: Nhà nông khám phá – trẻ chia 3 đội: Lúa Vàng, Cải Xanh, Bắp Ngọt.");
  specs.push({
    trans: T.vortex, snd: "whoosh",
    fx: [
      { n: "magnifier", e: "spin", d: 200, t: 900, l: "wiggle", lo: { amp: 360000, t: 500 }, s: "sparkle" },
      { n: "boy", e: "flyB", d: 500, t: 900, l: "bob" },
      { n: "tag", e: "flyT", d: 900, t: 1000 },
      { n: "title", e: "pop", d: 1500, t: 800, s: "positive" },
      ...teams.flatMap((_, i) => [
        { n: "card" + i, e: "flyB", d: 2600 + i * 450, t: 700, s: "pop" },
        { n: "m" + i, e: "pop", d: 2900 + i * 450, t: 600, l: "bob", lo: { t: 700 + i * 150 } },
        { n: "lab" + i, e: "fade", d: 3000 + i * 450, t: 500 },
      ]),
    ],
  });
}

// ================= SLIDES 5–7, 9–10 — header chung =================
function header(s, { title, img, fill, edge, decor, titleSize = 40, mascotX = 2.05, mascotH = 1.6 }) {
  bg(s, "bg_content.jpg");
  stk(s, "cloud", 0.35, 0.3, 0.85);
  s.addText(title, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.55, x: 3.0, y: 0.25, w: 7.33, h: 1.1,
    fill: { color: fill }, line: { color: "FFFFFF", width: 4 }, fontFace: FONT, fontSize: titleSize,
    color: "FFFFFF", align: "center", valign: "middle", margin: 0, outline: { size: 1.5, color: edge },
    shadow: shadow(), objectName: "ribbon",
  });
  stk(s, img, mascotX, 0.02, mascotH, "mascot");
  stk(s, decor[0], decor[1], decor[2], decor[3], "decor");
  return [
    { n: "ribbon", e: "flyT", d: 0, t: 1000, s: "whoosh" },
    { n: "mascot", e: "spin", d: 700, t: 800, l: "wiggle", lo: { amp: 300000, t: 450 }, s: "boing" },
    { n: "cloud", e: "fade", d: 300, t: 700, l: "drift", lo: { amp: 0.03, t: 4000 } },
    { n: "decor", e: "pop", d: 1100, t: 600, l: "drift", lo: { amp: 0.015, dy: -0.025, t: 1800 } },
  ];
}
function bgMusic(s, file, options = {}) {
  // The visible media shape itself is the pause/resume control.
  const { x = 12.62, y = 6.76, w = 0.6, h = 0.6, coverFile = "music.png" } = options;
  const cover = "data:image/png;base64," + fs.readFileSync(path.join(ST, coverFile)).toString("base64");
  s.addMedia({ type: "audio", path: path.join(__dirname, "aud", "mus", file + ".mp3"), x, y, w, h, cover, objectName: "bgmusic" });
}
function topic(s, text, col, w) {
  s.addText(text, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.31, x: (W - w) / 2, y: 1.55, w, h: 0.62,
    fill: { color: "FFFFFF" }, line: { color: col, width: 3 }, fontFace: FONT, fontSize: 22, color: col,
    align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: "topic",
  });
  return { n: "topic", e: "pop", d: 1500, t: 600, s: "pop2" };
}
function card(s, name, x, y, w, h, col) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.25, fill: { color: "FFFFFF", transparency: 3 }, line: { color: col, width: 3.5 },
    shadow: shadow(), objectName: name,
  });
}
// sticker fitted into a box, centred
function fit(s, img, cx, top, maxW, maxH, name) {
  const [pw, ph] = pngSize(path.join(ST, img + ".png"));
  let h = maxH, w = (h * pw) / ph;
  if (w > maxW) { w = maxW; h = (w * ph) / pw; }
  s.addImage({ path: path.join(ST, img + ".png"), x: cx - w / 2, y: top + (maxH - h) / 2, w, h, objectName: name, altText: img });
}
function label(s, text, cx, y, w, size, color, name, font = FONT_B) {
  s.addText(text, { x: cx - w / 2, y, w, h: size / 50 + 0.05, fontFace: font, fontSize: size, bold: font === FONT_B, color, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: name });
}

// ---------- Slide 5: Đội Lúa Vàng — Sản phẩm nghề nông ----------
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "ĐỘI LÚA VÀNG", img: "rice", fill: "F29E02", edge: "8D5300", decor: ["butterfly", 11.6, 0.3, 0.95] });
  fx.push(topic(s, "Sản phẩm của nghề nông", "E68A00", 5.6));
  const groups = [
    ["Lương thực", "F29E02", [["cassava", "Củ sắn"], ["rice", "Lúa"], ["corn2", "Ngô"], ["sweetpotato", "Khoai lang"]]],
    ["Rau – củ – quả", "2E9E44", [["greens", "Rau cải"], ["kohlrabi", "Su hào"], ["tomato", "Cà chua"], ["apple", "Táo"]]],
    ["Sản phẩm chăn nuôi", "1E88E5", [["eggs", "Trứng gà"], ["milk", "Sữa"], ["chicken_family", "Gia đình gà"], ["cow", "Bò sữa"]]],
  ];
  groups.forEach(([gname, col, items], g) => {
    const x = 0.6 + g * 4.12;
    card(s, "g" + g, x, 2.42, 3.9, 4.18, col);
    pill(s, "gp" + g, gname, x + 0.28, 2.58, 3.34, 0.52, col, g === 2 ? 18 : 20);
    fx.push({ n: "g" + g, e: "zoom", d: 0, t: 500, c: true, s: "bells" }, { n: "gp" + g, e: "pop", d: 250, t: 500 });
    items.forEach(([img, lab], k) => {
      const cx = x + (k % 2 ? 2.92 : 0.98), top = k < 2 ? 3.22 : 4.88;
      fit(s, img, cx, top, 1.7, 1.08, `g${g}i${k}`);
      label(s, lab, cx, top + 1.1, 1.85, lab === "Gia đình gà" ? 15 : 16, "37474F", `g${g}l${k}`);
      fx.push({ n: `g${g}i${k}`, e: "pop", d: 600 + k * 300, t: 500, s: "pop" }, { n: `g${g}l${k}`, e: "fade", d: 750 + k * 300, t: 400 });
    });
  });
  bgMusic(s, "m_luavang");
  s.addNotes("KHẨU HIỆU (trẻ đọc khi nhạc nổi lên): Xin chào các bạn gần xa, / Lúa Vàng quyết thắng, cả nhà vỗ tay! / Ra sân chẳng ngại điều chi / Tự tin, đoàn kết, ngại gì khó khăn!\nNhạc: “Be Happy 2” (Mixkit) – bấm vào biểu tượng nốt nhạc góc phải dưới để tạm dừng/phát tiếp.\nĐội Lúa Vàng giới thiệu SẢN PHẨM CỦA NGHỀ NÔNG. Nhạc nền tự phát khi mở slide.\nBấm chuột 3 lần để hiện lần lượt: 1) Lương thực (củ sắn, lúa, ngô, khoai lang) – 2) Rau, củ, quả (rau cải, su hào, cà chua, táo) – 3) Sản phẩm chăn nuôi (trứng gà, sữa, gia đình gà, bò sữa).\nGợi ý câu hỏi: Đây là gì? Do ai làm ra? Ăn vào giúp cơ thể thế nào?");
  specs.push({ trans: T.curl, snd: "whoosh", fx, music: { file: "m_luavang", vol: 0.5 } });
}

// ---------- Slide 6: Đội Cải Xanh — Dụng cụ ----------
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "ĐỘI CẢI XANH", img: "cabbage", fill: "2E9E44", edge: "1B5E20", decor: ["can", 11.35, 0.35, 0.85] });
  fx.push(topic(s, "Dụng cụ làm việc của nghề nông", "2E7D32", 6.6));
  const tools = [
    ["plough", "Cái cày", "Cày cho đất tơi"], ["hoe", "Cái cuốc", "Xới đất, đào đất"],
    ["sickle", "Cái liềm", "Gặt lúa, cắt cỏ"], ["shovel", "Cái xẻng", "Xúc đất, đào hố"],
    ["rake", "Cái cào", "Cào đất, cào thóc"], ["pole", "Quang gánh", "Gánh lúa, gánh rau"],
    ["can2", "Bình tưới", "Tưới nước cho cây"], ["harrow", "Cái bừa", "Làm đất tơi, phẳng"],
  ];
  const cols = ["E53935", "FB8C00", "8E24AA", "1E88E5", "00897B", "F29E02", "2E9E44", "EC407A"];
  tools.forEach(([img, name, use], k) => {
    const x = 0.59 + (k % 4) * 3.1, y = k < 4 ? 2.42 : 4.57, cx = x + 1.425, col = cols[k];
    card(s, "t" + k, x, y, 2.85, 2.0, col);
    fit(s, img, cx, y + 0.1, 2.4, 1.1, "ti" + k);
    label(s, name, cx, y + 1.22, 2.7, 18, col, "tn" + k, FONT);
    label(s, use, cx, y + 1.6, 2.7, 14, "455A64", "tu" + k);
    fx.push(
      { n: "t" + k, e: "zoom", d: 0, t: 450, c: true, s: "pop" },
      { n: "ti" + k, e: "spin", d: 200, t: 600 },
      { n: "tn" + k, e: "flyB", d: 500, t: 500 },
      { n: "tu" + k, e: "fade", d: 700, t: 400 }
    );
  });
  bgMusic(s, "m_caixanh");
  s.addNotes("KHẨU HIỆU (trẻ đọc khi nhạc nổi lên): Đội mình Cải Xanh, / Đoàn kết thật nhanh, / Tự tin khám phá, / Chiến thắng vẻ vang!\nNhạc: “Jumping Around” (Mixkit) – bấm vào biểu tượng nốt nhạc góc phải dưới để tạm dừng/phát tiếp.\nĐội Cải Xanh giới thiệu DỤNG CỤ LÀM VIỆC CỦA NGHỀ NÔNG. Nhạc nền tự phát khi mở slide.\nMỗi lần bấm chuột hiện 1 dụng cụ (8 lần): cái cày, cái cuốc, cái liềm, cái xẻng, cái cào, quang gánh, bình tưới, cái bừa.\nGợi ý câu hỏi: Đây là dụng cụ gì? Dùng để làm gì? Khi dùng cần chú ý gì để an toàn?");
  specs.push({ trans: T.curl, snd: "whoosh", fx, music: { file: "m_caixanh", vol: 0.5 } });
}

// ---------- Slide 7: Công nghệ giúp người nông dân ----------
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "MÁY MÓC NGÀY NAY", img: "tractor", fill: "1E88E5", edge: "0D47A1", decor: ["sun", 11.55, 0.12, 1.0], mascotX: 1.82, mascotH: 1.15 });
  s.addText("Ngày nay công nghệ phát triển.\nMáy móc làm thay nhiều việc nặng cho người nông dân.", {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.3, x: 2.0, y: 1.51, w: 9.33, h: 0.75,
    fill: { color: "FFFFFF" }, line: { color: "1565C0", width: 3 }, fontFace: FONT,
    fontSize: 19, color: "1565C0", align: "center", valign: "middle", margin: 0,
    shadow: shadow(), objectName: "topic",
  });
  fx.push({ n: "topic", e: "pop", d: 1500, t: 600, s: "pop2" });
  const modern = [
    ["tractor", "Máy cày", "Làm đất nhanh hơn", "E53935"],
    ["combine_modern", "Máy gặt", "Thu hoạch lúa nhanh hơn", "FB8C00"],
    ["rice_transplanter", "Máy cấy", "Cấy mạ nhanh, đều hàng", "2E9E44"],
  ];
  modern.forEach(([img, name, use, col], k) => {
    const x = 0.68 + k * 4.2, cx = x + 1.95;
    card(s, "mcard" + k, x, 2.58, 3.9, 3.82, col);
    fit(s, img, cx, 2.88, 3.5, 2.13, "mimg" + k);
    label(s, name, cx, 5.05, 3.6, 22, col, "mname" + k, FONT);
    label(s, use, cx, 5.63, 3.6, 16, "455A64", "muse" + k);
    fx.push(
      { n: "mcard" + k, e: "zoom", d: 0, t: 450, c: true, s: "pop" },
      { n: "mimg" + k, e: "pop", d: 200, t: 600 },
      { n: "mname" + k, e: "flyB", d: 500, t: 500 },
      { n: "muse" + k, e: "fade", d: 650, t: 400 }
    );
  });
  s.addNotes("Ngày nay công nghệ phát triển. Người nông dân dùng công cụ hiện đại để thay bớt sức lao động thủ công. Bấm chuột 3 lần để hiện: máy cày có lưỡi cày làm đất, máy gặt thu hoạch lúa và máy cấy đặt mạ xuống ruộng theo hàng. Hỏi trẻ: Máy nào giúp làm đất? Máy nào giúp cấy lúa?");
  specs.push({ trans: T.curl, snd: "whoosh", fx });
}

// ---------- Slide 8: Đội Bắp Ngọt — Quy trình trồng lúa ----------
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "ĐỘI BẮP NGỌT", img: "corn", fill: "FF6F00", edge: "A64600", decor: ["chick", 11.75, 0.2, 1.05] });
  fx.push(topic(s, "Quy trình làm nghề nông: trồng lúa", "E65100", 7.0));
  const steps = [
    ["p1", "Cày bừa làm đất", "moo"], ["p2", "Gieo mạ, cấy lúa", "splash"], ["rice_field_water", "Dẫn nước vào ruộng", "splash"],
    ["p4", "Bón phân", "sparkle"], ["p5", "Nhổ cỏ, bắt sâu", "pop2"], ["p6", "Gặt lúa", "fairywin"],
  ];
  const cols = ["8D6E63", "1E88E5", "00ACC1", "8E24AA", "43A047", "F29E02"];
  steps.forEach(([img, name, snd], k) => {
    const x = 0.92 + (k % 3) * 4.1, y = k < 3 ? 2.45 : 4.6, cx = x + 1.65, col = cols[k];
    card(s, "c" + k, x, y, 3.3, 2.0, col);
    fit(s, img, cx, y + 0.08, 3.0, 1.42, "ci" + k);
    label(s, name, cx, y + 1.52, 3.1, k === 2 ? 16 : 18, col, "cn" + k, FONT);
    badge(s, "b" + k, String(k + 1), x - 0.18, y - 0.18, 0.62, col);
    fx.push(
      { n: "c" + k, e: "zoom", d: 0, t: 450, c: true, s: snd },
      { n: "ci" + k, e: "pop", d: 250, t: 600 },
      { n: "b" + k, e: "spin", d: 400, t: 600 },
      { n: "cn" + k, e: "flyB", d: 600, t: 500 }
    );
    if (k % 3 !== 2) {
      s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 3.38, y: y + 0.72, w: 0.64, h: 0.56, fill: { color: col }, line: { color: "FFFFFF", width: 2 }, objectName: "a" + k });
      fx.push({ n: "a" + k, e: "wipe", d: 1000, t: 500 });
    }
  });
  bgMusic(s, "m_bapngot");
  s.addNotes("KHẨU HIỆU (trẻ đọc khi nhạc nổi lên): Chúng mình Bắp Ngọt, / Vui tươi hết cỡ, / Cùng nhau cố gắng / Chiến thắng đang chờ!\nNhạc: “Delightful” (Mixkit) – bấm vào biểu tượng nốt nhạc góc phải dưới để tạm dừng/phát tiếp.\nĐội Bắp Ngọt giới thiệu QUY TRÌNH TRỒNG LÚA. Nhạc nền tự phát khi mở slide.\nMỗi lần bấm chuột hiện 1 bước kèm âm thanh (6 lần): 1. Cày bừa làm đất – 2. Gieo mạ, cấy lúa – 3. Dẫn nước vào ruộng – 4. Bón phân – 5. Nhổ cỏ, bắt sâu – 6. Gặt lúa.\nBác nông dân đưa nước vào ruộng và giữ mực nước phù hợp sau khi cấy lúa. Gợi ý hỏi trẻ: Bước nào làm trước, bước nào làm sau?");
  specs.push({ trans: T.curl, snd: "whoosh", fx, music: { file: "m_bapngot", vol: 0.5 } });
}

// ---------- Slide 9: Quy trình chung của bác nông dân ----------
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "QUY TRÌNH CỦA BÁC NÔNG DÂN", img: "carrot", fill: "FF6F00", edge: "A64600", decor: ["butterfly", 11.65, 0.23, 0.9], titleSize: 30 });
  fx.push(topic(s, "Từ hạt giống đến nông sản", "E65100", 6.5));
  const steps = [
    ["farmer_select_seeds", "Chọn giống"],
    ["farmer_prepare_soil", "Làm đất"],
    ["farmer_plant", "Gieo trồng"],
    ["farmer_care", "Chăm sóc cây"],
    ["farmer_harvest", "Thu hoạch"],
    ["farmer_pack", "Phân loại nông sản"],
  ];
  const cols = ["8E24AA", "8D6E63", "43A047", "1E88E5", "F29E02", "EC407A"];
  steps.forEach(([img, name], k) => {
    const x = 0.92 + (k % 3) * 4.1, y = k < 3 ? 2.45 : 4.6, cx = x + 1.65, col = cols[k];
    card(s, "qcard" + k, x, y, 3.3, 2.0, col);
    fit(s, img, cx, y + 0.08, 3.0, 1.42, "qimg" + k);
    label(s, name, cx, y + 1.52, 3.1, k === 5 ? 15 : 18, col, "qname" + k, FONT);
    badge(s, "qnum" + k, String(k + 1), x - 0.18, y - 0.18, 0.62, col);
    fx.push(
      { n: "qcard" + k, e: "zoom", d: 0, t: 450, c: true, s: "pop2" },
      { n: "qimg" + k, e: "pop", d: 250, t: 600 },
      { n: "qnum" + k, e: "spin", d: 400, t: 600 },
      { n: "qname" + k, e: "flyB", d: 600, t: 500 }
    );
  });
  s.addNotes("QUY TRÌNH CHUNG CỦA BÁC NÔNG DÂN: 1. Chọn giống – 2. Làm đất – 3. Gieo trồng – 4. Chăm sóc cây – 5. Thu hoạch – 6. Phân loại nông sản. Đây là ví dụ quy trình trồng trọt nói chung, minh họa bằng rau và ngô để hình ảnh khác hẳn slide 8 về trồng lúa. Mỗi lần bấm chuột hiện một bước. Gợi ý hỏi trẻ: Bác nông dân cần làm gì trước khi gieo trồng? Sau khi thu hoạch thì làm gì?");
  specs.push({ trans: T.curl, snd: "whoosh", fx });
}

// ================= SLIDE 10 — Phần 2 =================
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  bg(s, "bg_gold.jpg");
  stk(s, "sun", 11.15, 0.0, 1.6);
  pill(s, "tag", "PHẦN 2", 0.9, 0.95, 2.6, 0.75, "E53935", 28);
  s.addText("Nhà nông thi tài", {
    x: 0.9, y: 1.8, w: 7.2, h: 1.3, fontFace: FONT, fontSize: 54, color: "D84315", valign: "middle",
    margin: 0, outline: { size: 3, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "title",
  });
  stk(s, "trophy", 8.4, 1.35, 3.7);
  stk(s, "buffalo", 0.9, 3.75, 3.0);
  stk(s, "chick", 4.55, 4.9, 1.9);
  stk(s, "carrot", 6.3, 4.95, 1.8);
  s.addNotes("Phần 2: Bé làm bác nông dân bằng động tác, sau đó các đội thi đua qua 2 trò chơi.");
  specs.push({
    trans: T.airplane, snd: "whoosh",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 900, l: "spin" },
      { n: "tag", e: "flyL", d: 300, t: 800 },
      { n: "title", e: "pop", d: 900, t: 800, l: "pulse", lo: { amp: 104000, t: 800 }, s: "sparkle" },
      { n: "trophy", e: "spin", d: 1500, t: 1000, l: "pulse", lo: { amp: 108000, t: 600 }, s: "trophy" },
      { n: "buffalo", e: "flyL", d: 2600, t: 1000, l: "bob", lo: { t: 1100 }, s: "moo" },
      { n: "chick", e: "flyB", d: 3400, t: 700, l: "bob", lo: { amp: 0.03, t: 350 }, s: "cluck" },
      { n: "carrot", e: "flyB", d: 3900, t: 700, l: "wiggle", lo: { amp: 360000, t: 400 }, s: "pop" },
    ],
  });
}

// ================= SLIDE 11 — Bé làm bác nông dân =================
{
  const steps = [
    ["game_soil", "Làm đất"], ["game_sow", "Gieo hạt"],
    ["game_sprout", "Nảy mầm"], ["game_one_plant", "Một cây"],
    ["game_two_plants", "Hai cây"], ["game_one_bud", "Một nụ"],
    ["game_two_buds", "Hai nụ"], ["game_one_flower", "Một hoa"],
    ["game_two_flowers", "Hai hoa"], ["game_one_fruit", "Một quả"],
    ["game_two_fruits", "Hai quả"], ["game_harvest", "Thu hoạch"],
  ];
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "BÉ LÀM BÁC NÔNG DÂN", titleSize: 33, img: "rice", fill: "E91E63", edge: "880E4F", decor: ["flower", 11.85, 0.15, 1.1] });
  const cols = ["E53935", "FB8C00", "2E9E44", "1E88E5", "8E24AA", "EC407A"];
  steps.forEach(([img, name], k) => {
    const x = 0.35 + (k % 4) * 3.23, y = 1.70 + Math.floor(k / 4) * 1.72;
    const col = cols[k % cols.length];
    card(s, "gcard" + k, x, y, 2.94, 1.55, col);
    badge(s, "gnum" + k, String(k + 1), x - 0.08, y - 0.09, 0.40, col);
    fit(s, img, x + 1.47, y + 0.12, 2.06, 0.96, "gimg" + k);
    label(s, name, x + 1.47, y + 1.11, 2.77, 18, col, "gname" + k, FONT);
    fx.push(
      { n: "gcard" + k, e: "fade", d: 1250 + k * 70, t: 350 },
      { n: "gimg" + k, e: "pop", d: 1370 + k * 70, t: 420 },
      { n: "gnum" + k, e: "fade", d: 1450 + k * 70, t: 300 },
      { n: "gname" + k, e: "fade", d: 1560 + k * 70, t: 300 }
    );
  });
  bgMusic(s, "m_game1_dance_with_me");
  s.addNotes("HOẠT ĐỘNG: BÉ LÀM BÁC NÔNG DÂN. Mười hai thẻ động tác hiển thị trên cùng một slide; cô đọc lần lượt theo số và cho trẻ làm theo. Slide chỉ hiện tên động tác để trẻ dễ quan sát. Thứ tự: Làm đất → Gieo hạt → Nảy mầm → Một cây → Hai cây → Một nụ → Hai nụ → Một hoa → Hai hoa → Một quả → Hai quả → Thu hoạch. Nhạc nền: Dance with Me, Ahjay Stelino, Mixkit (https://mixkit.co/free-stock-music/children/). Gợi ý động tác Một quả, Hai quả và Thu hoạch do nhóm biên soạn bổ sung.");
  specs.push({ trans: T.conveyor, snd: "whoosh", fx, music: { file: "m_game1_dance_with_me", vol: 0.35 } });
}

// ================= SLIDE 12 — Trò chơi 1: Cấy lúa thần tốc =================
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "TRÒ CHƠI 1", img: "rice", fill: "E67E22", edge: "8D4E0D", decor: ["bird", 11.55, 0.3, 0.85] });
  fx.push(topic(s, "CẤY LÚA THẦN TỐC", "D97706", 6.4));
  fit(s, "game_rice_race", 3.13, 2.47, 5.45, 3.87, "riceRaceArt");
  card(s, "riceRaceHowCard", 6.08, 2.53, 6.65, 1.67, "43A047");
  s.addText("CÁCH CHƠI", { x: 6.38, y: 2.73, w: 5.9, h: 0.43, fontFace: FONT, fontSize: 22, color: "2E7D32", margin: 0, objectName: "riceRaceHowTitle" });
  s.addText("Từng thành viên bật liên tục qua các vòng, lên “cấy lúa” vào mảnh ruộng của đội mình.", { x: 6.38, y: 3.2, w: 5.98, h: 0.86, fontFace: FONT_B, fontSize: 18, bold: true, color: "455A64", margin: 0, objectName: "riceRaceHow" });
  card(s, "riceRaceRuleCard", 6.08, 4.48, 6.65, 1.47, "FB8C00");
  s.addText("LUẬT CHƠI", { x: 6.38, y: 4.68, w: 5.9, h: 0.42, fontFace: FONT, fontSize: 22, color: "EF6C00", margin: 0, objectName: "riceRaceRuleTitle" });
  s.addText("Trong thời gian một bản nhạc (5 phút), đội cấy xong mảnh ruộng sẽ giành chiến thắng.", { x: 6.38, y: 5.15, w: 5.98, h: 0.72, fontFace: FONT_B, fontSize: 18, bold: true, color: "455A64", margin: 0, objectName: "riceRaceRule" });
  bgMusic(s, "m_cay_lua_5m", { x: 6.35, y: 6.18, w: 5.95, h: 0.52, coverFile: "music_5min_button.png" });
  s.addNotes("TRÒ CHƠI 1: CẤY LÚA THẦN TỐC. Các thành viên mỗi đội lần lượt bật liên tục qua các vòng, lên cấy lúa vào mảnh ruộng của đội mình. Luật chơi: thời gian một bản nhạc 5 phút; đội cấy xong mảnh ruộng giành chiến thắng. Nhạc nền nhúng trong slide, tự phát và dừng sau 5 phút. Bấm trực tiếp nút nhạc màu cam để tạm dừng hoặc phát tiếp. Khi dùng điều khiển chuyển slide, lần bấm thứ nhất dừng nhạc, lần bấm thứ hai mới sang trò chơi 2. Nguồn nhạc: https://youtu.be/XeqtA91kdCI (tệp MP3 do người dùng cung cấp, cắt đúng 300 giây).");
  fx.push(
    { n: "riceRaceArt", e: "pop", d: 1900, t: 650 },
    { n: "riceRaceHowCard", e: "flyR", d: 2200, t: 550 },
    { n: "riceRaceHowTitle", e: "fade", d: 2450, t: 350 },
    { n: "riceRaceHow", e: "fade", d: 2600, t: 400 },
    { n: "riceRaceRuleCard", e: "flyR", d: 3100, t: 550 },
    { n: "riceRaceRuleTitle", e: "fade", d: 3350, t: 350 },
    { n: "riceRaceRule", e: "fade", d: 3500, t: 400 }
  );
  fx.push({ n: "bgmusic", cmd: "stopMusic", c: true });
  specs.push({ trans: T.conveyor, snd: "whoosh", fx, music: { file: "m_cay_lua_5m", vol: 0.58, once: true } });
}

// ================= SLIDE 13 — Trò chơi 2: Sáng tạo tranh từ hạt =================
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "TRÒ CHƠI 2", img: "corn2", fill: "7B1FA2", edge: "4A148C", decor: ["flower", 11.8, 0.2, 1.0] });
  fx.push(topic(s, "SÁNG TẠO TRANH TỪ HẠT", "7B1FA2", 7.5));
  fit(s, "game_seed_art", 3.13, 2.52, 5.45, 3.85, "seedArt");
  card(s, "seedHowCard", 6.08, 2.48, 6.65, 2.14, "8E24AA");
  s.addText("CÁCH CHƠI", { x: 6.37, y: 2.68, w: 5.95, h: 0.43, fontFace: FONT, fontSize: 22, color: "7B1FA2", margin: 0, objectName: "seedHowTitle" });
  s.addText("Mỗi đội nhận tranh vẽ sẵn về bông lúa, bắp ngô, cải xanh… cùng hạt gạo, đậu xanh, đậu đỏ và ngô hạt. Các bé chọn hạt phù hợp, phết hồ và dán vào hình.", { x: 6.37, y: 3.13, w: 5.96, h: 1.31, fontFace: FONT_B, fontSize: 17.5, bold: true, color: "455A64", margin: 0, objectName: "seedHow" });
  card(s, "seedRuleCard", 6.08, 4.85, 6.65, 1.47, "EC407A");
  s.addText("LUẬT CHƠI", { x: 6.37, y: 5.05, w: 5.95, h: 0.42, fontFace: FONT, fontSize: 22, color: "C2185B", margin: 0, objectName: "seedRuleTitle" });
  s.addText("Bắt đầu khi có hiệu lệnh. Hết thời gian, các đội dừng tay và trưng bày tranh hoàn chỉnh.", { x: 6.37, y: 5.52, w: 5.96, h: 0.68, fontFace: FONT_B, fontSize: 18, bold: true, color: "455A64", margin: 0, objectName: "seedRule" });
  s.addNotes("TRÒ CHƠI 2: SÁNG TẠO TRANH TỪ HẠT. Cô chia trẻ thành các đội. Mỗi đội có một bức tranh vẽ sẵn về các sản phẩm nông nghiệp như bông lúa, bắp ngô, cải xanh và các loại hạt như hạt gạo, đậu xanh, đậu đỏ, ngô hạt. Khi có hiệu lệnh bắt đầu, các thành viên cùng chọn hạt phù hợp, phết hồ, dán vào hình. Hết thời gian, các đội dừng tay và trưng bày sản phẩm.");
  fx.push(
    { n: "seedArt", e: "pop", d: 1900, t: 650 },
    { n: "seedHowCard", e: "flyR", d: 2200, t: 550 },
    { n: "seedHowTitle", e: "fade", d: 2450, t: 350 },
    { n: "seedHow", e: "fade", d: 2600, t: 450 },
    { n: "seedRuleCard", e: "flyR", d: 3250, t: 550 },
    { n: "seedRuleTitle", e: "fade", d: 3500, t: 350 },
    { n: "seedRule", e: "fade", d: 3650, t: 450 }
  );
  specs.push({ trans: T.conveyor, snd: "whoosh", fx });
}

// ================= SLIDE 14 — Kết thúc =================
pres.addSection({ title: "Kết thúc" });
{
  const s = pres.addSlide({ sectionTitle: "Kết thúc" });
  bg(s, "bg_title.jpg");
  stk(s, "sun", 0.3, 0.2, 1.4);
  stk(s, "cloud", 11.0, 0.35, 1.0);
  const rb = pngSize(path.join(ST, "rainbow.png"));
  const rh = 1.9, rw = (rh * rb[0]) / rb[1];
  stk(s, "rainbow", (W - rw) / 2, 0.2, rh);
  s.addText(rainbowRuns("Cảm ơn các cô!", {}, ["E53935", "FB8C00", "43A047", "1E88E5"]), {
    x: 1.5, y: 2.05, w: 10.33, h: 1.4, fontFace: FONT, fontSize: 66, align: "center", valign: "middle", margin: 0,
    outline: { size: 3, color: "FFFFFF" }, shadow: tShadow(), isTextBox: true, objectName: "title",
  });
  s.addText("Chúc các cô sức khỏe – Chúc các bé chăm ngoan, học giỏi!", {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.45, x: 1.67, y: 3.55, w: 10.0, h: 0.9,
    fill: { color: "FFFFFF", transparency: 8 }, line: { color: "FF8F00", width: 3 }, fontFace: FONT_B, fontSize: 22,
    bold: true, color: "E65100", align: "center", valign: "middle", margin: 0, shadow: shadow(), objectName: "wish",
  });
  stk(s, "boy", 0.8, 4.45, 2.9);
  stk(s, "buffalo", 3.15, 5.05, 2.2);
  stk(s, "chick", 6.0, 5.45, 1.7);
  stk(s, "tractor", 7.95, 5.05, 2.2);
  stk(s, "girl", 10.6, 4.45, 2.9);
  stk(s, "bird", 1.6, 1.55, 0.6);
  s.addNotes("Kết thúc hoạt động.");
  specs.push({
    trans: T.glitter, snd: "sweep",
    fx: [
      { n: "sun", e: "spin", d: 0, t: 900, l: "spin" },
      { n: "cloud", e: "fade", d: 0, t: 800, l: "drift", lo: { amp: 0.04, t: 4000 } },
      { n: "rainbow", e: "wipe", d: 300, t: 1200, s: "fairywin" },
      { n: "title", e: "pop", d: 1200, t: 900, l: "pulse", lo: { amp: 106000, t: 700 }, s: "applause" },
      { n: "wish", e: "flyB", d: 1900, t: 800 },
      { n: "boy", e: "flyB", d: 2500, t: 700, l: "bob" },
      { n: "buffalo", e: "flyB", d: 2700, t: 700, l: "bob", lo: { t: 1100 }, s: "moo" },
      { n: "chick", e: "flyB", d: 3300, t: 700, l: "bob", lo: { amp: 0.03, t: 350 }, s: "cluck" },
      { n: "tractor", e: "flyB", d: 3700, t: 700, l: "wiggle", lo: { amp: 150000, t: 180 }, s: "tractor" },
      { n: "girl", e: "flyB", d: 3300, t: 700, l: "bob", lo: { t: 1000 } },
      { n: "bird", e: "appear", d: 4400, s: "chirp", l: "across", ld: 4400, lo: { from: -0.2, to: 0.95, dy: -0.03, t: 9000 } },
    ],
  });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await addMotion(OUT, specs, path.join(__dirname, "aud", "wav"));
  fs.writeFileSync(path.join(__dirname, "specs.json"), JSON.stringify(specs.map((sp) => ({ snd: sp.snd, music: sp.music, sfx: sp.fx.filter((e) => e.s && e.e).map((e) => [e.n, e.s]) })), null, 1));
  console.log("wrote", OUT);
})();
