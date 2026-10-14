"""
marks.py
The tick marks used instead of bullets, drawn to match the tick that Microsoft
Word inserts when you pick Wingdings "u" (the standard tick bullet): a heavy
checkmark with squared ends, sitting on the same baseline as the first line of
text.

Writes, into assets/:
  tick_deep.png       the tick used all over the light pages (#006AAD)
  tick_white.png      the tick for the two blue pages
  tick_muted.png      a quieter tick for secondary lists
  mark_cross.png      Wingdings "x" style cross, used only for the "avoid" line
  chevron_light.png   the flow chevrons, light pages and blue pages
  chevron_blue.png
  medallion1..3.png   the three theorist roundels, in the template's blues
  figure_ground.png   the figure and ground diagram
"""

import os
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "assets"))

# the template's palette
FAMILY_ACCENT = {
    "light": "#006AAD",     # the working tick on the light pages
    "blue": "#FFFFFF",      # and on the two blue ones
}
MUTED = "#8FA9BC"
LIGHT = "#FFFFFF"
CROSS = "#C9736A"

SS = 4          # supersample
WIDTH = 512
ASPECT = 0.78   # tick box is a little wider than tall, as in Wingdings


def _hex(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def _poly(p1, p2, p3, w):
    """Outline of a two segment stroke with mitred joints and square ends."""
    def nrm(a, b):
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = (dx * dx + dy * dy) ** 0.5
        return (-dy / L, dx / L)

    def inter(a1, n1, a2, n2):
        # intersection of a1 + t*n1 and a2 + u*n2
        det = n1[0] * (-n2[1]) - n1[1] * (-n2[0])
        if abs(det) < 1e-9:
            return a2
        rx, ry = a2[0] - a1[0], a2[1] - a1[1]
        t = (rx * (-n2[1]) - ry * (-n2[0])) / det
        return (a1[0] + n1[0] * t, a1[1] + n1[1] * t)

    h = w / 2.0
    nA = nrm(p1, p2)
    nB = nrm(p2, p3)
    off = lambda p, n, k: (p[0] + n[0] * k, p[1] + n[1] * k)
    a1, a2 = off(p1, nA, -h), off(p2, nA, -h)
    b1, b2 = off(p2, nB, -h), off(p3, nB, -h)
    c1, c2 = off(p1, nA, h), off(p2, nA, h)
    d1, d2 = off(p2, nB, h), off(p3, nB, h)
    outer = inter(a1, (a2[0] - a1[0], a2[1] - a1[1]), b1, (b2[0] - b1[0], b2[1] - b1[1]))
    inner = inter(c1, (c2[0] - c1[0], c2[1] - c1[1]), d1, (d2[0] - d1[0], d2[1] - d1[1]))
    return [a1, outer, b2, d2, inner, c2, c1]


def tick(color, stroke=0.215, width=WIDTH, aspect=ASPECT):
    """A Word style tick: the Wingdings tick bullet shape, cleanly mitred.

    Two strokes, squared ends, sharp outer point, exactly the silhouette Word
    draws when a list is set to the tick bullet."""
    w = width * SS
    h = int(w * aspect)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lw = int(round(w * stroke))
    p1 = (w * 0.075, h * 0.520)
    p2 = (w * 0.350, h * 0.865)
    p3 = (w * 0.945, h * 0.105)
    d.polygon(_poly(p1, p2, p3, lw), fill=_hex(color) + (255,))
    return im.resize((int(w / SS), int(h / SS)), Image.LANCZOS)


def cross(color, stroke=0.20, width=WIDTH):
    w = width * SS
    h = int(w * 0.92)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lw = int(w * stroke)
    d.line([(w * 0.14, h * 0.14), (w * 0.86, h * 0.86)], fill=_hex(color) + (255,), width=lw)
    d.line([(w * 0.14, h * 0.86), (w * 0.86, h * 0.14)], fill=_hex(color) + (255,), width=lw)
    return im.resize((int(w / SS), int(h / SS)), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    tick(FAMILY_ACCENT["light"]).save(os.path.join(OUT, "tick_deep.png"))
    tick(FAMILY_ACCENT["blue"]).save(os.path.join(OUT, "tick_white.png"))
    tick(MUTED).save(os.path.join(OUT, "tick_muted.png"))
    cross(CROSS).save(os.path.join(OUT, "mark_cross.png"))
    print("marks written to", OUT)


if __name__ == "__main__":
    main()


def chevron(color, w=220, h=220, thickness=0.075):
    """A thin double chevron for the flow chains between words."""
    im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    col = _hex(color) + (255,)
    lw = max(2, int(w * SS * thickness))
    W_, H_ = im.size
    for k, a in ((0.0, 255), (0.30, 150)):
        off = k * W_
        d.line([(W_ * (0.16 + k * 0.30), H_ * 0.24), (W_ * (0.44 + k * 0.30), H_ * 0.5),
                (W_ * (0.16 + k * 0.30), H_ * 0.76)], fill=_hex(color) + (a,), width=lw,
               joint="curve")
    return im.resize((w, h), Image.LANCZOS)


def ring_medallion(initials, color, size=420, ring=0.028, font_path=None):
    """A flat, quiet roundel: one thin ring, initials in the middle. No gloss."""
    from PIL import ImageFont
    w = size * SS
    im = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    col = _hex(color)
    d.ellipse([w * 0.02, w * 0.02, w * 0.98, w * 0.98], outline=col + (165,),
              width=max(2, int(w * ring)))
    fp = font_path or os.path.join(os.path.dirname(OUT), "build", "fonts", "Raleway-Bold.ttf")
    if not os.path.exists(fp):
        fp = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font = ImageFont.truetype(fp, int(w * 0.34))
    bb = d.textbbox((0, 0), initials, font=font)
    d.text(((w - (bb[2] - bb[0])) / 2 - bb[0], (w - (bb[3] - bb[1])) / 2 - bb[1] - w * 0.01),
           initials, font=font, fill=col + (235,))
    return im.resize((size, size), Image.LANCZOS)


def figure_ground(color, size=760):
    """The figure and ground idea, drawn as quietly as possible: one solid dot
    inside one thin circle, over a faint halo."""
    w = size * SS
    im = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    col = _hex(color)
    # the ground: a wide faint disc
    d.ellipse([w * 0.06, w * 0.06, w * 0.94, w * 0.94], fill=col + (26,))
    d.ellipse([w * 0.14, w * 0.14, w * 0.86, w * 0.86], outline=col + (95,),
              width=max(2, int(w * 0.006)))
    # the figure: one solid mark that steps forward
    r = w * 0.105
    d.ellipse([w * 0.5 - r, w * 0.5 - r, w * 0.5 + r, w * 0.5 + r], fill=col + (250,))
    return im.resize((size, size), Image.LANCZOS)


def build_marks():
    os.makedirs(OUT, exist_ok=True)
    tick(FAMILY_ACCENT["light"]).save(os.path.join(OUT, "tick_deep.png"))
    tick(FAMILY_ACCENT["blue"]).save(os.path.join(OUT, "tick_white.png"))
    tick(MUTED).save(os.path.join(OUT, "tick_muted.png"))
    chevron("#4595C2").save(os.path.join(OUT, "chevron_light.png"))
    chevron("#CFE9F8").save(os.path.join(OUT, "chevron_blue.png"))
    cross(CROSS).save(os.path.join(OUT, "mark_cross.png"))
    ring_medallion("FP", "#4595C2").save(os.path.join(OUT, "medallion1.png"))
    ring_medallion("LP", "#2E8AB8").save(os.path.join(OUT, "medallion2.png"))
    ring_medallion("PG", "#006AAD").save(os.path.join(OUT, "medallion3.png"))
    figure_ground("#4595C2").save(os.path.join(OUT, "figure_ground.png"))
    print("marks and quiet graphics written to", OUT)


if __name__ == "__main__":
    build_marks()
