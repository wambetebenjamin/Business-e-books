# Master E-Book Prompt

Copy everything in the block below and paste it as your prompt. Add only the source file(s) for the new book.

```text
Build a finished, print-ready, branded e-book PDF in this repo (Lynton Events — "Business-e-books").
Do everything in ONE pass. Do NOT ask me questions. Work from the files you find, make reasonable
assumptions, and note them in one line at the end.

1. SOURCE MATERIAL
- Find the source content: .docx/.pdf/.txt/.md files in the repo root or in ebooks/<book-slug>/source/.
- Copy the originals into ebooks/<book-slug>/source/ and extract the full structure (headings, bullets,
  quotes, tables, checklists). Use pandoc / python-docx / unzip as needed.
- Use ALL source sections. Never drop, merge away, or summarise out real content.

2. REPO STRUCTURE (create once, reuse for every future e-book)
ebooks/
  00-INDEX.md            <- table of every e-book: slug, title, date, page count, PDF path
  lib/ebook-kit.js       <- shared theme + layout helpers (palette, header, footer, title, card,
                            quote, bullet, rule, addPage, PDF metadata)
  <book-slug>/
    source/              <- original source files
    assets/              <- logo/banner/photos actually used
    build.js             <- pdfkit generator for this book
    output/<Book Title>.pdf   <- the final deliverable
- First run: extract the brand system from generate-ebook.js into ebooks/lib/ebook-kit.js
  (navy #20263F, #151A2D, gold #D7AE48, #F0D078, cream #F7F2E8, ink, muted; A4 595.28x841.89,
  zero margins, Helvetica family, running header, footer page numbers, "WE MAKE IT HAPPEN").
  Every later book must require() that kit so all books look like one brand.
- Never overwrite, move, or delete a previous e-book folder.

3. BUILD
- A4, pdfkit, explicit coordinates, driven by ebooks/<book-slug>/build.js.
- Page flow: cover (title, subtitle, event date, venue, brand line) -> TOC with correct page numbers ->
  content chapters numbered to match the source -> practical exercise / pledge or action page ->
  back cover with logo + contact block (phone, email, website, socials) pulled from company profile.pdf.
- Alternate dark/light section pages as in generate-ebook.js. Keep one visual language throughout.
- Images: only from image-search/, lynton*.jpg, or company profile.pdf. Never use random external images.
- Set PDF metadata (Title, Author, Subject, Keywords). File name = the book title in Title Case.

4. VERIFY BEFORE SAYING DONE (mandatory)
a) node ebooks/<book-slug>/build.js runs with no errors.
b) Render every page to PNG (pdftoppm -r 80) and inspect each page yourself: no clipped or overflowing
   text, no overlapping elements, no blank stray pages, correct headings and page numbers.
c) Cross-check the source: every section is present, no lorem/placeholder text, cover details correct.
d) Fix and regenerate the same output path until all checks pass.

5. VIEW & DOWNLOAD (mandatory)
- Serve the output folder so I can view and download the PDF in the browser:
  python3 -m http.server 8080 --bind 0.0.0.0 --directory ebooks/<book-slug>/output
  Name the process "E-Book PDF" and give me the exact URL.
- Also present the PDF file to me directly in the file viewer.

6. ITERATE
- When I give feedback, edit build.js (or ebooks/lib/ebook-kit.js for global changes), regenerate to the
  SAME output path, and tell me to refresh. Never create "final_v2" files — one canonical PDF per book.
- Update ebooks/00-INDEX.md, then commit and push to the current session branch (never another branch).
```
