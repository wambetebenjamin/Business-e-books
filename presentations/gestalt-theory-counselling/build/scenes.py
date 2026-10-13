"""
scenes.py
Composes the background artwork for every slide: a soft gradient sky with
optional stars, sun or moon glow, and four or five layers of hand drawn
silhouettes (mountains, hills, dunes, forest, water, figures, trees, birds)
hazed with atmospheric mist so the depth reads naturally.

Run directly to (re)generate every background + sprite asset.
"""

import json
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import artkit as A

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "assets"))
W, H = 2400, 1350

# ---------------------------------------------------------------------------
# palette families : one per section of the talk
# ---------------------------------------------------------------------------

PALETTES = {
    "night": dict(
        sky=[(0.00, "#03050C"), (0.38, "#070D22"), (0.72, "#101A3A"), (1.00, "#1B2547")],
        stars=dict(count=420, alpha=1.0),
        glow=(0.74, 0.30, 0.42, "#B99456", 0.22),
        sil=["#101A3C", "#0B1230", "#070C1F", "#03060E"],
        mist="#1B2547",
        accent="#F0CA84", accent2="#A9BCF0",
        text="#F7F4EC", muted="#AFB8CF", dim="#7E88A3",
    ),
    "dawn": dict(
        sky=[(0.00, "#080F28"), (0.34, "#152047"), (0.60, "#39325C"), (0.82, "#7A4E52"), (1.00, "#B4764F")],
        stars=dict(count=120, alpha=0.55),
        glow=(0.70, 0.72, 0.55, "#F3A868", 0.34),
        sil=["#2C2A58", "#1F1E44", "#141332", "#0A0A1E"],
        mist="#8A5A54",
        accent="#F4C57E", accent2="#F0A868",
        text="#FAF5EC", muted="#CDC2CE", dim="#9E93A8",
    ),
    "forest": dict(
        sky=[(0.00, "#04121A"), (0.36, "#0A2028"), (0.68, "#103138"), (1.00, "#174248")],
        stars=dict(count=90, alpha=0.4),
        glow=(0.28, 0.34, 0.5, "#79C7B4", 0.16),
        sil=["#0E2B31", "#0A1F25", "#07171C", "#041013"],
        mist="#174248",
        accent="#84DCC6", accent2="#A8E6D6",
        text="#F2F7F4", muted="#A7BFC2", dim="#7899A0",
    ),
    "rose": dict(
        sky=[(0.00, "#120A1C"), (0.34, "#22102C"), (0.64, "#3B1B36"), (0.86, "#5D2E3E"), (1.00, "#7C4448")],
        stars=dict(count=110, alpha=0.5),
        glow=(0.72, 0.66, 0.5, "#E08A6A", 0.26),
        sil=["#361A38", "#281130", "#190B22", "#0D0714"],
        mist="#7C4448",
        accent="#F2A98A", accent2="#F5C6A8",
        text="#FBF3EE", muted="#CDB3B6", dim="#9C8189",
    ),
    "violet": dict(
        sky=[(0.00, "#06081C"), (0.34, "#111538"), (0.66, "#232757"), (0.88, "#3A3C74"), (1.00, "#4E4C86")],
        stars=dict(count=240, alpha=0.8),
        glow=(0.66, 0.60, 0.5, "#9A8CE0", 0.26),
        sil=["#1D1F4A", "#151738", "#0D0F26", "#060815"],
        mist="#4E4C86",
        accent="#C3B4F5", accent2="#A191E6",
        text="#F6F4FD", muted="#B6B2D6", dim="#8B87AE",
    ),
}

# sprite ink colours (front-most silhouette, back ridges use the palette list)
INK = {k: v["sil"][-1] for k, v in PALETTES.items()}

# ---------------------------------------------------------------------------
# scene assembly
# ---------------------------------------------------------------------------


def sky_array(spec):
    pal = PALETTES[spec["palette"]]
    img = A.linear_gradient(W, H, pal["sky"])
    for g in spec.get("glow") or ([pal["glow"]] if pal.get("glow") else []):
        gx, gy, gr, col, st = g
        img += A.radial_glow(W, H, gx, gy, gr, col, st)
    if spec.get("stars") and pal.get("stars"):
        img += star_field(pal, spec.get("star_seed", 7), spec["stars"])
    return np.clip(img, 0, 255)


def star_field(pal, seed, opts):
    rng = np.random.default_rng(seed)
    n = int(opts["count"])
    layer = np.zeros((H, W, 3), dtype=np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    for _ in range(n):
        x = rng.uniform(0, W)
        y = rng.uniform(0, H * 0.72) ** 1.25 / (0.72 ** 1.25) * H * 0.72
        b = rng.uniform(0.25, 1.0) ** 2.2
        r = rng.uniform(0.7, 1.9)
        col = A.hx("#FFF6E2") if rng.random() < 0.8 else A.hx("#CFE0FF")
        d2 = (xx - x) ** 2 + (yy - y) ** 2
        core = np.exp(-d2 / (2 * (r * 1.1) ** 2))
        halo = np.exp(-d2 / (2 * (r * 4.0) ** 2)) * 0.22
        layer += (core + halo)[:, :, None] * col[None, None, :] * (b * 255 * opts["alpha"] * 0.09)
    # faint milky diagonal band
    band = np.exp(-(((xx * 0.55 + yy) - H * 0.62) ** 2) / (2 * (H * 0.34) ** 2)) * 12
    layer += band[:, :, None] * A.hx("#B9C6EE")[None, None, :] * opts["alpha"]
    return layer


def veil(img, y0, y1, color, a1):
    """Haze the already painted layers below y0 (sky colour), peaking at y1."""
    t = np.linspace(0, 1, H)[:, None]
    a = np.clip((t - y0) / max(1e-6, (y1 - y0)), 0, 1) ** 1.55 * a1
    a = np.repeat(a, W, axis=1)[:, :, None]
    img = img * (1 - a) + A.hx(color)[None, None, :] * a
    return img


def np_to_pil(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def paste_sprite(arr, spr, x, y, opacity=1.0):
    """Paste an RGBA sprite with its bottom centre at (x, y) in pixels."""
    im = np_to_pil(arr).convert("RGBA")
    if opacity < 1.0:
        a = spr.getchannel("A").point(lambda v: int(v * opacity))
        spr = spr.copy()
        spr.putalpha(a)
    im.alpha_composite(spr, (int(x - spr.size[0] / 2), int(y - spr.size[1])))
    return np.asarray(im.convert("RGB")).astype(np.float32)


def build_scene(spec, seed=0):
    img = sky_array(spec)
    pal = PALETTES[spec["palette"]]
    layers = spec["layers"]
    for i, ly in enumerate(layers):
        # haze the layers behind before adding this one
        if ly.get("veil"):
            v = ly["veil"]
            img = veil(img, v[0] * H, v[1] * H, pal["mist"], v[2])
        kind = ly["kind"]
        col = ly.get("color") or pal["sil"][min(i, len(pal["sil"]) - 1)]
        base = ly["base"] * H
        sd = seed * 17 + i * 101 + ly.get("seed", 0)
        if kind == "mountains":
            curve = A.ridge_mountains(W, sd, base, ly["amp"] * H, peaks=ly.get("peaks", 5),
                                      sharp=ly.get("sharp", 1.0), jitter=ly.get("jitter", 0.05))
        elif kind == "hills":
            curve = A.ridge_hills(W, sd, base, ly["amp"] * H, octaves=ly.get("octaves", 4),
                                  roughness=ly.get("roughness", 0.55), tilt=ly.get("tilt", 0.0))
        elif kind == "dunes":
            curve = A.ridge_dunes(W, sd, base, ly["amp"] * H, tilt=ly.get("tilt", 0.0))
        elif kind == "mist_forest":
            curve = A.ridge_mist_forest(W, sd, base, ly["amp"] * H, roughness=ly.get("roughness", 0.5))
        elif kind == "flat":
            curve = np.full(W, base)
        else:
            raise ValueError(kind)
        img = A.fill_below(img, curve, col)
        # per-layer motifs sit on this ridge line
        for m in ly.get("motifs", []):
            img = draw_motif(img, m, curve, col, sd, pal)
    # full width grass fringe along the bottom
    for m in spec.get("bottom", []):
        img = draw_motif(img, m, None, A.mix(pal["sil"][-1], "#000000", 0.15), seed * 31 + 7, pal)
    if spec.get("scrim"):
        s = spec["scrim"]
        img = veil(img, s[0] * H, s[1] * H, s[2], s[3])
    img *= A.vignette(W, H, spec.get("vignette", 0.30), 1.5)
    img += A.grain(W, H, seed + 3, spec.get("grain", 2.6))
    return np_to_pil(img)


def y_at(curve, x_frac):
    if curve is None:
        return H
    return float(np.interp(x_frac * (W - 1), np.arange(W), curve))


def draw_motif(img, m, curve, layer_col, sd, pal):
    kind = m["kind"]
    ink = m.get("color") or layer_col
    rgb = tuple(int(v) for v in A.hx(ink)) + (255,)
    xf = m.get("x", 0.8)
    x = xf * W
    y = (m["base"] * H) if "base" in m else y_at(curve, xf)
    if "dy" in m:
        y += m["dy"] * H
    op = m.get("opacity", 1.0)
    h = m.get("h", 0.2) * H

    if kind == "figure":
        img = paste_sprite(img, A.human(h, pose=m.get("pose", "stand"), flip=m.get("flip", False),
                                        color=rgb, lean=m.get("lean", 0.0)), x, y, op)
    elif kind == "chair":
        img = paste_sprite(img, A.chair(h, color=rgb, flip=m.get("flip", False)), x, y, op)
    elif kind == "acacia":
        img = paste_sprite(img, A.acacia(int(h * 1.35), int(h), color=rgb,
                                         canopy=m.get("canopy", 1.0)), x, y, op)
    elif kind == "conifer":
        img = paste_sprite(img, A.conifer(int(h * 0.62), int(h), color=rgb,
                                          tilt=m.get("tilt", 0.0)), x, y, op)
    elif kind == "bare_tree":
        img = paste_sprite(img, A.bare_tree(int(h * 0.95), int(h), color=rgb,
                                            seed=sd + int(xf * 100), branches=5), x, y, op)
    elif kind == "reeds":
        wpx = int(m.get("w", 0.3) * W)
        spr = A.reeds(wpx, int(h), color=rgb, seed=sd, count=m.get("count", 26))
        base = np_to_pil(img).convert("RGBA")
        base.alpha_composite(spr, (int(x - wpx / 2), int(y - spr.size[1])))
        img = np.asarray(base.convert("RGB")).astype(np.float32)
    elif kind == "grass":
        spr = A.grass_fringe(W, int(h), color=rgb, seed=sd, density=m.get("density", 1.0),
                             maxlen=m.get("maxlen", 1.0))
        img = paste_sprite(img, spr, W / 2, H + h * 0.02, op)
    elif kind == "birds":
        rng = np.random.default_rng(sd)
        for i in range(m.get("n", 4)):
            bx = (xf + rng.uniform(-0.08, 0.08)) * W
            by = (m.get("y", 0.25) + rng.uniform(-0.05, 0.05)) * H
            sz = m.get("size", 0.012) * H * rng.uniform(0.8, 1.3)
            img = paste_sprite(img, A.bird(bx, by, sz, color=rgb, flap=rng.uniform(-0.2, 0.8)),
                               bx, by, op * 0.95)
    elif kind == "glow":
        img += A.radial_glow(W, H, xf, m.get("y", 0.6), m.get("r", 0.16), m.get("color", pal["accent"]),
                             m.get("s", 0.4), power=m.get("power", 2.0))
    elif kind == "glow_figure":
        img += A.radial_glow(W, H, xf, m.get("y", 0.55), m.get("r", 0.13), m.get("color", pal["accent"]),
                             m.get("s", 0.5), power=2.0)
        fog = A.human(h, pose=m.get("pose", "stand"), flip=m.get("flip", False),
                      color=tuple(int(v) for v in A.hx(A.mix(m.get("color", pal["accent"]), "#FFFFFF", 0.55))) + (255,),
                      lean=m.get("lean", 0.0))
        img = paste_sprite(img, fog, x, y, op * 0.92)
    elif kind == "ridge":
        curve2 = A.ridge_hills(W, sd, m["base"] * H, m["amp"] * H, octaves=3)
        img = A.fill_below(img, curve2, ink, alpha=m.get("opacity", 1.0))
    else:
        raise ValueError(kind)
    return img


# ---------------------------------------------------------------------------
# the eighteen backgrounds: a distinct composition per slide
# ---------------------------------------------------------------------------

def L(kind, base, amp, **kw):
    d = dict(kind=kind, base=base, amp=amp)
    d.update(kw)
    return d


SCENES = {
    #                                     ---- cover : summit at night ----
    1: dict(palette="night", star_seed=11, vignette=0.36,
            layers=[
                L("mountains", 0.70, 0.34, veil=(0.30, 0.78, 0.16), peaks=4, sharp=1.15, color="#0E1738",
                  motifs=[dict(kind="glow", x=0.74, y=0.40, r=0.14, s=0.30, color="#D9B778")]),
                L("mountains", 0.79, 0.26, veil=(0.42, 0.86, 0.15), peaks=5, sharp=1.5, color="#0A1230"),
                L("hills", 0.90, 0.045, veil=(0.55, 0.95, 0.14), color="#070C1F",
                  motifs=[dict(kind="figure", x=0.80, h=0.115, pose="stand", lean=0.02),
                          dict(kind="acacia", x=0.93, h=0.16, dy=-0.005)]),
                L("hills", 0.975, 0.02, color="#03060E",
                  motifs=[dict(kind="birds", x=0.62, y=0.30, n=3, size=0.008)]),
            ]),
    #                                     ---- 02 introduction : dawn ridge ----
    2: dict(palette="dawn", star_seed=23, vignette=0.33,
            layers=[
                L("mountains", 0.74, 0.22, veil=(0.34, 0.82, 0.17), peaks=4, sharp=1.05, color="#2C2A58"),
                L("hills", 0.86, 0.035, veil=(0.48, 0.92, 0.15), color="#1F1E44"),
                L("hills", 0.94, 0.02, color="#141332",
                  motifs=[dict(kind="acacia", x=0.855, h=0.235, canopy=1.06),
                          dict(kind="acacia", x=0.955, h=0.15, canopy=0.9),
                          dict(kind="birds", x=0.70, y=0.34, n=5, size=0.0075)]),
                L("flat", 0.995, 0.0, color="#0A0A1E"),
            ]),
    #                                     ---- 03 history : layered hills ----
    3: dict(palette="dawn", star_seed=31, vignette=0.32,
            layers=[
                L("mountains", 0.72, 0.17, veil=(0.34, 0.80, 0.18), peaks=6, sharp=1.3, color="#2C2A58"),
                L("hills", 0.83, 0.05, veil=(0.46, 0.90, 0.15), color="#1F1E44"),
                L("hills", 0.92, 0.028, veil=(0.58, 0.96, 0.11), color="#141332",
                  motifs=[dict(kind="bare_tree", x=0.90, h=0.26), dict(kind="bare_tree", x=0.955, h=0.20)]),
                L("hills", 0.98, 0.015, color="#0A0A1E",
                  motifs=[dict(kind="birds", x=0.76, y=0.30, n=6, size=0.007)]),
            ]),
    #                                     ---- 04 theorists : three on the ridge ----
    4: dict(palette="dawn", star_seed=41, vignette=0.33,
            layers=[
                L("mountains", 0.76, 0.19, veil=(0.36, 0.84, 0.17), peaks=4, sharp=1.0, color="#2C2A58"),
                L("hills", 0.87, 0.035, veil=(0.50, 0.93, 0.14), color="#1F1E44"),
                L("hills", 0.945, 0.018, color="#141332",
                  motifs=[dict(kind="figure", x=0.72, h=0.145, pose="stand"),
                          dict(kind="figure", x=0.815, h=0.135, pose="face", flip=True, lean=-0.02),
                          dict(kind="figure", x=0.91, h=0.15, pose="stand", flip=True)]),
                L("flat", 0.995, 0.0, color="#0A0A1E"),
            ]),
    #                                     ---- 05 core assumptions : wide valley ----
    5: dict(palette="dawn", star_seed=53, vignette=0.32,
            layers=[
                L("mountains", 0.70, 0.15, veil=(0.32, 0.78, 0.17), peaks=7, sharp=1.4, color="#2C2A58"),
                L("hills", 0.82, 0.045, veil=(0.44, 0.90, 0.15), color="#1F1E44"),
                L("dunes", 0.915, 0.022, veil=(0.56, 0.95, 0.10), color="#141332",
                  motifs=[dict(kind="figure", x=0.86, h=0.125, pose="walk"),
                          dict(kind="acacia", x=0.70, h=0.20)]),
                L("hills", 0.98, 0.012, color="#0A0A1E"),
            ]),
    #                                     ---- 06 awareness : mist forest ----
    6: dict(palette="forest", star_seed=61, vignette=0.34,
            layers=[
                L("mist_forest", 0.72, 0.055, veil=(0.30, 0.86, 0.20), color="#0E2B31", roughness=0.6),
                L("hills", 0.80, 0.03, veil=(0.46, 0.92, 0.14), color="#0A1F25",
                  motifs=[dict(kind="conifer", x=0.90, h=0.30), dict(kind="conifer", x=0.96, h=0.24, tilt=0.1),
                          dict(kind="conifer", x=0.84, h=0.34, tilt=-0.08)]),
                L("hills", 0.90, 0.03, veil=(0.56, 0.95, 0.12), color="#07171C",
                  motifs=[dict(kind="bare_tree", x=0.80, h=0.30), dict(kind="bare_tree", x=0.88, h=0.24)]),
                L("hills", 0.965, 0.02, color="#041013",
                  motifs=[dict(kind="grass", h=0.05, density=1.4, maxlen=0.9)]),
            ]),
    #                                     ---- 07 here and now : quiet lake ----
    7: dict(palette="forest", star_seed=71, vignette=0.34,
            glow=[(0.30, 0.34, 0.42, "#7FC9B6", 0.15)],
            layers=[
                L("hills", 0.78, 0.05, veil=(0.34, 0.88, 0.18), color="#0E2B31",
                  motifs=[dict(kind="conifer", x=0.90, h=0.24), dict(kind="conifer", x=0.95, h=0.19)]),
                L("hills", 0.86, 0.025, color="#0A1F25"),
                L("flat", 0.875, 0.0, color="#123C42"),
                L("flat", 0.895, 0.0, veil=(0.60, 0.90, 0.11), color="#0F333A"),
                L("hills", 0.955, 0.035, color="#07171C",
                  motifs=[dict(kind="figure", x=0.86, h=0.135, pose="stand", lean=0.02),
                          dict(kind="reeds", x=0.93, h=0.16, y=1.0, w=0.16, color="#041013")]),
                L("flat", 0.985, 0.0, color="#041013",
                  motifs=[dict(kind="reeds", x=0.12, h=0.14, w=0.2, color="#041013", count=20)]),
            ]),
    #                                     ---- 08 figure and ground : the lit figure ----
    8: dict(palette="forest", star_seed=83, vignette=0.36,
            layers=[
                L("hills", 0.80, 0.045, veil=(0.34, 0.90, 0.20), color="#0E2B31"),
                L("hills", 0.885, 0.026, veil=(0.52, 0.94, 0.13), color="#0A1F25",
                  motifs=[dict(kind="figure", x=0.62, h=0.115, pose="stand", opacity=0.85),
                          dict(kind="figure", x=0.72, h=0.125, pose="stand", flip=True, opacity=0.85),
                          dict(kind="figure", x=0.97, h=0.12, pose="stand", flip=True, opacity=0.85)]),
                L("hills", 0.955, 0.02, color="#07171C"),
                # the one element that steps forward out of the ground
                L("flat", 1.06, 0.0, color="#07171C",
                  motifs=[dict(kind="glow_figure", x=0.84, y=0.945, h=0.30, pose="stand",
                               color="#9BE3CE", r=0.14, s=0.55, opacity=1.0)]),
            ]),
    #                                     ---- 09 contact : two figures meeting ----
    9: dict(palette="forest", star_seed=93, vignette=0.34,
            layers=[
                L("mist_forest", 0.74, 0.05, veil=(0.32, 0.88, 0.21), color="#0E2B31"),
                L("hills", 0.86, 0.028, veil=(0.50, 0.94, 0.13), color="#0A1F25"),
                L("hills", 0.945, 0.02, color="#07171C",
                  motifs=[dict(kind="glow", x=0.855, y=0.795, r=0.075, s=0.30, color="#8FE0C8"),
                          dict(kind="figure", x=0.80, h=0.155, pose="face", lean=0.03),
                          dict(kind="figure", x=0.91, h=0.155, pose="face", flip=True, lean=-0.03)]),
                L("flat", 0.995, 0.0, color="#041013",
                  motifs=[dict(kind="grass", h=0.04, density=1.2)]),
            ]),
    #                                     ---- 10 unfinished business : far tree ----
    10: dict(palette="forest", star_seed=103, vignette=0.35,
             layers=[
                 L("hills", 0.78, 0.055, veil=(0.34, 0.90, 0.20), color="#0E2B31",
                   motifs=[dict(kind="bare_tree", x=0.895, h=0.30), dict(kind="conifer", x=0.955, h=0.20)]),
                 L("hills", 0.875, 0.03, veil=(0.52, 0.95, 0.14), color="#0A1F25"),
                 L("dunes", 0.945, 0.03, color="#07171C",
                   motifs=[dict(kind="figure", x=0.80, h=0.13, pose="stand", lean=-0.02)]),
                 L("flat", 0.995, 0.0, color="#041013"),
             ]),
    #                                     ---- 11 responsibility : the walker ----
    11: dict(palette="forest", star_seed=113, vignette=0.34,
             layers=[
                 L("mist_forest", 0.76, 0.045, veil=(0.32, 0.88, 0.20), color="#0E2B31", roughness=0.55),
                 L("hills", 0.86, 0.035, veil=(0.50, 0.94, 0.13), color="#0A1F25",
                   motifs=[dict(kind="conifer", x=0.93, h=0.26), dict(kind="bare_tree", x=0.86, h=0.28)]),
                 L("hills", 0.94, 0.028, color="#07171C",
                   motifs=[dict(kind="figure", x=0.88, h=0.16, pose="walk")]),
                 L("flat", 0.995, 0.0, color="#041013",
                   motifs=[dict(kind="grass", h=0.045, density=1.3)]),
             ]),
    #                                     ---- 12 the counsellor : seated pair ----
    12: dict(palette="rose", star_seed=123, vignette=0.35,
             layers=[
                 L("hills", 0.78, 0.05, veil=(0.34, 0.90, 0.19), color="#361A38",
                   motifs=[dict(kind="conifer", x=0.93, h=0.22)]),
                 L("hills", 0.875, 0.03, veil=(0.50, 0.94, 0.13), color="#281130"),
                 L("hills", 0.945, 0.022, color="#190B22",
                   motifs=[dict(kind="glow", x=0.865, y=0.80, r=0.09, s=0.34, color="#F0A98A"),
                           dict(kind="figure", x=0.80, h=0.155, pose="sit"),
                           dict(kind="figure", x=0.925, h=0.15, pose="face", flip=True)]),
                 L("flat", 0.995, 0.0, color="#0D0714"),
             ]),
    #                                     ---- 13 techniques : three chairs ----
    13: dict(palette="rose", star_seed=133, vignette=0.34,
             layers=[
                 L("hills", 0.79, 0.045, veil=(0.34, 0.90, 0.18), color="#361A38"),
                 L("hills", 0.885, 0.028, veil=(0.52, 0.95, 0.12), color="#281130",
                   motifs=[dict(kind="chair", x=0.86, h=0.16, flip=True),
                           dict(kind="chair", x=0.945, h=0.145),
                           dict(kind="bird", x=0.0, h=0.0) if False else dict(kind="birds", x=0.62, y=0.30, n=3,
                                                                               size=0.008, color="#190B22")]),
                 L("hills", 0.955, 0.018, color="#190B22"),
                 L("flat", 0.998, 0.0, color="#0D0714"),
             ]),
    #                                     ---- 14 empty chair : chair facing chair ----
    14: dict(palette="rose", star_seed=143, vignette=0.34,
             layers=[
                 L("hills", 0.80, 0.04, veil=(0.34, 0.90, 0.18), color="#361A38"),
                 L("hills", 0.89, 0.026, veil=(0.52, 0.95, 0.12), color="#281130"),
                 L("hills", 0.955, 0.018, color="#190B22",
                   motifs=[dict(kind="glow", x=0.875, y=0.845, r=0.07, s=0.26, color="#F2A98A"),
                           dict(kind="chair", x=0.80, h=0.175, flip=True),
                           dict(kind="chair", x=0.955, h=0.175)]),
                 L("flat", 0.998, 0.0, color="#0D0714"),
             ]),
    #                                     ---- 15 other techniques : reeds and birds ----
    15: dict(palette="rose", star_seed=153, vignette=0.33,
             layers=[
                 L("hills", 0.82, 0.035, veil=(0.36, 0.92, 0.17), color="#361A38"),
                 L("hills", 0.90, 0.025, veil=(0.54, 0.96, 0.11), color="#281130",
                   motifs=[dict(kind="birds", x=0.74, y=0.32, n=6, size=0.0075, color="#190B22")]),
                 L("flat", 0.96, 0.0, color="#190B22",
                   motifs=[dict(kind="reeds", x=0.90, h=0.20, w=0.24, color="#0D0714"),
                           dict(kind="reeds", x=0.09, h=0.16, w=0.18, color="#0D0714", count=18)]),
                 L("flat", 0.998, 0.0, color="#0D0714"),
             ]),
    #                                     ---- 16 application : gathered figures ----
    16: dict(palette="rose", star_seed=163, vignette=0.34,
             layers=[
                 L("hills", 0.81, 0.04, veil=(0.36, 0.92, 0.17), color="#361A38"),
                 L("hills", 0.90, 0.025, veil=(0.54, 0.96, 0.11), color="#281130",
                   motifs=[dict(kind="figure", x=0.70, h=0.145, pose="face"),
                           dict(kind="figure", x=0.795, h=0.155, pose="stand"),
                           dict(kind="figure", x=0.885, h=0.14, pose="face", flip=True),
                           dict(kind="figure", x=0.965, h=0.15, pose="stand", flip=True)]),
                 L("flat", 0.96, 0.0, color="#190B22",
                   motifs=[dict(kind="grass", h=0.04, density=1.3)]),
                 L("flat", 0.998, 0.0, color="#0D0714"),
             ]),
    #                                     ---- 17 strengths : sunrise dunes ----
    17: dict(palette="violet", star_seed=173, vignette=0.32,
             glow=[(0.70, 0.66, 0.46, "#C4A6F0", 0.30)],
             layers=[
                 L("mountains", 0.78, 0.13, veil=(0.36, 0.86, 0.17), peaks=4, sharp=1.1, color="#1D1F4A"),
                 L("dunes", 0.87, 0.028, veil=(0.52, 0.94, 0.13), color="#151738"),
                 L("dunes", 0.93, 0.02, veil=(0.62, 0.97, 0.10), color="#0D0F26",
                   motifs=[dict(kind="birds", x=0.68, y=0.36, n=5, size=0.0075, color="#060815")]),
                 L("dunes", 0.985, 0.012, color="#060815"),
             ]),
    #                                     ---- 18 limitations : wind shaped tree ----
    18: dict(palette="violet", star_seed=183, vignette=0.34,
             layers=[
                 L("hills", 0.80, 0.045, veil=(0.36, 0.92, 0.17), color="#1D1F4A"),
                 L("dunes", 0.89, 0.028, veil=(0.54, 0.96, 0.12), color="#151738"),
                 L("dunes", 0.95, 0.02, color="#0D0F26",
                   motifs=[dict(kind="bare_tree", x=0.84, h=0.30),
                           dict(kind="bare_tree", x=0.92, h=0.22)]),
                 L("dunes", 0.99, 0.01, color="#060815"),
             ]),
    #                                     ---- 19 case application : the student ----
    19: dict(palette="violet", star_seed=193, vignette=0.34,
             layers=[
                 L("hills", 0.80, 0.045, veil=(0.36, 0.92, 0.17), color="#1D1F4A",
                   motifs=[dict(kind="conifer", x=0.93, h=0.22, tilt=0.1)]),
                 L("dunes", 0.88, 0.03, veil=(0.54, 0.96, 0.12), color="#151738"),
                 L("dunes", 0.945, 0.025, color="#0D0F26",
                   motifs=[dict(kind="glow", x=0.855, y=0.83, r=0.085, s=0.30, color="#C3B4F5"),
                           dict(kind="figure", x=0.855, h=0.17, pose="stand", lean=0.02)]),
                 L("dunes", 0.99, 0.012, color="#060815"),
             ]),
    #                                     ---- 20 critical evaluation : two ridges ----
    20: dict(palette="violet", star_seed=203, vignette=0.33,
             glow=[(0.50, 0.78, 0.42, "#B6A6F0", 0.26)],
             layers=[
                 L("mountains", 0.76, 0.20, veil=(0.34, 0.84, 0.17), peaks=3, sharp=1.0, color="#1D1F4A"),
                 L("mountains", 0.86, 0.15, veil=(0.50, 0.92, 0.13), peaks=4, sharp=1.3, color="#151738"),
                 L("dunes", 0.94, 0.02, color="#0D0F26",
                   motifs=[dict(kind="figure", x=0.50, h=0.10, pose="stand", opacity=0.9),
                           dict(kind="figure", x=0.575, h=0.10, pose="face", flip=True, opacity=0.9)]),
                 L("flat", 0.995, 0.0, color="#060815"),
             ]),
    #                                     ---- 21 conclusion : summit and moon ----
    21: dict(palette="night", star_seed=213, vignette=0.36,
             layers=[
                 L("mountains", 0.72, 0.30, veil=(0.30, 0.80, 0.16), peaks=4, sharp=1.2, color="#0E1738",
                   motifs=[dict(kind="glow", x=0.70, y=0.34, r=0.13, s=0.30, color="#E6C685")]),
                 L("mountains", 0.81, 0.24, veil=(0.44, 0.88, 0.15), peaks=5, sharp=1.5, color="#0A1230"),
                 L("hills", 0.915, 0.04, veil=(0.56, 0.95, 0.13), color="#070C1F",
                   motifs=[dict(kind="acacia", x=0.93, h=0.15)]),
                 L("hills", 0.985, 0.018, color="#03060E",
                   motifs=[dict(kind="birds", x=0.66, y=0.28, n=3, size=0.0075)]),
             ]),
    #                                     ---- 22 references : still night sky ----
    22: dict(palette="night", star_seed=223, vignette=0.38, grain=2.2,
             scrim=(0.0, 0.55, "#03050C", 0.34),
             layers=[
                 L("mountains", 0.84, 0.14, veil=(0.42, 0.90, 0.15), peaks=5, sharp=1.3, color="#0B1230"),
                 L("hills", 0.93, 0.03, veil=(0.58, 0.96, 0.12), color="#070C1F"),
                 L("hills", 0.99, 0.012, color="#03060E"),
             ]),
}

# page 21 wants the summit on the right instead of the left
SCENES[21]["layers"][0]["motifs"] = [dict(kind="glow", x=0.30, y=0.36, r=0.13, s=0.28, color="#E6C685")]

TICK_COLORS = {
    "gold": ("#F7DCA0", "#B4801F"),
    "mint": ("#B6F0DE", "#2C8C74"),
    "rose": ("#FBD0B4", "#B35B3C"),
    "lilac": ("#DCD2FF", "#6A55C8"),
    "pearl": ("#FFFFFF", "#9AA3B8"),
    "ember": ("#F6B0A6", "#9E2F35"),   # cross marker
}


def build_assets(full=True):
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    for idx, spec in sorted(SCENES.items()):
        name = f"bg{idx:02d}.jpg"
        path = os.path.join(OUT, name)
        im = build_scene(spec, seed=idx)
        if full or not os.path.exists(path):
            im.save(path, "JPEG", quality=90, subsampling=0, optimize=True)
        manifest[idx] = dict(bg=name, palette=spec["palette"])
    # ticks and badges
    for name, (light, dark) in TICK_COLORS.items():
        f = f"badge{name}.png"
        if name == "ember":
            im = A.cross_badge(440, light=light, dark=dark)
        else:
            im = A.tick_badge(440, light=light, dark=dark, mode="badge")
        im.save(os.path.join(OUT, f))
        im2 = A.tick_badge(440, light=light, dark=dark, mode="bare") if name != "ember" else im
        if name != "ember":
            im2.save(os.path.join(OUT, f"tickbare{name}.png"))
    # a few extra inks for darker backgrounds
    for name, (light, dark) in (("deep", ("#F2C97F", "#8A5F14")), ("deepmint", ("#98E6CE", "#1F6B59")),
                                ("deeprose", ("#F6BFA0", "#8E4526")), ("deeplilac", ("#C9BDF7", "#463199"))):
        A.tick_badge(440, light=light, dark=dark, mode="badge").save(os.path.join(OUT, f"badge{name}.png"))
        A.tick_badge(440, light=light, dark=dark, mode="bare").save(os.path.join(OUT, f"tickbare{name}.png"))
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    return manifest


if __name__ == "__main__":
    import sys
    build_assets(full="--all" in sys.argv or True)
    print("assets written to", OUT)
