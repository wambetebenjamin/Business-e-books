/* ============================================================================
   render.js — renders the generated PPTX (parse actual OOXML) to PNG + PDF
   and runs deterministic QA checks:
     · text overflow beyond its box
     · text/background contrast (WCAG-style, sampled from composited canvas)
     · text-on-text overlap
     · slide count / footer numbering order
     · manifest title cross-check, placeholder text scan
   Fonts: real Poppins (@fontsource woff2, same metrics as the Google font) —
   the renderer measures the exact production font. Glyphs missing from
   Poppins fall back to DejaVu Sans, as PowerPoint would substitute.
   Run:  node render.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
const PDFDocument = require("pdfkit");

const DECK = __dirname;
const PPTX = path.join(DECK, "output", "Gestalt Theory and Its Application to Counselling.pptx");
const PDF = path.join(DECK, "output", "Gestalt Theory and Its Application to Counselling.pdf");
const RENDER_DIR = path.join(DECK, "render");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(DECK, "slides-manifest.json"), "utf8"));

const IMG_CACHE = {};
const DPI = 150, EMU = 914400, SLW = 13.333, SLH = 7.5;
const PXW = Math.round(SLW * DPI), PXH = Math.round(SLH * DPI);
const px = (emu) => (emu / EMU) * DPI;

/* ---------- fonts ----------
   Real Plus Jakarta Sans + Inter (@fontsource woff2) are registered so the
   renderer measures the exact production fonts. Glyphs missing from their
   latin subsets (verified: → ↓ ↔ ≠ ✓ ✗ are tofu) fall back to DejaVu Sans,
   as PowerPoint would substitute. */
const DJ = path.dirname(require.resolve("dejavu-fonts-ttf/package.json"));
const PJS_DIR = path.join(DECK, "node_modules", "@fontsource", "plus-jakarta-sans", "files");
const INT_DIR = path.join(DECK, "node_modules", "@fontsource", "inter", "files");
const FACES = {
  "PJS": path.join(PJS_DIR, "plus-jakarta-sans-latin-400-normal.woff2"),
  "PJS Bold": path.join(PJS_DIR, "plus-jakarta-sans-latin-700-normal.woff2"),
  "PJS Italic": path.join(PJS_DIR, "plus-jakarta-sans-latin-400-italic.woff2"),
  "PJS SemiBold": path.join(PJS_DIR, "plus-jakarta-sans-latin-600-normal.woff2"),
  "Inter": path.join(INT_DIR, "inter-latin-400-normal.woff2"),
  "Inter Bold": path.join(INT_DIR, "inter-latin-700-normal.woff2"),
  "Inter Italic": path.join(INT_DIR, "inter-latin-400-italic.woff2"),
  "Inter SemiBold": path.join(INT_DIR, "inter-latin-600-normal.woff2"),
  "DejaVu Serif": path.join(DJ, "ttf", "DejaVuSerif.ttf"),
  "DejaVu Serif Bold": path.join(DJ, "ttf", "DejaVuSerif-Bold.ttf"),
  "DejaVu Serif Italic": path.join(DJ, "ttf", "DejaVuSerif-Italic.ttf"),
  "DejaVu Serif BoldItalic": path.join(DJ, "ttf", "DejaVuSerif-BoldItalic.ttf"),
  "DejaVu Sans": path.join(DJ, "ttf", "DejaVuSans.ttf"),
  "DejaVu Sans Bold": path.join(DJ, "ttf", "DejaVuSans-Bold.ttf"),
  "DejaVu Sans Italic": path.join(DJ, "ttf", "DejaVuSans-Oblique.ttf"),
  "DejaVu Sans BoldItalic": path.join(DJ, "ttf", "DejaVuSans-BoldOblique.ttf"),
};
let registered = 0;
for (const [alias, p] of Object.entries(FACES)) {
  if (!fs.existsSync(p)) { console.warn("WARN missing font file:", p); continue; }
  const ok = GlobalFonts.registerFromPath(p, alias);
  if (ok) registered++;
}
// glyphs NOT covered by PJS/Inter latin subsets (verified: tofu) → DejaVu Sans
const SPECIAL = /[→↓↑↔⇄⇒≠✓✗✔✘▪●◦]/;
function face(typeface, bold, italic, text) {
  const tf = typeface || "";
  const wantsBold = bold || /semibold/i.test(tf);
  if (text && SPECIAL.test(text)) {
    return "DejaVu Sans" + (wantsBold ? " Bold" : "") + (italic ? " Italic" : "");
  }
  let fam;
  if (/jakarta/i.test(tf)) fam = "PJS";
  else if (/inter|open.?sans|montserrat|poppins/i.test(tf) || !tf) fam = "Inter";
  else fam = "DejaVu Sans";
  if (fam === "DejaVu Sans") {
    return fam + (bold ? " Bold" : "") + (italic ? " Italic" : "");
  }
  const semi = /semibold/i.test(tf);
  const key = fam + (semi ? " SemiBold" : bold ? " Bold" : "") + (italic ? " Italic" : "");
  return FACES[key] ? key : fam;
}
function fontString(f, sizePx) { return `${sizePx}px "${f}"`; }

/* ---------- xml helpers ---------- */
const decode = (s) => s
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#x([0-9a-fA-F]+);/g, (m, d) => String.fromCharCode(parseInt(d, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
  .replace(/&amp;/g, "&");
const attr = (str, name) => { const m = str.match(new RegExp(name + '="([^"]*)"')); return m ? m[1] : null; };
const num = (v, dflt) => (v == null || isNaN(parseFloat(v)) ? dflt : parseFloat(v));

function parseColorFill(block) {
  // returns {color, alpha} | null   (first srgbClr with optional alpha)
  const m = block.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"\s*(?:\/>|>([\s\S]*?)<\/a:srgbClr>)/);
  if (!m) return null;
  let alpha = 1;
  if (m[2]) { const a = m[2].match(/<a:alpha val="(\d+)"/); if (a) alpha = parseInt(a[1]) / 100000; }
  return { color: m[1].toUpperCase(), alpha };
}

/* ---------- parse one slide ---------- */
function parseSlide(zip, xml) {
  const el = [];
  // background
  const bg = xml.match(/<p:bg>[\s\S]*?<\/p:bg>/);
  if (bg) { const f = parseColorFill(bg[0]); if (f) el.push({ kind: "bg", fill: f }); }
  const re = /<p:(sp|pic)>([\s\S]*?)<\/p:\1>/g;
  let m;
  while ((m = re.exec(xml))) {
    const type = m[1], body = m[2];
    const xf = body.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/);
    if (!xf) continue;
    const box = { x: +xf[1], y: +xf[2], w: +xf[3], h: +xf[4] };
    if (type === "pic") {
      const blip = body.match(/<a:blip r:embed="(rId\d+)"/);
      const src = body.match(/<a:srcRect([^/]*)\/>/);
      el.push({ kind: "pic", box, rId: blip ? blip[1] : null, srcRect: src ? src[1] : null });
      continue;
    }
    const geom = body.match(/<a:prstGeom prst="(\w+)"/);
    const adj = body.match(/<a:gd name="adj" fmla="val (\d+)"/);
    const spPr = body.match(/<p:spPr>([\s\S]*?)<\/p:spPr>/);
    let fill = null, line = null;
    if (spPr) {
      const pre = spPr[1].split("<a:ln")[0];
      fill = /<a:noFill\/>/.test(pre) ? null : parseColorFill(pre);
      const ln = spPr[1].match(/<a:ln[^>]*>([\s\S]*?)<\/a:ln>/);
      if (ln) {
        const noFill = /<a:noFill\/>/.test(ln[1]);
        const c = noFill ? null : parseColorFill(ln[1]);
        if (c) line = { ...c, w: num(attr(ln[0].match(/<a:ln[^>]*>/)[0], "w"), 9525) };
      }
    }
    const tx = body.match(/<p:txBody>([\s\S]*?)<\/p:txBody>/);
    let text = null;
    if (tx) {
      const bp = tx[1].match(/<a:bodyPr([^>]*?)(?:\/>|>([\s\S]*?)<\/a:bodyPr>)/);
      const bpAttrs = bp ? bp[1] : "";
      const bodyPr = {
        anchor: attr(bpAttrs, "anchor") || "t",
        lIns: num(attr(bpAttrs, "lIns"), 91440), rIns: num(attr(bpAttrs, "rIns"), 91440),
        tIns: num(attr(bpAttrs, "tIns"), 45720), bIns: num(attr(bpAttrs, "bIns"), 45720),
      };
      const paras = [];
      const chunks = tx[1].split("</a:p>");
      for (const ch of chunks) {
        if (!ch.includes("<a:r>") && !ch.includes("<a:br")) continue;
        const pPrM = ch.match(/<a:pPr([^>]*?)(?:\/>|>([\s\S]*?)<\/a:pPr>)/);
        const pAttrs = pPrM ? pPrM[1] : "";
        const pKids = pPrM && pPrM[2] ? pPrM[2] : "";
        const para = {
          algn: attr(pAttrs, "algn") || "l",
          marL: num(attr(pAttrs, "marL"), 0),
          indent: num(attr(pAttrs, "indent"), 0),
          bullet: (pKids.match(/<a:buChar char="([^"]*)"/) || [])[1] ? decode((pKids.match(/<a:buChar char="([^"]*)"/))[1]) : null,
          lnSpc: pKids.match(/<a:spcPct val="(\d+)"/) ? +pKids.match(/<a:spcPct val="(\d+)"/)[1] / 100000 : 1,
          spcAft: pKids.match(/<a:spcPts val="(\d+)"/) ? +pKids.match(/<a:spcPts val="(\d+)"/)[1] / 100 : 0,
          runs: [],
        };
        const runRe = /<a:r>([\s\S]*?)<\/a:r>/g;
        let rm;
        while ((rm = runRe.exec(ch))) {
          const r = rm[1];
          const rPrM = r.match(/<a:rPr([^>]*?)(?:\/>|>([\s\S]*?)<\/a:rPr>)/);
          const ra = rPrM ? rPrM[1] : "";
          const rk = rPrM && rPrM[2] ? rPrM[2] : "";
          const tm = r.match(/<a:t>([\s\S]*?)<\/a:t>/);
          if (!tm) continue;
          const fillC = parseColorFill(rk);
          const shadow = /<a:outerShdw/.test(rk);
          para.runs.push({
            text: decode(tm[1]),
            size: num(attr(ra, "sz"), 1800) / 100,
            bold: attr(ra, "b") === "1",
            italic: attr(ra, "i") === "1",
            spc: num(attr(ra, "spc"), 0) / 100,
            color: fillC ? fillC.color : "000000",
            alpha: fillC ? fillC.alpha : 1,
            typeface: (rk.match(/<a:latin typeface="([^"]+)"/) || [])[1] || "Arial",
            shadow,
          });
        }
        if (para.runs.length) paras.push(para);
      }
      if (paras.length) text = { bodyPr, paras };
    }
    el.push({ kind: "sp", box, prst: geom ? geom[1] : "rect", adj: adj ? +adj[1] : null, fill, line, text });
  }
  return el;
}

/* ---------- text layout ---------- */
function hexLum(hex) {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const [r, g, b] = c.map(f);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(l1, l2) { const a = Math.max(l1, l2), b = Math.min(l1, l2); return (a + 0.05) / (b + 0.05); }

function layoutParas(ctx, el) {
  const { box, text } = el;
  const b = text.bodyPr;
  const x0 = px(box.x + b.lIns), y0 = px(box.y + b.tIns);
  const availW = px(box.w - b.lIns - b.rIns), availH = px(box.h - b.tIns - b.bIns);
  const lines = [];
  let curY = y0, contentH = 0;
  for (const para of text.paras) {
    // tokenise runs into words
    const tokens = [];
    for (const r of para.runs) {
      const parts = r.text.split(/(\s+)/);
      for (const p of parts) {
        if (p === "") continue;
        tokens.push({ text: p, space: /^\s+$/.test(p), run: r });
      }
    }
    const textX = x0 + px(para.marL);
    const bulletX = x0 + px(para.marL + Math.min(0, para.indent)) + (para.indent < 0 ? 0 : px(para.indent));
    const sizes = para.runs.map((r) => r.size);
    const maxSz = Math.max(...sizes);
    const lineH = (maxSz / 72) * DPI * 1.2 * para.lnSpc;
    // word wrap
    let line = [], lineW = 0;
    const flush = () => {
      while (line.length && line[0].space) line.shift();
      if (!line.length) return;
      const w = line.reduce((a, t) => a + t.w, 0);
      lines.push({ tokens: line, width: w, x: textX, y: curY, lineH, para });
      curY += lineH; contentH += lineH;
      line = []; lineW = 0;
    };
    for (const t of tokens) {
      const r = t.run;
      ctx.font = fontString(face(r.typeface, r.bold, r.italic, t.text), (r.size / 72) * DPI);
      const track = (r.spc / 72) * DPI;
      const w = ctx.measureText(t.text).width + (t.space ? 0 : track * Math.max(0, t.text.length - 1));
      t.w = w; t.track = track;
      if (t.space) { if (line.length) { line.push(t); lineW += w; } continue; }
      if (line.length && lineW + w > availW + 1) flush();
      line.push(t); lineW += w;
    }
    flush();
    // bullet on first line
    if (para.bullet && lines.length) {
      const lastParaLines = lines.filter((l) => l.para === para);
      if (lastParaLines[0]) lastParaLines[0].bullet = { char: para.bullet, x: bulletX, run: para.runs[0] };
    }
    curY += (para.spcAft / 72) * DPI; contentH += (para.spcAft / 72) * DPI;
  }
  // vertical anchor
  let startY = y0;
  if (b.anchor === "ctr") startY = y0 + Math.max(0, (availH - contentH) / 2);
  if (b.anchor === "b") startY = y0 + Math.max(0, availH - contentH);
  const dy = startY - y0;
  lines.forEach((l) => (l.y += dy));
  return { lines, contentH, availH, overflow: contentH > availH + 2.5 };
}

/* ---------- render ---------- */
(async () => {
  fs.mkdirSync(RENDER_DIR, { recursive: true });
  const zip = new AdmZip(PPTX);
  const slideFiles = zip.getEntries().map((e) => e.entryName).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  const relsCache = {};
  const relOf = (slideFile) => {
    if (!relsCache[slideFile]) {
      const n = slideFile.match(/slide(\d+)\.xml/)[1];
      const rel = zip.readAsText(`ppt/slides/_rels/slide${n}.xml.rels`);
      const map = {};
      let r; const re = /<Relationship Id="(rId\d+)"[^>]*Target="([^"]+)"/g;
      while ((r = re.exec(rel))) map[r[1]] = "ppt/" + r[2].replace(/^\.\.\//, "");
      relsCache[slideFile] = map;
    }
    return relsCache[slideFile];
  };

  const issues = [];
  const report = [];
  const pdf = new PDFDocument({ size: [960, 540], margin: 0, info: { Title: "Gestalt Theory and Its Application to Counselling", Author: "Group 4" } });
  pdf.pipe(fs.createWriteStream(PDF));

  const N = slideFiles.length;
  if (N !== MANIFEST.length) issues.push(`GLOBAL: slide count ${N} != manifest ${MANIFEST.length}`);

  for (let si = 0; si < N; si++) {
    const sf = slideFiles[si];
    const slideNo = si + 1;
    const el = parseSlide(zip, zip.readAsText(sf));
    const rels = relOf(sf);
    const canvas = createCanvas(PXW, PXH);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, PXW, PXH);

    const textRects = [];
    const slideTexts = [];
    let drew = 0;

    for (const e of el) {
      if (e.kind === "bg") {
        ctx.fillStyle = "#" + e.fill.color; ctx.globalAlpha = e.fill.alpha; ctx.fillRect(0, 0, PXW, PXH); ctx.globalAlpha = 1; drew++;
        continue;
      }
      const X = px(e.box.x), Y = px(e.box.y), W = px(e.box.w), H = px(e.box.h);
      if (e.kind === "pic") {
        const entry = e.rId && rels[e.rId] ? zip.getEntry(rels[e.rId]) : null;
        if (!entry) { issues.push(`S${slideNo}: missing image ${e.rId}`); continue; }
        const img = await GlobalFontsImage(zip, entry);
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (e.srcRect) {
          const l = num(attr(e.srcRect, "l"), 0) / 100000, t = num(attr(e.srcRect, "t"), 0) / 100000;
          const r = num(attr(e.srcRect, "r"), 0) / 100000, b2 = num(attr(e.srcRect, "b"), 0) / 100000;
          sx = img.width * l; sy = img.height * t; sw = img.width * (1 - l - r); sh = img.height * (1 - t - b2);
        }
        ctx.drawImage(img, sx, sy, sw, sh, X, Y, W, H); drew++;
        continue;
      }
      // shape
      if (e.fill && e.prst !== "line") {
        ctx.globalAlpha = e.fill.alpha;
        ctx.fillStyle = "#" + e.fill.color;
        if (e.prst === "ellipse") { ctx.beginPath(); ctx.ellipse(X + W / 2, Y + H / 2, W / 2, H / 2, 0, 0, Math.PI * 2); ctx.fill(); }
        else if (e.prst === "roundRect") {
          const rad = e.adj != null ? (Math.min(W, H) * e.adj) / 100000 : Math.min(20, H / 4);
          ctx.beginPath(); roundRectPath(ctx, X, Y, W, H, Math.min(rad, W / 2, H / 2)); ctx.fill();
        } else ctx.fillRect(X, Y, W, H);
        ctx.globalAlpha = 1;
      }
      if (e.line) {
        ctx.strokeStyle = "#" + e.line.color; ctx.globalAlpha = e.line.alpha;
        ctx.lineWidth = Math.max(1, (e.line.w / EMU) * DPI);
        if (e.prst === "ellipse") { ctx.beginPath(); ctx.ellipse(X + W / 2, Y + H / 2, W / 2, H / 2, 0, 0, Math.PI * 2); ctx.stroke(); }
        else if (e.prst === "roundRect") {
          const rad = e.adj != null ? (Math.min(W, H) * e.adj) / 100000 : Math.min(20, H / 4);
          ctx.beginPath(); roundRectPath(ctx, X, Y, W, H, Math.min(rad, W / 2, H / 2)); ctx.stroke();
        } else ctx.strokeRect(X, Y, W, H);
        ctx.globalAlpha = 1;
      }
      if (e.text) {
        const lay = layoutParas(ctx, e);
        const fullText = e.text.paras.map((p) => p.runs.map((r) => r.text).join("")).join(" ");
        slideTexts.push(fullText);
        // overflow
        if (lay.overflow) issues.push(`S${slideNo} OVERFLOW: "${fullText.slice(0, 45)}…" needs ${Math.round(lay.contentH / DPI * 72)}pt in ${Math.round(lay.availH / DPI * 72)}pt box`);
        // contrast: sample bg under each line before drawing
        for (const ln of lay.lines) {
          const lineRunsW = {}; ln.tokens.forEach((t) => { if (!t.space) lineRunsW[t.run.color] = (lineRunsW[t.run.color] || 0) + t.w; });
          const domColor = Object.entries(lineRunsW).sort((a, b) => b[1] - a[1])[0][0];
          const region = { x: Math.max(0, ln.x - 2), y: Math.max(0, ln.y), w: Math.min(PXW - ln.x, ln.width + 6), h: Math.min(ln.lineH, PXH - ln.y) };
          if (region.w > 4 && region.h > 4) {
            const data = ctx.getImageData(region.x | 0, region.y | 0, Math.ceil(region.w), Math.ceil(region.h)).data;
            let sum = 0, n = 0; const lums = [];
            for (let i = 0; i < data.length; i += 16) {
              const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
              const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
              const L = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
              lums.push(L); sum += L; n++;
            }
            if (n > 10) {
              const mean = sum / n;
              const cr = contrast(hexLum(domColor), mean);
              if (cr < 3.0) issues.push(`S${slideNo} CONTRAST ${cr.toFixed(2)}: "${ln.tokens.filter(t=>!t.space).map(t=>t.text).join('').slice(0, 40)}" #${domColor} on ~#${avgHex(data)}`);
            }
          }
        }
        // draw
        for (const ln of lay.lines) {
          let dx = ln.x;
          if (ln.para.algn === "ctr") dx = ln.x + Math.max(0, (px(e.box.w - e.text.bodyPr.lIns - e.text.bodyPr.rIns) - ln.width) / 2);
          if (ln.para.algn === "r") dx = ln.x + Math.max(0, (px(e.box.w - e.text.bodyPr.lIns - e.text.bodyPr.rIns) - ln.width));
          if (ln.bullet) {
            const r = ln.bullet.run;
            ctx.font = fontString(face(r.typeface, r.bold, false, ln.bullet.char), (r.size / 72) * DPI);
            ctx.fillStyle = "#" + r.color; ctx.globalAlpha = r.alpha;
            ctx.textBaseline = "alphabetic";
            ctx.fillText(ln.bullet.char, ln.bullet.x, ln.y + ascentOf(ctx, ln.lineH));
          }
          const baseY = ln.y + ascentOf(ctx, ln.lineH);
          for (const t of ln.tokens) {
            if (t.space) { dx += t.w; continue; }
            const r = t.run;
            ctx.font = fontString(face(r.typeface, r.bold, r.italic, t.text), (r.size / 72) * DPI);
            ctx.fillStyle = "#" + r.color; ctx.globalAlpha = r.alpha;
            ctx.textBaseline = "alphabetic";
            if (r.shadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; }
            if (t.track > 0.5) drawTracked(ctx, t.text, dx, baseY, t.track);
            else ctx.fillText(t.text, dx, baseY);
            ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
            dx += t.w;
          }
          textRects.push({ x: Math.min(ln.x, dx - ln.width), y: ln.y, w: ln.width, h: ln.lineH, txt: ln.tokens.filter(t => !t.space).map(t => t.text).join(" ") });
        }
      }
    }

    // overlap check (text vs text)
    for (let i = 0; i < textRects.length; i++) for (let j = i + 1; j < textRects.length; j++) {
      const a = textRects[i], b = textRects[j];
      const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
      const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      if (ix * iy > 0.02 * DPI * DPI * 2) issues.push(`S${slideNo} OVERLAP: "${a.txt.slice(0, 25)}" × "${b.txt.slice(0, 25)}"`);
    }

    // global checks
    const all = slideTexts.join(" | ");
    const low = all.toLowerCase();
    for (const bad of ["undefined", "nan", "todo", "lorem", "[object"]) if (low.includes(bad)) issues.push(`S${slideNo} PLACEHOLDER: "${bad}"`);
    const mf = MANIFEST[si];
    if (mf) {
      const words = mf.title.toLowerCase().split(/\s+/).slice(0, 2);
      if (!words.every((w) => low.includes(w.replace(/[^a-z-]/g, "")))) issues.push(`S${slideNo} MANIFEST: "${mf.title}" text not found`);
    }
    if (slideNo > 1) {
      if (!all.includes("PAN AFRICAN")) issues.push(`S${slideNo} FOOTER: brand missing`);
      if (!slideTexts.some((t) => t.trim() === String(slideNo).padStart(2, "0"))) issues.push(`S${slideNo} FOOTER: number missing/wrong`);
    }

    // outputs
    const png = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(RENDER_DIR, `slide-${String(slideNo).padStart(2, "0")}.png`), png);
    if (slideNo > 1) pdf.addPage({ size: [960, 540] });
    pdf.image(canvas.toBuffer("image/jpeg", { quality: 0.85 }), 0, 0, { width: 960, height: 540 });
    report.push(`S${String(slideNo).padStart(2, "0")}  elements=${el.length} drew=${drew} texts=${slideTexts.length}`);
  }

  pdf.end();
  fs.writeFileSync(path.join(DECK, "render-report.txt"),
    `RENDER REPORT — ${new Date().toISOString()}\nSlides: ${N}\n\n` + report.join("\n") + "\n\nISSUES:\n" + (issues.length ? issues.map((i) => "  ✗ " + i).join("\n") : "  none — all checks passed") + "\n");

  console.log(report.join("\n"));
  console.log("\n---- ISSUES (" + issues.length + ") ----");
  issues.forEach((i) => console.log("  ✗ " + i));
  if (!issues.length) console.log("  ✓ all checks passed");
  console.log("\nPDF:", PDF);
  process.exit(issues.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

/* ---------- utils ---------- */
async function GlobalFontsImage(zip, entry) {
  const name = entry.entryName;
  if (!IMG_CACHE[name]) {
    const buf = entry.getData();
    const { loadImage } = require("@napi-rs/canvas");
    IMG_CACHE[name] = await loadImage(buf);
  }
  return IMG_CACHE[name];
}
function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ascentOf(ctx, lineH) { return lineH * 0.78; }
function drawTracked(ctx, text, x, y, track) {
  let cx = x;
  for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + track; }
}
function avgHex(data) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 16) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  if (!n) return "000000";
  const h = (v) => Math.round(v / n).toString(16).padStart(2, "0");
  return (h(r) + h(g) + h(b)).toUpperCase();
}
