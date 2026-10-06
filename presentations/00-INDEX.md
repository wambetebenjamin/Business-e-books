# Presentations Index

One row per deck. Never overwrite or delete a previous deck folder — add new rows.

| # | Slug | Title | Client / Course | Date | Slides | Deliverables |
|---|------|-------|-----------------|------|--------|--------------|
| 1 | `gestalt-theory-counselling` | Gestalt Theory and Its Application to Counselling | MCP504 · Group 4 · Pan African Christian University | 2026-10-05 | 22 | [PPTX](gestalt-theory-counselling/output/Gestalt%20Theory%20and%20Its%20Application%20to%20Counselling.pptx) · [PDF](gestalt-theory-counselling/output/Gestalt%20Theory%20and%20Its%20Application%20to%20Counselling.pdf) |

## Deck details

### 1 · Gestalt Theory and Its Application to Counselling
- **Folder:** `presentations/gestalt-theory-counselling/`
- **Source:** user-pasted outline in `source/content.md`; design reference is the repository's uploaded `company profile.pdf` (flat corporate navy presentation).
- **Design system (v4):** navy `#162B57`/`#0A1937` · periwinkle `#8097BE` · slate `#717E9B` · white on soft `#F3F5FA` page; **Plus Jakarta Sans** (Bold titles / SemiBold subheads) + **Inter** (body, 1.3 line height); asymmetric grids of floating cards with soft shadows; all photos in rounded-corner cards with shadows; **native animations injected via OOXML** (Fade titles 0.35 s, sequential Wipe left-to-right blocks, Float-In images, Morph transitions on all slides).
- **Imagery:** royalty-free Unsplash photos only (neutral nature/objects — no stock people, no AI images), exact-aspect crops in `assets/p-*.jpg`.
- **Rebuild:** `cd presentations/gestalt-theory-counselling && npm install && node build.js && node animate.js` → `output/…​.pptx`
- **Verify:** `node render.js` (renders the real PPTX with genuine Plus Jakarta Sans/Inter metrics → PNG/PDF + overflow/contrast/overlap/numbering checks) and `python3 check-content.py` (280-phrase content completeness check). Latest run: **all checks passed** (`render-report.txt`).
- **Notes:** user's paste skipped source slides 11–20, so the deck contains the 22 provided slides numbered sequentially 01–22. Typos fixed: "Psychotheraphy"→"Psychotherapy", "Christiaan"→"Christian", "S. Moman"→"S. Toman", "Dr Lucy"→"Dr. Lucy". Install Plus Jakarta Sans + Inter from Google Fonts for perfect .pptx fidelity.
