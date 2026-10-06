/* ============================================================================
   GESTALT THEORY AND ITS APPLICATION TO COUNSELLING — deck generator
   Group 4 · MCP504 · Pan African Christian University
   DESIGN v4:
     · Typography: Plus Jakarta Sans (Bold titles / SemiBold subheads) + Inter
       (Regular body, generous 1.3 line height) — premium geometric sans pair
     · Structure: asymmetric grids, floating cards with soft drop shadows on a
       soft-tinted page; every photo in a rounded-corner card with shadow
     · Palette (from company profile.pdf): navy #162B57 / #0A1937, periwinkle
       #8097BE, slate #717E9B, white — flat corporate
     · Motion: every animated element carries an objectName (hdr / blkN / img)
       used by animate.js to inject native PowerPoint animations + Morph
   Run:  node build.js && node animate.js
   ========================================================================== */
const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

const A = (p) => path.join(__dirname, "assets", p);
const OUT_DIR = path.join(__dirname, "output");
const OUT = path.join(OUT_DIR, "Gestalt Theory and Its Application to Counselling.pptx");
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- design tokens ---------- */
const NAVY = "162B57";
const DEEP = "0A1937";
const PERI = "8097BE";
const SLATE = "717E9B";
const SLATE_D = "5A6B94";
const WHITE = "FFFFFF";
const PAGE = "F3F5FA";     // soft cool page tint (light slides)
const TINT = "E8EDF6";     // chip tint
const LINE = "D9E0EC";     // hairlines on light
const TEXT = "2B3550";
const MUTED = "6B7590";
const MUTED_D = "AAB7D4";
const HAIR_D = "31415F";
const PANEL_LN = "46608F";
const GLASSLN = "5C6C8F";
const LIGHT_ON_DARK = "C9D4EA";
const OK_BG = "E3EAF6", OK_LN = "AFBDD8";
const NO_BG = "ECF0F6", NO_LN = "C3CCDC";
const HEAD = "Georgia", HSEMI = "Calibri";
const BODY = "Calibri", BSEMI = "Calibri";
const BRAND = "PAN AFRICAN CHRISTIAN UNIVERSITY  ·  MCP504";
const TITLE_DECK = "Gestalt Theory and Its Application to Counselling";

const shadowL = () => ({ type: "outer", angle: 90, blur: 10, offset: 3, color: "1B2A4A", opacity: 0.2 });

/* ultrarealistic silhouette photo background + readability overlay */
function bgPhoto(s, file, dark) {
  s.addImage({ path: A(file), x: 0, y: 0, w: 13.333, h: 7.5, objectName: "bg" });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: dark ? DEEP : WHITE, transparency: dark ? 20 : 28 } });
}
const shadowD = () => ({ type: "outer", angle: 90, blur: 14, offset: 5, color: "000000", opacity: 0.32 });

/* ---------- setup ---------- */
const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "Group 4 — Pan African Christian University";
pptx.company = "Pan African Christian University";
pptx.subject = "MCP504 Theories of Counseling and Psychotherapy";
pptx.title = TITLE_DECK;

let slideNo = 0;
const MANIFEST = [];
function newSlide(title) {
  slideNo++;
  MANIFEST.push({ n: slideNo, title });
  return pptx.addSlide();
}

/* ---------- helpers ---------- */
function footer(s, dark) {
  s.addShape("rect", { x: 0.66, y: 7.07, w: 12.01, h: 0.013, fill: { color: dark ? HAIR_D : LINE } });
  s.addText(BRAND, { x: 0.66, y: 7.13, w: 9, h: 0.24, fontFace: BODY, fontSize: 7.5, color: dark ? LIGHT_ON_DARK : MUTED, charSpacing: 1.5, margin: 0 });
  s.addText(String(slideNo).padStart(2, "0"), { x: 11.7, y: 7.13, w: 0.97, h: 0.24, align: "right", fontFace: BSEMI, bold: true, fontSize: 8, color: dark ? WHITE : NAVY, margin: 0 });
}

/* section header — all parts named "hdr" → fade in as one group */
function header(s, eyebrow, txt, o = {}) {
  const x = o.x ?? 0.66, w = o.w ?? 11.4, dark = !!o.dark;
  const align = o.align ?? "left";
  s.addText(eyebrow, { x, y: 0.6, w, h: 0.26, fontFace: HSEMI, fontSize: 9, bold: true, color: dark ? LIGHT_ON_DARK : SLATE_D, charSpacing: 2.5, margin: 0, align, objectName: "hdr" });
  s.addText(txt, { x, y: 0.86, w, h: 0.56, fontFace: HEAD, fontSize: 25, bold: true, color: dark ? WHITE : NAVY, charSpacing: 0.75, margin: 0, align, objectName: "hdr" });
  const rx = align === "ctr" ? 6.167 : x;
  s.addShape("rect", { x: rx, y: 1.46, w: 1.0, h: 0.045, fill: { color: dark ? PERI : NAVY }, objectName: "hdr" });
}

/* floating card (rounded rect + soft shadow) */
function card(s, x, y, w, h, o = {}) {
  s.addShape("roundRect", {
    x, y, w, h, rectRadius: o.r ?? 0.09,
    fill: { color: o.fill ?? WHITE, transparency: o.transp ?? 0 },
    line: o.line ? { color: o.line, width: 1 } : { color: o.fill ?? WHITE, width: 0 },
    shadow: o.dark ? shadowD() : shadowL(),
    objectName: o.name,
  });
}

/* photo in rounded card + shadow (geometry rounded by animate.js) */
function photo(s, file, x, y, w, h, o = {}) {
  s.addImage({ path: A(file), x, y, w, h, shadow: o.dark ? shadowD() : shadowL(), objectName: o.name ?? "img" });
}

function label(s, txt, x, y, w, o = {}) {
  s.addText(txt, { x, y, w, h: 0.26, fontFace: HSEMI, fontSize: o.size ?? 9, bold: true, color: o.color ?? (o.dark ? PERI : SLATE_D), charSpacing: 2.2, margin: 0, align: o.align ?? "left", objectName: o.name });
}

function lead(s, txt, x, y, w, o = {}) {
  s.addText(txt, { x, y, w, h: o.h ?? 0.45, fontFace: HSEMI, fontSize: o.size ?? 16, bold: true, color: o.dark ? WHITE : NAVY, margin: 0, lineSpacingMultiple: 1.15, objectName: o.name });
}

function statement(s, txt, x, y, w, o = {}) {
  s.addShape("rect", { x, y, w: 0.05, h: 0.46, fill: { color: PERI }, objectName: o.name });
  s.addText(txt, { x: x + 0.22, y, w: w - 0.22, h: 0.46, fontFace: BSEMI, bold: true, fontSize: o.size ?? 13.5, color: o.dark ? WHITE : NAVY, margin: 0, valign: "middle", objectName: o.name });
}

function citation(s, txt, o = {}) {
  s.addText(txt, { x: o.x ?? 0.66, y: o.y ?? 6.6, w: o.w ?? 8.6, h: 0.3, fontFace: BODY, fontSize: 10, italic: true, color: o.dark ? LIGHT_ON_DARK : MUTED, margin: 0, align: o.align ?? "left", objectName: o.name });
}

/** bullet list — items: string | array of runs {t, b, i, color, size} */
function bullets(s, items, x, y, w, h, o = {}) {
  const arr = [];
  items.forEach((it) => {
    const runs = Array.isArray(it) ? it : [typeof it === "string" ? { t: it } : it];
    runs.forEach((r, i) => {
      const opt = {
        fontFace: r.font ?? BODY,
        fontSize: r.size ?? o.size ?? 13.5,
        color: r.color ?? (o.dark ? WHITE : TEXT),
        bold: !!r.b,
        italic: !!r.i,
      };
      if (i === 0) {
        opt.bullet = { code: o.bulletCode ?? "2013", indent: o.indent ?? 11 };
        opt.paraSpaceAfter = o.space ?? 11;
        opt.lineSpacingMultiple = o.lsm ?? 1.3;
      }
      if (i === runs.length - 1) opt.breakLine = true;
      arr.push({ text: r.t, options: opt });
    });
  });
  s.addText(arr, { x, y, w, h, valign: "top", margin: 0, fontFace: BODY, objectName: o.name });
}

function chip(s, txt, x, y, w, h, o = {}) {
  s.addText(txt, {
    shape: "roundRect", rectRadius: o.r ?? 0.06, x, y, w, h,
    fill: { color: o.fill ?? TINT, transparency: o.transp ?? 0 },
    line: o.line ? { color: o.line, width: 1 } : { color: o.fill ?? TINT, width: 0 },
    align: "center", valign: "middle", fontFace: o.font ?? BSEMI,
    fontSize: o.size ?? 12, bold: o.bold ?? true, color: o.color ?? NAVY,
    margin: 0, charSpacing: o.spacing ?? 0, objectName: o.name,
  });
}

/** horizontal flow: words joined by arrows */
function flow(s, words, x, y, w, h, o = {}) {
  const arr = [];
  words.forEach((word, i) => {
    arr.push({ text: word, options: { fontFace: o.font ?? BSEMI, fontSize: o.size ?? 14, bold: true, color: o.color ?? WHITE } });
    if (i < words.length - 1) arr.push({ text: "  →  ", options: { fontFace: BODY, fontSize: o.size ?? 14, color: o.arrow ?? PERI } });
  });
  s.addText(arr, { x, y, w, h, align: o.align ?? "center", valign: "middle", margin: 0, objectName: o.name });
}

/** numbered rows */
function numberedList(s, items, x, y, w, o = {}) {
  const step = o.step ?? 0.56, dark = !!o.dark;
  items.forEach((it, i) => {
    const runs = Array.isArray(it) ? it : [it];
    const yy = y + i * step;
    s.addText(String(i + 1 + (o.startNum ?? 1) - 1).padStart(2, "0"), { x, y: yy, w: o.numW ?? 0.42, h: 0.3, fontFace: BSEMI, fontSize: o.numSize ?? 10.5, bold: true, color: PERI, margin: 0, objectName: o.name });
    s.addText(runs.map((r) => (typeof r === "string" ? { t: r } : r)).map((r) => ({
      text: r.t, options: { fontFace: r.font ?? BODY, fontSize: r.size ?? o.size ?? 12.5, color: r.color ?? (dark ? WHITE : TEXT), bold: !!r.b, italic: !!r.i },
    })), { x: x + (o.numW ?? 0.42) + 0.18, y: yy, w: w - (o.numW ?? 0.42) - 0.18, h: o.rowH ?? step, valign: "top", margin: 0, lineSpacingMultiple: 1.2, objectName: o.name });
  });
}

/* ========================================================================== */
/* SLIDE 1 — TITLE                                                            */
/* ========================================================================== */
{
  const s = newSlide("Gestalt Theory and Its Application to Counselling");
  s.background = { color: DEEP };
  bgPhoto(s, "bg-dark.jpg", true);
  photo(s, "h-summit.jpg", 7.3, 0.62, 5.35, 6.26, { dark: true });

  label(s, "GROUP 4 PRESENTATION  ·  MCP504", 0.66, 0.76, 6.6, { color: LIGHT_ON_DARK, size: 10, name: "hdr" });
  s.addText("Gestalt", { x: 0.62, y: 0.98, w: 6.9, h: 0.78, fontFace: HEAD, fontSize: 46, bold: true, color: WHITE, margin: 0, objectName: "hdr" });
  s.addText("Theory", { x: 0.62, y: 1.84, w: 6.9, h: 0.78, fontFace: HEAD, fontSize: 46, bold: true, color: WHITE, margin: 0, objectName: "hdr" });
  s.addText("AND ITS APPLICATION TO COUNSELLING", { x: 0.66, y: 2.8, w: 6.9, h: 0.36, fontFace: HSEMI, bold: true, fontSize: 14, color: LIGHT_ON_DARK, charSpacing: 2, margin: 0, objectName: "hdr" });
  s.addShape("rect", { x: 0.68, y: 3.3, w: 1.2, h: 0.045, fill: { color: PERI }, objectName: "hdr" });

  card(s, 0.66, 3.56, 6.2, 1.9, { fill: NAVY, dark: true, name: "blk1" });
  label(s, "PRESENTED BY  ·  GROUP 4 MEMBERS", 0.94, 3.72, 5, { color: PERI, size: 8.5, name: "blk1" });
  const members = [
    ["Josephine Biwott", "MACP/35996/0/26"],
    ["Cynthia Cherono", "MACP/35785/4/26"],
    ["Yvonne Juliet Awuor", "MALD/36547/4/26"],
  ];
  members.forEach((m, i) => {
    const y = 4.04 + i * 0.44;
    if (i > 0) s.addShape("rect", { x: 0.94, y: y - 0.05, w: 5.64, h: 0.012, fill: { color: HAIR_D }, objectName: "blk1" });
    s.addText([
      { text: m[0], options: { fontFace: BSEMI, bold: true, fontSize: 13, color: WHITE } },
      { text: "    ·    " + m[1], options: { fontFace: BODY, fontSize: 11.5, color: MUTED_D } },
    ], { x: 0.94, y, w: 5.7, h: 0.38, margin: 0, valign: "middle", objectName: "blk1" });
  });

  s.addShape("rect", { x: 0.68, y: 5.74, w: 6.16, h: 0.012, fill: { color: HAIR_D }, objectName: "blk2" });
  s.addShape("rect", { x: 3.7, y: 5.94, w: 0.012, h: 0.86, fill: { color: HAIR_D }, objectName: "blk2" });
  s.addShape("rect", { x: 6.06, y: 5.94, w: 0.012, h: 0.86, fill: { color: HAIR_D }, objectName: "blk2" });
  const info = [
    ["COURSE", "MCP504 · Theories of Counseling and Psychotherapy", 0.66, 2.9],
    ["INSTITUTION", "Pan African Christian University", 3.9, 2.0],
    ["LECTURER", "Dr. Lucy Gachenia", 6.26, 1.5],
  ];
  info.forEach((r) => {
    label(s, r[0], r[2], 5.92, r[3], { color: LIGHT_ON_DARK, size: 8.5, name: "blk2" });
    s.addText(r[1], { x: r[2], y: 6.18, w: r[3], h: 0.66, fontFace: BODY, fontSize: 11, color: WHITE, margin: 0, lineSpacingMultiple: 1.18, objectName: "blk2" });
  });
}

/* ========================================================================== */
/* SLIDE 2 — INTRODUCTION                                                     */
/* ========================================================================== */
{
  const s = newSlide("Introduction");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "OVERVIEW", "Introduction", { w: 7.6 });

  card(s, 0.66, 1.74, 6.0, 4.55, { name: "blk1" });
  lead(s, "Experiential and humanistic approach to counselling", 0.94, 2.0, 5.44, { size: 16, h: 0.82, name: "blk1" });
  s.addShape("rect", { x: 0.96, y: 2.94, w: 5.4, h: 0.013, fill: { color: LINE }, objectName: "blk1" });
  bullets(s, [
    [{ t: "Emphasizes " }, { t: "awareness, present experience and contact", b: true }],
    [{ t: "Understands individuals within their " }, { t: "environment and relationships", b: true }],
    [{ t: "Encourages personal responsibility, choice and authentic living" }],
    [{ t: "Focuses on the client's experience in the " }, { t: "here-and-now", b: true }],
  ], 0.94, 3.16, 5.44, 2.95, { size: 13.5, space: 13, name: "blk1" });

  photo(s, "h-conversation.jpg", 7.0, 1.95, 5.65, 4.4);
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.5, w: 7.5, name: "blk2" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 3 — HISTORICAL BACKGROUND                                            */
/* ========================================================================== */
{
  const s = newSlide("Historical Background");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "FOUNDATIONS", "Historical Background", { w: 8.6 });

  photo(s, "p-history.jpg", 0.66, 1.74, 3.0, 4.9);

  card(s, 3.95, 1.74, 8.72, 1.44, { name: "blk1" });
  bullets(s, [
    [{ t: "Emerged during the " }, { t: "1940s and 1950s", b: true }],
    [{ t: "Developed partly in response to limitations perceived in " }, { t: "traditional psychoanalysis", b: true }],
  ], 4.23, 1.98, 8.16, 1.05, { size: 13, space: 8, name: "blk1" });

  card(s, 4.25, 3.36, 8.42, 1.66, { name: "blk2" });
  label(s, "INFLUENCED BY", 4.53, 3.52, 4, { name: "blk2" });
  chip(s, "Gestalt psychology", 4.53, 3.86, 2.62, 0.5, { size: 11, name: "blk2" });
  chip(s, "Phenomenology", 7.33, 3.86, 2.3, 0.5, { size: 11, name: "blk2" });
  chip(s, "Existential philosophy", 9.83, 3.86, 2.56, 0.5, { size: 11, name: "blk2" });
  chip(s, "Field theory", 4.53, 4.44, 1.85, 0.5, { size: 11, name: "blk2" });
  chip(s, "Holistic approaches", 6.58, 4.44, 2.35, 0.5, { size: 11, name: "blk2" });

  statement(s, "Emphasized experience, awareness and contact", 3.95, 5.3, 8.4, { size: 13, name: "blk3" });

  card(s, 3.95, 5.86, 8.72, 0.9, { fill: NAVY, dark: true, name: "blk4" });
  label(s, "INTELLECTUAL ROOTS", 4.23, 5.98, 4, { dark: true, size: 8, name: "blk4" });
  flow(s, ["Gestalt Psychology", "Phenomenology", "Existentialism", "Field Theory", "Gestalt Therapy"], 4.23, 6.24, 8.16, 0.4, { size: 10.5, align: "left", name: "blk4" });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { x: 3.95, y: 6.85, w: 8.5, name: "blk4" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 4 — MAJOR THEORISTS                                                  */
/* ========================================================================== */
{
  const s = newSlide("Major Theorists");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "FOUNDATIONS", "Major Theorists", { dark: false, w: 7.4 });
  photo(s, "p-theorists.jpg", 8.25, 0.56, 4.42, 1.9);

  const people = [
    { ini: "FP", name: "Fritz Perls", yrs: "1893–1970", role: "Major founder", det: "Awareness, experience and responsibility", c: NAVY, rc: NAVY },
    { ini: "LP", name: "Laura Perls", yrs: "1905–1990", role: "Major contributor", det: "Contact, relationship and embodied experience", c: SLATE_D, rc: SLATE_D },
    { ini: "PG", name: "Paul Goodman", yrs: "1911–1972", role: "Co-author of Gestalt Therapy (1951)", det: "Major contributor to theoretical formulation", c: PERI, rc: SLATE_D },
  ];
  const cw = 3.84, gap = 0.25;
  people.forEach((p, i) => {
    const x = 0.66 + i * (cw + gap);
    const y = i === 1 ? 3.15 : 2.85;      // staggered middle card
    const nm = `blk${i + 1}`;
    card(s, x, y, cw, 3.42, { name: nm });
    s.addShape("rect", { x, y, w: cw, h: 0.07, fill: { color: p.c }, objectName: nm });
    s.addShape("ellipse", { x: x + 0.3, y: y + 0.32, w: 0.74, h: 0.74, fill: { color: TINT }, line: { color: LINE, width: 1 }, objectName: nm });
    s.addText(p.ini, { x: x + 0.3, y: y + 0.32, w: 0.74, h: 0.74, align: "center", valign: "middle", fontFace: HEAD, fontSize: 13.5, bold: true, color: NAVY, margin: 0, objectName: nm });
    s.addText(p.name, { x: x + 1.22, y: y + 0.38, w: cw - 1.4, h: 0.36, fontFace: HSEMI, bold: true, fontSize: 15, color: NAVY, margin: 0, objectName: nm });
    s.addText(p.yrs, { x: x + 1.22, y: y + 0.76, w: cw - 1.4, h: 0.28, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0, objectName: nm });
    s.addShape("rect", { x: x + 0.3, y: y + 1.28, w: cw - 0.6, h: 0.013, fill: { color: LINE }, objectName: nm });
    s.addText(p.role, { x: x + 0.3, y: y + 1.44, w: cw - 0.6, h: 0.6, fontFace: BSEMI, bold: true, fontSize: 12, color: p.rc, margin: 0, lineSpacingMultiple: 1.15, objectName: nm });
    s.addText(p.det, { x: x + 0.3, y: y + 2.12, w: cw - 0.6, h: 1.1, fontFace: BODY, fontSize: 12, color: TEXT, margin: 0, lineSpacingMultiple: 1.25, objectName: nm });
  });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { y: 6.65, name: "blk4" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 5 — CORE ASSUMPTIONS                                                 */
/* ========================================================================== */
{
  const s = newSlide("Core Assumptions of Gestalt Therapy");
  s.background = { color: DEEP };
  bgPhoto(s, "bg-dark.jpg", true);
  header(s, "FOUNDATIONS", "Core Assumptions of Gestalt Therapy", { dark: true, w: 11.5 });

  card(s, 0.66, 1.9, 4.2, 4.55, { fill: NAVY, dark: true, name: "blk1" });
  numberedList(s, [
    "People are best understood as whole persons",
    "Human experience is influenced by the environment",
    "Awareness is central to psychological growth",
    "Experience unfolds in the present",
  ], 0.92, 2.5, 3.7, { size: 12.5, step: 0.78, dark: true, rowH: 0.72, name: "blk1" });

  card(s, 5.06, 2.3, 3.6, 4.15, { fill: NAVY, dark: true, name: "blk2" });
  numberedList(s, [
    "People have capacity for choice and self-regulation",
    "Healthy functioning involves meaningful contact",
  ], 5.32, 2.88, 3.1, { size: 12.5, step: 0.78, dark: true, rowH: 0.72, startNum: 5, name: "blk2" });
  s.addText("07", { x: 5.32, y: 4.44, w: 0.42, h: 0.3, fontFace: BSEMI, bold: true, fontSize: 10.5, color: PERI, margin: 0, objectName: "blk2" });
  s.addText("Psychological difficulties may involve interruptions in awareness or contact", { x: 5.92, y: 4.4, w: 2.56, h: 1.35, fontFace: BODY, fontSize: 12.5, color: WHITE, margin: 0, lineSpacingMultiple: 1.2, objectName: "blk2" });

  photo(s, "h-hands.jpg", 8.86, 1.9, 3.8, 4.55, { dark: true });
  citation(s, "(Perls et al., 1951; Brownell, 2010; Joyce & Sills, 2014)", { y: 6.6, dark: true, w: 9, name: "blk3" });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 6 — AWARENESS                                                        */
/* ========================================================================== */
{
  const s = newSlide("Awareness");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "CORE CONCEPTS", "Awareness", { w: 7.6 });

  statement(s, "Central concept in Gestalt therapy", 0.66, 1.78, 7.5, { size: 14.5, name: "blk1" });

  card(s, 0.66, 2.36, 7.55, 1.62, { name: "blk2" });
  label(s, "NOTICING", 0.92, 2.52, 3, { name: "blk2" });
  ["Thoughts", "Feelings", "Bodily sensations", "Behaviour", "Needs"].forEach((t, i) => {
    chip(s, t, 0.92 + i * 1.42, 2.94, 1.32, 0.52, { size: 9.5, name: "blk2" });
  });

  card(s, 0.66, 4.24, 7.55, 2.22, { name: "blk3" });
  label(s, "THE PROCESS", 0.92, 4.42, 3, { name: "blk3" });
  ["Focuses on present experience", "Creates opportunities for choice and change"].forEach((t, i) => {
    s.addShape("rect", { x: 0.94 + i * 3.75, y: 4.83, w: 0.12, h: 0.12, fill: { color: PERI }, objectName: "blk3" });
    s.addText(t, { x: 1.18 + i * 3.75, y: 4.71, w: 3.15, h: 0.4, fontFace: BODY, fontSize: 12, color: TEXT, margin: 0, valign: "middle", objectName: "blk3" });
  });
  chip(s, "AWARENESS", 0.92, 5.42, 2.45, 0.66, { fill: DEEP, color: WHITE, size: 12.5, name: "blk3" });
  s.addText("→", { x: 3.42, y: 5.42, w: 0.55, h: 0.66, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: SLATE, margin: 0, objectName: "blk3" });
  chip(s, "CHOICE", 4.02, 5.42, 1.9, 0.66, { fill: NAVY, color: WHITE, size: 12.5, name: "blk3" });
  s.addText("→", { x: 5.97, y: 5.42, w: 0.55, h: 0.66, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: SLATE, margin: 0, objectName: "blk3" });
  chip(s, "CHANGE", 6.58, 5.42, 2.0, 0.66, { fill: PERI, color: DEEP, size: 12.5, name: "blk3" });

  photo(s, "h-meditate.jpg", 8.5, 1.74, 4.16, 4.66);
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.55, w: 7.5, name: "blk4" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 7 — THE HERE-AND-NOW                                                 */
/* ========================================================================== */
{
  const s = newSlide("The Here-and-Now");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "CORE CONCEPTS", "The Here-and-Now", { w: 7.9 });

  card(s, 0.66, 1.74, 3.95, 2.5, { name: "blk1" });
  s.addShape("rect", { x: 0.66, y: 1.74, w: 3.95, h: 0.06, fill: { color: NAVY }, objectName: "blk1" });
  label(s, "THE FOCUS", 0.9, 1.98, 3, { name: "blk1" });
  s.addText("Focuses on the client's present experience", { x: 0.9, y: 2.34, w: 3.4, h: 0.75, fontFace: HSEMI, bold: true, fontSize: 13, color: NAVY, margin: 0, lineSpacingMultiple: 1.2, objectName: "blk1" });
  s.addText("Includes thoughts, emotions, bodily sensations and behaviour", { x: 0.9, y: 3.18, w: 3.4, h: 0.9, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0, lineSpacingMultiple: 1.25, objectName: "blk1" });

  card(s, 1.0, 4.44, 3.6, 2.0, { name: "blk2" });
  s.addShape("rect", { x: 1.0, y: 4.44, w: 3.6, h: 0.06, fill: { color: SLATE_D }, objectName: "blk2" });
  label(s, "THE PAST", 1.24, 4.68, 3, { color: SLATE_D, name: "blk2" });
  s.addText("Past experiences are explored through their current impact", { x: 1.24, y: 5.04, w: 3.15, h: 1.2, fontFace: HSEMI, bold: true, fontSize: 13, color: NAVY, margin: 0, lineSpacingMultiple: 1.25, objectName: "blk2" });

  card(s, 4.95, 1.74, 3.4, 4.7, { name: "blk3" });
  bullets(s, [
    [{ t: "Encourages " }, { t: "direct experience", b: true }, { t: " rather than excessive intellectual analysis" }],
    [{ t: "The therapeutic relationship provides an opportunity for " }, { t: "present-moment awareness", b: true }],
  ], 5.21, 1.98, 2.9, 4.2, { size: 12.5, space: 14, name: "blk3" });

  photo(s, "h-window.jpg", 8.5, 1.74, 4.16, 4.66);
  citation(s, "(Perls et al., 1951; Brownell, 2010)", { x: 4.95, y: 6.55, w: 3.4, name: "blk3" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 8 — FIGURE AND GROUND                                                */
/* ========================================================================== */
{
  const s = newSlide("Figure and Ground");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "CORE CONCEPTS", "Figure and Ground", { w: 8 });

  card(s, 0.66, 1.74, 5.3, 4.5, { fill: DEEP, dark: true, name: "blk1" });
  [4.35, 3.55, 2.85].forEach((d) => {
    s.addShape("ellipse", { x: 3.31 - d / 2, y: 3.99 - d / 2, w: d, h: d, fill: { color: DEEP, transparency: 100 }, line: { color: PANEL_LN, width: 1 }, objectName: "blk1" });
  });
  s.addShape("ellipse", { x: 2.46, y: 3.14, w: 1.7, h: 1.7, fill: { color: WHITE }, line: { color: WHITE, width: 1.25 }, objectName: "blk1" });
  s.addText("FIGURE", { x: 2.46, y: 4.94, w: 1.7, h: 0.28, align: "center", fontFace: HSEMI, bold: true, fontSize: 9, color: PERI, charSpacing: 2.2, margin: 0, objectName: "blk1" });
  s.addText("GROUND", { x: 0.96, y: 5.78, w: 2.5, h: 0.26, fontFace: HSEMI, bold: true, fontSize: 9, color: MUTED_D, charSpacing: 2.2, margin: 0, objectName: "blk1" });
  s.addText("One element steps forward as figure against a ground of context.", { x: 0.66, y: 6.38, w: 5.3, h: 0.3, fontFace: BODY, fontSize: 9.5, italic: true, color: MUTED, margin: 0, objectName: "blk1" });

  card(s, 6.3, 1.74, 6.37, 1.04, { name: "blk2" });
  s.addShape("rect", { x: 6.3, y: 1.74, w: 0.08, h: 1.04, fill: { color: NAVY }, objectName: "blk2" });
  s.addText("FIGURE", { x: 6.58, y: 1.88, w: 3, h: 0.34, fontFace: HSEMI, bold: true, fontSize: 14, color: NAVY, charSpacing: 0.5, margin: 0, objectName: "blk2" });
  s.addText("What is most prominent in awareness", { x: 6.58, y: 2.26, w: 5.9, h: 0.34, fontFace: BODY, fontSize: 12, color: TEXT, margin: 0, objectName: "blk2" });
  s.addText("↓", { x: 6.3, y: 2.82, w: 6.37, h: 0.42, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: SLATE_D, margin: 0, objectName: "blk2" });
  card(s, 6.3, 3.28, 6.37, 1.04, { name: "blk2" });
  s.addShape("rect", { x: 6.3, y: 3.28, w: 0.08, h: 1.04, fill: { color: SLATE_D }, objectName: "blk2" });
  s.addText("GROUND", { x: 6.58, y: 3.42, w: 3, h: 0.34, fontFace: HSEMI, bold: true, fontSize: 14, color: SLATE_D, charSpacing: 0.5, margin: 0, objectName: "blk2" });
  s.addText("The surrounding context and experiences", { x: 6.58, y: 3.8, w: 5.9, h: 0.34, fontFace: BODY, fontSize: 12, color: TEXT, margin: 0, objectName: "blk2" });

  card(s, 6.3, 4.62, 6.37, 1.85, { name: "blk3" });
  bullets(s, [
    "Needs and concerns move between figure and ground",
    "The figure changes as circumstances change",
    "Awareness helps identify what is most significant in the present",
  ], 6.56, 4.86, 5.85, 1.4, { size: 12, space: 9, name: "blk3" });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { x: 6.3, y: 6.6, w: 6.3, name: "blk3" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 9 — CONTACT AND CONTACT BOUNDARY                                     */
/* ========================================================================== */
{
  const s = newSlide("Contact and Contact Boundary");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "CORE CONCEPTS", "Contact and Contact Boundary", { w: 11 });

  card(s, 0.66, 1.74, 7.0, 4.55, { name: "blk1" });
  bullets(s, [
    [{ t: "Contact: ", b: true }, { t: "Interaction between the individual and environment" }],
    [{ t: "Contact boundary: ", b: true }, { t: "Point at which the individual and environment meet" }],
    "Healthy contact allows needs to be addressed while maintaining a sense of self",
    [{ t: "Contact involves " }, { t: "engaging, responding and withdrawing", b: true }],
    "Relationships, culture and circumstances influence contact",
  ], 0.92, 1.98, 6.48, 4.1, { size: 13, space: 12, name: "blk1" });

  photo(s, "h-listening.jpg", 8.5, 1.74, 4.16, 3.12);

  card(s, 8.5, 5.06, 4.16, 1.74, { name: "blk2" });
  chip(s, "INDIVIDUAL", 8.7, 5.62, 1.03, 0.62, { fill: DEEP, color: WHITE, size: 8.5, spacing: 0.5, name: "blk2" });
  s.addText("↔", { x: 9.75, y: 5.62, w: 0.28, h: 0.62, align: "center", valign: "middle", fontFace: BODY, fontSize: 13, bold: true, color: SLATE_D, margin: 0, objectName: "blk2" });
  chip(s, "CONTACT BOUNDARY", 10.05, 5.62, 1.28, 0.62, { fill: TINT, color: NAVY, size: 8, spacing: 0.5, name: "blk2" });
  s.addText("↔", { x: 11.35, y: 5.62, w: 0.28, h: 0.62, align: "center", valign: "middle", fontFace: BODY, fontSize: 13, bold: true, color: SLATE_D, margin: 0, objectName: "blk2" });
  chip(s, "ENVIRONMENT", 11.65, 5.62, 0.81, 0.62, { fill: SLATE_D, color: WHITE, size: 8.5, spacing: 0.5, name: "blk2" });

  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.55, w: 7.0, name: "blk3" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 10 — UNFINISHED BUSINESS                                             */
/* ========================================================================== */
{
  const s = newSlide("Unfinished Business");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "CORE CONCEPTS", "Unfinished Business", { w: 8.6 });

  card(s, 0.66, 1.74, 7.6, 2.56, { name: "blk1" });
  lead(s, "Unresolved experiences or emotions", 0.94, 1.98, 7.04, { size: 15.5, name: "blk1" });
  label(s, "MAY INCLUDE", 0.94, 2.56, 4, { name: "blk1" });
  const emo = [["Grief", 1.0], ["Anger", 1.0], ["Guilt", 0.95], ["Resentment", 1.25], ["Unmet needs", 1.35]];
  let ex = 0.94;
  emo.forEach((e) => { chip(s, e[0], ex, 3.0, e[1], 0.54, { size: 11, name: "blk1" }); ex += e[1] + 0.16; });

  card(s, 0.66, 4.5, 7.6, 1.72, { name: "blk2" });
  bullets(s, [
    "Can remain psychologically active in the present",
    "May interfere with healthy contact",
  ], 0.94, 4.74, 7.04, 0.85, { size: 12.5, space: 8, name: "blk2" });
  statement(s, "Therapy promotes awareness and processing", 0.94, 5.6, 7.0, { size: 13, name: "blk2" });

  photo(s, "h-pensive.jpg", 8.5, 1.74, 4.16, 4.66);
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { x: 0.66, y: 6.42, w: 7.6, name: "blk3" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 11 — PERSONAL RESPONSIBILITY                                         */
/* ========================================================================== */
{
  const s = newSlide("Personal Responsibility");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "CORE CONCEPTS", "Personal Responsibility", { w: 7.9 });

  card(s, 0.66, 1.74, 7.6, 2.4, { name: "blk1" });
  bullets(s, [
    "Recognizing one's own choices and responses",
    [{ t: "Promotes " }, { t: "agency and ownership", b: true }],
    "Encourages authentic decision-making",
    "Uses language that reflects personal experience",
  ], 0.92, 1.98, 7.08, 1.95, { size: 12.5, space: 8, name: "blk1" });

  chip(s, "RESPONSIBILITY  ≠  BLAME", 0.66, 4.38, 3.7, 0.6, { size: 12.5, spacing: 0.5, name: "blk2" });

  label(s, "LANGUAGE IN PRACTICE  ·  EXAMPLE", 0.66, 5.18, 6, { name: "blk3" });
  const ex = [
    { mark: "✗", bg: NO_BG, ln: NO_LN, mc: SLATE_D, q: "“You make me angry.”" },
    { mark: "✓", bg: OK_BG, ln: OK_LN, mc: NAVY, q: "“I notice that I become angry when…”" },
  ];
  ex.forEach((e, i) => {
    const y = 5.5 + i * 0.78;
    card(s, 0.66, y, 7.6, 0.68, { fill: e.bg, r: 0.06, name: "blk3" });
    s.addShape("ellipse", { x: 0.88, y: y + 0.14, w: 0.4, h: 0.4, fill: { color: WHITE }, line: { color: e.ln, width: 1 }, objectName: "blk3" });
    s.addText(e.mark, { x: 0.88, y: y + 0.14, w: 0.4, h: 0.4, align: "center", valign: "middle", fontFace: BODY, fontSize: 12, bold: true, color: e.mc, margin: 0, objectName: "blk3" });
    s.addText(e.q, { x: 1.46, y, w: 6.6, h: 0.68, valign: "middle", fontFace: BODY, fontSize: 13, italic: true, color: TEXT, margin: 0, objectName: "blk3" });
  });

  photo(s, "h-walking.jpg", 8.5, 1.74, 4.16, 4.66);
  citation(s, "(Perls et al., 1951; Corey, 2024)", { x: 8.5, y: 6.55, w: 4.16, name: "blk4" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 12 — ROLE OF THE GESTALT COUNSELLOR                                  */
/* ========================================================================== */
{
  const s = newSlide("Role of the Gestalt Counsellor");
  s.background = { color: DEEP };
  bgPhoto(s, "bg-dark.jpg", true);
  header(s, "PRACTICE  ·  THE COUNSELLOR", "Role of the Gestalt Counsellor", { dark: true, w: 11.5 });

  photo(s, "h-session.jpg", 0.66, 1.9, 6.3, 4.55, { dark: true });

  card(s, 7.2, 2.3, 5.45, 4.15, { fill: NAVY, dark: true, name: "blk1" });
  label(s, "THE ROLE", 7.46, 2.5, 3, { dark: true, size: 8.5, name: "blk1" });
  numberedList(s, [
    "Facilitates awareness",
    "Focuses on present experience",
    "Observes verbal and non-verbal behaviour",
    "Uses the therapeutic relationship",
    "Encourages authentic expression",
    "Explores interruptions in contact",
    "Promotes responsibility and choice",
  ], 7.46, 2.9, 4.95, { size: 12, step: 0.5, dark: true, rowH: 0.46, name: "blk1" });

  citation(s, "(Joyce & Sills, 2014; Brownell, 2010)", { y: 6.62, dark: true, w: 6.3, name: "blk2" });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 13 — GESTALT THERAPEUTIC TECHNIQUES                                  */
/* ========================================================================== */
{
  const s = newSlide("Gestalt Therapeutic Techniques");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "PRACTICE", "Gestalt Therapeutic Techniques", { x: 0.66, w: 9.2 });

  photo(s, "p-chairs2.jpg", 0.66, 1.74, 3.0, 4.9);

  const tech = ["Empty-chair technique", "Two-chair dialogue", "Exaggeration", "Staying with the feeling", "Role-play", "Body awareness", "“I” statements", "Dream work", "Here-and-now questioning"];
  tech.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 3.95 + col * 2.98, y = 1.74 + row * 1.34 + (col === 1 ? 0.28 : 0);
    const nm = `blk${col + 1}`;
    card(s, x, y, 2.74, 1.16, { r: 0.07, name: nm });
    s.addShape("rect", { x, y, w: 2.74, h: 0.05, fill: { color: PERI }, objectName: nm });
    s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.2, y: y + 0.16, w: 1, h: 0.28, fontFace: BSEMI, bold: true, fontSize: 10.5, color: SLATE_D, margin: 0, objectName: nm });
    s.addText(t, { x: x + 0.2, y: y + 0.46, w: 2.38, h: 0.6, fontFace: HSEMI, bold: true, fontSize: 11.5, color: NAVY, margin: 0, lineSpacingMultiple: 1.1, objectName: nm });
  });
  citation(s, "(Joyce & Sills, 2014)", { x: 3.95, y: 6.15, w: 8, name: "blk4" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 14 — EMPTY-CHAIR TECHNIQUE                                           */
/* ========================================================================== */
{
  const s = newSlide("Empty-Chair Technique");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "PRACTICE", "Empty-Chair Technique", { w: 7 });

  card(s, 0.66, 1.74, 6.4, 2.6, { name: "blk1" });
  bullets(s, [
    "Client imagines another person in an empty chair",
    "Speaks directly to the imagined person",
    [{ t: "Brings unresolved experiences into " }, { t: "present awareness", b: true }],
    "Facilitates expression of unfinished emotions",
    "May promote new awareness and perspectives",
  ], 0.92, 1.96, 5.88, 2.2, { size: 12, space: 7, name: "blk1" });

  card(s, 1.1, 4.6, 5.96, 1.9, { name: "blk2" });
  s.addShape("rect", { x: 1.1, y: 4.6, w: 0.07, h: 1.9, fill: { color: PERI }, objectName: "blk2" });
  s.addText("“", { x: 1.34, y: 4.68, w: 0.7, h: 0.7, fontFace: HEAD, fontSize: 30, bold: true, color: SLATE_D, margin: 0, objectName: "blk2" });
  label(s, "EXAMPLE", 2.05, 4.84, 2, { name: "blk2" });
  s.addText("Imagine your father is sitting in that chair. What would you want him to hear from you?", {
    x: 2.05, y: 5.2, w: 4.75, h: 1.15, fontFace: HEAD, fontSize: 13.5, italic: true, color: NAVY, margin: 0, lineSpacingMultiple: 1.3, objectName: "blk2",
  });

  photo(s, "p-chairs.jpg", 7.3, 1.74, 5.37, 4.03);

  card(s, 7.3, 5.95, 5.37, 0.98, { fill: NAVY, dark: true, name: "blk3" });
  label(s, "THE SETUP", 7.5, 6.05, 3, { dark: true, size: 8, name: "blk3" });
  chip(s, "CLIENT", 7.5, 6.36, 1.5, 0.5, { fill: DEEP, color: WHITE, size: 10.5, spacing: 0.5, name: "blk3" });
  s.addText("↔", { x: 9.03, y: 6.36, w: 0.4, h: 0.5, align: "center", valign: "middle", fontFace: BODY, fontSize: 15, bold: true, color: PERI, margin: 0, objectName: "blk3" });
  chip(s, "IMAGINED PERSON", 9.5, 6.36, 1.85, 0.5, { fill: WHITE, transp: 88, color: WHITE, size: 9, line: GLASSLN, spacing: 0.5, name: "blk3" });

  citation(s, "(Joyce & Sills, 2014)", { x: 0.66, y: 6.68, w: 6, name: "blk2" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 15 — OTHER EXPERIENTIAL TECHNIQUES (table)                           */
/* ========================================================================== */
{
  const s = newSlide("Other Experiential Techniques");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "PRACTICE", "Other Experiential Techniques", { w: 10.2 });
  s.addImage({ path: A("circle-candle.png"), x: 11.32, y: 0.42, w: 1.35, h: 1.35 });

  card(s, 0.66, 1.66, 12.01, 4.98, { name: "blk1" });
  const rows = [
    ["Two-chair dialogue", "Explore opposing parts"],
    ["Exaggeration", "Increase awareness"],
    ["Staying with the feeling", "Explore emerging emotions"],
    ["Body awareness", "Notice physical experience"],
    ["“I” statements", "Own personal experience"],
    ["Dream work", "Explore present meaning"],
  ];
  s.addShape("rect", { x: 0.9, y: 1.9, w: 4.3, h: 0.5, fill: { color: NAVY }, objectName: "blk1" });
  s.addShape("rect", { x: 5.2, y: 1.9, w: 7.23, h: 0.5, fill: { color: NAVY }, objectName: "blk1" });
  s.addText("TECHNIQUE", { x: 1.16, y: 1.9, w: 3.9, h: 0.5, valign: "middle", fontFace: BSEMI, bold: true, fontSize: 10.5, color: WHITE, charSpacing: 1.5, margin: 0, objectName: "blk1" });
  s.addText("PURPOSE", { x: 5.46, y: 1.9, w: 3.9, h: 0.5, valign: "middle", fontFace: BSEMI, bold: true, fontSize: 10.5, color: WHITE, charSpacing: 1.5, margin: 0, objectName: "blk1" });
  rows.forEach((r, i) => {
    const y = 2.4 + i * 0.66;
    s.addShape("rect", { x: 0.9, y, w: 11.53, h: 0.66, fill: { color: i % 2 ? "F7F9FC" : WHITE }, objectName: "blk1" });
    s.addShape("rect", { x: 0.9, y: y + 0.66, w: 11.53, h: 0.012, fill: { color: LINE }, objectName: "blk1" });
    s.addText(r[0], { x: 1.16, y, w: 3.9, h: 0.66, valign: "middle", fontFace: BSEMI, bold: true, fontSize: 12, color: NAVY, margin: 0, objectName: "blk1" });
    s.addText(r[1], { x: 5.46, y, w: 6.9, h: 0.66, valign: "middle", fontFace: BODY, fontSize: 12, color: TEXT, margin: 0, objectName: "blk1" });
  });
  citation(s, "(Joyce & Sills, 2014)", { y: 6.82, w: 8, name: "blk2" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 16 — APPLICATION IN COUNSELLING                                      */
/* ========================================================================== */
{
  const s = newSlide("Application in Counselling");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "PRACTICE", "Application in Counselling", { w: 10.6 });

  card(s, 0.66, 1.74, 7.4, 3.3, { name: "blk1" });
  label(s, "GESTALT THERAPY CAN BE APPLIED TO", 0.92, 1.94, 7, { name: "blk1" });
  const apps = ["Grief and loss", "Relationship difficulties", "Anxiety and emotional distress", "Unresolved anger", "Identity concerns", "Emotional-expression difficulties", "Personal growth", "Unresolved interpersonal experiences"];
  apps.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    chip(s, t, 0.92 + col * 3.52, 2.3 + row * 0.66, 3.34, 0.54, { size: 10.5, name: "blk1" });
  });

  card(s, 0.66, 5.25, 7.4, 1.35, { fill: NAVY, dark: true, name: "blk2" });
  label(s, "THERAPEUTIC MOVEMENT", 0.92, 5.4, 4, { dark: true, size: 8.5, name: "blk2" });
  flow(s, ["Awareness", "Contact", "Responsibility", "Choice", "Growth"], 0.92, 5.72, 6.88, 0.66, { size: 13.5, align: "left", name: "blk2" });

  photo(s, "h-group.jpg", 8.25, 1.74, 4.42, 4.86);
  citation(s, "(Brownell, 2010; Joyce & Sills, 2014)", { y: 6.72, w: 7.4, name: "blk3" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 17 — STRENGTHS                                                       */
/* ========================================================================== */
{
  const s = newSlide("Strengths of Gestalt Therapy");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "EVALUATION", "Strengths of Gestalt Therapy", { w: 7.9 });

  const strengths = [
    "Promotes self-awareness",
    "Focuses on lived experience",
    "Encourages agency and responsibility",
    "Integrates mind, emotion and body",
    "Considers person–environment interaction",
    "Encourages active client participation",
    "Supports experiential emotional processing",
  ];
  strengths.forEach((t, i) => {
    const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4;
    const x = 0.66 + col * 4.06, y = 1.74 + row * 1.1 + (col === 1 ? 0.3 : 0);
    const nm = `blk${col + 1}`;
    card(s, x, y, 3.85, 0.96, { r: 0.07, name: nm });
    s.addShape("ellipse", { x: x + 0.16, y: y + 0.29, w: 0.38, h: 0.38, fill: { color: TINT }, line: { color: "C7D2E6", width: 1 }, objectName: nm });
    s.addText("✓", { x: x + 0.16, y: y + 0.29, w: 0.38, h: 0.38, align: "center", valign: "middle", fontFace: BODY, fontSize: 11, bold: true, color: NAVY, margin: 0, objectName: nm });
    s.addText(t, { x: x + 0.7, y, w: 3.0, h: 0.96, valign: "middle", fontFace: BODY, fontSize: 12, color: TEXT, margin: 0, lineSpacingMultiple: 1.15, objectName: nm });
  });

  photo(s, "h-support.jpg", 8.75, 1.74, 3.92, 4.55);
  footer(s);
}

/* ========================================================================== */
/* SLIDE 18 — LIMITATIONS AND CRITICISMS                                      */
/* ========================================================================== */
{
  const s = newSlide("Limitations and Criticisms");
  s.background = { color: DEEP };
  bgPhoto(s, "bg-dark.jpg", true);
  header(s, "EVALUATION", "Limitations and Criticisms", { dark: true, w: 10.5 });

  photo(s, "p-storm.jpg", 0.66, 1.9, 3.9, 4.55, { dark: true });

  card(s, 4.85, 1.9, 3.8, 4.55, { fill: NAVY, dark: true, name: "blk1" });
  bullets(s, [
    "Some techniques may feel intense",
    "Requires skilled and sensitive application",
    "May be challenging for clients who prefer highly structured approaches",
    [{ t: "Experiential techniques can be " }, { t: "misused", b: true }],
  ], 5.11, 2.16, 3.28, 4.05, { size: 12, space: 12, dark: true, name: "blk1" });

  card(s, 8.87, 2.25, 3.8, 4.2, { fill: NAVY, dark: true, name: "blk2" });
  bullets(s, [
    "Not every intervention suits every client",
    [{ t: "Cultural context", b: true }, { t: " must be considered" }],
    "Ethical boundaries are essential",
  ], 9.13, 2.51, 3.28, 3.7, { size: 12, space: 12, dark: true, name: "blk2" });

  citation(s, "(Corey, 2024; Joyce & Sills, 2014)", { y: 6.6, dark: true, w: 8, name: "blk3" });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 19 — CASE APPLICATION                                                */
/* ========================================================================== */
{
  const s = newSlide("Case Application");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "EVALUATION", "Case Application", { w: 9 });

  card(s, 0.66, 1.74, 3.55, 4.95, { name: "blk1" });
  photo(s, "h-students.jpg", 0.78, 1.86, 3.31, 3.08, { name: "blk1" });
  label(s, "CLIENT", 0.94, 5.16, 2.5, { name: "blk1" });
  s.addText("20-year-old undergraduate scholarship student", { x: 0.94, y: 5.44, w: 3.0, h: 0.95, fontFace: HSEMI, bold: true, fontSize: 12, color: NAVY, margin: 0, lineSpacingMultiple: 1.25, objectName: "blk1" });

  const cols = [
    { x: 4.45, y: 1.74, h: "01 · PRESENTING CONCERNS", c: DEEP, items: ["Academic anxiety", "Fear of losing scholarship", "Fear of disappointing family", "Difficulty expressing emotions", "Pressure to maintain high grades"], nm: "blk2" },
    { x: 7.24, y: 2.04, h: "02 · GESTALT CONCEPTUALIZATION", c: NAVY, items: ["Anxiety becomes figure", "Possible introjected expectations", "Limited awareness of personal needs", "Interrupted contact"], nm: "blk3" },
    { x: 10.03, y: 1.74, h: "03 · POSSIBLE INTERVENTIONS", c: SLATE_D, items: ["Here-and-now exploration", "Body awareness", "Staying with the feeling", "“I” statements", "Exploring introjected beliefs"], nm: "blk4" },
  ];
  cols.forEach((c) => {
    const ch = c.y === 2.04 ? 4.65 : 4.95;
    card(s, c.x, c.y, 2.64, ch, { name: c.nm });
    s.addShape("rect", { x: c.x, y: c.y, w: 2.64, h: 0.52, fill: { color: c.c }, objectName: c.nm });
    s.addText(c.h, { x: c.x + 0.13, y: c.y, w: 2.42, h: 0.52, valign: "middle", fontFace: BSEMI, bold: true, fontSize: 8, color: WHITE, charSpacing: 0.7, margin: 0, objectName: c.nm });
    bullets(s, c.items, c.x + 0.18, c.y + 0.72, 2.32, ch - 0.9, { size: 10.5, space: 7, lsm: 1.2, name: c.nm });
  });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 20 — CRITICAL EVALUATION                                             */
/* ========================================================================== */
{
  const s = newSlide("Critical Evaluation");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light2.jpg", false);
  header(s, "EVALUATION", "Critical Evaluation", { w: 9 });

  const panels = [
    {
      x: 0.66, y: 1.74, img: "circle-seedling.png", head: "CONTRIBUTIONS", hc: NAVY, nm: "blk1",
      items: ["Holistic understanding of human experience", "Strong emphasis on awareness", "Integrates body, emotion and cognition", "Recognizes person–environment interaction", "Promotes agency and authentic choice"],
    },
    {
      x: 6.83, y: 2.04, img: "circle-scale.png", head: "CONSIDERATIONS", hc: SLATE_D, nm: "blk2",
      items: ["Cultural adaptation", "Client readiness", "Therapist competence", "Appropriate use of experiential techniques", "Balance between present and past experience"],
    },
  ];
  panels.forEach((p) => {
    card(s, p.x, p.y, 5.84, 4.96, { name: p.nm });
    s.addImage({ path: A(p.img), x: p.x + 0.3, y: p.y + 0.26, w: 0.78, h: 0.78, objectName: p.nm });
    s.addText(p.head, { x: p.x + 1.28, y: p.y + 0.42, w: 4.3, h: 0.42, fontFace: HSEMI, bold: true, fontSize: 15.5, color: p.hc, charSpacing: 0.5, margin: 0, objectName: p.nm });
    s.addShape("rect", { x: p.x + 1.28, y: p.y + 0.9, w: 0.9, h: 0.04, fill: { color: p.hc }, objectName: p.nm });
    s.addShape("rect", { x: p.x + 0.3, y: p.y + 1.32, w: 5.24, h: 0.013, fill: { color: LINE }, objectName: p.nm });
    bullets(s, p.items, p.x + 0.3, p.y + 1.56, 5.24, 3.2, { size: 12.5, space: 11, name: p.nm });
  });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 21 — CONCLUSION                                                      */
/* ========================================================================== */
{
  const s = newSlide("Conclusion");
  s.background = { color: DEEP };
  bgPhoto(s, "bg-dark.jpg", true);
  header(s, "CLOSING", "Conclusion", { dark: true, w: 9, align: "ctr" });

  const steps = ["AWARENESS", "HERE-AND-NOW", "CONTACT", "RESPONSIBILITY & CHOICE", "GROWTH"];
  steps.forEach((t, i) => {
    const y = 1.78 + i * 0.88;
    const last = i === steps.length - 1;
    s.addText(t, {
      shape: "roundRect", rectRadius: 0.06, x: 4.97, y, w: 3.4, h: 0.54,
      fill: last ? { color: PERI } : { color: NAVY },
      line: last ? { color: PERI, width: 1 } : { color: PANEL_LN, width: 0.75 },
      align: "center", valign: "middle", fontFace: BSEMI, bold: true, fontSize: 11.5,
      color: last ? DEEP : WHITE, charSpacing: 1, margin: 0, objectName: "blk1",
    });
    if (!last) s.addText("↓", { x: 4.97, y: y + 0.5, w: 3.4, h: 0.38, align: "center", valign: "middle", fontFace: BODY, fontSize: 14, bold: true, color: LIGHT_ON_DARK, margin: 0, objectName: "blk1" });
  });

  photo(s, "p-summit.jpg", 9.3, 1.9, 3.37, 4.72, { dark: true });

  s.addText("Greater awareness creates greater possibilities for choice and change.", {
    x: 0.66, y: 6.05, w: 7.7, h: 0.42, align: "center", fontFace: HEAD, bold: false, fontSize: 14.5, italic: true, color: WHITE, margin: 0, objectName: "blk2",
  });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { x: 0.66, y: 6.55, w: 7.7, align: "center", dark: true, name: "blk2" });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 22 — REFERENCES                                                      */
/* ========================================================================== */
{
  const s = newSlide("References");
  s.background = { color: PAGE };
  bgPhoto(s, "bg-light.jpg", false);
  header(s, "CLOSING", "References", { x: 0.66, w: 9.2 });

  photo(s, "p-books.jpg", 0.66, 1.74, 3.0, 4.9);

  card(s, 3.95, 1.74, 8.72, 4.95, { name: "blk1" });
  const refs = [
    [["Brownell, P. (2010). "], ["Gestalt therapy: A guide to contemporary practice", 1], [". Springer Publishing Company."]],
    [["Corey, G. (2024). "], ["Theory and practice of counseling and psychotherapy", 1], [" (11th ed.). Cengage Learning."]],
    [["Joyce, P., & Sills, C. (2014). "], ["Skills in Gestalt counselling & psychotherapy", 1], [" (3rd ed.). SAGE."]],
    [["Perls, F. S., Hefferline, R. F., & Goodman, P. (1951). "], ["Gestalt therapy: Excitement and growth in the human personality", 1], [". Julian Press."]],
    [["Woldt, A. L., & Toman, S. M. (Eds.). (2005). "], ["Gestalt therapy: History, theory, and practice", 1], [". SAGE."]],
    [["Yontef, G., & Fuhr, R. (2005). Gestalt therapy theory of change. In A. L. Woldt & S. Toman (Eds.), "], ["Gestalt therapy: History, theory, and practice", 1], [" (pp. 81–100). SAGE."]],
  ];
  const arr = [];
  refs.forEach((runs) => {
    runs.forEach((r, i) => {
      const opt = { fontFace: BODY, fontSize: 11.5, color: TEXT, italic: !!r[1] };
      if (i === 0) { opt.paraSpaceAfter = 13; opt.lineSpacingMultiple = 1.28; }
      if (i === runs.length - 1) opt.breakLine = true;
      arr.push({ text: r[0], options: opt });
    });
  });
  s.addText(arr, { x: 4.25, y: 2.02, w: 8.12, h: 4.4, valign: "top", margin: 0, fontFace: BODY, objectName: "blk1" });
  footer(s);
}

/* ---------- write ---------- */
(async () => {
  await pptx.writeFile({ fileName: OUT });
  fs.writeFileSync(path.join(__dirname, "slides-manifest.json"), JSON.stringify(MANIFEST, null, 2));
  console.log("WROTE:", OUT);
  console.log("SLIDES:", slideNo);
})().catch((e) => { console.error(e); process.exit(1); });
