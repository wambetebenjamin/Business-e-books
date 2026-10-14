"""
scenes.py
Backgrounds for the deck, deliberately quiet.

Each slide gets one smooth dark gradient, a soft accent glow and a single low
ridge line along the bottom edge so the composition has a floor without
introducing any clutter, tree, figure or prop. Five accent families run across
the talk: night, dawn, forest, rose and violet. Nothing here draws attention
away from the text.

  python scenes.py      rewrites assets/bg01.jpg ... assets/bg22.jpg
"""

import json
import math
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "assets"))
W, H = 2400, 1350

# ---------------------------------------------------------------------------
# one shared deep base, five accent families
# ---------------------------------------------------------------------------

BASE = [(0.00, "#070A14"), (0.42, "#0C1224"), (0.78, "#121A31"), (1.00, "#182140")]

# a small hue shift per family, blended over the shared base
TINT = {
    "night": [(0.00, "#060911"), (0.45, "#0B1122"), (1.00, "#1A2344")],
    "dawn": [(0.00, "#0A0A12"), (0.45, "#151224"), (1.00, "#2A2233")],
    "forest": [(0.00, "#050D11"), (0.45, "#0A1720"), (1.00, "#122B33")],
    "rose": [(0.00, "#0A080F"), (0.45, "#150F1D"), (1.00, "#2C1C2C")],
    "violet": [(0.00, "#080810"), (0.45, "#101128"), (1.00, "#1F2350")],
}

FAMILIES = {
    "night": dict(accent="#E2B95F", glow="#C79A45", ridge="#04060C", glow_at=(0.68, 0.34), glow_r=0.46,
                  glow_a=0.16),
    "dawn": dict(accent="#E8A45C", glow="#CE8340", ridge="#05060F", glow_at=(0.72, 0.40), glow_r=0.44,
                 glow_a=0.17),
    "forest": dict(accent="#6FCBB4", glow="#3E9C8A", ridge="#04070D", glow_at=(0.30, 0.36), glow_r=0.44,
                   glow_a=0.15),
    "rose": dict(accent="#E9A184", glow="#C4765C", ridge="#06050E", glow_at=(0.70, 0.38), glow_r=0.44,
                 glow_a=0.16),
    "violet": dict(accent="#B7A8F2", glow="#7A66C9", ridge="#04060F", glow_at=(0.34, 0.34), glow_r=0.46,
                   glow_a=0.17),
}

# the cover and the closing slides carry a slightly stronger glow
BOOST = {1: 1.45, 21: 1.30, 22: 1.10}


def hx(c):
    c = c.lstrip("#")
    return np.array([int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)], dtype=float)


def ramp(stops, n):
    stops = sorted(stops, key=lambda s: s[0])
    pos = np.linspace(0, 1, n)
    cols = np.zeros((n, 3))
    for i in range(len(stops) - 1):
        p0, c0 = stops[i]
        p1, c1 = stops[i + 1]
        c0, c1 = hx(c0), hx(c1)
        m = (pos >= p0) & (pos <= p1)
        t = (pos[m] - p0) / max(1e-6, p1 - p0)
        cols[m] = c0[None, :] + (c1 - c0)[None, :] * t[:, None]
    cols[pos < stops[0][0]] = hx(stops[0][1])
    cols[pos > stops[-1][0]] = hx(stops[-1][1])
    return cols


def gradient(stops):
    band = ramp(stops, H)[:, None, :]
    return np.repeat(band, W, axis=1).astype(np.float32)


def halo(cx, cy, radius, color, alpha, power=2.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # a wide ellipse rather than a circle, so the light feels like sky light
    d = np.sqrt(((xx - cx * W) / (radius * W)) ** 2 + ((yy - cy * H) / (radius * W * 0.86)) ** 2)
    fall = np.clip(1.0 - d, 0, 1) ** power
    return fall[:, :, None] * hx(color)[None, None, :] * alpha


def ridge_curve(seed, base, amp, tilt=0.0, octaves=3, rough=0.45):
    """One calm, low ridge line across the foot of the slide."""
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, W)
    y = np.zeros(W)
    f, a = 1.0, amp
    for _ in range(octaves):
        y += a * np.sin(2 * math.pi * f * x + rng.uniform(0, 6.28))
        f *= 2.1 + rng.uniform(0, 0.4)
        a *= rough
    return base - y + tilt * (x - 0.5)


def paint_ridge(img, curve, color, alpha=1.0):
    col = hx(color)
    yy = np.arange(H)[:, None]
    mask = (yy >= curve[None, :]).astype(np.float32) * alpha
    img[:] = img * (1 - mask[:, :, None]) + col[None, None, :] * mask[:, :, None]
    return img


def vignette(strength=0.30, power=1.5):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    x = (xx / W - 0.5) * 2
    y = (yy / H - 0.5) * 2
    return np.clip(1 - strength * (np.sqrt(x * x * 0.82 + y * y) ** power), 0, 1)[:, :, None]


def grain(seed, amount=2.4):
    rng = np.random.default_rng(seed)
    return np.repeat(rng.normal(0, amount, (H, W, 1)), 3, axis=2)


SCENES = {
    #            family     ridge base / amplitude, second faint ridge
    1: dict(fam="night", seed=11, ridges=[(0.985, 0.030, 0.0), (0.955, 0.020, 0.012)]),
    2: dict(fam="dawn", seed=23, ridges=[(0.980, 0.034, 0.0), (0.950, 0.018, 0.010)]),
    3: dict(fam="dawn", seed=31, ridges=[(0.985, 0.026, 0.0), (0.958, 0.016, 0.010)]),
    4: dict(fam="dawn", seed=41, ridges=[(0.982, 0.030, 0.0), (0.952, 0.018, 0.012)]),
    5: dict(fam="dawn", seed=53, ridges=[(0.988, 0.022, 0.0), (0.962, 0.014, 0.008)]),
    6: dict(fam="forest", seed=61, ridges=[(0.980, 0.032, 0.0), (0.950, 0.020, 0.012)]),
    7: dict(fam="forest", seed=71, ridges=[(0.985, 0.024, 0.0), (0.956, 0.016, 0.010)]),
    8: dict(fam="forest", seed=83, ridges=[(0.980, 0.030, 0.0), (0.948, 0.019, 0.012)]),
    9: dict(fam="forest", seed=93, ridges=[(0.984, 0.026, 0.0), (0.954, 0.017, 0.010)]),
    10: dict(fam="forest", seed=103, ridges=[(0.981, 0.032, 0.0), (0.951, 0.019, 0.012)]),
    11: dict(fam="forest", seed=113, ridges=[(0.986, 0.022, 0.0), (0.958, 0.015, 0.008)]),
    12: dict(fam="rose", seed=123, ridges=[(0.982, 0.028, 0.0), (0.952, 0.018, 0.012)]),
    13: dict(fam="rose", seed=133, ridges=[(0.986, 0.022, 0.0), (0.958, 0.015, 0.010)]),
    14: dict(fam="rose", seed=143, ridges=[(0.982, 0.030, 0.0), (0.950, 0.019, 0.012)]),
    15: dict(fam="rose", seed=153, ridges=[(0.987, 0.020, 0.0), (0.960, 0.014, 0.008)]),
    16: dict(fam="rose", seed=163, ridges=[(0.983, 0.028, 0.0), (0.953, 0.018, 0.012)]),
    17: dict(fam="violet", seed=173, ridges=[(0.985, 0.026, 0.0), (0.956, 0.016, 0.010)]),
    18: dict(fam="violet", seed=183, ridges=[(0.981, 0.032, 0.0), (0.951, 0.019, 0.012)]),
    19: dict(fam="violet", seed=193, ridges=[(0.986, 0.024, 0.0), (0.957, 0.015, 0.010)]),
    20: dict(fam="violet", seed=203, ridges=[(0.983, 0.028, 0.0), (0.953, 0.018, 0.012)]),
    21: dict(fam="night", seed=213, ridges=[(0.984, 0.028, 0.0), (0.954, 0.018, 0.012)]),
    22: dict(fam="night", seed=223, ridges=[(0.988, 0.020, 0.0), (0.962, 0.013, 0.008)]),
}


def build_scene(n, spec):
    fam = FAMILIES[spec["fam"]]
    img = gradient(BASE) * 0.45 + gradient(TINT[spec["fam"]]) * 0.55
    boost = BOOST.get(n, 1.0)
    gx, gy = fam["glow_at"]
    img += halo(gx, gy, fam["glow_r"], fam["glow"], fam["glow_a"] * 1.35 * boost)
    img += halo(0.18 if gx > 0.5 else 0.82, 0.86, 0.42, fam["glow"], fam["glow_a"] * 0.35 * boost)
    img += halo(0.5, 0.10, 0.75, "#FFFFFF", 0.020)      # a whisper of light at the top
    # ridges, back to front
    for i, (base, amp, lighten) in enumerate(spec["ridges"][::-1]):
        curve = ridge_curve(spec["seed"] + i * 7, base * H, amp * H, tilt=(0.012 if i % 2 else -0.010))
        col = fam["ridge"]
        if lighten:
            col = "#%02X%02X%02X" % tuple(
                int(v) for v in (hx(fam["ridge"]) + hx(fam["glow"]) * lighten * 0.5))
        paint_ridge(img, curve, col)
    img *= vignette(0.30 * (1.0 if n not in (1, 21) else 0.75), 1.5)
    img += grain(spec["seed"] + 3, 2.4)
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def build_assets():
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    for n, spec in sorted(SCENES.items()):
        name = "bg%02d.jpg" % n
        im = build_scene(n, spec)
        im.save(os.path.join(OUT, name), "JPEG", quality=88, subsampling=0, optimize=True)
        manifest[n] = dict(bg=name, family=spec["fam"], accent=FAMILIES[spec["fam"]]["accent"])
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    return manifest


if __name__ == "__main__":
    m = build_assets()
    print("backgrounds written:", len(m), "to", OUT)
