const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { inflateSync } = require('node:zlib');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const log = execFileSync(process.execPath, ['generate-treasure-tuesday.js'], {
  cwd: root, encoding: 'utf8'
});
const pdf = readFileSync(path.join(root, 'Cancel Culture vs Grace Culture - Treasure Tuesday.pdf'));
const raw = pdf.toString('latin1');
const streams = [...raw.matchAll(/<<(.*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/gs)]
  .filter(m => !m[1].includes('/Subtype /Image') && m[1].includes('/FlateDecode'))
  .map(m => {
    try { return inflateSync(Buffer.from(m[2], 'latin1')).toString('latin1'); }
    catch { return ''; }
  });
const pages = streams.filter(s => s.includes('BT'));

test('booklet builds with ten pages and no layout warnings', () => {
  assert.equal((raw.match(/\/Type \/Page\b/g) || []).length, 10);
  assert.equal(pages.length, 10);
  assert.ok(!log.includes('LAYOUT WARNINGS'), log);
});

test('only classic standard Times fonts are used', () => {
  const fonts = [...raw.matchAll(/\/BaseFont \/([^\s]+)/g)].map(m => m[1]);
  assert.ok(fonts.length > 0);
  assert.ok(fonts.every(f => /^Times-(Roman|Bold|Italic|BoldItalic)$/.test(f)), fonts.join(', '));
});

test('page artwork uses three base colors and no gradients', () => {
  const palette = [[41, 37, 44], [251, 247, 241], [153, 116, 64]];
  for (const s of pages) {
    assert.ok(!/\bsh\b/.test(s), 'No shading/gradient fills');
    for (const m of s.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) (?:rg|RG)\b/g)) {
      const rgb = m.slice(1, 4).map(Number);
      assert.ok(palette.some(p => p.every((c, i) => Math.abs(c / 255 - rgb[i]) < .00001)),
        `Unexpected color: ${rgb.join(', ')}`);
    }
  }
});

test('every page contains a faint background image using PDF opacity', () => {
  assert.match(raw, /\/ca 0\.045\b/);
  assert.match(raw, /\/ca 0\.14\b/);
  // Track nested saved graphics states: PDFKit also saves inside image().
  const objects = new Map([...raw.matchAll(/(\d+) 0 obj\s*([\s\S]*?)endobj/g)]
    .map(m => [m[1], m[2]]));
  const opacity = new Map([...raw.matchAll(/\/(Gs\d+) (\d+) 0 R/g)]
    .map(m => [m[1], Number(objects.get(m[2]).match(/\/ca ([\d.]+)/)[1])]));
  for (const s of pages) {
    let current = 1, images = 0;
    const stack = [];
    for (const line of s.split('\n')) {
      if (line === 'q') stack.push(current);
      else if (line === 'Q') current = stack.pop();
      else if (/^\/Gs\d+ gs$/.test(line)) current = opacity.get(line.slice(1, -3));
      else if (/^\/I\d+ Do$/.test(line)) {
        images++;
        assert.ok(current === .045 || current === .14,
          `Silhouette must have faint opacity, got ${current}`);
      }
    }
    assert.ok(images > 0, 'Missing silhouette background');
    assert.equal(stack.length, 0, 'Unbalanced graphics state');
  }
});
