/**
 * LYNTON EVENTS — Ushers Training & Briefing Handbook
 * Visual standard: "company profile.pdf" (A5 corporate profile)
 *   navy #162B57 · slate #7F96BF / #707C9B · light #F5F5F5
 *   Poppins Bold headings · Futura-style body (Jost)
 *   corner chevron notches · footer URL · logo top-left · 3-dot motif
 * Run: node generate-ushers-handbook.js
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Lynton_Events_Ushers_Training_Handbook.pdf');
const doc = new PDFDocument({
  size: [419.53, 595.28], // exact A5 size of the company profile
  margin: 0,
  autoFirstPage: false,
  info: {
    Title: 'Lynton Events — Ushers Training & Briefing Handbook',
    Author: 'Lynton Events · We Make It Happen',
    Subject: 'Professional usher training for the event of Saturday, 26 September 2026 — Sigowet',
  },
});
doc.pipe(fs.createWriteStream(OUT));

/* ---------- fonts ---------- */
doc.registerFont('PB', 'fonts/Poppins-Bold.ttf');
doc.registerFont('PM', 'fonts/Poppins-Medium.ttf');
doc.registerFont('PR', 'fonts/Poppins-Regular.ttf');
doc.registerFont('JB', 'fonts/Jost-Book.ttf');
doc.registerFont('JI', 'fonts/Jost-BookItalic.ttf');
doc.registerFont('JM', 'fonts/Jost-Medium.ttf');
doc.registerFont('JS', 'fonts/Jost-Semi.ttf');

/* ---------- palette ---------- */
const NAVY = '#162B57';
const BLUE = '#7F96BF';
const SLATE = '#707C9B';
const LIGHT = '#F5F5F5';
const GHOST = '#E9EDF4';
const GOLD = '#C9A13B';
const WHITE = '#FFFFFF';
const INKSOFT = '#C8D0E2';

/* ---------- page geometry ---------- */
const W = 419.53, H = 595.28, MX = 42;

/* ---------- helpers ---------- */
function poly(pts, color) {
  doc.save();
  doc.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) doc.lineTo(pts[i], pts[i + 1]);
  doc.closePath().fill(color);
  doc.restore();
}

/** corner chevron notch: slate band, white stripe, navy body */
function notch(corner = 'TR', s = 86) {
  const g = s + 22, st = s + 11;
  const C = {
    TR: { x: W, y: 0, sx: -1, sy: 1 },
    BR: { x: W, y: H, sx: -1, sy: -1 },
    BL: { x: 0, y: H, sx: 1, sy: -1 },
    TL: { x: 0, y: 0, sx: 1, sy: 1 },
  }[corner];
  const tri = d => [C.x, C.y, C.x + C.sx * d, C.y, C.x, C.y + C.sy * d];
  poly(tri(g), SLATE);
  poly(tri(st), WHITE);
  poly(tri(s), NAVY);
}

/** light diagonal watermark behind content */
function ghost(side = 'R') {
  if (side === 'R') poly([W, 60, W, 460, W - 250, 460], GHOST);
  else poly([0, H - 60, 0, H - 460, 250, H - 460], GHOST);
}

function dotsR(x = 350, y = 52, color = NAVY) {
  [x, x + 11.5, x + 23].forEach(cx => doc.circle(cx, y, 2.4).fill(color));
}

/** logo tile + wordmark (company-profile header echo) */
function logoBlock(x = MX, y = 42, dark = false, word = true) {
  doc.save().roundedRect(x, y, 26, 26, 3).fill(NAVY).restore();
  doc.image('assets/emblem.png', x + 4.1, y + 7.0, { width: 17.8 });
  if (word) doc.font('PM').fontSize(10.5).fillColor(dark ? WHITE : NAVY)
    .text('Lynton\nEvents', x + 34, y + 2.2, { lineGap: 1.6 });
}

function footer(y = 570) {
  doc.font('JB').fontSize(10.2).fillColor(NAVY)
    .text('www.lyntonevents.com', MX, y, { width: W - 2 * MX, align: 'center' });
}

/** fresh light page with standard chrome */
function page(opts = {}) {
  doc.addPage({ size: [W, H], margin: 0 });
  doc.rect(0, 0, W, H).fill(LIGHT);
  if (opts.ghost !== false) ghost(opts.ghostSide || 'R');
  if (opts.notchTR) notch('TR', opts.notchTR === true ? 78 : opts.notchTR);
  if (opts.notchBL) notch('BL', opts.notchBL === true ? 90 : opts.notchBL);
  if (opts.notchBR) notch('BR', opts.notchBR === true ? 80 : opts.notchBR);
  if (opts.chrome !== false) {
    if (opts.dots) dotsR();
    logoBlock();
    footer(opts.footerY);
  }
}

function title(t, y = 112) {
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

/** vector icons in a circle (r=7.5) */
function icon(kind, cx, cy, r = 7.5, circleColor = NAVY, glyphColor = WHITE) {
  doc.save();
  doc.circle(cx, cy, r).fill(circleColor);
  doc.lineWidth(1.15).lineCap('round').lineJoin('round').strokeColor(glyphColor);
  if (kind === 'phone') {
    doc.moveTo(cx - 2.6, cy + 3.2)
      .bezierCurveTo(cx - 4.8, cy + 0.6, cx - 4.8, cy - 3.4, cx - 2.4, cy - 3.4)
      .bezierCurveTo(cx - 0.6, cy - 3.4, cx + 0.4, cy - 1.8, cx + 1.4, cy - 1.0)
      .bezierCurveTo(cx + 2.4, cy - 0.2, cx + 2.8, cy + 1.2, cx + 2.6, cy + 2.0)
      .bezierCurveTo(cx + 2.2, cy + 3.8, cx - 0.6, cy + 4.2, cx - 2.6, cy + 3.2)
      .stroke();
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
  const tx = o.x == null ? 90 : o.x, tw = o.w == null ? 264 : o.w;
  icon(kind, o.iconX == null ? 369 : o.iconX, cy, 7.5, o.circle || NAVY, o.glyph || WHITE);
  doc.font('JB').fontSize(o.size || 10.4).fillColor(o.color || NAVY)
    .text(text, tx, baselineY, { width: tw, align: o.align || 'right' });
}

function goldQuote(t, x, y, w, o = {}) {
  return body('“' + t + '”', x, y, w, { font: 'JI', size: o.size || 11.5, color: o.color || NAVY, align: o.align || 'center', lineGap: o.lineGap == null ? 3 : o.lineGap });
}

function downArrow(cx, y, color = NAVY) {
  doc.save();
  doc.rect(cx - 1.6, y, 3.2, 10).fill(color);
  poly([cx - 5, y + 10, cx + 5, y + 10, cx, y + 17], color);
  doc.restore();
}

/** right-pointing vector arrow (fonts have no → glyph) */
function arrowR(cx, cy, color = WHITE) {
  doc.save();
  doc.lineWidth(1.7).lineCap('round').strokeColor(color);
  doc.moveTo(cx - 6, cy).lineTo(cx + 4.5, cy).stroke();
  poly([cx + 4, cy - 3.6, cx + 9, cy, cx + 4, cy + 3.6], color);
  doc.restore();
}

/** image scaled to fill w×h and clipped exactly to that rect */
function imgCover(img, x, y, w, h, align = 'center', valign = 'center') {
  doc.save();
  doc.rect(x, y, w, h).clip();
  doc.image(img, x, y, { cover: [w, h], align, valign });
  doc.restore();
}

function photoClip(img, clipPts, fitW, fitH) {
  doc.save();
  doc.moveTo(clipPts[0], clipPts[1]);
  for (let i = 2; i < clipPts.length; i += 2) doc.lineTo(clipPts[i], clipPts[i + 1]);
  doc.closePath().clip();
  doc.image(img, 0, 0, { cover: [fitW, fitH], align: 'center', valign: 'center' });
  doc.restore();
}

/* =====================================================================
   P1 — COVER
===================================================================== */
page({ chrome: false, ghost: false });
doc.rect(0, 0, W, H).fill(LIGHT);
poly([W, 0, W, 300, W - 190, 0], GHOST);            // light diagonal, top right
photoClip('lynton 4.jpg', [0, 0, 248, 0, 248, 384, 132, 470, 0, 470], 248, 470);
poly([0, 470, 132, 470, 248, 384, 248, 424, 0, 506], SLATE);   // slate band
poly([0, 516, 248, 428, 248, 439, 0, 525], WHITE);             // white stripe
poly([0, 535, 248, 445, W, 548, W, H, 0, H], NAVY);            // navy base
logoBlock(28, 30, true, false);                                  // tile only (photo busy)
dotsR(352, 40);
// navy title slab
navyBox(112, 96, W - 112, 172, 0);
doc.font('PB').fontSize(27).fillColor(WHITE)
  .text('USHERS\nTRAINING &\nBRIEFING', 112, 116, { width: W - 112, align: 'center', lineGap: 3.5 });
doc.font('PM').fontSize(8.6).fillColor('#E4C775')
  .text('LYNTON EVENTS · TRAINING SERIES', 112, 234, { width: W - 112, align: 'center', characterSpacing: 1.6 });
// year + event line + contacts (right light column)
doc.font('PB').fontSize(23).fillColor(NAVY).text('2026', 250, 278, { width: 127, align: 'right' });
doc.moveTo(324, 312).lineTo(377, 312).lineWidth(1.4).strokeColor(GOLD).stroke();
doc.font('JM').fontSize(8.8).fillColor(NAVY)
  .text('SATURDAY, 26 SEPTEMBER', 217, 322, { width: 160, align: 'right', characterSpacing: 0.4 })
  .text('SIGOWET', 217, 335, { width: 160, align: 'right', characterSpacing: 2.2 });
contactRow('phone', '+254 729 474 546', 356, { x: 217, w: 141, size: 10.4, iconX: 373 });
contactRow('mail', 'lyntoneventske@gmail.com', 382, { x: 217, w: 141, size: 9.2, iconX: 373 });
contactRow('globe', 'www.lyntonevents.com', 408, { x: 217, w: 141, size: 10.4, iconX: 373 });

/* =====================================================================
   P2 — "WELCOME TO THE TEAM"   (Hi There! archetype)
===================================================================== */
page({ notchTR: true, notchBL: 96, dots: true, footerY: 520 });
title('Welcome To The Team!');
body('An usher is often the first human connection a guest has with the event. Your presence, preparation and attitude set the tone for everything that follows.',
  66, 158, W - 132, { size: 11.3, align: 'center', lineGap: 3 });
navyBox(66, 218, W - 132, 172, 4);
body('By the end of this training you will know how to receive and guide guests, communicate with courtesy, manage seating and crowds, handle protocol and VIPs, work as one team and stay calm when plans change.',
  95, 246, 230, { size: 11.3, color: WHITE, lineGap: 4 });
doc.font('JI').fontSize(11.3).fillColor(WHITE)
  .text('Remember: “Your attitude is part of the event experience.”', 95, 350, { width: 230, lineGap: 4 });
goldQuote('One team. One standard. One experience.', 66, 430, W - 132, { color: GOLD, size: 12 });

/* =====================================================================
   P3 — TABLE OF CONTENTS
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('Table Of Contents', 126);
const tocBox = (x, y, w, h, items) => {
  navyBox(x, y, w, h, 3);
  let yy = y + 26;
  items.forEach(it => {
    doc.circle(x + 22, yy + 5, 1.8).fill(WHITE);
    doc.font('JB').fontSize(11.3).fillColor(WHITE).text(it, x + 32, yy, { width: w - 46 });
    yy += 23.5;
  });
};
tocBox(108, 158, 203, 166, [
  'Welcome To The Team',
  'Training Objective',
  'Who Is An Usher?',
  'Key Responsibilities',
  'The 5-Second Welcome',
  'Professional Communication',
]);
tocBox(109, 348, 203, 186, [
  'Dress Code & Presentation',
  'Seating & Guest Management',
  'VIP & Protocol',
  'Difficult Guests — CALM',
  'Crowd & Emergency Response',
  'Teamwork & Final Briefing',
  'The Usher’s Pledge',
]);

/* =====================================================================
   P4 — TRAINING OBJECTIVE   (About archetype)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('Training Objective');
body('This handbook prepares every usher for confident, professional service. By the end of the training, every usher should understand:',
  MX, 166, W - 2 * MX, { lineGap: 3.2 });
const objectives = [
  'Your roles and responsibilities',
  'Receiving & guiding guests',
  'Communication & etiquette',
  'Seating & crowd management',
  'Protocol & VIP handling',
  'Teamwork & coordination',
  'Handling difficult situations',
  'Dress code & conduct',
];
objectives.forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 172, 238 + row * 34, 166, { size: 10.6 });
});
doc.moveTo(MX, 392).lineTo(W - MX, 392).lineWidth(0.8).strokeColor('#D9DEE8').stroke();
body('Great ushers do more than point at chairs. They create order, warmth and confidence from the moment a guest arrives until the final debrief closes the day.',
  MX, 414, W - 2 * MX, { align: 'center', lineGap: 3.4, size: 11.3 });
goldQuote('Your attitude is part of the event experience.', MX, 478, W - 2 * MX, { color: GOLD });

/* =====================================================================
   P5 — WHO IS AN USHER?   (CEO-message archetype)
===================================================================== */
page({ notchTR: true, notchBL: 118, dots: true });
title('Who Is An Usher?');
body('An usher is the first point of contact between the event and the guest — the welcome people remember long after the day is over.',
  MX, 170, 205, { lineGap: 3.4 });
body('An usher should be:', MX, 268, 205, { font: 'JS', size: 10.8 });
let ty5 = 292;
['Welcoming', 'Alert', 'Professional', 'Helpful', 'Respectful', 'Approachable'].forEach(t => {
  ty5 = bulletDot(t, MX, ty5, 150, { size: 10.6 }) + 2.5;
});
doc.moveTo(262, 162).lineTo(392, 162).lineWidth(1.4).strokeColor(GOLD).stroke();
doc.moveTo(262, 166).lineTo(392, 166).lineWidth(0.6).strokeColor(GOLD).stroke();
imgCover('lynton 10.jpg', 262, 170, 130, 196, 'center', 'top');
navyBox(262, 366, 130, 24, 0);
doc.font('PM').fontSize(11).fillColor(WHITE).text('The Usher', 262, 372, { width: 130, align: 'center' });
body('Great ushers read the room. They notice confusion, congestion and special needs early — then they act, or they report. Calm eyes, warm words, clear directions:',
  172, 428, W - 172 - MX, { lineGap: 3.2, size: 11.3 });
goldQuote('See the person. Read the moment.', 172, 500, W - 172 - MX, { color: GOLD, size: 11.5 });

/* =====================================================================
   P6 — RESPONSIBILITIES: BEFORE   (Service-Company archetype)
===================================================================== */
page({ chrome: false, notchTR: true });
logoBlock(); dotsR(); footer();
imgCover('lynton 9.jpg', 0, 84, W, 150, 'center', 'center');
doc.rect(0, 230, W, 4).fill(WHITE);
navyBox(36, 252, 262, 44, 2);
doc.font('PB').fontSize(18.5).fillColor(WHITE).text('Responsibilities', 52, 264);
doc.font('PB').fontSize(18.5).fillColor(BLUE).text('—  Before', 52 + doc.widthOfString('Responsibilities  '), 264);
[
  'Arrive early', 'Attend the team briefing', 'Understand the venue layout',
  'Know entrances and exits', 'Know washrooms and key facilities',
  'Check seating arrangements', 'Identify VIP / protocol areas',
  'Confirm emergency procedures', 'Know where to direct each category of guests',
].forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 171, 330 + row * 32, 165, { size: 10.3 });
});
goldQuote('Preparation is the first service of the day.', MX, 502, W - 2 * MX, { color: GOLD });
notch('BR', 70);

/* =====================================================================
   P7 — RESPONSIBILITIES: DURING   (Service-Individual archetype)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
imgCover('lynton 3.jpg', 250, 84, W - 250, 138, 'center', 'top');
navyBox(36, 252, 262, 44, 2);
doc.font('PB').fontSize(18.5).fillColor(WHITE).text('Responsibilities', 52, 264);
doc.font('PB').fontSize(18.5).fillColor(BLUE).text('—  During', 52 + doc.widthOfString('Responsibilities  '), 264);
body('While the event runs, you are the visible, moving calm of the venue.',
  MX, 318, 205, { size: 11.3, lineGap: 3 });
[
  'Welcome guests warmly', 'Give clear directions', 'Assist with seating',
  'Manage movement around the venue', 'Help elderly guests, persons with disabilities and families',
  'Maintain order without being aggressive', 'Identify and report issues early',
  'Work with the coordinator and security team',
].forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 171, 392 + row * 42, 165, { size: 10.3 });
});

/* =====================================================================
   P8 — RESPONSIBILITIES: AFTER   (Project archetype)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('After The Event');
doc.save().rotate(-4, { origin: [110, 212] });
doc.rect(52, 164, 122, 96).fill(WHITE);
imgCover('lynton 6.jpg', 57, 169, 112, 86, 'center', 'center');
doc.restore();
doc.save().rotate(3, { origin: [150, 286] });
doc.rect(96, 238, 122, 90).fill(WHITE);
imgCover('lynton 1.jpg', 101, 243, 112, 80, 'center', 'center');
doc.restore();
navyBox(232, 176, 172, 62, 2);
doc.font('PB').fontSize(14.5).fillColor(WHITE).text('Guest Care ·', 247, 191);
doc.font('PB').fontSize(14.5).fillColor(BLUE).text('Close Well', 247, 211);
body('Service continues until the final debrief. Every usher should:', MX, 352, W - 2 * MX, { lineGap: 3 });
let ay = 398;
[
  'Assist guests as they exit',
  'Help with orderly movement out of the venue',
  'Report and hand in lost property or incidents',
  'Check your station one last time',
  'Participate in the final team debrief',
].forEach(t => { ay = bulletDot(t, MX, ay, W - 2 * MX, { size: 11.3 }) + 8; });

/* =====================================================================
   P9 — THE 5-SECOND WELCOME   (How We Work archetype)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('The 5-Second Welcome');
body('Every guest should feel acknowledged — quickly, naturally and respectfully.',
  MX, 158, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const bars = ['SMILE', 'MAKE EYE CONTACT', 'GREET', 'OFFER ASSISTANCE'];
let bY = 208;
bars.forEach((b, i) => {
  navyBox(60, bY, W - 120, 46, 3);
  doc.font('JM').fontSize(13.5).fillColor(WHITE)
    .text(b, 60, bY + 15, { width: W - 120, align: 'center', characterSpacing: 1.2 });
  if (i < bars.length - 1) downArrow(W / 2, bY + 50);
  bY += 74;
});
goldQuote('Good morning, welcome — how may I assist you?', MX, 508, W - 2 * MX, { color: GOLD, size: 11.5 });
body('Avoid pointing from a distance. Walk the guest, or give clear directions.',
  MX, 538, W - 2 * MX, { size: 9.8, align: 'center', font: 'JI' });

/* =====================================================================
   P10 — PROFESSIONAL COMMUNICATION   (Meet-Team archetype)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('Professional Communication');
// row 1 — USE
imgCover('lynton 8.jpg', 35, 152, 144, 118, 'center', 'center');
navyBox(35, 270, 144, 22, 0);
doc.font('PM').fontSize(10.5).fillColor(WHITE).text('Sound Like This', 35, 276, { width: 144, align: 'center' });
navyBox(193, 152, 191, 150, 0);
body('Words that build confidence:', 207, 164, 164, { font: 'JS', size: 10, color: GOLD });
let cy10 = 186;
['Please', 'Thank you', 'Welcome', 'Excuse me', 'Kindly', '“May I assist you?”'].forEach(t => {
  cy10 = bulletDot(t, 207, cy10, 162, { size: 10, color: WHITE, dotColor: WHITE }) + 2.5;
});
// row 2 — AVOID
imgCover('lynton 7.jpg', 35, 332, 144, 118, 'center', 'center');
navyBox(35, 450, 144, 22, 0);
doc.font('PM').fontSize(10.5).fillColor(WHITE).text('Never Like This', 35, 456, { width: 144, align: 'center' });
navyBox(193, 332, 191, 162, 0);
doc.font('JI').fontSize(10.2).fillColor('#B9C4DB').text('“I don’t know.”', 207, 344, { width: 166 });
doc.font('JB').fontSize(10.2).fillColor(WHITE).text('Say: “Let me confirm that for you.”', 207, 360, { width: 166, lineGap: 2 });
doc.font('JI').fontSize(10.2).fillColor('#B9C4DB').text('“That’s not my job.”', 207, 398, { width: 166 });
doc.font('JB').fontSize(10.2).fillColor(WHITE).text('Say: “Let me connect you with the right person.”', 207, 414, { width: 166, lineGap: 2 });
doc.font('JI').fontSize(10.2).fillColor('#B9C4DB').text('No arguing · no shouting\nno slang · no negativity.', 207, 458, { width: 166, lineGap: 2.5 });

/* =====================================================================
   P11 — DRESS CODE & PRESENTATION   (About archetype)
===================================================================== */
page({ notchTR: true, dots: true });
title('Dress Code & Presentation');
body('Ushers should appear smart, clean and coordinated at all times.',
  MX, 166, W - 2 * MX, { align: 'center', lineGap: 3 });
let py11 = 228;
[
  'Clean and neat outfit',
  'Appropriate, comfortable shoes',
  'Well-groomed hair',
  'Minimal accessories',
  'Fresh breath and good hygiene',
  'Name tag or identification where provided',
  'Phone kept away while on duty',
].forEach(t => { py11 = checkRow(t, 74, py11, W - 148, { size: 11.6 }) + 11.5; });
goldQuote('You are part of the event’s image.', 74, py11 + 14, W - 148, { color: GOLD, size: 12.5 });
notch('BR', 88);

/* =====================================================================
   P12 — SEATING & GUEST MANAGEMENT   (About archetype, 2-col)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('Seating & Guest Management');
body('Every usher should know:', MX, 160, W - 2 * MX, { font: 'JS', size: 11 });
[
  'General seating areas', 'Reserved / VIP seating', 'Family or special seating',
  'Staff areas', 'Restricted areas', 'Emergency exits',
].forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  bulletDot(t, MX + col * 171, 184 + row * 30, 165, { size: 10.6 });
});
doc.moveTo(MX, 290).lineTo(W - MX, 290).lineWidth(0.8).strokeColor('#D9DEE8').stroke();
body('When directing guests:', MX, 310, W - 2 * MX, { font: 'JS', size: 11 });
let sy12b = 336;
[
  'Face the direction of travel',
  'Give calm, clear instructions',
  'Walk the guest whenever possible',
  'Keep pathways open and unblocked',
  'Never give conflicting instructions — confirm first',
].forEach(t => { sy12b = bulletDot(t, MX, sy12b, W - 2 * MX, { size: 11.3 }) + 8; });
goldQuote('Kindly proceed this way — I will show you your seating area.', MX, 524, W - 2 * MX, { color: GOLD, size: 11 });

/* =====================================================================
   P13 — VIP & PROTOCOL   (How-It-Works archetype: offset slabs)
===================================================================== */
page({ notchTR: true, notchBL: 72, dots: true, ghost: false });
title('VIP & Protocol');
const slab = (x, y, w, h, head, txt, o = {}) => {
  navyBox(x, y, w, h, 2);
  doc.font('PB').fontSize(13).fillColor(WHITE).text(head, x + 18, y + 14, { characterSpacing: 0.6 });
  doc.moveTo(x + 18, y + 34).lineTo(x + 46, y + 34).lineWidth(1.4).strokeColor(GOLD).stroke();
  body(txt, x + 18, y + (o.ty || 44), w - 36, { size: o.size || 10.3, color: WHITE, lineGap: o.lineGap == null ? 2.6 : o.lineGap });
};
body('VIP guests are handled discreetly and respectfully — protocol should feel effortless.',
  MX, 158, W - 2 * MX, { align: 'center', lineGap: 2.8 });
slab(42, 200, 258, 116, 'KNOW',
  'Confirm designated VIP areas and the approved arrival route before guests arrive.');
slab(120, 330, 258, 116, 'COORDINATE',
  'Work with the protocol officer. Avoid crowding VIPs, unnecessary attention or announcements.');
slab(66, 460, 312, 74, 'THE LINE',
  'Never independently change protocol arrangements — act only when authorised.', { lineGap: 3.2 });

/* =====================================================================
   P14 — HANDLING DIFFICULT GUESTS   (CALM bars)
===================================================================== */
page({ notchTR: true, notchBL: 96, dots: true });
title('Handling Difficult Guests');
body('The goal is not to win an argument — it is to protect dignity, safety and the guest experience.',
  MX, 158, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const calm = [
  ['C', 'CONTROL', 'your emotions'],
  ['A', 'ACKNOWLEDGE', 'the concern'],
  ['L', 'LISTEN', 'carefully'],
  ['M', 'MOVE IT', 'to the appropriate person'],
];
let cY = 208;
calm.forEach(([l, head, sub]) => {
  navyBox(60, cY, W - 120, 52, 3);
  doc.circle(92, cY + 26, 15).fill(GOLD);
  doc.font('PB').fontSize(17).fillColor(NAVY).text(l, 77, cY + 17, { width: 30, align: 'center' });
  doc.font('JM').fontSize(12).fillColor(WHITE).text(head, 120, cY + 12, { characterSpacing: 1 });
  doc.font('JB').fontSize(10.6).fillColor(INKSOFT).text(sub, 120, cY + 29);
  cY += 64;
});
body('Never argue, insult, threaten or physically confront a guest — and never escalate an argument.',
  MX, cY + 2, W - 2 * MX, { align: 'center', size: 10, font: 'JI', lineGap: 2.6 });
doc.font('JI').fontSize(10.8).fillColor(GOLD)
  .text('“I understand your concern —\nlet me get the event coordinator to assist you.”', MX, 516, { width: W - 2 * MX, align: 'center', lineGap: 2.5 });

/* =====================================================================
   P15 — CROWD MANAGEMENT   (slabs)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true, ghost: false });
title('Crowd Management');
body('Ushers support safe, smooth movement. Ushers are not security officers.',
  MX, 158, W - 2 * MX, { align: 'center', lineGap: 2.8 });
navyBox(42, 198, 260, 196, 2);
doc.font('PB').fontSize(13).fillColor(WHITE).text('YOUR ROLE', 60, 212, { characterSpacing: 0.6 });
doc.moveTo(60, 232).lineTo(88, 232).lineWidth(1.4).strokeColor(GOLD).stroke();
let ry = 244;
['Guide guest movement', 'Prevent unnecessary congestion', 'Keep entrances and pathways clear',
 'Direct guests consistently', 'Alert security early'].forEach(t => {
  ry = bulletDot(t, 60, ry, 224, { size: 10.3, color: WHITE, dotColor: WHITE }) + 6;
});
navyBox(118, 410, 260, 128, 2);
doc.font('PB').fontSize(13).fillColor(WHITE).text('THE LINE', 136, 424, { characterSpacing: 0.6 });
doc.moveTo(136, 444).lineTo(164, 444).lineWidth(1.4).strokeColor(GOLD).stroke();
body('Do not physically confront a guest or attempt security interventions. Notify security immediately — give the exact location and a brief description.',
  136, 456, 224, { size: 10.3, color: WHITE, lineGap: 3.4 });

/* =====================================================================
   P16 — EMERGENCY RESPONSE   (Values archetype: photo left column)
===================================================================== */
page({ notchTR: true, notchBL: 80, dots: true });
title('Emergency Response');
imgCover('lynton2.jpg', 0, 150, 150, 386, 'center', 'center');
doc.rect(146, 150, 4, 386).fill(WHITE);
body('Know before you need to know:', 176, 166, 216, { font: 'JS', size: 10.6 });
let ey16 = 190;
[
  'Emergency exits', 'Assembly point', 'First-aid location',
  'Security personnel', 'Event coordinator', 'Communication channel',
].forEach(t => { ey16 = bulletDot(t, 176, ey16, 200, { size: 10 }) + 3; });
doc.moveTo(176, ey16 + 8).lineTo(392, ey16 + 8).lineWidth(0.8).strokeColor('#D9DEE8').stroke();
body('In an emergency:', 176, ey16 + 22, 216, { font: 'JS', size: 10.6 });
let cy16 = ey16 + 44;
['Stay calm', 'Alert the responsible team', 'Guide the guests', 'Avoid panic', 'Follow the emergency plan'].forEach((t, i) => {
  navyBox(176, cy16, 196, 24, 3);
  doc.font('JM').fontSize(9.8).fillColor(WHITE).text((i + 1) + '.   ' + t, 188, cy16 + 6.5);
  if (i < 4) downArrow(206, cy16 + 26, '#9DB1D4');
  cy16 += 35;
});

/* =====================================================================
   P17 — TEAMWORK & RADIO COMMS   (How We Work bars)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('Teamwork & Communication');
body('Ushers work as one team. Radio and phone communication should always be:',
  MX, 158, W - 2 * MX, { align: 'center', lineGap: 2.8 });
let tY = 202;
['SHORT', 'CLEAR', 'PROFESSIONAL', 'RELEVANT'].forEach((b, i) => {
  navyBox(60, tY, W - 120, 40, 3);
  doc.font('JM').fontSize(12.5).fillColor(WHITE)
    .text(b, 60, tY + 12.5, { width: W - 120, align: 'center', characterSpacing: 2 });
  if (i < 3) downArrow(W / 2, tY + 43);
  tY += 58;
});
doc.font('JI').fontSize(10.6).fillColor('#5E6A85').text('“There is something happening over there, maybe you should come.”',
  MX, tY + 8, { width: W - 2 * MX, align: 'center', lineGap: 2 });
doc.font('JM').fontSize(10.6).fillColor(NAVY).text('Instead, say:', MX, tY + 54, { width: W - 2 * MX, align: 'center' });
goldQuote('Coordinator, assistance required at the main entrance.', MX, tY + 72, W - 2 * MX, { color: GOLD, size: 11.5 });

/* =====================================================================
   P18 — WHAT USHERS SHOULD NOT DO   (2 columns)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('What Ushers Should Not Do');
body('The actions you avoid are as important as the actions you take.',
  MX, 160, W - 2 * MX, { align: 'center', lineGap: 2.8 });
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
  const x = 58 + col * 168, y = 214 + row * 58;
  xMark(x, y + 2);
  body(t, x + 15, y, 148, { size: 10.6, lineGap: 2.2 });
});
goldQuote('Protect the standard — protect the experience.', MX, 516, W - 2 * MX, { color: GOLD });

/* =====================================================================
   P19 — PRACTICAL DRILLS   (navy boxes archetype)
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true });
title('Practical Training Activities');
body('Keep the session hands-on. Run short simulations, rotate roles and debrief what worked — and what should change.',
  MX, 158, W - 2 * MX, { align: 'center', lineGap: 3 });
const drill = (x, y, w, h, rows) => {
  navyBox(x, y, w, h, 3);
  let yy = y + 20;
  rows.forEach(([n, head, sub]) => {
    doc.font('PB').fontSize(8.6).fillColor(GOLD).text(n, x + 18, yy, { characterSpacing: 1 });
    doc.font('PM').fontSize(11).fillColor(WHITE).text(head, x + 18, yy + 13, { width: w - 36 });
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
goldQuote('Practice the moment before it happens.', MX, 470, W - 2 * MX, { color: GOLD });

/* =====================================================================
   P20 — FINAL TEAM BRIEFING   (+ golden rule slab, drawn arrows)
===================================================================== */
page({ notchTR: true, notchBL: 96, dots: true });
title('Final Team Briefing');
body('No usher takes a station without clear answers to these essentials:',
  MX, 160, W - 2 * MX, { align: 'center', lineGap: 2.8 });
const brief = [
  ['WHO', 'is the team leader?'],
  ['WHERE', 'are you stationed?'],
  ['WHAT', 'is your specific responsibility?'],
  ['WHEN', 'do you report?'],
  ['WHO', 'do you report to?'],
  ['HOW', 'will the team communicate?'],
  ['WHAT', 'should you do in an emergency?'],
  ['GOLD', 'rule: see it · assess it · assist or report it'],
];
brief.slice(0, 7).forEach(([k, q], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = MX + col * 171, y = 212 + row * 52;
  doc.font('PB').fontSize(10.2).fillColor(GOLD).text(k, x, y, { characterSpacing: 0.8 });
  doc.font('JB').fontSize(10.2).fillColor(NAVY).text(q, x, y + 15, { width: 165 });
});
doc.font('PB').fontSize(10.2).fillColor(GOLD).text('THE GOLDEN RULE', MX, 428, { characterSpacing: 0.8 });
navyBox(MX, 450, W - 2 * MX, 54, 3);
(function goldenRule() {
  doc.font('PB').fontSize(13);
  const parts = ['SEE IT', 'ASSESS IT', 'ASSIST OR REPORT IT'];
  const gap = 26;
  const widths = parts.map(p => doc.widthOfString(p, { characterSpacing: 0.4 }));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (parts.length - 1);
  let x = (W - total) / 2; const y = 469;
  doc.fillColor(WHITE);
  parts.forEach((p, i) => {
    doc.text(p, x, y, { characterSpacing: 0.4 });
    x += widths[i];
    if (i < parts.length - 1) { arrowR(x + gap / 2, y + 6.5, WHITE); x += gap; }
  });
})();

/* =====================================================================
   P21 — THE USHER'S PLEDGE
===================================================================== */
page({ notchTR: true, notchBL: true, dots: true, footerY: 560 });
title('The Usher’s Pledge');
navyBox(56, 176, W - 112, 244, 4);
doc.image('assets/emblem.png', W / 2 - 22, 198, { width: 44 });
doc.font('JI').fontSize(11.2).fillColor(WHITE)
  .text('“I will represent the event with professionalism,\nrespect and integrity. I will welcome guests warmly,\ncommunicate clearly, work as part of a team, follow\ninstructions and remain calm under pressure. I understand\nthat every guest interaction contributes to the overall\nevent experience.”',
    86, 262, W - 172, { align: 'center', lineGap: 6 });
const sigY = 474;
doc.moveTo(66, sigY).lineTo(190, sigY).lineWidth(0.8).strokeColor(NAVY).stroke();
doc.font('JB').fontSize(8.6).fillColor(NAVY).text('NAME & SIGNATURE', 66, sigY + 6, { characterSpacing: 0.8 });
doc.moveTo(230, sigY).lineTo(354, sigY).lineWidth(0.8).strokeColor(NAVY).stroke();
doc.font('JB').fontSize(8.6).fillColor(NAVY).text('DATE', 230, sigY + 6, { characterSpacing: 0.8 });
body('Lynton Events  |  We Make It Happen', 66, 508, W - 132, { align: 'center', font: 'JM', size: 10.2 });

/* =====================================================================
   P22 — BACK COVER   (Let's Work Together archetype)
===================================================================== */
page({ chrome: false, ghost: false });
doc.rect(0, 0, W, H).fill(LIGHT);
ghost('R');
logoBlock(); dotsR(350, 55);
title('Let’s Make It Happen', 126);
body('Lynton Events trains and deploys professional event teams across Kenya — from ushers and coordination to full event experiences.',
  MX, 186, W - 2 * MX, { align: 'center', lineGap: 3.6 });
doc.image('assets/wordmark-gold.png', W / 2 - 61, 252, { width: 122 });
// contact box (bleeds off the left edge like the original)
navyBox(0, 344, 252, 156, 0);
cRow2('phone', '+254 729 474 546', 366);
cRow2('mail', 'lyntoneventske@gmail.com', 394);
cRow2('globe', 'www.lyntonevents.com', 422);
doc.moveTo(40, 446).lineTo(230, 446).lineWidth(0.6).strokeColor('#4A5678').stroke();
doc.font('JB').fontSize(8.6).fillColor(INKSOFT)
  .text('EVENTS MC  •  PLANNING  •  TEAM BUILDING\nCORPORATE & SPECIAL EVENTS', 24, 456, { width: 212, align: 'center', lineGap: 4 });
body('facebook.com/lyntoneventske\ninstagram.com/emceelynton\nKericho, Kenya', 264, 366, 140, { size: 9.6, lineGap: 5 });
function cRow2(iconK, txt, y) {
  icon(iconK, 52, y + 6, 7.5, WHITE, NAVY);
  doc.font('JB').fontSize(11.2).fillColor(WHITE).text(txt, 66, y, { width: 172 });
}
// peak band
const yB = H;
poly([-14, yB, 58, yB - 100, 132, yB], SLATE);
poly([-26, yB, 48, yB - 88, 122, yB], NAVY);
poly([96, yB, 192, yB - 72, 288, yB], WHITE);
poly([262, yB, 330, yB - 100, 398, yB], SLATE);
poly([250, yB, 318, yB - 88, 386, yB], NAVY);
poly([376, yB, 424, yB - 66, 452, yB], SLATE);

doc.end();
console.log('Wrote', OUT);
