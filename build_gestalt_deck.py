#!/usr/bin/env python3
"""
Build the MCP504 Group 4 Gestalt Therapy presentation.

Source of content: "GESTALT THERAPY GROUP WORK.docx" (13 sections + references).
Design decisions agreed with the group:
  * ~27 slides covering all 13 sections of the paper
  * clean/minimal design, one consistent background, no decorative photos
  * at most ONE inline citation per substantive slide
  * speaker notes on every slide carrying the paper's depth
  * reference list matches the paper exactly
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

from deck_metrics import para_height_in, width_in

OUT = "Gestalt Theory and Its Application to Counselling (11).pptx"

# ---------------------------------------------------------------- palette
INK    = RGBColor(0x1B, 0x3A, 0x4B)   # deep teal-navy  (headings, title bg)
TEAL   = RGBColor(0x2E, 0x7D, 0x8F)   # secondary
ACCENT = RGBColor(0xC9, 0x76, 0x2F)   # burnt amber (eyebrow, key lines)
MUTED  = RGBColor(0x5F, 0x70, 0x78)   # body-soft
RULE   = RGBColor(0xD8, 0xE1, 0xE4)   # hairlines / panel borders
LIGHT  = RGBColor(0xF4, 0xF7, 0xF8)   # panel fill
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)

HFONT = "Calibri Light"
BFONT = "Calibri"

SW, SH = 13.333, 7.5
ML = 0.72                      # left margin
CW = SW - 2 * ML               # content width
FOOTER_TXT = "PAN AFRICAN CHRISTIAN UNIVERSITY   ·   MCP504 THEORIES OF COUNSELLING AND PSYCHOTHERAPY"


# ---------------------------------------------------------------- helpers
def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def rect(slide, x, y, w, h, fill=None, line=None, lw=0.75, shape=MSO_SHAPE.RECTANGLE,
         radius=None):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if radius is not None:
        try:
            s.adjustments[0] = radius
        except Exception:
            pass
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(lw)
    s.shadow.inherit = False
    s.text_frame.text = ""
    return s


def tb(slide, x, y, w, h, blocks, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
       space_after=4, line_spacing=1.0):
    """blocks: list of dicts or list of (text, size, color, bold, italic)."""
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    first = True
    for b in blocks:
        if isinstance(b, dict) and "runs" in b:
            # a SINGLE paragraph carrying several differently-styled runs
            p = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            p.alignment = b.get("a", align)
            p.space_after = Pt(b.get("sa", 0))
            try:
                p.line_spacing = b.get("ls", 1.0)
            except Exception:
                pass
            for (rt, rs, rc, rb, ri, rf) in b["runs"]:
                r = p.add_run()
                r.text = rt
                r.font.size = Pt(rs)
                r.font.color.rgb = rc
                r.font.bold = rb
                r.font.italic = ri
                r.font.name = rf
            continue
        if isinstance(b, tuple):
            text, size, color, bold, italic = b
            font_name, align_, sp_before, bullet = BFONT, align, None, None
            ls_val = line_spacing
        else:
            text = b.get("t", "")
            size = b.get("s", 14)
            color = b.get("c", INK)
            bold = b.get("b", False)
            italic = b.get("i", False)
            font_name = b.get("f", BFONT)
            align_ = b.get("a", align)
            sp_before = b.get("sb", None)
            bullet = b.get("bullet", None)
            ls_val = b.get("ls", line_spacing)
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align_
        p.space_after = Pt(space_after)
        if sp_before:
            p.space_before = Pt(sp_before)
        try:
            p.line_spacing = ls_val
        except Exception:
            pass
        if bullet:
            p.text = ""
            r = p.add_run()
            r.text = bullet + "   "
            r.font.size = Pt(size)
            r.font.color.rgb = ACCENT
            r.font.bold = False      # kept unbolded so measured width matches the body
            r.font.name = font_name
            r2 = p.add_run()
            r2.text = text
            r2.font.size = Pt(size)
            r2.font.color.rgb = color
            r2.font.bold = bold
            r2.font.italic = italic
            r2.font.name = font_name
        else:
            r = p.add_run()
            r.text = text
            r.font.size = Pt(size)
            r.font.color.rgb = color
            r.font.bold = bold
            r.font.italic = italic
            r.font.name = font_name
    return box


def frame(prs, eyebrow, title, page, cite=None, kicker=None):
    """Standard content slide: left spine, eyebrow, title, hairline, footer."""
    s = blank(prs)
    rect(s, 0, 0, SW, SH, fill=WHITE)
    rect(s, 0, 0, 0.16, SH, fill=INK)                       # left spine
    rect(s, 0.16, 0, 0.05, 2.05, fill=ACCENT)               # accent tab

    if eyebrow:
        tb(s, ML, 0.46, CW, 0.26,
           [dict(t=eyebrow.upper(), s=11.5, c=ACCENT, b=True, f=HFONT)])
    tb(s, ML, 0.76, CW, 0.72,
       [dict(t=title, s=31, c=INK, b=True, f=HFONT, ls=0.95)])
    rect(s, ML, 1.63, CW, 0.022, fill=RULE)

    if kicker:
        tb(s, ML, 1.76, CW, 0.4,
           [dict(t=kicker, s=13.5, c=MUTED, i=True, ls=1.05)])

    # footer
    rect(s, ML, 6.86, CW, 0.016, fill=RULE)
    tb(s, ML, 6.98, CW - 1.0, 0.26,
       [dict(t=FOOTER_TXT, s=8.5, c=MUTED, f=HFONT)])
    tb(s, SW - ML - 0.9, 6.98, 0.9, 0.26,
       [dict(t=f"{page:02d}", s=8.5, c=ACCENT, b=True, f=HFONT, a=PP_ALIGN.RIGHT)])
    if cite:
        tb(s, ML, 6.55, CW, 0.26,
           [dict(t=cite, s=10, c=MUTED, i=True)])
    return s


def _blocks_height(items, size, w, bullet, ls, space_after):
    total = 0.0
    for t in items:
        txt = (bullet + "   " + t) if bullet else t
        total += para_height_in(txt, size, w, line_spacing=ls, space_after=space_after)
    return total


def panel(slide, x, y, w, h, label, items, fill=LIGHT, label_color=TEAL,
          size=12.5, gap=0.34, item_color=INK, bullet="\u2013",
          avail_bottom=None, floor=9.0, space_after=5, ls=1.05):
    """Bordered panel with a small caps label and a bulleted list.

    Auto-fits: if the text will not fit `h`, the panel first grows (up to
    `avail_bottom`) and then the font size is reduced, never below `floor`.
    """
    label_h = (0.19 + gap) if label else 0.20
    inner_w = w - 0.52

    if avail_bottom is not None and avail_bottom > y + h:
        h = avail_bottom - y

    needed = _blocks_height(items, size, inner_w, bullet, ls, space_after)
    while needed > (h - label_h - 0.16) and size > floor:
        size -= 0.5
        needed = _blocks_height(items, size, inner_w, bullet, ls, space_after)

    rect(slide, x, y, w, h, fill=fill, line=RULE, lw=0.75)
    rect(slide, x, y, 0.045, h, fill=label_color)
    if label:
        tb(slide, x + 0.26, y + 0.19, w - 0.5, 0.24,
           [dict(t=label.upper(), s=10.5, c=label_color, b=True, f=HFONT)])
    ty = y + label_h
    blocks = [dict(t=t, s=size, c=item_color, bullet=bullet, ls=ls) for t in items]
    tb(slide, x + 0.26, ty, inner_w, y + h - ty - 0.16, blocks, space_after=space_after)
    return h



def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def chip(slide, x, y, w, h, num, label, sub=None, fill=INK, fg=WHITE,
         num_color=ACCENT, size=12):
    rect(slide, x, y, w, h, fill=fill, radius=0.06, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    blocks = [dict(t=num, s=15, c=num_color, b=True, f=HFONT, a=PP_ALIGN.CENTER),
              dict(t=label, s=size, c=fg, b=True, a=PP_ALIGN.CENTER, ls=0.95)]
    if sub:
        blocks.append(dict(t=sub, s=10, c=RGBColor(0xC9, 0xD6, 0xDB),
                           a=PP_ALIGN.CENTER, ls=1.0, sb=3))
    tb(slide, x + 0.12, y + 0.14, w - 0.24, h - 0.28, blocks,
       align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, space_after=2)


# ---------------------------------------------------------------- build
prs = Presentation()
prs.slide_width = Inches(SW)
prs.slide_height = Inches(SH)

# ============================================================ 1 · TITLE
s = blank(prs)
rect(s, 0, 0, SW, SH, fill=INK)
rect(s, 0, 0, 0.32, SH, fill=ACCENT)
rect(s, 0.95, 1.30, 1.5, 0.045, fill=ACCENT)
tb(s, 0.95, 0.80, 10.0, 0.3,
   [dict(t="GROUP 4 PRESENTATION   ·   MCP504", s=12.5,
         c=RGBColor(0xE8, 0xB2, 0x86), b=True, f=HFONT)])
tb(s, 0.95, 1.55, 11.4, 2.0,
   [dict(t="Gestalt Therapy", s=54, c=WHITE, b=True, f=HFONT, ls=0.92),
    dict(t="An Experiential Approach to Counselling and Psychotherapy",
         s=20, c=RGBColor(0xA8, 0xC4, 0xCE), f=HFONT, sb=6, ls=1.0)])

rect(s, 0.95, 4.05, 11.4, 0.016, fill=RGBColor(0x3C, 0x62, 0x74))
tb(s, 0.95, 4.28, 6.6, 2.30,
   [dict(t="PRESENTED BY  ·  GROUP 4", s=10.5, c=ACCENT, b=True, f=HFONT),
    dict(t="Josephine Biwott", s=15, c=WHITE, b=True, sb=8),
    dict(t="MACP/35996/0/26", s=11.5, c=RGBColor(0x9F, 0xB8, 0xC2)),
    dict(t="Cynthia Cherono", s=15, c=WHITE, b=True, sb=10),
    dict(t="MACP/35785/4/26", s=11.5, c=RGBColor(0x9F, 0xB8, 0xC2)),
    dict(t="Yvonne Juliet Awuor", s=15, c=WHITE, b=True, sb=10),
    dict(t="MALD/36547/4/26", s=11.5, c=RGBColor(0x9F, 0xB8, 0xC2))],
   space_after=1)
tb(s, 7.9, 4.28, 4.4, 2.30,
   [dict(t="COURSE", s=10.5, c=ACCENT, b=True, f=HFONT),
    dict(t="MCP504 · Theories of Counselling and Psychotherapy", s=12.5, c=WHITE, sb=4),
    dict(t="INSTITUTION", s=10.5, c=ACCENT, b=True, f=HFONT, sb=12),
    dict(t="Pan African Christian University", s=12.5, c=WHITE, sb=4),
    dict(t="LECTURER", s=10.5, c=ACCENT, b=True, f=HFONT, sb=12),
    dict(t="Dr. Lucy Gachenia", s=12.5, c=WHITE, sb=4)],
   space_after=1)
tb(s, 0.95, 6.75, 11.4, 0.3,
   [dict(t="Based on the group paper “Gestalt Therapy: An Experiential Approach to "
           "Counselling and Psychotherapy”", s=10.5,
         c=RGBColor(0x8F, 0xAC, 0xB8), i=True)])
notes(s, "Good morning/afternoon. We are Group 4, and our presentation covers Gestalt "
         "Therapy as an experiential approach to counselling and psychotherapy. "
         "Gestalt is a German word commonly translated as 'form', 'pattern' or "
         "'organised whole'. That single word carries the whole theory: the approach "
         "views a person as an integrated whole whose thoughts, emotions, bodily "
         "sensations, behaviour and relationships are interconnected. Our discussion "
         "follows the structure of our submitted paper: historical development, "
         "philosophical foundations, core assumptions, the major concepts, contact "
         "boundary disturbances, goals and techniques, a case application, and finally "
         "an evaluation of strengths and limitations.")

# ============================================================ 2 · ROADMAP
s = frame(prs, "Overview", "What This Presentation Covers", 2)
items = [
    ("01", "Introduction", "What Gestalt Therapy is and why it matters to counselling"),
    ("02", "Origins", "Historical development and the three major contributors"),
    ("03", "Foundations", "Phenomenology · existentialism · holism · field theory"),
    ("04", "Core assumptions", "The six assumptions that shape practice"),
    ("05", "Major concepts", "Awareness, figure/ground, contact, unfinished business, self-regulation, the cycle of experience"),
    ("06", "Boundary disturbances", "Introjection · projection · retroflection · deflection · confluence"),
    ("07", "Practice", "Goals, the counsellor's role and the therapeutic techniques"),
    ("08", "Case application", "Amina — a 32-year-old administrative officer"),
    ("09", "Evaluation", "Strengths, limitations and critical evaluation"),
]
cols, rows = 3, 3
cw_, ch_ = (CW - 0.5) / cols, 1.42
for i, (n, t, d) in enumerate(items):
    x = ML + (i % cols) * (cw_ + 0.25)
    y = 1.95 + (i // cols) * (ch_ + 0.18)
    rect(s, x, y, cw_, ch_, fill=LIGHT, line=RULE)
    rect(s, x, y, cw_, 0.05, fill=TEAL if i != 5 else ACCENT)
    tb(s, x + 0.24, y + 0.22, cw_ - 0.48, ch_ - 0.4,
       [dict(t=n, s=13, c=ACCENT, b=True, f=HFONT),
        dict(t=t, s=14.5, c=INK, b=True, sb=2),
        dict(t=d, s=10.5, c=MUTED, sb=3, ls=1.05)], space_after=0)
tb(s, ML, 6.60, CW, 0.3,
   [dict(t="One thread runs through all nine: awareness is the condition for choice.",
         s=12.5, c=TEAL, i=True, b=True, a=PP_ALIGN.CENTER)])
notes(s, "Here is the map for the next few minutes. Nine movements. We begin with what "
         "Gestalt Therapy actually is, then its origins in the mid-twentieth century and "
         "its four philosophical foundations. From there we move into the six core "
         "assumptions and the major concepts of the theory. The longest and most "
         "practically important section is the sixth: the five contact boundary "
         "disturbances, because these are the patterns you will actually recognise in "
         "the consulting room. We then cover goals, the counsellor's role and the "
         "techniques, apply everything to a case, and close with an honest evaluation of "
         "where the approach is strong and where it is limited.")

# ============================================================ 3 · INTRODUCTION
s = frame(prs, "Section 1", "Introduction: What Is Gestalt Therapy?", 3,
          cite="(Perls et al., 1951; Woldt & Toman, 2005)",
          kicker="A humanistic, experiential approach built on the meaning of one German word.")
panel(s, ML, 2.30, 5.62, 2.05, "The meaning of “Gestalt”", [
    "German for “form”, “pattern” or “organised whole”",
    "A person is an integrated whole — thoughts, emotions, bodily sensations, behaviour and relationships are interconnected",
    "Not a collection of isolated psychological functions",
])
panel(s, ML + 5.82, 2.30, CW - 5.82, 2.05, "What it does instead", [
    "Does not concentrate exclusively on the past",
    "Does not try simply to eliminate symptoms",
    "Helps clients notice how they experience and respond in the present",
], label_color=ACCENT)
rect(s, ML, 4.55, CW, 1.85, fill=INK)
rect(s, ML, 4.55, 0.05, 1.85, fill=ACCENT)
tb(s, ML + 0.35, 4.78, CW - 0.7, 1.45,
   [dict(t="WHY IT MATTERS TO COUNSELLING", s=10.5, c=ACCENT, b=True, f=HFONT),
    dict(t="Clients often present with unresolved emotions, unexamined beliefs, "
            "avoidance and difficulty expressing their needs. Gestalt Therapy proposes "
            "that increased awareness helps a person recognise their needs, understand "
            "their emotional responses, identify restrictive patterns and make more "
            "deliberate choices — reached through a collaborative relationship in which "
            "the counsellor explores rather than interprets or blames.",
         s=13.5, c=WHITE, sb=8, ls=1.12)], space_after=0)
notes(s, "Gestalt Therapy is a humanistic and experiential approach emphasising "
         "awareness, present-moment experience, personal responsibility, and the "
         "relationship between an individual and their environment. Rather than "
         "concentrating exclusively on past experiences or attempting to eliminate "
         "symptoms, it helps clients become more aware of how they experience and "
         "respond to situations in the present. Past experiences remain important — "
         "particularly when their emotional effects continue to influence present "
         "relationships and behaviour — but the entry point is the here and now. The "
         "relevance to counselling is concrete: clients come with unresolved emotions, "
         "unexamined beliefs, avoidance and trouble expressing needs. The counsellor's "
         "task is to explore those patterns without imposing interpretations or blaming "
         "the client for their difficulties.")

# ============================================================ 4 · HISTORY
s = frame(prs, "Section 2", "Historical Development and Major Contributors", 4,
          cite="(Woldt & Toman, 2005)")
tb(s, ML, 1.90, CW, 0.6,
   [dict(t="Gestalt Therapy developed during the mid-twentieth century. Its foundational "
           "text, Gestalt Therapy: Excitement and Growth in the Human Personality, was "
           "published in 1951 by Perls, Hefferline and Goodman.",
         s=13.5, c=INK, ls=1.12)])
people = [
    ("Fritz Perls", "1893–1970", "Co-founder",
     "Emphasis on awareness, present experience and personal responsibility."),
    ("Laura Perls", "1905–1990", "Co-founder",
     "Theoretical and clinical development; attention to embodied experience, contact and the therapeutic relationship."),
    ("Paul Goodman", "1911–1972", "Co-author of the 1951 text",
     "Theoretical formulation of the approach and its philosophical and social dimensions."),
]
cw3 = (CW - 0.5) / 3
for i, (nm, dates, role, desc) in enumerate(people):
    x = ML + i * (cw3 + 0.25)
    rect(s, x, 2.70, cw3, 1.95, fill=LIGHT, line=RULE)
    rect(s, x, 2.70, cw3, 0.05, fill=ACCENT)
    tb(s, x + 0.24, 2.92, cw3 - 0.48, 1.6,
       [dict(t=nm, s=16, c=INK, b=True, f=HFONT),
        dict(t=f"{dates}   ·   {role}", s=10.5, c=TEAL, b=True, sb=1),
        dict(t=desc, s=11.5, c=MUTED, sb=6, ls=1.1)], space_after=0)
panel(s, ML, 4.80, CW, 1.5, "Four intellectual traditions shaped the approach", [
    "Gestalt psychology — understanding people as integrated wholes",
    "Phenomenology — exploring immediate, subjective experience",
    "Existential philosophy — choice, responsibility, freedom and meaning",
    "Field theory — the influence of the person's environment",
], bullet="→", avail_bottom=6.42, size=11.5)
notes(s, "Gestalt Therapy emerged through the integration of several intellectual "
         "traditions and a growing interest in understanding human experience as an "
         "active, relational process. Fritz Perls contributed the emphasis on awareness, "
         "present experience and personal responsibility. Laura Perls shaped its "
         "theoretical and clinical development, particularly through her attention to "
         "embodied experience, contact and the therapeutic relationship — a contribution "
         "historically under-credited. Paul Goodman contributed the theoretical "
         "formulation and its philosophical and social dimensions. Although Gestalt "
         "Therapy shares principles with other humanistic approaches, it has a "
         "distinctive emphasis on how people organise experience, make contact with "
         "their environment, and become aware of habitual ways of responding. "
         "Contemporary practice still emphasises awareness, dialogue and relational "
         "contact rather than a fixed set of techniques.")

# ============================================================ 5 · PHILOSOPHICAL FOUNDATIONS
s = frame(prs, "Section 3", "Philosophical Foundations", 5,
          cite="(Brownell, 2010; Joyce & Sills, 2014)")
quads = [
    ("3.1  Phenomenology",
     "Understand experience as the individual perceives it. The counsellor seeks the "
     "client's subjective world before imposing an explanation.",
     "“A colleague disrespects me.” → what actually occurred, how it was interpreted, "
     "what emotion arose, what was noticed in the body."),
    ("3.2  Existential philosophy",
     "Choice, responsibility, freedom and the search for meaning. Clients are helped to "
     "see their own participation in their experience.",
     "Responsibility is not control. Social expectations, economic hardship, "
     "discrimination and unequal power genuinely restrict options."),
    ("3.3  Holism",
     "A person is an integrated whole, not unrelated parts. Thought, emotion, sensation, "
     "behaviour and relationship influence one another.",
     "Anxiety at work appears together as racing thoughts, muscle tension, fear of "
     "criticism and difficulty speaking up."),
    ("3.4  Field theory",
     "Experience cannot be fully understood apart from the environment — relationships, "
     "culture, workplace conditions, economic circumstances.",
     "An employee who cannot refuse extra duties is shaped by internal beliefs AND "
     "workplace power, financial dependence and job insecurity."),
]
qw, qh = (CW - 0.28) / 2, 2.16
for i, (t, body, ex) in enumerate(quads):
    x = ML + (i % 2) * (qw + 0.28)
    y = 1.95 + (i // 2) * (qh + 0.22)
    rect(s, x, y, qw, qh, fill=LIGHT, line=RULE)
    rect(s, x, y, 0.05, qh, fill=TEAL if i % 2 == 0 else ACCENT)
    tb(s, x + 0.28, y + 0.20, qw - 0.56, qh - 0.4,
       [dict(t=t, s=14.5, c=INK, b=True, f=HFONT),
        dict(t=body, s=11.5, c=MUTED, sb=5, ls=1.1),
        dict(t=ex, s=11, c=TEAL, i=True, sb=5, ls=1.1)], space_after=0)
notes(s, "Four philosophical traditions underpin the whole approach, and each one "
         "changes what a counsellor does in the room. Phenomenology means we attend to "
         "what the client experiences, how they interpret it, and what happens as they "
         "describe it — this is how we separate direct observation from assumption. "
         "Existential philosophy foregrounds choice and responsibility, but our paper is "
         "careful here: responsibility does not mean the individual controls every "
         "circumstance, and the counsellor helps clients find realistic areas of choice "
         "without blaming them for conditions beyond their control. Holism insists that "
         "we do not treat thoughts, feelings, sensations and behaviour as unrelated "
         "parts. Field theory insists the person cannot be understood apart from their "
         "environment — this is what stops us locating the entire problem inside the "
         "individual.")

# ============================================================ 6 · CORE ASSUMPTIONS
s = frame(prs, "Section 4", "Six Core Assumptions", 6,
          cite="(Brownell, 2010; Perls et al., 1951)")
assum = [
    ("01", "People are integrated wholes",
     "Thoughts, feelings, bodily sensations, actions and relationships influence one another."),
    ("02", "Awareness supports change",
     "Unhelpful patterns repeat unnoticed; noticing them opens alternative choices."),
    ("03", "The present moment is central",
     "The past is examined through how it continues to shape current feeling and behaviour."),
    ("04", "Capacity for organismic self-regulation",
     "People continually respond to changing needs; difficulty arises when awareness or contact is restricted."),
    ("05", "Shaped by the person–environment",
     "Human experience is shaped by family, culture, work, social expectations and available resources."),
    ("06", "Personal responsibility supports choice",
     "Applied sensitively — responsibility must never be confused with blame."),
]
cw2, ch2 = (CW - 0.28) / 2, 1.44
for i, (n, t, d) in enumerate(assum):
    x = ML + (i % 2) * (cw2 + 0.28)
    y = 1.95 + (i // 2) * (ch2 + 0.16)
    rect(s, x, y, cw2, ch2, fill=LIGHT, line=RULE)
    rect(s, x, y, 0.05, ch2, fill=ACCENT if i == 5 else TEAL)
    tb(s, x + 0.28, y + 0.20, cw2 - 0.56, ch2 - 0.36,
       [dict(t=n, s=12, c=ACCENT, b=True, f=HFONT),
        dict(t=t, s=14, c=INK, b=True, sb=1),
        dict(t=d, s=11.5, c=MUTED, sb=3, ls=1.08)], space_after=0)
notes(s, "These six assumptions are interconnected, and together they shape how a "
         "Gestalt counsellor understands a client. Because people are integrated "
         "wholes, we consider overall experience rather than verbal description alone. "
         "Because awareness supports change, our primary intervention is not advice but "
         "noticing. Because the present is central, we ask how the past is alive in the "
         "room today. Organismic self-regulation is the assumption that people naturally "
         "orient towards their needs — difficulties arise when awareness is restricted, "
         "needs are repeatedly ignored, or contact with the environment becomes limited. "
         "The final assumption is the one that most needs careful handling: personal "
         "responsibility supports choice, but it must never be used to disregard genuine "
         "external constraints.")

# ============================================================ 7 · AWARENESS & HERE-AND-NOW
s = frame(prs, "Section 5.1", "Awareness and the Here-and-Now", 7,
          cite="(Joyce & Sills, 2014)")
panel(s, ML, 1.95, 5.62, 2.05, "Awareness is noticing", [
    "Thoughts and emotions",
    "Bodily sensations and actions",
    "Needs and immediate surroundings",
    "…rather than responding automatically or avoiding discomfort",
])
panel(s, ML + 5.82, 1.95, CW - 5.82, 2.05, "The here-and-now principle", [
    "Attention to what the client experiences during the session",
    "The past is not ignored",
    "The past is explored through how it is expressed in the present",
], label_color=ACCENT)
rect(s, ML, 4.20, CW, 1.35, fill=INK)
tb(s, ML + 0.35, 4.40, CW - 0.7, 1.0,
   [dict(t="IN THE ROOM", s=10.5, c=ACCENT, b=True, f=HFONT),
    dict(t="A client discussing conflict with a parent begins speaking quietly, "
            "clenching their hands, looking away.  The counsellor asks:  "
            "“What are you noticing in yourself as you talk about this?”",
         s=13.5, c=WHITE, sb=7, ls=1.12)], space_after=0)
tb(s, ML, 5.78, CW, 0.6,
   [dict(t="Why it matters: deliberate change becomes difficult when a person does not "
           "recognise the patterns influencing their behaviour. The counsellor "
           "facilitates awareness without assuming they know its meaning.",
         s=12.5, c=TEAL, i=True, ls=1.12)])
notes(s, "Awareness is the central concept of the whole approach — every other concept "
         "serves it. The question we ask is not a content question but a process "
         "question. Instead of 'tell me more about your parent', we ask 'what are you "
         "noticing in yourself as you talk about this?' That shifts the client from "
         "recounting events to exploring immediate experience. The reason this matters "
         "is practical: deliberate change becomes far more difficult when a person does "
         "not recognise the pattern influencing their behaviour. And there is an "
         "important discipline for the counsellor here — we facilitate awareness without "
         "assuming we already know what the client's experience means.")

# ============================================================ 8 · FIGURE AND GROUND
s = frame(prs, "Section 5.2", "Figure and Ground", 8)
tb(s, ML, 1.90, CW, 0.5,
   [dict(t="One aspect of experience becomes prominent against a broader background of "
           "other experiences and circumstances.", s=13.5, c=INK, ls=1.12)])
rect(s, ML, 2.55, 5.62, 1.85, fill=INK)
tb(s, ML + 0.32, 2.78, 5.0, 1.45,
   [dict(t="FIGURE", s=12, c=ACCENT, b=True, f=HFONT),
    dict(t="What attracts attention at this particular moment", s=14, c=WHITE, b=True, sb=4),
    dict(t="A student fixated on the possibility of failing an examination.",
         s=11.5, c=RGBColor(0xA8, 0xC4, 0xCE), i=True, sb=8, ls=1.1)], space_after=0)
rect(s, ML + 5.82, 2.55, CW - 5.82, 1.85, fill=LIGHT, line=RULE)
tb(s, ML + 6.14, 2.78, CW - 6.44, 1.45,
   [dict(t="GROUND", s=12, c=TEAL, b=True, f=HFONT),
    dict(t="The surrounding experiences and circumstances", s=14, c=INK, b=True, sb=4),
    dict(t="Exhaustion · family expectations · financial concerns · fear of "
            "disappointing others.", s=11.5, c=MUTED, i=True, sb=8, ls=1.1)], space_after=0)
panel(s, ML, 4.55, CW, 1.75, "What follows from this", [
    "What becomes the figure changes as needs and circumstances change",
    "Exploring the ground may reveal the broader meaning of the anxiety",
    "Explains why the same situation is experienced differently by different people",
    "In session, the therapist asks what feels most pressing — and what remains unnoticed",
], avail_bottom=6.72, size=12)
notes(s, "Figure and ground is borrowed from Gestalt psychology and it is a genuinely "
         "useful clinical tool. The figure is what has captured attention; the ground is "
         "everything else in the field. In the example, the examination failure is the "
         "figure, but exhaustion, family expectations, financial pressure and fear of "
         "disappointing others form the ground. Exploring that ground often changes the "
         "meaning of the anxiety completely — it may not be an examination problem at "
         "all. The key clinical move is noticing that the figure is not fixed: as needs "
         "and circumstances shift, so does what steps forward. This also explains why "
         "two clients in the same situation can experience it very differently.")

# ============================================================ 9 · CONTACT AND CONTACT BOUNDARIES
s = frame(prs, "Section 5.3", "Contact and Contact Boundaries", 9,
          cite="(Perls et al., 1951)")
panel(s, ML, 1.95, 5.62, 2.55, "Contact", [
    "The process of engaging with oneself, others and the environment",
    "Recognising and responding to experience",
    "…while remaining aware of the distinction between self and world",
    "Involves engaging, responding and withdrawing",
])
panel(s, ML + 5.82, 1.95, CW - 5.82, 2.55, "Contact boundaries", [
    "The points at which self and environment are experienced and negotiated",
    "Not simply physical barriers",
    "How people distinguish their own feelings, needs, beliefs and responsibilities from those of others",
], label_color=ACCENT)
rect(s, ML, 4.72, CW, 0.62, fill=LIGHT, line=RULE)
tb(s, ML, 4.72, CW, 0.62,
   [dict(t="SELF   ↔   CONTACT BOUNDARY   ↔   ENVIRONMENT", s=14, c=TEAL, b=True,
         a=PP_ALIGN.CENTER, f=HFONT)], anchor=MSO_ANCHOR.MIDDLE, space_after=0)
tb(s, ML, 5.55, CW, 0.9,
   [dict(t="Example: a person may value their family's opinions while recognising their "
           "own preferences and their right to decide. Difficulty arises when they "
           "consistently suppress their needs to avoid disagreement, or can no longer "
           "separate their own wishes from others' expectations. Gestalt Therapy examines "
           "how clients make contact, withdraw, express themselves — and the habitual "
           "patterns that interrupt contact.",
         s=12, c=MUTED, ls=1.12)])
notes(s, "Contact is the concept that makes Gestalt relational rather than purely "
         "intrapsychic. Healthy contact means engaging fully with what is needed while "
         "still knowing where you end and the other begins. The contact boundary is "
         "where that negotiation happens — and it is psychological, not physical. "
         "The family example is the clearest illustration: valuing your family's opinion "
         "is healthy contact; consistently suppressing your own needs to avoid "
         "disagreement, until you can no longer tell your wishes from theirs, is a "
         "boundary difficulty. In session we look at how the client makes contact, how "
         "they withdraw, how they express themselves, and which habitual patterns keep "
         "interrupting the process. Those interruptions are what the next section names.")

# ============================================================ 10 · UNFINISHED BUSINESS + SELF-REGULATION
s = frame(prs, "Sections 5.4 & 5.5", "Unfinished Business and Organismic Self-Regulation", 10,
          cite="(Joyce & Sills, 2014)")
panel(s, ML, 1.95, 5.62, 4.05, "5.4  Unfinished business", [
    "Unresolved emotional experience that stays active in the present: grief, anger, guilt, resentment, disappointment, regret",
    "Example — repeated criticism from a parent leaves an adult feeling inadequate whenever a supervisor offers feedback",
    "The original events are past; their emotional effects are not",
    "The aim is not to change the past, force forgiveness or require reconciliation",
    "The aim is to understand the continuing impact and gain freedom in responding",
])
panel(s, ML + 5.82, 1.95, CW - 5.82, 4.05, "5.5  Organismic self-regulation", [
    "How people become aware of needs and respond to changing internal and external conditions",
    "Needs include rest, safety, connection, emotional expression, autonomy and achievement",
    "Example — continual work without rest produces exhaustion and irritability; fatigue read as a signal can reset priorities and boundaries",
    "Limits: needs cannot always be met independently, and awareness alone does not resolve every problem",
    "Relationships, responsibilities, culture and material circumstances shape what is possible",
], label_color=ACCENT)
notes(s, "These two concepts belong together. Unfinished business is about the past "
         "that has not been closed — grief, anger, guilt, resentment, disappointment or "
         "regret that continues to shape present experience. The adult criticised "
         "repeatedly by a parent who now feels inadequate at any supervisor feedback is "
         "the classic presentation. Note carefully what our paper says the aim is NOT: "
         "we are not trying to change the past, force forgiveness, or push the client "
         "towards reconciliation. The aim is understanding the continuing impact and "
         "developing greater freedom of response. Organismic self-regulation is the "
         "complementary idea — that people naturally orient towards their needs, and "
         "symptoms like exhaustion are signals worth reading. But we must hold the "
         "limit honestly: awareness alone does not resolve every problem, and material "
         "circumstances constrain what is possible.")

# ============================================================ 11 · CYCLE OF EXPERIENCE
s = frame(prs, "Section 5.6", "The Cycle of Experience", 11,
          cite="(Woldt & Toman, 2005)",
          kicker="A framework for tracing how a need moves from initial signal to satisfaction and withdrawal.")
stages = ["Sensation", "Awareness", "Mobilisation", "Action", "Contact", "Satisfaction",
          "Withdrawal"]
subs = ["an internal or external signal", "recognising what it may mean",
        "energy and intention develop", "steps are taken to respond",
        "engaging with what is needed", "the need is met, at least partly",
        "attention shifts to other needs"]
n = len(stages)
gap = 0.12
cwS = (CW - gap * (n - 1)) / n
for i, (st, su) in enumerate(zip(stages, subs)):
    x = ML + i * (cwS + gap)
    rect(s, x, 2.35, cwS, 2.05, fill=INK if i % 2 == 0 else RGBColor(0x24, 0x4C, 0x60),
         radius=0.08, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tb(s, x + 0.10, 2.55, cwS - 0.20, 1.7,
       [dict(t=f"{i+1:02d}", s=13, c=ACCENT, b=True, f=HFONT, a=PP_ALIGN.CENTER),
        dict(t=st, s=13, c=WHITE, b=True, a=PP_ALIGN.CENTER, sb=4, ls=0.95),
        dict(t=su, s=9.5, c=RGBColor(0xA8, 0xC4, 0xCE), a=PP_ALIGN.CENTER, sb=5, ls=1.05)],
       align=PP_ALIGN.CENTER, space_after=0)
    if i < n - 1:
        tb(s, x + cwS - 0.02, 3.15, gap + 0.04, 0.3,
           [dict(t="›", s=16, c=ACCENT, b=True, a=PP_ALIGN.CENTER)], space_after=0)
panel(s, ML, 4.62, CW, 1.75, "How to use it — and how not to", [
    "Worked example: an employee notices exhaustion → acknowledges the need for rest → considers options → asks for a break → takes it → returns to work",
    "It is not a rigid sequence every person follows identically; writers describe the stages differently",
    "It is a way of locating where difficulty arises — e.g. recognising a need but avoiding action through fear",
], label_color=ACCENT)
notes(s, "The cycle of experience gives us a map for tracking a need from first signal "
         "to completion. The worked example makes it concrete: an employee notices "
         "exhaustion, acknowledges the need for rest, considers options, communicates "
         "the need, takes the break, returns to work, and attention then shifts "
         "elsewhere. The clinical value is diagnostic: it lets you locate exactly where "
         "the process is breaking down. A client may recognise the need clearly but "
         "cannot mobilise because of fear. Another may act compulsively without ever "
         "having understood the need. Be careful, though — our paper is explicit that "
         "this is not a rigid sequence, and different Gestalt writers describe the "
         "stages somewhat differently. Use it as an exploratory framework, not a "
         "checklist.")

# ============================================================ 12 · PERSONAL RESPONSIBILITY
s = frame(prs, "Section 5.7", "Personal Responsibility and Choice", 12,
          cite="(Brownell, 2010)")
panel(s, ML, 1.95, 5.62, 1.85, "What it involves", [
    "Recognising one's feelings, actions, needs and available choices",
    "Identifying where agency can actually be exercised",
    "Moving away from a sense of being entirely powerless",
], avail_bottom=3.98, size=12)
rect(s, ML + 5.82, 1.95, CW - 5.82, 1.85, fill=INK)
tb(s, ML + 6.14, 2.18, CW - 6.44, 1.45,
   [dict(t="RESPONSIBILITY  ≠  BLAME", s=13, c=ACCENT, b=True, f=HFONT),
    dict(t="Responsibility must never suggest that clients cause every difficulty they "
            "experience.", s=12.5, c=WHITE, sb=6, ls=1.12)], space_after=0)
rect(s, ML, 4.05, 5.62, 1.15, fill=LIGHT, line=RULE)
rect(s, ML, 4.05, 0.05, 1.15, fill=RGBColor(0xB0, 0x4A, 0x3A))
tb(s, ML + 0.28, 4.25, 5.1, 0.8,
   [dict(t="BEFORE", s=10, c=RGBColor(0xB0, 0x4A, 0x3A), b=True, f=HFONT),
    dict(t="“Everyone makes me stay late at work.”", s=13, c=INK, i=True, sb=4)],
   space_after=0)
rect(s, ML + 5.82, 4.05, CW - 5.82, 1.15, fill=LIGHT, line=RULE)
rect(s, ML + 5.82, 4.05, 0.05, 1.15, fill=TEAL)
tb(s, ML + 6.10, 4.25, CW - 6.38, 0.8,
   [dict(t="AFTER", s=10, c=TEAL, b=True, f=HFONT),
    dict(t="“I find it difficult to refuse extra work because I fear being judged.”",
         s=13, c=INK, i=True, sb=4)], space_after=0)
tb(s, ML, 5.45, CW, 1.0,
   [dict(t="The second statement identifies an internal response that can be explored "
           "alongside the actual workplace conditions. The aim is to expand awareness "
           "and choice while acknowledging genuine limitations, unequal power "
           "relationships and external pressures.",
         s=12.5, c=MUTED, ls=1.12)])
notes(s, "Personal responsibility is the concept most easily misused in Gestalt "
         "Therapy, so handle it with care. It means recognising your own feelings, "
         "actions, needs and available choices — identifying where agency can actually "
         "be exercised. The language shift shows the clinical move: 'everyone makes me "
         "stay late' locates the cause entirely outside; 'I find it difficult to refuse "
         "because I fear being judged' identifies an internal response that can be "
         "worked with. Crucially, that does not deny the workplace conditions — the two "
         "are explored together. The aim is to expand awareness and choice while "
         "acknowledging genuine limitations, unequal power relationships and external "
         "pressures. Never use responsibility to suggest a client caused their own "
         "difficulty.")

# ============================================================ 13 · DISTURBANCES OVERVIEW
s = frame(prs, "Section 6", "Contact Boundary Disturbances", 13,
          cite="(Perls et al., 1951; Woldt & Toman, 2005)",
          kicker="Also described as interruptions to contact, or resistances to contact.")
five = [
    ("Introjection", "Accepting an external rule without examining it"),
    ("Projection", "Attributing one's own experience to another"),
    ("Retroflection", "Turning an outward response inward"),
    ("Deflection", "Avoiding direct contact with an experience"),
    ("Confluence", "Difficulty distinguishing self from others"),
]
cwF = (CW - 0.5) / 5
for i, (t, d) in enumerate(five):
    x = ML + i * (cwF + 0.125)
    chip(s, x, 2.42, cwF, 1.45, f"{i+1:02d}", t, d, size=12.5)
panel(s, ML, 4.05, 5.62, 2.20, "How these should be held", [
    "They are not diagnoses or permanent personality characteristics",
    "They may develop as ways of coping with difficult relationships",
    "They can serve a genuine protective function",
    "Significance depends on context, flexibility, and whether they repeatedly restrict awareness or choice",
], avail_bottom=6.72, floor=10)
panel(s, ML + 5.82, 4.05, CW - 5.82, 2.20, "Why they matter clinically", [
    "They tell us where awareness, contact, or the self–environment relationship is restricted",
    "They generate questions and interventions rather than labels",
    "They can overlap in one client at one time",
    "Best used as exploratory frameworks, never fixed labels",
], label_color=ACCENT, avail_bottom=6.72, floor=10)
notes(s, "This is the most practically important section of our paper. Contact boundary "
         "disturbances are the patterns through which awareness, contact, or the "
         "relationship between self and environment becomes restricted. Gestalt "
         "literature also calls them interruptions to contact or resistances to contact, "
         "and terminology varies between authors — so do not be confused if a text names "
         "them differently. Two cautions before we go through each one. First, these are "
         "not diagnoses and not permanent personality traits. They often develop as "
         "coping strategies for difficult relationships and can be genuinely protective. "
         "Second, their significance depends entirely on context and flexibility — the "
         "question is whether the pattern repeatedly restricts the person's awareness or "
         "available choices. For the next five slides we use a consistent structure: "
         "definition, everyday example, counselling example, effect on contact, and the "
         "counsellor's approach.")

# ============================================================ 14–18 · THE FIVE DISTURBANCES
def disturbance_slide(prs, page, num, name, tagline, definition, everyday,
                      counselling, effect, approach, distinction):
    s = frame(prs, f"Section 6.{num}", f"{name}", page)
    tb(s, ML, 1.88, CW, 0.3,
       [dict(t=tagline.upper(), s=11.5, c=ACCENT, b=True, f=HFONT)])
    rect(s, ML, 2.24, CW, 0.92, fill=LIGHT, line=RULE)
    rect(s, ML, 2.24, 0.05, 0.92, fill=TEAL)
    tb(s, ML + 0.28, 2.40, CW - 0.56, 0.68,
       [dict(t="DEFINITION", s=9.5, c=TEAL, b=True, f=HFONT),
        dict(t=definition, s=12.5, c=INK, sb=3, ls=1.1)], space_after=0)
    hw = (CW - 0.24) / 2
    panel(s, ML, 3.32, hw, 1.42, "Everyday example", [everyday], size=11.5,
          avail_bottom=4.78, floor=9.5)
    panel(s, ML + hw + 0.24, 3.32, hw, 1.42, "In counselling", [counselling],
          size=11.5, label_color=ACCENT, avail_bottom=4.78, floor=9.5)
    panel(s, ML, 4.86, hw, 1.55, "Possible effect on contact", [effect], size=11.5,
          avail_bottom=6.45, floor=9.5)
    panel(s, ML + hw + 0.24, 4.86, hw, 1.55, "The counsellor's approach", [approach],
          size=11.5, label_color=ACCENT, avail_bottom=6.45, floor=9.5)
    # shrink until the distinction fits on a single line
    ds = 10.5
    room = CW - 0.48
    while ds > 9.0 and (width_in("KEY DISTINCTION   ", ds, True)
                        + width_in(distinction, ds, True)) > room:
        ds -= 0.25
    rect(s, ML, 6.53, CW, 0.28, fill=INK)
    tb(s, ML + 0.24, 6.53, room, 0.28,
       [dict(runs=[("KEY DISTINCTION   ", 9, ACCENT, True, False, HFONT),
                   (distinction, ds, WHITE, False, True, BFONT)])],
       anchor=MSO_ANCHOR.MIDDLE)
    return s


s = disturbance_slide(
    prs, 14, 1, "Introjection", "Accepting beliefs without examining them",
    "Taking in rules, beliefs, values or expectations from others without adequately "
    "examining whether they fit one's own experience. An external expectation becomes "
    "an unquestioned internal rule.",
    "A person grows up hearing that a good child must always obey their parents, and as "
    "an adult follows family decisions even with legitimate concerns, because "
    "disagreement feels like disrespect.",
    "An employee believes “a responsible person must never say no to the supervisor” and "
    "accepts every additional duty even when exhausted — the belief is followed "
    "automatically, never examined against workload, health or fairness.",
    "External expectations dominate awareness, so the person struggles to recognise "
    "their own needs, and may feel guilt or anxiety when considering an alternative.",
    "“Where did you learn that a responsible person must never say no?” · “Does this "
    "rule apply in every situation?” · “What happens when you consider your own needs?” "
    "— examine the belief rather than simply reject it.",
    "Introjection concerns accepting an external belief or rule without sufficient examination.")
notes(s, "Introjection is swallowing a rule whole. The person has taken in an external "
         "expectation and it now operates as an unquestioned internal law. The everyday "
         "example and the counselling example are the same pattern at different scales. "
         "The clinical work is not to attack the belief — that would just create "
         "resistance — but to help the client examine where it came from and whether it "
         "actually fits their circumstances. Notice the counsellor's questions: they "
         "invite examination rather than rejection. The effect on contact is that "
         "external expectations crowd out the person's own needs from awareness "
         "altogether, and guilt appears the moment an alternative is even considered.")

s = disturbance_slide(
    prs, 15, 2, "Projection", "Attributing one's own experience to others",
    "Attributing feelings, intentions or characteristics to someone else without "
    "adequately recognising one's own possible contribution. A feeling that is difficult "
    "to acknowledge in oneself is perceived as belonging to another.",
    "A person who feels jealous of a friend's success repeatedly claims that the friend "
    "is jealous of them — unaware of, or uncomfortable acknowledging, their own feeling.",
    "A client feels anger towards a colleague but cannot acknowledge it, saying "
    "repeatedly “my colleague hates me and is always looking for a fight”, although the "
    "available evidence is unclear.",
    "The client responds to assumptions about another person rather than checking what "
    "is actually happening, which can produce misunderstanding, defensiveness or "
    "escalating conflict.",
    "“What feelings arise in you when you describe your colleague?” · “What have you "
    "observed directly, and what are you assuming?” · “Is there anything about your own "
    "feelings that is difficult to acknowledge?”",
    "Projection attributes one's own possible feelings to another — but the counsellor "
    "must not assume the client's perception is inaccurate.")
notes(s, "Projection is disowning a feeling by placing it outside. The important "
         "safeguard in our paper is the last line on this slide: we must NOT assume the "
         "client's perception is inaccurate. Other people genuinely do behave in harmful "
         "or hostile ways, and a counsellor who reflexively treats every perception as "
         "projection will invalidate a client who is actually being mistreated. The "
         "clinical move is therefore investigative rather than corrective — separate "
         "what was directly observed from what is being assumed, and gently ask whether "
         "any part of the feeling is difficult for the client to own. If evidence of "
         "actual hostile behaviour emerges, we work with that reality instead.")

s = disturbance_slide(
    prs, 16, 3, "Retroflection", "Turning an outward response inward",
    "Directing towards oneself feelings, actions or energy that might otherwise be "
    "expressed towards another person or directed into the environment.",
    "A person treated unfairly feels anger but expresses nothing; instead they "
    "repeatedly criticise themselves for being weak or for allowing it to happen.",
    "A worker given an unreasonable workload by a supervisor does not raise the concern "
    "for fear of consequences, and says “I am weak — I should be able to manage "
    "everything”, becoming increasingly self-critical.",
    "Direct expression is inhibited, internal tension builds, understandable frustration "
    "turns into self-blame, and the original concern stays unresolved.",
    "“What would you want to say to your supervisor if you felt safe to express "
    "yourself?” · “What happens inside you when you hold back?” · “How could you "
    "communicate this in a way appropriate to your circumstances?”",
    "Retroflection directs inward what might be expressed outward — but not all "
    "restraint is unhealthy.")
notes(s, "Retroflection is doing to yourself what you wanted to do to someone else. The "
         "anger that cannot be safely expressed outward turns inward and becomes "
         "self-criticism. The worker who says 'I am weak, I should manage everything' is "
         "retroflecting perfectly legitimate frustration about an unreasonable workload. "
         "The therapeutic questions move in two directions: first into the withheld "
         "expression — what would you say if you felt safe? — and then towards a "
         "realistic, safe way of actually communicating it. Hold the caveat carefully: "
         "not all restraint is unhealthy. Sometimes withholding a response is necessary "
         "for physical safety, professional judgement, or effective communication, and "
         "we should not pathologise that.")

s = disturbance_slide(
    prs, 17, 4, "Deflection", "Avoiding direct contact with an experience",
    "Reducing the intensity or directness of contact with an emotion, person or issue "
    "through distraction, humour, vague language, changing the subject, or other forms "
    "of avoidance.",
    "Whenever a difficult family issue arises, a person makes jokes or quickly "
    "introduces another topic to stop the conversation becoming emotionally "
    "uncomfortable.",
    "A client begins discussing the death of a close relative, immediately jokes and "
    "changes the subject. Each time the counsellor gently returns to the loss, the "
    "client laughs, gives brief answers, or turns to unrelated matters.",
    "The person cannot stay with painful feelings long enough to understand or "
    "communicate them, so the emotional issue remains unexplored.",
    "“I noticed you laughed just as you mentioned the loss. What are you experiencing "
    "right now?” · “What happens for you when we stay with this a little longer?” — "
    "increase awareness gently; never force disclosure.",
    "Deflection concerns how direct contact is avoided or diluted — often through "
    "distraction or a change in communication.")
notes(s, "Deflection is the pattern you are most likely to notice behaviourally in a "
         "session: the joke at exactly the wrong moment, the sudden topic change, the "
         "vague abstraction, the intellectualising. In the example, the laughter arrives "
         "precisely as the loss is named. Two disciplines apply. First, further "
         "exploration is needed before concluding anything — laughter may be deflection, "
         "or it may be something else. Second, the aim is to increase awareness gently, "
         "not to force disclosure and not to strip away a coping strategy before the "
         "client is ready. This person may be protecting themselves from emotional "
         "overwhelm and may need time and safety before going near the grief.")

s = disturbance_slide(
    prs, 18, 5, "Confluence", "Difficulty distinguishing self from others",
    "The distinction between a person's own feelings, needs, beliefs or preferences and "
    "those of another becomes unclear. Agreement or togetherness is experienced as "
    "necessary for maintaining the relationship.",
    "A person consistently agrees with friends about activities and decisions because "
    "expressing a different preference feels as though it might threaten the friendship.",
    "A woman agrees with her partner on major decisions even when she privately "
    "disagrees. Asked what she wants, she answers “whatever makes him happy is what I "
    "want” — she values cooperation, but cannot identify her own preferences separately.",
    "Personal needs are lost sight of, resentment builds, independent decision-making "
    "becomes difficult, and a relationship may look harmonious while important "
    "differences stay unexpressed.",
    "“If your partner's preference were not part of the decision, what would you want?” "
    "· “How do you experience disagreement in this relationship?” · “Can you remain "
    "connected to someone while holding a different opinion?”",
    "Confluence is a blurred self/other distinction — not merely accepting a rule or "
    "avoiding a painful topic.")
notes(s, "Confluence is the blurring of the boundary between self and other. It is easy "
         "to mistake for a pleasant temperament — this client is agreeable, cooperative, "
         "easy to live with. The clinical question is whether she can locate her own "
         "preference at all when the other person's is removed from the frame. The "
         "hidden cost is resentment and the loss of independent decision-making; the "
         "relationship looks harmonious while significant differences never surface. "
         "The last counsellor question is the crucial one, because it names the client's "
         "underlying fear: can you stay connected to someone AND hold a different "
         "opinion? If the answer is no, that is where the work is. Distinguish this from "
         "introjection — confluence is a blurred self/other boundary, not the acceptance "
         "of a particular rule.")

# ============================================================ 19 · COMPARISON + CLINICAL SIGNIFICANCE
s = frame(prs, "Sections 6.6 & 6.7", "Comparing the Five — and Using Them Well", 19,
          cite="(Brownell, 2010; Wheeler & Axelsson, 2015)")
rows = [
    ("Introjection", "Accepting an external rule without examining it",
     "“I must never disappoint anyone.”"),
    ("Projection", "Attributing one's own possible feelings to another",
     "“Everyone here is hostile towards me.”"),
    ("Retroflection", "Directing inward what might be expressed outward",
     "“I am angry, so I must be a terrible person.”"),
    ("Deflection", "Avoiding direct engagement with an experience",
     "Joking whenever painful feelings arise"),
    ("Confluence", "Losing clarity about one's own position relative to another",
     "“Whatever you want is what I want.”"),
]
c1, c2, c3 = 2.55, 5.15, CW - 2.55 - 5.15
x2, x3 = ML + c1, ML + c1 + c2
rect(s, ML, 1.95, CW, 0.42, fill=INK)
for (x, w, h_) in [(ML, c1, "DISTURBANCE"), (x2, c2, "MAIN PATTERN"),
                   (x3, c3, "ILLUSTRATIVE STATEMENT")]:
    tb(s, x + 0.18, 1.95, w - 0.36, 0.42,
       [dict(t=h_, s=9.5, c=ACCENT, b=True, f=HFONT)],
       anchor=MSO_ANCHOR.MIDDLE, space_after=0)
for i, (a, b, c) in enumerate(rows):
    y = 2.37 + i * 0.44
    rect(s, ML, y, CW, 0.44, fill=LIGHT if i % 2 == 0 else WHITE, line=RULE, lw=0.5)
    tb(s, ML + 0.18, y, c1 - 0.36, 0.44,
       [dict(t=a, s=11.5, c=INK, b=True)], anchor=MSO_ANCHOR.MIDDLE, space_after=0)
    tb(s, x2 + 0.18, y, c2 - 0.36, 0.44,
       [dict(t=b, s=11, c=MUTED)], anchor=MSO_ANCHOR.MIDDLE, space_after=0)
    tb(s, x3 + 0.18, y, c3 - 0.36, 0.44,
       [dict(t=c, s=11, c=TEAL, i=True)], anchor=MSO_ANCHOR.MIDDLE, space_after=0)
panel(s, ML, 4.68, CW, 1.77, "Using them well", [
    "The patterns overlap: one employee may introject a rule, retroflect the anger as self-criticism and deflect frustration with jokes",
    "The counsellor observes patterns collaboratively and explores the function they serve — never simply telling the client to stop",
    "Environment must be read: an employee may genuinely fear retaliation, so urging assertiveness without weighing that risk is inadequate",
], size=11.5, avail_bottom=6.45)
notes(s, "This table is worth having in front of you in supervision. The five patterns "
         "are distinguishable, but they overlap constantly — one employee can introject "
         "a rule, retroflect the resulting anger as self-criticism, and deflect the "
         "frustration with jokes, all in the same week. That is exactly why we use them "
         "as exploratory frameworks rather than fixed labels. Clinically, the counsellor "
         "observes patterns collaboratively and explores the function they serve; we do "
         "not simply instruct the client to stop a behaviour. And the environmental "
         "point is non-negotiable: an employee may have a genuine reason to fear "
         "retaliation for refusing extra work, so encouraging assertiveness without "
         "weighing that risk would be inadequate practice. The goal is never to remove "
         "every interruption to contact — it is to widen awareness and the client's "
         "capacity to choose.")

# ============================================================ 20 · GOALS & ROLE
s = frame(prs, "Section 7", "Goals of Therapy and the Role of the Counsellor", 20,
          cite="(Joyce & Sills, 2014)")
panel(s, ML, 1.95, 5.62, 2.35, "Therapeutic goals", [
    "Increase awareness so clients respond more consciously and flexibly",
    "Recognise unresolved emotions",
    "Improve contact with oneself and with others",
    "Integrate conflicting aspects of experience",
    "Strengthen personal responsibility",
])
panel(s, ML + 5.82, 1.95, CW - 5.82, 2.35, "How the counsellor works", [
    "A collaborative relationship, not advice-giving",
    "Does not explain the client to themselves",
    "Attends to words, tone, posture, facial expression, pauses and emotional response",
], label_color=ACCENT)
rect(s, ML, 4.52, CW, 1.15, fill=INK)
tb(s, ML + 0.32, 4.70, CW - 0.64, 0.85,
   [dict(t="IN THE ROOM", s=10, c=ACCENT, b=True, f=HFONT),
    dict(t="The client says “I am fine” while visibly trembling.   →   “You are saying "
            "that you are fine, and I notice your hands are trembling. What are you "
            "noticing right now?”", s=12.5, c=WHITE, sb=5, ls=1.1)], space_after=0)
tb(s, ML, 5.88, CW, 0.55,
   [dict(t="Ethical boundary: remain sensitive to culture, readiness, trauma history, "
           "personal boundaries and the client's right to decline an exercise. "
           "Experiential interventions are introduced collaboratively, only when "
           "appropriate.", s=12, c=TEAL, i=True, ls=1.1)])
notes(s, "The main goal is awareness — everything else follows from it. The counsellor's "
         "method is distinctive: we do not immediately give advice, and we do not "
         "explain clients to themselves. Instead we track words, tone of voice, posture, "
         "facial expression, pauses and emotional response, because incongruence between "
         "channel and content is where the material is. The 'I am fine' example is the "
         "model intervention — we name the observed discrepancy and invite exploration "
         "without claiming to know what it means. Then the ethical boundary, which is "
         "not optional: the counsellor must stay sensitive to culture, readiness, trauma "
         "history and personal boundaries, and the client retains an absolute right to "
         "decline any exercise. Experiential interventions are introduced "
         "collaboratively and used only when appropriate. Our role is to facilitate "
         "exploration, not to control the client's experience.")

# ============================================================ 21 · TECHNIQUES
s = frame(prs, "Section 8", "Therapeutic Techniques", 21,
          cite="(Wagner-Moore, 2004)")
techs = [
    ("8.1", "Awareness exercises",
     "Notice present thoughts, feelings, sensations and behaviour — e.g. an anxious "
     "client tracks breathing, posture and thoughts, and finds anxiety rises when "
     "imagining disappointing family."),
    ("8.2", "Empty chair",
     "An absent person, a relationship or a part of the self is represented by an empty "
     "chair. It explores feelings and meanings; it does not establish what the absent "
     "person would actually have said."),
    ("8.3", "Two-chair dialogue",
     "Two conflicting internal positions are voiced in turn — “I must work harder or I "
     "will fail” against “I am exhausted and need support.” Research has examined its "
     "use for internal conflict and unfinished business."),
    ("8.4", "Staying with a feeling",
     "Gently remain aware of an emotion rather than distracting from it. The client "
     "remains free to slow down or stop if it becomes overwhelming."),
    ("8.5", "Body awareness & exaggeration",
     "Explore tension in shoulders, a clenched jaw, shallow breathing; gently amplify a "
     "gesture to explore its meaning. Used cautiously and collaboratively — never to "
     "force an interpretation."),
    ("8.6", "Language & first-person statements",
     "“You make me feel worthless” becomes “I feel worthless when I interpret your "
     "criticism as evidence I have failed.” This distinguishes feeling and "
     "interpretation from another's action."),
]
cwT, chT = (CW - 0.44) / 3, 2.16
for i, (n, t, d) in enumerate(techs):
    x = ML + (i % 3) * (cwT + 0.22)
    y = 1.95 + (i // 3) * (chT + 0.20)
    rect(s, x, y, cwT, chT, fill=LIGHT, line=RULE)
    rect(s, x, y, cwT, 0.05, fill=TEAL)
    tb(s, x + 0.22, y + 0.20, cwT - 0.44, chT - 0.38,
       [dict(t=n, s=11, c=ACCENT, b=True, f=HFONT),
        dict(t=t, s=13.5, c=INK, b=True, sb=1),
        dict(t=d, s=10.5, c=MUTED, sb=4, ls=1.08)], space_after=0)
tb(s, ML, 6.42, CW, 0.35,
   [dict(t="Language work does not imply that others' behaviour is harmless, or that a "
           "client is responsible for being mistreated.", s=11, c=TEAL, i=True)])
notes(s, "Six techniques, each with a specific purpose. Awareness exercises are the "
         "foundation — everything else builds on the capacity to notice. The empty chair "
         "brings an absent person, relationship or part of the self into the present; be "
         "clear with clients about its limits, because it does not establish what the "
         "absent person would actually have said. The two-chair dialogue works on "
         "internal conflict — there is research on experiential two-chair interventions "
         "for particular forms of internal conflict and unfinished business, though "
         "findings should not be generalised to every client or problem. Staying with a "
         "feeling requires the client's freedom to slow down or stop. Body awareness and "
         "exaggeration must be used collaboratively — never to force an interpretation or "
         "assume a bodily response has one universal meaning. And language work: note "
         "the safeguard at the bottom of this slide. Distinguishing feeling from another "
         "person's action does not make that person's behaviour harmless, and it does not "
         "make a client responsible for being mistreated.")

# ============================================================ 22 · CASE 1
s = frame(prs, "Section 9.1–9.2", "Case Application — Amina", 22,
          kicker="A 32-year-old administrative officer, overwhelmed by her workload.")
rect(s, ML, 2.28, 3.85, 1.62, fill=INK, radius=0.05, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tb(s, ML + 0.26, 2.50, 3.35, 1.2,
   [dict(t="CLIENT", s=10, c=ACCENT, b=True, f=HFONT),
    dict(t="Amina, 32", s=17, c=WHITE, b=True, sb=4),
    dict(t="Administrative officer", s=11.5, c=RGBColor(0xA8, 0xC4, 0xCE), sb=2)],
   space_after=0)
panel(s, ML + 4.05, 2.28, CW - 4.05, 1.62, "Presenting problem", [
    "Supervisor frequently assigns additional duties; Amina usually accepts, even without time",
    "Fears refusing will make her appear irresponsible or uncooperative",
    "Muscle tension, difficulty sleeping, frustration she rarely expresses",
    "Laughs and changes the subject when discussing anger; self-critical about feeling tired",
], size=11, avail_bottom=4.02, floor=9.5)
rect(s, ML, 4.08, CW, 0.42, fill=LIGHT, line=RULE)
tb(s, ML + 0.22, 4.08, CW - 0.44, 0.42,
   [dict(t="“A good employee should never disappoint the people who depend on her.”",
         s=13, c=INK, i=True, b=True, a=PP_ALIGN.CENTER)],
   anchor=MSO_ANCHOR.MIDDLE, space_after=0)
form = [
    ("Awareness / here-and-now", "Explore what she experiences when talking about her "
     "supervisor — bodily tension, anxiety, anger, self-critical thoughts."),
    ("Introjection", "“A good employee should never disappoint others” may be an "
     "internalised, unexamined rule. Where did it originate? Does it allow reasonable limits?"),
    ("Retroflection", "Instead of expressing frustration, she directs it inward as "
     "self-criticism."),
    ("Deflection", "Laughter and rapid topic changes when discussing anger — explored "
     "tentatively, not assumed to be avoidance."),
    ("Organismic self-regulation", "Fatigue and tension may signal that her needs for "
     "rest and manageable demands are not being met."),
    ("Field theory", "Workplace expectations, power differences, job security, "
     "organisational culture and the practical cost of refusing must all be explored."),
]
cwC = (CW - 0.44) / 3
for i, (t, d) in enumerate(form):
    x = ML + (i % 3) * (cwC + 0.22)
    y = 4.66 + (i // 3) * 0.90
    rect(s, x, y, cwC, 0.80, fill=WHITE, line=RULE)
    rect(s, x, y, 0.04, 0.80, fill=ACCENT)
    tb(s, x + 0.20, y + 0.10, cwC - 0.40, 0.62,
       [dict(t=t, s=11, c=TEAL, b=True, f=HFONT),
        dict(t=d, s=9.5, c=MUTED, sb=2, ls=1.05)], space_after=0)
notes(s, "Let us apply the theory. Amina is a 32-year-old administrative officer who "
         "comes in feeling overwhelmed by her workload. Her supervisor frequently "
         "assigns additional duties and she usually accepts, even without sufficient "
         "time, because she fears refusing will make her look irresponsible. Her "
         "organising belief is on screen: 'a good employee should never disappoint the "
         "people who depend on her.' Note what a Gestalt formulation does here — we do "
         "not reduce this to poor time management. We read it as an interconnected "
         "whole. There is a probable introjected rule, retroflection of frustration into "
         "self-criticism, and possible deflection around anger — though we hold that "
         "tentatively, because laughter does not automatically mean avoidance. "
         "Organismic self-regulation tells us her fatigue is a signal, not a weakness. "
         "And field theory insists we look outward too: workplace power, job security, "
         "organisational culture and the real consequences of refusing. Her difficulty "
         "cannot be understood solely as an individual problem.")

# ============================================================ 23 · CASE 2
s = frame(prs, "Section 9.3–9.4", "Amina — Interventions and Expected Outcomes", 23)
steps = [
    ("01", "Body awareness",
     "Notice what happens in her body when she imagines telling her supervisor she "
     "cannot take on another assignment — linking thought, emotion and physical response."),
    ("02", "Examining the rule",
     "“What does responsibility mean to you?” · “Can a responsible employee acknowledge "
     "that a workload is too heavy?” — examining the belief without dismissing the value "
     "she places on responsibility."),
    ("03", "Two-chair work (if willing)",
     "Explore the conflict between the part demanding constant performance and the part "
     "needing rest and fairness. Paced according to her comfort and readiness."),
    ("04", "Practical planning",
     "Support her to communicate about workload: ask the supervisor to prioritise tasks, "
     "clarify deadlines, discuss capacity — weighing workplace realities and the risks "
     "of speaking up."),
]
cwS2, chS2 = (CW - 0.24) / 2, 1.85
for i, (n, t, d) in enumerate(steps):
    x = ML + (i % 2) * (cwS2 + 0.24)
    y = 1.95 + (i // 2) * (chS2 + 0.20)
    rect(s, x, y, cwS2, chS2, fill=LIGHT, line=RULE)
    rect(s, x, y, 0.05, chS2, fill=TEAL)
    tb(s, x + 0.28, y + 0.20, cwS2 - 0.56, chS2 - 0.38,
       [dict(t=n, s=12, c=ACCENT, b=True, f=HFONT),
        dict(t=t, s=14, c=INK, b=True, sb=1),
        dict(t=d, s=11.5, c=MUTED, sb=4, ls=1.1)], space_after=0)
rect(s, ML, 6.02, CW, 0.72, fill=INK)
rect(s, ML, 6.02, 0.05, 0.72, fill=ACCENT)
tb(s, ML + 0.30, 6.14, CW - 0.60, 0.52,
   [dict(t="Success is not refusing every additional duty. It is making deliberate "
           "decisions from her responsibilities, limits and working conditions — rather "
           "than responding only through fear or guilt.",
         s=12.5, c=WHITE, ls=1.1)], space_after=0)
notes(s, "The interventions follow the formulation. We start with body awareness, "
         "because it is the least intrusive entry point and it connects her thinking to "
         "her physical response. Then we examine the rule — and notice the care taken: "
         "we are not telling Amina that responsibility is unimportant. We ask what "
         "responsibility means to her and whether a responsible employee can acknowledge "
         "an excessive workload. Two-chair work comes only if she is willing and "
         "sufficiently prepared, paced to her readiness. Finally, practical planning: "
         "asking her supervisor to prioritise tasks, clarify deadlines, discuss "
         "capacity — and that planning must weigh workplace realities and the real risks "
         "of speaking up. Read the expected outcome carefully, because it corrects a "
         "common misreading of Gestalt Therapy: success is not refusing everything. It "
         "is choosing deliberately instead of reacting from fear or guilt.")

# ============================================================ 24 · STRENGTHS
s = frame(prs, "Section 10", "Strengths of Gestalt Therapy", 24,
          cite="(Brownell, 2010)")
str_ = [
    ("Holistic understanding",
     "Attending to thought, emotion, bodily sensation, behaviour and relationship gives "
     "clients a broader picture of their difficulty."),
    ("Emphasis on awareness",
     "Patterns that operated automatically become visible, creating openings for more "
     "deliberate response."),
    ("Experiential techniques",
     "Emotions and relationship patterns can be explored directly rather than only "
     "discussed abstractly — helping clients articulate feelings that resist words."),
    ("Agency and responsibility",
     "Clients identify where choice is genuinely available, while recognising the limits "
     "imposed by their environment."),
    ("Contextual field perspective",
     "Applied carefully, field theory discourages counsellors from reducing complex "
     "difficulties to individual weaknesses."),
    ("Enduring influence",
     "These features explain why Gestalt principles and experiential methods continue to "
     "inform contemporary counselling and psychotherapy."),
]
cwG, chG = (CW - 0.44) / 3, 2.10
for i, (t, d) in enumerate(str_):
    x = ML + (i % 3) * (cwG + 0.22)
    y = 1.98 + (i // 3) * (chG + 0.22)
    rect(s, x, y, cwG, chG, fill=LIGHT, line=RULE)
    rect(s, x, y, cwG, 0.05, fill=TEAL)
    tb(s, x + 0.22, y + 0.22, cwG - 0.44, chG - 0.40,
       [dict(t="\u2713", s=15, c=ACCENT, b=True),
        dict(t=t, s=13.5, c=INK, b=True, sb=2),
        dict(t=d, s=11, c=MUTED, sb=4, ls=1.08)], space_after=0)
notes(s, "Where is this approach strong? Its holistic frame means we never treat a "
         "presenting symptom in isolation. Its emphasis on awareness converts "
         "automatic patterns into visible ones — and visibility is the precondition for "
         "choice. Its experiential techniques let emotion be worked with directly "
         "instead of only talked about, which matters enormously for clients who can "
         "intellectualise fluently but cannot feel. It builds agency while still "
         "acknowledging environmental limits. And its field perspective is a genuine "
         "ethical safeguard: it discourages us from reducing a complex difficulty to an "
         "individual's weakness. Together these explain why Gestalt principles continue "
         "to influence contemporary practice well beyond formal Gestalt training.")

# ============================================================ 25 · LIMITATIONS
s = frame(prs, "Section 11", "Limitations and Criticisms", 25,
          cite="(Wheeler & Axelsson, 2015)")
lim = [
    ("Intensity of experiential work",
     "Some techniques evoke intense emotion and may be unsuitable without adequate "
     "preparation, consent and attention to readiness. Counsellors need appropriate training."),
    ("Risk of minimising the past",
     "The emphasis on present experience can be misunderstood as dismissing history. "
     "The past can be explored through its current effects, but historical and contextual "
     "factors must not be overlooked."),
    ("Misuse of “responsibility”",
     "If environmental constraints, trauma, social inequality or power differences are "
     "ignored, clients may feel blamed for circumstances they did not create."),
    ("Not every client wants this",
     "Some clients are uncomfortable with direct experiential exercises and prefer "
     "structured, skills-based or explicitly cognitive work. Interventions must adapt to "
     "the client."),
    ("Uneven evidence base",
     "Evidence varies across Gestalt interventions and problems. Research on one "
     "technique does not establish that all Gestalt methods work for every client. "
     "Effectiveness claims need relevant research, not theory alone."),
]
for i, (t, d) in enumerate(lim):
    y = 1.95 + i * 0.92
    rect(s, ML, y, CW, 0.82, fill=LIGHT if i % 2 == 0 else WHITE, line=RULE)
    rect(s, ML, y, 0.05, 0.82, fill=RGBColor(0xB0, 0x4A, 0x3A))
    tb(s, ML + 0.30, y + 0.14, 3.35, 0.56,
       [dict(t=t, s=12.5, c=INK, b=True, ls=1.0)], space_after=0)
    tb(s, ML + 3.75, y + 0.13, CW - 4.05, 0.60,
       [dict(t=d, s=11, c=MUTED, ls=1.08)], space_after=0)
notes(s, "We should be as rigorous about the weaknesses as about the strengths — that "
         "is what the evaluation section of our paper is for. First, intensity: some "
         "techniques can evoke overwhelming emotion, and using them without preparation, "
         "consent and attention to readiness is unsafe. This is why counsellor training "
         "matters. Second, the present-focus can be misread as dismissing history; we "
         "must not let important historical and contextual factors slip. Third — and "
         "this is the one we flagged earlier — responsibility can be misapplied into "
         "blame if we ignore trauma, inequality and power. Fourth, fit: not every client "
         "wants experiential work, and some do better with structured or cognitive "
         "approaches. Finally, the evidence base is uneven. Research on one technique "
         "does not establish that all Gestalt methods work for every client or problem. "
         "Claims about effectiveness should rest on relevant research, not on the appeal "
         "of the theory.")

# ============================================================ 26 · CRITICAL EVALUATION & CONCLUSION
s = frame(prs, "Sections 12 & 13", "Critical Evaluation and Conclusion", 26)
panel(s, ML, 1.95, 5.62, 2.55, "What the approach contributes", [
    "A framework for understanding how awareness, unresolved emotion, contact patterns and environment shape functioning",
    "Its central contribution is not “living in the present” — it is showing how we experience our world and how established responses shape our choices",
    "The five disturbances are most useful as exploratory frameworks, applied tentatively and with attention to the client's own understanding",
], size=12, avail_bottom=4.58, floor=10)
panel(s, ML + 5.82, 1.95, CW - 5.82, 2.55, "What it needs in order to work", [
    "Ethical practice, appropriate assessment and cultural sensitivity",
    "Attention to practical circumstances",
    "Awareness alone may not remove every difficulty — some clients also need concrete problem-solving, further support, or other evidence-informed approaches",
], label_color=ACCENT, size=12, avail_bottom=4.58, floor=10)
rect(s, ML, 4.66, CW, 1.92, fill=INK)
rect(s, ML, 4.66, 0.05, 1.92, fill=ACCENT)
tb(s, ML + 0.34, 4.88, CW - 0.68, 1.62,
   [dict(t="CONCLUSION", s=10.5, c=ACCENT, b=True, f=HFONT),
    dict(t="Gestalt Therapy seeks to help clients become more aware of themselves and "
            "their relationships, so that they can respond to life's challenges with "
            "greater understanding, flexibility and choice.",
         s=16, c=WHITE, sb=8, ls=1.15),
    dict(t="Its value depends not only on the concepts themselves but on the "
            "counsellor's ability to apply them collaboratively, ethically, and in a way "
            "that respects the client's circumstances.",
         s=12, c=RGBColor(0xA8, 0xC4, 0xCE), i=True, sb=8, ls=1.1)], space_after=0)
notes(s, "To close with an evaluation. Gestalt Therapy's real contribution is not the "
         "popular idea of 'living in the moment'. It is the demonstration of how we "
         "organise our experience of the world, and how our established responses then "
         "constrain our choices. The five contact boundary disturbances are genuinely "
         "valuable — but only when held tentatively, as exploratory frameworks, with "
         "attention to the client's own understanding of their behaviour. And the "
         "approach needs company: ethical practice, proper assessment, cultural "
         "sensitivity and attention to practical circumstances. Increased awareness "
         "alone may not remove every difficulty — some clients also need concrete "
         "problem-solving, additional support, or interventions drawn from other "
         "evidence-informed approaches. Our conclusion is this: Gestalt Therapy seeks to "
         "help clients become more aware of themselves and their relationships so they "
         "can respond to life's challenges with greater understanding, flexibility and "
         "choice — and its value depends as much on the counsellor's skill and ethics as "
         "on the concepts themselves. Thank you. We welcome your questions.")

# ============================================================ 27 · REFERENCES
s = frame(prs, "Closing", "References", 27)
refs = [
    "Brownell, P. (Ed.). (2010). Gestalt therapy: A guide to contemporary practice. Springer Publishing Company.",
    "Joyce, P., & Sills, C. (2014). Skills in Gestalt counselling & psychotherapy (3rd ed.). SAGE Publications.",
    "Perls, F. S., Hefferline, R. F., & Goodman, P. (1951). Gestalt therapy: Excitement and growth in the human personality. Julian Press.",
    "Wagner-Moore, L. E. (2004). Gestalt therapy: Past, present, theory, and research. Psychotherapy: Theory, Research, Practice, Training, 41(2), 180–189. https://doi.org/10.1037/0033-3204.41.2.180",
    "Wheeler, G., & Axelsson, L. (2015). Gestalt therapy. American Psychological Association.",
    "Woldt, A. L., & Toman, S. M. (Eds.). (2005). Gestalt therapy: History, theory, and practice. SAGE Publications.",
]
y = 2.05
for r in refs:
    tb(s, ML + 0.42, y, CW - 0.42, 0.62,
       [dict(t=r, s=12.5, c=INK, ls=1.12)])
    tb(s, ML, y + 0.02, 0.3, 0.3, [dict(t="\u25AA", s=11, c=ACCENT)])
    y += 0.72
rect(s, ML, 6.30, CW, 0.016, fill=RULE)
tb(s, ML, 6.42, CW, 0.3,
   [dict(t="Thank you  ·  Questions and discussion welcome", s=13, c=TEAL, b=True,
         a=PP_ALIGN.CENTER)])
notes(s, "These are the sources cited in our submitted paper, reproduced in APA 7th "
         "edition. Note that every in-slide citation in this presentation is drawn from "
         "this list and nothing else. If you are asked which source supports a "
         "particular claim: the 1951 Perls, Hefferline and Goodman text is the "
         "foundational work for the core concepts and contact theory; Joyce and Sills "
         "(2014) is our principal source for counselling skill and technique; Woldt and "
         "Toman (2005) and Brownell (2010) cover history, theory and contemporary "
         "practice; Wheeler and Axelsson (2015) covers current Gestalt therapy; and "
         "Wagner-Moore (2004) is the source for the state of the research evidence.")

prs.save(OUT)
print(f"saved {OUT}  ·  {len(prs.slides.__iter__.__self__._sldIdLst)} slides")
