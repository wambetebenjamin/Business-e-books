#!/usr/bin/env python3
"""Content-completeness gate for 'The Secret Place' e-book.
Verifies (1) every required sermon phrase is present in the rendered text
dump, (2) the PDF has exactly 11 pages, (3) the PDF exists and is non-trivial.
Exit code 0 = pass."""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
DUMP = ROOT / "output" / "content-dump.txt"
PDF = ROOT / "output" / "The Secret Place - Three Levels of the Will of God.pdf"

REQUIRED = [
    # identity
    "presbyter jeremiah mugala", "chrisco central church", "nairobi",
    "spiritual emphasis month",
    # secret place
    "secret place of the most high", "get closer", "balance",
    "victory in a great way",
    # structure
    "three levels", "will of god",
    # level 1
    "outer court", "still in the will of god", "perfect will of god",
    "exploits", "no covering", "fence", "unnecessary noise", "public place",
    # level 2
    "holy place", "curtain", "complete darkness", "three items",
    "candlestick", "holy spirit", "shewbread", "unleavened bread",
    "twelve loaves", "priests were to eat", "word of god",
    "letter killeth", "spirit giveth life", "no other light",
    # level 3
    "holy of holies", "altar of incense", "most expensive perfumes",
    "deep worship and intercession", "covered by the smoke",
    "exchange your weakness for strength", "where the lord is",
    "queen esther", "mentioning what she wanted", "place of redefinition",
    "solomon", "wisdom", "daughter of herodias", "john the baptist's head",
    "royal decree",
    # keys & promises
    "glorify god", "fervent prayer", "experience god",
    "isaiah 65:24", "before they call", "i will answer",
    "while they are yet speaking", "jeremiah 33:3", "call unto me",
    "great and mighty things",
]

def norm(s: str) -> str:
    s = s.lower()
    s = s.replace("\u2019", "'").replace("\u2018", "'")   # ’ ‘ -> '
    s = s.replace("\u2014", " ").replace("\u2013", " ")   # em/en dash
    s = s.replace("\u00b7", " ").replace('"', " ")        # ·, dquote
    s = re.sub(r"[^a-z0-9:.']+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def main() -> int:
    errors = []
    if not DUMP.exists():
        print("FAIL: content-dump.txt missing — run build.js first"); return 1
    text = norm(DUMP.read_text(encoding="utf-8"))
    missing = [p for p in REQUIRED if norm(p) not in text]
    for p in missing:
        errors.append(f"missing phrase: {p!r}")
    for bad in ("chrico ", " chrico"):          # superseded spelling must be gone
        if bad in f" {text} ":
            errors.append("stale spelling present: CHRICO (should be CHRISCO)")
    if not PDF.exists():
        errors.append(f"PDF missing: {PDF.name}")
    else:
        data = PDF.read_bytes()
        pages = data.count(b"/Type /Page") - data.count(b"/Type /Pages")
        if pages != 11:
            errors.append(f"page count {pages} != 11")
        if len(data) < 400_000:
            errors.append(f"PDF suspiciously small: {len(data)} bytes")
    if errors:
        print("CONTENT GATE: FAIL")
        [print(f"  - {e}") for e in errors]
        return 1
    print(f"CONTENT GATE: PASS — {len(REQUIRED)}/{len(REQUIRED)} phrases, 11 pages, "
          f"{PDF.stat().st_size/1e6:.2f} MB")
    return 0

if __name__ == "__main__":
    sys.exit(main())
