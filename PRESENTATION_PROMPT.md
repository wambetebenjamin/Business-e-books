# Master Presentation Prompt

Copy the block below as your prompt, then paste your content, the Canva link, and/or upload a .pptx to the repo.

```text
Build a finished, presentation-ready PowerPoint deck in this repo (Business-e-books), in ONE pass.
Do NOT ask me questions. I will paste the content, a Canva link, and/or upload a .pptx to the repo.

1. INPUTS
- Find my pasted content, the Canva link, and any .pptx/.pdf/.docx under presentations/<deck-slug>/source/ or repo root.
- Canva link: try to open it. If it isn't publicly viewable, do NOT stall — replicate its design language as
  best you can from what you can see, or use the uploaded PPTX as the design reference. Note the assumption in one line at the end.
- Extract: all text content in order, slide count/intent, brand colours, fonts, logo, imagery style.
- Use ALL my content. Never drop slides or summarise my text away. Fix only typos/grammar.

2. REPO STRUCTURE (create once, reuse for every future deck)
presentations/
  00-INDEX.md               <- table of every deck: slug, title, date, slide count, file paths
  <deck-slug>/
    source/                 <- pasted content .md, Canva export, uploaded PPTX
    assets/                 <- generated images, 3D renders, logo
    build.js                <- pptxgenjs generator
    output/<Deck Title>.pptx <- final deliverable
    output/<Deck Title>.pdf  <- exported copy for quick viewing
- Never overwrite or delete a previous deck folder.

3. DESIGN
- 16:9 widescreen. Build with pptxgenjs (Node).
- Match the Canva/brand look: same palette, fonts, spacing and layout rhythm. Extract exact hex codes
  and font names where possible; otherwise pick a close free pairing and keep it consistent.
- Every slide: full-bleed ultra-realistic background image or side-panel illustration, with a readable
  text zone (dark scrim/overlay or clean panel) so text always passes contrast.
- Ultra-realistic imagery wherever it fits: use image generation for photoreal backgrounds and photos
  relevant to each slide's content. 3D illustration style (glossy, isometric, soft shadows, clay/glass
  look) where it suits better — icons, hero objects, diagrams, section dividers.
- Text and font effects: bold display headings, tight tracking, subtle shadow/outline/gradient on hero
  titles, accent bars, pull-quotes, numbered chips, highlighted keywords. Keep body text clean and
  legible — no effects on paragraphs.
- Vary layouts: title slide, agenda, section dividers, image-left/text-right, full-bleed quote,
  stats/number slides, process/steps, comparison, timeline, closing/CTA with contacts.
- Slide footer: brand name + slide number. Use the Lynton logo and brand colours from company profile.pdf
  when the deck is for Lynton Events, unless the Canva reference says otherwise.

4. IMAGES
- Generate every image into presentations/<deck-slug>/assets/ and embed the raw files.
- Photoreal: no text, no watermarks, no logos, no distorted faces/hands. Correct aspect for the slot it fills.
- Never use random web images. Only use: my uploaded images, repo brand assets, or freshly generated ones.

5. VERIFY BEFORE SAYING DONE (mandatory)
a) node presentations/<deck-slug>/build.js runs with no errors and produces the .pptx.
b) Convert and inspect: libreoffice --headless --convert-to pdf, then pdftoppm -r 80, and look at every
   slide yourself: no clipped/overflowing text, no overlapping elements, no low-contrast text over images,
   correct order and numbering, no placeholder text.
c) Cross-check against my content/Canva reference: every slide present, nothing missing.
d) Fix and regenerate the SAME output path until all checks pass.

6. VIEW & DOWNLOAD (mandatory)
- Serve the output folder: python3 -m http.server 8080 --bind 0.0.0.0 --directory presentations/<deck-slug>/output
  Name the process "Presentation" and give me the exact URL (I can download the .pptx and open the .pdf there).
- Present the PDF copy to me in the file viewer so I can review slides instantly; the .pptx is the editable deliverable.

7. ITERATE
- On feedback, edit build.js, regenerate to the SAME paths, tell me to refresh. One canonical deck — no v2 files.
- Update presentations/00-INDEX.md, then commit and push to the current session branch (never another branch).
```
