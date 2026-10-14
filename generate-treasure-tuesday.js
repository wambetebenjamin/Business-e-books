/*
 * CHRISCO Central Youth Nairobi. TREASURE TUESDAY SERIES
 * "Cancel Culture vs Grace Culture. Creating a balance between them"
 * by Minister Naomi Njoki
 *
 * An A5 booklet (419.25 x 595.5 pt) that keeps the geometry of the supplied
 * template `topic book.pdf`: the same frame insets, colour bands, 45 degree
 * corner pennants, two column and six cell grids, tick lists and back cover.
 *
 * Typography is Playfair Display, Lora, Cormorant Garamond and Marcellus SC
 * (SIL Open Font License). Photography is Pexels licensed, and every panel is
 * sized from its own pixel count, so nothing in this book is enlarged.
 *
 * Build:  node generate-treasure-tuesday.js
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
const DPI = 190;                         // floor for effective photo resolution

/* ================================ colour palette =============================== */
const white = '#FFFFFF';
const ink = '#2E1140', body = '#5A5169', faint = '#A79FB4';
const magenta = '#D3136B', coral = '#FF5A36', orange = '#F08A0F', gold = '#F5B723';
const teal = '#00A193', sky = '#2E9BD6', royal = '#2946C4', violet = '#7126BE';
const plum = '#3A0F6B', lime = '#79C46B', rose = '#F0508E';
const RAINBOW = [magenta, teal, orange, violet, rose, royal];
const softPink = '#FCEAF3', softTeal = '#E4F5F3', softGold = '#FFF3D8', softLilac = '#F1ECFA';

/* line height factor per face, from each font's hhea (ascender - descender) / upem */
const LH = {
  serif: 1.280, bold: 1.280, italic: 1.280, boldIt: 1.280,
  display: 1.333, displayMed: 1.333, displayIt: 1.333,
  quote: 1.211, quoteBold: 1.211, caps: 1.254,
};
const lh = f => LH[f] != null ? LH[f] : 1.28;

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
const F = n => A('fonts/' + n);
doc.registerFont('serif',      F('lora-400.ttf'));
doc.registerFont('bold',       F('lora-600.ttf'));
doc.registerFont('italic',     F('lora-it400.ttf'));
doc.registerFont('boldIt',     F('lora-it500.ttf'));
doc.registerFont('display',    F('playfair-700.ttf'));
doc.registerFont('displayMed', F('playfair-500.ttf'));
doc.registerFont('displayIt',  F('playfair-it500.ttf'));
doc.registerFont('quote',      F('cormorant-it500.ttf'));
doc.registerFont('quoteBold',  F('cormorant-500.ttf'));
doc.registerFont('caps',       F('marcellussc.ttf'));

let page = 0, warn = [];
const newpage = () => { page++; if (page > 1) doc.addPage({ size: [W, H], margin: 0 }); };

/* ---------------------------------- primitives -------------------------------- */
/* colour is '#hex' or [from,to] for a diagonal gradient, or a gradient object */
const grad = (x0, y0, x1, y1, c0, c1) => {
  if (Array.isArray(c0)) { c1 = c0[1]; c0 = c0[0]; }
  return doc.linearGradient(x0, y0, x1, y1).stop(0, c0).stop(1, c1);
};
const paint = (x, y, w, h, c) => Array.isArray(c) ? grad(x, y, x + w, y + h, c[0], c[1]) : c;
const fillRect = (x, y, w, h, c) => doc.rect(x, y, w, h).fill(paint(x, y, w, h, c));
const band = (y, h, c) => fillRect(FX, y, FW, h, c);
const rule = (y, c = '#E7DFEF', wd = .7, x0 = ML, x1 = MR) =>
  doc.moveTo(x0, y).lineTo(x1, y).lineWidth(wd).strokeColor(c).stroke();
const hairline = (y, c) => doc.rect(FX, y, FW, 2).fill(c);
const veil = (x, y, w, h, a, c = white, r = 0) => {
  doc.save(); doc.opacity(a);
  r ? doc.roundedRect(x, y, w, h, r).fill(c) : doc.rect(x, y, w, h).fill(c);
  doc.restore();
};

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

/* --------------------------------- photography -------------------------------- */
/** pixel sizes of the prepared photos, so a panel never exceeds its own pixels */
const MAN = JSON.parse(fs.readFileSync(A('img/manifest.json'), 'utf8'));

const USED = [];
/** size in pt for `name` inside a box, capped so it stays at least DPI dpi */
function boxFor(name, maxW, maxH) {
  const m = MAN[name] || { w: 500, h: 333 }, ar = m.w / m.h;
  let w = Math.min(maxW, m.w / DPI * 72), h = w / ar;
  if (h > maxH) { h = maxH; w = h * ar; }
  return { w, h, dpi: m.w / (w / 72) };
}
/** photo in a white keyline and a hairline frame, placed in a box */
function panel(name, x, y, maxW, maxH, o = {}) {
  const b = boxFor(name, maxW, maxH);
  const px = o.align === 'right' ? x + maxW - b.w : o.align === 'left' ? x : x + (maxW - b.w) / 2;
  const py = o.valign === 'top' ? y : y + (maxH - b.h) / 2;
  const k = o.keyline != null ? o.keyline : 4.5;
  if (k > 0) {
    doc.rect(px - k, py - k, b.w + k * 2, b.h + k * 2).fill(o.keyFill || white);
    if (o.frame !== false)
      doc.rect(px - k, py - k, b.w + k * 2, b.h + k * 2).lineWidth(.7).strokeColor(o.frameColor || gold).stroke();
  }
  doc.image(A('img/' + name), px, py, { width: b.w, height: b.h });
  USED.push({ name, w: +b.w.toFixed(0), h: +b.h.toFixed(0), dpi: Math.round(b.dpi) });
  return { x: px, y: py, w: b.w, h: b.h, bottom: py + b.h, dpi: Math.round(b.dpi) };
}
/** full width photographic strip, height taken from the file's aspect ratio */
function strip(name, y, o = {}) {
  const m = MAN[name] || { w: 1000, h: 600 }, ar = m.w / m.h, h = FW / ar;
  doc.image(A('img/' + name), FX, y, { width: FW, height: h });
  if (o.edge) doc.rect(FX, y + h, FW, 2.2).fill(o.edge);
  USED.push({ name, w: Math.round(FW), h: Math.round(h), dpi: Math.round(m.w / (FW / 72)) });
  return { h, bottom: y + h, dpi: Math.round(m.w / (FW / 72)) };
}

/* ------------------------- text: measured, auto fitting ------------------------ */
/** draw `str` at (x,y) inside `width`, shrinking the type until it clears `maxY` */
function place(str, x, y, o = {}) {
  const { width = CW, size = 9.6, min, font = 'serif', color = body,
          align = 'left', space = 0, maxY = 588, name = '' } = o;
  let text = String(str);
  if (DASH.test(text)) warn.push(`dash in copy: ${name || text.slice(0, 24)}`);
  text = text.replace(DASH_ALL, ' ');
  const L = lh(font);
  const lead = o.lead != null ? o.lead : size * L + Math.max(2.6, size * .40);
  const ratio = lead / size, floor = min != null ? min : size * .78;
  const h = sz => { doc.font(font).fontSize(sz);
    return doc.heightOfString(text, { width, characterSpacing: space, lineGap: sz * ratio - sz * L }); };
  let s = size;
  while (y + h(s) > maxY + .6 && s > floor) s = Math.round((s - .2) * 10) / 10;
  if (y + h(s) > maxY + .6) warn.push(`overflow: ${name || text.slice(0, 28)} (needs ${(y + h(s)).toFixed(0)}, limit ${maxY})`);
  doc.font(font).fontSize(s).fillColor(color)
     .text(text, x, y, { width, align, characterSpacing: space, lineGap: s * ratio - s * L });
  return doc.y;
}
/** height a string would occupy at a given size and lead */
function hOf(str, size, width, lead, font = 'serif', space = 0) {
  doc.font(font).fontSize(size);
  return doc.heightOfString(String(str).replace(DASH_ALL, ' '),
    { width, characterSpacing: space, lineGap: lead - size * lh(font) });
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
/** the template sets type over photography twice: black at the same origin, then
 *  the real colour on top, which reads as a hard ink outline */
function shadow(str, x, y, o = {}) {
  if (o.ink !== false) place(str, x, y, { ...o, color: '#000000' });
  return place(str, x, y, o);
}

/* ---------------------------------- small marks --------------------------------- */
function disc(cx, cy, r, c, glyph) {
  doc.circle(cx, cy, r).fill(paint(cx - r, cy - r, r * 2, r * 2, c));
  if (glyph) icon(glyph, cx, cy, white, r / 10.8);
}
function letterDisc(cx, cy, r, ch, c) {
  doc.circle(cx, cy, r).fill(paint(cx - r, cy - r, r * 2, r * 2, c));
  doc.font('caps').fontSize(r * 1.12).fillColor(white)
     .text(ch, cx - r, cy - r * .78, { width: r * 2, align: 'center' });
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
  doc.font('displayMed').fontSize(r * 1.2).fillColor(white)
     .text(String(n), x, y + r * .30, { width: r * 2, align: 'center' });
}
const kicker = (str, x, y, c, o = {}) =>
  place(str, x, y, { size: 8.8, font: 'caps', color: c, space: 2.6, lead: 11.5, ...o });

/* ------------------------------------ icons ----------------------------------- */
function icon(kind, cx, cy, c = white, s = 1) {
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
    case 'book':
      doc.moveTo(cx - 8.2 * s, cy - 6.4 * s).bezierCurveTo(cx - 4 * s, cy - 8.8 * s, cx - .8 * s, cy - 8 * s, cx, cy - 5.4 * s)
         .bezierCurveTo(cx + .8 * s, cy - 8 * s, cx + 4 * s, cy - 8.8 * s, cx + 8.2 * s, cy - 6.4 * s)
         .lineTo(cx + 8.2 * s, cy + 6.6 * s).bezierCurveTo(cx + 4 * s, cy + 4.2 * s, cx + .8 * s, cy + 4.6 * s, cx, cy + 7 * s)
         .bezierCurveTo(cx - .8 * s, cy + 4.6 * s, cx - 4 * s, cy + 4.2 * s, cx - 8.2 * s, cy + 6.6 * s).closePath().stroke();
      line([[0, -5.4], [0, 7]]); break;
    case 'eye':
      doc.moveTo(cx - 8.6 * s, cy).bezierCurveTo(cx - 4.4 * s, cy - 6.6 * s, cx + 4.4 * s, cy - 6.6 * s, cx + 8.6 * s, cy)
         .bezierCurveTo(cx + 4.4 * s, cy + 6.6 * s, cx - 4.4 * s, cy + 6.6 * s, cx - 8.6 * s, cy).stroke();
      doc.circle(cx, cy, 2.3 * s).fill(c); break;
    case 'bubble':
      doc.roundedRect(cx - 8 * s, cy - 7.2 * s, 16 * s, 11 * s, 3 * s).stroke();
      line([[-2.6, 3.8], [-1.2, 7.4], [1.4, 3.8]]); break;
    case 'sun':
      doc.circle(cx, cy, 4.2 * s).stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4;
        line([[Math.cos(a) * 6.3, Math.sin(a) * 6.3], [Math.cos(a) * 8.9, Math.sin(a) * 8.9]]); } break;
    case 'clock': doc.circle(cx, cy, 7.5 * s).stroke(); line([[0, -4.4], [0, .5], [3.6, 2.6]]); break;
    case 'people':
      ring(-3.4, -4.4, 2.9); ring(3.7, -3.5, 2.4);
      doc.moveTo(cx - 8.6 * s, cy + 7.6 * s).bezierCurveTo(cx - 8.2 * s, cy + .4 * s, cx + .4 * s, cy, cx + .4 * s, cy + 7.6 * s).stroke();
      doc.moveTo(cx + 2.4 * s, cy + 7.4 * s).bezierCurveTo(cx + 2.6 * s, cy + 2.2 * s, cx + 8.6 * s, cy + 2.4 * s, cx + 8.8 * s, cy + 7.4 * s).stroke(); break;
    case 'cross': line([[0, -8.6], [0, 8.6]]); line([[-5.8, -3.2], [5.8, -3.2]]); break;
    case 'sprout':
      line([[0, 8.6], [0, -1.2]]);
      doc.moveTo(cx, cy - 1.2 * s).bezierCurveTo(cx - 1 * s, cy - 7.4 * s, cx - 6.4 * s, cy - 8.2 * s, cx - 7.6 * s, cy - 7.6 * s)
         .bezierCurveTo(cx - 6.6 * s, cy - 1.6 * s, cx - 2.4 * s, cy - .6 * s, cx, cy - 1.2 * s).stroke();
      doc.moveTo(cx, cy + 1.2 * s).bezierCurveTo(cx + 1 * s, cy - 4.4 * s, cx + 5.8 * s, cy - 5.4 * s, cx + 7.6 * s, cy - 5 * s)
         .bezierCurveTo(cx + 6.4 * s, cy + 1 * s, cx + 2.2 * s, cy + 2 * s, cx, cy + 1.2 * s).stroke(); break;
    case 'flame':
      doc.moveTo(cx, cy - 8.8 * s).bezierCurveTo(cx + 7.6 * s, cy - 2.6 * s, cx + 6.4 * s, cy + 6.4 * s, cx, cy + 8.6 * s)
         .bezierCurveTo(cx - 6.4 * s, cy + 6.4 * s, cx - 7.6 * s, cy - 2.6 * s, cx, cy - 8.8 * s).stroke();
      line([[-2.4, 5.4], [0, 1.4], [2.4, 5.4]]); break;
    case 'anchor':
      ring(0, -6.2, 2.5); line([[0, -3.7], [0, 8.2]]); line([[-4.4, -1.2], [4.4, -1.2]]);
      doc.moveTo(cx - 7.6 * s, cy + 2 * s).bezierCurveTo(cx - 7 * s, cy + 8.6 * s, cx + 7 * s, cy + 8.6 * s, cx + 7.6 * s, cy + 2 * s).stroke(); break;
    case 'quote':
      [-3.7, 3.7].forEach(ox => doc.moveTo(cx + (ox - 2.4) * s, cy - 1.2 * s)
        .bezierCurveTo(cx + (ox - 3.2) * s, cy - 6.6 * s, cx + (ox + 2.8) * s, cy - 7.6 * s, cx + (ox + 1.5) * s, cy - .4 * s)
        .bezierCurveTo(cx + (ox + .6) * s, cy + 4.6 * s, cx + (ox - 2.4) * s, cy + 3.4 * s, cx + (ox - 2.4) * s, cy - 1.2 * s).stroke()); break;
  }
  doc.restore();
}

/* ============================================================================= */
/*  PAGE 1 — front cover                                                        */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, H, grad(0, 0, W, H, [plum, '#8A1150']));
pennant(324, 166, 1, PENN_W, PENN_H, gold, coral);
fillRect(0, 452, 86, H - 452, [teal, royal]);

kicker('TREASURE TUESDAY SERIES', ML, 52, gold);
place('CHRISCO', ML, 90, { size: 22, font: 'caps', color: white, space: 4.6, lead: 26 });
place('Central Youth, Nairobi', ML, 119, { size: 10.6, font: 'italic', color: '#FFD3E7', space: 1.4, lead: 13.6 });

const coverPhoto = panel('cover.jpg', ML, 172, CW, 246, { frameColor: gold });

place('Cancel Culture\nvs Grace Culture', ML, coverPhoto.bottom + 15,
  { size: 33, font: 'display', color: white, width: CW, align: 'right', lead: 38, maxY: 526, name: 'cover title' });
place('Creating a balance between them', ML, 528,
  { size: 14, font: 'displayIt', color: gold, width: CW, align: 'right', lead: 18, maxY: 548, name: 'cover sub' });
rule(556, '#A03568', .8, ML, MR);
right('By Minister Naomi Njoki, CHRISCO Central Youth Nairobi', 566,
  { size: 8.2, font: 'caps', color: '#F3CFE2', space: 1.6, lead: 11 });

/* ============================================================================= */
/*  PAGE 2 — the opening: band, photograph, two columns, pull quote              */
/* ============================================================================= */
newpage();
band(0, 192, [magenta, orange]);
hairline(192, gold);
place('The Question\nWe Cannot Dodge', ML, 30, { size: 29, font: 'display', color: white, lead: 34,
  width: 190, maxY: 104 });
place('Culture is the shared beliefs, values and customs of a group, and the way a group treats someone who has fallen tells you more than any statement of faith.',
  255.7, 30, { size: 9.4, font: 'italic', color: '#FFEFF6', width: 108, lead: 13.2, maxY: 132, name: 'p2 side note' });
place('How do we hold one another accountable for wrong doing without denying the possibility of redemption? That is the question this series keeps returning to.',
  ML, 144, { size: 9.6, color: '#FFF1F8', width: CW, lead: 13.6, maxY: 186, name: 'p2 lead' });

const p2Photo = panel('community.jpg', ML, 212, CW, 120, { keyline: 5 });

const p2h1 = place('Cancel Culture', ML, p2Photo.bottom + 24, { size: 15.5, font: 'display', color: magenta, width: HALF, lead: 19 });
place('A collective withdrawing of support from someone because of what they said or what they did. At institutional level it can serve public accountability. Left unchecked it becomes a crowd that enjoys the fall.',
  ML, p2h1 + 8, { size: 9.6, width: HALF, lead: 13.6, maxY: 480, name: 'p2 left' });
doc.moveTo(C2n - 12, p2Photo.bottom + 22).lineTo(C2n - 12, 480).lineWidth(.6).strokeColor('#E4DCEC').stroke();
const p2h2 = place('Grace Culture', C2, p2Photo.bottom + 24, { size: 15.5, font: 'display', color: teal, width: HALF, lead: 19 });
place('The free, unmerited favour of God. Grace does not excuse sin and does not cancel consequence. It opens the way back for whoever will walk it, and it keeps that way open longer than our patience does.',
  C2, p2h2 + 8, { size: 9.6, width: HALF, lead: 13.6, maxY: 480, name: 'p2 right' });

rule(498, gold, 1.1);
place('Truth about the sin. Mercy for the sinner.', ML, 508,
  { size: 16, font: 'quoteBold', color: ink, width: CW, align: 'center', lead: 20, maxY: 532 });
place('Scripture never lets us keep one and forget the other. It exposes the works of darkness and still refuses to make a spectacle of the person standing in it.',
  ML, 532, { size: 9.6, font: 'italic', color: body, width: 260, lead: 13.6, maxY: 574, name: 'p2 pull' });

/* ============================================================================= */
/*  PAGES 3 and 5 — six cell grids (template's services and framework pages)     */
/* ============================================================================= */
function gridPage(head, deck, items, top, accent, sub) {
  newpage();
  band(-16.5, 126, top);
  hairline(109.5, accent);
  const DX = C2 + 30, DW = MR - DX;
  let hs = 29;
  for (const cand of [29, 27.4, 26, 24.6, 23.2]) {
    doc.font('display').fontSize(cand);
    if (Math.max(...head.split('\n').map(l => doc.widthOfString(l))) + ML + 10 <= DX) { hs = cand; break; }
  }
  const he = place(head, ML, 26, { size: hs, font: 'display', color: white, lead: hs * 1.20, maxY: 100 });
  if (deck) place(deck, DX, 34, { size: 9.2, font: 'italic', color: '#F3E9F7', width: DW, lead: 12.6,
    maxY: 102, name: head.replace(/\n/g, ' ') + ' deck' });
  const rows = [133.5, 279.5, 425.5];
  items.forEach((it, i) => {
    const x = i % 2 ? C2 : ML, y = rows[Math.floor(i / 2)], c = sub[i % sub.length];
    if (it.l) letterDisc(x + 22.4, y + 22.4, 22.4, it.l, c);
    else disc(x + 22.4, y + 22.4, 22.4, c, it.g);
    const hEnd = place(it.h, x, y + 52, { size: 12.4, font: 'display', color: c, width: 150, lead: 16.4,
      maxY: y + 86, name: 'heading ' + i });
    const limit = rows[Math.floor(i / 2) + 1] ? rows[Math.floor(i / 2) + 1] - 5 : 578;
    place(it.b, x, Math.max(y + 82, hEnd + 6), { size: 9.5, min: 8.4, width: 152, lead: 13.4,
      maxY: limit, name: 'body ' + it.h.replace(/\n/g, ' ') });
  });
}
gridPage('Six Things\nWe Must Hold', 'Distinctions the church loses at its own cost.', [
  { g: 'key', h: 'Forgiveness Is\nNot Trust', b: 'You can forgive someone who betrayed you without handing them access to your life again. Trust is rebuilt over time.' },
  { g: 'scales', h: 'Grace Is Not the\nAbsence of Consequence', b: 'The one who steals may be forgiven and still return what was taken. A repentant leader may still face discipline.' },
  { g: 'loop', h: 'Restoration Is Not\nReinstatement', b: 'Being received back is not the same as being handed the old position, the old platform or the keys that afternoon.' },
  { g: 'heart', h: 'Mercy Must Not\nErase the Victim', b: 'Care for the person who was hurt belongs in the same sentence as mercy for the one who hurt them.' },
  { g: 'shield', h: 'Safety, Justice and\nBoundaries Matter', b: 'Boundaries are not a failure of love. Protection and honest process are how love behaves in public.' },
  { g: 'venn', h: 'Discipline and Mercy\nMust Coexist', b: 'Forgiveness and justice are compatible. The cross is the proof. The line between accountability and bullying is thin.' },
], [violet, royal], gold, RAINBOW);

/* ============================================================================= */
/*  PAGE 4 — what the scriptures say: a tick list with a closing card            */
/* ============================================================================= */
function checkPage(head, intro, rows, bandH, edge, card) {
  newpage();
  band(0, bandH, edge);
  hairline(bandH, gold);
  const he = place(head, ML, 26, { size: 29, font: 'display', color: white, lead: 34, maxY: bandH - 46 });
  if (intro) place(intro, ML, he + 10, { size: 9.7, font: 'italic', color: '#F1E7F7',
    width: CW, lead: 13.6, maxY: bandH - 8, name: 'intro' });
  const L = solveRows(rows, bandH + 28, card ? 496 : 578);
  rows.forEach((r, i) => {
    const y = L.tops[i], c = RAINBOW[i % RAINBOW.length];
    checkBadge(ML, y, c);
    const hy = place(r[0], ML + 40, y - 1, { size: 11.4, font: 'bold', color: c, width: 268,
      lead: L.headLead, maxY: L.tops[i + 1] ? L.tops[i + 1] - 4 : 590 });
    place(r[1], ML + 40, hy + 3.4, { size: L.size, width: 268, lead: L.bodyLead,
      maxY: L.tops[i + 1] ? L.tops[i + 1] - 6 : 590 });
  });
  if (card) {
    doc.roundedRect(ML, 508, CW, 72, 7).fill(softLilac);
    place(card[0], ML + 18, 518, { size: 12.4, font: 'display', color: ink, width: CW - 36, lead: 16, maxY: 536 });
    place(card[1], ML + 18, 538, { size: 9.4, font: 'italic', color: body, width: CW - 36, lead: 13.2, maxY: 572 });
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
  ], 126, [plum, magenta],
  ['Two commands, one church', 'The God who says remove that person also says forgive and comfort him. Read them together, or you will keep a discipline that cannot restore and a mercy that cannot correct.']);

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
], [orange, magenta], teal, [magenta, orange, teal, violet, rose, royal]);

/* ============================================================================= */
/*  PAGE 6 — balance in practice: photographic strip, then a tick list            */
/* ============================================================================= */
newpage();
const p6 = strip('balance.jpg', 0, { edge: teal });
shadow('Balance\nin Practice', ML, p6.bottom - 80,
  { size: 30, font: 'display', color: white, lead: 35, width: 220, maxY: p6.bottom - 8 });
place('We must learn the difference between public shaming and public accountability. These are the checks we keep applying to ourselves.',
  ML, p6.bottom + 14, { size: 9.7, font: 'italic', color: body, width: CW, lead: 13.4,
  maxY: p6.bottom + 50, name: 'p6 intro' });
{
  const rows = [
    ['Private First, Public Last', 'Confrontation follows Matthew 18: one person, then two or three, then the church. Skipping to the crowd is not courage.'],
    ['Exposing Is Not a Licence for Rumour', 'Calling wrongdoing into the light never authorises gossip, screenshots shared for sport, or half a story told loudly.'],
    ['Do Not Be Selective', 'Do not be picky about what you count as moral. The standard that convicts your rival must also convict you.'],
    ['The Goal Is Restoration', 'Not the satisfaction of watching someone fall. If you are quietly hoping for the fall, check your own heart first.'],
    ['Do Not Repay Evil for Evil', 'Romans 12:17. The cycle stops with us. Refuse to answer a wrong with a bigger wrong and call that justice.'],
    ['Truth and Grace Together', 'We serve a God who calls sin what it is, who confronts wrongdoing, and who still offers mercy to those who repent.'],
  ];
  const L = solveRows(rows, p6.bottom + 58, 580);
  rows.forEach((r, i) => {
    const y = L.tops[i], c = RAINBOW[i % RAINBOW.length];
    checkBadge(ML, y, c);
    const hy = place(r[0], ML + 40, y - 1, { size: 11.4, font: 'bold', color: c, width: 268, lead: L.headLead,
      maxY: L.tops[i + 1] ? L.tops[i + 1] - 4 : 590 });
    place(r[1], ML + 40, hy + 3.4, { size: L.size, width: 268, lead: L.bodyLead,
      maxY: L.tops[i + 1] ? L.tops[i + 1] - 6 : 590 });
  });
}

/* ============================================================================= */
/*  PAGE 7 — divider: the heart of the matter                                     */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, H, grad(0, 0, W, H, [royal, violet]));
pennant(378, 104, 1, PENN_W, PENN_H, gold, coral);
const p7Photo = panel('choir.jpg', FX + 20, 42, 156, 238, { align: 'left', valign: 'top', keyline: 5 });
const p7x = p7Photo.x + p7Photo.w + 20, p7w = MR - p7x;
kicker('THE HEART OF THE MATTER', p7x, 42, gold);
place('What would\nJesus do?', p7x, 70, { size: 28, font: 'display', color: white, lead: 33, width: p7w, maxY: 160 });
place('He ate with the people the crowd had already written off, and He told them to go and sin no more. He did not pretend the sin was small and He did not make an example of the sinner.',
  p7x, 172, { size: 11.4, font: 'quote', color: '#DDE9FF', width: p7w, lead: 15.6, maxY: 276, name: 'p7 quote' });

rule(300, '#8E7CD8', .8);
place('We are more than\nour worst moment', ML, 314,
  { size: 26, font: 'display', color: white, lead: 31, width: 250, maxY: 384 });
place('The same grace we celebrate when God extends it to us must shape how we treat one another. That is the balance this series argues for: honest about the sin, open to the sinner, slow to join the crowd.',
  ML, 390, { size: 9.7, color: '#E3DDF6', width: CW, lead: 14, maxY: 448, name: 'p7 body' });
doc.roundedRect(ML, 462, CW, 92, 8).fill('#2C0B52');
doc.roundedRect(ML, 462, CW, 92, 8).lineWidth(.8).strokeColor(gold).stroke();
place('For the youth church, and for anyone who has been counted out', ML + 18, 476,
  { size: 12.6, font: 'displayIt', color: gold, width: CW - 36, lead: 16, maxY: 500 });
place('Bring the whole story on Tuesday. Nothing you have done disqualifies you from this teaching, and nothing done to you excuses it.',
  ML + 18, 502, { size: 9.5, color: '#EDE7FA', width: CW - 36, lead: 13.6, maxY: 546, name: 'p7 card' });

/* ============================================================================= */
/*  PAGE 8 — set your mind on things above                                        */
/* ============================================================================= */
newpage();
band(0, 170, [royal, violet]);
hairline(170, teal);
pennant(318, 170, 1, PENN_W, PENN_H, lime, teal);
place('Set Your Mind\non Things Above', ML, 28, { size: 28, font: 'display', color: white, lead: 33,
  width: 196, maxY: 106 });
place('Set your minds on things above, not on earthly things. For you have died, and your life is hidden with Christ in God.',
  255.7, 28, { size: 11, font: 'quote', color: '#DDEBFF', width: 108, lead: 14.6, maxY: 122, name: 'p8 verse' });
place('Colossians 3:2 to 3', ML, 130, { size: 8.6, font: 'caps', color: '#A8C9EE', space: 1.8, lead: 11 });
place('To set your mind on things above is to stop letting a fluctuating, noisy and contradictory world dictate how you feel about yourself.',
  ML, 146, { size: 9.5, font: 'italic', color: '#E7EAFF', width: CW, lead: 13.4, maxY: 166, name: 'p8 strap' });

const p8Photo = panel('nairobi.jpg', ML, 188, CW, 98, { keyline: 5 });
const p8h1 = place('Hidden, not\nfrom others', ML, p8Photo.bottom + 26, { size: 15.5, font: 'display', color: teal, width: HALF, lead: 19 });
place('When your identity is rooted in who Jesus is and what He has done, rather than in what you dig up inside yourself, you live life to its truest.',
  ML, p8h1 + 8, { size: 9.6, width: HALF, lead: 13.6, maxY: 408, name: 'p8 left' });
doc.moveTo(C2n - 12, p8Photo.bottom + 24).lineTo(C2n - 12, 412).lineWidth(.6).strokeColor('#E4DCEC').stroke();
const p8h2 = place('Protected\nby Christ', C2, p8Photo.bottom + 26, { size: 15.5, font: 'display', color: violet, width: HALF, lead: 19 });
place('When you hide your identity in Christ it is not hidden from other people; it is protected by Christ. No verdict and no committee of one writes the final sentence about you.',
  C2, p8h2 + 8, { size: 9.6, width: HALF, lead: 13.6, maxY: 412, name: 'p8 right' });

doc.roundedRect(ML, 420, CW, 84, 7).fill(softLilac);
place('Two places to live', ML + 18, 430, { size: 12.4, font: 'display', color: ink, width: CW - 36, lead: 16, maxY: 450 });
place('In the verdict of the crowd, or in the verdict of God. The crowd changes its mind by Thursday. The Father has already said what He says about you, and He does not revisit it for applause.',
  ML + 18, 452, { size: 9.5, color: body, width: CW - 36, lead: 13.6, maxY: 498, name: 'p8 card' });
rule(516, gold, 1.1);
place('You are not cancelled by your worst chapter.', ML, 528,
  { size: 15, font: 'quoteBold', color: magenta, width: CW, align: 'center', lead: 19, maxY: 552 });
place('Confession is how the chapter ends. Restoration is what follows it.', ML, 554,
  { size: 9.4, font: 'italic', color: body, width: CW, align: 'center', lead: 13, maxY: 578 });

/* ============================================================================= */
/*  PAGE 9 — over to you: reflection, assignment, memory, prayer                 */
/* ============================================================================= */
newpage();
band(0, 109.5, [plum, violet]);
hairline(109.5, gold);
place('Over to You', ML, 28, { size: 29, font: 'display', color: white, lead: 34, maxY: 66 });
place('A few things to carry into the week.', ML, 74, { size: 10.4, font: 'italic', color: '#E7DAF6', maxY: 100 });

place('Reflect', ML, 128, { size: 15.5, font: 'display', color: magenta, lead: 19 });
[
  'If the Bible calls us to confront sin, at what point does confrontation become condemnation?',
  'When someone falls, what do I feel first: grief for them, or the small pleasure of being proved right?',
  'Who have I already written off that God is still pursuing, and what would it cost me to believe He can still reach them?',
].forEach((q, i) => {
  const y = 154 + i * 40;
  numberBadge(ML, y - 3, 10.5, i + 1, RAINBOW[i]);
  place(q, ML + 30, y, { size: 9.7, width: CW - 30, lead: 13.6, maxY: y + 32, name: 'reflect ' + (i + 1) });
});

doc.roundedRect(ML, 280, CW, 72, 7).fill(softGold);
place('Assignment for next Tuesday', ML + 18, 290, { size: 12.4, font: 'display', color: orange, width: CW - 36, lead: 16, maxY: 310 });
place('Answer all three in writing, in one page. Then do one of these before you meet again: send the message you should have sent, return what you took, or sit with the person nobody else is speaking to.',
  ML + 18, 310, { size: 9.4, color: body, width: CW - 36, lead: 13.2, maxY: 346, name: 'assignment' });

doc.roundedRect(ML, 366, CW, 26, 5).fill(teal);
place('This we believe, and this we will keep saying', ML, 373,
  { size: 11, font: 'caps', color: white, space: 1.4, width: CW, align: 'center', lead: 14, maxY: 388 });

doc.roundedRect(ML, 402, HALF, 100, 7).fill(softTeal);
place('Memorise', ML, 414, { size: 9.4, font: 'caps', color: teal, space: 1.8, width: HALF, align: 'center', lead: 12 });
place('The goal is restoration, not the satisfaction of watching another person fall.',
  ML + 14, 434, { size: 10, font: 'italic', color: ink, width: HALF - 28, lead: 14, maxY: 494, name: 'memorise' });
doc.roundedRect(C2n, 402, HALF, 100, 7).fill(grad(C2n, 402, C2n + HALF, 502, [violet, royal]));
place('Grace is not the absence of consequence, and consequence is not the absence of grace.',
  C2n + 14, 420, { size: 11, font: 'quoteBold', color: white, width: HALF - 28, lead: 15, maxY: 494, name: 'believe' });

doc.roundedRect(ML, 516, CW, 64, 7).fill(grad(ML, 516, MR, 580, [plum, magenta]));
place('Pray for both of them', ML + 18, 524, { size: 12, font: 'display', color: gold, width: CW - 36, lead: 15, maxY: 542 });
place('Pray for the one who did the wrong, that God would really change them. Pray for the one who was hurt, that God would really heal them.',
  ML + 18, 542, { size: 9.3, color: '#F6E6F0', width: CW - 36, lead: 13, maxY: 574, name: 'pray' });

/* ============================================================================= */
/*  PAGE 10 — back cover                                                          */
/* ============================================================================= */
newpage();
fillRect(FX, 0, FW, 428, grad(FX, 0, FX + FW, 428, [plum, violet]));
pennant(296, 148, 1, 252, 168, '#9B4DDE', violet);
place('You Are\nWelcome Here', ML, 34, { size: 29, font: 'display', color: white, lead: 34,
  width: 200, maxY: 110 });
place('Treasure Tuesdays', ML, 124, { size: 11.6, font: 'display', color: gold, lead: 15, width: 200 });
place('Every Tuesday, youth fellowship at CHRISCO Central, Nairobi. All are welcome, and the doors open fifteen minutes before we start.',
  ML, 144, { size: 9.7, color: '#EBDEF9', width: 196, lead: 13.6, maxY: 208, name: 'p10 details' });
panel('worship.jpg', ML, 226, 128, 186, { align: 'left', valign: 'top', keyline: 5 });
doc.roundedRect(215, 226, MR - 215, 186, 8).fill(grad(215, 226, MR, 412, [magenta, orange]));
const p10t = place('The balance this book argues for', 231, 240, { size: 12, font: 'display', color: white,
  width: MR - 247, lead: 15.4, maxY: 268 });
place('Honest about the sin and open to the sinner. Slow to join the crowd, quick to restore, serious about wrong doing and more serious about the person who made the mistake.',
  231, p10t + 7, { size: 9.2, color: '#FFF0F6', width: MR - 247, lead: 13, maxY: 400, name: 'p10 plate' });

place('Written and taught by', ML, 442, { size: 9.4, color: body, lead: 13 });
place('Minister Naomi Njoki', ML, 456, { size: 14, font: 'display', color: ink, lead: 18, maxY: 478 });
place('Treasure Tuesday Series, 2026\nCancel Culture vs Grace Culture\nCreating a balance between them',
  ML, 484, { size: 9.4, color: body, width: 190, lead: 13.4, maxY: 530, name: 'p10 series' });
doc.roundedRect(293.6, 442, 70, 70, 7).fill(grad(293.6, 442, 363.6, 512, [magenta, orange]));
place('Grace\nand\nTruth', 293.6, 456, { size: 11.4, font: 'caps', color: white, space: 1.2, width: 70, align: 'center', lead: 13.6 });
place('John 1:17', 293.6, 518, { size: 8, font: 'caps', color: faint, space: 1.4, width: 70, align: 'center', lead: 10.5 });
rule(540, '#E7DFEF', .7);
place('Truth that refuses to destroy. Grace that refuses to excuse.', ML, 550,
  { size: 11.4, font: 'quoteBold', color: magenta, width: CW, align: 'center', lead: 15, maxY: 568 });
right('CHRISCO Central Youth Nairobi', 572, { size: 7.8, font: 'caps', color: faint, space: 1.4, lead: 10.5 });

/* -------------------------------------- finish -------------------------------- */
doc.end();
doc.on('end', () => {
  console.log(`\nwritten: ${path.basename(OUT)}`);
  console.log(`pages:   ${page}   size: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
  console.log('photos (every panel is at least ' + DPI + ' dpi):');
  USED.forEach(u => console.log(`   ${u.name.padEnd(16)} ${String(u.w).padStart(3)} x ${String(u.h).padStart(3)} pt   ${u.dpi} dpi`));
  const fonts = doc._fontFamilies || null; void fonts;
  if (warn.length) { console.log('\nLAYOUT WARNINGS:'); warn.forEach(w => console.log('  ! ' + w)); }
  else console.log('layout:  every block fits, no dashes in the copy');
});
