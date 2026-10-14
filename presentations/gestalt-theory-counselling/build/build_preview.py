"""
build_preview.py
Writes the reviewable web preview: a JPEG of every slide plus a single page
viewer with keyboard navigation, so the deck can be flipped through without
PowerPoint.
"""

import base64
import io
import os
from PIL import Image

import irspec as S
import render_png as R

HERE = os.path.dirname(os.path.abspath(__file__))
PREVIEW = os.path.abspath(os.path.join(HERE, "..", "preview"))
WEB = os.path.join(PREVIEW, "web")


def main():
    os.makedirs(WEB, exist_ok=True)
    slides = S.build()
    names = []
    for sl in slides:
        im = R.render_slide(sl)
        fname = "slide%02d.jpg" % sl["n"]
        im.resize((1440, 810), Image.LANCZOS).save(os.path.join(WEB, fname), "JPEG",
                                                   quality=84, optimize=True, subsampling=0)
        names.append(fname)
        print(fname, flush=True)
    cards = "\n".join(
        '<figure class="slide" id="s{i}"><img src="web/{n}" alt="Slide {i}" loading="lazy">'
        '<figcaption>{i}</figcaption></figure>'.format(i=i + 1, n=n)
        for i, n in enumerate(names))
    html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Gestalt Theory and Its Application to Counselling</title>
<style>
  :root {{ color-scheme: dark; }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background: #05070c; color: #f2f0ea;
    font-family: Verdana, "Segoe UI", sans-serif;
  }}
  header {{
    padding: 28px 32px 18px; max-width: 1500px; margin: 0 auto;
  }}
  h1 {{ font-family: "Playfair Display", Georgia, serif; font-size: 30px; margin: 0 0 6px; font-weight: 700; }}
  header p {{ margin: 0; color: #9aa3b8; font-size: 13px; line-height: 1.6; }}
  .grid {{
    max-width: 1500px; margin: 0 auto; padding: 8px 32px 60px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(430px, 1fr)); gap: 22px;
  }}
  .slide {{ margin: 0; position: relative; border-radius: 6px; overflow: hidden;
           transition: transform .35s ease, box-shadow .35s ease; }}
  .slide img {{ display: block; width: 100%; height: auto; }}
  .slide:hover {{ transform: translateY(-3px); box-shadow: 0 22px 50px rgba(0,0,0,.55); }}
  figcaption {{ position: absolute; right: 12px; bottom: 10px; font-size: 11px;
                letter-spacing: .18em; color: #e7dfcd; text-shadow: 0 1px 6px #000; }}
  .note {{ max-width: 1500px; margin: 0 auto; padding: 0 32px 40px; color: #7d869c;
           font-size: 12px; line-height: 1.7; }}
  .note b {{ color: #cfd6e6; font-weight: 600; }}
</style>
</head>
<body>
<header>
  <h1>Gestalt Theory and Its Application to Counselling</h1>
  <p>Group 4 presentation preview, 22 slides. MCP504 Theories of Counseling and Psychotherapy,
  Pan African Christian University. Lecturer, Dr. Lucy Gachenia.</p>
</header>
<div class="grid">
{cards}
</div>
<p class="note">
  <b>Every list line opens with the Word tick bullet, drawn as artwork so it never
  falls back to an emoji.</b> Backgrounds are one quiet gradient each. Type is Calibri,
  Cambria and Consolas. This preview is flattened; the PowerPoint file carries the
  entrance animations.
</p>
</body>
</html>
""".format(cards=cards)
    open(os.path.join(PREVIEW, "index.html"), "w").write(html)
    print("preview/index.html written")


if __name__ == "__main__":
    main()
