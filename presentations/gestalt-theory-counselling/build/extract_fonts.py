"""
extract_fonts.py
The new book template embeds its own typefaces in ppt/fonts/*.fntdata. Each
part is a plain TrueType file behind a short PowerPoint header, so the real
faces can be lifted out and used both for measuring/laying out the deck and for
re-embedding into our rebuilt file.

Run from build/:
  python extract_fonts.py            reads ../new gestalt presentation template.pptx
  python extract_fonts.py <file>     reads any template that embeds the fonts
"""

import io
import os
import subprocess
import sys
import tempfile
import zipfile

from PIL import ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(HERE, "fonts")
EMBED = os.path.join(HERE, "embed")     # the untouched parts, for re-embedding
DEFAULT = os.path.join(REPO, "new gestalt presentation template.pptx")

# face name of the embedded font -> file we write
WANTED = {
    ("Raleway", "Bold"): "Raleway-Bold.ttf",
    ("Raleway", "Regular"): "Raleway-Regular.ttf",
    ("Poppins", "Bold"): "Poppins-Bold.ttf",
    ("Poppins", "Regular"): "Poppins-Regular.ttf",
}


def ttf_from_fntdata(blob):
    """A .fntdata part is a TrueType file preceded by a short header."""
    i = blob.find(b"\x00\x01\x00\x00", 32)
    while i != -1:
        try:
            f = ImageFont.truetype(io.BytesIO(blob[i:]), 40)
            if f.getname()[0]:
                return blob[i:], f.getname()
        except Exception:
            pass
        i = blob.find(b"\x00\x01\x00\x00", i + 1)
    return None, None


def from_git(ref="origin/main", path="new gestalt presentation template.pptx"):
    """The template lives on main only, so pull it out of git when it is absent."""
    tmp = os.path.join(tempfile.gettempdir(), "gestalt-template.pptx")
    with open(tmp, "wb") as fh:
        subprocess.run(["git", "-C", REPO, "show", "%s:%s" % (ref, path)], stdout=fh, check=True)
    return tmp


def main(src=None):
    src = src or DEFAULT
    if not os.path.exists(src):
        src = from_git()
    os.makedirs(OUT, exist_ok=True)
    found = {}
    with zipfile.ZipFile(src) as z:
        names = [n for n in z.namelist() if n.startswith("ppt/fonts/")]
        for n in sorted(names):
            data, name = ttf_from_fntdata(z.read(n))
            if data is None:
                print("  could not read", n)
                continue
            target = WANTED.get(name)
            print("  %-26s -> %-22s %-24s %d bytes" % (n, name, target or "(skipped)", len(data)))
            if target:
                open(os.path.join(OUT, target), "wb").write(data)
                found[name] = target
            # keep the raw part so it can be embedded into our own file
            os.makedirs(EMBED, exist_ok=True)
            open(os.path.join(EMBED, os.path.basename(n)), "wb").write(z.read(n))
    missing = set(WANTED) - set(found)
    if missing:
        print("missing:", ", ".join("%s %s" % m for m in sorted(missing)))
    print("fonts written to", OUT)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
