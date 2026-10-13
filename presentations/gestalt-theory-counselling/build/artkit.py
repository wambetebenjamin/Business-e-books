"""
artkit.py
Drawing engine for the Gestalt deck.

Everything here is drawn from scratch with numpy + Pillow so the deck has a
cohesive, hand-crafted look: layered silhouette landscapes (ridge lines,
forest canopies, acacia trees, water, birds, human figures, chairs) painted
onto soft gradient skies, plus glossy three dimensional tick badges.

No photographs, no clip art, no downloaded fonts.
"""

import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

# ----------------------------------------------------------------------------
# small colour helpers
# ----------------------------------------------------------------------------


def hx(c):
    c = c.lstrip("#")
    return np.array([int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)], dtype=float)


def to_hx(rgb):
    return "#%02X%02X%02X" % tuple(int(max(0, min(255, round(v)))) for v in rgb)


def mix(a, b, t):
    a, b = hx(a), hx(b)
    return to_hx(a + (b - a) * t)


def lighten(c, t):
    return mix(c, "#FFFFFF", t)


def darken(c, t):
    return mix(c, "#000000", t)


# ----------------------------------------------------------------------------
# canvas helpers
# ----------------------------------------------------------------------------


def _ramp(stops, n):
    """Sample a colour ramp (list of (pos, '#hex')) at n positions."""
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


def linear_gradient(w, h, stops, angle=90.0):
    """Vertical (90) or arbitrary-angle linear gradient. stops = [(pos, '#hex')]"""
    if abs(angle - 90.0) < 1e-6:
        band = _ramp(stops, h)[:, None, :]              # h x 1 x 3
        return np.repeat(band, w, axis=1).astype(np.float32)
    if abs(angle - 0.0) < 1e-6:
        band = _ramp(stops, w)[None, :, :]              # 1 x w x 3
        return np.repeat(band, h, axis=0).astype(np.float32)
    # diagonal: render a square field then rotate and centre crop
    d = int(math.hypot(w, h))
    band = _ramp(stops, d)[:, None, :]
    im = Image.fromarray(np.repeat(band, d, axis=1).astype(np.uint8))
    im = im.rotate(90 - angle, resample=Image.BICUBIC, expand=True)
    bw, bh = im.size
    left, top = (bw - w) // 2, (bh - h) // 2
    return np.asarray(im.crop((left, top, left + w, top + h))).astype(np.float32)


def radial_glow(w, h, cx, cy, radius, color, strength, power=2.2):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - cx * w) / (radius * w)) ** 2 + ((yy - cy * h) / (radius * w)) ** 2)
    fall = np.clip(1.0 - d, 0, 1) ** power
    col = hx(color)[None, None, :]
    return fall[:, :, None] * col * strength


def vertical_fade(w, h, color, top_alpha, bottom_alpha, power=1.0, start=0.0, end=1.0):
    """A soft veil useful for haze between layers."""
    t = np.linspace(0, 1, h)[:, None]
    a = np.clip((t - start) / max(1e-6, end - start), 0, 1) ** power
    a = top_alpha + (bottom_alpha - top_alpha) * a
    return np.repeat(a[:, :, None], w, axis=1) * hx(color)[None, None, :]


def grain(w, h, seed, amount=3.0):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, amount, (h, w, 1))
    return np.repeat(n, 3, axis=2)


def vignette(w, h, strength=0.30, power=1.6):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    x = (xx / w - 0.5) * 2
    y = (yy / h - 0.5) * 2
    r = np.sqrt(x * x * 0.85 + y * y)
    v = np.clip(1 - strength * (r ** power), 0, 1)
    return v[:, :, None]


# ----------------------------------------------------------------------------
# silhouette geometry
# ----------------------------------------------------------------------------


def ridge_hills(w, seed, base, amp, octaves=4, roughness=0.55, tilt=0.0):
    """Rolling hills: fractal sum of sines."""
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, w)
    y = np.zeros(w)
    f = 1.0
    a = amp
    for i in range(octaves):
        ph = rng.uniform(0, 2 * math.pi)
        y += a * np.sin(2 * math.pi * f * x + ph)
        f *= 1.9 + rng.uniform(0, 0.5)
        a *= roughness
    y += tilt * (x - 0.5)
    return base - y


def ridge_mountains(w, seed, base, amp, peaks=5, sharp=1.0, jitter=0.06):
    """Tent shaped peaks (classic mountain skyline)."""
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, w)
    height = np.zeros(w)
    for _ in range(peaks):
        xc = rng.uniform(-0.15, 1.15)
        hgt = amp * rng.uniform(0.45, 1.0)
        wid = rng.uniform(0.16, 0.42)
        t = np.clip(1 - np.abs(x - xc) / wid, 0, 1)
        height = np.maximum(height, hgt * t ** sharp)
    # a little roughness so the ridge is not glassy
    r = np.zeros(w)
    f = 6.0
    a = amp * jitter
    for _ in range(3):
        ph = rng.uniform(0, 2 * math.pi)
        r += a * np.sin(2 * math.pi * f * x + ph)
        f *= 2.4
        a *= 0.5
    return base - height + r


def ridge_dunes(w, seed, base, amp, tilt=0.0):
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, w)
    y = 0.62 * amp * np.sin(2 * math.pi * 1.1 * x + rng.uniform(0, 6)) \
        + 0.28 * amp * np.sin(2 * math.pi * 2.3 * x + rng.uniform(0, 6)) \
        + 0.12 * amp * np.sin(2 * math.pi * 4.1 * x + rng.uniform(0, 6))
    return base - y + tilt * (x - 0.5)


def ridge_mist_forest(w, seed, base, amp, roughness=0.5):
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, w)
    y = np.zeros(w)
    for f, a in ((1.0, 1.0), (2.7, roughness), (6.0, roughness ** 2)):
        y += amp * a * np.sin(2 * math.pi * f * x + rng.uniform(0, 6))
    return base - y


def fill_below(arr_img, curve, color, alpha=1.0):
    """Paint the region under a curve (array of y positions, one per column)."""
    h, w = arr_img.shape[:2]
    col = hx(color)
    yy = np.arange(h)[:, None]
    mask = (yy >= curve[None, :]).astype(np.float32)
    if alpha < 1.0:
        mask *= alpha
    arr_img[:] = arr_img * (1 - mask[:, :, None]) + col[None, None, :] * mask[:, :, None]
    return arr_img


# ----------------------------------------------------------------------------
# sprite drawing (PIL, transparent canvases pasted onto the sky)
# ----------------------------------------------------------------------------


def sprite(w, h):
    w, h = int(round(w)), int(round(h))
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def taper(draw, p0, p1, w0, w1, color):
    """A tapered limb: filled quad between two points with different widths."""
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L
    pts = [
        (x0 + nx * w0 / 2, y0 + ny * w0 / 2),
        (x1 + nx * w1 / 2, y1 + ny * w1 / 2),
        (x1 - nx * w1 / 2, y1 - ny * w1 / 2),
        (x0 - nx * w0 / 2, y0 - ny * w0 / 2),
    ]
    draw.polygon(pts, fill=color)
    r = max(w0, w1) / 2
    draw.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=color)
    draw.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], fill=color)


def human(height, pose="stand", flip=False, color=(0, 0, 0, 255), lean=0.0):
    """A calm human silhouette on a natural eight head figure (canvas = 0.75 x height).

    pose: stand | walk | face | reach | sit
    """
    H = int(round(float(height)))
    Wd = int(H * 0.75)
    im, d = sprite(Wd, H)
    cx = Wd / 2.0
    lean_shift = lean * 0.16 * H

    def P(x, y):
        """x, y in fractions of the figure height; origin at the ground centre."""
        return (cx + x * H + lean_shift * (1 - y), y * H)

    hr_x, hr_y = 0.038 * H, 0.050 * H
    head_cy = 0.075 * H
    sh_y = 0.172 * H
    waist = 0.355 * H
    hip = 0.470 * H
    ground = 0.995 * H
    arm_w = 0.042 * H
    leg_w = 0.052 * H

    p = pose

    # ------------------------------- legs -------------------------------
    if p == "sit":
        taper(d, P(-0.048, 0.555), P(0.048, 0.555), 0.125 * H, 0.125 * H, color)
        taper(d, P(-0.045, 0.575), P(-0.048, 0.985), 0.105 * H, 0.078 * H, color)
        taper(d, P(0.045, 0.575), P(0.048, 0.985), 0.105 * H, 0.078 * H, color)
    elif p == "walk":
        taper(d, P(-0.024, hip / H), P(-0.070, ground / H), leg_w, leg_w * 0.72, color)
        taper(d, P(0.024, hip / H), P(0.078, ground / H), leg_w, leg_w * 0.72, color)
    else:
        taper(d, P(-0.027, hip / H), P(-0.034, ground / H), leg_w, leg_w * 0.74, color)
        taper(d, P(0.027, hip / H), P(0.034, ground / H), leg_w, leg_w * 0.74, color)

    # ------------------------------ torso -------------------------------
    if p == "sit":
        taper(d, P(0.0, 0.158), P(0.0, 0.395), 0.168 * H, 0.140 * H, color)
        taper(d, P(0.0, 0.395), P(0.0, 0.570), 0.140 * H, 0.195 * H, color)
    else:
        taper(d, P(0.0, sh_y / H), P(0.0, waist / H), 0.158 * H, 0.134 * H, color)
        taper(d, P(0.0, waist / H), P(0.0, (hip + 0.015 * H) / H), 0.134 * H, 0.168 * H, color)

    # ------------------------------- arms -------------------------------
    shoulder_pt = sh_y / H + 0.018
    if p == "face":
        taper(d, P(-0.081, shoulder_pt), P(-0.128, 0.495), arm_w, arm_w * 0.78, color)
        taper(d, P(0.081, shoulder_pt), P(0.128, 0.495), arm_w, arm_w * 0.78, color)
    elif p == "reach":
        taper(d, P(-0.081, shoulder_pt), P(-0.108, 0.545), arm_w, arm_w * 0.78, color)
        taper(d, P(0.081, shoulder_pt), P(0.225, 0.215), arm_w, arm_w * 0.76, color)
    elif p == "sit":
        taper(d, P(-0.081, shoulder_pt), P(-0.098, 0.455), arm_w, arm_w * 0.80, color)
        taper(d, P(0.081, shoulder_pt), P(0.098, 0.455), arm_w, arm_w * 0.80, color)
        taper(d, P(-0.098, 0.455), P(-0.030, 0.540), arm_w * 0.80, arm_w * 0.72, color)
        taper(d, P(0.098, 0.455), P(0.030, 0.540), arm_w * 0.80, arm_w * 0.72, color)
    else:
        swing = 0.028 if p == "walk" else 0.004
        taper(d, P(-0.081, shoulder_pt), P(-0.094 - swing, 0.560), arm_w, arm_w * 0.78, color)
        taper(d, P(0.081, shoulder_pt), P(0.094 + swing, 0.560), arm_w, arm_w * 0.78, color)

    # ---------------------------- neck + head ---------------------------
    taper(d, P(0.0, 0.108), P(0.0, 0.180), 0.038 * H, 0.046 * H, color)
    hx0, hy0 = P(0.0, head_cy / H)
    d.ellipse([hx0 - hr_x, hy0 - hr_y, hx0 + hr_x, hy0 + hr_y], fill=color)
    # hair: a soft mass over the crown, a little heavier at the back of the head
    d.ellipse([hx0 - hr_x * 1.10, hy0 - hr_y * 1.15, hx0 + hr_x * 1.10, hy0 + hr_y * 0.62], fill=color)
    d.ellipse([hx0 - hr_x * 1.16, hy0 - hr_y * 0.30, hx0 - hr_x * 0.05, hy0 + hr_y * 0.80], fill=color)

    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


def chair(height, color=(0, 0, 0, 255), flip=False, style="armchair"):
    """Front on silhouette of a classic upright chair: posts, two rails, seat, legs."""
    h = int(round(float(height)))
    w = int(h * 0.80)
    im, d = sprite(w, h)
    post_w = max(2, int(w * 0.075))
    leg_w = max(2, int(w * 0.062))
    top = h * 0.015
    seat_y0, seat_y1 = h * 0.545, h * 0.625
    # two back posts
    d.rounded_rectangle([w * 0.265, top, w * 0.265 + post_w, seat_y1], radius=post_w * 0.5, fill=color)
    d.rounded_rectangle([w * 0.735 - post_w, top, w * 0.735, seat_y1], radius=post_w * 0.5, fill=color)
    # top rail and mid rail
    d.rounded_rectangle([w * 0.235, top + h * 0.010, w * 0.765, top + h * 0.010 + h * 0.055],
                        radius=h * 0.030, fill=color)
    d.rounded_rectangle([w * 0.275, h * 0.245, w * 0.725, h * 0.245 + h * 0.040],
                        radius=h * 0.022, fill=color)
    # seat
    d.rounded_rectangle([w * 0.135, seat_y0, w * 0.865, seat_y1], radius=h * 0.030, fill=color)
    # legs (slightly splayed)
    outer = 0.055
    d.polygon([(w * 0.18, seat_y1 - h * 0.005), (w * (0.18 + outer), h * 0.985),
               (w * (0.18 + outer) + leg_w, h * 0.985), (w * 0.18 + leg_w, seat_y1 - h * 0.005)], fill=color)
    d.polygon([(w * 0.82 - leg_w, seat_y1 - h * 0.005), (w * (0.82 - outer) - leg_w, h * 0.985),
               (w * (0.82 - outer), h * 0.985), (w * 0.82, seat_y1 - h * 0.005)], fill=color)
    if style == "armchair":
        d.polygon([(w * 0.245, seat_y0), (w * 0.245, seat_y1 + h * 0.05), (w * 0.315, seat_y1 + h * 0.05),
                   (w * 0.315, seat_y0)], fill=color)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


def acacia(w, h, color=(0, 0, 0, 255), canopy=1.0):
    """Kenyan savannah acacia: slender forked trunk under a flat umbrella crown."""
    im, d = sprite(w, h)
    trunk_w = max(2, int(w * 0.030))
    base = h * 0.995
    fork = h * 0.56
    d.polygon([(w * 0.5 - trunk_w * 0.75, base), (w * 0.5 + trunk_w * 0.75, base),
               (w * 0.5 + trunk_w * 0.35, fork), (w * 0.5 - trunk_w * 0.35, fork)], fill=color)
    for (bx, by, tx, ty, tw_) in ((0.50, fork, 0.16, h * 0.315, 0.55), (0.50, fork, 0.84, h * 0.315, 0.55),
                                  (0.50, fork + h * 0.05, 0.30, h * 0.265, 0.45),
                                  (0.50, fork + h * 0.05, 0.70, h * 0.265, 0.45),
                                  (0.50, fork + h * 0.09, 0.44, h * 0.225, 0.40),
                                  (0.50, fork + h * 0.09, 0.56, h * 0.225, 0.40)):
        d.line([(w * bx, by), (w * tx, ty)], fill=color, width=max(1, int(trunk_w * tw_)))
    # umbrella crown: flattened overlapping ellipses
    cy = h * 0.235
    for (ex, ew, eh, ey) in ((0.50, 0.72, 0.090, 0.000), (0.24, 0.40, 0.070, 0.030),
                             (0.76, 0.40, 0.070, 0.030), (0.36, 0.42, 0.066, -0.030),
                             (0.64, 0.42, 0.066, -0.030), (0.50, 0.44, 0.062, -0.055),
                             (0.50, 0.24, 0.048, 0.020)):
        cw, ch = w * ew * canopy, h * eh * canopy
        cxx, cyy = w * ex, cy + h * ey
        d.ellipse([cxx - cw / 2, cyy - ch / 2, cxx + cw / 2, cyy + ch / 2], fill=color)
    return im


def conifer(w, h, color=(0, 0, 0, 255), tilt=0.0):
    """Spruce / cypress silhouette built from descending tiers."""
    im, d = sprite(w, h)
    tiers = 7
    for i in range(tiers):
        t = i / (tiers - 1)
        y0 = h * (0.06 + 0.80 * t)
        half = w * (0.06 + 0.46 * t)
        step = h * 0.16
        xoff = tilt * (1 - t) * w * 0.3
        d.polygon([(w / 2 + xoff, y0 - step), (w / 2 + xoff + half, y0 + step * 0.55),
                   (w / 2 + xoff - half, y0 + step * 0.55)], fill=color)
    d.rectangle([w / 2 - w * 0.035, h * 0.84, w / 2 + w * 0.035, h], fill=color)
    return im


def bare_tree(w, h, color=(0, 0, 0, 255), seed=1, branches=5):
    """A slender winter tree: recursing lines, reads as elegant line work."""
    im, d = sprite(w, h)
    rng = np.random.default_rng(seed)

    def branch(x, y, ang, length, width, depth):
        if depth == 0 or length < h * 0.02:
            return
        x2 = x + math.cos(ang) * length
        y2 = y + math.sin(ang) * length
        d.line([(x, y), (x2, y2)], fill=color, width=max(1, int(width)))
        for _ in range(rng.integers(2, 3)):
            branch(x2, y2, ang + rng.uniform(-0.75, 0.75), length * rng.uniform(0.58, 0.76),
                   width * 0.62, depth - 1)

    branch(w / 2, h, -math.pi / 2, h * 0.42, w * 0.055, 5)
    return im


def bird(x, y, size, color=(0, 0, 0, 255), flap=0.6):
    """A distant gull: two strokes. wing tip offset controls the flap angle."""
    pad = int(size * 1.6)
    im, d = sprite(int(size * 3.2), int(size * 2.0))
    cx, cy = im.size[0] / 2, im.size[1] * 0.72
    lw = max(1, int(size * 0.16))
    dy = size * 0.55 * flap
    d.line([(cx - size * 1.25, cy - dy), (cx, cy)], fill=color, width=lw)
    d.line([(cx, cy), (cx + size * 1.25, cy - dy)], fill=color, width=lw)
    return im


def reeds(w, h, color=(0, 0, 0, 255), seed=3, count=26):
    im, d = sprite(w, h)
    rng = np.random.default_rng(seed)
    for _ in range(count):
        x = rng.uniform(0, w)
        top = h * rng.uniform(0.10, 0.78)
        bend = rng.uniform(-0.10, 0.10) * w
        lw = max(1, int(h * rng.uniform(0.008, 0.018)))
        pts = [(x, h), (x + bend * 0.4, (h + top) / 2), (x + bend, top)]
        d.line(pts, fill=color, width=lw, joint="curve")
        if rng.random() < 0.35:
            d.ellipse([x + bend - lw * 1.2, top - lw * 2.4, x + bend + lw * 1.2, top + lw * 1.2], fill=color)
    return im


def grass_fringe(w, h, color=(0, 0, 0, 255), seed=5, density=1.0, maxlen=1.0):
    im, d = sprite(w, h)
    rng = np.random.default_rng(seed)
    n = int(w / 4.0 * density)
    for _ in range(n):
        x = rng.uniform(0, w)
        ln = h * rng.uniform(0.25, maxlen)
        bend = rng.uniform(-0.35, 0.35) * ln
        d.line([(x, h), (x + bend, h - ln)], fill=color, width=max(1, int(rng.uniform(1, 3))))
    return im


def water_line(w, seed, base, ripple=3.0):
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, w)
    return base + ripple * np.sin(2 * math.pi * 1.5 * x + rng.uniform(0, 6))


# ----------------------------------------------------------------------------
# 3D tick badges
# ----------------------------------------------------------------------------


def _check_path(w, h, inset=0.30, lw=None, shift=(0.0, 0.0)):
    """Points + width of the tick stroke inside a w x h box."""
    lw = lw or w * 0.135
    p1 = (w * inset + shift[0], h * (0.52) + shift[1])
    p2 = (w * (0.43) + shift[0], h * (0.70) + shift[1])
    p3 = (w * (1 - inset * 0.78) + shift[0], h * (0.30) + shift[1])
    return [p1, p2, p3], lw


def tick_badge(size=512, light="#F5D28A", dark="#B07B22", mode="badge", ink="#FFFFFF",
               shadow=True, radius=0.26):
    """A glossy, three dimensional tick.

    mode='badge'  : tick inside a soft rounded squircle with bevel + gloss
    mode='bare'   : an extruded tick with bevel, gloss and drop shadow
    """
    S = size
    ss = 3  # supersample for smooth edges
    W = S * ss
    if mode == "badge":
        pad = int(W * 0.10)
        im = Image.new("RGBA", (W + pad * 2, W + pad * 2), (0, 0, 0, 0))
        # ---- body gradient (light top left -> dark bottom right)
        grad = linear_gradient(W, W, [(0.0, light), (0.55, mix(light, dark, 0.45)), (1.0, dark)], angle=135)
        mask = Image.new("L", (W, W), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * radius), fill=255)
        body = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        body.paste(Image.fromarray(grad.astype(np.uint8)).convert("RGBA"), (0, 0), mask)
        # ---- inner shading top (highlight) and bottom (weight)
        shade = np.zeros((W, W, 4), dtype=np.uint8)
        yy = np.linspace(0, 1, W)[:, None]
        hi = np.clip(1 - yy / 0.55, 0, 1) ** 1.6 * 205
        shade[:, :, 0:3] = 255
        shade[:, :, 3] = hi.astype(np.uint8)
        body = Image.alpha_composite(body, Image.fromarray(shade, "RGBA").filter(ImageFilter.GaussianBlur(W * 0.012)))
        low = np.zeros((W, W, 4), dtype=np.uint8)
        lo = np.clip((yy - 0.5) / 0.5, 0, 1) ** 1.8 * 150
        low[:, :, 3] = lo.astype(np.uint8)          # black shade
        body = Image.alpha_composite(body, Image.fromarray(low, "RGBA").filter(ImageFilter.GaussianBlur(W * 0.02)))
        # ---- bevel edges: light top left, dark bottom right
        bev = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bev)
        bd.rounded_rectangle([W * 0.012, W * 0.012, W * 0.988, W * 0.988], radius=int(W * radius),
                             outline=(255, 255, 255, 130), width=max(2, int(W * 0.014)))
        bev = bev.filter(ImageFilter.GaussianBlur(W * 0.004))
        body = Image.alpha_composite(body, bev)
        # gloss sweep across the top
        gloss = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        gd = ImageDraw.Draw(gloss)
        gd.ellipse([-W * 0.35, -W * 0.92, W * 1.35, W * 0.42], fill=(255, 255, 255, 52))
        gloss = gloss.filter(ImageFilter.GaussianBlur(W * 0.05))
        body = Image.alpha_composite(body, ImageChops.multiply(
            gloss, Image.new("RGBA", (W, W), (255, 255, 255, 255))
        ) if False else Image.composite(gloss, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))
        body.putalpha(ImageChops.multiply(body.getchannel("A"), Image.new("L", (W, W), 255)))
        # keep the tick inside the badge silhouette
        body = Image.composite(body, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask)
        # ---- tick mark drawn on the badge
        pts, lw = _check_path(W, W, inset=0.235, lw=W * 0.112)
        tm = Image.new("L", (W, W), 0)
        ImageDraw.Draw(tm).line(pts, fill=255, width=int(lw), joint="curve")
        for p in pts:
            ImageDraw.Draw(tm).ellipse([p[0] - lw / 2, p[1] - lw / 2, p[0] + lw / 2, p[1] + lw / 2], fill=255)
        # slight emboss: dark copy offset down, then the bright tick
        emb = ImageChops.offset(tm, 0, int(W * 0.012))
        dark_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        dark_layer.putalpha(emb.point(lambda v: int(v * 0.35)))
        dark_layer = Image.composite(dark_layer, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask)
        body = Image.alpha_composite(body, dark_layer)
        tick_grad = linear_gradient(W, W, [(0.0, "#FFFFFF"), (0.7, ink), (1.0, darken(ink, 0.10))], angle=110)
        tick_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        tick_layer.paste(Image.fromarray(tick_grad.astype(np.uint8)).convert("RGBA"), (0, 0), tm)
        body = Image.alpha_composite(body, tick_layer)

        out = Image.new("RGBA", (W + pad * 2, W + pad * 2), (0, 0, 0, 0))
        out.paste(body, (pad, pad), body)
        if shadow:
            sh_h = out.size[1]
            off = int(S * 0.05) * ss
            a = out.getchannel("A").filter(ImageFilter.GaussianBlur(S * 0.045 * ss)).point(
                lambda v: int(v * 0.55))
            shadow_layer = Image.new("RGBA", out.size, (0, 0, 0, 0))
            shadow_layer.putalpha(a)
            shadow_tinted = Image.new("RGBA", out.size, (8, 10, 20, 255))
            shadow_tinted.putalpha(a)
            res = Image.new("RGBA", out.size, (0, 0, 0, 0))
            res.alpha_composite(shadow_tinted, (0, off))
            res.alpha_composite(out, (0, 0))
            out = res
        return out.resize((out.size[0] // ss, out.size[1] // ss), Image.LANCZOS)

    # ---------- bare extruded tick
    work = int(S * 1.0)
    W = work * ss
    canvas = Image.new("RGBA", (W * 2, W * 2), (0, 0, 0, 0))
    pts, lw = _check_path(W, W, inset=0.18, lw=W * 0.16)
    pts = [(x + W * 0.5, y + W * 0.42) for (x, y) in pts]
    mask = Image.new("L", canvas.size, 0)
    md = ImageDraw.Draw(mask)
    md.line(pts, fill=255, width=int(lw), joint="curve")
    for p in pts:
        md.ellipse([p[0] - lw / 2, p[1] - lw / 2, p[0] + lw / 2, p[1] + lw / 2], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(W * 0.004))
    # extrusion (depth) : stacked dark copies going down right
    depth = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    for i in range(int(W * 0.075), 0, -1):
        t = i / (W * 0.075)
        shade = mix(darken(dark, 0.55), darken(dark, 0.15), t)
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        m2 = ImageChops.offset(mask, int(i * 0.55), i)
        layer.paste(Image.new("RGBA", canvas.size, tuple(int(v) for v in hx(shade)) + (255,)), (0, 0), m2)
        depth = Image.alpha_composite(depth, layer)
    body = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    grad = linear_gradient(*canvas.size, stops=[(0.0, light), (0.5, mix(light, dark, 0.35)), (1.0, dark)],
                           angle=120)
    body.paste(Image.fromarray(grad.astype(np.uint8)).convert("RGBA"), (0, 0), mask)
    # inner top highlight + bottom weight
    yy = np.linspace(0, 1, canvas.size[1])[:, None]
    hi = np.zeros((canvas.size[1], canvas.size[0], 4), dtype=np.uint8)
    hi[:, :, 0:3] = 255
    hi[:, :, 3] = (np.clip(1 - yy / 0.6, 0, 1) ** 1.5 * 120).astype(np.uint8)
    body = Image.alpha_composite(body, Image.fromarray(hi, "RGBA").filter(ImageFilter.GaussianBlur(W * 0.01)))
    body = Image.composite(body, Image.new("RGBA", canvas.size, (0, 0, 0, 0)), mask)
    res = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    if shadow:
        a = mask.filter(ImageFilter.GaussianBlur(W * 0.05)).point(lambda v: int(v * 0.5))
        s = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        s.paste(Image.new("RGBA", canvas.size, (6, 8, 16, 255)), (0, 0), a)
        res.alpha_composite(s, (int(W * 0.03), int(W * 0.05)))
    res.alpha_composite(depth, (0, 0))
    res.alpha_composite(body, (0, 0))
    box = mask.getbbox()
    pad = int(W * 0.06)
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(res.size[0], box[2] + pad), min(res.size[1], box[3] + pad))
    res = res.crop(box)
    return res.resize((max(8, res.size[0] // ss), max(8, res.size[1] // ss)), Image.LANCZOS)


def cross_badge(size=512, light="#F0A0A0", dark="#96303A", ink="#FFFFFF", radius=0.26):
    """Same 3D treatment, but with a cross (used only for contrast examples)."""
    S = size
    ss = 3
    W = S * ss
    pad = int(W * 0.10)
    grad = linear_gradient(W, W, [(0.0, light), (0.55, mix(light, dark, 0.45)), (1.0, dark)], angle=135)
    mask = Image.new("L", (W, W), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * radius), fill=255)
    body = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    body.paste(Image.fromarray(grad.astype(np.uint8)).convert("RGBA"), (0, 0), mask)
    yy = np.linspace(0, 1, W)[:, None]
    hi = np.zeros((W, W, 4), dtype=np.uint8)
    hi[:, :, 0:3] = 255
    hi[:, :, 3] = (np.clip(1 - yy / 0.55, 0, 1) ** 1.6 * 200).astype(np.uint8)
    body = Image.alpha_composite(body, Image.fromarray(hi, "RGBA").filter(ImageFilter.GaussianBlur(W * 0.012)))
    gloss = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    ImageDraw.Draw(gloss).ellipse([-W * 0.35, -W * 0.92, W * 1.35, W * 0.42], fill=(255, 255, 255, 52))
    gloss = gloss.filter(ImageFilter.GaussianBlur(W * 0.05))
    body.alpha_composite(Image.composite(gloss, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))
    bev = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    ImageDraw.Draw(bev).rounded_rectangle([W * 0.012, W * 0.012, W * 0.988, W * 0.988], radius=int(W * radius),
                                          outline=(255, 255, 255, 120), width=max(2, int(W * 0.014)))
    body.alpha_composite(bev.filter(ImageFilter.GaussianBlur(W * 0.004)))
    x0, x1, y0, y1 = W * 0.31, W * 0.69, W * 0.31, W * 0.69
    lw = int(W * 0.105)
    tm = Image.new("L", (W, W), 0)
    td = ImageDraw.Draw(tm)
    td.line([(x0, y0), (x1, y1)], fill=255, width=lw, joint="curve")
    td.line([(x0, y1), (x1, y0)], fill=255, width=lw, joint="curve")
    for p in ((x0, y0), (x1, y1), (x0, y1), (x1, y0)):
        td.ellipse([p[0] - lw / 2, p[1] - lw / 2, p[0] + lw / 2, p[1] + lw / 2], fill=255)
    emb = ImageChops.offset(tm, 0, int(W * 0.012))
    dl = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    dl.putalpha(emb.point(lambda v: int(v * 0.33)))
    body.alpha_composite(Image.composite(dl, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))
    tg = linear_gradient(W, W, [(0.0, "#FFFFFF"), (0.7, ink), (1.0, darken(ink, 0.1))], angle=110)
    tl = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    tl.paste(Image.fromarray(tg.astype(np.uint8)).convert("RGBA"), (0, 0), tm)
    body.alpha_composite(tl)
    out = Image.new("RGBA", (W + pad * 2, W + pad * 2), (0, 0, 0, 0))
    out.paste(body, (pad, pad), body)
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(S * 0.045 * ss)).point(lambda v: int(v * 0.55))
    sh = Image.new("RGBA", out.size, (0, 0, 0, 0))
    sh.paste(Image.new("RGBA", out.size, (8, 10, 20, 255)), (0, int(S * 0.05) * ss), a)
    res = Image.new("RGBA", out.size, (0, 0, 0, 0))
    res.alpha_composite(sh)
    res.alpha_composite(out)
    return res.resize((res.size[0] // ss, res.size[1] // ss), Image.LANCZOS)


def arrow_glow(size, color, alpha=200):
    """Small elegant chevron used inside flow chains."""
    W = size * 4
    im, d = sprite(W, W)
    lw = max(2, int(W * 0.055))
    d.line([(W * 0.34, W * 0.26), (W * 0.62, W * 0.5), (W * 0.34, W * 0.74)], fill=color + (alpha,),
           width=lw, joint="curve")
    d.line([(W * 0.52, W * 0.26), (W * 0.80, W * 0.5), (W * 0.52, W * 0.74)], fill=color + (int(alpha * 0.55),),
           width=lw, joint="curve")
    return im


def medallion(size=440, text="FP", light="#F7DCA0", dark="#B4801F",
              font_path="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              ink="#FFFFFF", sub=None):
    """A glossy 3D roundel carrying initials, used for the theorist portraits."""
    from PIL import ImageFont
    S = size
    ss = 3
    W = S * ss
    pad = int(W * 0.10)
    grad = linear_gradient(W, W, [(0.0, light), (0.55, mix(light, dark, 0.45)), (1.0, dark)], angle=135)
    mask = Image.new("L", (W, W), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, W - 1, W - 1], fill=255)
    body = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    body.paste(Image.fromarray(grad.astype(np.uint8)).convert("RGBA"), (0, 0), mask)
    yy = np.linspace(0, 1, W)[:, None]
    hi = np.zeros((W, W, 4), dtype=np.uint8)
    hi[:, :, 0:3] = 255
    hi[:, :, 3] = (np.clip(1 - yy / 0.5, 0, 1) ** 1.5 * 190).astype(np.uint8)
    body = Image.alpha_composite(body, Image.fromarray(hi, "RGBA").filter(ImageFilter.GaussianBlur(W * 0.012)))
    gloss = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    ImageDraw.Draw(gloss).ellipse([-W * 0.30, -W * 0.80, W * 1.30, W * 0.40], fill=(255, 255, 255, 58))
    gloss = gloss.filter(ImageFilter.GaussianBlur(W * 0.05))
    body.alpha_composite(Image.composite(gloss, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))
    bev = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    ImageDraw.Draw(bev).ellipse([W * 0.014, W * 0.014, W * 0.986, W * 0.986],
                                outline=(255, 255, 255, 120), width=max(2, int(W * 0.014)))
    body.alpha_composite(bev.filter(ImageFilter.GaussianBlur(W * 0.004)))
    # initials, with a soft emboss
    ts = int(W * (0.40 if len(text) <= 2 else 0.30))
    font = ImageFont.truetype(font_path, ts)
    tm = Image.new("L", (W, W), 0)
    td = ImageDraw.Draw(tm)
    bb = td.textbbox((0, 0), text, font=font)
    tx = (W - (bb[2] - bb[0])) / 2 - bb[0]
    ty = (W - (bb[3] - bb[1])) / 2 - bb[1] - (W * 0.03 if sub else 0)
    td.text((tx, ty), text, font=font, fill=255)
    emb = ImageChops.offset(tm, 0, int(W * 0.010))
    dl = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    dl.putalpha(emb.point(lambda v: int(v * 0.30)))
    body.alpha_composite(Image.composite(dl, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))
    tl = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    tg = linear_gradient(W, W, [(0.0, "#FFFFFF"), (0.75, ink), (1.0, darken(ink, 0.08))], angle=110)
    tl.paste(Image.fromarray(tg.astype(np.uint8)).convert("RGBA"), (0, 0), tm)
    body.alpha_composite(tl)
    if sub:
        fs = int(W * 0.115)
        f2 = ImageFont.truetype(font_path, fs)
        sm = Image.new("L", (W, W), 0)
        sd = ImageDraw.Draw(sm)
        bb2 = sd.textbbox((0, 0), sub, font=f2)
        sd.text(((W - (bb2[2] - bb2[0])) / 2 - bb2[0], ty + ts * 1.12), sub, font=f2, fill=255)
        sl = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        sl.paste(Image.new("RGBA", (W, W), (255, 255, 255, 235)), (0, 0), sm)
        body.alpha_composite(sl)
    out = Image.new("RGBA", (W + pad * 2, W + pad * 2), (0, 0, 0, 0))
    out.paste(body, (pad, pad), body)
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(S * 0.05 * ss)).point(lambda v: int(v * 0.5))
    sh = Image.new("RGBA", out.size, (0, 0, 0, 0))
    sh.paste(Image.new("RGBA", out.size, (8, 10, 20, 255)), (0, int(S * 0.05) * ss), a)
    res = Image.new("RGBA", out.size, (0, 0, 0, 0))
    res.alpha_composite(sh)
    res.alpha_composite(out)
    return res.resize((res.size[0] // ss, res.size[1] // ss), Image.LANCZOS)


def figure_ground_rings(size=1200, accent="#9BE3CE", accent2="#5FA893"):
    """A quiet diagram of figure and ground: one lit centre inside fading rings."""
    S = size
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    for i, (r, a, w) in enumerate([(0.235, 0.16, 0.055), (0.335, 0.24, 0.010),
                                   (0.455, 0.18, 0.008), (0.575, 0.13, 0.007),
                                   (0.695, 0.09, 0.006), (0.815, 0.055, 0.005),
                                   (0.935, 0.03, 0.004)]):
        layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        rr = r * S
        col = hx(accent if i == 0 else accent2)
        d.ellipse([S / 2 - rr, S / 2 - rr, S / 2 + rr, S / 2 + rr],
                  fill=tuple(int(v) for v in col) + (int(255 * a),) if i == 0 else None,
                  outline=None if i == 0 else tuple(int(v) for v in col) + (int(255 * a),),
                  width=max(2, int(w * S)))
        if i == 0:
            layer = layer.filter(ImageFilter.GaussianBlur(S * 0.045))
        im.alpha_composite(layer)
    # a soft halo in the centre so the figure truly steps forward
    hal = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(hal)
    r = S * 0.36
    d.ellipse([S / 2 - r, S / 2 - r, S / 2 + r, S / 2 + r],
              fill=tuple(int(v) for v in hx(accent)) + (46,))
    im.alpha_composite(hal.filter(ImageFilter.GaussianBlur(S * 0.07)))
    return im
