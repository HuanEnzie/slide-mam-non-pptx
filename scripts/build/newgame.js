// ================= SLIDE 9 — Trò chơi 1: Bé làm bác nông dân =================
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "TRÒ CHƠI 1", img: "gift", fill: "E91E63", edge: "880E4F", decor: ["flower", 11.85, 0.15, 1.1] });
  fx.push(topic(s, "Bé làm bác nông dân", "C2185B", 5.0));
  const acts = [
    ["rooster", "Gà gáy ò ó o", "Vươn vai thức dậy", "rooster"],
    ["p1", "Cày đất", "Hai tay đẩy cày, bước đều", "moo"],
    ["p2", "Cấy lúa", "Cúi người, cắm mạ", "splash"],
    ["p3", "Tưới nước", "Nghiêng bình tưới cây", "pour"],
    ["p4", "Bón phân", "Vung tay rắc phân", "sparkle"],
    ["p6", "Gặt lúa", "Cầm liềm, gặt lúa", "bells"],
    ["carry", "Gánh lúa về", "Gánh trên vai, nhún nhảy", "boing"],
    ["rain", "Trời mưa!", "Chạy nhanh về nhà", "rain"],
  ];
  const cols = ["E53935", "8D6E63", "1E88E5", "00ACC1", "8E24AA", "F29E02", "2E9E44", "3949AB"];
  acts.forEach(([img, name, hint, snd], k) => {
    const x = 0.59 + (k % 4) * 3.1, y = k < 4 ? 2.42 : 4.57, cx = x + 1.425, col = cols[k];
    card(s, "k" + k, x, y, 2.85, 2.0, col);
    fit(s, img, cx, y + 0.08, 2.5, 1.12, "ki" + k);
    label(s, name, cx, y + 1.22, 2.75, 18, col, "kn" + k, FONT);
    label(s, hint, cx, y + 1.6, 2.75, 14, "455A64", "kh" + k);
    const pic = { n: "ki" + k, e: "pop", d: 200, t: 600 };
    if (k === 7) Object.assign(pic, { l: "wiggle", lo: { amp: 300000, t: 200 } });
    fx.push(
      { n: "k" + k, e: "zoom", d: 0, t: 450, c: true, s: snd },
      pic,
      { n: "kn" + k, e: "flyB", d: 450, t: 500 },
      { n: "kh" + k, e: "fade", d: 650, t: 400 }
    );
  });
  s.addNotes(
    "TRÒ CHƠI VẬN ĐỘNG: BÉ LÀM BÁC NÔNG DÂN (cả lớp cùng chơi)\n" +
    "Chuẩn bị: khoảng trống rộng làm “cánh đồng”; 2–3 vòng thể dục hoặc vạch phấn ở góc lớp làm “nhà”. Nhạc nền tự phát khi mở slide.\n" +
    "Cách chơi: Trẻ đứng rải rác trên “cánh đồng”. Cô bấm chuột hiện từng thẻ (có âm thanh) và hô “Bác nông dân… cày đất!” – trẻ vừa nói “cày, cày, cày” vừa làm động tác theo thẻ. Thứ tự đúng quy trình: gà gáy (vươn vai thức dậy) → cày đất → cấy lúa → tưới nước → bón phân → gặt lúa → gánh lúa về.\n" +
    "Luật chơi: Khi nghe tiếng sấm và cô hô “Trời mưa!” (thẻ cuối), tất cả chạy nhanh về “nhà”. Bạn nào chậm nhất hoặc làm sai động tác thì nhảy lò cò 1 vòng quanh “nhà”.\n" +
    "Chơi 2–3 lần. Lần sau nâng cao: cô hô nhanh dần, hoặc cố ý hô sai thứ tự (VD gặt lúa trước cấy lúa) – trẻ phát hiện, hô “Sai rồi!” và nói lại thứ tự đúng."
  );
  specs.push({ trans: T.conveyor, snd: "whoosh", fx, music: { file: "m_trochoi", vol: 0.45 } });
}

// ================= SLIDE 10 — Trò chơi 2 (để trống) =================
{
  const s = pres.addSlide({ sectionTitle: "Bài mới" });
  const fx = header(s, { title: "TRÒ CHƠI 2", img: "music", fill: "7B1FA2", edge: "4A148C", decor: ["bird", 11.4, 0.3, 0.85] });
  s.addNotes("Trò chơi 2 – cô chèn nội dung trò chơi vào khoảng trống.");
  specs.push({ trans: T.conveyor, snd: "whoosh", fx });
}
