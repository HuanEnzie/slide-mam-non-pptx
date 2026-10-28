# Slide "Khám phá nghề nông" và "Hoạt động góc" – Trường MN Võ Cường

## san-pham/ (file dùng ngay)
| File | Nội dung |
|---|---|
| `Kham-pha-nghe-nong-v8.pptx` | Bộ slide hội giảng "Khám phá nghề nông" (15 slide, có hiệu ứng, SFX, nhạc nền Mixkit) |
| `Hoat-dong-goc.pptx` | Bộ slide "Hoạt động góc", chủ đề Nghề nghiệp (6 slide) |
| `The-quy-trinh-A5.pdf` | 4 thẻ quy trình của bác nông dân, A5 dọc, mỗi thẻ 1 trang |
| `The-quy-trinh-A5-ngang.pdf` | Như trên, A5 ngang |

Khi in PDF: chọn khổ A5, "Kích thước thực" (Actual size), không chọn "Vừa trang".
Chỉ cần chép đúng 1 file .pptx sang máy trình chiếu (nhạc và âm thanh đã nhúng sẵn).

## ma-nguon/ (code, để sửa và dựng lại)
- `build/` – bộ dựng slide "Khám phá nghề nông" bản đầu (v2): `build.js` (nội dung slide),
  `anim.js` (hiệu ứng, chuyển cảnh, âm thanh, nhạc nền), `dedupe.js` (gộp ảnh trùng cho nhẹ file),
  `aud/wav` (SFX Mixkit), `aud/mus` (nhạc Mixkit), `st/` (sticker và nền đã cắt sẵn).
- `v7/edit.js` – đoạn sửa slide Đội Bắp Ngọt (3 ảnh bác nông dân) và thêm slide trống trên bản v7 của GPT.
- `goc/build_goc.js` – dựng bộ "Hoạt động góc" (6 slide); `goc/st/` là sticker/nền riêng của bộ này.
- `the/make_pdf.py`, `the/make_pdf_landscape.py` – tạo PDF thẻ A5 dọc / ngang.

### Dựng lại
1. Cài Node.js, vào `ma-nguon/build` chạy `npm install` (cần pptxgenjs và jszip).
2. `ma-nguon/goc`: `node build_goc.js` rồi `node ../build/dedupe.js Hoat-dong-goc.pptx`.
3. PDF thẻ: `pip install reportlab pillow pymupdf`, vào `ma-nguon/the` chạy `python make_pdf_landscape.py`.

Ghi chú: bản v3–v7 trong thư mục outputs của Codex là các bản trung gian do GPT chỉnh;
v8 là bản mới nhất, sửa trực tiếp trên v7 (giữ nguyên phần GPT đã làm).
Âm thanh/nhạc: nguồn mixkit.co (miễn phí, dùng được cho trình chiếu).
Hình: do GPT (gpt-image-2) vẽ qua proxy openai-oauth; prompt nằm trong `build/prompts*.txt`.

## Cập nhật bản v13 (21/10/2026)
- Thứ tự đội: Lúa Vàng (công việc của bác nông dân, slide 5–6) → Cải Xanh (dụng cụ, slide 7) → Bắp Ngọt (nông sản, slide 10).
- Slide 4 có nhạc “Nhạc tạo hình” 4 phút (bấm “tới” để phát, bấm “tới” nữa để dừng). Mã: ma-nguon/v11/audio4.py, ra_lib.py, fix13.py.

## Cập nhật bản v19 (26/10/2026)
- Bỏ "Trò chơi 2: Sáng tạo tranh từ hạt". "Cấy lúa thần tốc" thành Trò chơi 2.
- Trò chơi 1 mới: "Rung chuông vàng" = slide giới thiệu + 7 slide câu hỏi (đáp án theo màu; bấm "tới" 1 lần hiện đáp án, 1 lần nữa sang câu sau).
- Mã dựng: ma-nguon/v11/make_game.js (cần bản anim.js mới trong build/ có hiệu ứng exit + grow). Hình: ma-nguon/v11/hinh-rung-chuong.

## Cập nhật bản v20 (26/10/2026)
- Trò chơi Rung chuông vàng: màu "xanh dương" đổi thành TÍM; ô màu đáp án to hơn; câu 5 thay cái búa bằng hộp phấn.

## Cập nhật bản v23 (26/10/2026)
- Slide 5 (Đội Lúa Vàng): thẻ 3 đổi từ "Làm ở nông trường" thành "Làm ở cánh đồng" (hình bác nông dân gặt lúa; âm thanh thẻ đổi từ tiếng máy kéo sang tiếng chim).
- Slide 8 (bác nông dân và chú trâu): nhạc to hơn khoảng 5 dB (-16,3 → -11,6 LUFS).
- Slide 10 (Đội Bắp Ngọt): ổi → táo; bỏ "Gia đình gà" và "Bò sữa", còn trứng gà + sữa.
- Mã: ma-nguon/v11/edit23.py.

## Cập nhật bản v24 (26/10/2026)
- Toàn bộ SFX (19 file wav trong ppt/media) giảm 6 dB; nhạc nền và nhạc bài hát giữ nguyên.
