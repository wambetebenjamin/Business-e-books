"""
render_png.py
Flattened PNG previews of every slide (background + graphics + ticks + text).
Used to review the design without opening PowerPoint, and to build the
self contained HTML preview.

  python render_png.py            -> preview/slide01.png ...
"""

import os
from PIL import Image, ImageDraw

import irspec as S
import render_common as RC

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "preview"))


def render_slide(slide, scale=1.0, with_bg=True):
    W, H = int(S.STAGE_W * scale), int(S.STAGE_H * scale)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    if with_bg:
        bg = Image.open(os.path.join(RC.ASSETS, slide["bg"])).convert("RGB")
        canvas.paste(bg.resize((W, H), Image.LANCZOS), (0, 0))
    canvas = canvas.convert("RGBA")
    canvas.alpha_composite(RC.render_graphics(slide, scale))
    draw = ImageDraw.Draw(canvas)
    for el in slide["els"]:
        if el["k"] in ("tick", "cross"):
            name = RC.TICK_FILES.get(el["color"], "tick_night.png")
            if el["k"] == "cross":
                name = "mark_cross.png"
            im = RC.load_asset(name, el["w"] * scale)
            canvas.alpha_composite(im, (int(el["x"] * scale), int(el["y"] * scale)))
    for el in slide["els"]:
        if el["k"] == "text":
            RC.render_text(slide, draw, {**el, "x": el["x"] * scale, "y": el["y"] * scale,
                                         "w": el["w"] * scale})
    return canvas.convert("RGB")


def main():
    os.makedirs(OUT, exist_ok=True)
    slides = S.build()
    for sl in slides:
        im = render_slide(sl)
        im.save(os.path.join(OUT, "slide%02d.png" % sl["n"]), optimize=True)
        print("slide%02d" % sl["n"], flush=True)
    # contact sheet for a quick look
    cols, rows = 4, 6
    tw, th = 420, 236
    sheet = Image.new("RGB", (cols * tw, rows * th), (10, 10, 14))
    for i, sl in enumerate(slides):
        im = Image.open(os.path.join(OUT, "slide%02d.png" % sl["n"])).convert("RGB")
        im.thumbnail((tw - 8, th - 8))
        sheet.paste(im, ((i % cols) * tw + 4, (i // cols) * th + 4))
    sheet.save(os.path.join(OUT, "_contact_sheet.png"))
    print("contact sheet ready")


if __name__ == "__main__":
    main()
