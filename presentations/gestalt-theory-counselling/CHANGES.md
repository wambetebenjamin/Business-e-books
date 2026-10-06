# Changelog — Gestalt Theory and Its Application to Counselling

Deck: 22 slides · 16:9 · MCP504 Group 4 · Pan African Christian University
All versions live on branch `arena/11c8b4ea-business-e-books`; every version keeps
the same output path and the same 280 required content phrases (verified by
`check-content.py` on each release).

---

## v7 — Everything floats: no cards, tick bullets, premium numerals *(current)*
Commit `<this release>` · zero cards/chips/frames, ✓ markers, Playfair numerals

### No cards anywhere
- **Why:** the user asked to remove every card behind texts/titles and every
  image holder/placeholder — let all text float.
- All 38 content cards, every chip, every accent bar, hairline and separator
  is gone. Text sits directly on the photography; photos float free with no
  shadow and square corners (photo rounding removed from animate.js).
- The S8 figure/ground ring diagram remains as a line drawing (content, not a
  card). Everything else is pure floating typography.

### Tick bullets instead of dashes/points
- Every bullet list now uses the **✓ tick** marker (was an en-dash).
  Strengths (S17), applications (S16), influences (S3), case columns (S19),
  technique tables (S15) and all standard lists included.
- Where numbered lists remain, the numerals are **Playfair Display** serif
  figures (premium font numerals) — also the 01–09 technique grid (S13) and
  the "07" assumption (S5).

### Contrast safety on free text
- The two brightest backgrounds (fog ridgelines, storm shore) were
  highlight-capped (max ≈ 0.55 sRGB) after line-level QA sampling caught
  bright fog/horizon bands under text; night, forest and birds moods were
  already dark enough. All free text is white; periwinkle survives only as
  tick marks/accents on the darkest zones.

---

## v6 — Pure photo backgrounds, no rules, editorial fonts
Commit `<this release>` · the silhouette photos ARE the background; modern
magazine typography; free-flowing text

### Backgrounds — pure photography, no solid overlays
- **Why:** the v5 white/navy overlays read as solid colour backgrounds — the
  silhouettes were barely visible.
- Every overlay rect is gone. Each slide's background is now a single
  full-bleed silhouette photograph, chosen and tone-processed so free text
  keeps 3:1+ contrast (verified per text zone before building —
  `zone-report.py`).
- Five section-aligned moods: **starry night** (title + closing), **fog
  ridgelines** (Foundations S2–S5), **misty forest at sunrise** (Core
  Concepts S6–S11), **sunset birds** (Practice S12–S16), **storm shore**
  (Evaluation S17–S20).
- The deck is now a dark editorial system: luminous photography, white
  free-floating titles, glass content cards.

### No underlines, no rules
- The title underline rule and the footer hairline are removed on every
  slide. Statements lost their accent bars — they are now free italic serif
  lines that sit directly on the photography.

### Fonts — Playfair Display + Outfit + IBM Plex Mono
- **Why:** Office-default fonts didn't blend with the photography; the user
  asked for other modern fonts and styles.
- **Playfair Display** Bold (Title-Case titles, 52 pt hero, free italic
  statements/quotes) — editorial display serif that pairs with photography.
- **Outfit** (body, labels, chips, lists — bold for emphasis) — modern
  geometric sans.
- **IBM Plex Mono** (eyebrows, citations, footer, title-slide meta) —
  magazine-style "meta" voice in tracked mono.
- render.js validates with the real @fontsource metrics; arrow/check glyphs
  still fall back to DejaVu in QA exactly as PowerPoint substitutes them.

### Placement variety — not everything in a placeholder
- Titles, eyebrows, citations, footers, statements and quotes float directly
  on the photographs; content stays on cards. White cards are now 12 %
  translucent "glass" so the imagery shows through; navy cards stay solid.

---

## v5 — Human photography, silhouette backgrounds, Office fonts
Commit `<this release>` · people-centred imagery, ultrarealistic silhouette
backgrounds, Georgia + Calibri typography

### Human images where applicable
- **Why:** the deck should show people (counselling is about people) — placed
  consistently and aligned across sections.
- 16 of 22 card images are now **professional Unsplash people photos**:
  person on a summit (S1), two women talking in a café (S2), hands of two
  people talking over a table (S5), person meditating (S6), woman by a window
  (S7), two people in conversation (S9), pensive man at a barrier (S10),
  person walking a path (S11), psychologist with a patient (S12), counsellor
  with a therapy group in a circle (S16), support group celebrating (S17),
  students studying in a library (S19). No romantic/sensual imagery.
- **CORE CONCEPTS photo cards unified to identical geometry** — S6, S7, S10,
  S11 all `x8.5 y1.74 w4.16 h4.66` (S10's photo moved from left to the shared
  right slot, its cards to the left column; S11 cards narrowed to match);
  S9 photo `x8.5 y1.74 w4.16 h3.12` with the contact-boundary diagram card
  docked directly beneath it (`x8.5 y5.06 w4.16 h1.74`).
- Kept from v4 where objects still fit best: history books (S3), library
  theorists (S4), chairs (S13, S14), candle (S15), storm (S18), summit
  climber (S21 — already human), books (S22).

### Ultrarealistic silhouette backgrounds
- Every slide now sits on a **full-bleed photographic silhouette background**
  (1600×900 Unsplash): bright-sky figure silhouettes on light slides under a
  white 72 % overlay (shadow-lifted so silhouettes stay visible), a person
  under a starry night sky on dark slides (S1, S5, S12, S18, S21) under an
  80 % deep-navy overlay. Backgrounds are excluded from rounding and
  animation.
- Dark-slide background-level text (eyebrows, citations, footer, S21 flow
  arrows) moved to a lighter tone (`#C9D4EA` → `WHITE` where needed) to hold
  3:1+ contrast over the new backgrounds; periwinkle stays on solid navy
  cards only.

### Fonts — Georgia + Calibri (universal Office fonts)
- **Why:** Plus Jakarta Sans/Inter read as "AI-deck fonts"; Georgia and
  Calibri ship with every Office install.
- **Georgia Bold, Title Case** for all slide titles and the hero ("Gestalt /
  Theory", 46 pt); **Georgia Italic** for the two pull-quotes.
- **Calibri** everywhere else — Bold for eyebrows, labels, leads, chips,
  numbers and flows; Regular for body; Italic for citations. No semibold
  families remain (pure bold flag, so PowerPoint never substitutes).
- render.js now renders/validates with **Gelasio + Carlito** (the
  metric-compatible open clones of Georgia/Calibri).

---

## v4 — Modern redesign: cards, premium fonts, animations
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
