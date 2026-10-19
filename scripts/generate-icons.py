"""
Generates every icon Excel Magic Academy needs, at build time, with no
external image assets. The mark is a simple 3x3 spreadsheet grid with a
highlighted "active cell" and a small sparkle — legible at 16px and at
512px, and easy to regenerate if the brand ever needs to change.
"""
from PIL import Image, ImageDraw

OWL_500 = (46, 158, 91, 255)
OWL_600 = (35, 126, 72, 255)
WHITE = (255, 255, 255, 255)
GOLD_400 = (255, 210, 76, 255)


def draw_mark(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float):
    """Draws the grid+sparkle mark centered at (cx, cy). `scale` = mark half-width in px."""
    if scale < 10:
        # Too small for the detailed mark to read — draw a simple rounded plate instead.
        r = scale * 1.15
        draw.rounded_rectangle([cx - r, cy - r, cx + r, cy + r], radius=max(1, int(r * 0.3)), fill=WHITE)
        return

    grid_size = scale * 1.15
    left, top = cx - grid_size, cy - grid_size
    right, bottom = cx + grid_size, cy + grid_size
    line_w = max(2, int(scale * 0.09))
    corner = int(scale * 0.28)

    # Rounded white grid plate.
    draw.rounded_rectangle([left, top, right, bottom], radius=corner, fill=WHITE)

    # Grid lines (2 verticals + 2 horizontals => 3x3).
    step = (right - left) / 3
    for i in (1, 2):
        x = left + step * i
        draw.line([(x, top + line_w), (x, bottom - line_w)], fill=OWL_500, width=line_w)
        y = top + step * i
        draw.line([(left + line_w, y), (right - line_w, y)], fill=OWL_500, width=line_w)

    # Highlighted "active" cell (top-left).
    pad = min(line_w * 1.6, step * 0.28)
    draw.rounded_rectangle(
        [left + pad, top + pad, left + step - pad, top + step - pad],
        radius=max(1, int(scale * 0.08)),
        fill=OWL_500,
    )

    # Sparkle accent (four-point star) near bottom-right of the plate.
    spark_cx, spark_cy = right + scale * 0.18, bottom - scale * 0.05
    s = scale * 0.42
    star = [
        (spark_cx, spark_cy - s), (spark_cx + s * 0.28, spark_cy - s * 0.28),
        (spark_cx + s, spark_cy), (spark_cx + s * 0.28, spark_cy + s * 0.28),
        (spark_cx, spark_cy + s), (spark_cx - s * 0.28, spark_cy + s * 0.28),
        (spark_cx - s, spark_cy), (spark_cx - s * 0.28, spark_cy - s * 0.28),
    ]
    draw.polygon(star, fill=GOLD_400)


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    bg_radius = 0 if maskable else int(size * 0.22)
    draw.rounded_rectangle([0, 0, size, size], radius=bg_radius, fill=OWL_500)
    # Maskable icons need real content inside the ~80% "safe zone".
    mark_scale = size * (0.30 if maskable else 0.34)
    draw_mark(draw, size // 2, size // 2, mark_scale)
    return img


def make_apple_touch_icon(size: int = 180) -> Image.Image:
    # iOS renders its own rounded-square mask and ignores transparency,
    # so this must be a fully opaque square.
    img = Image.new("RGB", (size, size), OWL_500[:3])
    draw = ImageDraw.Draw(img)
    draw_mark(draw, size // 2, size // 2, size * 0.34)
    return img.convert("RGBA")


def make_favicon(size: int = 64) -> Image.Image:
    return make_icon(size)


if __name__ == "__main__":
    import os

    out_dir = "public/icons"
    os.makedirs(out_dir, exist_ok=True)

    make_icon(192).save(f"{out_dir}/icon-192.png")
    make_icon(512).save(f"{out_dir}/icon-512.png")
    make_icon(192, maskable=True).save(f"{out_dir}/icon-maskable-192.png")
    make_icon(512, maskable=True).save(f"{out_dir}/icon-maskable-512.png")
    make_apple_touch_icon(180).save(f"{out_dir}/apple-touch-icon.png")
    make_icon(32).save(f"{out_dir}/icon-32.png")
    make_icon(16).save(f"{out_dir}/icon-16.png")
    print("Icons written to", out_dir)
