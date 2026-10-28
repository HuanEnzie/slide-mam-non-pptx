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

W, H = 148 * mm, 210 * mm  # A5 portrait
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


c = canvas.Canvas("The-quy-trinh-A5.pdf", pagesize=(W, H))
c.setTitle("Thẻ quy trình của bác nông dân – A5")
c.setAuthor("Từ Thị Thảo – Trường Mầm non Võ Cường")

for path, name, col, num in cards:
    color = HexColor("#" + col)
    # soft tinted page (light, ink-friendly)
    c.setFillColor(white)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # card: 8 mm safe margin for home/office printers
    m = 9 * mm
    cw, ch = W - 2 * m, H - 2 * m
    c.setFillColor(HexColor("#" + col + "12") if False else white)
    c.setStrokeColor(color)
    c.setLineWidth(3.2 * mm)
    c.roundRect(m, m, cw, ch, 12 * mm, stroke=1, fill=1)
    # thin inner dashed line = alignment guide for kids' cut-outs / lamination
    c.setLineWidth(0.5)
    c.setDash(2.2, 2.2)
    c.setStrokeColor(HexColor("#" + col))
    c.roundRect(m + 6 * mm, m + 6 * mm, cw - 12 * mm, ch - 12 * mm, 8 * mm, stroke=1, fill=0)
    c.setDash()

    # picture (fills the middle of the card)
    rd, (iw, ih) = prep(path)
    box_w, box_h = cw - 12 * mm, 112 * mm
    s = min(box_w / iw, box_h / ih)
    dw, dh = iw * s, ih * s
    c.drawImage(rd, (W - dw) / 2, (H - m - 27 * mm) - box_h + (box_h - dh) / 2, dw, dh, mask=None)

    # number badge (top-left, overlapping the border like on the slide)
    r = 15 * mm
    bx, by = m + 21 * mm, H - m - 19 * mm
    c.setFillColor(color)
    c.setStrokeColor(white)
    c.setLineWidth(1.6 * mm)
    c.circle(bx, by, r, stroke=1, fill=1)
    c.setFillColor(white)
    c.setFont("Black", 54)
    c.drawCentredString(bx, by - 54 * 0.36, num)

    # name
    centered(c, name, "Black", 52, m + 27 * mm, col, cw - 24 * mm)
    c.showPage()

c.save()
print("saved")
