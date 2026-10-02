/**
 * LYNTON EVENTS · Ushers Training & Briefing Handbook
 * Visual standard: company profile.pdf (A5 corporate profile)
 *   Poppins Bold headings · Futura-style body (Jost) · navy #162B57
 *   corner chevron notches · footer URL · logo top-left · 3-dot motif
 *   bold photo silhouettes anchored at page bottoms · no dates, no venues:
 *   a professional ushering handbook for every event.
 * Run: node generate-ushers-handbook.js
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Lynton_Events_Ushers_Training_Handbook.pdf');
const doc = new PDFDocument({
  size: [419.53, 595.28],
  margin: 0,
  autoFirstPage: false,
  info: {
    Title: 'Ushers Training & Briefing Handbook',
    Author: 'Lynton Events · We Make It Happen',
    Subject: 'A professional training handbook for event ushering teams',
  },
});
doc.pipe(fs.createWriteStream(OUT));

/* ---------- fonts: the reference profile's type system ---------- */
doc.registerFont('PB', 'fonts/Poppins-Bold.ttf');
doc.registerFont('PM', 'fonts/Poppins-Medium.ttf');
doc.registerFont('PR', 'fonts/Poppins-Regular.ttf');
doc.registerFont('JB', 'fonts/Jost-Book.ttf');      // Futura Book
doc.registerFont('JI', 'fonts/Jost-BookItalic.ttf');
doc.registerFont('JM', 'fonts/Jost-Medium.ttf');
doc.registerFont('JS', 'fonts/Jost-Semi.ttf');      // Futura Heavy

/* ---------- palette (sampled from the reference PDF) ---------- */
const NAVY = '#162B57';
const BLUE = '#7F96BF';
const SLATE = '#707C9B';
const LIGHT = '#F5F5F5';
const GHOST = '#E9EDF4';
const GOLD = '#C9A13B';
const INKSOFT = '#C8D0E2';

const W = 419.53, H = 595.28, MX = 42;

/* ---------- helpers ---------- */
function poly(pts, color, op) {
  doc.save(); if (op != null) doc.opacity(op);
  doc.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) doc.lineTo(pts[i], pts[i + 1]);
  doc.closePath().fill(color); doc.restore();
}

function notch(corner = 'TR', s = 86) {
  const g = s + 22, st = s + 11;
  const C = {
    TR: { x: W, y: 0, sx: -1, sy: 1 },
    BR: { x: W, y: H, sx: -1, sy: -1 },
    BL: { x: 0, y: H, sx: 1, sy: -1 },
    TL: { x: 0, y: 0, sx: 1, sy: 1 },
  }[corner];
  const tri = d => [C.x, C.y, C.x + C.sx * d, C.y, C.x, C.y + C.sy * d];
  poly(tri(g), SLATE); poly(tri(st), '#FDFDFD'); poly(tri(s), NAVY);
}

function dotsR(x = 350, y = 52, color = NAVY) {
  [x, x + 11.5, x + 23].forEach(cx => doc.circle(cx, y, 2.4).fill(color));
}

function logoBlock(x = MX, y = 42, dark = false) {
  doc.save().roundedRect(x, y, 26, 26, 3).fill(NAVY).restore();
  doc.image('assets/emblem.png', x + 4.1, y + 7.0, { width: 17.8 });
  doc.font('PM').fontSize(10.5).fillColor(dark ? '#FFFFFF' : NAVY)
    .text('Lynton\nEvents', x + 34, y + 2.2, { lineGap: 1.6 });
}

function footer(y = 568) {
  doc.font('JB').fontSize(10.2).fillColor(NAVY)
    .text('www.lyntonevents.com', MX, y, { width: W - 2 * MX, align: 'center' });
}

/** bold photo silhouette anchored to the bottom of the page */
function silhouette(tag, bottomPad = 0) {
  const h = W * (640 / 1200);
  doc.image(`assets/sil/${tag}.png`, 0, H - h + bottomPad, { width: W, height: h });
}

function page(opts = {}) {
  doc.addPage({ size: [W, H], margin: 0 });
  doc.rect(0, 0, W, H).fill(LIGHT);
  if (opts.sil) silhouette(opts.sil);
  if (opts.notchTR) notch('TR', opts.notchTR === true ? 62 : opts.notchTR);
  if (opts.notchBL) notch('BL', opts.notchBL === true ? 72 : opts.notchBL);
  if (opts.notchBR) notch('BR', opts.notchBR === true ? 62 : opts.notchBR);
  if (opts.chrome !== false) {
    if (opts.dots) dotsR();
    logoBlock();
    footer(opts.footerY);
  }
}

function title(t, y = 104) {
  doc.font('PB').fontSize(21).fillColor(NAVY)
    .text(t, MX, y, { width: W - 2 * MX, align: 'center', characterSpacing: 0.4 });
}

function body(t, x, y, w, o = {}) {
  doc.font(o.font || 'JB').fontSize(o.size || 11.3)
    .fillColor(o.color || NAVY)
    .text(t, x, y, { width: w, align: o.align || 'left', lineGap: o.lineGap == null ? 2.6 : o.lineGap });
  return doc.y;
}

function bulletDot(t, x, y, w, o = {}) {
  doc.circle(x + 2.2, y + (o.dotY == null ? 5.2 : o.dotY), o.r || 1.9).fill(o.dotColor || GOLD);
  return body(t, x + 11, y, w - 11, o);
}

function checkRow(t, x, y, w, o = {}) {
  doc.save();
  doc.lineWidth(1.6).lineCap('round').strokeColor(o.markColor || GOLD);
  doc.moveTo(x + 1, y + 6.5).lineTo(x + 4, y + 9.5).lineTo(x + 9.5, y + 2.5).stroke();
  doc.restore();
  return body(t, x + 15, y, w - 15, o);
}

function navyBox(x, y, w, h, r = 4, color = NAVY) {
  doc.save().roundedRect(x, y, w, h, r).fill(color).restore();
}

function icon(kind, cx, cy, r = 7.5, circleColor = NAVY, glyphColor = '#FFFFFF') {
  doc.save();
  doc.circle(cx, cy, r).fill(circleColor);
  doc.lineWidth(1.15).lineCap('round').lineJoin('round').strokeColor(glyphColor);
  if (kind === 'phone') {
    doc.moveTo(cx - 2.6, cy + 3.2)
      .bezierCurveTo(cx - 4.8, cy + 0.6, cx - 4.8, cy - 3.4, cx - 2.4, cy - 3.4)
      .bezierCurveTo(cx - 0.6, cy - 3.4, cx + 0.4, cy - 1.8, cx + 1.4, cy - 1.0)
      .bezierCurveTo(cx + 2.4, cy - 0.2, cx + 2.8, cy + 1.2, cx + 2.6, cy + 2.0)
      .bezierCurveTo(cx + 2.2, cy + 3.8, cx - 0.6, cy + 4.2, cx - 2.6, cy + 3.2).stroke();
  } else if (kind === 'mail') {
    doc.rect(cx - 4, cy - 3, 8, 6).stroke();
    doc.moveTo(cx - 4, cy - 3).lineTo(cx, cy + 0.6).lineTo(cx + 4, cy - 3).stroke();
  } else if (kind === 'globe') {
    doc.circle(cx, cy, 4.1).stroke();
    doc.moveTo(cx - 4.1, cy).lineTo(cx + 4.1, cy).stroke();
    doc.moveTo(cx, cy - 4.1).bezierCurveTo(cx - 2.4, cy - 2.2, cx - 2.4, cy + 2.2, cx, cy + 4.1).stroke();
    doc.moveTo(cx, cy - 4.1).bezierCurveTo(cx + 2.4, cy - 2.2, cx + 2.4, cy + 2.2, cx, cy + 4.1).stroke();
  }
  doc.restore();
}

function contactRow(kind, text, baselineY, o = {}) {
  const cy = baselineY + 6;
  icon(kind, o.iconX == null ? 373 : o.iconX, cy, 7.5, o.circle || NAVY, o.glyph || '#FFFFFF');
  doc.font('JB').fontSize(o.size || 10.4).fillColor(o.color || NAVY)
    .text(text, o.x == null ? 217 : o.x, baselineY, { width: o.w == null ? 141 : o.w, align: o.align || 'right' });
}

function goldQuote(t, x, y, w, o = {}) {
  return body('“' + t + '”', x, y, w,
    { font: 'JI', size: o.size || 11.5, color: o.color || GOLD, align: o.align || 'center', lineGap: o.lineGap == null ? 3 : o.lineGap });
}

/** gold quote on a soft light chip, for quotes that sit over photo silhouettes */
function goldQuoteChip(t, x, y, w, o = {}) {
  const size = o.size || 11.5;
  doc.font('JI').fontSize(size);
  const txt = '“' + t + '”';
  const th = doc.heightOfString(txt, { width: w, lineGap: 3 });
  const tw = Math.min(doc.widthOfString(txt), w);
  const cx = x + w / 2;
  doc.save().opacity(0.82)
    .roundedRect(cx - tw / 2 - 11, y - 5, tw + 22, th + 10, 6)
    .fill('#FFFFFF').restore();
  return goldQuote(t, x, y, w, o);
}

function downArrow(cx, y, color = NAVY) {
  doc.save();
  doc.rect(cx - 1.6, y, 3.2, 10).fill(color);
  poly([cx - 5, y + 10, cx + 5, y + 10, cx, y + 17], color);
  doc.restore();
}

function arrowR(cx, cy, color = '#FFFFFF') {
  doc.save();
  doc.lineWidth(1.7).lineCap('round').strokeColor(color);
  doc.moveTo(cx - 6, cy).lineTo(cx + 4.5, cy).stroke();
  poly([cx + 4, cy - 3.6, cx + 9, cy, cx + 4, cy + 3.6], color);
  doc.restore();
}

function imgCover(img, x, y, w, h, align = 'center', valign = 'center') {
  doc.save(); doc.rect(x, y, w, h).clip();
  doc.image(img, x, y, { cover: [w, h], align, valign });
  doc.restore();
}

function photoClip(img, clipPts, fitW, fitH, align = 'center', valign = 'center') {
  doc.save();
  doc.moveTo(clipPts[0], clipPts[1]);
  for (let i = 2; i < clipPts.length; i += 2) doc.lineTo(clipPts[i], clipPts[i + 1]);
  doc.closePath().clip();
  doc.image(img, 0, 0, { cover: [fitW, fitH], align, valign });
  doc.restore();
}

/* =====================================================================
   P1 · COVER   (mirrors the uploaded reference cover)
===================================================================== */
page({ chrome: false });
doc.rect(0, 0, W, H).fill(LIGHT);
poly([W, 0, W, 300, W - 190, 0], GHOST);
photoClip('lynton2.jpg', [0, 0, 248, 0, 248, 384, 132, 470, 0, 470], 248, 470);
poly([0, 470, 132, 470, 248, 384, 248, 424, 0, 506], SLATE);
poly([0, 516, 248, 428, 248, 439, 0, 525], '#FFFFFF');
poly([0, 535, 248, 445, W, 548, W, H, 0, H], NAVY);
logoBlock(28, 30);
dotsR(352, 40);
// navy title slab
navyBox(112, 96, W - 112, 172, 0);
doc.font('PB').fontSize(27).fillColor('#FFFFFF')
  .text('USHERS\nTRAINING &\nBRIEFING', 112, 116, { width: W - 112, align: 'center', lineGap: 3.5 });
doc.font('PM').fontSize(8.6).fillColor('#E4C775')
  .text('THE EVENT TEAM HANDBOOK', 112, 234, { width: W - 112, align: 'center', characterSpacing: 2 });
// right light column: edition + contacts + promise
doc.font('PB').fontSize(22).fillColor(NAVY).text('EDITION 01', 217, 286, { width: 160, align: 'right' });
doc.moveTo(324, 318).lineTo(377, 318).lineWidth(1.4).strokeColor(GOLD).stroke();
contactRow('phone', '+254 729 474 546', 346, { size: 10.4 });
contactRow('mail', 'lyntoneventske@gmail.com', 372, { size: 9.2 });
contactRow('globe', 'www.lyntonevents.com', 398, { size: 10.4 });
doc.font('JM').fontSize(9).fillColor(NAVY)
  .text('EVERY EVENT  ·  EVERY GUEST', 207, 428, { width: 170, align: 'right', characterSpacing: 0.6 })
  .text('ONE STANDARD', 207, 443, { width: 170, align: 'right', characterSpacing: 2.2 });

/* =====================================================================
   P2 · WELCOME TO THE TEAM
===================================================================== */
page({ notchTR: true, sil: 's4' });
title('Welcome To The Team', 112);
doc.moveTo(169, 148).lineTo(250, 148).lineWidth(1.1).strokeColor(GOLD).stroke();
body('An usher is often the first human connection a guest has with an event. Your presence, preparation and attitude set the tone for everything that follows.',
  66, 172, W - 132, { size: 11.3, align: 'center', lineGap: 3 });
navyBox(66, 230, W - 132, 170, 4);
body('By the end of this training you will know how to receive and guide guests, communicate with courtesy, manage seating and crowds, serve VIPs with discretion, work as one team and stay calm when plans change.',
  95, 258, 230, { size: 11.3, color: '#FFFFFF', lineGap: 4 });
doc.font('JI').fontSize(11.3).fillColor('#E4C775')
  .text('Remember: “Your attitude is part of the event experience.”', 95, 362, { width: 230, lineGap: 4 });
goldQuoteChip('One team. One standard. One experience.', 66, 446, W - 132);

/* =====================================================================
   P3 · TABLE OF CONTENTS
===================================================================== */
page({ notchTR: true, sil: 's9' });
title('Table Of Contents', 118);
const tocBox = (x, y, w, h, items) => {
  navyBox(x, y, w, h, 3);
  let yy = y + 26;
  items.forEach(it => {
    doc.circle(x + 22, yy + 5, 1.8).fill('#FFFFFF');
    doc.font('JB').fontSize(11.3).fillColor('#FFFFFF').text(it, x + 32, yy, { width: w - 46 });
    yy += 23.5;
  });
};
tocBox(108, 158, 203, 166, [
  'Welcome To The Team',
  'Training Objective',
  'Who Is An Usher',
  'Key Responsibilities',
  'The Five Second Welcome',
  'Professional Communication',
]);
tocBox(109, 348, 203, 186, [
  'Dress Code & Presentation',
  'Seating & Guest Management',
  'VIP & Protocol',
  'Handling Difficult Guests',
  'Crowd & Emergency Response',
  'Teamwork & Final Briefing',
  'The Usher’s Pledge',
]);

/* =====================================================================
   P4 · TRAINING OBJECTIVE
===================================================================== */
page({ notchTR: true, sil: 's7' });
title('Training Objective');
body('This handbook prepares every usher for confident, professional service. By the end of the training, every usher should understand:',
  MX, 166, W - 2 * MX, { lineGap: 3.2 });
const objectives = [
  'Your roles and responsibilities', 'Receiving & guiding guests',
  'Communication & etiquette', 'Seating & crowd management',
  'Protocol & VIP service', 'Teamwork & coordination',
  'Handling difficult situations', 'Dress code & conduct',
];
objectives.forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 172, 242 + row * 34, 166, { size: 10.6 });
});
doc.moveTo(MX, 398).lineTo(W - MX, 398).lineWidth(0.8).strokeColor('#D9DEE8').stroke();
body('Great ushers do more than point at chairs. They create order, warmth and confidence from the moment a guest arrives until the final debrief closes the day.',
  MX, 420, W - 2 * MX, { align: 'center', lineGap: 3.4, size: 11.3 });
goldQuoteChip('Every guest interaction shapes the experience.', MX, 486, W - 2 * MX);

/* =====================================================================
   P5 · WHO IS AN USHER   (photo + slab archetype)
===================================================================== */
page({ notchTR: true, notchBL: 110, sil: 's10' });
title('Who Is An Usher');
body('An usher is the first point of contact between the event and the guest, the welcome people remember long after the day is over.',
  MX, 170, 205, { lineGap: 3.4 });
body('An usher should be:', MX, 272, 205, { font: 'JS', size: 10.8 });
let ty5 = 296;
['Welcoming', 'Alert', 'Professional', 'Helpful', 'Respectful', 'Approachable'].forEach(t => {
  ty5 = bulletDot(t, MX, ty5, 150, { size: 10.6 }) + 2.5;
});
doc.moveTo(258, 162).lineTo(392, 162).lineWidth(1.4).strokeColor(GOLD).stroke();
doc.moveTo(258, 166).lineTo(392, 166).lineWidth(0.6).strokeColor(GOLD).stroke();
imgCover('lynton 10.jpg', 258, 170, 130, 196, 'center', 'top');
navyBox(258, 366, 130, 24, 0);
doc.font('PM').fontSize(10.5).fillColor('#FFFFFF').text('The Usher', 258, 372, { width: 130, align: 'center', characterSpacing: 0.5 });
body('Great ushers read the room. They notice confusion, congestion and special needs early, then they act or they report. Calm eyes, warm words, clear directions.',
  172, 430, W - 172 - MX, { lineGap: 3.2, size: 11.3 });
goldQuoteChip('See the person. Read the moment.', 172, 516, W - 172 - MX);

/* =====================================================================
   P6 · BEFORE THE EVENT   (photo band archetype)
===================================================================== */
page({ chrome: false, sil: 's1' });
logoBlock(); dotsR(); footer();
imgCover('lynton 9.jpg', 0, 84, W, 148, 'center', 'top');
doc.rect(0, 228, W, 4).fill('#FFFFFF');
doc.save().rect(34, 248, 262, 44, 2).fill(NAVY).restore();
doc.font('PB').fontSize(17.5).fillColor('#FFFFFF').text('Before The Event', 50, 261);
doc.font('PM').fontSize(7.2).fillColor('#E4C775').text('KEY RESPONSIBILITIES', 316, 263, { width: 96, characterSpacing: 0.8 });
let b6 = 330;
[
  'Arrive early and attend the briefing', 'Understand the venue layout',
  'Know entrances, exits, washrooms', 'Check seating arrangements',
  'Identify VIP and protocol areas', 'Confirm emergency procedures',
  'Know where to direct every guest',
].forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 171, b6 + row * 34, 165, { size: 10.3 });
});
goldQuoteChip('Preparation is the first service of the day.', MX, 500, W - 2 * MX);
notch('BR', 62);

/* =====================================================================
   P7 · DURING THE EVENT   (corner photo archetype)
===================================================================== */
page({ notchTR: true, sil: 's2' });
imgCover('lynton5.jpg', 246, 84, W - 246, 140, 'center', 'top');
doc.rect(246, 224, W - 246, 4).fill('#FFFFFF');
doc.save().rect(34, 250, 262, 44, 2).fill(NAVY).restore();
doc.font('PB').fontSize(17.5).fillColor('#FFFFFF').text('During The Event', 50, 263);
doc.font('PM').fontSize(7.2).fillColor('#E4C775').text('KEY RESPONSIBILITIES', 316, 265, { width: 96, characterSpacing: 0.8 });
body('While the event runs, you are the visible, moving calm of the venue.',
  MX, 318, 205, { size: 11.3, lineGap: 3 });
[
  'Welcome guests warmly', 'Give clear directions',
  'Assist with seating', 'Manage movement around the venue',
  'Help elderly guests, persons with disabilities and families',
  'Maintain order without being aggressive', 'Identify and report issues early',
  'Work with the coordinator and security team',
].forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 171, 386 + row * 42, 165, { size: 10.3 });
});

/* =====================================================================
   P8 · AFTER THE EVENT   (tilted photos archetype)
===================================================================== */
page({ notchTR: true, sil: 's3' });
title('After The Event');
doc.save().rotate(-4, { origin: [106, 200] });
doc.rect(48, 152, 122, 96).fill('#FFFFFF');
imgCover('lynton 6.jpg', 53, 157, 112, 86, 'center', 'center');
doc.restore();
doc.save().rotate(3, { origin: [146, 274] });
doc.rect(92, 226, 122, 90).fill('#FFFFFF');
imgCover('lynton 1.jpg', 97, 231, 112, 80, 'center', 'center');
doc.restore();
navyBox(236, 166, 168, 62, 2);
doc.font('PB').fontSize(14.5).fillColor('#FFFFFF').text('Guest Care ·', 251, 181);
doc.font('PB').fontSize(14.5).fillColor(BLUE).text('Close Well', 251, 201);
body('Service continues until the final debrief. Every usher should:', MX, 350, W - 2 * MX, { lineGap: 3 });
let ay = 398;
[
  'Assist guests as they exit',
  'Help with orderly movement out of the venue',
  'Report and hand in lost property or incidents',
  'Check your station one last time',
  'Join the final team debrief',
].forEach(t => { ay = bulletDot(t, MX, ay, W - 2 * MX, { size: 11.3 }) + 8; });

/* =====================================================================
   P9 · THE FIVE SECOND WELCOME   (stacked bars archetype)
===================================================================== */
page({ notchTR: true, sil: 's8' });
title('The Five Second Welcome');
body('Every guest should feel acknowledged: quickly, naturally and respectfully.',
  MX, 162, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const bars = ['SMILE', 'MAKE EYE CONTACT', 'GREET', 'OFFER ASSISTANCE'];
let bY = 212;
bars.forEach((b, i) => {
  navyBox(60, bY, W - 120, 46, 3);
  doc.font('PM').fontSize(13).fillColor('#FFFFFF')
    .text(b, 60, bY + 15, { width: W - 120, align: 'center', characterSpacing: 1.2 });
  if (i < bars.length - 1) downArrow(W / 2, bY + 50);
  bY += 74;
});
goldQuoteChip('Good morning and welcome. How may I assist you?', MX, 510, W - 2 * MX);
body('Avoid pointing from a distance. Walk the guest, or give clear directions.',
  MX, 540, W - 2 * MX, { size: 9.8, align: 'center', font: 'JI' });

/* =====================================================================
   P10 · PROFESSIONAL COMMUNICATION   (two row archetype)
===================================================================== */
page({ notchTR: true, sil: 's2' });
title('Professional Communication');
imgCover('lynton 8.jpg', 35, 152, 144, 118, 'center', 'center');
navyBox(35, 270, 144, 22, 0);
doc.font('PM').fontSize(10.5).fillColor('#FFFFFF').text('Sound Like This', 35, 276, { width: 144, align: 'center' });
navyBox(193, 152, 191, 150, 0);
body('Words that build confidence:', 207, 164, 164, { font: 'JS', size: 10, color: '#E4C775' });
let cy10 = 186;
['Please', 'Thank you', 'Welcome', 'Excuse me', 'Kindly', '“May I assist you?”'].forEach(t => {
  cy10 = bulletDot(t, 207, cy10, 162, { size: 10, color: '#FFFFFF', dotColor: '#FFFFFF' }) + 2.5;
});
imgCover('lynton 7.jpg', 35, 332, 144, 118, 'center', 'center');
navyBox(35, 450, 144, 22, 0);
doc.font('PM').fontSize(10.5).fillColor('#FFFFFF').text('Never Like This', 35, 456, { width: 144, align: 'center' });
navyBox(193, 332, 191, 162, 0);
doc.font('JI').fontSize(10.2).fillColor('#B9C4DB').text('“I don’t know.”', 207, 344, { width: 166 });
doc.font('JB').fontSize(10.2).fillColor('#FFFFFF').text('Say: “Let me confirm that for you.”', 207, 360, { width: 166, lineGap: 2 });
doc.font('JI').fontSize(10.2).fillColor('#B9C4DB').text('“That’s not my job.”', 207, 398, { width: 166 });
doc.font('JB').fontSize(10.2).fillColor('#FFFFFF').text('Say: “Let me connect you with the right person.”', 207, 414, { width: 166, lineGap: 2 });
doc.font('JI').fontSize(10.2).fillColor('#B9C4DB').text('No arguing, no shouting,\nno slang, no negativity.', 207, 460, { width: 166, lineGap: 2.5 });

/* =====================================================================
   P11 · DRESS CODE & PRESENTATION
===================================================================== */
page({ notchTR: true, notchBR: 62, sil: 's5' });
title('Dress Code & Presentation');
body('Ushers should appear smart, clean and coordinated at all times.',
  MX, 166, W - 2 * MX, { align: 'center', lineGap: 3 });
let py11 = 224;
[
  'Clean and neat outfit',
  'Appropriate, comfortable shoes',
  'Well groomed hair',
  'Minimal accessories',
  'Fresh breath and good hygiene',
  'Name tag or identification where provided',
  'Phone kept away while on duty',
].forEach(t => { py11 = checkRow(t, 74, py11, W - 148, { size: 11.6 }) + 11.5; });
goldQuoteChip('You are part of the event’s image.', 74, py11 + 16, W - 148, { size: 12.5 });

/* =====================================================================
   P12 · SEATING & GUEST MANAGEMENT
===================================================================== */
page({ notchTR: true, sil: 's6' });
title('Seating & Guest Management');
body('Every usher should know:', MX, 160, W - 2 * MX, { font: 'JS', size: 11 });
[
  'General seating areas', 'Reserved and VIP seating', 'Family or special seating',
  'Staff areas', 'Restricted areas', 'Emergency exits',
].forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 171, 186 + row * 30, 165, { size: 10.6 });
});
doc.moveTo(MX, 292).lineTo(W - MX, 292).lineWidth(0.8).strokeColor('#D9DEE8').stroke();
body('When directing guests:', MX, 312, W - 2 * MX, { font: 'JS', size: 11 });
let sy12 = 338;
[
  'Face the direction of travel',
  'Give calm, clear instructions',
  'Walk the guest whenever possible',
  'Keep pathways open and unblocked',
  'Never give conflicting instructions. Confirm first.',
].forEach(t => { sy12 = bulletDot(t, MX, sy12, W - 2 * MX, { size: 11.3 }) + 9; });
goldQuoteChip('Kindly proceed this way. I will show you to your seat.', MX, 524, W - 2 * MX, { size: 11 });

/* =====================================================================
   P13 · VIP & PROTOCOL   (offset slabs archetype)
===================================================================== */
page({ notchTR: true, notchBL: 64, sil: 's4' });
title('VIP & Protocol');
const slab = (x, y, w, h, head, txt, o = {}) => {
  navyBox(x, y, w, h, 2);
  doc.font('PB').fontSize(13).fillColor('#FFFFFF').text(head, x + 18, y + 14, { characterSpacing: 0.6 });
  doc.moveTo(x + 18, y + 34).lineTo(x + 46, y + 34).lineWidth(1.4).strokeColor(GOLD).stroke();
  body(txt, x + 18, y + (o.ty || 44), w - 36, { size: o.size || 10.3, color: '#FFFFFF', lineGap: o.lineGap == null ? 2.8 : o.lineGap });
};
body('VIP guests receive discreet, respectful service. Protocol should feel effortless.',
  MX, 160, W - 2 * MX, { align: 'center', lineGap: 2.8 });
slab(42, 202, 258, 112, 'KNOW',
  'Confirm designated VIP areas and the approved arrival route before guests arrive.');
slab(120, 330, 258, 112, 'COORDINATE',
  'Work with the protocol officer. Avoid crowding VIPs, unnecessary attention or announcements.');
slab(66, 458, 312, 74, 'THE LINE',
  'Never independently change protocol arrangements. Act only when authorised.', { lineGap: 3.2 });

/* =====================================================================
   P14 · HANDLING DIFFICULT GUESTS   (CALM bars)
===================================================================== */
page({ notchTR: true, sil: 's6' });
title('Handling Difficult Guests');
body('The goal is not to win an argument. The goal is to protect dignity, safety and the guest experience.',
  MX, 160, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const calm = [
  ['C', 'CONTROL', 'your emotions'],
  ['A', 'ACKNOWLEDGE', 'the concern'],
  ['L', 'LISTEN', 'carefully'],
  ['M', 'MOVE IT', 'to the appropriate person'],
];
let cY = 210;
calm.forEach(([l, head, sub]) => {
  navyBox(60, cY, W - 120, 52, 3);
  doc.circle(92, cY + 26, 15).fill(GOLD);
  doc.font('PB').fontSize(17).fillColor(NAVY).text(l, 77, cY + 17, { width: 30, align: 'center' });
  doc.font('PM').fontSize(12).fillColor('#FFFFFF').text(head, 120, cY + 11, { characterSpacing: 1 });
  doc.font('JB').fontSize(10.6).fillColor(INKSOFT).text(sub, 120, cY + 30);
  cY += 64;
});
body('Never argue, insult, threaten or physically confront a guest, and never escalate an argument.',
  MX, cY + 2, W - 2 * MX, { align: 'center', size: 10, font: 'JI', lineGap: 2.6 });
goldQuoteChip('I understand your concern. Let me get the event coordinator to assist you.', MX, cY + 42, W - 2 * MX, { size: 10.6 });

/* =====================================================================
   P15 · CROWD MANAGEMENT   (slabs)
===================================================================== */
page({ notchTR: true, sil: 's9' });
title('Crowd Management');
body('Ushers support safe, smooth movement. Ushers are not security officers.',
  MX, 160, W - 2 * MX, { align: 'center', lineGap: 2.8 });
navyBox(42, 200, 260, 192, 2);
doc.font('PB').fontSize(13).fillColor('#FFFFFF').text('YOUR ROLE', 60, 214, { characterSpacing: 0.6 });
doc.moveTo(60, 234).lineTo(88, 234).lineWidth(1.4).strokeColor(GOLD).stroke();
let ry = 248;
['Guide guest movement', 'Prevent unnecessary congestion', 'Keep entrances and pathways clear',
 'Direct guests consistently', 'Alert security early'].forEach(t => {
  ry = bulletDot(t, 60, ry, 224, { size: 10.3, color: '#FFFFFF', dotColor: '#FFFFFF' }) + 7;
});
navyBox(118, 408, 260, 128, 2);
doc.font('PB').fontSize(13).fillColor('#FFFFFF').text('THE LINE', 136, 422, { characterSpacing: 0.6 });
doc.moveTo(136, 442).lineTo(164, 442).lineWidth(1.4).strokeColor(GOLD).stroke();
body('Do not physically confront a guest or attempt security interventions. Notify security immediately with the exact location and a brief description.',
  136, 454, 224, { size: 10.3, color: '#FFFFFF', lineGap: 3.2 });

/* =====================================================================
   P16 · EMERGENCY RESPONSE   (photo column archetype)
===================================================================== */
page({ notchTR: true, sil: 's1' });
title('Emergency Response');
imgCover('lynton 3.jpg', 0, 150, 150, 386, 'center', 'center');
doc.rect(146, 150, 4, 386).fill('#FFFFFF');
body('Know before you need to know:', 176, 172, 216, { font: 'JS', size: 10.6 });
let ey16 = 196;
[
  'Emergency exits', 'Assembly point', 'First aid location',
  'Security personnel', 'Event coordinator', 'Communication channel',
].forEach(t => { ey16 = bulletDot(t, 176, ey16, 200, { size: 10 }) + 3.5; });
doc.moveTo(176, ey16 + 8).lineTo(392, ey16 + 8).lineWidth(0.8).strokeColor('#D9DEE8').stroke();
body('In an emergency:', 176, ey16 + 22, 216, { font: 'JS', size: 10.6 });
let cy16 = ey16 + 44;
['Stay calm', 'Alert the responsible team', 'Guide the guests', 'Avoid panic', 'Follow the emergency plan'].forEach((t, i) => {
  navyBox(176, cy16, 196, 24, 3);
  doc.font('JM').fontSize(9.8).fillColor('#FFFFFF').text((i + 1) + '.   ' + t, 188, cy16 + 6.5);
  if (i < 4) downArrow(206, cy16 + 26, '#9DB1D4');
  cy16 += 35;
});

/* =====================================================================
   P17 · TEAMWORK & COMMUNICATION   (bars archetype)
===================================================================== */
page({ notchTR: true, sil: 's8' });
title('Teamwork & Communication');
body('Ushers work as one team. Radio and phone communication should always be:',
  MX, 162, W - 2 * MX, { align: 'center', lineGap: 2.8 });
let tY = 206;
['SHORT', 'CLEAR', 'PROFESSIONAL', 'RELEVANT'].forEach((b, i) => {
  navyBox(60, tY, W - 120, 40, 3);
  doc.font('PM').fontSize(12.5).fillColor('#FFFFFF')
    .text(b, 60, tY + 12, { width: W - 120, align: 'center', characterSpacing: 2 });
  if (i < 3) downArrow(W / 2, tY + 43);
  tY += 58;
});
doc.font('JI').fontSize(10.6).fillColor('#5E6A85').text('“There is something happening over there, maybe you should come.”',
  MX, tY + 8, { width: W - 2 * MX, align: 'center', lineGap: 2 });
doc.font('JM').fontSize(10.6).fillColor(NAVY).text('Instead, say:', MX, tY + 54, { width: W - 2 * MX, align: 'center' });
goldQuoteChip('Coordinator, assistance required at the main entrance.', MX, tY + 72, W - 2 * MX);

/* =====================================================================
   P18 · WHAT USHERS SHOULD NOT DO   (two columns)
===================================================================== */
page({ notchTR: true, sil: 's7' });
title('What Ushers Should Not Do');
body('The actions you avoid are as important as the actions you take.',
  MX, 162, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const xMark = (x, y) => {
  doc.save();
  doc.lineWidth(1.7).lineCap('round').strokeColor(GOLD);
  doc.moveTo(x, y + 2).lineTo(x + 7, y + 9).stroke();
  doc.moveTo(x + 7, y + 2).lineTo(x, y + 9).stroke();
  doc.restore();
};
const dont = [
  'Leave your post without informing the team leader',
  'Use your phone unnecessarily',
  'Eat while attending to guests',
  'Sit in guest areas while on duty',
  'Take photos with guests without permission',
  'Argue with guests',
  'Share confidential event information',
  'Drink alcohol while on duty',
  'Give unauthorised instructions',
  'Abandon your station',
];
dont.forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 58 + col * 168, y = 216 + row * 56;
  xMark(x, y + 2);
  body(t, x + 15, y, 148, { size: 10.6, lineGap: 2.2 });
});
goldQuoteChip('Protect the standard. Protect the experience.', MX, 514, W - 2 * MX);

/* =====================================================================
   P19 · PRACTICAL TRAINING ACTIVITIES   (navy boxes archetype)
===================================================================== */
page({ notchTR: true, sil: 's1' });
title('Practical Training Activities');
body('Keep the session hands on. Run short simulations, rotate roles and debrief what worked and what should change.',
  MX, 162, W - 2 * MX, { align: 'center', lineGap: 3 });
const drill = (x, y, w, h, rows) => {
  navyBox(x, y, w, h, 3);
  let yy = y + 20;
  rows.forEach(([n, head, sub]) => {
    doc.font('PB').fontSize(8.6).fillColor(GOLD).text(n, x + 18, yy, { characterSpacing: 1 });
    doc.font('PM').fontSize(11).fillColor('#FFFFFF').text(head, x + 18, yy + 13, { width: w - 36 });
    doc.font('JB').fontSize(9.2).fillColor(INKSOFT).text(sub, x + 18, yy + 29, { width: w - 34, lineGap: 2 });
    yy += 62;
  });
};
drill(42, 226, 163, 208, [
  ['01', 'THE WELCOME', 'Greeting, eye contact, directions, assistance.'],
  ['02', 'DIFFICULT GUEST', 'Listen, stay calm, resolve or escalate.'],
  ['03', 'VIP ARRIVAL', 'Coordinate discreetly with protocol.'],
]);
drill(215, 226, 163, 146, [
  ['04', 'LOST GUEST', 'Clarify the need, then guide professionally.'],
  ['05', 'ENTRY CONGESTION', 'Communicate, open the flow, escalate risk early.'],
]);
goldQuoteChip('Practice the moment before it happens.', MX, 472, W - 2 * MX);

/* =====================================================================
   P20 · FINAL TEAM BRIEFING   (+ golden rule slab)
===================================================================== */
page({ notchTR: true, sil: 's3' });
title('Final Team Briefing');
body('No usher takes a station without clear answers to these essentials:',
  MX, 162, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const brief = [
  ['WHO', 'is the team leader?'],
  ['WHERE', 'are you stationed?'],
  ['WHAT', 'is your specific responsibility?'],
  ['WHEN', 'do you report?'],
  ['WHO', 'do you report to?'],
  ['HOW', 'will the team communicate?'],
  ['WHAT', 'should you do in an emergency?'],
];
brief.forEach(([k, q], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = MX + col * 171, y = 212 + row * 52;
  doc.font('PB').fontSize(10.2).fillColor(GOLD).text(k, x, y, { characterSpacing: 0.8 });
  doc.font('JB').fontSize(10.2).fillColor(NAVY).text(q, x, y + 15, { width: 165 });
});
doc.font('PB').fontSize(10.2).fillColor(GOLD).text('THE GOLDEN RULE', MX, 426, { characterSpacing: 0.8 });
navyBox(MX, 448, W - 2 * MX, 54, 3);
(function goldenRule() {
  doc.font('PB').fontSize(12.5);
  const parts = ['SEE IT', 'ASSESS IT', 'ASSIST OR REPORT IT'];
  const gap = 26;
  const widths = parts.map(p => doc.widthOfString(p, { characterSpacing: 0.4 }));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (parts.length - 1);
  let x = (W - total) / 2; const y = 467.5;
  doc.fillColor('#FFFFFF');
  parts.forEach((p, i) => {
    doc.text(p, x, y, { characterSpacing: 0.4 });
    x += widths[i];
    if (i < parts.length - 1) { arrowR(x + gap / 2, y + 6.5, '#FFFFFF'); x += gap; }
  });
})();

/* =====================================================================
   P21 · THE USHER'S PLEDGE
===================================================================== */
page({ notchTR: true, notchBL: 72, sil: 's6', footerY: 560 });
title('The Usher’s Pledge');
navyBox(56, 176, W - 112, 244, 4);
doc.image('assets/emblem.png', W / 2 - 22, 198, { width: 44 });
doc.font('JI').fontSize(12).fillColor('#FFFFFF')
  .text('I will represent every event with\nprofessionalism, respect and integrity.\nI will welcome guests warmly, communicate\nclearly, work as part of a team, follow\ninstructions and remain calm under pressure.\nI understand that every guest interaction\ncontributes to the overall event experience.',
    90, 250, W - 180, { align: 'center', lineGap: 6 });
const sigY = 474;
doc.moveTo(66, sigY).lineTo(190, sigY).lineWidth(0.8).strokeColor(NAVY).stroke();
doc.font('JB').fontSize(8.6).fillColor(NAVY).text('NAME & SIGNATURE', 66, sigY + 6, { characterSpacing: 0.8 });
doc.moveTo(230, sigY).lineTo(354, sigY).lineWidth(0.8).strokeColor(NAVY).stroke();
doc.font('JB').fontSize(8.6).fillColor(NAVY).text('DATE', 230, sigY + 6, { characterSpacing: 0.8 });
doc.font('JM').fontSize(10.2).fillColor(NAVY)
  .text('Lynton Events  |  We Make It Happen', 66, 508, { width: W - 132, align: 'center' });

/* =====================================================================
   P22 · BACK COVER   (mirrors reference back page + peak band)
===================================================================== */
page({ chrome: false });
doc.rect(0, 0, W, H).fill(LIGHT);
poly([W, 60, W, 460, W - 250, 460], GHOST);
logoBlock(); dotsR(350, 55);
title('Let’s Make It Happen', 126);
body('Lynton Events trains and deploys professional ushering and coordination teams for events of every size.',
  MX, 190, W - 2 * MX, { align: 'center', lineGap: 3.6 });
doc.image('assets/wordmark-gold.png', W / 2 - 61, 258, { width: 122 });
// contact box (bleeds off the left edge like the reference)
navyBox(0, 344, 252, 156, 0);
cRow2('phone', '+254 729 474 546', 366);
cRow2('mail', 'lyntoneventske@gmail.com', 394);
cRow2('globe', 'www.lyntonevents.com', 422);
doc.moveTo(40, 446).lineTo(230, 446).lineWidth(0.6).strokeColor('#4A5678').stroke();
doc.font('JB').fontSize(8.6).fillColor(INKSOFT)
  .text('EVENTS MC  ·  PLANNING  ·  TEAM BUILDING\nCORPORATE & SPECIAL EVENTS', 24, 456, { width: 212, align: 'center', lineGap: 4 });
body('facebook.com/lyntoneventske\ninstagram.com/emceelynton\nKericho, Kenya', 264, 366, 140, { size: 9.6, lineGap: 5 });
function cRow2(iconK, txt, y) {
  icon(iconK, 52, y + 6, 7.5, '#FFFFFF', NAVY);
  doc.font('JB').fontSize(11.2).fillColor('#FFFFFF').text(txt, 66, y, { width: 172 });
}
// chevron peak band (reference motif)
const yB = H;
poly([-14, yB, 58, yB - 100, 132, yB], SLATE);
poly([-26, yB, 48, yB - 88, 122, yB], NAVY);
poly([96, yB, 192, yB - 72, 288, yB], '#FFFFFF');
poly([262, yB, 330, yB - 100, 398, yB], SLATE);
poly([250, yB, 318, yB - 88, 386, yB], NAVY);
poly([376, yB, 424, yB - 66, 452, yB], SLATE);

doc.end();
console.log('Wrote', OUT);
