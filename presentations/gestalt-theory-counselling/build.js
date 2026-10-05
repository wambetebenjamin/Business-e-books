/* ============================================================================
   GESTALT THEORY AND ITS APPLICATION TO COUNSELLING — deck generator
   Group 4 · MCP504 · Pan African Christian University
   Design language: "Wardiere" minimalist (from user's Canva reference)
   - cream paper, deep forest green, brass gold accents, dots motif, hairlines
   - Georgia display headings + Arial body (universal PowerPoint fonts)
   Run:  node build.js   →  output/<Deck Title>.pptx
   ========================================================================== */
const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

const A = (p) => path.join(__dirname, "assets", p);
const OUT_DIR = path.join(__dirname, "output");
const OUT = path.join(OUT_DIR, "Gestalt Theory and Its Application to Counselling.pptx");
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- design tokens ---------- */
const CREAM = "F5F1E8", PAPER = "FFFFFF", INK = "23261F", TEXT = "2E332B";
const GREEN = "26513E", DEEP = "173226", GOLD = "B08D3C", TERRA = "A6512E";
const SAGE = "E7EBDD", SAGE_LN = "C7CFBC", MUTED = "6C736A", MUTED_D = "B7C2B4";
const LINE = "DDD6C4", CREAMTX = "F3EFE4", SOFTGOLD = "D9CFB4", GLASSLN = "C9D4C6";
const TERRA_BG = "F2E3DB", GREEN_BG = "E4EBE0";
const HEAD = "Georgia", BODY = "Arial";
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
  s.addShape("rect", { x: 0.66, y: 7.07, w: 12.01, h: 0.013, fill: { color: dark ? "3E5647" : LINE } });
  s.addText(BRAND, { x: 0.66, y: 7.13, w: 9, h: 0.24, fontFace: BODY, fontSize: 7.5, color: dark ? "8FA396" : MUTED, charSpacing: 1.5, margin: 0 });
  s.addText(String(slideNo).padStart(2, "0"), { x: 11.7, y: 7.13, w: 0.97, h: 0.24, align: "right", fontFace: BODY, fontSize: 8, bold: true, color: dark ? CREAMTX : GREEN, margin: 0 });
}

function titleBlock(s, txt, o = {}) {
  const x = o.x ?? 0.66, y = o.y ?? 0.62, w = o.w ?? 11.4;
  s.addShape("rect", { x, y, w: 0.55, h: 0.055, fill: { color: GOLD } });
  s.addText(txt, { x, y: y + 0.13, w, h: 0.68, fontFace: HEAD, fontSize: o.size ?? 27, bold: true, color: o.dark ? CREAMTX : INK, margin: 0, align: o.align ?? "left" });
  return y + 0.95;
}

function label(s, txt, x, y, w, o = {}) {
  s.addText(txt, { x, y, w, h: 0.28, fontFace: BODY, fontSize: o.size ?? 10, bold: true, color: o.color ?? GREEN, charSpacing: 2.2, margin: 0, align: o.align ?? "left" });
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
        fontFace: BODY,
        fontSize: r.size ?? o.size ?? 14,
        color: r.color ?? (o.dark ? CREAMTX : TEXT),
        bold: !!r.b,
        italic: !!r.i,
      };
      if (i === 0) {
        opt.bullet = { code: o.bulletCode ?? "2013", indent: o.indent ?? 11 };
        opt.paraSpaceAfter = o.space ?? 10;
        opt.lineSpacingMultiple = o.lsm ?? 1.14;
      }
      if (i === runs.length - 1) opt.breakLine = true;
      arr.push({ text: r.t, options: opt });
    });
  });
  s.addText(arr, { x, y, w, h, valign: "top", margin: 0, fontFace: BODY });
}

function chip(s, txt, x, y, w, h, o = {}) {
  s.addText(txt, {
    shape: "roundRect", rectRadius: o.r ?? 0.07, x, y, w, h,
    fill: { color: o.fill ?? PAPER, transparency: o.transp ?? 0 },
    line: o.lineNone ? { type: "none" } : { color: o.line ?? LINE, width: 1 },
    align: "center", valign: "middle", fontFace: o.font ?? BODY,
    fontSize: o.size ?? 12, bold: o.bold ?? true, color: o.color ?? INK,
    margin: 0, charSpacing: o.spacing ?? 0,
  });
}

/** horizontal flow: words joined by gold arrows */
function flow(s, words, x, y, w, h, o = {}) {
  const arr = [];
  words.forEach((word, i) => {
    arr.push({ text: word, options: { fontFace: o.font ?? BODY, fontSize: o.size ?? 14, bold: true, color: o.color ?? CREAMTX } });
    if (i < words.length - 1) arr.push({ text: "  →  ", options: { fontFace: BODY, fontSize: o.size ?? 14, bold: true, color: GOLD } });
  });
  s.addText(arr, { x, y, w, h, align: o.align ?? "center", valign: "middle", margin: 0 });
}

/* ========================================================================== */
/* SLIDE 1 — TITLE                                                            */
/* ========================================================================== */
{
  const s = newSlide("Gestalt Theory and Its Application to Counselling");
  s.background = { color: DEEP };
  s.addImage({ path: A("bg-title.jpg"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addImage({ path: A("scrim-b.png"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addImage({ path: A("scrim-bottom.png"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 55 } });

  label(s, "GROUP 4 PRESENTATION  ·  MCP504", 0.68, 0.7, 8, { color: GOLD, size: 10.5 });
  s.addText("GESTALT THEORY", {
    x: 0.62, y: 1.0, w: 9.6, h: 0.95, fontFace: HEAD, fontSize: 43, bold: true,
    color: CREAMTX, margin: 0, charSpacing: 0,
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 90, opacity: 0.5 },
  });
  s.addText("AND ITS APPLICATION TO COUNSELLING", {
    x: 0.66, y: 1.98, w: 9.4, h: 0.5, fontFace: HEAD, fontSize: 20, bold: false,
    color: SOFTGOLD, margin: 0, charSpacing: 1,
  });
  s.addShape("rect", { x: 0.68, y: 2.68, w: 1.3, h: 0.045, fill: { color: GOLD } });

  // members glass panel
  s.addShape("roundRect", { x: 0.66, y: 3.1, w: 6.95, h: 2.06, rectRadius: 0.09, fill: { color: "FFFFFF", transparency: 90 }, line: { color: GLASSLN, width: 0.75 } });
  label(s, "PRESENTED BY  ·  GROUP 4 MEMBERS", 0.95, 3.3, 5, { color: GOLD, size: 9 });
  const members = [
    ["Josephine Biwott", "MACP/35996/0/26"],
    ["Cynthia Cherono", "MACP/35785/4/26"],
    ["Yvonne Juliet Awuor", "MALD/36547/4/26"],
  ];
  members.forEach((m, i) => {
    s.addText([
      { text: m[0], options: { bold: true, color: CREAMTX, fontFace: BODY, fontSize: 13.5 } },
      { text: "    ·    " + m[1], options: { color: MUTED_D, fontFace: BODY, fontSize: 12 } },
    ], { x: 0.95, y: 3.66 + i * 0.45, w: 6.4, h: 0.4, margin: 0, valign: "middle" });
  });

  // bottom info row
  const info = [
    ["COURSE", "MCP504 · Theories of Counseling and Psychotherapy", 0.66, 4.6],
    ["INSTITUTION", "Pan African Christian University", 5.5, 3.5],
    ["LECTURER", "Dr. Lucy Gachenia", 9.25, 3.42],
  ];
  info.forEach((r) => {
    label(s, r[0], r[2], 5.62, r[3], { color: GOLD, size: 8.5 });
    s.addText(r[1], { x: r[2], y: 5.92, w: r[3], h: 0.75, fontFace: BODY, fontSize: 12, color: CREAMTX, margin: 0, lineSpacingMultiple: 1.15 });
  });
  s.addShape("rect", { x: 0.68, y: 5.5, w: 11.99, h: 0.012, fill: { color: "6E7F72" } });
}

/* ========================================================================== */
/* SLIDE 2 — INTRODUCTION                                                     */
/* ========================================================================== */
{
  const s = newSlide("Introduction");
  s.background = { color: CREAM };
  s.addImage({ path: A("side-intro.jpg"), x: 8.7, y: 0, w: 4.633, h: 6.95 });
  s.addShape("rect", { x: 8.655, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "INTRODUCTION", { w: 7.6 });
  bullets(s, [
    [{ t: "Experiential and humanistic approach to counselling" }],
    [{ t: "Emphasizes " }, { t: "awareness, present experience and contact", b: true }],
    [{ t: "Understands individuals within their " }, { t: "environment and relationships", b: true }],
    [{ t: "Encourages personal responsibility, choice and authentic living" }],
    [{ t: "Focuses on the client's experience in the " }, { t: "here-and-now", b: true }],
  ], 0.66, 1.72, 7.55, 4.4, { size: 15, space: 13 });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.5, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 3 — HISTORICAL BACKGROUND                                            */
/* ========================================================================== */
{
  const s = newSlide("Historical Background");
  s.background = { color: CREAM };
  s.addImage({ path: A("strip-history.jpg"), x: 0, y: 0, w: 3.4, h: 6.95 });
  s.addShape("rect", { x: 3.4, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "HISTORICAL BACKGROUND", { x: 3.85, w: 8.6 });
  bullets(s, [
    [{ t: "Emerged during the " }, { t: "1940s and 1950s", b: true }],
    [{ t: "Developed partly in response to limitations perceived in " }, { t: "traditional psychoanalysis", b: true }],
  ], 3.85, 1.62, 8.78, 1.45, { size: 14.5, space: 10 });

  label(s, "INFLUENCED BY", 3.85, 3.14, 4);
  const chips1 = [["Gestalt psychology", 2.62], ["Phenomenology", 2.3], ["Existential philosophy", 2.86]];
  let cx = 3.85;
  chips1.forEach((c) => { chip(s, c[0], cx, 3.48, c[1], 0.5, { size: 11.5, fill: PAPER }); cx += c[1] + 0.2; });
  chip(s, "Field theory", 3.85, 4.12, 1.85, 0.5, { size: 11.5, fill: PAPER });
  chip(s, "Holistic approaches", 5.9, 4.12, 2.35, 0.5, { size: 11.5, fill: PAPER });
  bullets(s, [[{ t: "Emphasized " }, { t: "experience, awareness and contact", b: true }]], 3.85, 4.85, 8.78, 0.5, { size: 14.5 });

  // intellectual roots flow band
  s.addShape("roundRect", { x: 3.85, y: 5.5, w: 8.82, h: 1.2, rectRadius: 0.09, fill: { color: DEEP } });
  label(s, "INTELLECTUAL ROOTS", 4.05, 5.64, 4, { color: GOLD, size: 8.5 });
  flow(s, ["Gestalt Psychology", "Phenomenology", "Existentialism", "Field Theory", "Gestalt Therapy"], 4.05, 5.95, 8.42, 0.6, { size: 11, align: "left" });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { x: 3.85, y: 6.85, w: 8.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 4 — MAJOR THEORISTS                                                  */
/* ========================================================================== */
{
  const s = newSlide("Major Theorists");
  s.background = { color: CREAM };
  s.addImage({ path: A("banner-theorists.jpg"), x: 0, y: 0, w: 13.333, h: 2.2 });
  s.addImage({ path: A("scrim-bottom.png"), x: 0, y: 0, w: 13.333, h: 2.2 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 2.2, fill: { color: DEEP, transparency: 42 } });
  s.addShape("rect", { x: 0.66, y: 0.62, w: 0.55, h: 0.055, fill: { color: GOLD } });
  s.addText("MAJOR THEORISTS", { x: 0.66, y: 0.75, w: 10, h: 0.68, fontFace: HEAD, fontSize: 27, bold: true, color: CREAMTX, margin: 0 });
  s.addShape("rect", { x: 0, y: 2.2, w: 13.333, h: 0.035, fill: { color: GOLD } });

  const people = [
    { ini: "FP", name: "Fritz Perls", yrs: "1893–1970", role: "Major founder", det: "Awareness, experience and responsibility", c: GREEN },
    { ini: "LP", name: "Laura Perls", yrs: "1905–1990", role: "Major contributor", det: "Contact, relationship and embodied experience", c: GOLD },
    { ini: "PG", name: "Paul Goodman", yrs: "1911–1972", role: "Co-author of Gestalt Therapy (1951)", det: "Major contributor to theoretical formulation", c: TERRA },
  ];
  const cw = 3.837, gap = 0.25;
  people.forEach((p, i) => {
    const x = 0.66 + i * (cw + gap);
    s.addShape("rect", { x, y: 2.62, w: cw, h: 3.85, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
    s.addShape("rect", { x, y: 2.62, w: cw, h: 0.09, fill: { color: p.c } });
    s.addShape("ellipse", { x: x + 0.3, y: 2.95, w: 0.74, h: 0.74, fill: { color: "EFEADA" }, line: { color: SAGE_LN, width: 1 } });
    s.addText(p.ini, { x: x + 0.3, y: 2.95, w: 0.74, h: 0.74, align: "center", valign: "middle", fontFace: HEAD, fontSize: 15, bold: true, color: GREEN, margin: 0 });
    s.addText(p.name, { x: x + 1.2, y: 3.02, w: cw - 1.35, h: 0.38, fontFace: HEAD, fontSize: 16.5, bold: true, color: INK, margin: 0 });
    s.addText(p.yrs, { x: x + 1.2, y: 3.4, w: cw - 1.35, h: 0.3, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0 });
    s.addShape("rect", { x: x + 0.3, y: 3.95, w: cw - 0.6, h: 0.013, fill: { color: LINE } });
    s.addText(p.role, { x: x + 0.3, y: 4.12, w: cw - 0.6, h: 0.62, fontFace: BODY, fontSize: 12.5, bold: true, color: p.c === GOLD ? "8F7028" : p.c, margin: 0, lineSpacingMultiple: 1.1 });
    s.addText(p.det, { x: x + 0.3, y: 4.85, w: cw - 0.6, h: 1.4, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0, lineSpacingMultiple: 1.18 });
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
  s.addImage({ path: A("scrim-b.png"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 38 } });
  titleBlock(s, "CORE ASSUMPTIONS OF GESTALT THERAPY", { dark: true, w: 11.5 });

  s.addShape("roundRect", { x: 0.66, y: 1.85, w: 6.1, h: 3.05, rectRadius: 0.09, fill: { color: "FFFFFF", transparency: 90 }, line: { color: GLASSLN, width: 0.75 } });
  bullets(s, [
    "People are best understood as whole persons",
    "Human experience is influenced by the environment",
    "Awareness is central to psychological growth",
    "Experience unfolds in the present",
  ], 0.92, 2.1, 5.6, 2.6, { size: 13.5, dark: true, space: 9 });

  s.addShape("roundRect", { x: 7.0, y: 1.85, w: 5.65, h: 3.05, rectRadius: 0.09, fill: { color: "FFFFFF", transparency: 90 }, line: { color: GLASSLN, width: 0.75 } });
  bullets(s, [
    "People have capacity for choice and self-regulation",
    "Healthy functioning involves meaningful contact",
    "Psychological difficulties may involve interruptions in awareness or contact",
  ], 7.26, 2.1, 5.15, 2.6, { size: 13.5, dark: true, space: 9 });

  citation(s, "(Perls et al., 1951; Brownell, 2010; Joyce & Sills, 2014)", { y: 6.55, dark: true, w: 9 });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 6 — AWARENESS                                                        */
/* ========================================================================== */
{
  const s = newSlide("Awareness");
  s.background = { color: CREAM };
  s.addImage({ path: A("side-awareness.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "AWARENESS", { w: 7.6 });
  bullets(s, [[{ t: "Central concept in Gestalt therapy" }]], 0.66, 1.6, 7.9, 0.5, { size: 15 });

  label(s, "NOTICING", 0.66, 2.18, 3);
  const notice = [["Thoughts", 0.66, 2.5, 1.75], ["Feelings", 2.61, 2.5, 1.75], ["Bodily sensations", 0.66, 3.13, 2.6], ["Behaviour", 3.46, 3.13, 1.75], ["Needs", 0.66, 3.76, 1.3]];
  notice.forEach((n) => chip(s, n[0], n[1], n[2], n[3], 0.5, { size: 11.5, fill: SAGE, line: SAGE_LN, color: GREEN, bold: true }));

  bullets(s, [
    "Focuses on present experience",
    "Creates opportunities for choice and change",
  ], 0.66, 4.48, 7.9, 0.85, { size: 13, space: 8 });

  label(s, "THE PROCESS", 0.66, 5.42, 3);
  chip(s, "AWARENESS", 0.66, 5.76, 2.45, 0.62, { fill: DEEP, color: CREAMTX, size: 12.5, line: DEEP });
  s.addText("→", { x: 3.16, y: 5.76, w: 0.6, h: 0.62, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: "8F7028", margin: 0 });
  chip(s, "CHOICE", 3.82, 5.76, 1.9, 0.62, { fill: GREEN, color: CREAMTX, size: 12.5, line: GREEN });
  s.addText("→", { x: 5.77, y: 5.76, w: 0.6, h: 0.62, align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true, color: "8F7028", margin: 0 });
  chip(s, "CHANGE", 6.43, 5.76, 2.0, 0.62, { fill: GOLD, color: INK, size: 12.5, line: GOLD });

  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.55, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 7 — THE HERE-AND-NOW                                                 */
/* ========================================================================== */
{
  const s = newSlide("The Here-and-Now");
  s.background = { color: CREAM };
  s.addImage({ path: A("side-herenow.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "THE HERE-AND-NOW", { w: 7.6 });
  bullets(s, [
    [{ t: "Focuses on the client's " }, { t: "present experience", b: true }],
    [{ t: "Past experiences are explored through their " }, { t: "current impact", b: true }],
    [{ t: "Includes thoughts, emotions, bodily sensations and behaviour" }],
    [{ t: "Encourages " }, { t: "direct experience", b: true }, { t: " rather than excessive intellectual analysis" }],
    [{ t: "The therapeutic relationship provides an opportunity for " }, { t: "present-moment awareness", b: true }],
  ], 0.66, 1.72, 7.9, 4.5, { size: 15, space: 14 });
  citation(s, "(Perls et al., 1951; Brownell, 2010)", { y: 6.5, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 8 — FIGURE AND GROUND                                                */
/* ========================================================================== */
{
  const s = newSlide("Figure and Ground");
  s.background = { color: CREAM };
  titleBlock(s, "FIGURE AND GROUND", { w: 8 });

  // drawn figure-ground illustration
  s.addShape("roundRect", { x: 0.66, y: 1.6, w: 5.3, h: 4.55, rectRadius: 0.09, fill: { color: DEEP } });
  s.addImage({ path: A("dots-ground.png"), x: 0.96, y: 1.9, w: 4.7, h: 3.95 });
  s.addShape("ellipse", { x: 2.46, y: 3.0, w: 1.7, h: 1.7, fill: { color: CREAMTX }, line: { color: "FFFFFF", width: 1.25 } });
  s.addText("FIGURE", { x: 2.46, y: 4.78, w: 1.7, h: 0.28, align: "center", fontFace: BODY, fontSize: 9, bold: true, color: GOLD, charSpacing: 2.2, margin: 0 });
  s.addText("GROUND", { x: 0.96, y: 5.72, w: 2.5, h: 0.26, fontFace: BODY, fontSize: 9, bold: true, color: MUTED_D, charSpacing: 2.2, margin: 0 });
  s.addText("One element steps forward as figure against a ground of context.", { x: 0.66, y: 6.26, w: 5.3, h: 0.3, fontFace: BODY, fontSize: 9.5, italic: true, color: MUTED, margin: 0 });

  // figure / ground cards
  s.addShape("rect", { x: 6.3, y: 1.6, w: 6.37, h: 1.04, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 6.3, y: 1.6, w: 0.08, h: 1.04, fill: { color: GREEN } });
  s.addText("FIGURE", { x: 6.58, y: 1.74, w: 3, h: 0.36, fontFace: HEAD, fontSize: 15, bold: true, color: GREEN, margin: 0 });
  s.addText("What is most prominent in awareness", { x: 6.58, y: 2.14, w: 5.9, h: 0.36, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0 });
  s.addText("↓", { x: 6.3, y: 2.68, w: 6.37, h: 0.44, align: "center", valign: "middle", fontFace: BODY, fontSize: 19, bold: true, color: "8F7028", margin: 0 });
  s.addShape("rect", { x: 6.3, y: 3.16, w: 6.37, h: 1.04, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 6.3, y: 3.16, w: 0.08, h: 1.04, fill: { color: GOLD } });
  s.addText("GROUND", { x: 6.58, y: 3.3, w: 3, h: 0.36, fontFace: HEAD, fontSize: 15, bold: true, color: "8F7028", margin: 0 });
  s.addText("The surrounding context and experiences", { x: 6.58, y: 3.7, w: 5.9, h: 0.36, fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0 });

  bullets(s, [
    "Needs and concerns move between figure and ground",
    "The figure changes as circumstances change",
    "Awareness helps identify what is most significant in the present",
  ], 6.3, 4.5, 6.37, 1.9, { size: 13.5, space: 10 });
  citation(s, "(Perls et al., 1951; Woldt & Toman, 2005)", { x: 6.3, y: 6.55, w: 6.3 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 9 — CONTACT AND CONTACT BOUNDARY                                     */
/* ========================================================================== */
{
  const s = newSlide("Contact and Contact Boundary");
  s.background = { color: CREAM };
  titleBlock(s, "CONTACT AND CONTACT BOUNDARY", { w: 11 });
  bullets(s, [
    [{ t: "Contact: ", b: true }, { t: "Interaction between the individual and environment" }],
    [{ t: "Contact boundary: ", b: true }, { t: "Point at which the individual and environment meet" }],
    "Healthy contact allows needs to be addressed while maintaining a sense of self",
    [{ t: "Contact involves " }, { t: "engaging, responding and withdrawing", b: true }],
    "Relationships, culture and circumstances influence contact",
  ], 0.66, 1.66, 7.2, 4.6, { size: 14, space: 12 });

  s.addImage({ path: A("card-contact.jpg"), x: 8.15, y: 1.6, w: 4.52, h: 3.41 });
  s.addShape("rect", { x: 8.15, y: 1.6, w: 4.52, h: 3.41, fill: { color: "FFFFFF", transparency: 100 }, line: { color: LINE, width: 1.25 } });
  s.addShape("roundRect", { x: 8.15, y: 5.22, w: 4.52, h: 1.5, rectRadius: 0.09, fill: { color: DEEP } });
  s.addText("INDIVIDUAL", { x: 8.15, y: 5.34, w: 4.52, h: 0.34, align: "center", fontFace: BODY, fontSize: 11.5, bold: true, color: CREAMTX, charSpacing: 1.2, margin: 0 });
  s.addText("↔   CONTACT BOUNDARY   ↔", { x: 8.15, y: 5.73, w: 4.52, h: 0.34, align: "center", fontFace: BODY, fontSize: 11.5, bold: true, color: GOLD, charSpacing: 1, margin: 0 });
  s.addText("ENVIRONMENT", { x: 8.15, y: 6.12, w: 4.52, h: 0.34, align: "center", fontFace: BODY, fontSize: 11.5, bold: true, color: CREAMTX, charSpacing: 1.2, margin: 0 });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { y: 6.6, w: 7.2 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 10 — UNFINISHED BUSINESS                                             */
/* ========================================================================== */
{
  const s = newSlide("Unfinished Business");
  s.background = { color: CREAM };
  s.addImage({ path: A("strip-unfinished.jpg"), x: 0, y: 0, w: 3.4, h: 6.95 });
  s.addShape("rect", { x: 3.4, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "UNFINISHED BUSINESS", { x: 3.85, w: 8.6 });
  bullets(s, [[{ t: "Unresolved experiences or emotions" }]], 3.85, 1.62, 8.78, 0.5, { size: 14.5 });

  label(s, "MAY INCLUDE", 3.85, 2.2, 4);
  const emo = [["Grief", 3.85, 1.3], ["Anger", 5.31, 1.32], ["Guilt", 6.79, 1.25], ["Resentment", 8.2, 1.78], ["Unmet needs", 10.14, 2.0]];
  emo.forEach((e) => chip(s, e[0], e[1], 2.54, e[2], 0.5, { size: 11.5, fill: SAGE, line: SAGE_LN, color: GREEN }));

  bullets(s, [
    "Can remain psychologically active in the present",
    "May interfere with healthy contact",
    [{ t: "Therapy promotes " }, { t: "awareness and processing", b: true }],
  ], 3.85, 3.4, 8.78, 2.3, { size: 14, space: 12 });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { x: 3.85, y: 6.55, w: 8.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 11 — PERSONAL RESPONSIBILITY                                         */
/* ========================================================================== */
{
  const s = newSlide("Personal Responsibility");
  s.background = { color: CREAM };
  s.addImage({ path: A("side-responsibility.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "PERSONAL RESPONSIBILITY", { w: 7.9 });
  bullets(s, [
    "Recognizing one's own choices and responses",
    [{ t: "Promotes " }, { t: "agency and ownership", b: true }],
    "Encourages authentic decision-making",
    "Uses language that reflects personal experience",
  ], 0.66, 1.62, 7.9, 2.0, { size: 13.5, space: 10 });
  chip(s, "RESPONSIBILITY  ≠  BLAME", 0.66, 3.78, 3.6, 0.55, { fill: SAGE, line: SAGE_LN, color: GREEN, size: 12.5, spacing: 1 });

  label(s, "LANGUAGE IN PRACTICE  ·  EXAMPLE", 0.66, 4.6, 6);
  s.addShape("roundRect", { x: 0.66, y: 4.98, w: 7.9, h: 0.66, rectRadius: 0.08, fill: { color: TERRA_BG }, line: { color: "D8B7A6", width: 1 } });
  s.addText([
    { text: "✗   ", options: { bold: true, color: TERRA, fontSize: 15, fontFace: BODY } },
    { text: "“You make me angry.”", options: { italic: true, color: INK, fontSize: 13.5, fontFace: BODY } },
  ], { x: 0.92, y: 4.98, w: 7.4, h: 0.66, valign: "middle", margin: 0 });
  s.addShape("roundRect", { x: 0.66, y: 5.78, w: 7.9, h: 0.66, rectRadius: 0.08, fill: { color: GREEN_BG }, line: { color: "B9C8B4", width: 1 } });
  s.addText([
    { text: "✓   ", options: { bold: true, color: GREEN, fontSize: 15, fontFace: BODY } },
    { text: "“I notice that I become angry when…”", options: { italic: true, color: INK, fontSize: 13.5, fontFace: BODY } },
  ], { x: 0.92, y: 5.78, w: 7.4, h: 0.66, valign: "middle", margin: 0 });

  citation(s, "(Perls et al., 1951; Corey, 2024)", { y: 6.62, w: 7.5 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 12 — ROLE OF THE GESTALT COUNSELLOR                                  */
/* ========================================================================== */
{
  const s = newSlide("Role of the Gestalt Counsellor");
  s.background = { color: DEEP };
  label(s, "THE COUNSELLOR", 0.66, 0.66, 5, { color: GOLD, size: 10 });
  s.addShape("rect", { x: 0.66, y: 1.02, w: 0.55, h: 0.055, fill: { color: GOLD } });
  s.addText("ROLE OF THE GESTALT COUNSELLOR", { x: 0.66, y: 1.16, w: 11.5, h: 0.68, fontFace: HEAD, fontSize: 27, bold: true, color: CREAMTX, margin: 0 });

  s.addImage({ path: A("card-counsellor.jpg"), x: 0.66, y: 2.05, w: 6.9, h: 4.6 });
  s.addShape("rect", { x: 0.66, y: 2.05, w: 6.9, h: 4.6, fill: { color: "FFFFFF", transparency: 100 }, line: { color: "4A6355", width: 1.25 } });

  s.addShape("roundRect", { x: 7.95, y: 2.05, w: 4.72, h: 4.6, rectRadius: 0.09, fill: { color: "FFFFFF", transparency: 91 }, line: { color: GLASSLN, width: 0.75 } });
  bullets(s, [
    "Facilitates awareness",
    "Focuses on present experience",
    "Observes verbal and non-verbal behaviour",
    "Uses the therapeutic relationship",
    "Encourages authentic expression",
    "Explores interruptions in contact",
    "Promotes responsibility and choice",
  ], 8.2, 2.3, 4.25, 4.1, { size: 12.5, dark: true, space: 10 });
  citation(s, "(Joyce & Sills, 2014; Brownell, 2010)", { y: 6.78, dark: true, w: 6.9 });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 13 — GESTALT THERAPEUTIC TECHNIQUES                                  */
/* ========================================================================== */
{
  const s = newSlide("Gestalt Therapeutic Techniques");
  s.background = { color: CREAM };
  s.addImage({ path: A("strip-techniques.jpg"), x: 0, y: 0, w: 3.0, h: 6.95 });
  s.addShape("rect", { x: 3.0, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "GESTALT THERAPEUTIC TECHNIQUES", { x: 3.45, w: 9.2 });
  const tech = ["Empty-chair technique", "Two-chair dialogue", "Exaggeration", "Staying with the feeling", "Role-play", "Body awareness", "“I” statements", "Dream work", "Here-and-now questioning"];
  tech.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 3.45 + col * 3.09, y = 1.75 + row * 1.32;
    s.addShape("rect", { x, y, w: 2.95, h: 1.16, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
    s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.2, y: y + 0.13, w: 1, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: "8F7028", margin: 0 });
    s.addText(t, { x: x + 0.2, y: y + 0.46, w: 2.58, h: 0.6, fontFace: BODY, fontSize: 12.5, bold: true, color: INK, margin: 0, lineSpacingMultiple: 1.05 });
  });
  citation(s, "(Joyce & Sills, 2014)", { x: 3.45, y: 5.95, w: 8 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 14 — EMPTY-CHAIR TECHNIQUE                                           */
/* ========================================================================== */
{
  const s = newSlide("Empty-Chair Technique");
  s.background = { color: CREAM };
  titleBlock(s, "EMPTY-CHAIR TECHNIQUE", { w: 7 });
  bullets(s, [
    "Client imagines another person in an empty chair",
    "Speaks directly to the imagined person",
    [{ t: "Brings unresolved experiences into " }, { t: "present awareness", b: true }],
    "Facilitates expression of unfinished emotions",
    "May promote new awareness and perspectives",
  ], 0.66, 1.62, 7.0, 2.8, { size: 13.5, space: 11 });

  // pull-quote card
  s.addShape("rect", { x: 0.66, y: 4.6, w: 7.0, h: 1.95, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
  s.addShape("rect", { x: 0.66, y: 4.6, w: 0.08, h: 1.95, fill: { color: GOLD } });
  label(s, "EXAMPLE", 0.98, 4.78, 2, { color: "8F7028", size: 9 });
  s.addText("“Imagine your father is sitting in that chair. What would you want him to hear from you?”", {
    x: 0.98, y: 5.12, w: 6.4, h: 1.25, fontFace: HEAD, fontSize: 14.5, italic: true, color: INK, margin: 0, lineSpacingMultiple: 1.2,
  });

  s.addImage({ path: A("card-chairs.jpg"), x: 7.95, y: 1.62, w: 4.72, h: 3.54 });
  s.addShape("rect", { x: 7.95, y: 1.62, w: 4.72, h: 3.54, fill: { color: "FFFFFF", transparency: 100 }, line: { color: LINE, width: 1.25 } });

  s.addShape("roundRect", { x: 7.95, y: 5.35, w: 4.72, h: 1.45, rectRadius: 0.09, fill: { color: DEEP } });
  label(s, "THE SETUP", 8.15, 5.49, 3, { color: GOLD, size: 8.5 });
  chip(s, "CLIENT", 8.15, 5.87, 1.7, 0.52, { fill: GREEN, color: CREAMTX, size: 11, line: GREEN });
  s.addText("↔", { x: 9.9, y: 5.87, w: 0.8, h: 0.52, align: "center", valign: "middle", fontFace: BODY, fontSize: 17, bold: true, color: GOLD, margin: 0 });
  chip(s, "IMAGINED PERSON", 10.76, 5.87, 1.75, 0.52, { fill: "FFFFFF", transp: 86, color: CREAMTX, size: 9.5, line: GLASSLN });

  citation(s, "(Joyce & Sills, 2014)", { y: 6.85, w: 7 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 15 — OTHER EXPERIENTIAL TECHNIQUES (table)                           */
/* ========================================================================== */
{
  const s = newSlide("Other Experiential Techniques");
  s.background = { color: CREAM };
  titleBlock(s, "OTHER EXPERIENTIAL TECHNIQUES", { w: 10.2 });
  s.addImage({ path: A("circle-candle.png"), x: 11.32, y: 0.42, w: 1.35, h: 1.35 });

  const rows = [
    ["Two-chair dialogue", "Explore opposing parts"],
    ["Exaggeration", "Increase awareness"],
    ["Staying with the feeling", "Explore emerging emotions"],
    ["Body awareness", "Notice physical experience"],
    ["“I” statements", "Own personal experience"],
    ["Dream work", "Explore present meaning"],
  ];
  // header
  s.addShape("rect", { x: 0.66, y: 1.66, w: 4.4, h: 0.52, fill: { color: DEEP } });
  s.addShape("rect", { x: 5.06, y: 1.66, w: 7.61, h: 0.52, fill: { color: DEEP } });
  s.addText("TECHNIQUE", { x: 0.92, y: 1.66, w: 3.9, h: 0.52, valign: "middle", fontFace: BODY, fontSize: 11.5, bold: true, color: CREAMTX, charSpacing: 1.5, margin: 0 });
  s.addText("PURPOSE", { x: 5.32, y: 1.66, w: 3.9, h: 0.52, valign: "middle", fontFace: BODY, fontSize: 11.5, bold: true, color: CREAMTX, charSpacing: 1.5, margin: 0 });
  rows.forEach((r, i) => {
    const y = 2.18 + i * 0.66;
    s.addShape("rect", { x: 0.66, y, w: 12.01, h: 0.66, fill: { color: i % 2 ? "F0ECE0" : PAPER }, line: { color: LINE, width: 0.75 } });
    s.addText(r[0], { x: 0.92, y, w: 3.9, h: 0.66, valign: "middle", fontFace: BODY, fontSize: 12.5, bold: true, color: INK, margin: 0 });
    s.addText(r[1], { x: 5.32, y, w: 7.1, h: 0.66, valign: "middle", fontFace: BODY, fontSize: 12.5, color: TEXT, margin: 0 });
  });
  citation(s, "(Joyce & Sills, 2014)", { y: 6.45, w: 8 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 16 — APPLICATION IN COUNSELLING                                      */
/* ========================================================================== */
{
  const s = newSlide("Application in Counselling");
  s.background = { color: CREAM };
  s.addImage({ path: A("side-application.jpg"), x: 8.55, y: 1.58, w: 4.12, h: 5.05 });
  s.addShape("rect", { x: 8.55, y: 1.58, w: 4.12, h: 5.05, fill: { color: "FFFFFF", transparency: 100 }, line: { color: LINE, width: 1.25 } });
  titleBlock(s, "APPLICATION IN COUNSELLING", { w: 10.6 });

  label(s, "GESTALT THERAPY CAN BE APPLIED TO", 0.66, 1.58, 7);
  const apps = ["Grief and loss", "Relationship difficulties", "Anxiety and emotional distress", "Unresolved anger", "Identity concerns", "Emotional-expression difficulties", "Personal growth", "Unresolved interpersonal experiences"];
  apps.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    chip(s, t, 0.66 + col * 3.94, 1.94 + row * 0.73, 3.7, 0.58, { size: 11.5, fill: PAPER, bold: false });
  });

  s.addShape("roundRect", { x: 0.66, y: 5.05, w: 7.48, h: 1.42, rectRadius: 0.09, fill: { color: DEEP } });
  label(s, "THERAPEUTIC MOVEMENT", 0.92, 5.19, 4, { color: GOLD, size: 8.5 });
  flow(s, ["Awareness", "Contact", "Responsibility", "Choice", "Growth"], 0.92, 5.52, 6.96, 0.7, { size: 14, align: "left" });
  citation(s, "(Brownell, 2010; Joyce & Sills, 2014)", { y: 6.62, w: 7.4 });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 17 — STRENGTHS                                                       */
/* ========================================================================== */
{
  const s = newSlide("Strengths of Gestalt Therapy");
  s.background = { color: CREAM };
  s.addImage({ path: A("side-strengths.jpg"), x: 8.9, y: 0, w: 4.433, h: 6.95 });
  s.addShape("rect", { x: 8.855, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "STRENGTHS OF GESTALT THERAPY", { w: 7.9 });
  bullets(s, [
    "Promotes self-awareness",
    "Focuses on lived experience",
    "Encourages agency and responsibility",
    [{ t: "Integrates " }, { t: "mind, emotion and body", b: true }],
    "Considers person–environment interaction",
    "Encourages active client participation",
    "Supports experiential emotional processing",
  ], 0.66, 1.72, 7.9, 4.6, { size: 14, space: 11, bulletCode: "2713" });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 18 — LIMITATIONS AND CRITICISMS                                      */
/* ========================================================================== */
{
  const s = newSlide("Limitations and Criticisms");
  s.background = { color: DEEP };
  s.addImage({ path: A("bg-limitations.jpg"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addImage({ path: A("scrim-b.png"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 30 } });
  titleBlock(s, "LIMITATIONS AND CRITICISMS", { dark: true, w: 10.5 });
  bullets(s, [
    "Some techniques may feel intense",
    "Requires skilled and sensitive application",
    "May be challenging for clients who prefer highly structured approaches",
    [{ t: "Experiential techniques can be " }, { t: "misused", b: true }],
    "Not every intervention suits every client",
    [{ t: "Cultural context", b: true }, { t: " must be considered" }],
    "Ethical boundaries are essential",
  ], 0.66, 1.78, 8.1, 4.5, { size: 13.5, dark: true, space: 11 });
  citation(s, "(Corey, 2024; Joyce & Sills, 2014)", { y: 6.55, dark: true, w: 8 });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 19 — CASE APPLICATION                                                */
/* ========================================================================== */
{
  const s = newSlide("Case Application");
  s.background = { color: CREAM };
  titleBlock(s, "CASE APPLICATION", { w: 9 });

  // client card
  s.addShape("rect", { x: 0.66, y: 1.6, w: 3.55, h: 5.05, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
  s.addImage({ path: A("card-student.jpg"), x: 0.66, y: 1.6, w: 3.55, h: 3.6 });
  label(s, "CLIENT", 0.94, 5.34, 2.5, { color: "8F7028", size: 9 });
  s.addText("20-year-old undergraduate scholarship student", { x: 0.94, y: 5.62, w: 3.0, h: 0.9, fontFace: BODY, fontSize: 12.5, bold: true, color: INK, margin: 0, lineSpacingMultiple: 1.15 });

  const cols = [
    { h: "PRESENTING CONCERNS", c: DEEP, items: ["Academic anxiety", "Fear of losing scholarship", "Fear of disappointing family", "Difficulty expressing emotions", "Pressure to maintain high grades"] },
    { h: "GESTALT CONCEPTUALIZATION", c: GREEN, items: ["Anxiety becomes figure", "Possible introjected expectations", "Limited awareness of personal needs", "Interrupted contact"] },
    { h: "POSSIBLE INTERVENTIONS", c: "8F7028", items: ["Here-and-now exploration", "Body awareness", "Staying with the feeling", "“I” statements", "Exploring introjected beliefs"] },
  ];
  cols.forEach((c, i) => {
    const x = 4.45 + i * 2.79;
    s.addShape("rect", { x, y: 1.6, w: 2.64, h: 5.05, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
    s.addShape("rect", { x, y: 1.6, w: 2.64, h: 0.52, fill: { color: c.c } });
    s.addText(c.h, { x: x + 0.14, y: 1.6, w: 2.4, h: 0.52, valign: "middle", fontFace: BODY, fontSize: 8.5, bold: true, color: "FFFFFF", charSpacing: 0.8, margin: 0 });
    bullets(s, c.items, x + 0.18, 2.32, 2.32, 4.15, { size: 10.5, space: 8, lsm: 1.12 });
  });
  footer(s);
}

/* ========================================================================== */
/* SLIDE 20 — CRITICAL EVALUATION                                             */
/* ========================================================================== */
{
  const s = newSlide("Critical Evaluation");
  s.background = { color: CREAM };
  titleBlock(s, "CRITICAL EVALUATION", { w: 9 });

  const panels = [
    {
      x: 0.66, img: "circle-seedling.png", head: "CONTRIBUTIONS", hc: GREEN,
      items: ["Holistic understanding of human experience", "Strong emphasis on awareness", "Integrates body, emotion and cognition", "Recognizes person–environment interaction", "Promotes agency and authentic choice"],
    },
    {
      x: 6.83, img: "circle-scale.png", head: "CONSIDERATIONS", hc: TERRA,
      items: ["Cultural adaptation", "Client readiness", "Therapist competence", "Appropriate use of experiential techniques", "Balance between present and past experience"],
    },
  ];
  panels.forEach((p) => {
    s.addShape("rect", { x: p.x, y: 1.6, w: 5.84, h: 5.1, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
    s.addImage({ path: A(p.img), x: p.x + 0.28, y: 1.84, w: 0.8, h: 0.8 });
    s.addText(p.head, { x: p.x + 1.25, y: 2.02, w: 4.4, h: 0.45, fontFace: HEAD, fontSize: 16.5, bold: true, color: p.hc, margin: 0 });
    s.addShape("rect", { x: p.x + 0.3, y: 2.85, w: 5.24, h: 0.013, fill: { color: LINE } });
    bullets(s, p.items, p.x + 0.3, 3.08, 5.24, 3.4, { size: 12.5, space: 10 });
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
  s.addImage({ path: A("scrim-b.png"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addImage({ path: A("scrim-bottom.png"), x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: DEEP, transparency: 38 } });

  s.addText("CONCLUSION", { x: 2.17, y: 0.58, w: 9, h: 0.6, align: "center", fontFace: HEAD, fontSize: 28, bold: true, color: CREAMTX, margin: 0 });
  s.addShape("rect", { x: 6.17, y: 1.3, w: 1.0, h: 0.05, fill: { color: GOLD } });

  const steps = ["AWARENESS", "HERE-AND-NOW", "CONTACT", "RESPONSIBILITY & CHOICE", "GROWTH"];
  steps.forEach((t, i) => {
    const y = 1.72 + i * 0.94;
    const last = i === steps.length - 1;
    s.addText(t, {
      shape: "roundRect", rectRadius: 0.08, x: 5.07, y, w: 3.2, h: 0.52,
      fill: last ? { color: GOLD } : { color: "FFFFFF", transparency: 86 },
      line: last ? { color: GOLD, width: 1 } : { color: GLASSLN, width: 0.75 },
      align: "center", valign: "middle", fontFace: BODY, fontSize: 12, bold: true,
      color: last ? INK : CREAMTX, charSpacing: 1, margin: 0,
    });
    if (!last) s.addText("↓", { x: 5.07, y: y + 0.5, w: 3.2, h: 0.44, align: "center", valign: "middle", fontFace: BODY, fontSize: 15, bold: true, color: GOLD, margin: 0 });
  });

  s.addText("Greater awareness creates greater possibilities for choice and change.", {
    x: 2.17, y: 6.32, w: 9, h: 0.42, align: "center", fontFace: HEAD, fontSize: 15.5, italic: true, color: SOFTGOLD, margin: 0,
  });
  citation(s, "(Perls et al., 1951; Joyce & Sills, 2014)", { x: 2.17, y: 6.78, w: 9, align: "center", dark: true });
  footer(s, true);
}

/* ========================================================================== */
/* SLIDE 22 — REFERENCES                                                      */
/* ========================================================================== */
{
  const s = newSlide("References");
  s.background = { color: CREAM };
  s.addImage({ path: A("strip-references.jpg"), x: 0, y: 0, w: 2.9, h: 6.95 });
  s.addShape("rect", { x: 2.9, y: 0, w: 0.045, h: 6.95, fill: { color: GOLD } });
  titleBlock(s, "REFERENCES", { x: 3.35, w: 9.2 });

  const refs = [
    [["Brownell, P. (2010). "], ["Gestalt therapy: A guide to contemporary practice", 1], [". Springer Publishing Company."]],
    [["Corey, G. (2024). "], ["Theory and practice of counseling and psychotherapy", 1], [" (11th ed.). Cengage Learning."]],
    [["Joyce, P., & Sills, C. (2014). "], ["Skills in Gestalt counselling & psychotherapy", 1], [" (3rd ed.). SAGE."]],
    [["Perls, F. S., Hefferline, R. F., & Goodman, P. (1951). "], ["Gestalt therapy: Excitement and growth in the human personality", 1], [". Julian Press."]],
    [["Woldt, A. L., & Toman, S. M. (Eds.). (2005). "], ["Gestalt therapy: History, theory, and practice", 1], [". SAGE."]],
    [["Yontef, G., & Fuhr, R. (2005). Gestalt therapy theory of change. In A. L. Woldt & S. Toman (Eds.), "], ["Gestalt therapy: History, theory, and practice", 1], [" (pp. 81–100). SAGE."]],
  ];
  const arr = [];
  refs.forEach((runs, ri) => {
    runs.forEach((r, i) => {
      const opt = { fontFace: BODY, fontSize: 11.5, color: TEXT, italic: !!r[1] };
      if (i === 0) { opt.paraSpaceAfter = 11; opt.lineSpacingMultiple = 1.18; }
      if (i === runs.length - 1) opt.breakLine = true;
      arr.push({ text: r[0], options: opt });
    });
  });
  s.addText(arr, { x: 3.35, y: 1.6, w: 9.32, h: 5.3, valign: "top", margin: 0, fontFace: BODY });
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
