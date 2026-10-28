import sys, re
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")
from add_audio import add_audio
import ra_lib
add_audio("un", 4, "mus/nhac-tao-hinh-4p.mp3", "../build/st/music.png", (12.5, 6.74, 0.64), (10.9, 6.83, 1.5, 0.46), 240090, "tao",
          notes_text=None, descr="Nhạc tạo hình – bấm nút tới để phát")
ra_lib.edit(4, "tao_btn", "tao_pause", 240090, False, True,
            lambda t: t.replace("Bắp Ngọt.", "Bắp Ngọt.\nNHẠC: dùng nút “tới” trên bút trình chiếu: bấm 1 lần để phát nhạc không lời “Nhạc tạo hình, nhạc không lời vui tươi cho mầm non” (kênh Trường mầm non Hoa Phượng, YouTube; 4 phút đầu của video), bấm lần 2 để dừng nhạc, bấm lần 3 để sang slide tiếp theo. Nhạc nhỏ dần ở giây thứ 237, phù hợp cho trẻ chia đội và tạo hình.", 1))
print("ok")
