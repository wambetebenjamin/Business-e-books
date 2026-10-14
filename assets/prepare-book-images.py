#!/usr/bin/env python3
"""
Prepare the photography for the Treasure Tuesday booklet.

Everything here is deliberately conservative about resolution: a panel is only
ever as large as its pixels allow, so nothing in the book is upscaled and
nothing prints soft.  Sources are Pexels images (free to use, no attribution
required, no watermark: https://www.pexels.com/license/).

  python3 assets/prepare-book-images.py

writes assets/img/<name>.jpg plus assets/img/manifest.json (pixel sizes, which
the generator uses to size every photo box).
"""
import json
import os
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SRC = os.path.join(REPO, 'image-search')
OUT = os.path.join(HERE, 'img')

# name -> source file (relative to the repo). Cropped to 2:3 if needed.
NEW = {
    'choir.jpg':     'image-search/pexels-african-church-youth-worship-band-1.jpg',
    'worship.jpg':   'image-search/pexels-african-church-youth-worship-band-4.jpg',
    'gathering.jpg': 'image-search/pexels-african-church-youth-worship-band-5.jpg',
}
PORTRAIT_AR = 2 / 3


def crop_to(im, ar):
    """Centre-crop to an aspect ratio (w/h), keeping every available pixel."""
    w, h = im.size
    if abs(w / h - ar) < 0.01:
        return im
    if w / h > ar:                      # too wide
        nw = int(round(h * ar))
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = int(round(w / ar))             # too tall
    y = (h - nh) // 3                   # bias upward: faces sit high in frame
    return im.crop((0, y, w, y + nh))


def finish(im, path, quality=95):
    """Gentle grade + unsharp, then a high quality save (no resampling)."""
    im = ImageOps.autocontrast(im, cutoff=0.5)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=78, threshold=2))
    im.save(path, 'JPEG', quality=quality, subsampling=0, optimize=True)
    return im.size


def main():
    os.makedirs(OUT, exist_ok=True)
    sizes = {}

    for name, rel in NEW.items():
        src = os.path.join(REPO, rel)
        if not os.path.exists(src):
            print(f'skip {name}: {rel} missing')
            continue
        im = crop_to(Image.open(src).convert('RGB'), PORTRAIT_AR)
        w, h = finish(im, os.path.join(OUT, name))
        print(f'{name:16s} {w}x{h}  <- {rel}')
        sizes[name] = (w, h)

    # keep the already prepared frames (they were cropped from Pexels originals)
    for name in sorted(os.listdir(OUT)):
        if not name.endswith('.jpg') or name in sizes:
            continue
        with Image.open(os.path.join(OUT, name)) as im:
            sizes[name] = im.size
            print(f'{name:16s} {im.size[0]}x{im.size[1]}  (kept)')

    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump({k: {'w': v[0], 'h': v[1]} for k, v in sorted(sizes.items())}, f, indent=1)
    print('\nwrote manifest.json with', len(sizes), 'entries')


if __name__ == '__main__':
    main()
