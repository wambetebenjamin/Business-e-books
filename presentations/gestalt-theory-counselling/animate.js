/* ============================================================================
   animate.js — post-processes the generated PPTX:
   1. Rounds every picture's geometry (roundRect, soft 5% corner radius)
   2. Injects a Morph slide transition on every slide (fade fallback for
      older PowerPoint), so matching anchors glide when advancing
   3. Injects a native <p:timing> tree:
      · "hdr" shapes  → Fade In, 350 ms, on click
      · "blkN" shapes → Wipe from Left (left-to-right), 450 ms, sequential
      · "img" shapes  → Float In (fade + rise), 500 ms, after the text
   Shapes are targeted via the objectName given in build.js. Run after
   build.js:   node build.js && node animate.js
   ========================================================================== */
const path = require("path");
const AdmZip = require("adm-zip");

const PPTX = path.join(__dirname, "output", "Gestalt Theory and Its Application to Counselling.pptx");
const N_SLIDES = 22;

/* ---------- behaviour fragments ---------- */
let _id = 0;
const nid = () => ++_id;

function setBehavior(spid) {
  return (
    `<p:set><p:cBhvr>` +
    `<p:cTn id="${nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>` +
    `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>` +
    `<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>` +
    `</p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`
  );
}

function fadeEffect(spid, dur) {
  return (
    `<p:animEffect transition="in" filter="fade"><p:cBhvr>` +
    `<p:cTn id="${nid()}" dur="${dur}"/>` +
    `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>` +
    `</p:cBhvr></p:animEffect>`
  );
}

function wipeEffect(spid, dur) {
  return (
    `<p:animEffect transition="in" filter="wipe(right)"><p:cBhvr>` +
    `<p:cTn id="${nid()}" dur="${dur}"/>` +
    `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>` +
    `</p:cBhvr></p:animEffect>`
  );
}

function riseAnim(spid, dur) {
  return (
    `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base">` +
    `<p:cTn id="${nid()}" dur="${dur}" fill="hold"/>` +
    `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>` +
    `<p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst>` +
    `</p:cBhvr><p:tavLst>` +
    `<p:tav tm="0"><p:val><p:strVal val="#ppt_y+0.05"/></p:val></p:tav>` +
    `<p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav>` +
    `</p:tavLst></p:anim>`
  );
}

/** one entrance effect par. preset: 9=fade, 22=wipe(subtype 2=from left), 30=float */
function effectPar(presetID, subtype, delay, nodeType, inner) {
  return (
    `<p:par><p:cTn id="${nid()}" presetID="${presetID}" presetClass="entr" presetSubtype="${subtype}" ` +
    `fill="hold" grpId="0" nodeType="${nodeType}">` +
    `<p:stCondLst><p:cond delay="${delay}"/></p:stCondLst>` +
    `<p:childTnLst>${inner}</p:childTnLst>` +
    `</p:cTn></p:par>`
  );
}

/* ---------- slide-level timing ---------- */
const FADE_DUR = 350, WIPE_DUR = 450, FLOAT_DUR = 500, STEP = 550;

function buildTiming(groups) {
  _id = 4; // ids 1-4 are the tmRoot/mainSeq/group wrappers below
  const effects = [];
  let first = true;

  // header group → fade together on click
  if (groups.hdr) {
    groups.hdr.forEach((spid, i) => {
      const node = i === 0 ? "clickEffect" : "withEffect";
      effects.push(effectPar(9, 0, 0, node, setBehavior(spid) + fadeEffect(spid, FADE_DUR)));
    });
    first = false;
  }

  // content blocks → sequential wipe (left to right)
  const blkNames = Object.keys(groups)
    .filter((n) => /^blk\d+$/.test(n))
    .sort((a, b) => parseInt(a.slice(3)) - parseInt(b.slice(3)));
  blkNames.forEach((name, bi) => {
    const delay = 400 + bi * STEP;
    groups[name].forEach((spid, i) => {
      const node = i === 0 ? (first ? "clickEffect" : "afterEffect") : "withEffect";
      effects.push(effectPar(22, 2, delay, node, setBehavior(spid) + wipeEffect(spid, WIPE_DUR)));
    });
    first = false;
  });

  // images → float in after the text
  if (groups.img) {
    const delay = 400 + blkNames.length * STEP + 150;
    groups.img.forEach((spid, i) => {
      const node = i === 0 ? (first ? "clickEffect" : "afterEffect") : "withEffect";
      effects.push(effectPar(30, 0, delay, node, setBehavior(spid) + riseAnim(spid, FLOAT_DUR) + fadeEffect(spid, FLOAT_DUR)));
    });
  }

  if (!effects.length) return "";

  return (
    `<p:timing><p:tnLst><p:par>` +
    `<p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek">` +
    `<p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>` +
    `<p:par><p:cTn id="3" fill="hold">` +
    `<p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>` +
    `<p:par><p:cTn id="4" fill="hold">` +
    `<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
    effects.join("") +
    `</p:childTnLst></p:cTn></p:par>` +
    `</p:childTnLst></p:cTn></p:par>` +
    `</p:childTnLst></p:cTn>` +
    `<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>` +
    `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>` +
    `</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`
  );
}

/* Morph transition with fade fallback for pre-2016 PowerPoint */
const TRANSITION =
  `<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">` +
  `<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">` +
  `<p:transition xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="1600">` +
  `<p159:morph option="byObject"/></p:transition></mc:Choice>` +
  `<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback>` +
  `</mc:AlternateContent>`;

/* ---------- main ---------- */
const zip = new AdmZip(PPTX);
let totalEffects = 0, roundedPics = 0;

for (let i = 1; i <= N_SLIDES; i++) {
  const file = `ppt/slides/slide${i}.xml`;
  let xml = zip.readAsText(file);
  if (!xml) { console.error(`missing ${file}`); process.exit(1); }

  // 1) collect animated shapes by objectName (hdr | blkN | img)
  const groups = {};
  for (const m of xml.matchAll(/<p:cNvPr id="(\d+)" name="(hdr|blk\d+|img)"/g)) {
    (groups[m[2]] = groups[m[2]] || []).push(m[1]);
    totalEffects++;
  }

  // 2) round PICTURE geometry only: rect → roundRect (adj 5000 ≈ 5% radius)
  xml = xml.replace(/<p:pic>[\s\S]*?<\/p:pic>/g, (block) => {
    if (!block.includes('prst="rect"')) return block;
    roundedPics++;
    return block.replace(
      /<a:prstGeom prst="rect"><a:avLst\s*(?:\/>|><\/a:avLst>)<\/a:prstGeom>/,
      `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 5000"/></a:avLst></a:prstGeom>`
    );
  });

  // 3) transition + timing (element order in p:sld: cSld, clrMapOvr, transition, timing)
  if (xml.includes("</p:clrMapOvr>")) {
    xml = xml.replace("</p:clrMapOvr>", `</p:clrMapOvr>${TRANSITION}`);
  } else {
    xml = xml.replace("</p:cSld>", `</p:cSld>${TRANSITION}`);
  }
  const timing = buildTiming(groups);
  if (timing) xml = xml.replace("</p:sld>", `${timing}</p:sld>`);

  zip.updateFile(file, Buffer.from(xml, "utf8"));
}

zip.writeZip(PPTX);
console.log(`animate.js: ${N_SLIDES} slides — transition=Morph, ${totalEffects} animated shapes, ${roundedPics} photos rounded`);
