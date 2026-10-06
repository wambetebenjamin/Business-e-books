# Gestalt Theory and Its Application to Counselling

MCP504 · Theories of Counseling and Psychotherapy · Group 4 · Pan African Christian University
22-slide deck (16:9), built with pptxgenjs + a custom OOXML post-processor.
Design follows the repository's uploaded presentation reference (`company profile.pdf`)
palette (flat corporate navy/white/soft-blue) with a modern asymmetric card layout,
rounded photo cards with soft shadows, and **native PowerPoint animations + Morph
transitions**. Photography: royalty-free Unsplash images — professional people
photos wherever people are the subject (counselling conversations, meditation,
therapy groups, students), neutral object photos elsewhere — over full-bleed
ultrarealistic silhouette backgrounds.

## Theme
- **Backgrounds** — every slide sits on a full-bleed photographic silhouette
  (1600×900): bright-sky figure silhouettes under a white 72 % overlay on light
  slides, a starry-night figure silhouette under an 80 % deep-navy overlay on
  dark slides (01, 05, 12, 18, 21)
- **Colours** — deep navy `#162B57` · dark navy `#0A1937` · periwinkle `#8097BE`
  (accent, on solid navy cards only) · slate `#717E9B` · white · light-blue tints
  — flat corporate, no ornaments
- **Typography** — **Georgia** (Bold Title-Case titles / Italic quotes) +
  **Calibri** (Bold eyebrows, labels, leads, chips, numbers, flows / Regular
  body / Italic citations) — universal Office fonts, no semibold families
- **Structure** — asymmetric grids: staggered and offset floating cards with soft
  drop shadows, 60/40 and 40/30/30 column splits, indented panels, numbered lists,
  contrast panels, card grids; consistent eyebrow → title → rule → content rhythm
- **Images** — every photo sits in a rounded-corner card (native `roundRect`
  geometry on the picture, 5% radius) lifted with a soft drop shadow
- **Motion (native OOXML, injected by `animate.js`)** —
  titles: Fade In 0.35 s on click · content blocks: Wipe left-to-right, sequential
  · image cards: Float In after the text · slide transitions: **Morph** on all
  slides (fade fallback for older PowerPoint). Nothing is flattened — all text,
  shapes and pictures remain fully editable.

## Layout
- `source/content.md` — the user's pasted content (verbatim)
- `assets/` — Unsplash photos, exact-aspect crops: people photos (`h-*.jpg`),
  object photos (`p-*.jpg`), silhouette backgrounds (`bg-light*.jpg`,
  `bg-dark.jpg`) + flat icons
- `build.js` — pptxgenjs generator → `output/…​.pptx` (every animated element
  carries an `objectName`: `hdr` / `blkN` / `img`)
- `animate.js` — post-processor: rounds picture geometry, injects Morph
  transitions + the native animation timing tree
- `render.js` — renders the actual PPTX (parses its OOXML) to PNG + PDF and runs
  deterministic QA: text overflow, text/background contrast (WCAG-style, sampled
  from the composited canvas), text-on-text overlap, footer numbering, placeholder
  scan — using real Gelasio / Carlito metrics (metric-compatible with
  Georgia / Calibri)
- `check-content.py` — asserts all 280 required content phrases are present
- `render-report.txt` — latest QA report · `slides-manifest.json` — slide order

## Rebuild & verify
```bash
npm install                                              # pptxgenjs, @napi-rs/canvas, adm-zip, pdfkit,
                                                         # dejavu-fonts-ttf, @fontsource/{gelasio,carlito}
node build.js        # writes output/<Deck Title>.pptx
node animate.js      # injects rounded photo geometry + animations + Morph
node render.js       # writes output/<Deck Title>.pdf + render/*.png + QA report (exits 1 on issues)
python3 check-content.py
```

Fonts named in the .pptx are **Georgia** and **Calibri** — universal Office
fonts, so the presenting machine renders them natively with no installs.
(QA renders with Gelasio/Carlito, their metric-compatible open clones.)
Glyphs they lack (→ ↓ ↔ ≠ ✓ ✗) are auto-substituted by PowerPoint, exactly as
the QA renderer does with DejaVu.

Note: the user's pasted outline skipped slides 11–20; the deck contains the
22 provided slides, numbered sequentially 01–22 in the footer.

