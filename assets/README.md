# Booklet assets

Support files for `../generate-treasure-tuesday.js`.

## fonts/

One family: **Droid Serif**, the typeface of the supplied template
(`../topic book.pdf`, which embeds DroidSerif and DroidSerif-Bold), in its four
real styles. Apache License 2.0.

| file | face | used for |
|---|---|---|
| `droid-serif-regular.ttf` | Droid Serif 400 | body copy |
| `droid-serif-bold.ttf` | Droid Serif 700 | headlines, section heads, kickers, labels |
| `droid-serif-italic.ttf` | Droid Serif Italic | intros, notes, pull quotes, scripture |
| `droid-serif-bolditalic.ttf` | Droid Serif Bold Italic | emphasis inside body copy |

Earlier drafts of this booklet set its display type in Playfair Display, Lora,
Cormorant Garamond and Marcellus SC. Those four Google families were
machine-generated descendants, so they were removed from the repository and the
book is now set in the template's own face.

## img/

The photo pool, 784 KB. Photography is from Pexels: free to use, no attribution
required, no watermark (<https://www.pexels.com/license/>). These files are the
*source* for the silhouettes below; the booklet no longer places them on a page.

`prepare-book-images.py` centre crops each source, grades it slightly and
unsharps it, then writes `manifest.json`.

## sil/

What the booklet actually draws. Every picture is matted, cleaned up, and
written out as a single flat tone with a soft edge, so a page carries a shape
rather than a photograph.

    python3 assets/make-silhouettes.py            # cut every shape
    python3 assets/make-silhouettes.py cover worship

| shape | source | appears |
|---|---|---|
| `worship` | hands raised in worship | front cover, page 6 |
| `cover` | a young worshipper, arm raised | back cover |
| `community` | the youth group | page 2, page 6 |
| `choir` | the choir in robes | page 7 |
| `reflect` | two people listening | page 9 |
| `nairobi` | the city skyline | page 8, as a horizon |

**How the cut is made.** `make-silhouettes.py` runs IS-Net (an MIT licensed
segmentation network, <https://github.com/xuebinqin/DIS>) over each picture,
thresholds the matte, drops specks, keeps the biggest blobs, fills interior
holes, closes ragged edges and feathers the outline by about a pixel. The
subject's own organic outline survives; every pixel of detail inside it is
gone. Shapes are written at 900 px on the long edge or more, so no panel prints
below 150 dpi, and in two tones: `ink/` (near black plum, for cream pages) and
`paper/` (cream, for the ink pages). `manifest.json` carries the pixel sizes.

**Weights.** IS-Net is redistributed inside the `@imgly/background-removal-node`
npm bundle (the package itself is AGPL, the model is MIT; only the weights are
used here, never that package's code, inference is written against onnxruntime
direct). The 44 MB file is not committed, so fetch it once:

    npm pack @imgly/background-removal-node@1.4.5
    tar xzf imgly-background-removal-node-1.4.5.tgz
    python3 assets/make-silhouettes.py --fetch package

which reassembles `package/dist` chunks into `assets/sil/model/isnet.onnx` using
`package/dist/resources.json`. Requires `pillow`, `numpy` and `onnxruntime`.

## palette

The book uses six colours and three tints of one of them, all defined at the
top of the generator:

| constant | value | role |
|---|---|---|
| `ink` | `#2E1140` | body type, dark shapes |
| `plum` | `#3A0F6B` | dark panels, second gradient stop |
| `accent` | `#C1126B` | the one accent |
| `gold` | `#E0A32E` | rules, kickers, the metal |
| `white` | `#FFFFFF` | the template's page |
| `paper` | `#FBF7F1` | warm paper: tints, and type on dark |

plus `tint`, `tint2` and `edge`, three tints of plum for panels and hairlines.
Secondary copy is set in `ink` at reduced opacity rather than in a grey, which
keeps the page inside the same six colours.
