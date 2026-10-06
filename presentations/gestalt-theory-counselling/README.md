# Gestalt Theory and Its Application to Counselling

MCP504 · Theories of Counseling and Psychotherapy · Group 4 · Pan African Christian University
22-slide deck (16:9), built with pptxgenjs. Design language follows the repository's
uploaded presentation reference (`company profile.pdf`) entirely: flat corporate
navy/white/soft-blue, **Poppins** (Bold headlines / Regular body) typography,
no ornaments — no dots, no gradients, no shine. Photography is royalty-free
stock (Unsplash / Pexels only — no AI images).

## Theme (extracted from `company profile.pdf`)
- **Colours** — deep navy `#162B57` (primary) · dark navy `#0A1937` (dark slides/overlays)
  · periwinkle `#8097BE` (accent, on navy only) · slate `#717E9B` · white
  · light blue tints `#E8EDF6` / `#F0F3F9` for chips and zebra rows
- **Typography** — full Poppins hierarchy: **Bold** 25pt uppercase tracked titles,
  **SemiBold** subheads / chips / lead statements / numbered rows, **Regular** body,
  **Italic** citations and quotes; tracked eyebrow section tags
  (OVERVIEW → FOUNDATIONS → CORE CONCEPTS → PRACTICE → EVALUATION → CLOSING) above
  every title; 44pt stacked hero on the title slide
- **Structure** — every content slide: eyebrow → title → accent rule → content grid
  at a consistent baseline; numbered assumption/role lists, labelled contrast panels
  (focus/past, contributions/considerations), card grids, a contact-boundary diagram
  and a zebra technique table
- **Look** — flat fills, thin hairlines, white-on-navy panels, square cards;
  photo slides use flat navy overlays (no gradient scrims)

## Layout
- `source/content.md` — the user's pasted content (verbatim)
- `assets/` — final tone-matched, aspect-cropped stock images
- `build.js` — pptxgenjs generator → `output/Gestalt Theory and Its Application to Counselling.pptx`
- `render.js` — renders the actual PPTX (parses its OOXML) to PNG + PDF and runs
  deterministic QA: text overflow, text/background contrast (WCAG-style, sampled from
  the composited canvas), text-on-text overlap, footer numbering, placeholder scan
- `check-content.py` — asserts all 280 required content phrases are present
- `render-report.txt` — latest QA report
- `slides-manifest.json` — expected slide order (used by render.js)

## Rebuild & verify
```bash
npm install                        # pptxgenjs, @napi-rs/canvas, adm-zip, pdfkit, dejavu-fonts-ttf
npm install @fontsource/poppins    # real Poppins woff2 used by the QA renderer
node build.js                      # writes output/<Deck Title>.pptx
node render.js                     # writes output/<Deck Title>.pdf + render/*.png + QA report (exits 1 on issues)
python3 check-content.py
```

Fonts in the .pptx are set to **Poppins** — a free Google font, not a system
default. If Poppins is not installed, PowerPoint substitutes a default sans
(layout still holds; QA was run with the real Poppins metrics via
`@fontsource/poppins`). For perfect fidelity install Poppins once from
<https://fonts.google.com/specimen/Poppins>. Glyphs Poppins lacks (→ ↓ ↔ ≠ ✓ ✗)
are auto-substituted by PowerPoint, exactly as the QA renderer does with DejaVu.

Note: the user's pasted outline skipped slides 11–20; the deck contains the
22 provided slides, numbered sequentially 01–22 in the footer.
