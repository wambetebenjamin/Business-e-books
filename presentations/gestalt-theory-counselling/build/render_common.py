"""
render_common.py
Shared drawing helpers: colour tokens, image loading, soft glows and text
painting with letter spacing. Used by the PNG preview renderer and to bake
the decorative graphics layer that the PowerPoint file references.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

import irspec as S

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.abspath(os.path.join(HERE, "..", "assets"))
DEJAVU = "/usr/share/fonts/truetype/dejavu/"

# the template's two colourways, light pages and blue pages
TOKENS = {
    "light": dict(heading="#4595C2", text="#33506B", muted="#5F7E97", dim="#8FA9BC",
                  accent="#4595C2", accent2="#5DC5E6", ink="#0E2A3D", soft="#DCEAF4",
                  ghost="#D8E6F2"),
    "blue": dict(heading="#FFFFFF", text="#FFFFFF", muted="#D8EBF7", dim="#B7D6E9",
                 accent="#CFE9F8", accent2="#A7DCF3", ink="#0A3550", soft="#3C86B4",
                 ghost="#67A9CE"),
}

TICK_FILES = {"deep": "tick_deep.png", "light": "tick_white.png", "muted": "tick_muted.png",
              "cross": "mark_cross.png", "ember": "mark_cross.png", "gold": "tick_deep.png",
              "mint": "tick_deep.png", "lilac": "tick_deep.png", "blue": "tick_deep.png",
              "night": "tick_deep.png", "dawn": "tick_deep.png", "forest": "tick_deep.png",
              "rose": "tick_deep.png", "violet": "tick_deep.png"}

# the template's own faces; it ships no italics, so a slanted run is set upright
FONT_FILES = {
    ("Poppins", False): "Poppins-Regular.ttf",
    ("Poppins", True): "Poppins-Bold.ttf",
    ("Raleway", False): "Raleway-Regular.ttf",
    ("Raleway", True): "Raleway-Bold.ttf",
}

_FONT_CACHE = {}


def color(slide, token):
    """Resolve a colour token or literal hex for a slide's palette."""
    if token is None:
        return "#FFFFFF"
    if token.startswith("#"):
        return token
    return TOKENS[slide["palette"]].get(token, "#FFFFFF")


def rgba(hexcolor, alpha=1.0):
    v = hexcolor.lstrip("#")
    return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), int(round(255 * alpha)))


def _font(font, bold, italic, size_px):
    """size_px is expressed in stage pixels (the preview canvas is 1:1 with the stage)."""
    key = (font, bold, int(round(size_px)))
    if key not in _FONT_CACHE:
        family = S.FONTS.get(font, "Poppins")
        name = FONT_FILES.get((family, bool(bold)))
        path = os.path.join(HERE, "fonts", name) if name else (
            DEJAVU + ("DejaVuSansMono-Bold.ttf" if bold else "DejaVuSansMono.ttf"))
        _FONT_CACHE[key] = ImageFont.truetype(path, int(size_px))
    return _FONT_CACHE[key]


# ---------------------------------------------------------------------------
# graphics layer
# ---------------------------------------------------------------------------

def load_asset(name, width_px=None, down=False):
    im = Image.open(os.path.join(ASSETS, name)).convert("RGBA")
    if down:
        im = im.transpose(Image.ROTATE_270)
    if width_px:
        h = max(1, int(round(im.size[1] * width_px / im.size[0])))
        im = im.resize((int(round(width_px)), h), Image.LANCZOS)
    return im


def soft_glow(w, h, color_hex, alpha):
    """A true radial halo: strongest at the centre, fading to nothing at the rim."""
    import numpy as np
    w, h = max(4, int(w)), max(4, int(h))
    n = 220
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    cx = cy = (n - 1) / 2.0
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    fall = np.clip(1.0 - r, 0, 1) ** 2.1
    arr = np.zeros((n, n, 4), np.uint8)
    arr[:, :, 0:3] = np.array(rgba(color_hex)[:3], np.uint8)
    arr[:, :, 3] = (fall * 255 * min(1.0, alpha)).astype(np.uint8)
    im = Image.fromarray(arr, "RGBA").resize((w, h), Image.BICUBIC)
    return im


def render_graphics(slide, scale=1.0):
    """Bake every non text, non tick element of a slide into one RGBA layer."""
    W = int(S.STAGE_W * scale)
    H = int(S.STAGE_H * scale)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for el in slide["els"]:
        k = el["k"]
        if k == "bg" or k in ("text", "tick", "cross"):
            continue
        if k == "glow":
            g = soft_glow(el["w"] * scale, el["h"] * scale, color(slide, el["color"]),
                          el["alpha"])
            layer.alpha_composite(g, (int(el["x"] * scale - g.size[0] * 0.0),
                                      int(el["y"] * scale - g.size[1] * 0.0)))
        elif k == "chev":
            pal = slide["palette"]
            name = "chevron_%s.png" % pal
            im = load_asset(name, el["w"] * scale)
            if el.get("down"):
                im = im.transpose(Image.ROTATE_270)
            if el.get("alpha", 1.0) < 1.0:
                a = im.getchannel("A").point(lambda v: int(v * el["alpha"]))
                im.putalpha(a)
            layer.alpha_composite(im, (int(el["x"] * scale), int(el["y"] * scale)))
        elif k == "img":
            im = load_asset(el["src"], el["w"] * scale)
            if el.get("h"):
                im = im.resize((int(el["w"] * scale), int(el["h"] * scale)), Image.LANCZOS)
            if el.get("alpha", 1.0) < 1.0:
                a = im.getchannel("A").point(lambda v: int(v * el["alpha"]))
                im.putalpha(a)
            layer.alpha_composite(im, (int(el["x"] * scale), int(el["y"] * scale)))
        elif k == "line":
            d = ImageDraw.Draw(layer)
            d.line([el["x1"] * scale, el["y1"] * scale, el["x2"] * scale, el["y2"] * scale],
                   fill=rgba(el["color"], el["alpha"]), width=max(1, int(el["width"] * scale)))
    return layer


# ---------------------------------------------------------------------------
# text painting (preview renderer)
# ---------------------------------------------------------------------------

def wrap_runs(runs, maxw):
    """Greedy word wrap that keeps runs together. Returns list of run lists."""
    words = []
    for r in runs:
        parts = r["s"].split(" ")
        for i, w in enumerate(parts):
            words.append((w, r, i > 0))
    lines, cur, curw = [], [], 0.0
    space = None
    for word, r, _ in words:
        f = _font(r["font"], r["bold"], r["italic"], r["size"])
        wpx = f.getlength(word + " ") + (r.get("spacing") or 0) * len(word)
        if space is None:
            space = f.getlength(" ")
        if cur and curw + wpx > maxw:
            lines.append(cur)
            cur, curw = [], 0.0
        cur.append((word, r))
        curw += wpx
    if cur:
        lines.append(cur)
    return lines


def draw_runs(draw, runs, x, y, maxw, align="l", spacing_scale=1.0, line=None):
    """Draw one paragraph; returns the height consumed."""
    lines = wrap_runs(runs, maxw)
    size = max(r["size"] for r in runs)
    lh = (line or 1.32) * S.LH * size
    for line in lines:
        widths = []
        for word, r in line:
            f = _font(r["font"], r["bold"], r["italic"], r["size"])
            wpx = f.getlength(word + " ")
            if r.get("spacing"):
                wpx += r["spacing"] * len(word) * spacing_scale
            widths.append(wpx)
        total = sum(widths)
        cx = x if align == "l" else (x + maxw / 2 - total / 2 if align == "c" else x + maxw - total)
        for (word, r), wpx in zip(line, widths):
            f = _font(r["font"], r["bold"], r["italic"], r["size"])
            col = r.get("_color") or (255, 255, 255, 255)
            if r.get("spacing"):
                px = cx
                for ch in word:
                    draw.text((px, y), ch, font=f, fill=col)
                    px += f.getlength(ch) + r["spacing"] * spacing_scale
                draw.text((px, y), " ", font=f, fill=col)
            else:
                draw.text((cx, y), word, font=f, fill=col)
            cx += wpx
        y += lh
    return len(lines) * lh


def render_text(slide, draw, el):
    """Paint a text element (used by the flattened preview)."""
    x, y, w = el["x"], el["y"], el["w"]
    # vertical anchor: measure first
    paras = el["paras"]
    total = 0
    for p in paras:
        for r in p["runs"]:
            r["_color"] = rgba(color(slide, r.get("color", "text")), r.get("alpha", 1.0))
        size = max(r["size"] for r in p["runs"])
        lf = p.get("line") or el.get("line") or 1.32
        lh = lf * S.LH * size
        n = len(wrap_runs(p["runs"], w))
        total += n * lh + p.get("space_before", 0)
    if el.get("anchor") == "c":
        y -= total / 2
    elif el.get("anchor") == "b":
        y -= total
    for p in paras:
        if p.get("space_before"):
            y += p["space_before"]
        align = p.get("align") or el.get("align", "l")
        y += draw_runs(draw, p["runs"], x, y, w, align,
                       line=(p.get("line") or el.get("line") or 1.32))
    return y
