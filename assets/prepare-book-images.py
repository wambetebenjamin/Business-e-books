#!/usr/bin/env python3
"""Prepares the booklet photography.

Every source photo is Pexels-licensed (free for commercial use, no attribution
required, no watermark). The script crops each photo to the exact aspect ratio
of the frame it will fill in the layout and applies a light 'full of life'
colour grade (saturation / contrast / crispness).

Run from the repository root:  python3 assets/prepare-book-images.py
"""
import os
from PIL import Image, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, os.pardir, "image-search")
OUT = os.path.join(HERE, "img")
os.makedirs(OUT, exist_ok=True)

# (source file in ../image-search, output name, frame width pt, frame height pt)
JOBS = [
    ("pexels-worship-hands-raised-colorful-sta-1.jpg", "cover.jpg", 406.2, 350.0),      # cover hero
    ("pexels-young-people-friends-laughing-gro-5.jpg", "community.jpg", 406.2, 256.8),   # p2
    ("pexels-open-bible-holy-scripture-reading-2.jpg", "scripture.jpg", 406.2, 232.0),   # p4
    ("pexels-two-people-talking-reconciliation-1.jpg", "balance.jpg", 406.2, 232.0),     # p6
    ("pexels-african-church-choir-singers-wors-1.jpg", "grace.jpg", 406.2, 350.0),       # p7 (cover-style)
    ("pexels-nairobi-kenya-city-skyline-street-4.jpg", "nairobi.jpg", 406.2, 256.8),     # p8
    ("pexels-african-church-choir-singers-wors-4.jpg", "reflect.jpg", 406.2, 232.0),     # p9
    ("pexels-young-african-man-smiling-portrai-1.jpg", "welcome.jpg", 406.2, 256.3),     # back cover
]

# Pexels photo ids -> licence: https://www.pexels.com/license/
SOURCES = {
    "cover.jpg": "pexels.com/photo/36117935",
    "community.jpg": "pexels.com/photo/8380098",
    "scripture.jpg": "pexels.com/photo/13172072",
    "balance.jpg": "pexels.com/photo/7841796",
    "grace.jpg": "pexels.com/photo/7520074",
    "nairobi.jpg": "pexels.com/photo/4242550",
    "reflect.jpg": "pexels.com/photo/7520351",
    "welcome.jpg": "pexels.com/photo/19518397",
}


def grade(im):
    im = ImageEnhance.Color(im).enhance(1.18)      # full of colour
    im = ImageEnhance.Contrast(im).enhance(1.07)
    im = ImageEnhance.Brightness(im).enhance(1.03)
    return im.filter(ImageFilter.UnsharpMask(radius=1.3, percent=45, threshold=3))


for src, dst, fw, fh in JOBS:
    path = os.path.join(SRC, src)
    if not os.path.exists(path):
        print("!! missing", src)
        continue
    im = Image.open(path).convert("RGB")
    want, w, h = fw / fh, *im.size
    if w / h > want:                                   # too wide -> trim sides
        nw = int(round(h * want))
        x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:                                              # too tall -> keep optical centre
        nh = int(round(w / want))
        y = int(round((h - nh) * 0.42))
        im = im.crop((0, y, w, y + nh))
    im = grade(im)
    im.save(os.path.join(OUT, dst), quality=92, optimize=True)
    print(f"{dst:14s} {im.size[0]}x{im.size[1]}  ar={im.size[0]/im.size[1]:.3f}  <- {SOURCES[dst]}")

with open(os.path.join(HERE, "README.md"), "w") as f:
    f.write(
        "# Booklet assets\n\n"
        "- `fonts/` — Droid Serif (Apache-2.0), the typeface used by the `topic book.pdf` template.\n"
        "- `img/` — photography cropped to the layout frames. All images are Pexels-licensed: "
        "free to use, no attribution required, no watermark (https://www.pexels.com/license/).\n\n"
        "| file | source |\n|---|---|\n"
        + "\n".join(f"| `{k}` | {v} |" for k, v in SOURCES.items())
        + "\n\nRegenerate with `python3 assets/prepare-book-images.py`.\n"
    )
print("done")
