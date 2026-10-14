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
DECK_NAME = "Gestalt-Theory-and-Its-Application-to-Counselling.pptx"


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
        '<figcaption>{i:02d}</figcaption></figure>'.format(i=i + 1, n=n)
        for i, n in enumerate(names))
    html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gestalt Theory and Its Application to Counselling</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background: #f4f8fb; color: #33506b;
    font-family: "Poppins", "Segoe UI", Verdana, sans-serif;
  }}
  header {{ padding: 40px 32px 8px; max-width: 1520px; margin: 0 auto; }}
  h1 {{
    font-family: "Raleway", "Segoe UI", Verdana, sans-serif; font-weight: 700;
    text-transform: uppercase; letter-spacing: .5px;
    font-size: 34px; line-height: 1.15; margin: 0 0 10px; color: #4595c2;
  }}
  header p {{ margin: 0; color: #5f7e97; font-size: 14px; line-height: 1.7; max-width: 900px; }}
  .bar {{ max-width: 1520px; margin: 18px auto 0; padding: 0 32px; }}
  a.download {{
    display: inline-block; background: #4595c2; color: #fff; text-decoration: none;
    padding: 12px 22px; border-radius: 4px; font-size: 14px; letter-spacing: .06em;
    text-transform: uppercase; font-weight: 600;
  }}
  a.download:hover {{ background: #006aad; }}
  a.download span {{ display: block; text-transform: none; letter-spacing: 0;
                     font-weight: 400; font-size: 12px; opacity: .85; }}
  .grid {{
    max-width: 1520px; margin: 0 auto; padding: 26px 32px 40px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 24px;
  }}
  .slide {{ margin: 0; position: relative; border-radius: 5px; overflow: hidden;
           background: #fff; box-shadow: 0 10px 26px rgba(69,149,194,.16);
           transition: transform .3s ease, box-shadow .3s ease; }}
  .slide img {{ display: block; width: 100%; height: auto; }}
  .slide:hover {{ transform: translateY(-3px); box-shadow: 0 18px 40px rgba(0,106,173,.25); }}
  figcaption {{ position: absolute; right: 12px; bottom: 10px; font-size: 11px;
                letter-spacing: .18em; color: #006aad; opacity: .65; }}
  .note {{ max-width: 1520px; margin: 0 auto; padding: 0 32px 60px; color: #5f7e97;
           font-size: 13px; line-height: 1.8; }}
  .note b {{ color: #4595c2; font-weight: 600; }}
</style>
</head>
<body>
<header>
  <h1>Gestalt Theory and Its Application to Counselling</h1>
  <p>Group 4 presentation, 22 slides. MCP504 Theories of Counseling and Psychotherapy,
  Pan African Christian University. Lecturer, Dr. Lucy Gachenia.</p>
</header>
<p class="bar">
  <a class="download" href="download" download>Download the PowerPoint
    <span>the editable file, with the entrance animations and the embedded fonts</span></a>
</p>
<div class="grid">
{cards}
</div>
<p class="note">
  <b>The theme is the new book template's.</b> Poppins and Raleway are embedded in the
  file itself, so the deck sets in that type anywhere. Light pages carry the template's
  white petals and striped disc; the cover and the conclusion take its blue. Every list
  line opens with the Word tick bullet, drawn as artwork so it never falls back to an
  emoji. The empty chairs and the two people talking in the background are a whisper of
  two counselling photographs, laid in at about a tenth of their strength.
  This page is a flattened preview; the PowerPoint file carries the animations.
</p>
</body>
</html>
""".format(cards=cards, deck=DECK_NAME)
    open(os.path.join(PREVIEW, "index.html"), "w").write(html)
    print("preview/index.html written")


if __name__ == "__main__":
    main()
