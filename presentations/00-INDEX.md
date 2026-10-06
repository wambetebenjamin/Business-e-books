# Presentations Index

One row per deck. Never overwrite or delete a previous deck folder — add new rows.

| # | Slug | Title | Client / Course | Date | Slides | Deliverables |
|---|------|-------|-----------------|------|--------|--------------|
| 1 | `gestalt-theory-counselling` | Gestalt Theory and Its Application to Counselling | MCP504 · Group 4 · Pan African Christian University | 2026-10-05 | 22 | [PPTX](gestalt-theory-counselling/output/Gestalt%20Theory%20and%20Its%20Application%20to%20Counselling.pptx) · [PDF](gestalt-theory-counselling/output/Gestalt%20Theory%20and%20Its%20Application%20to%20Counselling.pdf) |

## Deck details

### 1 · Gestalt Theory and Its Application to Counselling
- **Folder:** `presentations/gestalt-theory-counselling/`
- **Source:** user-pasted outline in `source/content.md`; design reference is the repository's uploaded `company profile.pdf` (flat corporate navy presentation).
- **Design system (v3, follows the profile entirely):** deep navy `#162B57` · dark navy `#0A1937` · periwinkle `#8097BE` (accent on navy) · slate `#717E9B` · white · light-blue tints `#E8EDF6`/`#F0F3F9`; full **Poppins** hierarchy (Bold tracked titles / SemiBold subheads, chips, numbered rows / Regular body / Italic citations) with tracked eyebrow section tags on every slide; flat fills, hairlines, numbered lists, contrast panels, card grids — no dots/gradients/shine.
- **Imagery:** royalty-free stock photos only (Unsplash / Pexels), tone-matched, exact-aspect crops in `assets/`.
- **Rebuild:** `cd presentations/gestalt-theory-counselling && npm install && npm install @fontsource/poppins && node build.js` → `output/…​.pptx`
- **Verify:** `node render.js` (renders the real PPTX with genuine Poppins metrics → PNG/PDF + overflow/contrast/overlap/numbering checks) and `python3 check-content.py` (280-phrase content completeness check). Latest run: **all checks passed** (`render-report.txt`).
- **Notes:** user's paste skipped source slides 11–20, so the deck contains the 22 provided slides numbered sequentially 01–22. Typos fixed: "Psychotheraphy"→"Psychotherapy", "Christiaan"→"Christian", "S. Moman"→"S. Toman", "Dr Lucy"→"Dr. Lucy". Install Poppins from Google Fonts for perfect .pptx fidelity.
