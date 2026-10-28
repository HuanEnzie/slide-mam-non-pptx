// ================= SLIDES 5–7, 9–10 — header chung =================
function header(s, { title, img, fill, edge, decor }) {
  bg(s, "bg_content.jpg");
  stk(s, "cloud", 0.35, 0.3, 0.85);
  s.addText(title, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.55, x: 3.0, y: 0.25, w: 7.33, h: 1.1,
    fill: { color: fill }, line: { color: "FFFFFF", width: 4 }, fontFace: FONT, fontSize: 40,
    color: "FFFFFF", align: "center", valign: "middle", margin: 0, outline: { size: 1.5, color: edge },
    shadow: shadow(), objectName: "ribbon",
  });
  stk(s, img, 2.05, 0.02, 1.6, "mascot");
  stk(s, decor[0], decor[1], decor[2], decor[3], "decor");
  return [
    { n: "ribbon", e: "flyT", d: 0, t: 1000, s: "whoosh" },
    { n: "mascot", e: "spin", d: 700, t: 800, l: "wiggle", lo: { amp: 300000, t: 450 }, s: "boing" },
    { n: "cloud", e: "fade", d: 300, t: 700, l: "drift", lo: { amp: 0.03, t: 4000 } },
    { n: "decor", e: "pop", d: 1100, t: 600, l: "drift", lo: { amp: 0.015, dy: -0.025, t: 1800 } },
  ];
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
    ["Lương thực", "F29E02", [["rice_bowl", "Cơm, gạo"], ["rice", "Lúa"], ["corn2", "Ngô"], ["sweetpotato", "Khoai lang"]]],
    ["Rau – củ – quả", "2E9E44", [["greens", "Rau cải"], ["pumpkin", "Bí đỏ"], ["tomato", "Cà chua"], ["banana", "Chuối"]]],
    ["Trứng – sữa", "1E88E5", [["eggs", "Trứng gà"], ["milk", "Sữa"], ["chick", "Gà"], ["cow", "Bò sữa"]]],
  ];
  groups.forEach(([gname, col, items], g) => {
    const x = 0.6 + g * 4.12;
    card(s, "g" + g, x, 2.42, 3.9, 4.18, col);
    pill(s, "gp" + g, gname, x + 0.5, 2.58, 2.9, 0.52, col, 20);
    fx.push({ n: "g" + g, e: "zoom", d: 0, t: 500, c: true, s: "bells" }, { n: "gp" + g, e: "pop", d: 250, t: 500 });
    items.forEach(([img, lab], k) => {
      const cx = x + (k % 2 ? 2.92 : 0.98), top = k < 2 ? 3.22 : 4.88;
      fit(s, img, cx, top, 1.7, 1.08, `g${g}i${k}`);
      label(s, lab, cx, top + 1.1, 1.85, 16, "37474F", `g${g}l${k}`);
      fx.push({ n: `g${g}i${k}`, e: "pop", d: 600 + k * 300, t: 500, s: "pop" }, { n: `g${g}l${k}`, e: "fade", d: 750 + k * 300, t: 400 });
    });
  });
  s.addNotes("Đội Lúa Vàng giới thiệu SẢN PHẨM CỦA NGHỀ NÔNG. Nhạc nền tự phát khi mở slide.\nBấm chuột 3 lần để hiện lần lượt: 1) Lương thực (cơm gạo, lúa, ngô, khoai lang) – 2) Rau củ quả (rau cải, bí đỏ, cà chua, chuối) – 3) Trứng, sữa (trứng gà, sữa, gà, bò sữa).\nGợi ý câu hỏi: Đây là gì? Do ai làm ra? Ăn vào giúp cơ thể thế nào?");
  specs.push({ trans: T.curl, snd: "whoosh", fx, music: { file: "m_luavang", vol: 0.35 } });
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
    ["can2", "Bình tưới", "Tưới nước cho cây"], ["harvester", "Máy gặt", "Gặt lúa thật nhanh"],
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
  s.addNotes("Đội Cải Xanh giới thiệu DỤNG CỤ LÀM VIỆC CỦA NGHỀ NÔNG. Nhạc nền tự phát khi mở slide.\nMỗi lần bấm chuột hiện 1 dụng cụ (8 lần): cái cày, cái cuốc, cái liềm, cái xẻng, cái cào, quang gánh, bình tưới, máy gặt.\nGợi ý câu hỏi: Đây là dụng cụ gì? Dùng để làm gì? Khi dùng cần chú ý gì để an toàn?");
  specs.push({ trans: T.curl, snd: "whoosh", fx, music: { file: "m_caixanh", vol: 0.35 } });
}

// ---------- Slide 7: Đội Bắp Ngọt — Quy trình ----------
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "ĐỘI BẮP NGỌT", img: "corn", fill: "FF6F00", edge: "A64600", decor: ["chick", 11.75, 0.2, 1.05] });
  fx.push(topic(s, "Quy trình làm nghề nông: trồng lúa", "E65100", 7.0));
  const steps = [
    ["p1", "Cày bừa làm đất", "moo"], ["p2", "Gieo mạ, cấy lúa", "splash"], ["p3", "Tưới nước", "pour"],
    ["p4", "Bón phân", "sparkle"], ["p5", "Nhổ cỏ, bắt sâu", "pop2"], ["p6", "Gặt lúa", "fairywin"],
  ];
  const cols = ["8D6E63", "1E88E5", "00ACC1", "8E24AA", "43A047", "F29E02"];
  steps.forEach(([img, name, snd], k) => {
    const x = 0.92 + (k % 3) * 4.1, y = k < 3 ? 2.45 : 4.6, cx = x + 1.65, col = cols[k];
    card(s, "c" + k, x, y, 3.3, 2.0, col);
    fit(s, img, cx, y + 0.08, 3.0, 1.42, "ci" + k);
    label(s, name, cx, y + 1.52, 3.1, 18, col, "cn" + k, FONT);
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
  s.addNotes("Đội Bắp Ngọt giới thiệu QUY TRÌNH LÀM NGHỀ NÔNG (trồng lúa). Nhạc nền tự phát khi mở slide.\nMỗi lần bấm chuột hiện 1 bước kèm âm thanh (6 lần): 1. Cày bừa làm đất – 2. Gieo mạ, cấy lúa – 3. Tưới nước – 4. Bón phân – 5. Nhổ cỏ, bắt sâu – 6. Gặt lúa.\nGợi ý: Bước nào làm trước, bước nào làm sau? Nếu không tưới nước, cây lúa sẽ thế nào?");
  specs.push({ trans: T.curl, snd: "whoosh", fx, music: { file: "m_bapngot", vol: 0.35 } });
}
