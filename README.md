# slide-mam-non-pptx

Skill cho Claude Code: dựng và chỉnh slide PowerPoint sinh động cho lớp mầm non (sticker GPT, hiệu ứng OOXML, SFX, nhạc, trò chơi "Rung chuông vàng").

Mẫu kèm theo: `san-pham/Kham-pha-nghe-nong-v24.pptx` (22 slide, hội giảng "Khám phá nghề nông").

## Cài

```bash
git clone <repo> ~/.claude/skills/slide-mam-non-pptx
```

Claude Code tự nhận skill nhờ `SKILL.md`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `SKILL.md` | Hướng dẫn chính cho Claude |
| `scripts/build/` | `anim.js` (thư viện hiệu ứng), `dedupe.js`, bộ dựng gốc, tạo PDF thẻ A5 |
| `scripts/edit/` | Các script sửa theo từng phiên bản, dùng làm mẫu |
| `scripts/audio/` | Chèn/cắt âm thanh |
| `scripts/com/` | Kiểm tra bằng PowerPoint COM (Windows) |
| `docs/HUONG-DAN.md` | Nhật ký các phiên bản |
| `san-pham/` | Bản slide mẫu |

## Lưu ý

- Gói không kèm file nhạc, ảnh sticker và video rời. Riêng file pptx mẫu có nhúng sẵn nhạc (Mixkit, một số bài lấy từ YouTube/TikTok do giáo viên cung cấp), nên giữ repo ở chế độ **private**.
- Script COM chỉ chạy trên Windows có cài PowerPoint.
