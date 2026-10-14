"""
scenes.py
Backgrounds for the deck, copied from the new book template.

The template's theme is an almost white page, big soft white "petal" curves
with a gentle drop shadow so they read as curved surfaces, a pale blue wash
drifting in from one side, the striped disc motif in a corner, and photography
sitting quietly behind the layout. Its palette is #4595C2, #5DC5E6 and #006AAD
on white.

This module repaints that theme for our own deck:

  light scenes   white page, one pale blue wash, a white petal with a soft
                 shadow, a faint striped disc, and a whisper of one of our two
                 photographs: only the dark shapes of the empty chairs or of two
                 people talking, dropped in as a faint blue silhouette
  blue scenes    the cover and the closing slide: the template's blue field with
                 white petals and the same silhouette whisper

Everything is deliberately low contrast so the type keeps all of the attention.

  python scenes.py      rewrites assets/bg01.jpg ... assets/bg22.jpg
"""

import json
import math
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "assets"))
ART = os.path.join(HERE, "art")
W, H = 2400, 1350

# ---------------------------------------------------------------------------
# the template palette
# ---------------------------------------------------------------------------

BLUE = "#4595C2"          # the template's heading blue
DEEP = "#006AAD"          # its dark blue
SKY = "#5DC5E6"           # its light blue
PAPER_TOP = "#FFFFFF"
PAPER_BOTTOM = "#F1F7FB"
BLUE_TOP = "#5AA4CC"
BLUE_BOTTOM = "#2A78A9"

FAMILIES = {
    "light": dict(accent=BLUE, base=(PAPER_TOP, PAPER_BOTTOM), sail="#FFFFFF", shade="#D8E4EF",
                  disc="#C6E0F2", disc_a=0.40, ink="#7C9FBC", ink_a=0.072,
                  fill=0.90, shadow=0.55, grain=1.6, vignette=0.035),
    "blue": dict(accent=BLUE, base=(BLUE_TOP, BLUE_BOTTOM), sail="#FFFFFF", shade="#1C6A99",
                 disc="#EAF5FC", disc_a=0.20, ink="#0B4E78", ink_a=0.22,
                 fill=1.00, shadow=0.42, grain=1.5, vignette=0.070),
}

PHOTOS = ("empty_chair.jpg", "conversation.jpg")


def hx(c):
    c = c.lstrip("#")
    return np.array([int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)], dtype=np.float32)


# ---------------------------------------------------------------------------
# small painting helpers
# ---------------------------------------------------------------------------

def smoothstep(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def grid():
    return np.mgrid[0:H, 0:W].astype(np.float32)


def diagonal(a, b, tilt=0.42):
    """A soft diagonal wash from colour a (top left) to colour b."""
    yy, xx = grid()
    t = smoothstep(np.clip((1 - tilt) * (xx / W) + tilt * (yy / H), 0, 1))[:, :, None]
    return hx(a)[None, None, :] * (1 - t) + hx(b)[None, None, :] * t


def wash(color, at=(0.5, 0.5), radius=(0.7, 0.6), alpha=0.5, power=1.6):
    """A wide elliptical wash of colour, strongest at `at`."""
    yy, xx = grid()
    d = np.sqrt(((xx / W - at[0]) / radius[0]) ** 2 + ((yy / H - at[1]) / radius[1]) ** 2)
    return (np.clip(1.0 - d, 0, 1) ** power)[:, :, None] * hx(color)[None, None, :] * alpha


def mask_blur(mask, radius, offset=(0, 0)):
    """Gaussian blur of a 0..1 float mask, optionally slid before blurring."""
    if offset != (0, 0):
        mask = np.roll(np.roll(mask, int(offset[1]), axis=0), int(offset[0]), axis=1)
    im = Image.fromarray(np.clip(mask * 255, 0, 255).astype(np.uint8), "L")
    im = im.filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(im, dtype=np.float32) / 255.0


def petal(y0=1.00, amp=0.16, x0=0.10, x1=1.05, depth=0.20, tilt=0.0, round_=0.55):
    """One of the template's petals: a band between two smooth curves.

    Returns (fill, shadow), both 0..1. `fill` lifts the band towards white with
    its brightest part deep inside the band, `shadow` is the soft grounding
    shadow that sits just outside the leading edge.
    """
    yy, xx = grid()
    u = smoothstep((xx / W - x0) / max(1e-6, (x1 - x0)))
    edge = (y0 - amp * u - tilt * (xx / W - 0.5)) * H
    deep = edge + depth * H * ((1 - round_) + round_ * (1 - u))
    span = np.maximum(8.0, deep - edge)
    t = np.clip((yy - edge) / span, 0, 1)
    inside = ((yy >= edge) & (yy <= deep)).astype(np.float32)
    fill = inside * smoothstep(np.minimum(t, 1 - t) * 3.2)
    sh = mask_blur(inside, 46, offset=(-10, 26))
    shadow = np.clip(sh - inside, 0, 1)
    shadow += inside * (1 - smoothstep(t * 2.6)) * 0.55
    return fill, np.clip(shadow, 0, 1)


def striped_disc(cx, cy, r, period=30.0, angle=math.radians(45), alpha=0.4, color="#C6E0F2",
                 fade=0.24):
    """The template's striped disc, faded at the rim so it never looks pasted on."""
    yy, xx = grid()
    dx, dy = xx - cx * W, yy - cy * H
    d = np.sqrt(dx * dx + dy * dy)
    u = dx * math.cos(angle) + dy * math.sin(angle)
    stripes = ((np.floor(u / period) % 2) == 0).astype(np.float32)
    rim = smoothstep(np.clip((1.0 - d / r) / fade, 0, 1))
    m = (d < r).astype(np.float32) * stripes * rim * alpha
    return m[:, :, None] * hx(color)[None, None, :]


def silhouette(name, at=(0.55, 0.72), radius=(0.86, 0.50), cut=0.035, span=0.13, blur=22):
    """Only the shapes of one relevant photograph, as a soft 0..1 mask.

    Whatever stands in the photograph compares darker than the room around it,
    so comparing each pixel with a heavily blurred copy of the frame lifts out
    the two empty chairs, or the two people in conversation, on their own. That
    silhouette is then feathered away at the edges so on the page it reads as a
    faint shadow rather than as a picture.
    """
    path = os.path.join(ART, name)
    if not os.path.exists(path):
        return np.zeros((H, W), np.float32)
    im = Image.open(path).convert("L")
    scale = max(W / im.size[0], H / im.size[1]) * 1.04
    im = im.resize((int(round(im.size[0] * scale)), int(round(im.size[1] * scale))),
                   Image.LANCZOS)
    left = int((im.size[0] - W) * at[0])
    top = int((im.size[1] - H) * at[1])
    im = im.crop((left, top, left + W, top + H))
    arr = np.asarray(im.filter(ImageFilter.GaussianBlur(1.8)), dtype=np.float32) / 255.0
    room = np.asarray(im.filter(ImageFilter.GaussianBlur(42)), dtype=np.float32) / 255.0
    m = np.clip((room - arr - cut) / span, 0, 1) ** 1.25
    yy, xx = grid()
    d = np.sqrt(((xx / W - at[0]) / radius[0]) ** 2 + ((yy / H - at[1]) / radius[1]) ** 2)
    m *= np.clip(1.0 - d, 0, 1) ** 1.2
    return mask_blur(m, blur)


def grain(seed, amount):
    rng = np.random.default_rng(seed)
    return np.repeat(rng.normal(0, amount, (H, W, 1)), 3, axis=2).astype(np.float32)


def vignette(strength):
    yy, xx = grid()
    x = (xx / W - 0.5) * 2
    y = (yy / H - 0.5) * 2
    return np.clip(1 - strength * (x * x * 0.65 + y * y), 0, 1)[:, :, None]


# ---------------------------------------------------------------------------
# the scenes
# ---------------------------------------------------------------------------

PETALS = {
    "low": [dict(y0=1.02, amp=0.20, x0=0.05, x1=1.05, depth=0.20, tilt=0.06, round_=0.45)],
    "corner": [dict(y0=0.94, amp=0.13, x0=0.48, x1=1.20, depth=0.13, tilt=-0.05, round_=0.7)],
    "wide": [dict(y0=1.04, amp=0.26, x0=0.18, x1=1.08, depth=0.24, tilt=0.04, round_=0.6)],
    "broad": [dict(y0=0.99, amp=0.16, x0=0.60, x1=1.25, depth=0.22, tilt=0.05, round_=0.5)],
}

SCENES = {
    # fam    seed  petals          disc (corner)                         photo
    1: dict(fam="blue", seed=11, photo="conversation.jpg", photo_at=(0.52, 0.86),
            disc=dict(cx=0.115, cy=0.135, r=215), petals="low"),
    2: dict(fam="light", seed=23, photo="empty_chair.jpg", photo_at=(0.52, 0.78),
            disc=None, petals="low"),
    3: dict(fam="light", seed=31, photo="conversation.jpg", photo_at=(0.60, 0.78),
            disc=dict(cx=0.905, cy=0.175, r=185, alpha=0.34), petals="corner"),
    4: dict(fam="light", seed=41, photo="empty_chair.jpg", photo_at=(0.45, 0.80),
            disc=dict(cx=0.10, cy=0.86, r=175, alpha=0.30), petals="wide"),
    5: dict(fam="light", seed=53, photo="conversation.jpg", photo_at=(0.65, 0.78),
            disc=None, petals="broad"),
    6: dict(fam="light", seed=61, photo="empty_chair.jpg", photo_at=(0.38, 0.80),
            disc=dict(cx=0.92, cy=0.80, r=195, alpha=0.32), petals="low"),
    7: dict(fam="light", seed=71, photo="conversation.jpg", photo_at=(0.58, 0.82),
            disc=None, petals="corner"),
    8: dict(fam="light", seed=83, photo="empty_chair.jpg", photo_at=(0.62, 0.79),
            disc=dict(cx=0.115, cy=0.20, r=175, alpha=0.32), petals="wide"),
    9: dict(fam="light", seed=93, photo="conversation.jpg", photo_at=(0.45, 0.80),
            disc=None, petals="low"),
    10: dict(fam="light", seed=103, photo="empty_chair.jpg", photo_at=(0.60, 0.78),
             disc=dict(cx=0.90, cy=0.24, r=190, alpha=0.30), petals="broad"),
    11: dict(fam="light", seed=113, photo="conversation.jpg", photo_at=(0.52, 0.81),
             disc=None, petals="wide"),
    12: dict(fam="light", seed=123, photo="empty_chair.jpg", photo_at=(0.66, 0.79),
             disc=dict(cx=0.10, cy=0.78, r=180, alpha=0.32), petals="corner"),
    13: dict(fam="light", seed=133, photo="conversation.jpg", photo_at=(0.40, 0.79),
             disc=None, petals="low"),
    14: dict(fam="light", seed=143, photo="empty_chair.jpg", photo_at=(0.55, 0.81),
             disc=dict(cx=0.915, cy=0.82, r=190, alpha=0.32), petals="broad"),
    15: dict(fam="light", seed=153, photo="conversation.jpg", photo_at=(0.62, 0.80),
             disc=None, petals="wide"),
    16: dict(fam="light", seed=163, photo="empty_chair.jpg", photo_at=(0.44, 0.78),
             disc=dict(cx=0.105, cy=0.82, r=170, alpha=0.30), petals="corner"),
    17: dict(fam="light", seed=173, photo="conversation.jpg", photo_at=(0.58, 0.81),
             disc=None, petals="low"),
    18: dict(fam="light", seed=183, photo="empty_chair.jpg", photo_at=(0.62, 0.79),
             disc=dict(cx=0.90, cy=0.20, r=180, alpha=0.32), petals="wide"),
    19: dict(fam="light", seed=193, photo="conversation.jpg", photo_at=(0.50, 0.81),
             disc=None, petals="broad"),
    20: dict(fam="light", seed=203, photo="empty_chair.jpg", photo_at=(0.64, 0.80),
             disc=dict(cx=0.10, cy=0.20, r=170, alpha=0.30), petals="corner"),
    21: dict(fam="blue", seed=213, photo="empty_chair.jpg", photo_at=(0.50, 0.86),
             disc=dict(cx=0.905, cy=0.165, r=195, alpha=0.16), petals="wide"),
    22: dict(fam="light", seed=223, photo="conversation.jpg", photo_at=(0.55, 0.80),
             disc=dict(cx=0.92, cy=0.84, r=175, alpha=0.32), petals="low"),
}


def build_scene(n, spec):
    fam = FAMILIES[spec["fam"]]
    top, bottom = fam["base"]
    img = diagonal(top, bottom, tilt=0.42)

    if spec["fam"] == "light":
        # the template's pale blue wash drifting in from the upper right
        img += wash(SKY, at=(0.90, 0.08), radius=(0.80, 0.95), alpha=0.10, power=1.5)
        img += wash(BLUE, at=(0.04, 0.98), radius=(0.70, 0.70), alpha=0.035, power=1.3)

    # the petals, with their soft grounding shadows
    fill = np.zeros((H, W), np.float32)
    shadow = np.zeros((H, W), np.float32)
    for sp in PETALS[spec["petals"]]:
        f, sh = petal(**sp)
        fill = np.maximum(fill, f)
        shadow = np.maximum(shadow, sh)
    fill = mask_blur(fill, 3)
    shadow = mask_blur(shadow, 22)

    img = img + (hx(fam["shade"])[None, None, :] - img) * (shadow[:, :, None] * fam["shadow"])
    img = img + (hx(fam["sail"])[None, None, :] - img) * (fill[:, :, None] * fam["fill"])

    # the striped disc motif
    if spec.get("disc"):
        d = dict(spec["disc"])
        d.setdefault("color", fam["disc"])
        d["alpha"] = d.get("alpha", fam["disc_a"])
        img = img + striped_disc(**d)

    # the relevant photograph, reduced to a whisper of its own shapes
    m = silhouette(spec["photo"], at=spec["photo_at"])
    if m.any():
        img = img + (hx(fam["ink"])[None, None, :] - img) * (m[:, :, None] * fam["ink_a"])

    img *= vignette(fam["vignette"])
    img += grain(spec["seed"] + 3, fam["grain"])
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def build_assets():
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    for n, spec in sorted(SCENES.items()):
        name = "bg%02d.jpg" % n
        im = build_scene(n, spec)
        im.save(os.path.join(OUT, name), "JPEG", quality=90, subsampling=0, optimize=True)
        manifest[n] = dict(bg=name, family=spec["fam"], accent=FAMILIES[spec["fam"]]["accent"],
                           photo=spec["photo"])
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    return manifest


if __name__ == "__main__":
    m = build_assets()
    print("backgrounds written:", len(m), "to", OUT)
