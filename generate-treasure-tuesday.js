/*
 * CHRISCO Central Youth Nairobi — TREASURE TUESDAY SERIES
 * "Cancel Culture vs Grace Culture — creating a balance between them"
 * by Minister Naomi Njoki
 *
 * An A5 booklet that reproduces the geometry, type scale, frame insets and
 * iconography of the supplied Canva template (`topic book.pdf`, 419.25 x 595.5 pt,
 * Droid Serif) and re-casts its muted blue palette as a full-colour one.
 *
 * Build:  node generate-treasure-tuesday.js
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Cancel Culture vs Grace Culture - Treasure Tuesday.pdf');
const A = p => path.join(__dirname, 'assets', p);

/* ============================== template geometry ============================== */
const W = 419.25, H = 595.5;     // A5 portrait — the template's page box
const FX = 6.7, FW = 405.85;     // outer frame: blocks inset 6.7pt, width 405.85
const ML = 55.7, MR = 363.6;     // the template's text margins
const CW = MR - ML;              // 307.9pt
const C2 = 228.0;                // right column x (template's second column)
const C2n = 223.6;               // column x used by the two-column pages
const PHOTO_TOP = 175, PHOTO_BOT = 525;   // cover photo frame
const PENN_W = 252, PENN_H = 168;         // decoration: 252x168 rect + 45deg point

/* ================================ full-colour palette ========================== */
const white = '#FFFFFF', paper = '#FFFFFF';
const ink = '#31144A', body = '#5C5470', faint = '#A79FB4';
const magenta = '#D81B6E', coral = '#FF5A36', orange = '#FF8A1E', gold = '#FFC42E';
const teal = '#00A9A0', sky = '#2E9BD6', royal = '#2C4BD7', violet = '#7A2BC4';
const plum = '#3D1170', lime = '#8CC63E', rose = '#F2528E', deep = '#111C44';
const RAINBOW = [magenta, orange, teal, violet, rose, royal];
const softPink = '#FDE9F3', softTeal = '#E6F7F5', softGold = '#FFF6DF', softLilac = '#F3EEFB';

const doc = new PDFDocument({
  size: [W, H], margin: 0,
  info: {
    Title: 'Cancel Culture vs Grace Culture — Creating a Balance Between Them',
    Author: 'Minister Naomi Njoki · CHRISCO Central Youth Nairobi',
    Subject: 'Treasure Tuesday Series — CHRISCO Central Youth Nairobi',
    Keywords: 'cancel culture, grace, accountability, restoration, youth fellowship, Nairobi'
  }
});
doc.pipe(fs.createWriteStream(OUT));
doc.registerFont('serif', A('fonts/droid-serif-regular.ttf'));
doc.registerFont('bold', A('fonts/droid-serif-bold.ttf'));
doc.registerFont('italic', A('fonts/droid-serif-italic.ttf'));
doc.registerFont('bolditalic', A('fonts/droid-serif-bolditalic.ttf'));

const LH = 1.1714;                    // Droid Serif line height factor (hhea 1907/-492)
let page = 0, warn = [];
const newpage = () => { page++; if (page > 1) doc.addPage({ size: [W, H], margin: 0 }); };

/* ---------------------------------- primitives --------------------------------- */
/* colour: '#hex' or [from,to] (diagonal gradient) or a pre-built gradient object */
const grad = (x0, y0, x1, y1, c0, c1) => {
  if (Array.isArray(c0)) { c1 = c0[1]; c0 = c0[0]; }
  return doc.linearGradient(x0, y0, x1, y1).stop(0, c0).stop(1, c1);
};
const paint = (x, y, w, h, c) => Array.isArray(c) ? grad(x, y, x + w, y + h, c[0], c[1]) : c;
const fillRect = (x, y, w, h, c) => doc.rect(x, y, w, h).fill(paint(x, y, w, h, c));
const band = (y, h, c) => fillRect(FX, y, FW, h, c);
const rule = (y, c = '#EAE3F2', wd = .7, x0 = ML, x1 = MR) =>
  doc.moveTo(x0, y).lineTo(x1, y).lineWidth(wd).strokeColor(c).stroke();
const hairline = (y, c) => doc.rect(FX, y, FW, 2).fill(c);
const photo = (f, x, y, w, h) => doc.image(A('img/' + f), x, y, { width: w, height: h });

/* Canva "home-plate" decoration: tip point + 45° chamfers, body runs off the page */
function pennant(tipX, tipY, dir, bodyLen, h, c0, c1) {
  const e = h / 2, x0 = tipX + dir * e, x1 = x0 + dir * bodyLen;
  doc.save();
  doc.moveTo(tipX, tipY).lineTo(x0, tipY - e).lineTo(x1, tipY - e)
     .lineTo(x1, tipY + e).lineTo(x0, tipY + e).closePath().clip();
  /* fill the whole bounding box and let the clip carve the point */
  const gx0 = Math.min(tipX, x0, x1), gx1 = Math.max(tipX, x0, x1);
  doc.rect(gx0, tipY - e, gx1 - gx0, h)
     .fill(grad(gx0, tipY - e, gx1, tipY + e, c0, c1));
  doc.restore();
}

/* -------------------------- text: measured, auto-fitting ---------------------- */
/** Draw `str` at (x,y) inside `width`; shrink the type until it clears `maxY`. */
function place(str, x, y, o = {}) {
  const { width = CW, size = 9.7, min, font = 'serif', color = body,
          align = 'left', space = 0, maxY = 588, name = '' } = o;
  const lead = o.lead != null ? o.lead : size * LH + Math.max(2.4, size * .36);
  const ratio = lead / size, floor = min != null ? min : size * .74;
  const h = sz => { doc.font(font).fontSize(sz);
    return doc.heightOfString(str, { width, characterSpacing: space, lineGap: sz * ratio - sz * LH }); };
  let s = size;
  while (y + h(s) > maxY + .6 && s > floor) s = Math.round((s - .2) * 10) / 10;
  if (y + h(s) > maxY + .6) warn.push(`overflow: ${name || String(str).slice(0, 30)} (needs ${(y + h(s)).toFixed(0)}, limit ${maxY})`);
  doc.font(font).fontSize(s).fillColor(str.__keep || color)
     .text(str, x, y, { width, align, characterSpacing: space, lineGap: s * ratio - s * LH });
  return doc.y;
}
/* right-aligned inside the text margins, like the template's cover title */
const right = (str, y, o) => place(str, ML, y, { width: CW, align: 'right', ...o });

/** height a string will occupy at a given size/lead */
function hOf(str, size, width, lead, font = 'serif', space = 0) {
  doc.font(font).fontSize(size);
  return doc.heightOfString(str, { width, characterSpacing: space, lineGap: lead - size * LH });
}
/** Pick the largest body size (then gap) that keeps N rows inside a band. */
function solveRows(rows, startY, endY, { head = 11.7, width = 268, badge = 28 } = {}) {
  const sizes = [9.4, 9.2, 9.0, 8.8, 8.6, 8.4, 8.2, 8.0], gaps = [15, 13, 11.5, 10, 8.5, 7, 5.5];
  for (const b of sizes) for (const g of gaps) {
    let y = startY; const tops = [];
    for (const r of rows) {
      const hh = hOf(r[0], head, width, head * 1.25, 'bold');
      const bh = hOf(r[1], b, width, b * 1.35);
      tops.push(y); y += Math.max(badge, hh + 3 + bh) + g;
    }
    if (y - g <= endY) return { size: b, gap: g, headLead: head * 1.25, bodyLead: b * 1.35, tops };
  }
  warn.push(`rows do not fit ${startY.toFixed(0)}→${endY}`);
  const step = (endY - startY) / rows.length;
  return { size: 7.8, gap: 5, headLead: 14, bodyLead: 10.4, tops: rows.map((_, i) => startY + i * step) };
}
/* The template builds type over photography by printing it twice: a solid black
 * pass at the same origin, then the real colour on top — a hard ink outline. */
function shadow(str, x, y, o = {}) {
  if (o.ink !== false) place(str, x, y, { ...o, color: '#000000' });
  return place(str, x, y, o);
}

/* -------------------------------- line-art icons ------------------------------- */
function icon(kind, cx, cy, c = white, s = 1) {
  doc.save();
  doc.lineWidth(1.75 * s).strokeColor(c).fillColor(c).lineCap('round').lineJoin('round');
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
      line([[-2.6, 3.8], [-1.2, 7.4], [1.4, 3.8]]);
      doc.moveTo(cx - 5.4 * s, cy + 5.4 * s).lineTo(cx + 5.4 * s, cy - 5.4 * s).stroke(); break;
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
function disc(cx, cy, r, c, glyph) {
  doc.circle(cx, cy, r).fill(paint(cx - r, cy - r, r * 2, r * 2, c));
  if (glyph) icon(glyph, cx, cy, white, r / 10.8);
}
function letterDisc(cx, cy, r, ch, c) {
  doc.circle(cx, cy, r).fill(paint(cx - r, cy - r, r * 2, r * 2, c));
  doc.font('bold').fontSize(r * 1.12).fillColor(white)
     .text(ch, cx - r, cy - r * .79, { width: r * 2, align: 'center' });
}
function checkBadge(x, y, c, size = 28) {
  doc.roundedRect(x, y, size, size, 6).lineWidth(1.9).strokeColor(c).stroke();
  doc.save().lineCap('round').lineJoin('round').lineWidth(2.7).strokeColor(c);
  const k = size / 28;
  doc.moveTo(x + 7.4 * k, y + 14.6 * k).lineTo(x + 12.2 * k, y + 19.4 * k)
     .lineTo(x + 21 * k, y + 9.4 * k).stroke();
  doc.restore();
}
function kicker(str, x, y, c, o = {}) {
  place(str, x, y, { size: 8.4, font: 'bold', color: c, space: 1.7, lead: 11, ...o });
}

/* ============================================================================= */
/*  PAGE 1 — COVER (template page 1: colour field, centred photo, pennants,
 *  brand top-left, title bottom-right of the photo, small print on the band)   */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, H, grad(0, 0, W, H, [plum, '#8E1450']));
photo('cover.jpg', FX, PHOTO_TOP, FW, PHOTO_BOT - PHOTO_TOP);
/* corner ribbons, exactly where the template puts them */
pennant(324, 172, 1, 252, 168, gold, coral);
fillRect(0, 444, 86, H - 444, [teal, royal]);
doc.rect(FX, 525, FW, 1.8).fill(gold);

/* emblem: open book + flame inside a diamond (template's mark sits at 55.7,38.5) */
const ex = 79.9, ey = 60.9;
doc.save();
doc.moveTo(ex, ey - 25).lineTo(ex + 25, ey).lineTo(ex, ey + 25).lineTo(ex - 25, ey).closePath()
   .fill(grad(ex - 25, ey - 25, ex + 25, ey + 25, [white, '#FFE7AE']));
doc.restore();
icon('book', ex, ey + 2, plum, 1.3);
doc.save().lineWidth(2.1).strokeColor(magenta).lineCap('round')
   .moveTo(ex, ey - 16).lineTo(ex, ey - 8.4).stroke().restore();

place('CHRISCO', ML, 90.6, { size: 19.4, font: 'bold', color: white, space: 3.9, lead: 23.4 });
place('CENTRAL YOUTH · NAIROBI', ML, 116, { size: 10.6, color: '#FFD9EC', space: 2.2, lead: 13 });
right('TREASURE TUESDAY SERIES', 56.5, { size: 9.2, font: 'bold', color: gold, space: 1.9, lead: 12 });
right('Accountability, forgiveness and\nthe long road back — for the whole church', 71.5,
  { size: 8.6, font: 'italic', color: '#FFCFE4', lead: 11.6 });

shadow('Cancel Culture\nvs Grace Culture', ML, 429,
  { size: 28.4, font: 'bold', color: white, width: CW, align: 'right', lead: 33 });
shadow('creating a balance between them', ML, 500,
  { size: 13.6, font: 'italic', color: '#FFF0BF', width: CW, align: 'right', lead: 16 });
place('BY MINISTER NAOMI NJOKI', ML, 540.5, { size: 11.7, font: 'bold', color: white, space: .9, lead: 14, align: 'right', width: CW });
place('FULL OF LIFE · FULL OF COLOUR', ML, 560, { size: 9.4, font: 'bold', color: gold, space: 1.2, lead: 14, align: 'right', width: CW });

/* ============================================================================= */
/*  PAGE 2 — the opening (template page 2: photo, colour band with heading and   */
/*  lead paragraph, then two columns where the clinic put Mission / Vision)      */
/* ============================================================================= */
newpage();
photo('community.jpg', FX, -1, FW, 256.5);
band(256.5, 168, [magenta, orange]);
pennant(330.9, 256.5, 1, PENN_W, PENN_H, '#FFD166', coral);
place('The Question\nWe Cannot Dodge', ML, 275.9, { size: 23.3, font: 'bold', color: white, lead: 27.7 });
place('How do we hold people accountable for wrong doing, without denying them the possibility of redemption? Culture is the shared beliefs, values and customs of a group — and the way a group treats someone who has fallen says more about it than any statement of faith.',
  ML, 345.1, { size: 9.7, color: '#FFF1F7', width: 301, lead: 13.15, maxY: 419, name: 'p2 lead' });

const c1h = place('Cancel Culture:', ML, 442.8, { size: 15.6, font: 'bold', color: magenta, width: 150, lead: 18.2 });
place('A collective boycotting — a community withdrawing support from someone because of what they said or did. At institutional level it can serve public accountability. Left unchecked it turns into a crowd that enjoys the fall.',
  ML, c1h + 9, { size: 9.7, min: 8.6, width: 150, lead: 13.15, maxY: 584, name: 'p2 left' });
const c2h = place('Grace Culture:', C2n, 442.8, { size: 15.6, font: 'bold', color: teal, width: 150, lead: 18.2 });
place('The free, unmerited favour of God. Grace never licenses sin without consequences; it opens the way back to whoever is willing to walk it — and it keeps that way open far longer than our patience does.',
  C2n, c2h + 9, { size: 9.7, min: 8.6, width: 150, lead: 13.15, maxY: 584, name: 'p2 right' });



/* ============================================================================= */
/*  PAGE 3 — icon grid of six (the template's "Our Services" page)                */
/* ============================================================================= */
function gridPage(head, deck, items, top = [violet, royal], accent = gold, sub = RAINBOW) {
  newpage();
  band(-16.5, 126, top);
  hairline(109.5, accent);
  /* heading: shrink only enough that its widest line clears the deck column */
  const DX = C2 + 35, DW = MR - DX;
  let hs = 31.1;
  for (const cand of [31.1, 30, 28.8, 27.6, 26.4]) {
    doc.font('bold').fontSize(cand);
    if (Math.max(...head.split('\n').map(l => doc.widthOfString(l))) + ML + 10 <= DX) { hs = cand; break; }
  }
  place(head, ML, 24.3, { size: hs, font: 'bold', color: white, lead: hs * 1.194 });
  if (deck) place(deck, DX, 44, { size: 8.8, color: '#EDE7FA', width: DW, lead: 11.6, maxY: 101, name: head.replace(/\n/g,' ') + ' deck' });
  const rows = [133.5, 279.5, 425.5];
  items.forEach((it, i) => {
    const x = i % 2 ? C2 : ML, y = rows[Math.floor(i / 2)], c = sub[i % sub.length];
    if (it.l) letterDisc(x + 22.4, y + 22.4, 22.4, it.l, c);
    else disc(x + 22.4, y + 22.4, 22.4, c, it.g);
    const hy = y + 46;
    const he = place(it.h, x, hy, { size: 11.7, font: 'bold', color: c, width: 150, lead: 16.1,
         maxY: y + 84, name: 'heading ' + i });
    const by = Math.max(y + 78, he + 6);
    const limit = rows[Math.floor(i / 2) + 1] ? rows[Math.floor(i / 2) + 1] - 5 : 580;
    place(it.b, x, by, { size: 9.4, min: 8.2, width: 152, lead: 12.6,
         maxY: limit, name: 'body “' + it.h.replace(/\n/g, ' ') + '”' });
  });
}
gridPage('Six Things\nWe Must Hold', 'Distinctions the church loses at its own cost.', [
  { g: 'key', h: 'Forgiveness Is\nNot Trust', b: 'You can forgive someone who betrayed you without handing them access to your life again. Trust is rebuilt over time.' },
  { g: 'scales', h: 'Grace Is Not the\nAbsence of Consequence', b: 'The one who steals may be forgiven and still have to return the money. Repentant leaders can still face discipline.' },
  { g: 'loop', h: 'Restoration Is Not\nAutomatic Reinstatement', b: 'Being received back is not the same as being handed the old position, platform or keys on the same afternoon.' },
  { g: 'heart', h: 'Mercy Must Not\nErase the Victim', b: 'Care for the person who was hurt belongs in the same sentence as mercy for the one who hurt them.' },
  { g: 'shield', h: 'Safety, Justice and\nBoundaries Matter', b: 'Boundaries are not a failure of love. Protection and honest process are how love behaves in public.' },
  { g: 'venn', h: 'Discipline and Mercy\nMust Coexist', b: 'Forgiveness and justice are compatible. The cross is the proof — and there is a thin line between accountability and bullying.' },
]);

/* ============================================================================= */
/*  PAGE 4 — photo header + check list (the template's "Why Choose" page)        */
/* ============================================================================= */
function checkPage(img, head, intro, rows, photoH, edge) {
  newpage();
  photo(img, FX, -1, FW, photoH + 1);
  if (edge) doc.rect(FX, photoH, FW, 2.2).fill(edge);
  shadow(head, ML, 136.5, { size: 31.1, font: 'bold', color: white, lead: 37.15, width: 300, maxY: photoH - 6 });
  const introEnd = place(intro, ML, photoH + 15, { size: 9.7, lead: 13.15, maxY: 274, name: 'intro' });
  const startY = Math.max(introEnd + 14, photoH + 38);
  const L = solveRows(rows, startY, 580);
  rows.forEach((r, i) => {
    const y = L.tops[i], c = RAINBOW[i % RAINBOW.length];
    checkBadge(ML, y, c);
    const hy = place(r[0], ML + 40, y - .8, { size: 11.7, font: 'bold', color: c, width: 268, lead: L.headLead });
    place(r[1], ML + 40, hy + 3, { size: L.size, width: 268, lead: L.bodyLead });
  });
  return startY;
}
checkPage('scripture.jpg', 'What the\nScriptures Say',
  'Grace is not the absence of correction, and correction is not the absence of grace. Scripture exposes the works of darkness — and refuses to make a spectacle of the person.',
  [
    ['Matthew 18:15–17', '“Go and point out the fault, just between the two of you.” Private first, witnesses only then, the wider circle last — every step aimed at winning them back.'],
    ['1 Corinthians 5:1–13', 'Paul removes the unrepentant sinner from the community so that his spirit may be saved in the day of the Lord. Discipline with a redemptive end, never a spiteful one.'],
    ['Ephesians 5:11', '“Have nothing to do with the unfruitful works of darkness, but instead expose them.” Grace does not tolerate serious wrong doing indefinitely.'],
    ['Proverbs 28:13', 'Whoever conceals their transgressions does not prosper, but whoever confesses and forsakes them finds mercy. Confession is the doorway mercy walks through.'],
    ['2 Corinthians 2:6–8', 'Paul then urges the church to forgive and comfort the disciplined person, so that he is not overwhelmed by excessive sorrow. Discipline that never ends was never discipline.'],
  ], 232, gold);

/* ============================================================================= */
/*  PAGE 5 — the GRACE framework (same grid archetype, letter badges)             */
/* ============================================================================= */
gridPage('The G·R·A·C·E\nFramework', 'Practical steps for accountability with grace — a shape you can use on a Tuesday night.', [
  { l: 'G', h: 'Get the Facts', b: 'Before you speak, before you post, before you withdraw. Proverbs 18:13 — to answer before listening is folly and shame. Hear both sides first.' },
  { l: 'R', h: 'Recognise the Harm', b: 'Name what was actually done, and who it cost. Do not minimise it for comfort, and do not inflate it for effect.' },
  { l: 'A', h: 'Accountability Remains', b: 'Appropriate consequences still apply. Love does not waive them; it walks with the person through them.' },
  { l: 'C', h: 'Choose Compassion', b: 'Challenge the wrong doing without dehumanising the wrong doer. Nobody is the worst thing they have ever done.' },
  { l: 'E', h: 'Encourage Genuine Change', b: 'Is there evidence of repentance — changed behaviour, and a willingness to make amends? Not just a well-written apology.' },
  { l: '+', h: 'Make Room for Restoration', b: 'Without rushing it. Restoration is a road, not an event, and it is not ours to set the pace of.' },
], [orange, magenta], teal, [magenta, orange, teal, violet, rose, royal]);
/* swap the pictograms on this page for the G·R·A·C·E letters */

/* ============================================================================= */
/*  PAGE 6 — balance in practice                                                  */
/* ============================================================================= */
checkPage('balance.jpg', 'Balance\nin Practice',
  'We need to learn the difference between public shaming and public accountability. These are the checks we keep applying to ourselves.',
  [
    ['Private First, Public Last', 'Confrontation follows Matthew 18: one person, then two or three, then the church. Skipping to the crowd is not courage.'],
    ['Exposing Is Not a Licence for Rumour', 'Calling wrongdoing into the light never authorises gossip, screenshots for sport, or a half story told loudly.'],
    ['Do Not Be Selective', 'Do not be selective about what you count as moral. The standard that convicts your rival must also convict you.'],
    ['The Goal Is Restoration', 'Not the satisfaction of watching someone fall. If you are quietly hoping for the fall, check your own heart first.'],
    ['Do Not Repay Evil for Evil', 'Romans 12:17. The cycle stops with us: no answering a wrong with a bigger wrong and calling the excess justice.'],
    ['Truth and Grace, Together', 'We serve a God who calls sin what it is, who confronts wrongdoing, and who still offers mercy to those who repent.'],
  ], 232, teal);

/* ============================================================================= */
/*  PAGE 7 — full-bleed divider (cover archetype reused for the turning point)   */
/* ============================================================================= */
newpage();
fillRect(0, 0, W, H, grad(0, 0, W, H, [deep, teal]));
photo('grace.jpg', FX, PHOTO_TOP, FW, 350);
pennant(319.2, PHOTO_TOP, 1, PENN_W, PENN_H, gold, rose);
pennant(100 + PENN_H / 2, 525, -1, PENN_W, PENN_H, violet, royal);
doc.rect(FX, 525, FW, 1.8).fill(gold);
kicker('THE HEART OF THE MATTER', ML, 90.6, gold, { size: 9.2 });
place('What would\nJesus do?', ML, 112, { size: 31.1, font: 'bold', color: white, lead: 37.15, maxY: 168 });
shadow('We are more than\nour worst moment', ML, 401,
  { size: 26.4, font: 'bold', color: white, width: CW, align: 'right', lead: 31, maxY: 470 });
shadow('He ate with the people the crowd had already written off — and told them to go and sin no more.',
  ML, 474, { size: 11, font: 'italic', color: '#FFE6A8', width: CW, align: 'right', lead: 14, maxY: 520 });
rule(545, '#2F6B73', .8);
place('The same grace we celebrate when God extends it to us must shape how we treat other people.', ML, 549.6,
  { size: 9.4, font: 'bold', color: white, width: CW, lead: 12.4, maxY: 578, name: 'p7 strap' });

/* ============================================================================= */
/*  PAGE 8 — the "hidden in Christ" page (page-2 archetype again)                */
/* ============================================================================= */
newpage();
photo('nairobi.jpg', FX, -1, FW, 197);
band(196, 184, [royal, violet]);
pennant(330.9, 196, 1, PENN_W, PENN_H, '#6FD36B', teal);
place('Set Your Mind\non Things Above', ML, 214.5, { size: 23.3, font: 'bold', color: white, lead: 27.7 });
place('“Set your minds on things above, not on earthly things. For you have died, and your life is hidden with Christ in God.” — Colossians 3:2–3',
  ML, 292.5, { size: 10.4, font: 'italic', color: '#E7EAFF', width: 301, lead: 14.4, maxY: 366, name: 'p8 quote' });
const h1p8 = place('Hidden —\nnot from others', ML, 400, { size: 15.6, font: 'bold', color: royal, width: 150, lead: 18.2 });
place('When your identity is rooted in who Jesus is and what He has done — not in what you dig up inside yourself — you live life to its truest, undistracted by whatever momentary message is dictating how you feel about yourself.',
  ML, h1p8 + 9, { size: 9.7, min: 8.6, width: 150, lead: 13.15, maxY: 570, name: 'p8 left' });
const h2p8 = place('Protected —\nby Christ', C2n, 400, { size: 15.6, font: 'bold', color: violet, width: 150, lead: 18.2 });
place('When you hide your identity in Christ it is not hidden from others; it is protected by Christ. No verdict, no viral moment and no committee of one gets to write the final sentence about you.',
  C2n, h2p8 + 9, { size: 9.7, min: 8.6, width: 150, lead: 13.15, maxY: 570, name: 'p8 right' });



/* ============================================================================= */
/*  PAGE 9 — reflection & assignment (band header + questions + cards)            */
/* ============================================================================= */
newpage();
band(0, 109.5, [plum, violet]);
hairline(109.5, gold);
place('Over to You', ML, 34, { size: 31.1, font: 'bold', color: white, lead: 37.15 });
place('A few gems to carry into the week — kila mtu aende a reflect.', ML, 78,
  { size: 9.7, font: 'italic', color: '#E4D6F7', lead: 12.4 });
place('Reflect', ML, 126, { size: 15.6, font: 'bold', color: magenta, lead: 18.2 });
[
  ['If the Bible calls us to confront sin, at what point does confrontation become condemnation?', magenta],
  ['When someone falls, what do I feel first — grief for them, or the small pleasure of being proved right?', orange],
  ['Who have I already written off that God is still pursuing — and what would it cost me to believe He can still reach them?', royal],
].forEach(([q, c], i) => {
  const y = 152 + i * 34;
  doc.circle(ML + 8.4, y + 6, 8.4).fill(c);
  doc.font('bold').fontSize(10).fillColor(white).text(String(i + 1), ML, y - .6, { width: 16.8, align: 'center' });
  place(q, ML + 26, y - 1.6, { size: 9.9, width: 282, lead: 13, maxY: y + 30, name: 'q' + i });
});
doc.roundedRect(FX, 258, FW, 74, 8).fill(softGold);
place('Assignment · for next Tuesday', ML, 272, { size: 11.7, font: 'bold', color: orange, lead: 14, space: .4 });
place('Answer all three in writing, in one page. Then do one of these before you meet again: send the message you should have sent, restore the thing you took, or sit with the person nobody else is speaking to.',
  ML, 290, { size: 9.4, width: CW, lead: 12.6, maxY: 326, name: 'assignment' });
place('This we believe', C2n, 352, { size: 15.6, font: 'bold', color: teal, lead: 18.2 });
doc.roundedRect(C2n - 6, 378, 162, 106, 8).fill(grad(C2n - 6, 378, C2n + 156, 484, [teal, royal]));
place('Grace is not the absence of consequences, and consequences are not the absence of grace.',
  C2n + 6, 392, { size: 10.2, font: 'bolditalic', color: white, width: 142, lead: 13.6, maxY: 472, name: 'p9 card' });
doc.roundedRect(ML, 378, 150, 106, 8).fill(softTeal);
place('Memorise', ML + 12, 392, { size: 9, font: 'bold', color: teal, lead: 11.6, width: 126, space: 1.2 });
place('“The goal is restoration, not the satisfaction of watching another person fall.”',
  ML + 12, 412, { size: 10, font: 'italic', color: ink, width: 126, lead: 13, maxY: 472, name: 'memory' });
doc.roundedRect(FX, 500, FW, 88.5, 8).fill(grad(FX, 500, FX + FW, 588.5, [plum, magenta]));
place('Pray for both of them', ML, 516, { size: 11.7, font: 'bold', color: gold, lead: 14, space: .6 });
place('Pray for the one who did the wrong, that God would really change them. Pray for the one who was hurt, that God would really heal them. Leave the verdict where it belongs.',
  ML, 534, { size: 9.7, color: '#FFD9EC', width: 300, lead: 12.6, maxY: 580, name: 'p9 pray' });

/* ============================================================================= */
/*  PAGE 10 — back cover (template page 5: colour field, heading, details, photo,*/
/*  contact lines and the small square block in the bottom right)                */
/* ============================================================================= */
newpage();
fillRect(FX, 0, FW, 448, grad(FX, 0, FX + FW, 448, [plum, violet]));
pennant(300, 148, 1, 252, 168, '#9B4DDE', violet);
place('You Are\nWelcome Here', ML, 38.1, { size: 31.1, font: 'bold', color: white, lead: 37.15 });
place('Treasure Tuesdays:', ML, 135.9, { size: 11.7, font: 'bold', color: gold, lead: 14 });
place('Every Tuesday · youth fellowship at CHRISCO Central, Nairobi\nAll are welcome — doors open fifteen minutes before we start',
  ML, 157.4, { size: 9.7, color: '#EADBFB', lead: 13.15, maxY: 188, name: 'p10 details' });
photo('welcome.jpg', FX, 191.5, FW, 256.3);
doc.rect(FX, 191.5, FW, 2).fill(gold);
place('Written and taught by\nMinister Naomi Njoki', ML, 462, { size: 9.7, color: ink, lead: 13.15 });
place('Series · Treasure Tuesday, 2026\nTitle · Cancel Culture vs Grace Culture\nBalance · truth that refuses to destroy, grace that refuses to excuse',
  ML, 494.9, { size: 9.2, color: body, width: 224, lead: 13.15, maxY: 566, name: 'p10 contact' });
doc.roundedRect(293.6, 486.4, 70, 70, 8).fill(grad(293.6, 486.4, 363.6, 556.4, [magenta, orange]));
place('FULL OF\nLIFE', 293.6, 502, { size: 12.4, font: 'bold', color: white, width: 70, align: 'center', lead: 15 });
rule(570, '#EAE3F2', .7);
place('Let this book be full of life and full of colour.', ML, 576, { size: 9.2, font: 'italic', color: magenta, lead: 11.8, width: 190 });
right('CHRISCO Central Youth Nairobi', 576.6, { size: 7.6, color: faint, lead: 11.8 });

/* -------------------------------------- finish ------------------------------- */
doc.end();
doc.on('end', () => {
  console.log(`\nwritten: ${path.basename(OUT)}`);
  console.log(`pages:   ${page}   size: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
  if (warn.length) { console.log('\nLAYOUT WARNINGS:'); warn.forEach(w => console.log('  ! ' + w)); }
  else console.log('layout:   all text fits');
});
