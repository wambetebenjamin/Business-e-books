/* ============================================================================
   GESTALT THEORY AND ITS APPLICATION TO COUNSELLING — deck generator
   Group 4 · MCP504 · Pan African Christian University
   THEME: follows the repository's uploaded company profile (Lynton Events)
   entirely — extracted from company profile.pdf:
     · Fonts: Poppins family — Bold (titles) / SemiBold (subheads, chips) /
       Regular (body) / Italic (citations, quotes)
     · Colours: deep navy #162B57 · dark navy #0A1937 · periwinkle #8097BE
       · slate #717E9B · white — flat corporate, no ornaments
   STRUCTURE: every content slide = eyebrow section tag → title → rule;
   numbered rows, labeled panels, card grids and a consistent content grid.
   Run:  node build.js   →  output/<Deck Title>.pptx
   ========================================================================== */
const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

const A = (p) => path.join(__dirname, "assets", p);
const OUT_DIR = path.join(__dirname, "output");
const OUT = path.join(OUT_DIR, "Gestalt Theory and Its Application to Counselling.pptx");
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- design tokens (from company profile.pdf) ---------- */
const NAVY = "162B57";      // primary brand navy
const DEEP = "0A1937";      // dark navy
const PERI = "8097BE";      // soft periwinkle accent
const SLATE = "717E9B";     // muted slate blue
const SLATE_D = "5A6B94";   // darker slate (labels on light)
const WHITE = "FFFFFF";
const TINT = "E8EDF6";      // light periwinkle tint (chips)
const TINT2 = "F0F3F9";     // zebra tint
const LINE = "D9E0EC";      // hairlines on light
const TEXT = "2B3550";      // body text
const MUTED = "6B7590";     // muted text on light
const MUTED_D = "AAB7D4";   // muted text on dark
const HAIR_D = "31415F";    // hairlines on dark
const PANEL_LN = "46608F";  // panel lines on dark
const GLASSLN = "5C6C8F";   // glass border on dark
const LIGHT_ON_DARK = "C9D4EA";
const OK_BG = "E3EAF6", OK_LN = "AFBDD8";   // ✓ card
const NO_BG = "ECF0F6", NO_LN = "C3CCDC";   // ✗ card
const BOLD = "Poppins", SEMI = "Poppins SemiBold", BODY = "Poppins";
const BRAND = "PAN AFRICAN CHRISTIAN UNIVERSITY  ·  MCP504";
const TITLE_DECK = "Gestalt Theory and Its Application to Counselling";

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
  s.addText(BRAND, { x: 0.66, y: 7.13, w: 9, h: 0.24, fontFace: BODY, fontSize: 7.5, color: dark ? MUTED_D : MUTED, charSpacing: 1.5, margin: 0 });
  s.addText(String(slideNo).padStart(2, "0"), { x: 11.7, y: 7.13, w: 0.97, h: 0.24, align: "right", fontFace: SEMI, fontSize: 8, color: dark ? WHITE : NAVY, margin: 0 });
}

/* section header: eyebrow tag → title → accent rule (content starts at 1.74) */
function header(s, eyebrow, txt, o = {}) {
  const x = o.x ?? 0.66, w = o.w ?? 11.4, dark = !!o.dark;
  s.addText(eyebrow, { x, y: 0.6, w, h: 0.26, fontFace: SEMI, fontSize: 9, color: dark ? PERI : SLATE_D, charSpacing: 2.5, margin: 0, align: o.align ?? "left" });
  s.addText(txt, { x, y: 0.86, w, h: 0.56, fontFace: BOLD, fontSize: 25, bold: true, color: dark ? WHITE : NAVY, charSpacing: 0.75, margin: 0, align: o.align ?? "left" });
  if (o.align === "ctr") {
    s.addShape("rect", { x: 6.167, y: 1.46, w: 1.0, h: 0.045, fill: { color: dark ? PERI : NAVY } });
  } else {
    s.addShape("rect", { x, y: 1.46, w: 1.0, h: 0.045, fill: { color: dark ? PERI : NAVY } });
  }
}

function label(s, txt, x, y, w, o = {}) {
  s.addText(txt, { x, y, w, h: 0.26, fontFace: SEMI, fontSize: o.size ?? 9, color: o.color ?? (o.dark ? PERI : SLATE_D), charSpacing: 2.2, margin: 0, align: o.align ?? "left" });
}

/* lead statement — larger semibold opening line */
function lead(s, txt, x, y, w, o = {}) {
  s.addText(txt, { x, y, w, h: o.h ?? 0.45, fontFace: SEMI, fontSize: o.size ?? 16.5, color: o.dark ? WHITE : NAVY, margin: 0, lineSpacingMultiple: 1.15 });
}

/* emphasized statement row with periwinkle marker bar */
function statement(s, txt, x, y, w, o = {}) {
  s.addShape("rect", { x, y, w: 0.05, h: 0.46, fill: { color: PERI } });
  s.addText(txt, { x: x + 0.22, y, w: w - 0.22, h: 0.46, fontFace: SEMI, fontSize: o.size ?? 14, color: o.dark ? WHITE : NAVY, margin: 0, valign: "middle" });
}

function citation(s, txt, o = {}) {
  s.addText(txt, { x: o.x ?? 0.66, y: o.y ?? 6.6, w: o.w ?? 8.6, h: 0.3, fontFace: BODY, fontSize: 10, italic: true, color: o.dark ? MUTED_D : MUTED, margin: 0, align: o.align ?? "left" });
}

/** bullet list — items: string | array of runs {t, b, i, color, size} */
function bullets(s, items, x, y, w, h, o = {}) {
  const arr = [];
  items.forEach((it) => {
    const runs = Array.isArray(it) ? it : [typeof it === "string" ? { t: it } : it];
    runs.forEach((r, i) => {
      const opt = {
        fontFace: r.font ?? BODY,
        fontSize: r.size ?? o.size ?? 14,
        color: r.color ?? (o.dark ? WHITE : TEXT),
        bold: !!r.b,
        italic: !!r.i,
      };
      if (i === 0) {
        opt.bullet = { code: o.bulletCode ?? "2013", indent: o.indent ?? 11 };
        opt.paraSpaceAfter = o.space ?? 10;
        opt.lineSpacingMultiple = o.lsm ?? 1.22;
      }
      if (i === runs.length - 1) opt.breakLine = true;
      arr.push({ text: r.t, options: opt });
    });
  });
  s.addText(arr, { x, y, w, h, valign: "top", margin: 0, fontFace: BODY });
}

function chip(s, txt, x, y, w, h, o = {}) {
  s.addText(txt, {
    shape: "roundRect", rectRadius: o.r ?? 0.06, x, y, w, h,
    fill: { color: o.fill ?? WHITE, transparency: o.transp ?? 0 },
    line: { color: o.line ?? LINE, width: 1 },
    align: "center", valign: "middle", fontFace: o.font ?? SEMI,
    fontSize: o.size ?? 12, bold: o.bold ?? false, color: o.color ?? NAVY,
    margin: 0, charSpacing: o.spacing ?? 0,
  });
}

/** horizontal flow: words joined by periwinkle arrows */
function flow(s, words, x, y, w, h, o = {}) {
  const arr = [];
  words.forEach((word, i) => {
    arr.push({ text: word, options: { fontFace: o.font ?? SEMI, fontSize: o.size ?? 14, color: o.color ?? WHITE } });
    if (i < words.length - 1) arr.push({ text: "  →  ", options: { fontFace: BODY, fontSize: o.size ?? 14, color: o.arrow ?? PERI } });
  });
  s.addText(arr, { x, y, w, h, align: o.align ?? "center", valign: "middle", margin: 0 });
}

/** numbered rows — items laid out as number chips + text lines */
function numberedList(s, items, x, y, w, o = {}) {
  const step = o.step ?? 0.56, dark = !!o.dark;
  items.forEach((it, i) => {
    const runs = Array.isArray(it) ? it : [it];
    const yy = y + i * step;
    s.addText(String(i + 1).padStart(2, "0"), { x, y: yy + (o.numTop ?? 0), w: o.numW ?? 0.42, h: 0.3, fontFace: SEMI, fontSize: o.numSize ?? 10.5, color: PERI, margin: 0 });
    s.addText(runs.map((r) => (typeof r === "string" ? { t: r } : r)).map((r) => ({
      text: r.t, options: { fontFace: r.font ?? BODY, fontSize: r.size ?? o.size ?? 12.5, color: r.color ?? (dark ? WHITE : TEXT), bold: !!r.b, italic: !!r.i },
    })), { x: x + (o.numW ?? 0.42) + 0.18, y: yy, w: w - (o.numW ?? 0.42) - 0.18, h: o.rowH ?? step, valign: "top", margin: 0, lineSpacingMultiple: 1.15 });
  });
}

/* ========================================================================== */
/* SLIDE 1 — TITLE                                                            */
/* ========================================================================== */
{
  const s = newSlide("Gestalt Theory and Its Application to Counselling");
  s.background = { color: DEEP };
  // photo column right, solid navy panel left (profile style: white on navy)
  s.addImage({ path: A("title-photo.jpg"), x: 7.6, y: 0, w: 5.733, h: 7.5 });
  s.addShape("rect", { x: 7.6, y: 0, w: 5.733, h: 7.5, fill: { color: DEEP, transparency: 82 } });
  s.addShape("rect", { x: 7.56, y: 0, w: 0.045, h: 7.5, fill: { color: PERI } });

  label(s, "GROUP 4 PRESENTATION  ·  MCP504", 0.66, 0.76, 6.6, { color: PERI, size: 10 });
  s.addText("GESTALT", { x: 0.62, y: 1.0, w: 6.9, h: 0.76, fontFace: BOLD, fontSize: 44, bold: true, color: WHITE, charSpacing: 0.5, margin: 0 });
  s.addText("THEORY", { x: 0.62, y: 1.82, w: 6.9, h: 0.76, fontFace: BOLD, fontSize: 44, bold: true, color: WHITE, charSpacing: 0.5, margin: 0 });
  s.addText("AND ITS APPLICATION TO COUNSELLING", { x: 0.66, y: 2.8, w: 6.9, h: 0.36, fontFace: SEMI, fontSize: 14.5, color: LIGHT_ON_DARK, charSpacing: 2, margin: 0 });
  s.addShape("rect", { x: 0.68, y: 3.24, w: 1.2, h: 0.045, fill: { color: PERI } });

  // members panel (light glass on solid navy) with hairline row separators
  s.addShape("roundRect", { x: 0.66, y: 3.52, w: 6.64, h: 1.86, rectRadius: 0.06, fill: { color: WHITE, transparency: 92 }, line: { color: GLASSLN, width: 0.75 } });
  label(s, "PRESENTED BY  ·  GROUP 4 MEMBERS", 0.94, 3.68, 5, { color: PERI, size: 8.5 });
  const members = [
    ["Josephine Biwott", "MACP/35996/0/26"],
    ["Cynthia Cherono", "MACP/35785/4/26"],
    ["Yvonne Juliet Awuor", "MALD/36547/4/26"],
  ];
  members.forEach((m, i) => {
    const y = 4.0 + i * 0.44;
    if (i > 0) s.addShape("rect", { x: 0.94, y: y - 0.05, w: 6.08, h: 0.012, fill: { color: HAIR_D } });
    s.addText([
      { text: m[0], options: { fontFace: SEMI, fontSize: 13, color: WHITE } },
      { text: "    ·    " + m[1], options: { fontFace: BODY, fontSize: 11.5, color: MUTED_D } },
    ], { x: 0.94, y, w: 6.1, h: 0.38, margin: 0, valign: "middle" });
  });

  // bottom info row with vertical hairlines
  s.addShape("rect", { x: 0.68, y: 5.62, w: 6.6, h: 0.012, fill: { color: HAIR_D } });
  s.addShape("rect", { x: 3.84, y: 5.82, w: 0.012, h: 0.88, fill: { color: HAIR_D } });
  s.addShape("rect", { x: 6.22, y: 5.82, w: 0.012, h: 0.88, fill: { color: HAIR_D } });
  const info = [
    ["COURSE", "MCP504 · Theories of Counseling and Psychotherapy", 0.66, 3.0],
    ["INSTITUTION", "Pan African Christian University", 4.02, 2.05],
    ["LECTURER", "Dr. Lucy Gachenia", 6.4, 1.6],
  ];
  info.forEach((r) => {
    label(s, r[0], r[2], 5.8, r[3], { color: PERI, size: 8.5 });
    s.addText(r[1], { x: r[2], y: 6.08, w: r[3], h: 0.72, fontFace: BODY, fontSize: 11.5, color: WHITE, margin: 0, lineSpacingMultiple: 1.18 });
  });
}

/* ========================================================================== */
/* SLIDE 2 — INTRODUCTION                                                     */
/* ========================================================================== */
{
  const s = newSlide("Introduction");
  s.background = { color: WHITE };
  s.addImage({ path: A("side-intro.jpg"), x: 8.7, y: 0, w: 4.633, h: 6.95 });
  s.addShape("rect", { x: 8.655, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "OVERVIEW", "INTRODUCTION", { w: 7.6 });

  lead(s, "Experiential and humanistic approach to counselling", 0.66, 1.78, 7.6, { size: 17 });
  s.addShape("rect", { x: 0.68, y: 2.52, w: 7.5, h: 0.013, fill: { color: LINE } });
  bullets(s, [
    [{ t: "Emphasizes " }, { t: "awareness, present experience and contact", b: true }],
    [{ t: "Understands individuals within their " }, { t: "environment and relationships", b: true }],
    [{ t: "Encourages personal responsibility, choice and authentic living" }],
    [{ t: "Focuses on the client's experience in the " }, { t: "here-and-now", b: true }],
  ], 0.66, 2.78, 7.55, 3.5, { size: 14.5, space: 15 });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.5, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 3 — HISTORICAL BACKGROUND                                            */
/* ========================================================================== */
{
  const s = newSlide("Historical Background");
  s.background = { color: WHITE };
  s.addImage({ path: A("strip-history.jpg"), x: 0, y: 0, w: 3.4, h: 6.95 });
  s.addShape("rect", { x: 3.4, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "FOUNDATIONS", "HISTORICAL BACKGROUND", { x: 3.85, w: 8.6 });
  bullets(s, [
    [{ t: "Emerged during the " }, { t: "1940s and 1950s", b: true }],
    [{ t: "Developed partly in response to limitations perceived in " }, { t: "traditional psychoanalysis", b: true }],
  ], 3.85, 1.74, 8.78, 1.2, { size: 14.5, space: 11 });

  // influences grouped in one tinted panel
  s.addShape("roundRect", { x: 3.85, y: 3.08, w: 8.82, h: 1.62, rectRadius: 0.06, fill: { color: TINT2 }, line: { color: LINE, width: 1 } });
  label(s, "INFLUENCED BY", 4.09, 3.24, 4);
  chip(s, "Gestalt psychology", 4.09, 3.58, 2.62, 0.5, { size: 11.5, fill: WHITE });
  chip(s, "Phenomenology", 6.89, 3.58, 2.3, 0.5, { size: 11.5, fill: WHITE });
  chip(s, "Existential philosophy", 9.39, 3.58, 2.86, 0.5, { size: 11.5, fill: WHITE });
  chip(s, "Field theory", 4.09, 4.12, 1.85, 0.5, { size: 11.5, fill: WHITE });
  chip(s, "Holistic approaches", 6.14, 4.12, 2.35, 0.5, { size: 11.5, fill: WHITE });

  statement(s, "Emphasized experience, awareness and contact", 3.85, 4.98, 8.6, { size: 13.5 });

  s.addShape("roundRect", { x: 3.85, y: 5.58, w: 8.82, h: 1.16, rectRadius: 0.06, fill: { color: NAVY } });
  label(s, "INTELLECTUAL ROOTS", 4.05, 5.72, 4, { dark: true, size: 8.5 });
  flow(s, ["Gestalt Psychology", "Phenomenology", "Existentialism", "Field Theory", "Gestalt Therapy"], 4.05, 6.02, 8.42, 0.56, { size: 11, align: "left" });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { x: 3.85, y: 6.82, w: 8.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 4 — MAJOR THEORISTS                                                  */
/* ========================================================================== */
{
  const s = newSlide("Major Theorists");
  s.background = { color: WHITE };
  s.addImage({ path: A("banner-theorists.jpg"), x: 0, y: 0, w: 13.333, h: 2.2 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 2.2, fill: { color: DEEP, transparency: 30 } });
  header(s, "FOUNDATIONS", "MAJOR THEORISTS", { dark: true, w: 10 });
  s.addShape("rect", { x: 0, y: 2.2, w: 13.333, h: 0.035, fill: { color: PERI } });

  const people = [
    { ini: "FP", name: "Fritz Perls", yrs: "1893–1970", role: "Major founder", det: "Awareness, experience and responsibility", c: NAVY, rc: NAVY },
    { ini: "LP", name: "Laura Perls", yrs: "1905–1990", role: "Major contributor", det: "Contact, relationship and embodied experience", c: SLATE_D, rc: SLATE_D },
    { ini: "PG", name: "Paul Goodman", yrs: "1911–1972", role: "Co-author of Gestalt Therapy (1951)", det: "Major contributor to theoretical formulation", c: PERI, rc: SLATE_D },
  ];
  const cw = 3.837, gap = 0.25;
  people.forEach((p, i) => {
    const x = 0.66 + i * (cw + gap);
    s.addShape("rect", { x, y: 2.62, w: cw, h: 3.85, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
    s.addShape("rect", { x, y: 2.62, w: cw, h: 0.09, fill: { color: p.c } });
    s.addShape("ellipse", { x: x + 0.3, y: 2.98, w: 0.78, h: 0.78, fill: { color: TINT }, line: { color: LINE, width: 1 } });
    s.addText(p.ini, { x: x + 0.3, y: 2.98, w: 0.78, h: 0.78, align: "center", valign: "middle", fontFace: BOLD, fontSize: 14, bold: true, color: NAVY, margin: 0 });
    s.addText(p.name, { x: x + 1.26, y: 3.06, w: cw - 1.4, h: 0.4, fontFace: SEMI, fontSize: 16, color: NAVY, margin: 0 });
    s.addText(p.yrs, { x: x + 1.26, y: 3.47, w: cw - 1.4, h: 0.3, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0 });
    s.addShape("rect", { x: x + 0.3, y: 4.0, w: cw - 0.6, h: 0.013, fill: { color: LINE } });
    s.addText(p.role, { x: x + 0.3, y: 4.18, w: cw - 0.6, h: 0.62, fontFace: SEMI, fontSize: 12.5, color: p.rc, margin: 0, lineSpacingMultiple: 1.1 });
    s.addText(p.det, { x: x + 0.3, y: 4.92, w: cw - 0.6, h: 1.35, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0, lineSpacingMultiple: 1.2 });
  });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { y: 6.65 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 5 — CORE ASSUMPTIONS                                                 */
/* ========================================================================== */
{
  const s = newSlide("Core Assumptions of Gestalt Therapy");
  s.background = { color: DEEP };
  s.addImage({ path: A("bg-assumptions.jpg"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 22 } });
  header(s, "FOUNDATIONS", "CORE ASSUMPTIONS OF GESTALT THERAPY", { dark: true, w: 11.5 });

  s.addShape("roundRect", { x: 0.66, y: 1.8, w: 6.1, h: 3.35, rectRadius: 0.06, fill: { color: DEEP, transparency: 45 }, line: { color: PANEL_LN, width: 0.75 } });
  numberedList(s, [
    "People are best understood as whole persons",
    "Human experience is influenced by the environment",
    "Awareness is central to psychological growth",
    "Experience unfolds in the present",
  ], 0.92, 2.42, 5.6, { size: 13, step: 0.62, dark: true, rowH: 0.56 });

  s.addShape("roundRect", { x: 7.0, y: 1.8, w: 5.65, h: 3.35, rectRadius: 0.06, fill: { color: DEEP, transparency: 45 }, line: { color: PANEL_LN, width: 0.75 } });
  numberedList(s, [
    "People have capacity for choice and self-regulation",
    "Healthy functioning involves meaningful contact",
  ], 7.26, 2.42, 5.15, { size: 13, step: 0.62, dark: true, rowH: 0.56 });
  s.addText(String(7).padStart(2, "0"), { x: 7.26, y: 3.66, w: 0.42, h: 0.3, fontFace: SEMI, fontSize: 10.5, color: PERI, margin: 0 });
  s.addText("Psychological difficulties may involve interruptions in awareness or contact", { x: 7.86, y: 3.62, w: 4.55, h: 0.85, fontFace: BODY, fontSize: 13, color: WHITE, margin: 0, lineSpacingMultiple: 1.15 });

  citation(s, "(Perls et al., 1951; Brownell, 2010; Joyce & Sills, 2014)", { y: 6.55, dark: true, w: 9 });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 6 — AWARENESS                                                        */
/* ========================================================================== */
{
  const s = newSlide("Awareness");
  s.background = { color: WHITE };
  s.addImage({ path: A("side-awareness.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "CORE CONCEPTS", "AWARENESS", { w: 7.6 });

  lead(s, "Central concept in Gestalt therapy", 0.66, 1.74, 7.6, { size: 16 });

  s.addShape("roundRect", { x: 0.66, y: 2.32, w: 7.9, h: 1.46, rectRadius: 0.06, fill: { color: TINT2 }, line: { color: LINE, width: 1 } });
  label(s, "NOTICING", 0.9, 2.46, 3);
  ["Thoughts", "Feelings", "Bodily sensations", "Behaviour", "Needs"].forEach((t, i) => {
    chip(s, t, 0.9 + i * 1.54, 2.8, 1.44, 0.52, { size: 10.5, fill: WHITE });
  });

  ["Focuses on present experience", "Creates opportunities for choice and change"].forEach((t, i) => {
    s.addShape("rect", { x: 0.68 + i * 4.05, y: 4.1, w: 0.12, h: 0.12, fill: { color: PERI } });
    s.addText(t, { x: 0.94 + i * 4.05, y: 3.96, w: 3.8, h: 0.42, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0, valign: "middle" });
  });

  label(s, "THE PROCESS", 0.66, 4.66, 3);
  chip(s, "AWARENESS", 0.66, 5.02, 2.45, 0.66, { fill: DEEP, color: WHITE, size: 13, line: DEEP });
  s.addText("→", { x: 3.16, y: 5.02, w: 0.55, h: 0.66, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: SLATE, margin: 0 });
  chip(s, "CHOICE", 3.76, 5.02, 1.9, 0.66, { fill: NAVY, color: WHITE, size: 13, line: NAVY });
  s.addText("→", { x: 5.71, y: 5.02, w: 0.55, h: 0.66, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: SLATE, margin: 0 });
  chip(s, "CHANGE", 6.32, 5.02, 2.0, 0.66, { fill: PERI, color: DEEP, size: 13, line: PERI });

  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.55, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 7 — THE HERE-AND-NOW                                                 */
/* ========================================================================== */
{
  const s = newSlide("The Here-and-Now");
  s.background = { color: WHITE };
  s.addImage({ path: A("side-herenow.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "CORE CONCEPTS", "THE HERE-AND-NOW", { w: 7.9 });

  // focus vs past contrast panels
  s.addShape("rect", { x: 0.66, y: 1.74, w: 3.85, h: 2.35, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 0.66, y: 1.74, w: 3.85, h: 0.05, fill: { color: NAVY } });
  label(s, "THE FOCUS", 0.9, 1.96, 3);
  s.addText("Focuses on the client's present experience", { x: 0.9, y: 2.28, w: 3.4, h: 0.7, fontFace: SEMI, fontSize: 13.5, color: NAVY, margin: 0, lineSpacingMultiple: 1.15 });
  s.addText("Includes thoughts, emotions, bodily sensations and behaviour", { x: 0.9, y: 3.06, w: 3.4, h: 0.85, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.18 });

  s.addShape("rect", { x: 4.71, y: 1.74, w: 3.85, h: 2.35, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 4.71, y: 1.74, w: 3.85, h: 0.05, fill: { color: SLATE_D } });
  label(s, "THE PAST", 4.95, 1.96, 3, { color: SLATE_D });
  s.addText("Past experiences are explored through their current impact", { x: 4.95, y: 2.28, w: 3.4, h: 1.3, fontFace: SEMI, fontSize: 13.5, color: NAVY, margin: 0, lineSpacingMultiple: 1.2 });

  bullets(s, [
    [{ t: "Encourages " }, { t: "direct experience", b: true }, { t: " rather than excessive intellectual analysis" }],
    [{ t: "The therapeutic relationship provides an opportunity for " }, { t: "present-moment awareness", b: true }],
  ], 0.66, 4.42, 7.9, 1.8, { size: 13.5, space: 13 });
  citation(s, "(Perls et al., 1951; Brownell, 2010)", { y: 6.5, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 8 — FIGURE AND GROUND                                                */
/* ========================================================================== */
{
  const s = newSlide("Figure and Ground");
  s.background = { color: WHITE };
  header(s, "CORE CONCEPTS", "FIGURE AND GROUND", { w: 8 });

  // flat figure/ground illustration: concentric ground rings + figure circle
  s.addShape("roundRect", { x: 0.66, y: 1.74, w: 5.3, h: 4.5, rectRadius: 0.06, fill: { color: DEEP } });
  [4.35, 3.55, 2.85].forEach((d) => {
    s.addShape("ellipse", { x: 3.31 - d / 2, y: 3.99 - d / 2, w: d, h: d, fill: { color: DEEP, transparency: 100 }, line: { color: PANEL_LN, width: 1 } });
  });
  s.addShape("ellipse", { x: 2.46, y: 3.14, w: 1.7, h: 1.7, fill: { color: WHITE }, line: { color: WHITE, width: 1.25 } });
  s.addText("FIGURE", { x: 2.46, y: 4.94, w: 1.7, h: 0.28, align: "center", fontFace: SEMI, fontSize: 9, color: PERI, charSpacing: 2.2, margin: 0 });
  s.addText("GROUND", { x: 0.96, y: 5.78, w: 2.5, h: 0.26, fontFace: SEMI, fontSize: 9, color: MUTED_D, charSpacing: 2.2, margin: 0 });
  s.addText("One element steps forward as figure against a ground of context.", { x: 0.66, y: 6.38, w: 5.3, h: 0.3, fontFace: BODY, fontSize: 9.5, italic: true, color: MUTED, margin: 0 });

  s.addShape("rect", { x: 6.3, y: 1.74, w: 6.37, h: 1.04, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 6.3, y: 1.74, w: 0.08, h: 1.04, fill: { color: NAVY } });
  s.addText("FIGURE", { x: 6.58, y: 1.88, w: 3, h: 0.36, fontFace: SEMI, fontSize: 14.5, color: NAVY, charSpacing: 0.5, margin: 0 });
  s.addText("What is most prominent in awareness", { x: 6.58, y: 2.28, w: 5.9, h: 0.36, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0 });
  s.addText("↓", { x: 6.3, y: 2.8, w: 6.37, h: 0.44, align: "center", valign: "middle", fontFace: BODY, fontSize: 19, bold: true, color: SLATE_D, margin: 0 });
  s.addShape("rect", { x: 6.3, y: 3.28, w: 6.37, h: 1.04, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 6.3, y: 3.28, w: 0.08, h: 1.04, fill: { color: SLATE_D } });
  s.addText("GROUND", { x: 6.58, y: 3.42, w: 3, h: 0.36, fontFace: SEMI, fontSize: 14.5, color: SLATE_D, charSpacing: 0.5, margin: 0 });
  s.addText("The surrounding context and experiences", { x: 6.58, y: 3.82, w: 5.9, h: 0.36, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0 });

  bullets(s, [
    "Needs and concerns move between figure and ground",
    "The figure changes as circumstances change",
    "Awareness helps identify what is most significant in the present",
  ], 6.3, 4.62, 6.37, 1.8, { size: 12.5, space: 10 });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { x: 6.3, y: 6.55, w: 6.3 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 9 — CONTACT AND CONTACT BOUNDARY                                     */
/* ========================================================================== */
{
  const s = newSlide("Contact and Contact Boundary");
  s.background = { color: WHITE };
  header(s, "CORE CONCEPTS", "CONTACT AND CONTACT BOUNDARY", { w: 11 });
  bullets(s, [
    [{ t: "Contact: ", b: true }, { t: "Interaction between the individual and environment" }],
    [{ t: "Contact boundary: ", b: true }, { t: "Point at which the individual and environment meet" }],
    "Healthy contact allows needs to be addressed while maintaining a sense of self",
    [{ t: "Contact involves " }, { t: "engaging, responding and withdrawing", b: true }],
    "Relationships, culture and circumstances influence contact",
  ], 0.66, 1.74, 7.1, 4.5, { size: 13.5, space: 13 });

  s.addImage({ path: A("card-contact.jpg"), x: 8.15, y: 1.74, w: 4.52, h: 3.41 });
  s.addShape("rect", { x: 8.15, y: 1.74, w: 4.52, h: 3.41, fill: { color: WHITE, transparency: 100 }, line: { color: LINE, width: 1.25 } });

  // boundary diagram: individual ↔ contact boundary ↔ environment
  s.addShape("roundRect", { x: 8.15, y: 5.42, w: 4.52, h: 1.3, rectRadius: 0.06, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  chip(s, "INDIVIDUAL", 8.43, 5.76, 1.12, 0.6, { fill: DEEP, color: WHITE, size: 9, line: DEEP, spacing: 0.5 });
  s.addText("↔", { x: 9.55, y: 5.76, w: 0.32, h: 0.6, align: "center", valign: "middle", fontFace: BODY, fontSize: 13, bold: true, color: SLATE_D, margin: 0 });
  chip(s, "CONTACT BOUNDARY", 9.87, 5.76, 1.34, 0.6, { fill: TINT, color: NAVY, size: 9, line: "C7D2E6", spacing: 0.5 });
  s.addText("↔", { x: 11.21, y: 5.76, w: 0.32, h: 0.6, align: "center", valign: "middle", fontFace: BODY, fontSize: 13, bold: true, color: SLATE_D, margin: 0 });
  chip(s, "ENVIRONMENT", 11.53, 5.76, 0.94, 0.6, { fill: SLATE_D, color: WHITE, size: 9, line: SLATE_D, spacing: 0.5 });

  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.55, w: 7.1 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 10 — UNFINISHED BUSINESS                                             */
/* ========================================================================== */
{
  const s = newSlide("Unfinished Business");
  s.background = { color: WHITE };
  s.addImage({ path: A("strip-unfinished.jpg"), x: 0, y: 0, w: 3.4, h: 6.95 });
  s.addShape("rect", { x: 3.4, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "CORE CONCEPTS", "UNFINISHED BUSINESS", { x: 3.85, w: 8.6 });

  lead(s, "Unresolved experiences or emotions", 3.85, 1.74, 8.6, { size: 16 });

  s.addShape("roundRect", { x: 3.85, y: 2.42, w: 8.82, h: 1.56, rectRadius: 0.06, fill: { color: TINT2 }, line: { color: LINE, width: 1 } });
  label(s, "MAY INCLUDE", 4.09, 2.58, 4);
  const emo = [["Grief", 1.28], ["Anger", 1.28], ["Guilt", 1.2], ["Resentment", 1.74], ["Unmet needs", 1.95]];
  let ex = 4.09;
  emo.forEach((e) => { chip(s, e[0], ex, 3.1, e[1], 0.52, { size: 11.5, fill: WHITE }); ex += e[1] + 0.18; });

  bullets(s, [
    "Can remain psychologically active in the present",
    "May interfere with healthy contact",
  ], 3.85, 4.24, 8.78, 0.85, { size: 13.5, space: 9 });

  statement(s, "Therapy promotes awareness and processing", 3.85, 5.32, 8.6, { size: 14 });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { x: 3.85, y: 6.6, w: 8.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 11 — PERSONAL RESPONSIBILITY                                         */
/* ========================================================================== */
{
  const s = newSlide("Personal Responsibility");
  s.background = { color: WHITE };
  s.addImage({ path: A("side-responsibility.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "CORE CONCEPTS", "PERSONAL RESPONSIBILITY", { w: 7.9 });
  bullets(s, [
    "Recognizing one's own choices and responses",
    [{ t: "Promotes " }, { t: "agency and ownership", b: true }],
    "Encourages authentic decision-making",
    "Uses language that reflects personal experience",
  ], 0.66, 1.74, 7.9, 1.95, { size: 13.5, space: 10 });

  chip(s, "RESPONSIBILITY  ≠  BLAME", 0.66, 3.82, 3.7, 0.6, { fill: TINT, line: "C7D2E6", color: NAVY, size: 13, spacing: 0.5 });

  label(s, "LANGUAGE IN PRACTICE  ·  EXAMPLE", 0.66, 4.62, 6);
  const ex = [
    { mark: "✗", bg: NO_BG, ln: NO_LN, mc: SLATE_D, q: "“You make me angry.”" },
    { mark: "✓", bg: OK_BG, ln: OK_LN, mc: NAVY, q: "“I notice that I become angry when…”" },
  ];
  ex.forEach((e, i) => {
    const y = 4.95 + i * 0.8;
    s.addShape("roundRect", { x: 0.66, y, w: 7.9, h: 0.7, rectRadius: 0.06, fill: { color: e.bg }, line: { color: e.ln, width: 1 } });
    s.addShape("ellipse", { x: 0.88, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: WHITE }, line: { color: e.ln, width: 1 } });
    s.addText(e.mark, { x: 0.88, y: y + 0.14, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: BODY, fontSize: 13, bold: true, color: e.mc, margin: 0 });
    s.addText(e.q, { x: 1.5, y, w: 6.9, h: 0.7, valign: "middle", fontFace: BODY, fontSize: 13.5, italic: true, color: TEXT, margin: 0 });
  });

  citation(s, "(Perls et al., 1951; Corey, 2024)", { y: 6.62, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 12 — ROLE OF THE GESTALT COUNSELLOR                                  */
/* ========================================================================== */
{
  const s = newSlide("Role of the Gestalt Counsellor");
  s.background = { color: DEEP };
  header(s, "PRACTICE  ·  THE COUNSELLOR", "ROLE OF THE GESTALT COUNSELLOR", { dark: true, w: 11.5 });

  s.addImage({ path: A("card-counsellor.jpg"), x: 0.66, y: 1.95, w: 6.9, h: 4.6 });
  s.addShape("rect", { x: 0.66, y: 1.95, w: 6.9, h: 4.6, fill: { color: WHITE, transparency: 100 }, line: { color: HAIR_D, width: 1.25 } });

  s.addShape("roundRect", { x: 7.95, y: 1.95, w: 4.72, h: 4.6, rectRadius: 0.06, fill: { color: NAVY }, line: { color: PANEL_LN, width: 0.75 } });
  label(s, "THE ROLE", 8.2, 2.15, 3, { dark: true, size: 8.5 });
  numberedList(s, [
    "Facilitates awareness",
    "Focuses on present experience",
    "Observes verbal and non-verbal behaviour",
    "Uses the therapeutic relationship",
    "Encourages authentic expression",
    "Explores interruptions in contact",
    "Promotes responsibility and choice",
  ], 8.2, 2.56, 4.25, { size: 12.5, step: 0.55, dark: true, rowH: 0.5 });

  citation(s, "(Joyce & Sills, 2014; Brownell, 2010)", { y: 6.72, dark: true, w: 6.9 });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 13 — GESTALT THERAPEUTIC TECHNIQUES                                  */
/* ========================================================================== */
{
  const s = newSlide("Gestalt Therapeutic Techniques");
  s.background = { color: WHITE };
  s.addImage({ path: A("strip-techniques.jpg"), x: 0, y: 0, w: 3.0, h: 6.95 });
  s.addShape("rect", { x: 3.0, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "PRACTICE", "GESTALT THERAPEUTIC TECHNIQUES", { x: 3.45, w: 9.2 });
  const tech = ["Empty-chair technique", "Two-chair dialogue", "Exaggeration", "Staying with the feeling", "Role-play", "Body awareness", "“I” statements", "Dream work", "Here-and-now questioning"];
  tech.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 3.45 + col * 3.09, y = 1.74 + row * 1.28;
    s.addShape("rect", { x, y, w: 2.95, h: 1.12, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
    s.addShape("rect", { x, y, w: 2.95, h: 0.05, fill: { color: PERI } });
    s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.2, y: y + 0.16, w: 1, h: 0.3, fontFace: SEMI, fontSize: 11, color: SLATE_D, margin: 0 });
    s.addText(t, { x: x + 0.2, y: y + 0.48, w: 2.58, h: 0.55, fontFace: SEMI, fontSize: 12.5, color: NAVY, margin: 0, lineSpacingMultiple: 1.05 });
  });
  citation(s, "(Joyce & Sills, 2014)", { x: 3.45, y: 5.7, w: 8 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 14 — EMPTY-CHAIR TECHNIQUE                                           */
/* ========================================================================== */
{
  const s = newSlide("Empty-Chair Technique");
  s.background = { color: WHITE };
  header(s, "PRACTICE", "EMPTY-CHAIR TECHNIQUE", { w: 7 });
  bullets(s, [
    "Client imagines another person in an empty chair",
    "Speaks directly to the imagined person",
    [{ t: "Brings unresolved experiences into " }, { t: "present awareness", b: true }],
    "Facilitates expression of unfinished emotions",
    "May promote new awareness and perspectives",
  ], 0.66, 1.74, 7.0, 2.5, { size: 13, space: 10 });

  s.addShape("rect", { x: 0.66, y: 4.35, w: 7.0, h: 2.0, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 0.66, y: 4.35, w: 0.07, h: 2.0, fill: { color: PERI } });
  s.addText("“", { x: 0.9, y: 4.42, w: 0.7, h: 0.7, fontFace: BOLD, fontSize: 30, bold: true, color: SLATE_D, margin: 0 });
  label(s, "EXAMPLE", 1.6, 4.6, 2, { color: SLATE_D, size: 9 });
  s.addText("Imagine your father is sitting in that chair. What would you want him to hear from you?", {
    x: 1.6, y: 4.95, w: 5.8, h: 1.25, fontFace: BODY, fontSize: 14, italic: true, color: NAVY, margin: 0, lineSpacingMultiple: 1.25,
  });

  s.addImage({ path: A("card-chairs.jpg"), x: 7.95, y: 1.74, w: 4.72, h: 3.54 });
  s.addShape("rect", { x: 7.95, y: 1.74, w: 4.72, h: 3.54, fill: { color: WHITE, transparency: 100 }, line: { color: LINE, width: 1.25 } });

  s.addShape("roundRect", { x: 7.95, y: 5.5, w: 4.72, h: 1.42, rectRadius: 0.06, fill: { color: NAVY } });
  label(s, "THE SETUP", 8.15, 5.64, 3, { dark: true, size: 8.5 });
  chip(s, "CLIENT", 8.15, 6.02, 1.6, 0.56, { fill: DEEP, color: WHITE, size: 11, line: DEEP, spacing: 0.5 });
  s.addText("↔", { x: 9.79, y: 6.02, w: 0.46, h: 0.56, align: "center", valign: "middle", fontFace: BODY, fontSize: 16, bold: true, color: PERI, margin: 0 });
  chip(s, "IMAGINED PERSON", 10.29, 6.02, 2.18, 0.56, { fill: WHITE, transp: 88, color: WHITE, size: 9.5, line: GLASSLN, spacing: 0.5 });

  citation(s, "(Joyce & Sills, 2014)", { y: 6.55, w: 7 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 15 — OTHER EXPERIENTIAL TECHNIQUES (table)                           */
/* ========================================================================== */
{
  const s = newSlide("Other Experiential Techniques");
  s.background = { color: WHITE };
  header(s, "PRACTICE", "OTHER EXPERIENTIAL TECHNIQUES", { w: 10.2 });
  s.addImage({ path: A("circle-candle.png"), x: 11.32, y: 0.42, w: 1.35, h: 1.35 });

  const rows = [
    ["Two-chair dialogue", "Explore opposing parts"],
    ["Exaggeration", "Increase awareness"],
    ["Staying with the feeling", "Explore emerging emotions"],
    ["Body awareness", "Notice physical experience"],
    ["“I” statements", "Own personal experience"],
    ["Dream work", "Explore present meaning"],
  ];
  s.addShape("rect", { x: 0.66, y: 1.74, w: 4.4, h: 0.52, fill: { color: NAVY } });
  s.addShape("rect", { x: 5.06, y: 1.74, w: 7.61, h: 0.52, fill: { color: NAVY } });
  s.addText("TECHNIQUE", { x: 0.92, y: 1.74, w: 3.9, h: 0.52, valign: "middle", fontFace: SEMI, fontSize: 11, color: WHITE, charSpacing: 1.5, margin: 0 });
  s.addText("PURPOSE", { x: 5.32, y: 1.74, w: 3.9, h: 0.52, valign: "middle", fontFace: SEMI, fontSize: 11, color: WHITE, charSpacing: 1.5, margin: 0 });
  rows.forEach((r, i) => {
    const y = 2.26 + i * 0.74;
    s.addShape("rect", { x: 0.66, y, w: 12.01, h: 0.74, fill: { color: i % 2 ? TINT2 : WHITE } });
    s.addShape("rect", { x: 0.66, y: y + 0.74, w: 12.01, h: 0.012, fill: { color: LINE } });
    s.addText(r[0], { x: 0.92, y, w: 3.9, h: 0.74, valign: "middle", fontFace: SEMI, fontSize: 12.5, color: NAVY, margin: 0 });
    s.addText(r[1], { x: 5.32, y, w: 7.1, h: 0.74, valign: "middle", fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0 });
  });
  citation(s, "(Joyce & Sills, 2014)", { y: 6.82, w: 8 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 16 — APPLICATION IN COUNSELLING                                      */
/* ========================================================================== */
{
  const s = newSlide("Application in Counselling");
  s.background = { color: WHITE };
  s.addImage({ path: A("side-application.jpg"), x: 8.55, y: 1.74, w: 4.12, h: 5.05 });
  s.addShape("rect", { x: 8.55, y: 1.74, w: 4.12, h: 5.05, fill: { color: WHITE, transparency: 100 }, line: { color: LINE, width: 1.25 } });
  header(s, "PRACTICE", "APPLICATION IN COUNSELLING", { w: 10.6 });

  label(s, "GESTALT THERAPY CAN BE APPLIED TO", 0.66, 1.74, 7);
  const apps = ["Grief and loss", "Relationship difficulties", "Anxiety and emotional distress", "Unresolved anger", "Identity concerns", "Emotional-expression difficulties", "Personal growth", "Unresolved interpersonal experiences"];
  apps.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    chip(s, t, 0.66 + col * 3.98, 2.08 + row * 0.7, 3.8, 0.58, { size: 11.5, color: TEXT });
  });

  s.addShape("roundRect", { x: 0.66, y: 5.15, w: 7.48, h: 1.35, rectRadius: 0.06, fill: { color: NAVY } });
  label(s, "THERAPEUTIC MOVEMENT", 0.92, 5.29, 4, { dark: true, size: 8.5 });
  flow(s, ["Awareness", "Contact", "Responsibility", "Choice", "Growth"], 0.92, 5.64, 6.96, 0.66, { size: 14.5, align: "left" });
  citation(s, "(Brownell, 2010; Joyce & Sills, 2014)", { y: 6.62, w: 7.4 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 17 — STRENGTHS                                                       */
/* ========================================================================== */
{
  const s = newSlide("Strengths of Gestalt Therapy");
  s.background = { color: WHITE };
  s.addImage({ path: A("side-strengths.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "EVALUATION", "STRENGTHS OF GESTALT THERAPY", { w: 7.9 });

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
    const x = 0.66 + col * 3.95, y = 1.74 + row * 1.18;
    s.addShape("rect", { x, y, w: 3.8, h: 1.02, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
    s.addShape("ellipse", { x: x + 0.16, y: y + 0.31, w: 0.4, h: 0.4, fill: { color: TINT }, line: { color: "C7D2E6", width: 1 } });
    s.addText("✓", { x: x + 0.16, y: y + 0.31, w: 0.4, h: 0.4, align: "center", valign: "middle", fontFace: BODY, fontSize: 12, bold: true, color: NAVY, margin: 0 });
    s.addText(t, { x: x + 0.72, y, w: 2.95, h: 1.02, valign: "middle", fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0, lineSpacingMultiple: 1.15 });
  });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 18 — LIMITATIONS AND CRITICISMS                                      */
/* ========================================================================== */
{
  const s = newSlide("Limitations and Criticisms");
  s.background = { color: DEEP };
  s.addImage({ path: A("bg-limitations.jpg"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 28 } });
  header(s, "EVALUATION", "LIMITATIONS AND CRITICISMS", { dark: true, w: 10.5 });

  s.addShape("roundRect", { x: 0.66, y: 1.78, w: 5.9, h: 4.35, rectRadius: 0.06, fill: { color: DEEP, transparency: 45 }, line: { color: PANEL_LN, width: 0.75 } });
  bullets(s, [
    "Some techniques may feel intense",
    "Requires skilled and sensitive application",
    "May be challenging for clients who prefer highly structured approaches",
    [{ t: "Experiential techniques can be " }, { t: "misused", b: true }],
  ], 0.92, 2.05, 5.4, 3.85, { size: 13.5, dark: true, space: 13 });

  s.addShape("roundRect", { x: 6.77, y: 1.78, w: 5.9, h: 4.35, rectRadius: 0.06, fill: { color: DEEP, transparency: 45 }, line: { color: PANEL_LN, width: 0.75 } });
  bullets(s, [
    "Not every intervention suits every client",
    [{ t: "Cultural context", b: true }, { t: " must be considered" }],
    "Ethical boundaries are essential",
  ], 7.03, 2.05, 5.4, 3.85, { size: 13.5, dark: true, space: 13 });

  citation(s, "(Corey, 2024; Joyce & Sills, 2014)", { y: 6.5, dark: true, w: 8 });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 19 — CASE APPLICATION                                                */
/* ========================================================================== */
{
  const s = newSlide("Case Application");
  s.background = { color: WHITE };
  header(s, "EVALUATION", "CASE APPLICATION", { w: 9 });

  s.addShape("rect", { x: 0.66, y: 1.74, w: 3.55, h: 4.95, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addImage({ path: A("card-student.jpg"), x: 0.66, y: 1.74, w: 3.55, h: 3.6 });
  label(s, "CLIENT", 0.94, 5.5, 2.5, { color: SLATE_D, size: 9 });
  s.addText("20-year-old undergraduate scholarship student", { x: 0.94, y: 5.78, w: 3.0, h: 0.8, fontFace: SEMI, fontSize: 12.5, color: NAVY, margin: 0, lineSpacingMultiple: 1.18 });

  const cols = [
    { h: "01 · PRESENTING CONCERNS", c: DEEP, items: ["Academic anxiety", "Fear of losing scholarship", "Fear of disappointing family", "Difficulty expressing emotions", "Pressure to maintain high grades"] },
    { h: "02 · GESTALT CONCEPTUALIZATION", c: NAVY, items: ["Anxiety becomes figure", "Possible introjected expectations", "Limited awareness of personal needs", "Interrupted contact"] },
    { h: "03 · POSSIBLE INTERVENTIONS", c: SLATE_D, items: ["Here-and-now exploration", "Body awareness", "Staying with the feeling", "“I” statements", "Exploring introjected beliefs"] },
  ];
  cols.forEach((c, i) => {
    const x = 4.45 + i * 2.79;
    s.addShape("rect", { x, y: 1.74, w: 2.64, h: 4.95, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
    s.addShape("rect", { x, y: 1.74, w: 2.64, h: 0.56, fill: { color: c.c } });
    s.addText(c.h, { x: x + 0.14, y: 1.74, w: 2.4, h: 0.56, valign: "middle", fontFace: SEMI, fontSize: 8.5, color: WHITE, charSpacing: 0.8, margin: 0 });
    bullets(s, c.items, x + 0.18, 2.5, 2.32, 4.05, { size: 10.5, space: 8, lsm: 1.15 });
  });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 20 — CRITICAL EVALUATION                                             */
/* ========================================================================== */
{
  const s = newSlide("Critical Evaluation");
  s.background = { color: WHITE };
  header(s, "EVALUATION", "CRITICAL EVALUATION", { w: 9 });

  const panels = [
    {
      x: 0.66, img: "circle-seedling.png", head: "CONTRIBUTIONS", hc: NAVY,
      items: ["Holistic understanding of human experience", "Strong emphasis on awareness", "Integrates body, emotion and cognition", "Recognizes person–environment interaction", "Promotes agency and authentic choice"],
    },
    {
      x: 6.83, img: "circle-scale.png", head: "CONSIDERATIONS", hc: SLATE_D,
      items: ["Cultural adaptation", "Client readiness", "Therapist competence", "Appropriate use of experiential techniques", "Balance between present and past experience"],
    },
  ];
  panels.forEach((p) => {
    s.addShape("rect", { x: p.x, y: 1.74, w: 5.84, h: 5.0, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
    s.addImage({ path: A(p.img), x: p.x + 0.3, y: 1.98, w: 0.8, h: 0.8 });
    s.addText(p.head, { x: p.x + 1.3, y: 2.14, w: 4.4, h: 0.45, fontFace: SEMI, fontSize: 16, color: p.hc, charSpacing: 0.5, margin: 0 });
    s.addShape("rect", { x: p.x + 1.3, y: 2.62, w: 0.9, h: 0.04, fill: { color: p.hc } });
    s.addShape("rect", { x: p.x + 0.3, y: 3.0, w: 5.24, h: 0.013, fill: { color: LINE } });
    bullets(s, p.items, p.x + 0.3, 3.22, 5.24, 3.3, { size: 12.5, space: 11 });
  });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 21 — CONCLUSION                                                      */
/* ========================================================================== */
{
  const s = newSlide("Conclusion");
  s.background = { color: DEEP };
  s.addImage({ path: A("bg-conclusion.jpg"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 18 } });

  header(s, "CLOSING", "CONCLUSION", { dark: true, w: 9, align: "ctr" });

  const steps = ["AWARENESS", "HERE-AND-NOW", "CONTACT", "RESPONSIBILITY & CHOICE", "GROWTH"];
  steps.forEach((t, i) => {
    const y = 1.82 + i * 0.9;
    const last = i === steps.length - 1;
    s.addText(t, {
      shape: "roundRect", rectRadius: 0.06, x: 5.02, y, w: 3.3, h: 0.54,
      fill: last ? { color: PERI } : { color: NAVY },
      line: last ? { color: PERI, width: 1 } : { color: PANEL_LN, width: 0.75 },
      align: "center", valign: "middle", fontFace: SEMI, fontSize: 12,
      color: last ? DEEP : WHITE, charSpacing: 1, margin: 0,
    });
    if (!last) s.addText("↓", { x: 5.02, y: y + 0.5, w: 3.3, h: 0.4, align: "center", valign: "middle", fontFace: BODY, fontSize: 15, bold: true, color: PERI, margin: 0 });
  });

  s.addText("Greater awareness creates greater possibilities for choice and change.", {
    x: 2.17, y: 6.12, w: 9, h: 0.42, align: "center", fontFace: SEMI, fontSize: 15.5, italic: true, color: LIGHT_ON_DARK, margin: 0,
  });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { x: 2.17, y: 6.6, w: 9, align: "center", dark: true });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 22 — REFERENCES                                                      */
/* ========================================================================== */
{
  const s = newSlide("References");
  s.background = { color: WHITE };
  s.addImage({ path: A("strip-references.jpg"), x: 0, y: 0, w: 2.9, h: 6.95 });
  s.addShape("rect", { x: 2.9, y: 0, w: 0.045, h: 6.95, fill: { color: PERI } });
  header(s, "CLOSING", "REFERENCES", { x: 3.35, w: 9.2 });

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
      if (i === 0) { opt.paraSpaceAfter = 13; opt.lineSpacingMultiple = 1.24; }
      if (i === runs.length - 1) opt.breakLine = true;
      arr.push({ text: r[0], options: opt });
    });
  });
  s.addText(arr, { x: 3.35, y: 1.74, w: 9.32, h: 5.1, valign: "top", margin: 0, fontFace: BODY });
  footer(s);
}

/* ---------- write ---------- */
(async () => {
  await pptx.writeFile({ fileName: OUT });
  fs.writeFileSync(path.join(__dirname, "slides-manifest.json"), JSON.stringify(MANIFEST, null, 2));
  console.log("WROTE:", OUT);
  console.log("SLIDES:", slideNo);
  MANIFEST.forEach((m) => console.log(`  ${String(m.n).padStart(2, "0")}  ${m.title}`));
})().catch((e) => { console.error(e); process.exit(1); });
