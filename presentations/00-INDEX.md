# Presentations Index

One row per deck. Never overwrite or delete a previous deck folder — add new rows.

| # | Slug | Title | Client / Course | Date | Slides | Deliverables |
|---|------|-------|-----------------|------|--------|--------------|
| 1 | `gestalt-theory-counselling` | Gestalt Theory and Its Application to Counselling | MCP504 · Group 4 · Pan African Christian University | 2026-10-05 | 22 | [PPTX](gestalt-theory-counselling/output/Gestalt%20Theory%20and%20Its%20Application%20to%20Counselling.pptx) · [PDF](gestalt-theory-counselling/output/Gestalt%20Theory%20and%20Its%20Application%20to%20Counselling.pdf) |

## Deck details

### 1 · Gestalt Theory and Its Application to Counselling
- **Folder:** `presentations/gestalt-theory-counselling/`
- **Source:** user-pasted outline in `source/content.md`; Canva reference link (Wardiere-style minimalist template — white/cream, serif display, dots motif).
- **Design system:** cream `#F5F1E8` · deep forest green `#173226`/`#26513E` · brass gold `#B08D3C`/`#8F7028` · terracotta `#A6512E`; Georgia headings + Arial body (universal PowerPoint fonts); dots motif + hairlines + gradient scrims.
- **Imagery:** royalty-free stock photos only (Unsplash / Pexels), tone-matched, exact-aspect crops in `assets/`.
- **Rebuild:** `cd presentations/gestalt-theory-counselling && npm install && node build.js` → `output/…​.pptx`
- **Verify:** `node render.js` (renders the real PPTX → PNG/PDF + overflow/contrast/overlap/numbering checks) and `python3 check-content.py` (280-phrase content completeness check). Latest run: **all checks passed** (`render-report.txt`).
- **Notes:** user's paste skipped source slides 11–20, so the deck contains the 22 provided slides numbered sequentially 01–22. Typos fixed: "Psychotheraphy"→"Psychotherapy", "Christiaan"→"Christian", "S. Moman"→"S. Toman", "Dr Lucy"→"Dr. Lucy".
