---
name: slide-mam-non-pptx
description: Dựng và chỉnh bộ slide PowerPoint (.pptx) sinh động cho lớp mầm non / hội giảng — hình dán (sticker) do GPT vẽ, nền hoạt hình, hiệu ứng động tự viết bằng OOXML (pop, bay, lắc, lặp), SFX và nhạc nền, điều khiển chỉ bằng 2 nút tới/lui của bút trình chiếu. Dùng khi người dùng nhờ làm hoặc sửa slide cho trẻ ("slide hội giảng", "thêm âm thanh vào slide", "thêm hiệu ứng", "trò chơi rung chuông vàng", "đổi hình ở slide N", "giảm/tăng âm lượng SFX"), hoặc sửa trực tiếp file .pptx bằng cách giải nén XML. Kèm mẫu bộ "Khám phá nghề nông" (22 slide).
---

# Slide mầm non: dựng và sửa .pptx có hiệu ứng, âm thanh

Bộ kỹ năng rút ra từ dự án "Khám phá nghề nông" (chủ đề Nghề nghiệp, lớp 5–6 tuổi, Trường MN Võ Cường). Mẫu hoàn chỉnh nằm ở `san-pham/Kham-pha-nghe-nong-v24.pptx`.

Cần đọc thêm skill `pptx` có sẵn của Claude (các script `clean.py`, `add_slide.py`, `office/validate.py`). Skill này bổ sung phần riêng cho slide trẻ em.

## Quy tắc cứng của người dùng (giáo viên)

1. **Bút trình chiếu chỉ có 2 nút tới/lui.** Mọi thứ phải chạy bằng "tới": không bắt bấm chuột vào nút. Nhạc/âm thanh luôn xuất hiện **sau hình ảnh**: tới = phát, tới nữa = dừng, tới nữa = sang slide.
2. Hình đồ ăn, dụng cụ, sản phẩm: **không có mặt, mắt, miệng**. Chỉ nhân vật (bác nông dân, trẻ em, con vật) mới có nét mặt.
3. **Không ghi đè bản cũ.** Mỗi lần sửa lưu thành phiên bản mới (`...-v23.pptx` → `...-v24.pptx`).
4. Trả lời người dùng bằng tiếng Việt, ngắn, nói rõ cái gì đã kiểm tra, cái gì **chưa nghe/chưa xem** (hiệu ứng thật, âm thanh thật).
5. Phông chữ: `Segoe UI Black` (tiêu đề) và `Segoe UI`. Không dùng Comic Sans (thiếu dấu tiếng Việt). Khổ 13,333 × 7,5 inch.

## Quy trình sửa một bản .pptx có sẵn

```
cp Kham-pha-nghe-nong-vN.pptx src.pptx
rm -rf un && mkdir un && cd un && unzip -q ../src.pptx     # giải nén
# sửa ppt/slides/slideX.xml, ppt/slides/_rels/slideX.xml.rels, ppt/notesSlides/..., ppt/media/...
python <skill pptx>/scripts/clean.py un                    # xoá file mồ côi
# nén lại, [Content_Types].xml phải đứng ĐẦU zip
node scripts/build/dedupe.js out.pptx                      # gộp media trùng cho nhẹ
python <skill pptx>/scripts/office/validate.py --original src.pptx out.pptx
```

Lưu ý:
- Thứ tự slide nằm ở `ppt/presentation.xml` (`sldIdLst`), **không** theo số file `slideN.xml`. Đếm theo `sldIdLst` rồi tra `presentation.xml.rels` để biết slide thứ k là file nào. Nếu có `p14:sectionLst` thì sửa theo.
- `add_slide.py` chạy KHÔNG kèm `-I` (nếu không sẽ lỗi `No module named 'office'`).
- Hai `cNvPr id` trùng nhau làm PowerPoint báo "could not open file" (hay gặp với shape media của pptxgenjs). Luôn đánh lại id trùng.
- Xoá shape thì phải xoá luôn hiệu ứng trong `<p:timing>` (mọi `spTgt spid=...`) và `<p:bldP spid=...>`. Xem `scripts/edit/edit23.py` (dùng lxml, bỏ các `p:par` chỉ trỏ vào shape bị xoá).
- Thay hình giữ nguyên khung: `fit()` trong `edit16.py` / `edit23.py` căn ảnh mới vào đúng hộp cũ.
- Thay SFX: đổi `Target` của `rIdSfx...` trong `.rels` và `name="..."` của `sndTgt`.
- Chỉnh âm lượng SFX: các file `ppt/media/audio*.wav` (22050 Hz, mono, PCM 16-bit) là SFX; giảm/tăng bằng `ffmpeg -af volume=-6dB -c:a pcm_s16le`. Nhạc nền là `.mp3`, mức đo bằng `ffmpeg -af ebur128=peak=true`. Thang đã dùng: nhạc hơn -17 LUFS thì bé, khoảng -12 LUFS là to vừa; đỉnh không vượt -0,5 dBFS (dùng `alimiter`).
- Nhạc có nút bật/tắt: `vol="..."` trên `p:cMediaNode`; nhạc phát khi bấm "tới" nhờ nhóm `mediacall playFrom(0.0)` / `stop` do `buildTiming` tạo.

## Thư viện hiệu ứng `scripts/build/anim.js`

`buildTiming(effects, idOf, isSp, opt)` sinh cây `<p:timing>`; `addMotion` gắn vào file.

- Vào: `pop`, `zoom`, `spin`, `flyT/B/L/R`, `fade`, `wipe`, `appear`.
- Lặp: `bob`, `drift`, `across`, `spin`, `pulse`, `wiggle`.
- Thoát: `x` (`xt`, `xd`, `xs`). Nhấn mạnh phóng to: `g` (kèm đường đi `{pct,t,dx,dy}`).
- `s:"tên"` chèn SFX; `c:true` mở nhóm bấm "tới" mới (mọi thứ trước nhóm đó tự chạy).
- Mẫu cách dùng: `scripts/edit/edit11.js`, `edit7.js`, `make_game.js`.

## Trò chơi "Rung chuông vàng" (`scripts/edit/make_game.js`)

Một slide giới thiệu + 7 slide câu hỏi. Mỗi câu 3–4 đáp án theo màu **ĐỎ / TÍM / XANH LÁ / VÀNG** (không dùng xanh dương). Bấm "tới" 1 lần: các ô sai biến mất, ô đúng phóng to + chuông + sao; "tới" nữa sang câu sau. Câu 7 là câu hỏi mở: chỉ hiện câu hỏi, cô hỏi miệng, một lần "tới" hiện "ĐÁP ÁN" 4 bước (Làm đất → Gieo trồng → Chăm sóc → Thu hoạch).

## Hình do GPT vẽ

Dùng skill `gpt` (proxy `openai-oauth`, mặc định http://127.0.0.1:10531/v1, model `gpt-image-2`):

```
npx -y -p openai-oauth -p zod openai-oauth --detach
powershell -File ~/.claude/skills/gpt/gen-image.ps1 -Prompt "..." -Out out.png -Size 1024x1024
```

Công thức prompt cho sticker: "Die-cut sticker with a thick clean white border all around and NO drop shadow, the whole background is one perfectly flat solid pure magenta color (#FF00FF)... No text". Sau đó khử nền magenta bằng `scipy.ndimage.label` (vùng magenta nối với biên ảnh), cắt `getbbox()`, thu về ~900 px rộng cho nhẹ. Nhân vật dùng nón lá, áo bà ba nâu; đồ vật không mặt.
Prompt đã dùng: `scripts/build/prompts*.txt`.

## Kiểm tra bằng PowerPoint COM (không chụp màn hình!)

Chạy bằng `cscript //nologo file.vbs` (cwd chứa file pptx):

- `scripts/com/export_slides.vbs <file.pptx> <tiền tố>`: xuất slide ra PNG để xem.
- `scripts/com/click_counts.vbs`: đếm hiệu ứng và số lần bấm "tới" mỗi slide.
- `scripts/com/states_before_after.vbs`: giả lập trạng thái trước/sau khi bấm bằng cách bật/tắt shape rồi xuất ảnh.

**Tuyệt đối không chụp màn hình khi chạy thử trình chiếu**: lần trước đã vô tình chụp trình duyệt riêng tư của người dùng. Chỉ dùng COM (`Export`, `SlideShowSettings.Run`, `View.Next`, `Player(spid).State`).

## Nhạc / âm thanh

- SFX và nhạc nền Mixkit (miễn phí cho trình chiếu): ghi nguồn trong Notes của slide.
- Tải YouTube bằng Python API của `yt-dlp` (kèm `yt-dlp-ejs`, `js_runtimes: node`); TikTok bị chặn nên nhờ người dùng gửi mp3.
- `scripts/audio/*.py`: chèn nhạc/tiếng vỗ tay vào slide, cắt, chuẩn hoá. Các file này giả định cấu trúc `un/` như trên; đọc kỹ trước khi chạy.
- Không đưa file nhạc rời vào repo. File pptx mẫu có nhúng sẵn nhạc nên repo để private.

## Dựng lại từ đầu

Cần Node.js: `cd scripts/build && npm install` (pptxgenjs, jszip). Bản đầu `build.js` (cần thư mục `st/` sticker và `aud/` âm thanh, **không** có trong gói, tự tạo lại bằng GPT + Mixkit). Cách thực tế hơn: mở `san-pham/Kham-pha-nghe-nong-v24.pptx`, giải nén và sửa theo mẫu `scripts/edit/edit*.py`.

## Danh sách phiên bản chính (mẫu 22 slide)

1 Chào · 2 Ổn định (nút vỗ tay) · 3 Bài mới (rap 15 s) · 4 Phần 1 (nhạc tạo hình 4 phút) · 5 Đội Lúa Vàng: công việc · 6 Quy trình làm việc · 7 Đội Cải Xanh: dụng cụ · 8 Bác nông dân & chú trâu · 9 Máy móc ngày nay · 10 Đội Bắp Ngọt: nông sản · 11 Phần 2 · 12 Trò chơi 1 · 13–19 Rung chuông vàng câu 1–7 · 20 Trò chơi 2 "Cấy lúa thần tốc" · 21 Kết thúc · 22 Cảm ơn.
Chi tiết từng lần sửa: `docs/HUONG-DAN.md`.
