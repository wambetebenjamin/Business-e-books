/*
 * CHRISCO Central Youth Nairobi. TREASURE TUESDAY SERIES
 * "Cancel Culture vs Grace Culture. Creating a balance between them"
 * by Minister Naomi Njoki
 *
 * An A5 booklet (419.25 x 595.5 pt) that keeps the geometry of the supplied
 * template `topic book.pdf`: the same frame insets, colour bands, 45 degree
 * corner pennants, two column and six cell grids, tick lists and back cover.
 *
 * Three house rules shape the design:
 *   1. Images are flat silhouettes, drawn as faint background watermarks.
 *      PDF graphics-state opacity (not an image option) keeps them subdued.
 *   2. Three base colours only: charcoal, warm paper and muted gold. Panels
 *      are solid, not multicolour gradients; light tints use transparency.
 *   3. Classic standard PDF Times faces, with real bold and italic styles.
 *      Text is selectable, never generated or baked into an image.
 *
 * Build: npm ci && node generate-treasure-tuesday.js
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Cancel Culture vs Grace Culture - Treasure Tuesday.pdf');
const A = p => path.join(__dirname, 'assets', p);

/* ============================== template geometry ============================== */
const W = 419.25, H = 595.5;             // A5 portrait, the template's page box
const FX = 6.7, FW = 405.85;             // outer frame: inset 6.7pt, 405.85 wide
const ML = 55.7, MR = 363.6;             // the template's text margins
const CW = MR - ML;                      // 307.9pt
const C2 = 228.0;                        // right column x (template's second column)
const C2n = 223.6;                       // column x for the two column pages
const HALF = (CW - 12) / 2;              // 147.95pt column
const PENN_W = 252, PENN_H = 168;        // pennant body plus a 45 degree point
const DPI = 150;                         // floor for a silhouette's effective resolution

/* ================================ the colour set ===============================
 * Exactly three base colours. Legacy role names deliberately share these
 * values so all existing layouts stay inside the restrained palette.
 */
const paper = '#FBF7F1';
const ink = '#29252C';
const gold = '#997440';
const white = paper, plum = ink, accent = ink;
const tint = paper, tint2 = paper, edge = gold;
const BAND = ink;
const ROW_COLORS = [ink];
const BACKGROUND_OPACITY = { light: .045, dark: .14 };

// Measure each standard face rather than retaining the old font's metrics.
const lh = (font = 'serif') => {
  doc.font(font).fontSize(10);
  return doc.currentLineHeight(true) / 10;
};

/* house rule for this book: the copy contains no dashes and no mid dots */
const DASH = /[—–‒―·•…\-]/;
const DASH_ALL = /[—–‒―·•…\-]/g;

const doc = new PDFDocument({
  size: [W, H], margin: 0,
  info: {
    Title: 'Cancel Culture vs Grace Culture. Creating a Balance Between Them',
    Author: 'Minister Naomi Njoki, CHRISCO Central Youth Nairobi',
    Subject: 'Treasure Tuesday Series, CHRISCO Central Youth Nairobi',
    Keywords: 'cancel culture, grace, accountability, restoration, youth fellowship, Nairobi'
  }
});
doc.pipe(fs.createWriteStream(OUT));
// Conventional PDF core fonts: no custom display font or generated lettering.
const FONT_ROLES = {
  serif: 'Times-Roman', bold: 'Times-Bold', italic: 'Times-Italic',
  boldIt: 'Times-BoldItalic', display: 'Times-Bold', displayIt: 'Times-Italic',
  quote: 'Times-Italic', quoteBold: 'Times-Bold', caps: 'Times-Bold'
};
Object.entries(FONT_ROLES).forEach(([role, font]) => doc.registerFont(role, font));

let page = 0, warn = [];
const BACKGROUNDS = ['worship', 'community', 'reflect', 'cover', 'choir'];
const newpage = () => {
  page++;
  if (page > 1) doc.addPage({ size: [W, H], margin: 0 });
  fillRect(0, 0, W, H, paper);
  // Always underneath the copy. Dark bands painted later cover this watermark
  // and receive their own light silhouette where the layout calls for one.
  shape(BACKGROUNDS[(page - 1) % BACKGROUNDS.length], 20, 150, W - 40, H - 180,
    { tone: 'ink', opacity: BACKGROUND_OPACITY.light, valign: 'bottom' });
};

/* ---------------------------------- primitives -------------------------------- */
// Existing calls keep their geometry, but all fills are now solid colours.
const grad = (x0, y0, x1, y1, c0) => Array.isArray(c0) ? c0[0] : c0;
const paint = (x, y, w, h, c) => Array.isArray(c) ? c[0] : c;
const fillRect = (x, y, w, h, c) => doc.rect(x, y, w, h).fill(paint(x, y, w, h, c));
const band = (y, h, c) => fillRect(FX, y, FW, h, c);
const rule = (y, c = edge, wd = .7, x0 = ML, x1 = MR) =>
  doc.moveTo(x0, y).lineTo(x1, y).lineWidth(wd).strokeColor(c).stroke();
const hairline = (y, c) => doc.rect(FX, y, FW, 2).fill(c);

/** The template's "home plate" corner decoration: a bar with a 45 degree point. */
function pennant(tipX, tipY, dir, bodyLen, h, c0, c1) {
  const e = h / 2, x0 = tipX + dir * e, x1 = x0 + dir * bodyLen;
  doc.save();
  doc.moveTo(tipX, tipY).lineTo(x0, tipY - e).lineTo(x1, tipY - e)
     .lineTo(x1, tipY + e).lineTo(x0, tipY + e).closePath().clip();
  const gx0 = Math.min(tipX, x0, x1), gx1 = Math.max(tipX, x0, x1);
  doc.rect(gx0, tipY - e, gx1 - gx0, h).fill(grad(gx0, tipY - e, gx1, tipY + e, c0, c1));
  doc.restore();
}

/* -------------------------------- silhouettes ---------------------------------- */
/** pixel sizes of the cut shapes, so a shape is never stretched past its pixels */
const MAN = JSON.parse(fs.readFileSync(A('sil/manifest.json'), 'utf8'));

const USED = [];
/** the flat silhouette `name`, sized to fit a box, in ink or paper */
function shape(name, x, y, maxW, maxH, o = {}) {
  const m = MAN[name] || { w: 900, h: 600 }, ar = m.w / m.h;
  let w = Math.min(maxW, m.w / DPI * 72), h = w / ar;
  if (h > maxH) { h = maxH; w = h * ar; }
  const px = o.align === 'right' ? x + maxW - w : o.align === 'left' ? x : x + (maxW - w) / 2;
  const py = o.valign === 'bottom' ? y + maxH - h : o.valign === 'top' ? y : y + (maxH - h) / 2;
  const opts = { width: w, height: h };
  if (o.fill) {                       // fill the whole box, anchored, cropping the excess
    delete opts.width; delete opts.height;
    opts.cover = [maxW, maxH];
    opts.align = o.align || 'center';
    opts.valign = o.valign || 'bottom';
  }
  // PDFKit does not apply an `opacity` image option. Set the graphics state
  // explicitly, then restore it so text and subsequent panels stay opaque.
  doc.save();
  doc.opacity(Math.min(o.opacity ?? BACKGROUND_OPACITY.dark, BACKGROUND_OPACITY.dark));
  if (o.clip) doc.rect(...o.clip).clip();
  doc.image(A('sil/' + (o.tone || 'ink') + '/' + name + '.png'), o.fill ? x : px, o.fill ? y : py, opts);
  doc.restore();
  USED.push({ name, tone: o.tone || 'ink', w: +(o.fill ? maxW : w).toFixed(0), h: +(o.fill ? maxH : h).toFixed(0),
              dpi: Math.round(m.w / ((o.fill ? maxW : w) / 72)) });
  return { x: px, y: py, w, h, bottom: py + h, dpi: Math.round(m.w / (w / 72)) };
}
/** a silhouette bled off the page edge: the box sits past the trim, so the part
 *  that would fall outside the page is cropped by the page itself */
const bleed = (name, x, y, w, h, o = {}) => shape(name, x, y, w, h, { fill: true, ...o });

/* ------------------------- text: measured, auto fitting ------------------------ */
/** draw `str` at (x,y) inside `width`, shrinking the type until it clears `maxY` */
function place(str, x, y, o = {}) {
  const { width = CW, size = 9.6, min, font = 'serif', color = ink, fade = 1,
          align = 'left', space = 0, maxY = 588, name = '' } = o;
  let text = String(str);
  if (font === 'caps') text = text.toUpperCase();
  if (DASH.test(String(str))) warn.push(`dash in copy: ${name || String(str).slice(0, 24)}`);
  text = text.replace(DASH_ALL, ' ');
  const L = lh(font);
  const lead = o.lead != null ? o.lead : size * L + Math.max(2.6, size * .40);
  const ratio = lead / size, floor = min != null ? min : size * .78;
  const h = sz => { doc.font(font).fontSize(sz);
    return doc.heightOfString(text, { width, characterSpacing: space, lineGap: sz * ratio - sz * L }); };
  let s = size;
  const oneLine = sz => {
    doc.font(font).fontSize(sz);
    return doc.heightOfString(text, { width, characterSpacing: space }) <= sz * L * 1.02;
  };
  const single = !/\n/.test(text);
  while ((y + h(s) > maxY + .6 || (o.fit && single && !oneLine(s))) && s > floor) s = Math.round((s - .2) * 10) / 10;
  if (y + h(s) > maxY + .6) warn.push(`overflow: ${name || text.slice(0, 28)} (needs ${(y + h(s)).toFixed(0)}, limit ${maxY})`);
  if (o.fit && single && !oneLine(s)) warn.push(`wrapped: ${name || text.slice(0, 28)}`);
  doc.save();
  if (fade < 1) doc.fillOpacity(fade);
  doc.font(font).fontSize(s).fillColor(color)
     .text(text, x, y, { width, align, characterSpacing: space, lineGap: s * ratio - s * L });
  doc.restore();
  return doc.y;
}
/** height a string would occupy at a given size and lead */
function hOf(str, size, width, lead, font = 'serif', space = 0) {
  let t = String(str).replace(DASH_ALL, ' ');
  if (font === 'caps') t = t.toUpperCase();
  doc.font(font).fontSize(size);
  return doc.heightOfString(t, { width, characterSpacing: space, lineGap: lead - size * lh(font) });
}
const right = (str, y, o) => place(str, ML, y, { width: CW, align: 'right', ...o });
/** largest body size (then gap) that keeps N rows of heading plus text in a band */
function solveRows(rows, startY, endY, { head = 11.4, width = 268, badge = 27 } = {}) {
  const sizes = [9.6, 9.4, 9.2, 9.0, 8.8, 8.6, 8.4], gaps = [15, 13, 11.5, 10, 8.5, 7, 5.5];
  for (const b of sizes) for (const g of gaps) {
    let y = startY; const tops = [];
    for (const r of rows) {
      const hh = hOf(r[0], head, width, head * 1.30, 'bold');
      const bh = hOf(r[1], b, width, b * 1.44);
      tops.push(y); y += Math.max(badge, hh + 3.4 + bh) + g;
    }
    if (y - g <= endY) return { size: b, gap: g, headLead: head * 1.30, bodyLead: b * 1.44, tops };
  }
  warn.push(`rows do not fit ${startY.toFixed(0)} to ${endY}`);
  const step = (endY - startY) / rows.length;
  return { size: 8.2, gap: 5, headLead: 14, bodyLead: 11.2, tops: rows.map((_, i) => startY + i * step) };
}
/** the template sets type over dark panels twice: ink at the same origin, then
 *  the real colour on top, which reads as an outline holding the letterform */
function shadow(str, x, y, o = {}) {
  if (o.ink !== false) place(str, x, y, { ...o, color: ink });
  return place(str, x, y, o);
}

/* ---------------------------------- small marks --------------------------------- */
const paperCard = (x, y, w, h, r = 7, fill = tint) => {
  doc.save().fillOpacity(.045).roundedRect(x, y, w, h, r).fill(ink).restore();
};
function disc(cx, cy, r, c, glyph) {
  doc.circle(cx, cy, r).fill(paint(cx - r, cy - r, r * 2, r * 2, c));
  if (glyph) glyphIcon(glyph, cx, cy, r / 10.4);
}
function badge(cx, cy, r, c, glyph) {         // flat ink disc, paper glyph
  doc.circle(cx, cy, r).fill(c);
  if (glyph) glyphIcon(glyph, cx, cy, r / 10.4);
}
function letterDisc(cx, cy, r, ch, c) {
  doc.circle(cx, cy, r).fill(c);
  doc.font('display').fontSize(r * 1.05).fillColor(paper)
     .text(String(ch).toUpperCase(), cx - r, cy - r * .74, { width: r * 2, align: 'center' });
}
function checkBadge(x, y, c, size = 27) {
  doc.roundedRect(x, y, size, size, 5).lineWidth(1.7).strokeColor(c).stroke();
  doc.save().lineCap('round').lineJoin('round').lineWidth(2.4).strokeColor(c);
  const k = size / 27;
  doc.moveTo(x + 7.2 * k, y + 14.2 * k).lineTo(x + 11.9 * k, y + 19 * k)
     .lineTo(x + 20.4 * k, y + 9.2 * k).stroke();
  doc.restore();
}
function numberBadge(x, y, r, n, c) {
  doc.circle(x + r, y + r, r).fill(c);
  doc.font('display').fontSize(r * 1.15).fillColor(white)
     .text(String(n), x, y + r * .28, { width: r * 2, align: 'center' });
}
const kicker = (str, x, y, c, o = {}) =>
  place(str, x, y, { size: 8.6, font: 'caps', color: c, space: 2.4, lead: 11.5, ...o });

/* ------------------ line icons, drawn as strokes and fills --------------------- */
function icon(kind, cx, cy, c, s = 1) {
  doc.save();
  doc.lineWidth(1.6 * s).strokeColor(c).fillColor(c).lineCap('round').lineJoin('round');
  const line = pts => {
    doc.moveTo(pts[0][0] * s + cx, pts[0][1] * s + cy);
    for (let i = 1; i < pts.length; i++) doc.lineTo(pts[i][0] * s + cx, pts[i][1] * s + cy);
    doc.stroke();
  };
  const ring = (ox, oy, r) => doc.circle(cx + ox * s, cy + oy * s, r * s).stroke();
  switch (kind) {
    case 'key': ring(-4.2, -4.2, 4.1); line([[-1.2, -1.2], [6.6, 6.6]]);
      line([[3.6, 6.6], [5.6, 4.6]]); line([[1.2, 4.2], [3.2, 2.2]]); break;
    case 'scales': line([[0, -8.4], [0, 7.2]]); line([[-7.2, -5.4], [7.2, -5.4]]);
      line([[-7.2, -5.4], [-9.6, .6], [-4.8, .6]]); line([[7.2, -5.4], [4.8, .6], [9.6, .6]]);
      line([[-4, 7.4], [4, 7.4]]); break;
    case 'loop':
      doc.arc(cx, cy, 7.2 * s, 3.55, 5.95); doc.stroke();
      doc.moveTo(cx + 7.3 * s, cy - .4 * s).lineTo(cx + 3.4 * s, cy - 3.4 * s)
         .lineTo(cx + 8.4 * s, cy - 5.4 * s).closePath().fill(c); break;
    case 'heart':
      doc.moveTo(cx, cy + 6.8 * s)
         .bezierCurveTo(cx - 10 * s, cy - 1 * s, cx - 5.6 * s, cy - 9.6 * s, cx, cy - 3.4 * s)
         .bezierCurveTo(cx + 5.6 * s, cy - 9.6 * s, cx + 10 * s, cy - 1 * s, cx, cy + 6.8 * s).stroke(); break;
    case 'shield':
      doc.moveTo(cx, cy - 8.6 * s).lineTo(cx + 7.4 * s, cy - 5 * s).lineTo(cx + 7.4 * s, cy + 1 * s)
         .bezierCurveTo(cx + 7.4 * s, cy + 6.2 * s, cx + 3.2 * s, cy + 8.2 * s, cx, cy + 9.2 * s)
         .bezierCurveTo(cx - 3.2 * s, cy + 8.2 * s, cx - 7.4 * s, cy + 6.2 * s, cx - 7.4 * s, cy + 1 * s)
         .lineTo(cx - 7.4 * s, cy - 5 * s).closePath().stroke();
      line([[-2.9, .3], [0, 3.2], [3.5, -3]]); break;
    case 'venn': ring(-3.4, 0, 5.7); ring(3.4, 0, 5.7); break;
    case 'font':
      line([[-7, -7], [7, -7]]); line([[0, -7], [0, 7.4]]); line([[-3.4, 7.4], [3.4, 7.4]]); break;
    case 'eyes':
      ring(-3.8, 0, 5.4); ring(3.8, 0, 5.4); doc.circle(cx, cy, 1.9 * s).fill(c); break;
    case 'branch':
      line([[0, 8.4], [0, -4.2]]);
      doc.moveTo(cx, cy - 4.2 * s).bezierCurveTo(cx - 1 * s, cy - 9 * s, cx - 6 * s, cy - 9.4 * s, cx - 7 * s, cy - 8.8 * s)
         .bezierCurveTo(cx - 6.2 * s, cy - 3.4 * s, cx - 2.2 * s, cy - 2.6 * s, cx, cy - 4.2 * s).stroke();
      doc.moveTo(cx, cy - 1 * s).bezierCurveTo(cx + 1 * s, cy - 6.4 * s, cx + 6 * s, cy - 7 * s, cx + 7 * s, cy - 6.4 * s)
         .bezierCurveTo(cx + 6 * s, cy - 1 * s, cx + 2.2 * s, cy - .4 * s, cx, cy - 1 * s).stroke(); break;
    case 'path':
      line([[-8, 7.4], [-1.6, 1], [1.6, 4.2], [8, -3]]);
      doc.circle(cx + 8 * s, cy - 5.4 * s, 2.2 * s).fill(c); break;
    case 'basket':
      doc.moveTo(cx - 8 * s, cy - 3 * s).lineTo(cx + 8 * s, cy - 3 * s)
         .lineTo(cx + 5.4 * s, cy + 7 * s).lineTo(cx - 5.4 * s, cy + 7 * s).closePath().stroke();
      doc.arc(cx, cy - 3 * s, 4.6 * s, Math.PI, 0); doc.stroke();
      line([[-2.4, -9.4], [-2.4, -3.4]]); line([[2.4, -9.4], [2.4, -3.4]]); break;
    case 'shieldCheck':
      doc.moveTo(cx, cy - 8.6 * s).lineTo(cx + 7.4 * s, cy - 5 * s).lineTo(cx + 7.4 * s, cy + 1 * s)
         .bezierCurveTo(cx + 7.4 * s, cy + 6.2 * s, cx + 3.2 * s, cy + 8.2 * s, cx, cy + 9.2 * s)
         .bezierCurveTo(cx - 3.2 * s, cy + 8.2 * s, cx - 7.4 * s, cy + 6.2 * s, cx - 7.4 * s, cy + 1 * s)
         .lineTo(cx - 7.4 * s, cy - 5 * s).closePath().stroke(); break;
  }
  doc.restore();
}
/** the small glyphs that sit in the six cell discs */
function glyphIcon(kind, cx, cy, s) {
  doc.save();
  doc.lineWidth(1.7 * s).strokeColor(paper).fillColor(paper).lineCap('round').lineJoin('round');
  const line = pts => {
    doc.moveTo(pts[0][0] * s + cx, pts[0][1] * s + cy);
    for (let i = 1; i < pts.length; i++) doc.lineTo(pts[i][0] * s + cx, pts[i][1] * s + cy);
    doc.stroke();
  };
  const ring = (ox, oy, r) => doc.circle(cx + ox * s, cy + oy * s, r * s).stroke();
  switch (kind) {
    case 'key': ring(-4.2, -4.2, 4.1); line([[-1.2, -1.2], [6.6, 6.6]]);
      line([[3.6, 6.6], [5.6, 4.6]]); line([[1.2, 4.2], [3.2, 2.2]]); break;
    case 'scales': line([[0, -8.4], [0, 7.2]]); line([[-7.2, -5.4], [7.2, -5.4]]);
      line([[-7.2, -5.4], [-9.6, .6], [-4.8, .6]]); line([[7.2, -5.4], [4.8, .6], [9.6, .6]]);
      line([[-4, 7.4], [4, 7.4]]); break;
    case 'loop':
      doc.arc(cx, cy, 7.2 * s, 3.55, 5.95); doc.stroke();
      doc.moveTo(cx + 7.3 * s, cy - .4 * s).lineTo(cx + 3.4 * s, cy - 3.4 * s)
         .lineTo(cx + 8.4 * s, cy - 5.4 * s).closePath().fill(paper); break;
    case 'heart':
      doc.moveTo(cx, cy + 6.8 * s)
         .bezierCurveTo(cx - 10 * s, cy - 1 * s, cx - 5.6 * s, cy - 9.6 * s, cx, cy - 3.4 * s)
         .bezierCurveTo(cx + 5.6 * s, cy - 9.6 * s, cx + 10 * s, cy - 1 * s, cx, cy + 6.8 * s).stroke(); break;
    case 'shield':
      doc.moveTo(cx, cy - 8.6 * s).lineTo(cx + 7.4 * s, cy - 5 * s).lineTo(cx + 7.4 * s, cy + 1 * s)
         .bezierCurveTo(cx + 7.4 * s, cy + 6.2 * s, cx + 3.2 * s, cy + 8.2 * s, cx, cy + 9.2 * s)
         .bezierCurveTo(cx - 3.2 * s, cy + 8.2 * s, cx - 7.4 * s, cy + 6.2 * s, cx - 7.4 * s, cy + 1 * s)
         .lineTo(cx - 7.4 * s, cy - 5 * s).closePath().stroke();
      line([[-2.9, .3], [0, 3.2], [3.5, -3]]); break;
    case 'venn': ring(-3.4, 0, 5.7); ring(3.4, 0, 5.7); break;
  }
  doc.restore();
}

/* ============================================================================= */
/*  PAGE 1 — front cover                                                        */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, H, grad(0, 0, W, H, BAND));
pennant(324, 150, 1, PENN_W, PENN_H, gold, accent);
fillRect(0, H - 7, W, 7, gold);

kicker('Treasure Tuesday Series', ML, 52, gold);
place('CHRISCO', ML, 88, { size: 21, font: 'display', color: paper, space: 4.2, lead: 25, fit: true });
place('Central Youth, Nairobi', ML, 116, { size: 10.2, font: 'italic', color: paper, fade: .8, space: 1.2, lead: 13.4, fit: true });

/* the booklet's shape: hands raised, cut from the photo pool */
shape('worship', ML, 144, CW, 246, { tone: 'paper', opacity: BACKGROUND_OPACITY.dark, align: 'center' });

place('Cancel Culture\nvs Grace Culture', ML, 404,
  { size: 27, font: 'display', color: paper, width: CW, align: 'right', lead: 32, maxY: 470, name: 'cover title' });
place('Creating a balance between them', ML, 474,
  { size: 13, font: 'displayIt', color: gold, width: CW, align: 'right', lead: 17, maxY: 496, fit: true, name: 'cover sub' });
rule(512, gold, .9);
right('By Minister Naomi Njoki, CHRISCO Central Youth Nairobi', 524,
  { size: 7.6, font: 'caps', color: paper, fade: .78, space: 1.2, lead: 10.5, fit: true });

/* ============================================================================= */
/*  PAGE 2 — the opening: band, two columns, pull quote                          */
/* ============================================================================= */
newpage();
band(0, 192, BAND);
hairline(192, gold);
place('The Question\nWe Cannot Dodge', ML, 30, { size: 26, font: 'display', color: paper, lead: 31,
  width: 186, maxY: 100 });
place('How do we hold one another accountable for wrong doing without denying the possibility of redemption? That is the question this series keeps returning to.',
  ML, 112, { size: 9.6, color: paper, fade: .92, width: 186, lead: 13.4, maxY: 186, name: 'p2 lead' });
/* the crowd, cut from the photograph, darker than the band and bled off the right */
bleed('community', 250, 68, 218, 124, { tone: 'paper', opacity: BACKGROUND_OPACITY.dark, valign: 'bottom', clip: [0, 0, W, 192] });

place('Culture is the shared beliefs, values and customs of a group, and the way a group treats someone who has fallen tells you more than any statement of faith.',
  ML, 212, { size: 9.8, font: 'italic', color: ink, fade: .72, width: CW, lead: 13.8, maxY: 246, name: 'p2 side note' });

const p2h1 = place('Cancel Culture', ML, 260, { size: 15, font: 'display', color: accent, width: HALF, lead: 19, fit: true });
place('A collective withdrawing of support from someone because of what they said or what they did. At institutional level it can serve public accountability. Left unchecked it becomes a crowd that enjoys the fall.',
  ML, p2h1 + 8, { size: 9.6, width: HALF, color: ink, fade: .86, lead: 13.6, maxY: 480, name: 'p2 left' });
doc.moveTo(C2n - 12, 260).lineTo(C2n - 12, 480).lineWidth(.6).strokeColor(edge).stroke();
const p2h2 = place('Grace Culture', C2, 260, { size: 15, font: 'display', color: plum, width: HALF, lead: 19, fit: true });
place('The free, unmerited favour of God. Grace does not excuse sin and does not cancel consequence. It opens the way back for whoever will walk it, and it keeps that way open longer than our patience does.',
  C2, p2h2 + 8, { size: 9.6, width: HALF, color: ink, fade: .86, lead: 13.6, maxY: 480, name: 'p2 right' });

rule(498, gold, 1.1);
place('Truth about the sin. Mercy for the sinner.', ML, 508,
  { size: 15.5, font: 'quoteBold', color: accent, width: CW, align: 'center', lead: 20, maxY: 532, fit: true });
place('Scripture never lets us keep one and forget the other. It exposes the works of darkness and still refuses to make a spectacle of the person standing in it.',
  ML, 534, { size: 9.6, font: 'italic', color: ink, fade: .82, width: 260, align: 'center', lead: 13.6, maxY: 574, name: 'p2 pull' });

/* ============================================================================= */
/*  PAGES 3 and 5 — six cell grids (template's services and framework pages)     */
/* ============================================================================= */
function gridPage(head, deck, items, top, accentRule, headCol) {
  newpage();
  band(-16.5, 126, top);
  hairline(109.5, accentRule);
  const DX = C2 + 30, DW = MR - DX;
  let hs = 26;
  for (const cand of [26, 24.6, 23.2, 22, 20.8]) {
    doc.font('display').fontSize(cand);
    if (Math.max(...head.split('\n').map(l => doc.widthOfString(l))) + ML + 10 <= DX) { hs = cand; break; }
  }
  const he = place(head, ML, 26, { size: hs, font: 'display', color: paper, lead: hs * 1.18, maxY: 100 });
  if (deck) place(deck, DX, 34, { size: 9.2, font: 'italic', color: paper, fade: .8, width: DW, lead: 12.6,
    maxY: 102, name: head.replace(/\n/g, ' ') + ' deck' });
  const rows = [133.5, 279.5, 425.5];
  items.forEach((it, i) => {
    const x = i % 2 ? C2 : ML, y = rows[Math.floor(i / 2)], c = headCol[i % headCol.length];
    if (it.l) letterDisc(x + 22.4, y + 22.4, 22.4, it.l, accent);
    else badge(x + 22.4, y + 22.4, 22.4, ink, it.g);
    const hEnd = place(it.h, x, y + 52, { size: 12, font: 'display', color: c, width: 150, lead: 16,
      maxY: y + 86, name: 'heading ' + i });
    const limit = rows[Math.floor(i / 2) + 1] ? rows[Math.floor(i / 2) + 1] - 5 : 578;
    place(it.b, x, Math.max(y + 82, hEnd + 6), { size: 9.5, min: 8.4, width: 152, color: ink, fade: .84,
      lead: 13.4, maxY: limit, name: 'body ' + it.h.replace(/\n/g, ' ') });
  });
}
gridPage('Six Things\nWe Must Hold', 'Distinctions the church loses at its own cost.', [
  { g: 'key', h: 'Forgiveness Is\nNot Trust', b: 'You can forgive someone who betrayed you without handing them access to your life again. Trust is rebuilt over time.' },
  { g: 'scales', h: 'Grace Is Not the\nAbsence of Consequence', b: 'The one who steals may be forgiven and still return what was taken. A repentant leader may still face discipline.' },
  { g: 'loop', h: 'Restoration Is Not\nReinstatement', b: 'Being received back is not the same as being handed the old position, the old platform or the keys that afternoon.' },
  { g: 'heart', h: 'Mercy Must Not\nErase the Victim', b: 'Care for the person who was hurt belongs in the same sentence as mercy for the one who hurt them.' },
  { g: 'shield', h: 'Safety, Justice and\nBoundaries Matter', b: 'Boundaries are not a failure of love. Protection and honest process are how love behaves in public.' },
  { g: 'venn', h: 'Discipline and Mercy\nMust Coexist', b: 'Forgiveness and justice are compatible. The cross is the proof. The line between accountability and bullying is thin.' },
], BAND, gold, [accent, plum]);

/* ============================================================================= */
/*  PAGE 4 — what the scriptures say: a tick list with a closing card            */
/* ============================================================================= */
function checkPage(head, intro, rows, bandH, edgeCol, card, first) {
  newpage();
  band(0, bandH, edgeCol);
  hairline(bandH, gold);
  const he = place(head, ML, 26, { size: 26, font: 'display', color: paper, lead: 31, maxY: bandH - 46 });
  if (intro) place(intro, ML, he + 10, { size: 9.7, font: 'italic', color: paper, fade: .82,
    width: CW, lead: 13.6, maxY: bandH - 8, name: 'intro' });
  const L = solveRows(rows, bandH + 28, card ? 496 : 578);
  rows.forEach((r, i) => {
    const y = L.tops[i], c = first[(i + first.i0) % first.length];
    checkBadge(ML, y, first.badge);
    const hy = place(r[0], ML + 40, y - 1, { size: 11.4, font: 'bold', color: c, width: 268,
      lead: L.headLead, maxY: L.tops[i + 1] ? L.tops[i + 1] - 4 : 590 });
    place(r[1], ML + 40, hy + 3.4, { size: L.size, width: 268, color: ink, fade: .84, lead: L.bodyLead,
      maxY: L.tops[i + 1] ? L.tops[i + 1] - 6 : 590 });
  });
  if (card) {
    paperCard(ML, 508, CW, 72);
    place(card[0], ML + 18, 518, { size: 12.2, font: 'display', color: plum, width: CW - 36, lead: 16, maxY: 536 });
    place(card[1], ML + 18, 538, { size: 9.4, font: 'italic', color: ink, fade: .84, width: CW - 36, lead: 13.2, maxY: 572 });
  }
  return L;
}
checkPage('What the Scriptures Say',
  'Grace is not the absence of correction and correction is not the absence of grace. God\'s word exposes wrongdoing and still protects the person.',
  [
    ['Matthew 18:15 to 17', 'Point out the fault between the two of you alone. Private first, witnesses only then, the wider circle last, and every step aimed at winning them back.'],
    ['1 Corinthians 5:1 to 13', 'The unrepentant sinner is removed from the assembly so that his spirit may be saved. Discipline with a redemptive end, never a spiteful one.'],
    ['Ephesians 5:11', 'Have nothing to do with the unfruitful works of darkness, but instead expose them. Grace does not tolerate serious wrong indefinitely.'],
    ['Proverbs 28:13', 'Whoever conceals transgressions does not prosper; whoever confesses and forsakes them finds mercy. Confession is the doorway mercy walks through.'],
    ['2 Corinthians 2:6 to 8', 'Forgive and comfort the person who has been disciplined, so that he is not overwhelmed by excessive sorrow.'],
  ], 126, BAND,
  ['Two commands, one church', 'The God who says remove that person also says forgive and comfort him. Read them together, or you will keep a discipline that cannot restore and a mercy that cannot correct.'],
  Object.assign([accent, plum], { badge: accent, i0: 0 }));

/* ============================================================================= */
/*  PAGE 5 — the framework                                                        */
/* ============================================================================= */
gridPage('The G R A C E\nFramework', 'Six practical steps for accountability with grace, usable on a Tuesday night.', [
  { l: 'G', h: 'Get the Facts', b: 'Before you speak, before you post, before you withdraw. Answering before you listen is folly (Proverbs 18:13). Hear both sides.' },
  { l: 'R', h: 'Recognise the Harm', b: 'Name what was done and who it cost. Do not minimise it for comfort and do not inflate it for effect.' },
  { l: 'A', h: 'Accountability Remains', b: 'Appropriate consequences still apply to everyone. Love does not waive them; it walks through them with you.' },
  { l: 'C', h: 'Choose Compassion', b: 'Challenge the wrong doing without dehumanising the wrong doer. Nobody is the worst thing they have done.' },
  { l: 'E', h: 'Encourage Genuine Change', b: 'Look for evidence of repentance: changed behaviour and a willingness to make amends.' },
  { l: '+', h: 'Make Room for\nRestoration', b: 'Without rushing it. Restoration is a road, not an event, and the pace of it is not ours to set.' },
], BAND, gold, [accent, plum]);

/* ============================================================================= */
/*  PAGE 6 — balance in practice: an ink strip with a shape, then a tick list     */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, 206, grad(0, 0, W, 206, BAND));
hairline(206, gold);
/* a hand raised, cut from the photograph, bled off the right of the ink strip */
bleed('worship', 246, -6, 176, 212, { tone: 'paper', opacity: BACKGROUND_OPACITY.dark, valign: 'top', clip: [0, 0, W, 206] });
place('Balance\nin Practice', ML, 62,
  { size: 25, font: 'display', color: paper, lead: 29, width: 210, maxY: 150, name: 'p6 title' });
place('We must learn the difference between public shaming and public accountability. These are the checks we keep applying to ourselves.',
  ML, 220, { size: 9.7, font: 'italic', color: ink, fade: .82, width: CW, lead: 13.4,
  maxY: 256, name: 'p6 intro' });
{
  const rows = [
    ['Private First, Public Last', 'Confrontation follows Matthew 18: one person, then two or three, then the church. Skipping to the crowd is not courage.'],
    ['Exposing Is Not a Licence for Rumour', 'Calling wrongdoing into the light never authorises gossip, screenshots shared for sport, or half a story told loudly.'],
    ['Do Not Be Selective', 'Do not be picky about what you count as moral. The standard that convicts your rival must also convict you.'],
    ['The Goal Is Restoration', 'Not the satisfaction of watching someone fall. If you are quietly hoping for the fall, check your own heart first.'],
    ['Do Not Repay Evil for Evil', 'Romans 12:17. The cycle stops with us. Refuse to answer a wrong with a bigger wrong and call that justice.'],
    ['Truth and Grace Together', 'We serve a God who calls sin what it is, who confronts wrongdoing, and who still offers mercy to those who repent.'],
  ];
  const L = solveRows(rows, 266, 580);
  rows.forEach((r, i) => {
    const y = L.tops[i], c = ROW_COLORS[i % ROW_COLORS.length];
    checkBadge(ML, y, accent);
    const hy = place(r[0], ML + 40, y - 1, { size: 11.4, font: 'bold', color: c, width: 268, lead: L.headLead,
      maxY: L.tops[i + 1] ? L.tops[i + 1] - 4 : 590 });
    place(r[1], ML + 40, hy + 3.4, { size: L.size, width: 268, color: ink, fade: .84, lead: L.bodyLead,
      maxY: L.tops[i + 1] ? L.tops[i + 1] - 6 : 590 });
  });
}

/* ============================================================================= */
/*  PAGE 7 — divider: the heart of the matter                                     */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, H, grad(0, 0, W, H, BAND));
pennant(378, 104, 1, PENN_W, PENN_H, gold, accent);
bleed('choir', -26, 44, 218, 232, { tone: 'paper', valign: 'top', opacity: BACKGROUND_OPACITY.dark });

const p7x = 219, p7w = MR - p7x;
kicker('The Heart of the Matter', p7x, 44, gold, { width: p7w });
place('What would\nJesus do?', p7x, 72, { size: 26, font: 'display', color: paper, lead: 31, width: p7w, maxY: 162 });
place('He ate with the people the crowd had already written off, and He told them to go and sin no more. He did not pretend the sin was small and He did not make an example of the sinner.',
  p7x, 174, { size: 11.2, font: 'quote', color: paper, fade: .88, width: p7w, lead: 15.4, maxY: 278, name: 'p7 quote' });

rule(300, gold, .8);
place('We are more than\nour worst moment', ML, 314,
  { size: 25, font: 'display', color: paper, lead: 30, width: 250, maxY: 384 });
place('The same grace we celebrate when God extends it to us must shape how we treat one another. That is the balance this series argues for: honest about the sin, open to the sinner, slow to join the crowd.',
  ML, 390, { size: 9.7, color: paper, fade: .84, width: CW, lead: 14, maxY: 448, name: 'p7 body' });
doc.roundedRect(ML, 462, CW, 92, 8).fill(ink);
doc.roundedRect(ML, 462, CW, 92, 8).lineWidth(.8).strokeColor(gold).stroke();
const p7t = place('For the youth church, and for anyone who has been counted out', ML + 18, 474,
  { size: 12.2, font: 'displayIt', color: gold, width: CW - 36, lead: 15.6, maxY: 508, name: 'p7 card head' });
place('Bring the whole story on Tuesday. Nothing you have done disqualifies you from this teaching, and nothing done to you excuses it.',
  ML + 18, p7t + 4, { size: 9.5, color: paper, fade: .86, width: CW - 36, lead: 13.6, maxY: 546, name: 'p7 card' });

/* ============================================================================= */
/*  PAGE 8 — set your mind on things above                                        */
/* ============================================================================= */
newpage();
band(0, 170, BAND);
hairline(170, gold);
pennant(318, 170, 1, PENN_W, PENN_H, gold, accent);
place('Set Your Mind\non Things Above', ML, 28, { size: 25, font: 'display', color: paper, lead: 30,
  width: 186, maxY: 104 });
place('Set your minds on things above, not on earthly things. For you have died, and your life is hidden with Christ in God.',
  255.7, 28, { size: 11, font: 'quote', color: paper, fade: .9, width: 108, lead: 14.6, maxY: 122, name: 'p8 verse' });
place('Colossians 3:2 to 3', ML, 128, { size: 8.4, font: 'caps', color: gold, space: 1.7, lead: 11, fit: true });
place('To set your mind on things above is to stop letting a fluctuating, noisy and contradictory world dictate how you feel about yourself.',
  ML, 146, { size: 9.5, font: 'italic', color: paper, fade: .82, width: CW, lead: 13.4, maxY: 168, name: 'p8 strap' });

const p8h1 = place('Hidden, not\nfrom others', ML, 200, { size: 15, font: 'display', color: accent, width: HALF, lead: 19 });
place('When your identity is rooted in who Jesus is and what He has done, rather than in what you dig up inside yourself, you live life to its truest.',
  ML, p8h1 + 8, { size: 9.6, width: HALF, color: ink, fade: .86, lead: 13.6, maxY: 392, name: 'p8 left' });
doc.moveTo(C2n - 12, 200).lineTo(C2n - 12, 392).lineWidth(.6).strokeColor(edge).stroke();
const p8h2 = place('Protected\nby Christ', C2, 200, { size: 15, font: 'display', color: plum, width: HALF, lead: 19 });
place('When you hide your identity in Christ it is not hidden from other people; it is protected by Christ. No verdict and no committee of one writes the final sentence about you.',
  C2, p8h2 + 8, { size: 9.6, width: HALF, color: ink, fade: .86, lead: 13.6, maxY: 392, name: 'p8 right' });

paperCard(ML, 404, CW, 84);
place('Two places to live', ML + 18, 414, { size: 12.2, font: 'display', color: plum, width: CW - 36, lead: 16, maxY: 434 });
place('In the verdict of the crowd, or in the verdict of God. The crowd changes its mind by Thursday. The Father has already said what He says about you, and He does not revisit it for applause.',
  ML + 18, 436, { size: 9.5, color: ink, fade: .84, width: CW - 36, lead: 13.6, maxY: 482, name: 'p8 card' });
rule(502, gold, 1.1);
place('You are not cancelled by your worst chapter.', ML, 512,
  { size: 14.5, font: 'quoteBold', color: accent, width: CW, align: 'center', lead: 18, maxY: 534, fit: true });
place('Confession is how the chapter ends. Restoration is what follows it.', ML, 536,
  { size: 9.4, font: 'italic', color: ink, fade: .82, width: CW, align: 'center', lead: 13, maxY: 550, fit: true });

/* ============================================================================= */
/*  PAGE 9 — over to you: reflection, assignment, memory, prayer                 */
/* ============================================================================= */
newpage();
band(0, 109.5, BAND);
hairline(109.5, gold);
place('Over to You', ML, 28, { size: 26, font: 'display', color: paper, lead: 31, maxY: 66 });
place('A few things to carry into the week.', ML, 74, { size: 10.2, font: 'italic', color: paper, fade: .82, width: 170, maxY: 100 });
/* two people in profile, cut from the photograph, bled off the right of the band */
bleed('reflect', 262, 16, 200, 92, { tone: 'paper', align: 'right', opacity: BACKGROUND_OPACITY.dark, clip: [0, 0, W, 109.5] });

place('Reflect', ML, 128, { size: 15, font: 'display', color: accent, lead: 19, fit: true });
[
  'If the Bible calls us to confront sin, at what point does confrontation become condemnation?',
  'When someone falls, what do I feel first: grief for them, or the small pleasure of being proved right?',
  'Who have I already written off that God is still pursuing, and what would it cost me to believe He can still reach them?',
].forEach((q, i) => {
  const y = 154 + i * 40;
  numberBadge(ML, y - 3, 10.5, i + 1, i === 1 ? plum : accent);
  place(q, ML + 30, y, { size: 9.7, width: CW - 30, color: ink, fade: .86, lead: 13.6, maxY: y + 32, name: 'reflect ' + (i + 1) });
});

paperCard(ML, 280, CW, 72);
place('Assignment for next Tuesday', ML + 18, 290, { size: 12.2, font: 'display', color: accent, width: CW - 36, lead: 16, maxY: 310 });
place('Answer all three in writing, in one page. Then do one of these before you meet again: send the message you should have sent, return what you took, or sit with the person nobody else is speaking to.',
  ML + 18, 310, { size: 9.4, color: ink, fade: .84, width: CW - 36, lead: 13.2, maxY: 346, name: 'assignment' });

doc.roundedRect(ML, 366, CW, 26, 5).fill(accent);
place('This we believe, and this we will keep saying', ML, 373,
  { size: 10.6, font: 'caps', color: paper, space: 1.3, width: CW, align: 'center', lead: 14, maxY: 388, fit: true });

paperCard(ML, 402, HALF, 100);
place('Memorise', ML, 414, { size: 9.2, font: 'caps', color: accent, space: 1.7, width: HALF, align: 'center', lead: 12, fit: true });
place('The goal is restoration, not the satisfaction of watching another person fall.',
  ML + 14, 434, { size: 10, font: 'italic', color: ink, width: HALF - 28, align: 'center', lead: 14, maxY: 494, name: 'memorise' });
doc.roundedRect(C2n, 402, HALF, 100, 7).fill(grad(C2n, 402, C2n + HALF, 502, BAND));
place('Grace is not the absence of consequence, and consequence is not the absence of grace.',
  C2n + 14, 420, { size: 11, font: 'quoteBold', color: paper, width: HALF - 28, align: 'center', lead: 15, maxY: 494, name: 'believe' });

doc.roundedRect(ML, 516, CW, 64, 7).fill(grad(ML, 516, MR, 580, BAND));
place('Pray for both of them', ML + 18, 524, { size: 12, font: 'display', color: gold, width: CW - 36, lead: 15, maxY: 542, fit: true });
place('Pray for the one who did the wrong, that God would really change them. Pray for the one who was hurt, that God would really heal them.',
  ML + 18, 542, { size: 9.3, color: paper, fade: .84, width: CW - 36, lead: 13, maxY: 574, name: 'pray' });

/* ============================================================================= */
/*  PAGE 10 — back cover                                                          */
/* ============================================================================= */
newpage();
fillRect(FX, 0, FW, 428, grad(FX, 0, FX + FW, 428, BAND));
pennant(296, 148, 1, 252, 168, gold, accent);
place('You Are\nWelcome Here', ML, 34, { size: 25, font: 'display', color: paper, lead: 30,
  width: 200, maxY: 108 });
place('Treasure Tuesdays', ML, 124, { size: 11.4, font: 'displayIt', color: gold, lead: 15, width: 200, fit: true });
place('Every Tuesday, youth fellowship at CHRISCO Central, Nairobi. All are welcome, and the doors open fifteen minutes before we start.',
  ML, 144, { size: 9.7, color: paper, fade: .84, width: 196, lead: 13.6, maxY: 214, name: 'p10 details' });
/* hands raised, cut from the photograph, bled off the left of the panel */
bleed('cover', -26, 246, 244, 170, { tone: 'paper', valign: 'bottom', opacity: BACKGROUND_OPACITY.dark });
doc.roundedRect(232, 240, MR - 232, 176, 8).fill(ink);
doc.roundedRect(232, 240, MR - 232, 176, 8).lineWidth(.8).strokeColor(gold).stroke();
const p10t = place('The balance this book argues for', 248, 254, { size: 12, font: 'display', color: gold,
  width: MR - 264, lead: 15.4, maxY: 282 });
place('Honest about the sin and open to the sinner. Slow to join the crowd, quick to restore, serious about wrong doing and more serious about the person who made the mistake.',
  248, p10t + 7, { size: 9.2, color: paper, fade: .86, width: MR - 264, lead: 13, maxY: 408, name: 'p10 plate' });

place('Written and taught by', ML, 440, { size: 9.4, color: ink, fade: .82, lead: 13, fit: true });
place('Minister Naomi Njoki', ML, 456, { size: 14, font: 'display', color: ink, lead: 18, maxY: 478, fit: true });
place('Treasure Tuesday Series, 2026\nCancel Culture vs Grace Culture\nCreating a balance between them',
  ML, 484, { size: 9.4, color: ink, fade: .84, width: 190, lead: 13.4, maxY: 530, name: 'p10 series' });
doc.roundedRect(293.6, 442, 70, 70, 7).fill(grad(293.6, 442, 363.6, 512, BAND));
place('Grace\nand\nTruth', 293.6, 456, { size: 11, font: 'caps', color: paper, space: 1.1, width: 70, align: 'center', lead: 13.4, fit: true });
place('John 1:17', 293.6, 518, { size: 7.8, font: 'caps', color: ink, fade: .6, space: 1.3, width: 70, align: 'center', lead: 10.5, fit: true });
rule(540, edge, .7);
place('Truth that refuses to destroy. Grace that refuses to excuse.', ML, 550,
  { size: 11.2, font: 'quoteBold', color: accent, width: CW, align: 'center', lead: 15, maxY: 568, fit: true });
right('CHRISCO Central Youth Nairobi', 572, { size: 7.6, font: 'caps', color: ink, fade: .55, space: 1.3, lead: 10.5, fit: true });

/* -------------------------------------- finish -------------------------------- */
doc.end();
doc.on('end', () => {
  console.log(`\nwritten: ${path.basename(OUT)}`);
  console.log(`pages:   ${page}   size: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
  console.log(`palette: charcoal, warm paper, muted gold (three base colours)`);
  console.log(`type:    ${[...new Set(Object.values(FONT_ROLES))].join(', ')}`);
  console.log(`shapes (every silhouette is at least ${DPI} dpi):`);
  USED.forEach(u => console.log(`   ${u.name.padEnd(10)} ${u.tone.padEnd(5)} ${String(u.w).padStart(3)} x ${String(u.h).padStart(3)} pt   ${u.dpi} dpi`));
  if (warn.length) { console.log('\nLAYOUT WARNINGS:'); warn.forEach(w => console.log('  ! ' + w)); }
  else console.log('layout:  every block fits, no dashes in the copy');
});
