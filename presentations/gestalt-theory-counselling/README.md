# Gestalt Theory and Its Application to Counselling

MCP504 · Theories of Counseling and Psychotherapy · Group 4 · Pan African Christian University
22-slide deck (16:9), built with pptxgenjs. Design language follows the user's Canva
reference (Wardiere-style minimalist): cream paper, deep forest green, brass gold,
Georgia display + Arial body, dots motif, hairline rules, gradient scrims over
royalty-free stock photography (Unsplash / Pexels only — no AI images).

## Layout
- `source/content.md` — the user's pasted content (verbatim)
- `assets/` — final tone-matched, aspect-cropped stock images + scrims/dots
- `build.js` — pptxgenjs generator → `output/Gestalt Theory and Its Application to Counselling.pptx`
- `render.js` — renders the actual PPTX (parses its OOXML) to PNG + PDF and runs
  deterministic QA: text overflow, text/background contrast (WCAG-style, sampled from
  the composited canvas), text-on-text overlap, footer numbering, placeholder scan
- `check-content.py` — asserts all 280 required content phrases are present
- `render-report.txt` — latest QA report
- `slides-manifest.json` — expected slide order (used by render.js)

## Rebuild & verify
```bash
npm install          # pptxgenjs, @napi-rs/canvas, adm-zip, pdfkit, dejavu-fonts-ttf
node build.js        # writes output/<Deck Title>.pptx
node render.js       # writes output/<Deck Title>.pdf + render/*.png + QA report (exits 1 on issues)
python3 check-content.py
```

Fonts in the .pptx are Georgia/Arial (available everywhere PowerPoint runs).
The renderer substitutes metric-wider DejaVu faces, so anything that passes
QA in the render is guaranteed to fit in PowerPoint.

Note: the user's pasted outline skipped slides 11–20; the deck contains the
22 provided slides, numbered sequentially 01–22 in the footer.
