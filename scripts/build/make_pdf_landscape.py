import io
from PIL import Image, ImageFilter
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

pdfmetrics.registerFont(TTFont("Black", "C:/Windows/Fonts/seguibl.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "C:/Windows/Fonts/segoeuib.ttf"))

W, H = 210 * mm, 148 * mm  # A5 landscape
cards = [
    ("img1.png", "Làm đất", "8D6E63", "1"),
    ("img2.png", "Gieo trồng", "43A047", "2"),
    ("img3.png", "Chăm sóc cây", "1E88E5", "3"),
    ("img4.png", "Thu hoạch", "F29E02", "4"),
]


def prep(path):
    im = Image.open(path).convert("RGBA")
    # crop to content, then upscale 3x (Lanczos) + light sharpening so it prints crisply on A5
    im = im.crop(im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
    im = im.resize((im.width * 3, im.height * 3), Image.LANCZOS)
    rgb = im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
    flat = Image.new("RGB", im.size, (255, 255, 255))
    flat.paste(rgb, mask=im.getchannel("A"))
    buf = io.BytesIO()
    flat.save(buf, "JPEG", quality=93, subsampling=0, dpi=(300, 300))
    buf.seek(0)
    return ImageReader(buf), flat.size


def centered(c, text, font, size, y, color, maxw):
    while pdfmetrics.stringWidth(text, font, size) > maxw:
        size -= 1
    c.setFillColor(HexColor("#" + color))
    c.setFont(font, size)
    c.drawCentredString(W / 2, y, text)


def wrap(text, font, size, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines


c = canvas.Canvas("The-quy-trinh-A5-ngang.pdf", pagesize=(W, H))
c.setTitle("Thẻ quy trình của bác nông dân – A5 ngang")
c.setAuthor("Từ Thị Thảo – Trường Mầm non Võ Cường")

for path, name, col, num in cards:
    color = HexColor("#" + col)
    c.setFillColor(white)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # card with 9 mm safe margin for office printers
    m = 9 * mm
    cw, ch = W - 2 * m, H - 2 * m
    c.setFillColor(white)
    c.setStrokeColor(color)
    c.setLineWidth(3.0 * mm)
    c.roundRect(m, m, cw, ch, 11 * mm, stroke=1, fill=1)
    c.setLineWidth(0.5)
    c.setDash(2.2, 2.2)
    c.roundRect(m + 6 * mm, m + 6 * mm, cw - 12 * mm, ch - 12 * mm, 7 * mm, stroke=1, fill=0)
    c.setDash()

    # picture on the left
    rd, (iw, ih) = prep(path)
    x0, x1 = m + 8 * mm, m + 8 * mm + 108 * mm
    box_w, box_h = x1 - x0, ch - 16 * mm
    s_ = min(box_w / iw, box_h / ih)
    dw, dh = iw * s_, ih * s_
    c.drawImage(rd, x0 + (box_w - dw) / 2, m + 8 * mm + (box_h - dh) / 2, dw, dh, mask=None)

    # right column: big number badge + step name
    cx = (x1 + (W - m - 6 * mm)) / 2 + 2 * mm
    colw = (W - m - 8 * mm) - x1 - 4 * mm
    r = 19 * mm
    by = H / 2 + 18 * mm
    c.setFillColor(color)
    c.setStrokeColor(white)
    c.setLineWidth(1.6 * mm)
    c.circle(cx, by, r, stroke=1, fill=1)
    c.setFillColor(white)
    c.setFont("Black", 66)
    c.drawCentredString(cx, by - 66 * 0.36, num)

    size = 40
    lines = wrap(name, "Black", size, colw)
    while max(pdfmetrics.stringWidth(l, "Black", size) for l in lines) > colw:
        size -= 1
    c.setFillColor(color)
    c.setFont("Black", size)
    lh = size * 1.2
    ty = H / 2 - 17 * mm
    for k, l in enumerate(lines):
        c.drawCentredString(cx, ty - k * lh, l)
    c.showPage()

c.save()
print("saved")
