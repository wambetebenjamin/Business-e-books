/* ============================================================================
   THE SECRET PLACE — The Three Levels of the Will of God   ·   v2 (new book)
   E-book · A4 · Presbyter Jeremiah Mugala · CHRISCO Central Church, Nairobi
   Spiritual Emphasis Month · 4th Week · Wednesday

   v2 design (built on the Canva template EAHDoZfQENg design language —
   modern GREEN / BLACK / WHITE with accent):
     · black = dimmed ultrarealistic photography (full bleed)
     · white = floating typography (Playfair Display / Outfit / IBM Plex Mono)
     · green accent = eyebrows, giant level numerals, scripture refs, footer
   Poster-style level pages: oversized numerals, bigger display titles.
   No bullets, no cards, no rules, no underlines — pure editorial layout.
   Run: node build.js && python3 check-content.py
   ========================================================================== */
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const A = (p) => path.join(__dirname, "assets", p);
const F = (p) => path.join(__dirname, "fonts", p);
const OUT_DIR = path.join(__dirname, "output");
const OUT = path.join(OUT_DIR, "The Secret Place - Three Levels of the Will of God.pdf");
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 595.28, H = 841.89;      // A4 portrait, pt
const MX = 56, CW = W - 2 * MX;    // margins / content width
const WHITE = "#FFFFFF", SOFT = "#E8EBF4", META = "#C9D4EA", GREEN = "#3ECF8E";

const doc = new PDFDocument({
  size: "A4", margin: 0,
  info: {
    Title: "The Secret Place — The Three Levels of the Will of God",
    Author: "Presbyter Jeremiah Mugala · CHRISCO Central Church, Nairobi",
    Subject: "Spiritual Emphasis Month · 4th Week · Wednesday",
  },
});
doc.pipe(fs.createWriteStream(OUT));

["PF-Bold", "PF-Italic", "PF-Regular", "Outfit", "Outfit-Bold", "PlexMono", "PlexMono-Bold"].forEach((n) => {
  doc.registerFont(n, F(`${n}.ttf`));
});

/* ---------- content integrity dump (checked by check-content.py) ---------- */
const DUMP = [];
const dump = (t) => DUMP.push(t);

/* ---------- helpers ---------- */
let pageNo = 0;
function newPage(bg, o = {}) {
  if (pageNo) doc.addPage({ size: "A4", margin: 0 });
  pageNo++;
  doc.image(A(bg), 0, 0, { width: W, height: H });
  if (!o.noFooter) {
    doc.font("PlexMono").fontSize(7.5).fillColor(GREEN)
      .text("CHRISCO CENTRAL CHURCH  ·  NAIROBI", MX, 800, { characterSpacing: 1.5 });
    doc.font("PlexMono-Bold").fontSize(8).fillColor(GREEN)
      .text(String(pageNo).padStart(2, "0"), W - MX - 30, 800, { width: 30, align: "right" });
  }
}
function fits(y, label) {
  if (y > 782) throw new Error(`OVERFLOW on page ${pageNo} (${label}): y=${y.toFixed(0)}`);
}
function eyebrow(t, y) {
  doc.font("PlexMono-Bold").fontSize(8.5).fillColor(GREEN)
    .text(t, MX, y, { width: CW, characterSpacing: 2.5 });
  dump(t);
}
function title(t, y, size = 26, o = {}) {
  doc.font("PF-Bold").fontSize(size).fillColor(WHITE)
    .text(t, MX, y, { width: o.w ?? CW, lineGap: 4 });
  dump(t);
  return doc.y + 14;
}
/** floating paragraph — runs: [{t, b(old), i(talic)}]; no bullets, no markers */
function para(runs, y, o = {}) {
  const arr = (Array.isArray(runs) ? [...runs] : [{ t: runs }]);
  // widow control: fold a punctuation-only trailing run into the previous run
  while (arr.length > 1 && /^[.,;:!?’'”)\]]+$/.test(arr[arr.length - 1].t)) {
    const last = arr.pop();
    arr[arr.length - 1].t += last.t;
  }
  arr.forEach((r, i) => {
    const last = i === arr.length - 1;
    doc.font(r.b ? "Outfit-Bold" : r.i ? "PF-Italic" : "Outfit")
      .fontSize(r.size ?? o.size ?? 11.5)
      .fillColor(r.color ?? o.color ?? SOFT)
      .text(r.t, o.x ?? MX, last ? y : undefined, {
        width: o.w ?? CW, lineGap: o.lineGap ?? 6,
        continued: !last, goBack: !last,
      });
    if (last) dump(arr.map((r2) => r2.t).join(""));
  });
  return doc.y + (o.gap ?? 18);
}
function verse(t, y, o = {}) {
  doc.font("PF-Italic").fontSize(o.size ?? 17).fillColor(WHITE)
    .text(`“${t}”`, MX, y, { width: CW, lineGap: 7 });
  dump(t);
  return doc.y + 10;
}
function verseRef(t, y) {
  doc.font("PlexMono-Bold").fontSize(9).fillColor(GREEN)
    .text(t, MX, y, { width: CW, characterSpacing: 2.5 });
  dump(t);
  return doc.y + 20;
}
/** oversized green accent numeral — the poster signature of this book */
function numeral(n, y, size = 40) {
  doc.font("PF-Bold").fontSize(size).fillColor(GREEN).text(n, MX, y);
  dump(n);
  return doc.y;
}

/* ============================== PAGE 1 — COVER ============================ */
newPage("cover.jpg", { noFooter: true });
eyebrow("SPIRITUAL EMPHASIS MONTH  ·  4TH WEEK  ·  WEDNESDAY", 96);
doc.font("PF-Bold").fontSize(50).fillColor(WHITE).text("The Secret\nPlace", MX, 240, { lineGap: 6 });
dump("The Secret Place");
doc.font("PF-Italic").fontSize(20).fillColor(SOFT)
  .text("The Three Levels of the Will of God", MX, 420, { width: CW });
dump("The Three Levels of the Will of God");
doc.font("PlexMono-Bold").fontSize(9).fillColor(META).text("PRESBYTER JEREMIAH MUGALA", MX, 700, { characterSpacing: 2.5 });
doc.font("PlexMono").fontSize(8.5).fillColor(GREEN).text("CHRISCO CENTRAL CHURCH  ·  NAIROBI", MX, 722, { characterSpacing: 2.5 });
dump("PRESBYTER JEREMIAH MUGALA"); dump("CHRISCO CENTRAL CHURCH  ·  NAIROBI");

/* ======================= PAGE 2 — THE SECRET PLACE ======================== */
newPage("secret.jpg");
eyebrow("THE INVITATION", 96);
let y = title("There Is a Secret Place of the Most High", 126, 27);
y = para([
  { t: "There is a " }, { t: "secret place of the Most High", b: true },
  { t: " — a place He has kept for those who draw near to Him." },
], y);
y = para([
  { t: "He wants us to " }, { t: "get closer", b: true },
  { t: " — if possible, that we reach it. The invitation of this hour is not to visit His courts, but to come all the way in." },
], y);
y = para([
  { t: "We have something that, when we " }, { t: "balance it well", b: true },
  { t: ", will give us " }, { t: "victory in a great way", b: true },
  { t: "." },
], y);
verse("He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.", y + 26, { size: 15 });
verseRef("PSALM 91:1", doc.y + 6);
fits(doc.y, "p2");

/* ==================== PAGE 3 — THE THREE LEVELS =========================== */
newPage("levels.jpg");
eyebrow("THE STRUCTURE", 96);
y = title("The Three Levels of the Will of God", 126, 27);
const levels = [
  ["01", "The Outer Court", "Still in the will of God — yet a public place of noise, with a fence but no covering."],
  ["02", "The Holy Place", "Behind the curtain: complete darkness, three holy items, and the light of the Spirit."],
  ["03", "The Holy of Holies", "Where the Lord is. The place of worship, intercession, exchange and redefinition."],
];
levels.forEach((lv) => {
  const ny = numeral(lv[0], y, 40);
  doc.font("Outfit-Bold").fontSize(14.5).fillColor(WHITE).text(lv[1], MX, ny + 2);
  dump(lv[1]);
  y = para(lv[2], doc.y + 6, { gap: 20, size: 11, color: SOFT });
});
fits(y, "p3");

/* ==================== PAGE 4 — LEVEL 01 · OUTER COURT ===================== */
newPage("outer.jpg");
eyebrow("LEVEL ONE  ·  THE OUTER COURT", 96);
y = numeral("01", 122, 64);
y = title("The Outer Court", y + 4, 30);
y = para([
  { t: "The Outer Court is " }, { t: "still in the will of God", b: true },
  { t: " — though one who wants to do exploits has to be in the " },
  { t: "perfect will of God", b: true }, { t: "." },
], y);
y = para([
  { t: "The Outer Court had " }, { t: "no covering", b: true },
  { t: " — but a " }, { t: "fence", b: true }, { t: "." },
], y);
y = para([
  { t: "In the Outer Court there is a lot of noise: " },
  { t: "unnecessary noise", b: true }, { t: "." },
], y);
y = para([
  { t: "As it is a " }, { t: "public place", b: true },
  { t: ", there is " }, { t: "no secret in the Outer Court", b: true }, { t: "." },
], y);
fits(y, "p4");

/* ==================== PAGE 5 — LEVEL 02 · HOLY PLACE ====================== */
newPage("holyplace.jpg");
eyebrow("LEVEL TWO  ·  THE HOLY PLACE", 96);
y = numeral("02", 122, 64);
y = title("The Holy Place", y + 4, 30);
y = para([
  { t: "In the Holy Place there is a " }, { t: "curtain", b: true },
  { t: ", and " }, { t: "complete darkness", b: true },
  { t: ". There are " }, { t: "three items", b: true }, { t: " in the Holy Place." },
], y);
y = para([
  { t: "The " }, { t: "candlestick", b: true },
  { t: " — for lighting the candle, which represents the " },
  { t: "Holy Spirit", b: true }, { t: "." },
], y);
y = para([
  { t: "Our life is enlightened by the Holy Spirit, for us to see the " },
  { t: "table of shewbread", b: true },
  { t: " — unleavened bread with the " }, { t: "twelve loaves", b: true }, { t: "." },
], y);
y = para([
  { t: "The priests were to eat the bread, using the candles to see the bread." },
], y);
fits(y, "p5");

/* ==================== PAGE 6 — LEVEL 02 · THE BREAD ======================= */
newPage("bread.jpg");
eyebrow("LEVEL TWO  ·  THE TABLE", 96);
y = title("The Bread of the Word", 126, 28);
y = para([
  { t: "We use the Holy Spirit to light our spiritual bread — the " },
  { t: "Word of God", b: true }, { t: "." },
], y);
y = verse("The letter killeth, but the spirit giveth life.", y + 22, { size: 19 });
y = verseRef("2 CORINTHIANS 3:6", y + 4);
y = para([
  { t: "In the Holy Place the candles burn and there is " },
  { t: "no other light", b: true }, { t: " — and the shewbread." },
], y + 10);
fits(y, "p6");

/* ================== PAGE 7 — LEVEL 03 · HOLY OF HOLIES ==================== */
newPage("incense.jpg");
eyebrow("LEVEL THREE  ·  THE HOLY OF HOLIES", 96);
y = numeral("03", 122, 64);
y = title("The Holy of Holies", y + 4, 30);
y = para([
  { t: "At the entrance there is another altar: the " },
  { t: "altar of incense", b: true }, { t: "." },
], y);
y = para([
  { t: "It was a place to burn the " },
  { t: "most expensive perfumes", b: true },
  { t: " — perfumes that cannot be used elsewhere." },
], y);
y = para([
  { t: "This altar speaks of our " },
  { t: "deep worship and intercession", b: true }, { t: "." },
], y);
y = para([
  { t: "The priest is " }, { t: "covered by the smoke", b: true },
  { t: " into the Holy of Holies." },
], y);
fits(y, "p7");

/* ================== PAGE 8 — ENCOUNTERS IN THE HOLY OF HOLIES ============= */
newPage("encounters.jpg");
eyebrow("LEVEL THREE  ·  CONTINUED", 96);
y = title("Encounters in the Holy of Holies", 126, 27);
y = para([
  { t: "That is where you " },
  { t: "exchange your weakness for strength", b: true },
  { t: ". This is " }, { t: "where the Lord is", b: true }, { t: "." },
], y);
y = para([
  { t: "This is where " }, { t: "Queen Esther", b: true },
  { t: " reached a place of mentioning what she wanted." },
], y);
y = para([
  { t: "It is a " }, { t: "place of redefinition", b: true }, { t: "." },
], y);
y = para([
  { t: "Solomon", b: true },
  { t: " was in the Holy Place, and Solomon said he wants " },
  { t: "wisdom", b: true },
  { t: " — which brings many other things with it." },
], y);
y = para([
  { t: "The " }, { t: "daughter of Herodias", b: true },
  { t: " was there; she was asked what she wanted. She turned to her mother and asked for " },
  { t: "John the Baptist’s head", b: true },
  { t: ". As it was a " }, { t: "royal decree", b: true },
  { t: ", he had to give it." },
], y);
fits(y, "p8");

/* ================== PAGE 9 — FOR THE WILL OF GOD ========================== */
newPage("prayer.jpg");
eyebrow("THE KEYS", 96);
y = title("For the Will of God", 126, 28);
const keys = [
  ["01", [{ t: "You must " }, { t: "glorify God", b: true }, { t: "." }]],
  ["02", [{ t: "Fervent prayer", b: true }, { t: "." }]],
  ["03", [{ t: "You need to " }, { t: "experience God", b: true }, { t: "." }]],
];
keys.forEach((k) => {
  const ny = numeral(k[0], y, 40);
  y = para(k[1], ny + 6, { gap: 22 });
});
fits(y, "p9");

/* ================== PAGE 10 — THE PROMISES ================================ */
newPage("secret.jpg");
eyebrow("CLAIM THE PROMISE", 96);
y = title("The Promises of God", 126, 28);
y = verse("And it shall come to pass, that before they call, I will answer; and while they are yet speaking, I will hear.", y + 10, { size: 17 });
y = verseRef("ISAIAH 65:24", y + 4);
y = para([
  { t: "Come to God with this scripture, " },
  { t: "claiming the promise of God", b: true }, { t: "." },
], y + 8);
y = verse("Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.", y + 24, { size: 17 });
y = verseRef("JEREMIAH 33:3", y + 4);
y = para([
  { t: "God is inviting us to " }, { t: "call Him", b: true },
  { t: ", and He will answer — and He will tell us " },
  { t: "great things", b: true }, { t: "." },
], y + 8);
fits(y, "p10");

/* ================== PAGE 11 — BACK COVER ================================== */
newPage("holyplace.jpg", { noFooter: true });
doc.font("PF-Italic").fontSize(26).fillColor(WHITE)
  .text("He is inviting us\ncloser.", MX, 300, { lineGap: 8 });
dump("He is inviting us closer.");
doc.font("PlexMono-Bold").fontSize(9).fillColor(META).text("PRESBYTER JEREMIAH MUGALA", MX, 640, { characterSpacing: 2.5 });
doc.font("PlexMono").fontSize(8.5).fillColor(META).text("SPIRITUAL EMPHASIS MONTH  ·  4TH WEEK  ·  WEDNESDAY", MX, 662, { characterSpacing: 2 });
doc.font("PlexMono").fontSize(8.5).fillColor(GREEN).text("CHRISCO CENTRAL CHURCH  ·  NAIROBI", MX, 684, { characterSpacing: 2.5 });
dump("SPIRITUAL EMPHASIS MONTH  ·  4TH WEEK  ·  WEDNESDAY");
dump("CHRISCO CENTRAL CHURCH  ·  NAIROBI");

/* ---------- write ---------- */
doc.end();
fs.writeFileSync(path.join(OUT_DIR, "content-dump.txt"), DUMP.join("\n"));
console.log(`WROTE: ${OUT}`);
console.log(`PAGES: ${pageNo}  |  content strings: ${DUMP.length}`);
