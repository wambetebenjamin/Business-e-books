# Treasure Tuesday booklet assets

Build the revised ebook with `npm ci && npm run build:booklet`. Run `npm test`
for PDF style and build checks. The output is
`Cancel Culture vs Grace Culture - Treasure Tuesday.pdf` in the repository root.

## Typography

The booklet uses classic **Times**, the standard PDF text family:

| Face | Role |
|---|---|
| Times-Roman | Body copy |
| Times-Bold | Headings, labels and emphasis |
| Times-Italic | Introductions, quotes and scripture |
| Times-BoldItalic | Available for bold italic emphasis |

These are conventional fonts, not generated lettering. Text remains selectable.
PDF viewers provide the standard Times faces; no font download is needed.
The earlier Droid Serif files in `fonts/` are retained as template assets but
are not used by the revised booklet. Droid Serif is also a conventional font;
neither it nor the earlier Google font families should be described as
AI-generated merely because of their source or appearance.

## Restrained palette

Only three base colors are used for text, shapes and page backgrounds:

| Color | Value | Role |
|---|---|---|
| Charcoal | `#29252C` | Body copy, headings and dark panels |
| Warm paper | `#FBF7F1` | Light pages and text on dark panels |
| Muted gold | `#997440` | Rules, borders and dark-page accents |

Legacy role names in the generator share these values. There are no multicolor
gradients or alternating colored list markers. Subtle panels and watermarks
use transparency of the same colors rather than additional swatches.

## Faint silhouette backgrounds

Every page starts with a flat charcoal image silhouette at **4.5% opacity**,
behind the text. Dark panels cover that background and, where called for by
the layout, receive warm-paper silhouettes at **14% opacity**. No original
full-color photograph is placed in the PDF. Image transparency is applied with
PDFKit's saved graphics state and restored immediately after drawing, so it
does not fade subsequent text. Silhouettes remain at least 150 dpi.

`sil/` contains five flat shapes in two tones, with transparent backgrounds:
`worship`, `community`, `reflect`, `cover` and `choir`. The manifest records
pixel dimensions. The image pixels contain only the appropriate flat palette
color; all photographic interior detail has been removed.

## Source images and optional regeneration

`img/` contains the original Pexels source photo pool, not page artwork.
Pexels license: <https://www.pexels.com/license/>.
`prepare-book-images.py` crops and prepares the source photographs.

The committed silhouettes are sufficient to build the ebook. To regenerate
their outlines, `make-silhouettes.py` uses IS-Net segmentation, cleans the matte,
and retains only a single-tone outline. This is image processing, not font
generation. Install Pillow, NumPy and ONNX Runtime in a Python virtual
environment first. Model weights are not committed.

```sh
npm pack @imgly/background-removal-node@1.4.5
tar xzf imgly-background-removal-node-1.4.5.tgz
python3 assets/make-silhouettes.py --fetch package
python3 assets/make-silhouettes.py
# Or regenerate selected outlines:
python3 assets/make-silhouettes.py cover worship
```

The model weights are MIT licensed (IS-Net:
<https://github.com/xuebinqin/DIS>). They are distributed in the IMG.LY npm
bundle; its package code is not used by this script. Inference uses ONNX Runtime
directly. Generated model files are ignored by Git.
