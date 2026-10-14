"""
render_pptx.py
Builds the deliverable: Gestalt Theory and Its Application to Counselling.pptx

Structure of every slide:
  * one full bleed background picture (the painted silhouette scene)
  * one transparent "graphics" picture holding the halos and chevrons
  * the Word style tick marks as transparent pictures
  * text boxes, one per text block, set in the template's Poppins and Raleway,
    which are then embedded into the finished file so it travels intact

Entrance animations are written into the slide timing tree: a soft fade for
text, a small rise for headlines and a grow plus fade for the ticks. Every
element carries its own delay so a slide assembles itself in reading order.
"""

import copy
import os
import sys
from lxml import etree

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

import irspec as S
import render_common as RC

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
BUILD = os.path.abspath(os.path.join(HERE, "..", "build"))
OUT_PPTX = os.path.abspath(os.path.join(HERE, "..",
                                        "Gestalt Theory and Its Application to Counselling.pptx"))
GRAPHICS_DIR = os.path.abspath(os.path.join(HERE, "..", "build", "graphics"))

PX_PER_INCH = S.STAGE_W / 13.3333          # 120 stage pixels per inch
EMBED_DIR = os.path.join(HERE, "embed")    # the template's own embedded font parts

# family -> (regular part, bold part), lifted straight out of the template
EMBEDDED = [("Poppins", "font17.fntdata", "font19.fntdata", "00000500000000000000"),
            ("Raleway", "font18.fntdata", "font16.fntdata", "00000000000000000000")]

NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"')


def emu(px):
    return Emu(int(round(px / PX_PER_INCH * 914400)))


def pt_of(px):
    """A stage pixel size expressed in points."""
    return Pt(round(px * S.PT_PER_PX * 2) / 2.0)


# ---------------------------------------------------------------------------
# animation XML
# ---------------------------------------------------------------------------

_next_id = [100]


def nid():
    _next_id[0] += 3
    return _next_id[0]


def timing_xml(shape_id, kind, delay):
    """Return the <p:par> XML for one entrance effect."""
    d = int(round(delay * 1000))
    if kind == "none":
        return None
    dur = 520
    extra = ""
    if kind == "pop":
        preset, dur, extra = 10, 420, (
            '<p:animScale><p:cBhvr><p:cTn id="%d" dur="%d" fill="hold"/>'
            '<p:tgtEl><p:spTgt spid="%d"/></p:tgtEl></p:cBhvr>'
            '<p:from x="60000" y="60000"/><p:to x="100000" y="100000"/></p:animScale>'
            % (nid(), dur, shape_id))
    elif kind == "zoom":
        preset, dur, extra = 23, 700, (
            '<p:animScale><p:cBhvr><p:cTn id="%d" dur="%d" fill="hold"/>'
            '<p:tgtEl><p:spTgt spid="%d"/></p:tgtEl></p:cBhvr>'
            '<p:from x="92000" y="92000"/><p:to x="100000" y="100000"/></p:animScale>'
            % (nid(), dur, shape_id))
    elif kind == "rise":
        preset, dur, extra = 22, 620, (
            '<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base">'
            '<p:cTn id="%d" dur="%d" fill="hold"/><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl>'
            '<p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr>'
            '<p:tavLst><p:tav tm="0"><p:val><p:strVal val="#ppt_y+.035"/></p:val></p:tav>'
            '<p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav></p:tavLst>'
            '</p:anim>' % (nid(), dur, shape_id))
    else:                                     # fade
        preset, dur, extra = 10, 520, ""
    return (
        '<p:par %s><p:cTn id="%d" presetID="%d" presetClass="entr" presetSubtype="0" '
        'fill="hold" grpId="0" nodeType="%s"><p:stCondLst><p:cond delay="%d"/></p:stCondLst>'
        '<p:childTnLst>'
        '<p:set><p:cBhvr><p:cTn id="%d" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/>'
        '</p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="%d"/></p:tgtEl>'
        '<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
        '<p:to><p:strVal val="visible"/></p:to></p:set>'
        '<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="%d" dur="%d"/>'
        '<p:tgtEl><p:spTgt spid="%d"/></p:tgtEl></p:cBhvr></p:animEffect>'
        '%s'
        '</p:childTnLst></p:cTn></p:par>'
        % (NS, nid(), preset, "clickEffect" if delay <= 0.001 else "afterEffect", d,
           nid(), shape_id, nid(), dur, shape_id, extra))


def install_transition(slide, kind="fade"):
    """Premium slide transition, inserted before the timing tree. Light theme stays clean, the
    motion is soft and short so it feels premium without shouting."""
    NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main"
    # spd med/slow keeps it calm on light backgrounds
    trans = etree.Element("{%s}transition" % NS_P, attrib={"spd": "slow", "advOnClk": "1", "advTm": "0"})
    # choose a subtle effect per section: fade for most pages, push for section openers
    if kind == "push":
        etree.SubElement(trans, "{%s}push" % NS_P, attrib={"thruBlk": "0", "dir": "r"})
    elif kind == "wipe":
        etree.SubElement(trans, "{%s}wipe" % NS_P, attrib={"dir": "l"})
    elif kind == "cover":
        etree.SubElement(trans, "{%s}cover" % NS_P, attrib={"dir": "r"})
    elif kind == "split":
        etree.SubElement(trans, "{%s}split" % NS_P, attrib={"orient": "vert"})
    else:  # fade
        etree.SubElement(trans, "{%s}fade" % NS_P, attrib={"thruBlk": "1"})
    # must follow <p:cSld> and precede <p:timing>. Insert after cSld for valid order
    # find cSld position and insert just after it
    inserted=False
    for idx, child in enumerate(list(slide._element)):
        if child.tag.endswith('}cSld'):
            slide._element.insert(idx+1, trans)
            inserted=True
            break
    if not inserted:
        slide._element.append(trans)


def install_timing(slide, animated):
    """animated: list of (shape_id, kind, delay). Writes the slide timing tree."""
    if not animated:
        return
    animated = sorted(animated, key=lambda a: a[2])
    pars = []
    first = True
    for shape_id, kind, delay in animated:
        xml = timing_xml(shape_id, kind, delay if not first else 0.0)
        if xml:
            pars.append(xml)
        first = False
    body = "".join(pars)
    timing = (
        '<p:timing %s><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" '
        'nodeType="tmRoot"><p:childTnLst>'
        '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq">'
        '<p:childTnLst>%s</p:childTnLst></p:cTn>'
        '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond>'
        '</p:prevCondLst>'
        '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond>'
        '</p:nextCondLst></p:seq>'
        '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>' % (NS, body))
    el = etree.fromstring(timing)
    sld = slide._element
    # <p:timing> must follow <p:cSld> (and <p:clrMapOvr>) and precede <p:extLst>
    sld.append(el)


# ---------------------------------------------------------------------------
# builders
# ---------------------------------------------------------------------------

def _color(palette, token):
    return RC.TOKENS[palette].get(token, "#FFFFFF")


def add_text_simple(slide, el, palette):
    tf_x, tf_y, tf_w = el["x"], el["y"], el["w"]
    box = slide.shapes.add_textbox(emu(tf_x), emu(tf_y), emu(tf_w * 1.02), emu(30))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.TOP
    bodyPr = tf._txBody.find(
        '{http://schemas.openxmlformats.org/drawingml/2006/main}bodyPr')
    for tag in ('normAutofit', 'spAutoFit'):
        child = bodyPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}' + tag)
        if child is not None:
            bodyPr.remove(child)
    first_para = True
    for p in el["paras"]:
        para = tf.paragraphs[0] if first_para else tf.add_paragraph()
        first_para = False
        align = p.get("align") or el.get("align", "l")
        para.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[align]
        lf = p.get("line") or el.get("line") or 1.32
        # exact line spacing in points, so the file lays out line for line the
        # way the previews and the measuring code above do
        size_px = max(r["size"] for r in p["runs"])
        para.line_spacing = Pt(round(lf * S.LH * size_px * S.PT_PER_PX, 1))
        if p.get("space_before"):
            para.space_before = Pt(round(p["space_before"] * S.PT_PER_PX, 1))
        # no bullet glyphs anywhere in this deck
        pPr = para._pPr if para._pPr is not None else para._p.get_or_add_pPr()
        if pPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}buNone') is None:
            pPr.append(etree.SubElement(pPr, '{http://schemas.openxmlformats.org/drawingml/2006/main}buNone'))
        for r in p["runs"]:
            run = para.add_run()
            run.text = r["s"]
            f = run.font
            f.name = S.FONTS[r["font"]]
            f.size = pt_of(r["size"])
            f.bold = bool(r["bold"])
            f.italic = bool(r["italic"])
            f.color.rgb = RGBColor.from_string(_color(palette, r["color"]).lstrip("#").upper())
            if r.get("spacing"):
                run.font._rPr.set("spc", str(int(round(r["spacing"] * S.PT_PER_PX * 100))))
    return box


def bake_graphics(slide, index):
    os.makedirs(GRAPHICS_DIR, exist_ok=True)
    path = os.path.join(GRAPHICS_DIR, "graphics%02d.png" % index)
    layer = RC.render_graphics(slide, scale=1.5)
    layer.save(path, optimize=True)
    return path


def build_pptx():
    prs = Presentation()
    prs.slide_width = emu(S.STAGE_W)
    prs.slide_height = emu(S.STAGE_H)
    blank = prs.slide_layouts[6]
    slides = S.build()
    for sl in slides:
        slide = prs.slides.add_slide(blank)
        palette = sl["palette"]
        # premium light-theme transition: soft fade everywhere, a gentle push at each new section
        # helps the eye feel the content grouping without leaving light
        section_openers = {1, 2, 6, 10, 17, 20, 24, 26, 29, 30}
        if sl["n"] in section_openers:
            tkind = "push" if sl["n"] not in (1, 30) else "fade"
        elif sl["n"] % 5 == 0:
            tkind = "wipe"
        else:
            tkind = "fade"
        # cover and conclusion stay on fade so the blue field blooms softly
        if palette == "blue":
            tkind = "fade"
        install_transition(slide, tkind)
        # 1. background
        bg_path = os.path.join(RC.ASSETS, sl["bg"])
        slide.shapes.add_picture(bg_path, 0, 0, emu(S.STAGE_W), emu(S.STAGE_H))
        animated = []
        # 2. baked graphics (halos, rings, chevrons)
        gpath = bake_graphics(sl, sl["n"])
        pic = slide.shapes.add_picture(gpath, 0, 0, emu(S.STAGE_W), emu(S.STAGE_H))
        animated.append((pic.shape_id, "fade", 0.45))
        # 3. the elements
        for el in sl["els"]:
            k = el["k"]
            if k == "bg":
                continue
            if k in ("img", "tick", "cross"):
                src = el.get("src")
                if k in ("tick", "cross"):
                    src = RC.TICK_FILES[el["color"]]
                    if k == "cross":
                        src = "mark_cross.png"
                path = os.path.join(RC.ASSETS, src)
                w = el["w"]
                if el.get("h"):
                    pic = slide.shapes.add_picture(path, emu(el["x"]), emu(el["y"]),
                                                   emu(w), emu(el["h"]))
                else:
                    pic = slide.shapes.add_picture(path, emu(el["x"]), emu(el["y"]), emu(w))
                if el.get("alpha", 1.0) < 1.0:
                    pass  # alpha is baked into the asset where it matters
                animated.append((pic.shape_id, el.get("anim", "fade"), el.get("delay", 0.4)))
            elif k == "text":
                box = add_text_simple(slide, el, palette)
                animated.append((box.shape_id, el.get("anim", "fade"), el.get("delay", 0.4)))
        install_timing(slide, animated)
    os.makedirs(os.path.dirname(OUT_PPTX), exist_ok=True)
    prs.save(OUT_PPTX)
    return OUT_PPTX


def embed_template_fonts(path):
    """Embed the template's Poppins and Raleway into the built file.

    The parts are lifted from the template untouched, so the deck carries the
    same type it was measured in: a machine without Poppins installed still
    shows the design as intended.
    """
    import re
    import shutil
    import zipfile

    with zipfile.ZipFile(path) as z:
        items = {n: z.read(n) for n in z.namelist()}

    rels = items["ppt/_rels/presentation.xml.rels"].decode("utf-8")
    fonts_xml = []
    for i, (family, regular, bold, panose) in enumerate(EMBEDDED, start=1):
        rid_r, rid_b = "rIdFont%da" % i, "rIdFont%db" % i
        items["ppt/fonts/%s" % regular] = open(os.path.join(EMBED_DIR, regular), "rb").read()
        items["ppt/fonts/%s" % bold] = open(os.path.join(EMBED_DIR, bold), "rb").read()
        rels = rels.replace("</Relationships>",
                            '<Relationship Id="%s" Type="http://schemas.openxmlformats.org/'
                            'officeDocument/2006/relationships/font" Target="fonts/%s"/>'
                            '<Relationship Id="%s" Type="http://schemas.openxmlformats.org/'
                            'officeDocument/2006/relationships/font" Target="fonts/%s"/>'
                            "</Relationships>" % (rid_r, regular, rid_b, bold))
        fonts_xml.append(
            '<p:embeddedFont><p:font typeface="%s" charset="1" panose="%s"/>'
            '<p:regular r:id="%s"/><p:bold r:id="%s"/></p:embeddedFont>' % (family, panose, rid_r, rid_b))
    items["ppt/_rels/presentation.xml.rels"] = rels.encode("utf-8")

    pres = items["ppt/presentation.xml"].decode("utf-8")
    pres = pres.replace("<p:embeddedFontLst>", "").replace("</p:embeddedFontLst>", "")
    lst = "<p:embeddedFontLst>%s</p:embeddedFontLst>" % "".join(fonts_xml)
    # the list belongs straight after the notes size, whether that element is
    # self closing or not
    m = re.search(r"<p:notesSz[^>]*/>", pres)
    if m:
        pres = pres[:m.end()] + lst + pres[m.end():]
    else:
        pres = re.sub(r"(</p:notesSz>)", r"\1" + lst, pres, count=1)
    def set_root_attr(xml, name, value):
        """Set an attribute on <p:presentation> whether or not it is already there."""
        m = re.search(r"<p:presentation\b[^>]*>", xml)
        tag = m.group(0)
        if re.search(r'\b%s="[^"]*"' % name, tag):
            tag = re.sub(r'\b%s="[^"]*"' % name, '%s="%s"' % (name, value), tag, count=1)
        else:
            tag = tag[:-1] + ' %s="%s">' % (name, value)
        return xml[:m.start()] + tag + xml[m.end():]

    # PowerPoint only keeps an embedded font if the file asks it to
    pres = set_root_attr(pres, "embedTrueTypeFonts", "1")
    pres = set_root_attr(pres, "saveSubsetFonts", "1")
    items["ppt/presentation.xml"] = pres.encode("utf-8")

    ct = items["[Content_Types].xml"].decode("utf-8")
    if "fntdata" not in ct:
        ct = ct.replace("</Types>",
                        '<Default Extension="fntdata" ContentType="application/x-fontdata"/>'
                        "</Types>")
    items["[Content_Types].xml"] = ct.encode("utf-8")

    tmp = path + ".embed"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in items.items():
            z.writestr(name, data)
    shutil.move(tmp, path)
    return [f[0] for f in EMBEDDED]


if __name__ == "__main__":
    p = build_pptx()
    faces = embed_template_fonts(p)
    print("written:", p, os.path.getsize(p) // 1024, "KB, embedded fonts:", ", ".join(faces))
