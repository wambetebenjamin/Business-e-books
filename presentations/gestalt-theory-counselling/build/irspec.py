"""
irspec.py
The design itself. Every slide is described as a flat list of drawing
instructions at a virtual 1600 x 900 stage. Two renderers consume this:
one that writes a real .pptx (with entrance animations) and one that paints
PNG layers for review.

House rules encoded here:
  * no cards, no boxes, no panel fills, no rules and no underlines
  * no bullet points and no dashes of any kind
  * every list item is introduced by the tick mark Word itself uses for its
    tick bullet, drawn as an image so it looks identical everywhere
  * type is the new book template's own set: Poppins for running text and
    labels, Raleway for headings and figures, both embedded in the template and
    both re-embedded into our file.

Layout is measured, never guessed: helpers below wrap text with the same
metrics the renderers use, so nothing can collide.
"""

import os

I, PT = 0, 1
STAGE_W, STAGE_H = 1600.0, 900.0
PT_PER_PX = 13.3333 * 72.0 / STAGE_W          # 0.6 : points per stage pixel
LH = 1.25                                      # line box, as a multiple of the em
WIDTH_SAFETY = 1.02   # the preview face runs a shade wider than Word's

FONTS = {"sans": "Poppins", "display": "Raleway", "mono": "Poppins"}

# One global type scale. The stage is 1600 x 900 px mapped onto a 13.33 x 7.5 inch
# slide, so one stage pixel is 0.6 pt. Headings keep the generous round two scale;
# Poppins sets about a quarter wider than the Calibri it replaces and stands
# taller on the line, so running text is set smaller and still reads larger.
SCALE_TYPE = 1.62                       # Raleway, headings and figures
BODY_SCALE = 0.86                       # Poppins, running text and labels
SCALE_BY_FONT = {"sans": SCALE_TYPE * BODY_SCALE, "display": SCALE_TYPE,
                 "mono": SCALE_TYPE * BODY_SCALE}
MARK_SCALE = 1.30      # ticks and their gaps grow more slowly than the type

MARGIN = 104.0
MIN_PT = 10.5           # nothing in the deck sets smaller than this

# the band the body of a page lives in: it opens just under the lead line and
# aims at the foot of the page, the way the template sets its own pages
BODY_TOP = 300.0
BODY_FOOT = 792.0

# ---------------------------------------------------------------------------
# element constructors
# ---------------------------------------------------------------------------


def bg(src):
    return dict(k="bg", src=src)


def img(src, x, y, w, h=None, alpha=1.0, anim="fade", delay=0.0, name=None):
    return dict(k="img", src=src, x=x, y=y, w=w, h=h, alpha=alpha, anim=anim, delay=delay,
                name=name)


def chev(x, y, w=54, key="accent", alpha=0.9, anim="fade", delay=0.0, down=False):
    return dict(k="chev", x=x, y=y, w=w, key=key, alpha=alpha, anim=anim, delay=delay, down=down)


def glow(x, y, w, h, color="accent", alpha=0.5, anim="none", delay=0.4):
    return dict(k="glow", x=x, y=y, w=w, h=h, color=color, alpha=alpha, anim=anim, delay=delay)


def line(x1, y1, x2, y2, color="#FFFFFF", width=1.2, alpha=0.35, anim="fade", delay=0.0):
    return dict(k="line", x1=x1, y1=y1, x2=x2, y2=y2, color=color, width=width, alpha=alpha,
                anim=anim, delay=delay)


def run(s, size=15, color="text", font="sans", bold=False, italic=False, spacing=0.0,
        alpha=1.0):
    # the template carries regular and bold only, so emphasis comes from colour
    # and weight rather than from a synthesised slant
    px = size * SCALE_BY_FONT.get(font, SCALE_TYPE)
    # captions and tags stay legible: nothing sets below the floor
    return dict(s=s, size=max(px, MIN_PT / PT_PER_PX), color=color, font=font,
                bold=bold, italic=False, spacing=spacing * MARK_SCALE, alpha=alpha)


def scaled(size, font="sans"):
    """A size exactly as run() will set it, for laying out ticks and boxes."""
    return size * SCALE_BY_FONT.get(font, SCALE_TYPE)


def P(*runs, align=None, space_before=0, line=None):
    return dict(runs=list(runs), align=align, space_before=space_before, line=line)


def t(x, y, w, paras, align="l", anchor="t", anim="fade", delay=0.0, name=None, line=None):
    paras_n = []
    for p in paras:
        if isinstance(p, str):
            p = dict(runs=[dict(s=p)])
        paras_n.append(p)
    return dict(k="text", x=x, y=y, w=w, paras=paras_n, align=align, anchor=anchor,
                anim=anim, delay=delay, name=name, line=line)


def tick(x, y, size=26, color="gold", anim="pop", delay=0.0, name=None, kind="tick"):
    size = size * MARK_SCALE
    return dict(k=kind, x=x, y=y, w=size, h=size, color=color, anim=anim, delay=delay, name=name)


# ---------------------------------------------------------------------------
# measurement
# ---------------------------------------------------------------------------

_FONTS = None


def _fonts():
    global _FONTS
    if _FONTS is None:
        from PIL import ImageFont
        office = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
        _FONTS = {
            # The template's own faces, lifted out of the template and used both
            # to measure every line here and to embed in the finished file, so
            # PowerPoint sets the deck in exactly the type we measure.
            ("sans", False): ImageFont.truetype(os.path.join(office, "Poppins-Regular.ttf"), 100),
            ("sans", True): ImageFont.truetype(os.path.join(office, "Poppins-Bold.ttf"), 100),
            ("display", False): ImageFont.truetype(os.path.join(office, "Raleway-Regular.ttf"), 100),
            ("display", True): ImageFont.truetype(os.path.join(office, "Raleway-Bold.ttf"), 100),
            ("mono", False): ImageFont.truetype(os.path.join(office, "Poppins-Regular.ttf"), 100),
            ("mono", True): ImageFont.truetype(os.path.join(office, "Poppins-Bold.ttf"), 100),
        }
    return _FONTS


def text_width(s, size, font="sans", bold=False, spacing=0.0):
    f = _fonts()[(font, bold)]
    w = f.getlength(s) / 100.0 * size * WIDTH_SAFETY
    if spacing:
        w += spacing * max(0, len(s) - 1)
    return w


def wrap_count(runs, w_px, safety=True):
    """How many lines a paragraph takes inside w_px (matches the renderers)."""
    words = []
    for r in runs:
        for wd in r["s"].split():
            words.append(wd)
    if not words:
        return 1
    size = max(r["size"] for r in runs)
    font = runs[0]["font"]
    bold = any(r["bold"] for r in runs)
    f = _fonts()[(font, bold)]
    space = text_width(" ", size, font, bold)
    n, cur = 1, 0.0
    for wd in words:
        wwd = text_width(wd, size, font, bold, runs[0].get("spacing", 0.0))
        if cur and cur + wwd > w_px:
            n += 1
            cur = wwd + space
        else:
            cur += wwd + space
    return n


def block_height(paras, w_px, default_line=None):
    total = 0.0
    for p in paras:
        size = max(r["size"] for r in p["runs"])
        lf = p.get("line") or default_line or 1.32
        total += p.get("space_before", 0) + wrap_count(p["runs"], w_px) * lf * LH * size
    return total


def line_height(size, lf):
    return lf * LH * size


# ---------------------------------------------------------------------------
# composable blocks : every one returns (elements, height)
# ---------------------------------------------------------------------------


def block_text(x, y, w, paras, align="l", anim="fade", delay=0.0, name=None, line=None):
    return [t(x, y, w, paras, align=align, anim=anim, delay=delay, name=name, line=line)], \
        block_height(paras, w, line)


def block_label(x, y, s, color="accent", size=12, delay=0.0, align="l", w=760):
    return [t(x, y, w, [P(run(s, size=size, color=color, font="mono", bold=True, spacing=2.6))],
              align=align, anim="fade", delay=delay)], line_height(size, 1.4)


def item(x, y, w, s, size=15.5, color="text", tick_color="gold", tick_size=25, gap=34,
         bold=False, font="sans", italic=False, anim="fade", delay=0.0, tally=None):
    """One 3D tick plus its line of text. Returns (elements, item height)."""
    gap = gap * SCALE_TYPE
    paras = [P(run(s, size=size, color=color, bold=bold, font=font, italic=italic), line=1.34)]
    h = block_height(paras, max(60.0, w - gap - 4), 1.34)
    # the tick sits on the first line, optically centred with it
    els = [
        tick(x, y + (line_height(scaled(size, font), 1.34) - tick_size) * 0.5 - 1,
             size=tick_size, color=tick_color, anim="pop", delay=delay),
        t(x + gap, y, w - gap, paras, anim=anim, delay=delay + 0.07),
    ]
    return els, h


def bullet_list(x, y, w, items, size=15.5, color="text", tick_color="gold", tick_size=25,
                gap=34, item_gap=18, anim_delay=0.0, palette=None, font="sans", bold=False,
                fill_to=None, ys=None):
    """A vertical list where every line carries its own tick.

    fill_to, when given, is a y position near the foot of the slide. The list
    opens its gaps evenly so it reaches that line, which keeps short lists from
    stranded at the top of an otherwise empty slide.
    """
    item_gap = item_gap * SCALE_TYPE
    heights = []
    for s_ in items:
        _, h = item(x, 0, w, s_, size=size, color=color, tick_color=tick_color,
                    tick_size=tick_size, gap=gap, delay=0.0, font=font, bold=bold)
        heights.append(h)
    if fill_to is not None and len(items) > 1:
        room = fill_to - y - sum(heights)
        if room > 0:
            item_gap = max(item_gap, room / (len(items) - 1))
    # never let a gap open wider than a comfortable reading step
    item_gap = min(item_gap, 96 * SCALE_TYPE)
    els, yy = [], y
    for i, s_ in enumerate(items):
        # ys, when given, pins every line to the same baselines as its neighbour
        # column, which is how two lists of different lengths stay in step
        top = ys[i] if ys and i < len(ys) else yy
        e, h = item(x, top, w, s_, size=size, color=color, tick_color=tick_color,
                    tick_size=tick_size, gap=gap, delay=anim_delay + i * 0.10, font=font,
                    bold=bold)
        els += e
        yy = top + h + item_gap
    return els, yy - item_gap


def contrast_pair(x, y, w, quote, caption, tick_size=30, mark="tick", color="text",
                  tick_color="gold", delay=0.0, size=18):
    """A 3D mark, a quoted line and its small caption, stacked by measurement."""
    qp = [P(run(quote, size=size, color=color, font="display", italic=True), line=1.30)]
    qh = block_height(qp, w, 1.30)
    els = [
        tick(x, y + 4, size=tick_size, color=tick_color, anim="pop", delay=delay, kind=mark),
        t(x + tick_size + 16, y, w, qp, anim="fade", delay=delay + 0.08),
        t(x + tick_size + 16, y + qh + 5, w, [P(run(caption, size=12, color="dim", font="mono"))],
          anim="fade", delay=delay + 0.16),
    ]
    return els, qh + 5 + line_height(12, 1.34)


def chain(x, y, labels, gapx=190, size=17, font="sans", bold=True, color="text",
          chev_w=52, key="accent", anim_delay=0.4):
    """A left to right flow of words joined by glowing chevrons.

    If the labels would wrap at the requested gap, the gap opens up so every
    word always sits on a single line.
    """
    ts = scaled(size, font)
    maxw = max(text_width(s, ts, font, bold, 1.0) for s in labels)
    gapx = max(gapx, maxw + chev_w + 34)
    room = STAGE_W - MARGIN - x
    if len(labels) > 1:
        gapx = min(gapx, (room - chev_w - 60) / (len(labels) - 1))
    els = []
    for i, s in enumerate(labels):
        els.append(t(x + i * gapx, y, gapx - 8, [P(run(s, size=size, color=color, font=font,
                                                       bold=bold, spacing=1.0))],
                     align="c", anim="fade", delay=anim_delay + i * 0.14))
        if i < len(labels) - 1:
            els.append(chev(x + i * gapx + gapx - 8 - chev_w * 0.5, y + size * 0.5, w=chev_w,
                            key=key, alpha=0.9, delay=anim_delay + i * 0.14 + 0.07))
    return els


# ---------------------------------------------------------------------------
# slide chrome
# ---------------------------------------------------------------------------

def title_size(title):
    """The largest size at which the heading still sets on a single line.

    The size is measured through the same scaling the runs get, so a heading
    the measurement clears really does set on one line in the finished slide.
    """
    for size in (58, 52, 46, 41):
        if text_width(title.upper(), scaled(size, "display"), "display", True) <= 1264:
            return size
    # the two or three longest headings take a second line rather than shrink
    # below the rest of the deck
    return 41


def _span(el):
    """The vertical extent of one element, measured the way the renderers do."""
    if el["k"] == "text":
        h = block_height(el["paras"], el["w"], el.get("line"))
    else:
        h = el.get("h") or el.get("w", 0) * 0.85
    return el["y"], el["y"] + h


def settle(s, top=BODY_TOP, foot=BODY_FOOT, min_free=54.0, max_gap=104.0, share=0.42):
    """Balance one page.

    The body of a page is read as a stack of rows. Whatever room is left under
    the last row is handed to the gaps between the rows, so a short page opens
    out instead of hanging at the top, and only what is left after that becomes
    white space above and below the block. The heading, the folio and the
    citation never move.
    """
    fixed = ("head", "folio", "cite")
    rows = []
    for el in s["els"]:
        if el["k"] not in ("text", "tick", "cross", "img", "chev"):
            continue
        if el.get("name") in fixed:
            continue
        y0, y1 = _span(el)
        for r in rows:
            if y0 <= r[1] + 10 and y1 >= r[0] - 10:
                r[0], r[1] = min(r[0], y0), max(r[1], y1)
                r[2].append(el)
                break
        else:
            rows.append([y0, y1, [el]])
    if not rows:
        return s
    for _ in range(len(rows)):          # a row may have bridged two earlier rows
        merged = []
        for r in sorted(rows, key=lambda row: row[0]):
            if merged and r[0] <= merged[-1][1] + 10:
                merged[-1][1] = max(merged[-1][1], r[1])
                merged[-1][2] += r[2]
            else:
                merged.append(r)
        if len(merged) == len(rows):
            break
        rows = merged
    rows.sort(key=lambda row: row[0])
    if not s.get("stretch", True):      # this page keeps its groups tight
        rows = [[rows[0][0], rows[-1][1], [el for r in rows for el in r[2]]]]
    free = (foot - top) - (rows[-1][1] - rows[0][0])
    if free < min_free:
        return s
    gaps = len(rows) - 1
    step = min(max_gap, free * 0.86 / gaps) if gaps else 0.0
    pad = (free - step * gaps) * share
    offsets = [pad + i * step + (top - rows[0][0]) for i in range(len(rows))]
    for i, r in enumerate(rows):
        for el in r[2]:
            el["y"] = el["y"] + offsets[i]
    for el in s["els"]:                 # soft shapes travel with the nearest row
        if el["k"] != "glow":
            continue
        i = min(range(len(rows)), key=lambda j: abs(rows[j][0] - el["y"]))
        el["y"] = el["y"] + offsets[i]
    return s


def chrome(section, title, folio, lead=None, lead_w=1180, lead_size=17.5):
    """The template's header: a numbered section line, a large caps heading in the
    template blue, an optional lead line, the institution tag and a folio."""
    tsize = title_size(title)
    els = [
        t(MARGIN, 44, 1000, [P(run("%02d" % folio, size=15, color="accent", font="display",
                                   bold=True),
                                run("     " + section.upper(), size=11, color="muted",
                                    font="mono", bold=True, spacing=2.6))],
          anim="fade", delay=0.05, name="head"),
    ]
    title_paras = [P(run(title.upper(), size=tsize, color="heading", font="display", bold=True),
                     line=1.14)]
    th = block_height(title_paras, 1270, 1.14)
    els.append(t(MARGIN, 74, 1270, title_paras, anim="rise", delay=0.18, name="head"))
    y = 74 + th
    if lead:
        lead_paras = [P(run(lead, size=lead_size, color="muted", font="sans"), line=1.30)]
        els.append(t(MARGIN, y + 16, lead_w, lead_paras, anim="fade", delay=0.34,
                      name="head"))
        y += 16 + block_height(lead_paras, lead_w, 1.30)
    # every page opens its body on the same line, the way the template does, so
    # a short heading leaves a little more air instead of shifting the page up
    y = max(y + 30, BODY_TOP)
    els += [
        t(STAGE_W - MARGIN - 380, 44, 380,
          [P(run("PAN AFRICAN CHRISTIAN UNIVERSITY", size=10, color="dim", font="mono",
                 bold=True, spacing=1.4), align="r")], anim="fade", delay=0.1, name="head"),
        t(STAGE_W - MARGIN - 300, STAGE_H - 62, 300,
          [P(run("%02d" % folio, size=12, color="dim", font="mono", bold=True, spacing=2.0),
             align="r")], anim="fade", delay=0.1, name="folio"),
    ]
    return els, y


def citation(s, delay=0.7):
    return t(MARGIN, STAGE_H - 56, 1100, [P(run(s, size=11.5, color="dim", font="mono",
                                                spacing=0.2))], anim="fade", delay=delay,
             name="cite")


# ---------------------------------------------------------------------------
# slides
# ---------------------------------------------------------------------------

BG = {n: "bg%02d.jpg" % n for n in range(1, 23)}
# light pages and the two blue ones, exactly the template's own light and blue
PALETTE = {1: "blue", 2: "light", 3: "light", 4: "light", 5: "light", 6: "light", 7: "light",
           8: "light", 9: "light", 10: "light", 11: "light", 12: "light", 13: "light",
           14: "light", 15: "light", 16: "light", 17: "light", 18: "light", 19: "light",
           20: "light", 21: "blue", 22: "light"}
TICK_BY_PALETTE = {"light": "deep", "blue": "light"}


def slide(n):
    return dict(n=n, palette=PALETTE[n], bg=BG[n], els=[], cite=None)


def build():
    S = []

    # ===================================================================== 01 cover
    s = slide(1)
    tk = TICK_BY_PALETTE[s["palette"]]
    s["els"] += [glow(40, 70, 900, 700, color="accent", alpha=0.22)]
    y = 78.0
    e, h = block_text(MARGIN, y, 900,
                      [P(run("GROUP 4 PRESENTATION", size=12, color="accent", font="mono",
                             bold=True, spacing=3.6))], anim="fade", delay=0.1)
    s["els"] += e
    y += h + 12
    for word, d in (("GESTALT", 0.30), ("THEORY", 0.46)):
        e, h = block_text(MARGIN, y, 1120,
                          [P(run(word, size=68, color="heading", font="display", bold=True),
                             line=1.0)], anim="rise", delay=d)
        s["els"] += e
        y += h - 20
    y += 12
    e, h = block_text(MARGIN, y, 1020,
                      [P(run("AND ITS APPLICATION TO COUNSELLING", size=13, color="accent",
                             font="display", bold=True, spacing=3.0))], anim="fade", delay=0.62)
    s["els"] += e
    y += h + 30
    s["els"] += [
        tick(MARGIN, y, size=30, color=tk, anim="pop", delay=0.76),
        t(MARGIN + 50, y + 9, 500, [P(run("PRESENTED BY", size=10.5, color="dim", font="mono",
                                          bold=True, spacing=2.6))], anim="fade", delay=0.80),
    ]
    y += 32 + 12
    for i, (nm, reg) in enumerate([("Josephine Biwott", "MACP/35996/0/26"),
                                   ("Cynthia Cherono", "MACP/35785/4/26"),
                                   ("Yvonne Juliet Awuor", "MALD/36547/4/26")]):
        s["els"] += [
            tick(MARGIN, y + 5, size=25, color=tk, anim="pop", delay=0.94 + i * 0.14),
            t(MARGIN + 44, y, 430, [P(run(nm, size=16, color="text", bold=True))], anim="fade",
              delay=1.0 + i * 0.14),
            t(MARGIN + 458, y + 3, 300, [P(run(reg, size=11, color="muted", font="mono"))],
              anim="fade", delay=1.06 + i * 0.14),
        ]
        y += 38
    # the panel of course facts, stacked down the right side so nothing collides
    fy = 430.0
    for i, (lab, val) in enumerate([("COURSE", "MCP504 Theories of Counseling and Psychotherapy"),
                                    ("INSTITUTION", "Pan African Christian University"),
                                    ("LECTURER", "Dr. Lucy Gachenia")]):
        x = 1000.0
        e, h1 = block_text(x, fy, 460, [P(run(lab, size=10.5, color="accent", font="mono",
                                             bold=True, spacing=2.6))], anim="fade",
                           delay=1.5 + i * 0.12)
        s["els"] += e
        e, h2 = block_text(x, fy + h1 + 6, 460, [P(run(val, size=14, color="text"), line=1.30)],
                           anim="rise", delay=1.56 + i * 0.12)
        s["els"] += e
        fy += h1 + h2 + 30
    s["els"] += block_text(MARGIN, 818, 760, [P(run("AWARENESS    PRESENCE    CONTACT", size=10.5,
                                                    color="dim", font="mono", spacing=3.0))],
                           anim="fade", delay=2.0)[0]
    S.append(s)

    # ===================================================================== 02 introduction
    s = slide(2)
    els, y = chrome("Overview", "Introduction", 2,
                    lead="An experiential and humanistic approach to counselling.")
    s["els"] += els
    els, _ = bullet_list(MARGIN, y, 900,
                         ["Emphasizes awareness, present experience and contact",
                          "Understands individuals within their environment and relationships",
                          "Encourages personal responsibility, choice and authentic living",
                          "Focuses on the client's experience in the here and now"],
                         size=17, gap=36, tick_size=26, item_gap=26, anim_delay=0.5, fill_to=760)
    s["els"] += els
    s["cite"] = "Perls et al., 1951   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 03 historical
    s = slide(3)
    els, y = chrome("Foundations", "Historical Background", 3,
                    lead="A therapy that grew out of the 1940s and 1950s.")
    s["els"] += els
    els, y2 = bullet_list(MARGIN, y, 1180,
                          ["Emerged during the 1940s and 1950s",
                           "Developed partly in response to limitations perceived in traditional "
                           "psychoanalysis"],
                          size=16.5, item_gap=20, anim_delay=0.5, fill_to=350)
    s["els"] += els
    s["els"] += block_label(MARGIN, y2 + 30, "INFLUENCED BY", delay=0.9)[0]
    sources = ["Gestalt psychology", "Phenomenology", "Existential philosophy", "Field theory",
               "Holistic approaches"]
    yy = y2 + 62
    for row in range(2):
        rowitems = sources[row * 3:(row + 1) * 3]
        if not rowitems:
            break
        h = 0
        for i, src in enumerate(rowitems):
            e, hh = item(MARGIN + i * 400, yy, 380, src, size=15, tick_size=23, gap=32,
                         delay=1.0 + (row * 3 + i) * 0.1)
            s["els"] += e
            h = max(h, hh)
        yy += h + 16
    s["els"] += block_label(MARGIN, yy + 26, "INTELLECTUAL ROOTS", delay=1.6)[0]
    s["els"] += chain(MARGIN - 8, yy + 58,
                      ["Gestalt psychology", "Phenomenology", "Existentialism", "Field theory",
                       "Gestalt therapy"], gapx=224, size=14, anim_delay=1.7)
    s["stretch"] = False               # each column reads as one object
    s["cite"] = "Perls et al., 1951   |   Woldt and Toman, 2005"
    S.append(s)

    # ===================================================================== 04 theorists
    s = slide(4)
    els, y = chrome("Foundations", "Major Theorists", 4,
                    lead="Three voices that shaped the theory and its practice.")
    s["els"] += els
    people = [("medallion1.png", "Fritz Perls", "1893 to 1970", "Major founder",
               "Awareness, experience and responsibility"),
              ("medallion2.png", "Laura Perls", "1905 to 1990", "Major contributor",
               "Contact, relationship and embodied experience"),
              ("medallion3.png", "Paul Goodman", "1911 to 1972", "Co author of the 1951 text",
               "Shaped the theoretical formulation")]
    for i, (med, nm, dates, role, note) in enumerate(people):
        x = MARGIN + i * 470
        s["els"] += [
            img(med, x, y + 4, 156, anim="pop", delay=0.45 + i * 0.16),
            t(x + 178, y + 22, 296, [P(run(nm.upper(), size=21, color="heading", font="display",
                                           bold=True))], anim="rise", delay=0.55 + i * 0.16),
            t(x + 178, y + 66, 296, [P(run(dates.upper(), size=13, color="accent", font="display",
                                           bold=True, spacing=1.6))],
              anim="fade", delay=0.62 + i * 0.16),
            t(x + 178, y + 104, 296, [P(run(role, size=15, color="muted", bold=True), line=1.3)],
              anim="fade", delay=0.7 + i * 0.16),
        ]
        e, _ = item(x, y + 250, 440, note, size=16, color="text", tick_size=26, gap=36,
                    delay=0.78 + i * 0.16)
        s["els"] += e
    s["stretch"] = False               # each column reads as one object
    s["cite"] = "Perls et al., 1951   |   Woldt and Toman, 2005"
    S.append(s)

    # ===================================================================== 05 assumptions
    s = slide(5)
    els, y = chrome("Foundations", "Core Assumptions", 5,
                    lead="Seven beliefs that hold the whole approach together.")
    s["els"] += els
    left = ["People are best understood as whole persons",
            "Human experience is influenced by the environment",
            "Awareness is central to psychological growth",
            "Experience unfolds in the present"]
    right = ["People have capacity for choice and self regulation",
             "Healthy functioning involves meaningful contact",
             "Psychological difficulties may involve interruptions in awareness or contact"]
    e, _ = bullet_list(MARGIN, y, 600, left, size=16, item_gap=30, anim_delay=0.5, fill_to=780)
    s["els"] += e
    e, _ = bullet_list(MARGIN + 700, y, 620, right, size=16, item_gap=30, anim_delay=0.9,
                       fill_to=780)
    s["els"] += e
    s["cite"] = "Perls et al., 1951   |   Brownell, 2010   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 06 awareness
    s = slide(6)
    els, y = chrome("Core Concepts", "Awareness", 6, lead="The central concept in Gestalt therapy.")
    s["els"] += els
    s["els"] += block_label(MARGIN, y, "NOTICING", delay=0.5)[0]
    notes = ["Thoughts", "Feelings", "Bodily sensations", "Behaviour", "Needs"]
    for i, n in enumerate(notes):
        e, _ = item(MARGIN + i * 238, y + 34, 220, n, size=15, tick_size=23, gap=32,
                    delay=0.58 + i * 0.1)
        s["els"] += e
    s["els"] += block_label(MARGIN, y + 106, "THE PROCESS", delay=1.2)[0]
    yy = y + 140
    e, h = item(MARGIN, yy, 1200, "Focuses on present experience", size=16.5,
                tick_size=26, delay=1.28)
    s["els"] += e
    yy += h + 18
    e, h = item(MARGIN, yy, 1200, "Creates opportunities for choice and change", size=16.5,
                tick_size=26, delay=1.38)
    s["els"] += e
    yy += h + 44
    s["els"] += chain(MARGIN + 14, yy, ["Awareness", "Choice", "Change"], gapx=228, size=20,
                      anim_delay=1.6)
    s["cite"] = "Perls et al., 1951   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 07 here and now
    s = slide(7)
    els, y = chrome("Core Concepts", "The Here and Now", 7, lead="Change happens in the present moment.")
    s["els"] += els
    s["els"] += block_label(MARGIN, y, "THE FOCUS", delay=0.5)[0]
    e, y1 = bullet_list(MARGIN, y + 34, 640,
                        ["Focuses on the client's present experience",
                         "Includes thoughts, emotions, bodily sensations and behaviour"],
                        size=16, item_gap=24, anim_delay=0.58, fill_to=y + 300)
    s["els"] += e
    s["els"] += block_label(MARGIN + 720, y, "THE PAST", delay=0.9, w=560)[0]
    e, y2 = bullet_list(MARGIN + 720, y + 34, 580,
                        ["Past experiences are explored through their current impact",
                         "The therapeutic relationship offers present moment awareness"],
                        size=16, item_gap=24, anim_delay=0.98, fill_to=y + 300)
    s["els"] += e
    e, _ = item(MARGIN, max(y1, y2) + 44, 1250,
                "Encourages direct experience rather than excessive intellectual analysis",
                size=17, tick_size=27, delay=1.4)
    s["els"] += e
    s["cite"] = "Perls et al., 1951   |   Brownell, 2010"
    S.append(s)

    # ===================================================================== 08 figure and ground
    s = slide(8)
    els, y = chrome("Core Concepts", "Figure and Ground", 8,
                    lead="One element steps forward from its context.")
    s["els"] += els
    ring_w = 430.0
    s["els"] += [
        glow(196, y + 4, 500, 420, color="accent", alpha=0.18),
        img("figure_ground.png", 236, y + 20, ring_w, alpha=0.95, anim="zoom", delay=0.5),
        t(236, y + 158, ring_w, [P(run("FIGURE", size=14.5, color="text", font="mono", bold=True,
                                       spacing=2.4), align="c")], anim="fade", delay=1.0),
        t(236, y + 186, ring_w, [P(run("what steps forward", size=13, color="muted",
                                       font="display", italic=True), align="c")],
          anim="fade", delay=1.05),
        t(236, y + 374, ring_w, [P(run("GROUND", size=12, color="muted", font="mono", bold=True,
                                       spacing=3.0), align="c")], anim="fade", delay=1.15),
    ]
    x2 = MARGIN + 640
    yy = y - 4
    for word, sub, d in (("FIGURE", "What is most prominent in awareness", 0.7),
                         ("GROUND", "The surrounding context and experiences", 1.0)):
        e, h = block_text(x2, yy, 560, [P(run(word, size=25, color="heading", font="display",
                                              bold=True))], anim="rise", delay=d)
        s["els"] += e
        yy += h + 6
        e, h = block_text(x2, yy, 545, [P(run(sub, size=15.5, color="muted"), line=1.30)],
                          anim="fade", delay=d + 0.1)
        s["els"] += e
        yy += h + 4
        if word == "FIGURE":
            s["els"].append(chev(x2 + 2, yy, w=34, key="accent", alpha=0.7, delay=d + 0.2,
                                 down=True))
            yy += 38
    yy += 8
    e, y3 = bullet_list(x2, yy, 560,
                        ["Needs and concerns move between figure and ground",
                         "The figure changes as circumstances change",
                         "Awareness reveals what matters most right now"],
                        size=14, item_gap=12, anim_delay=1.3)
    s["els"] += e
    s["stretch"] = False               # each column reads as one object
    s["cite"] = "Perls et al., 1951   |   Woldt and Toman, 2005"
    S.append(s)

    # ===================================================================== 09 contact
    s = slide(9)
    els, y = chrome("Core Concepts", "Contact and the Contact Boundary", 9,
                    lead="Where the person and the world meet.", lead_w=1050)
    s["els"] += els
    e, y2 = bullet_list(MARGIN, y, 1200,
                        ["Contact is the interaction between the individual and the environment",
                         "The contact boundary is the point at which the two meet",
                         "Healthy contact addresses needs while keeping a sense of self",
                         "Contact involves engaging, responding and withdrawing",
                         "Relationships, culture and circumstances influence contact"],
                        size=16, item_gap=18, anim_delay=0.5, fill_to=720)
    s["els"] += e
    s["els"] += chain(MARGIN + 10, y2 + 34, ["Individual", "Contact boundary", "Environment"],
                      gapx=340, size=17, anim_delay=1.3)
    s["cite"] = "Perls et al., 1951   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 10 unfinished business
    s = slide(10)
    els, y = chrome("Core Concepts", "Unfinished Business", 10,
                    lead="Unresolved experience keeps its hold on the present.")
    s["els"] += els
    s["els"] += block_label(MARGIN, y, "MAY INCLUDE", delay=0.5)[0]
    feels = ["Grief", "Anger", "Guilt", "Resentment", "Unmet needs"]
    for i, f in enumerate(feels):
        e, _ = item(MARGIN + i * 238, y + 36, 220, f, size=15.5, tick_size=23, gap=32,
                    delay=0.58 + i * 0.1)
        s["els"] += e
    e, _ = bullet_list(MARGIN, y + 116, 1200,
                       ["Can remain psychologically active in the present",
                        "May interfere with healthy contact",
                        "Therapy promotes awareness and processing"],
                       size=16, item_gap=24, anim_delay=1.1, fill_to=760)
    s["els"] += e
    s["cite"] = "Perls et al., 1951   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 11 responsibility
    s = slide(11)
    els, y = chrome("Core Concepts", "Personal Responsibility", 11,
                    lead="Owning your choices, without blame.")
    s["els"] += els
    e, y1 = bullet_list(MARGIN, y, 700,
                        ["Recognising one's own choices and responses",
                         "Promotes agency and ownership",
                         "Encourages authentic decision making",
                         "Uses language that reflects personal experience"],
                        size=16, item_gap=24, anim_delay=0.5, fill_to=700)
    s["els"] += e
    s["els"] += [
        t(MARGIN, y1 + 32, 660, [P(run("RESPONSIBILITY IS OWNERSHIP  NOT BLAME", size=11.5,
                                       color="accent", font="mono", bold=True, spacing=2.2),
                                   line=1.4)], anim="fade", delay=1.1),
    ]
    x2 = MARGIN + 720
    s["els"] += [t(x2, y - 6, 560, [P(run("LANGUAGE IN PRACTICE", size=11, color="accent",
                                          font="mono", bold=True, spacing=2.6))],
                   anim="fade", delay=0.6)]
    e, h = contrast_pair(x2, y + 32, 560, "\u201cYou make me angry.\u201d", "blames the other person",
                         mark="cross", color="muted", tick_color="ember", delay=0.7)
    s["els"] += e
    e, h = contrast_pair(x2, y + 32 + h + 34, 580,
                         "\u201cI notice that I become angry when\u2026\u201d", "owns the experience",
                         color="text", tick_color=TICK_BY_PALETTE[s["palette"]], delay=1.05)
    s["els"] += e
    s["cite"] = "Perls et al., 1951   |   Corey, 2024"
    S.append(s)

    # ===================================================================== 12 role of the counsellor
    s = slide(12)
    els, y = chrome("Practice", "Role of the Gestalt Counsellor", 12,
                    lead="A companion in the client's present experience.", lead_w=1050)
    s["els"] += els
    left = ["Facilitates awareness", "Focuses on present experience",
            "Observes verbal and non verbal behaviour", "Uses the therapeutic relationship"]
    right = ["Encourages authentic expression", "Explores interruptions in contact",
             "Promotes responsibility and choice"]
    e, _ = bullet_list(MARGIN, y, 600, left, size=16, item_gap=30, anim_delay=0.5, fill_to=760)
    s["els"] += e
    # the second column carries one line fewer, so it takes the first column's
    # baselines rather than opening wider gaps of its own
    steps = [el["y"] for el in e if el["k"] == "text"]
    e, _ = bullet_list(MARGIN + 700, y, 620, right, size=16, item_gap=30, anim_delay=0.95,
                       ys=steps)
    s["els"] += e
    s["cite"] = "Joyce and Sills, 2014   |   Brownell, 2010"
    S.append(s)

    # ===================================================================== 13 techniques
    s = slide(13)
    els, y = chrome("Practice", "Gestalt Therapeutic Techniques", 13,
                    lead="Nine experiments that turn talking into experiencing.", lead_w=1100)
    s["els"] += els
    tech = ["Empty chair technique", "Two chair dialogue", "Exaggeration", "Staying with the feeling",
            "Role play", "Body awareness", "\u201cI\u201d statements", "Dream work",
            "Here and now questioning"]
    for row in range(3):
        h = 0
        for col in range(3):
            i = row * 3 + col
            e, hh = item(MARGIN + col * 470, y, 430, tech[i], size=16, tick_size=25, gap=34,
                         delay=0.45 + i * 0.09)
            s["els"] += e
            h = max(h, hh)
        y += h + 26
    s["cite"] = "Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 14 empty chair
    s = slide(14)
    els, y = chrome("Practice", "Empty Chair Technique", 14,
                    lead="Speaking to the person who is not in the room.")
    s["els"] += els
    e, y1 = bullet_list(MARGIN, y, 780,
                        ["The client imagines another person in the empty chair",
                         "Speaks directly to the imagined person",
                         "Brings unresolved experience into present awareness",
                         "Facilitates expression of unfinished emotions",
                         "May open new awareness and perspectives"],
                        size=16, item_gap=18, anim_delay=0.5)
    s["els"] += e
    # the illustration: an open quotation, measured so nothing touches it
    qx, qy = 960, y - 20
    e, h = block_text(qx, qy, 200, [P(run("\u201c", size=74, color="accent", font="display",
                                          bold=True), line=0.78)], anim="fade", delay=0.9)
    s["els"] += e
    qy += h + 6
    e, h = block_text(qx + 12, qy, 520,
                     [P(run("Imagine your father is sitting in that chair. What would you want "
                            "him to hear from you?", size=19.5, color="text", font="display",
                            italic=True), line=1.34)], anim="rise", delay=1.0)
    s["els"] += e
    qy += h + 12
    s["els"] += block_text(qx + 12, qy, 460, [P(run("EXAMPLE", size=10.5, color="dim",
                                                    font="mono", bold=True, spacing=2.6))],
                           anim="fade", delay=1.2)[0]
    s["els"] += [glow(qx - 40, y + 4, 560, 340, color="accent", alpha=0.16)]
    s["els"] += block_label(MARGIN, y1 + 34, "THE SETUP", delay=1.3)[0]
    s["els"] += chain(MARGIN + 6, y1 + 66, ["Client", "Imagined person"], gapx=300, size=16,
                      anim_delay=1.4)
    s["cite"] = "Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 15 other techniques
    s = slide(15)
    els, y = chrome("Practice", "Other Experiential Techniques", 15, lead="What each experiment is for.")
    s["els"] += els
    tech = [("Two chair dialogue", "Explore opposing parts"),
            ("Exaggeration", "Increase awareness"),
            ("Staying with the feeling", "Explore emerging emotions"),
            ("Body awareness", "Notice physical experience"),
            ("\u201cI\u201d statements", "Own personal experience"),
            ("Dream work", "Explore present meaning")]
    yy = y
    for i, (name, purpose) in enumerate(tech):
        e, h1 = item(MARGIN, yy, 520, name, size=16, bold=True, tick_size=25, gap=40,
                     delay=0.45 + i * 0.1)
        s["els"] += e
        e, h2 = item(MARGIN + 700, yy, 560, purpose, size=16, color="muted", tick_size=25, gap=40,
                     delay=0.5 + i * 0.1)
        s["els"] += e
        yy += max(h1, h2) + 22
    s["cite"] = "Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 16 application
    s = slide(16)
    els, y = chrome("Practice", "Application in Counselling", 16,
                    lead="Gestalt therapy can be applied to the following areas.")
    s["els"] += els
    areas = ["Grief and loss", "Relationship difficulties", "Anxiety and emotional distress",
             "Unresolved anger", "Identity concerns", "Emotional expression difficulties",
             "Personal growth", "Unresolved interpersonal experiences"]
    for row in range(4):
        h = 0
        for col in range(2):
            i = row * 2 + col
            e, hh = item(MARGIN + col * 620, y, 580, areas[i], size=16, tick_size=25, gap=34,
                         delay=0.45 + i * 0.09)
            s["els"] += e
            h = max(h, hh)
        y += h + 22
    s["els"] += block_label(MARGIN, y + 24, "THERAPEUTIC MOVEMENT", delay=1.3)[0]
    s["els"] += chain(MARGIN, y + 58, ["Awareness", "Contact", "Responsibility", "Choice", "Growth"],
                      gapx=250, size=15, anim_delay=1.4)
    s["cite"] = "Brownell, 2010   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 17 strengths
    s = slide(17)
    els, y = chrome("Evaluation", "Strengths of Gestalt Therapy", 17,
                    lead="What this approach does particularly well.")
    s["els"] += els
    left = ["Promotes self awareness", "Focuses on lived experience",
            "Encourages agency and responsibility", "Integrates mind, emotion and body"]
    right = ["Considers person and environment interaction",
             "Encourages active client participation",
             "Supports experiential emotional processing"]
    e, _ = bullet_list(MARGIN, y, 600, left, size=16, item_gap=28, anim_delay=0.45, fill_to=780)
    s["els"] += e
    e, _ = bullet_list(MARGIN + 700, y, 620, right, size=16, item_gap=28, anim_delay=0.85,
                       fill_to=780)
    s["els"] += e
    S.append(s)

    # ===================================================================== 18 limitations
    s = slide(18)
    els, y = chrome("Evaluation", "Limitations and Criticisms", 18,
                    lead="Honest considerations for careful practice.")
    s["els"] += els
    left = ["Some techniques may feel intense",
            "Requires skilled and sensitive application",
            "May challenge clients who prefer highly structured approaches",
            "Experiential techniques can be misused"]
    right = ["Not every intervention suits every client",
             "Cultural context must be considered",
             "Ethical boundaries are essential"]
    e, _ = bullet_list(MARGIN, y, 620, left, size=16, item_gap=28, anim_delay=0.45, fill_to=770)
    s["els"] += e
    e, _ = bullet_list(MARGIN + 700, y, 600, right, size=16, item_gap=28, anim_delay=0.9,
                       fill_to=770)
    s["els"] += e
    s["cite"] = "Corey, 2024   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 19 case application
    s = slide(19)
    els, y = chrome("Evaluation", "Case Application", 19,
                    lead="A 20 year old undergraduate student on a scholarship.", lead_w=1100)
    s["els"] += els
    cols = [("01", "PRESENTING CONCERNS",
             ["Academic anxiety", "Fear of losing the scholarship",
              "Fear of disappointing family", "Difficulty expressing emotions",
              "Pressure to maintain high grades"]),
            ("02", "GESTALT CONCEPTUALISATION",
             ["Anxiety becomes figure", "Possible introjected expectations",
              "Limited awareness of personal needs", "Interrupted contact"]),
            ("03", "POSSIBLE INTERVENTIONS",
             ["Here and now exploration", "Body awareness", "Staying with the feeling",
              "\u201cI\u201d statements", "Exploring introjected beliefs"])]
    for ci, (num, head, items_) in enumerate(cols):
        x = MARGIN + ci * 474
        s["els"] += [
            t(x, y - 6, 300, [P(run(num, size=17, color="accent", font="display", bold=True))],
              anim="fade", delay=0.4 + ci * 0.12),
            t(x, y + 26, 440, [P(run(head, size=12.5, color="heading", font="mono", bold=True,
                                     spacing=1.2), line=1.3)], anim="rise",
              delay=0.48 + ci * 0.12),
        ]
        e, _ = bullet_list(x, y + 62, 430, items_, size=14.5, tick_size=23, gap=34, item_gap=15,
                           anim_delay=0.6 + ci * 0.12, fill_to=780)
        s["els"] += e
    S.append(s)

    # ===================================================================== 20 critical evaluation
    s = slide(20)
    els, y = chrome("Evaluation", "Critical Evaluation", 20,
                    lead="What the theory contributes and what it asks of the therapist.")
    s["els"] += els
    s["els"] += block_label(MARGIN, y, "CONTRIBUTIONS", delay=0.45)[0]
    s["els"] += block_label(MARGIN + 700, y, "CONSIDERATIONS", delay=0.7, w=560)[0]
    e, _ = bullet_list(MARGIN, y + 34, 600,
                       ["Holistic understanding of human experience",
                        "Strong emphasis on awareness",
                        "Integrates body, emotion and cognition",
                        "Recognises person and environment interaction",
                        "Promotes agency and authentic choice"],
                       size=15, item_gap=17, anim_delay=0.5)
    s["els"] += e
    e, _ = bullet_list(MARGIN + 700, y + 34, 620,
                       ["Cultural adaptation", "Client readiness", "Therapist competence",
                        "Appropriate use of experiential techniques",
                        "Balance between present and past experience"],
                       size=15, item_gap=17, anim_delay=0.8)
    s["els"] += e
    S.append(s)

    # ===================================================================== 21 conclusion
    s = slide(21)
    els, y = chrome("Closing", "Conclusion", 21,
                    lead="Greater awareness creates greater possibilities for choice and change.",
                    lead_w=1180)
    s["els"] += els
    tk = TICK_BY_PALETTE[s["palette"]]
    yy = y + 10
    for i, (word, size) in enumerate([("Awareness", 21), ("Here and now", 21), ("Contact", 21),
                                      ("Responsibility and choice", 21), ("Growth", 25)]):
        last = size == 25
        ts = 34 if last else 26
        e, h = block_text(MARGIN + 54, yy, 700,
                          [P(run(word.upper(), size=size, color="heading", font="display",
                                 bold=True), line=1.25)], anim="rise", delay=0.52 + i * 0.16)
        s["els"] += [tick(MARGIN, yy + (h - ts) * 0.5, size=ts, color=tk, anim="pop",
                          delay=0.45 + i * 0.16)] + e
        yy += h + 32
    s["els"] += [
        glow(1010, y + 150, 470, 400, color="accent", alpha=0.10),
        t(MARGIN + 880, y + 250, 520,
          [P(run("Therapeutic change begins with noticing what is happening now.", size=17,
                 color="text", font="display"), line=1.45)], anim="rise", delay=1.5),
    ]
    s["cite"] = "Perls et al., 1951   |   Joyce and Sills, 2014"
    S.append(s)

    # ===================================================================== 22 references
    s = slide(22)
    els, y = chrome("Closing", "References", 22)
    s["els"] += els
    refs = ["Brownell, P. (2010). Gestalt therapy: A guide to contemporary practice. Springer.",
            "Corey, G. (2024). Theory and practice of counseling and psychotherapy (11th ed.). Cengage.",
            "Joyce, P., and Sills, C. (2014). Skills in Gestalt counselling and psychotherapy (3rd ed.). SAGE.",
            "Perls, F. S., Hefferline, R. F., and Goodman, P. (1951). Gestalt therapy: Excitement "
            "and growth in the human personality. Julian Press.",
            "Woldt, A. L., and Toman, S. M. (2005). Gestalt therapy: History, theory, and practice. SAGE.",
            "Yontef, G., and Fuhr, R. (2005). Gestalt therapy theory of change. In Woldt and Toman "
            "(Eds.), Gestalt therapy: History, theory, and practice (pp. 81 to 100). SAGE."]
    e, _ = bullet_list(MARGIN, y - 10, 1240, refs, size=13.5, color="muted", item_gap=13,
                       anim_delay=0.4, tick_size=22, gap=32, fill_to=790)
    s["els"] += e
    S.append(s)

    return [settle(s) for s in S]


if __name__ == "__main__":
    slides = build()
    print(len(slides), "slides", sum(len(s["els"]) for s in slides), "elements")
    # sanity: report any element that runs past the bottom
    for sl in slides:
        for el in sl["els"]:
            if el["k"] == "text":
                h = block_height(el["paras"], el["w"])
                if el["y"] + h > STAGE_H - 40:
                    print("  overflow on slide %d: %r" % (sl["n"], el["paras"][0]["runs"][0]["s"][:48]))
