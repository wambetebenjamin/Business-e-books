#!/usr/bin/env python3
"""
Cut the photo pool down to flat silhouettes for the Treasure Tuesday booklet.

Each picture is matted with IS-Net (a segmentation network), the matte is
cleaned up, and the subject is written out as a single flat tone with a soft
edge.  Nothing of the original photograph survives except the outline, so the
book lays silhouettes onto the page instead of full colour pictures.

Two tones are produced for every shape:

  ink/     charcoal, for cream pages
  paper/   cream, for the ink pages

  python3 assets/make-silhouettes.py             # cut every shape
  python3 assets/make-silhouettes.py cover worship

Model weights.  IS-Net is MIT licensed (https://github.com/xuebinqin/DIS) and
is redistributed inside the `@imgly/background-removal-node` npm bundle.  The
weights are not committed here (40 MB plus); fetch them once:

  npm pack @imgly/background-removal-node@1.4.5
  tar xzf imgly-background-removal-node-1.4.5.tgz
  python3 assets/make-silhouettes.py --fetch package

which reassembles package/dist chunks into assets/sil/model/isnet.onnx using
package/dist/resources.json.  Only the weights are used; no code from that
package runs here, the inference below is written against onnxruntime direct.

Writes assets/sil/<tone>/<name>.png plus assets/sil/manifest.json (pixel sizes,
which the booklet generator uses to size every shape).
"""
import json
import os
import shutil
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SRC = os.path.join(HERE, 'img')
OUT = os.path.join(HERE, 'sil')
MODEL = os.path.join(OUT, 'model', 'isnet.onnx')

TONE = {'ink': (41, 37, 44), 'paper': (251, 247, 241)}
MIN_W = 900            # every shape is written at least this wide (about 155 dpi full bleed)
BLUR_STEPS = [0.35, 0.5, 0.7]    # soft edge, in pixels, one per pass


# ------------------------------------------------------------------ model ----------
def fetch(dist_dir):
    """Reassemble the model from an unpacked @imgly/background-removal-node bundle."""
    res = json.load(open(os.path.join(dist_dir, 'dist', 'resources.json')))
    if '/models/small' not in res:
        sys.exit('no /models/small in resources.json')
    info = res['/models/small']
    os.makedirs(os.path.dirname(MODEL), exist_ok=True)
    with open(MODEL, 'wb') as fh:
        for chunk in info['chunks']:
            fh.write(open(os.path.join(dist_dir, 'dist', chunk['hash']), 'rb').read())
    size = os.path.getsize(MODEL)
    print(f'model: {MODEL}  {size / 1e6:.1f} MB  ({size} bytes, expected {info["size"]})')
    return size == info['size']


def session():
    if not os.path.exists(MODEL):
        sys.exit(f'missing {MODEL}\nrun: npm pack @imgly/background-removal-node@1.4.5 && '
                 f'tar xzf *.tgz && python3 assets/make-silhouettes.py --fetch package')
    import onnxruntime as ort
    return ort.InferenceSession(MODEL, providers=['CPUExecutionProvider'])


def matte(path, sess, resolution=1024):
    """IS-Net forward pass, returns (image, alpha 0..1 at the image's own size)."""
    im = Image.open(path).convert('RGB')
    w, h = im.size
    x = np.asarray(im.resize((resolution, resolution), Image.BILINEAR), np.float32)
    x = ((x - 128.0) / 256.0).transpose(2, 0, 1)[None]      # HWC to BCHW, /256 normalisation
    names = [o.name for o in sess.get_outputs()]
    out = sess.run(['output' if 'output' in names else names[0]], {'input': x})[0][0, 0]
    out = (out - out.min()) / (out.max() - out.min() + 1e-8)
    a = Image.fromarray((out * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
    return im, np.asarray(a, np.float32) / 255.0


# ------------------------------------------------------------------ cleanup --------
def components(mask):
    """8 connected label pass, returns (labels, sizes indexed from 1)."""
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    sizes = [0]
    for sy in range(h):
        for sx in np.nonzero(mask[sy])[0]:
            if lab[sy, sx] == 0:
                n = len(sizes)
                lab[sy, sx] = n
                q = deque([(sy, int(sx))])
                cnt = 0
                while q:
                    y, x = q.popleft()
                    cnt += 1
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and lab[ny, nx] == 0:
                                lab[ny, nx] = n
                                q.append((ny, nx))
                sizes.append(cnt)
    return lab, sizes


def clean(a, thr=0.5, keep=1, min_frac=0.003, smooth=True, feather=0.9, solid=0):
    """Threshold, drop specks, keep the `keep` biggest blobs, fill holes, soften.

    `solid` closes ragged edges and narrow notches with a morphological
        closing of that odd kernel size, for outlines the matte gave a frayed
        edge to (a busy edge against sky is the usual case).
    """
    m = a > thr
    lab, sizes = components(m)
    if len(sizes) > 1:
        order = np.argsort(sizes[1:])[::-1] + 1
        wanted = set(order[:keep])
        drop = [i for i in wanted | set(range(1, len(sizes))) if i not in wanted or sizes[i] < min_frac * m.size]
        m = m & ~np.isin(lab, drop)
    m = m | holes(m)
    img = Image.fromarray((m * 255).astype(np.uint8))
    if solid:
        img = img.filter(ImageFilter.MaxFilter(solid)).filter(ImageFilter.MinFilter(solid))
    if smooth:
        img = img.filter(ImageFilter.MedianFilter(3))
        for b in BLUR_STEPS:
            img = img.filter(ImageFilter.GaussianBlur(b))
    if feather:
        img = img.filter(ImageFilter.GaussianBlur(feather))
    return np.asarray(img, np.float32) / 255.0


def holes(mask):
    """Everything the background flood cannot reach, i.e. the inside of the shape."""
    inv = ~mask
    h, w = mask.shape
    seen = np.zeros((h, w), bool)
    q = deque()
    for y in range(h):
        for x in (0, w - 1):
            if inv[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if inv[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and inv[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return inv & ~seen


# ------------------------------------------------------------------ shapes ---------
# per picture: which blobs to keep, how aggressive the matte is, and any crop or
# mirror the layout needs.  crop is (left, top, right, bottom) in fractions.
SHAPES = {
    'cover':     dict(src='cover.jpg',     crop=(0.48, 0.26, 0.98, 0.84), keep=2, thr=0.5),
    'community': dict(src='community.jpg', crop=(0.06, 0.05, 1.00, 0.98), keep=1, thr=0.5),
    'reflect':   dict(src='reflect.jpg',   crop=(0.03, 0.02, 1.00, 0.78), keep=1, thr=0.5),
    # the city skyline was cut early on, but a skyline outline reads as a smudge
    # rather than a shape once it is small enough to sit under type, so it is
    # dropped.  Add a line back here if the book ever needs a horizon.
    'choir':     dict(src='choir.jpg',     crop=(0.00, 0.30, 1.00, 1.00), keep=1, thr=0.5),
    'worship':   dict(src='worship.jpg',   crop=(0.00, 0.02, 1.00, 0.92), keep=1, thr=0.5),
}


def cut(name, cfg, sess):
    im, a = matte(os.path.join(SRC, cfg['src']), sess)
    m = clean(a, thr=cfg.get('thr', 0.5), keep=cfg.get('keep', 1),
              min_frac=cfg.get('min_frac', 0.003), solid=cfg.get('solid', 0))
    if cfg.get('crop'):
        w, h = im.size
        l, t, r, b = cfg['crop']
        box = (int(l * w), int(t * h), int(r * w), int(b * h))
        im = im.crop(box)
        m = m[box[1]:box[3], box[0]:box[2]]
    if cfg.get('flip') == 'h':
        m = m[:, ::-1]

    h, w = m.shape
    scale = max(1.0, MIN_W / w)
    if scale > 1.0:
        tw, th = int(round(w * scale)), int(round(h * scale))
        m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((tw, th), Image.LANCZOS),
                       np.float32) / 255.0
    h, w = m.shape
    alpha = (m * 255).astype(np.uint8)

    sizes = {}
    for tone, rgb in TONE.items():
        d = os.path.join(OUT, tone)
        os.makedirs(d, exist_ok=True)
        layer = Image.new('RGBA', (w, h), rgb + (0,))
        layer.putalpha(Image.fromarray(alpha))
        layer.save(os.path.join(d, name + '.png'), optimize=True)
        sizes[tone] = os.path.getsize(os.path.join(d, name + '.png'))
    return (w, h), sizes, m.mean()


def main(argv):
    if '--fetch' in argv:
        ok = fetch(argv[argv.index('--fetch') + 1])
        sys.exit(0 if ok else 'size mismatch')
    want = [a for a in argv if not a.startswith('-')] or list(SHAPES)
    sess = session()
    # keep the entries for shapes this run does not touch, so cutting one shape
    # never drops the sizes of the others
    manifest = {}
    if os.path.exists(os.path.join(OUT, 'manifest.json')):
        manifest = json.load(open(os.path.join(OUT, 'manifest.json')))
    print(f'{"shape":11s} {"pixels":>11s}   {"ink":>7s} {"paper":>7s}   ink coverage')
    for name in want:
        cfg = SHAPES[name]
        (w, h), sizes, ink = cut(name, cfg, sess)
        manifest[name] = {'w': w, 'h': h}
        print(f'{name:11s} {w:5d} x {h:5d}   {sizes["ink"] / 1024:6.0f}K {sizes["paper"] / 1024:6.0f}K   {ink * 100:4.1f}%')
    manifest = {k: v for k, v in manifest.items() if k in SHAPES}
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump({k: manifest[k] for k in sorted(manifest)}, f, indent=1)
    print(f'\nmanifest holds {len(manifest)} shapes: {", ".join(sorted(manifest))}')


if __name__ == '__main__':
    main(sys.argv[1:])
