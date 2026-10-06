# Changelog — Gestalt Theory and Its Application to Counselling

Deck: 22 slides · 16:9 · MCP504 Group 4 · Pan African Christian University
All versions live on branch `arena/11c8b4ea-business-e-books`; every version keeps
the same output path and the same 280 required content phrases (verified by
`check-content.py` on each release).

---

## v4 — Modern redesign: cards, premium fonts, animations *(current)*
Commit `d2dd6dd` · replaces every photo, every layout, every font

### Photography — all 22 images replaced
- **Why:** the previous stock people photos looked off ("funny lustive pics").
- Every photo is now a **neutral, professional Unsplash image** — misty mountains,
  library shelves, stacked zen stones, sunlight through a window, handwritten
  letters, a compass, an open notebook, rows of empty chairs, a forest path, calm
  water, a mountain summit. **No people photos, no AI images, no watermarks** —
  all full-resolution (3000 px) royalty-free Unsplash sources, cropped to exact
  card aspect ratios.
- Old `side-*`, `bg-*`, `card-*`, `strip-*`, `banner-*`, `title-photo.jpg` assets
  removed; new assets are `assets/p-*.jpg`.

### Structure — asymmetric floating-card layouts
- Page background is now a soft cool tint (`#F3F5FA`) on light slides so **white
  floating cards with soft drop shadows** visibly lift off the page.
- Flat aligned columns replaced with **dynamic asymmetric grids**:
  staggered theorist cards (S4), offset assumption/counsellor panels (S5, S12, S18),
  indented example + influence panels (S3, S14), staggered technique tiles and
  strengths cards (S13, S17), offset case-study columns (S19, S20).
- All scattered text grouped into **clean container cards** (numbered lists,
  labelled panels, chips, tables, diagrams) — nothing floats loose on the page.
- Full-bleed hard-edged photo backgrounds removed; photos now sit in their own
  cards (dark slides use navy cards on the deep-navy page).

### Typography — premium font pair (global replace)
- **Headers/titles:** Plus Jakarta Sans **Bold** (tracked, uppercase).
- **Eyebrows, subheads, card headers, lead statements:** Plus Jakarta Sans
  **SemiBold**.
- **Body:** **Inter** Regular at a generous **1.3 line height** for scannability;
  Inter **SemiBold** for chips/numbers/flows; Inter **Italic** for citations/quotes.
- (Previously Poppins Bold/Regular; before that Georgia/Arial.)

### Image container effects
- Every photo container has **rounded corners** (native `roundRect` geometry at 5 %
  radius — injected into the picture's XML, not baked into pixels).
- Every photo has a **subtle modern drop shadow** (native PowerPoint outer shadow).

### Native animations & transitions (injected OOXML — fully editable)
- **Titles** → Fade In, **0.35 s**, on click.
- **Body copy & text blocks** → **Wipe, left-to-right**, sequential (one click,
  then blocks cascade in reading order).
- **Image cards** → soft **Float In** (fade + gentle rise) immediately after the
  text blocks.
- **Slide transitions** → **Morph** on all 22 slides (matching anchors glide when
  advancing; pre-2016 PowerPoint falls back to Fade).
- Implemented by `animate.js`, a post-processor that rewrites the .pptx's slide
  XML. **Nothing is flattened** — all text, shapes and pictures stay editable.

### Verification (this release)
- `node render.js` QA: **0 issues** — no text overflow, no low-contrast text, no
  overlaps, correct numbering (measured with real Plus Jakarta Sans / Inter font
  metrics).
- `python3 check-content.py`: **280 / 280 required phrases present**.
- Injected XML validated on all 22 slides: well-formed, Morph + timing present,
  unique animation ids, no dangling shape references.

---

## v3 — Typography & structure pass
Commit `94906f8` · Poppins hierarchy (Bold titles / SemiBold subheads / Regular
body / Italic citations), tracked eyebrow section tags on every slide
(OVERVIEW → FOUNDATIONS → CORE CONCEPTS → PRACTICE → EVALUATION → CLOSING),
44 pt stacked hero on the title slide, numbered assumption & counsellor-role
lists, focus/past contrast panels, strengths card grid, contact-boundary
diagram, airier technique table.

## v2 — Theme replacement
Commit `7f2f6a0` · Wardiere green/cream/gold + Georgia/Arial replaced with the
uploaded `company profile.pdf` design DNA: flat navy `#162B57`/`#0A1937`,
periwinkle `#8097BE`, slate `#717E9B`, white; Poppins everywhere; all dots
motifs, gradient scrims, gold accents and shadows removed; flat navy photo
overlays; navy title slide with photo column.

## v1 — Initial deck
Commit `559c265` · 22 slides built from the pasted outline (source slides 11–20
were absent from the paste, so slides are numbered sequentially 01–22);
royalty-free stock photography; footer "PAN AFRICAN CHRISTIAN UNIVERSITY ·
MCP504" + slide number; typo fixes kept from the source text
(Psychotheraphy→Psychotherapy, Christiaan→Christian, S. Moman→S. Toman,
Dr Lucy→Dr. Lucy).
