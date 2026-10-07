#!/usr/bin/env node
/**
 * build-prompt.js — compiles registry.json into a single, paste-ready website
 * build prompt (SITE-ANIMATION-PROMPT.md) that covers all 31 effects.
 *
 * Usage:
 *   node build-prompt.js                 # writes SITE-ANIMATION-PROMPT.md
 *   node build-prompt.js --out file.md   # custom output path
 *   node build-prompt.js --slot S4       # only effects in one slot
 *   node build-prompt.js --family D      # only effects in one family
 *
 * The generator never invents effect content: everything is read from the
 * registry, so regenerating after editing registry.json is always safe.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const arg = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const OUT = arg('--out', path.join(__dirname, 'SITE-ANIMATION-PROMPT.md'));
const ONLY_SLOT = arg('--slot', null);
const ONLY_FAMILY = arg('--family', null);

// ---------------------------------------------------------------- load
const regPath = path.join(__dirname, 'registry.json');
const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));

const all = reg.effects.slice().sort((a, b) => a.n - b.n);
const chosen = all.filter(
  (e) => (!ONLY_SLOT || e.slot === ONLY_SLOT) && (!ONLY_FAMILY || e.family === ONLY_FAMILY)
);
if (!chosen.length) {
  console.error('No effects matched the given filter.');
  process.exit(1);
}

// ---------------------------------------------------------------- helpers
const fmtRange = (v) => {
  if (Array.isArray(v)) return v.length === 2 ? `${v[0]}–${v[1]}` : v.join(', ');
  return String(v);
};

const esc = (s) => String(s).replace(/\|/g, '\\|');

const paramsLine = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${fmtRange(v)}`)
    .join(' · ');

const triggerSet = (trigger) =>
  trigger.split('+').map((t) => t.trim()).filter(Boolean);

const SLOT_ORDER = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];

const slotBucket = (slot) => {
  if (slot === 'G') return 'GLOBAL';
  return slot;
};

// Roll up the combined frame budget + perf profile
const totalBudget = chosen
  .filter((e) => e.slot !== 'G')
  .reduce((sum, e) => sum + e.perf.frame_budget_ms, 0);

const gpuCount = chosen.filter((e) => e.perf.gpu).length;
const costCounts = chosen.reduce((acc, e) => {
  acc[e.perf.cost] = (acc[e.perf.cost] || 0) + 1;
  return acc;
}, {});

// Stack rollup
const stackTally = {};
chosen.forEach((e) =>
  e.stack.forEach((s) => {
    stackTally[s] = (stackTally[s] || 0) + 1;
  })
);
const topStack = Object.entries(stackTally)
  .sort((a, b) => b[1] - a[1])
  .map(([s]) => s);

// Trigger rollup
const triggerTally = {};
chosen.forEach((e) =>
  triggerSet(e.trigger).forEach((t) => {
    triggerTally[t] = (triggerTally[t] || 0) + 1;
  })
);

// ---------------------------------------------------------------- sections
const L = [];
const w = (s = '') => L.push(s);

w(`# Website Animation Build Prompt`);
w();
w(`**Generated from \`registry.json\` — ${chosen.length} of ${all.length} effects${
  ONLY_SLOT ? ` (slot ${ONLY_SLOT})` : ONLY_FAMILY ? ` (family ${ONLY_FAMILY})` : ''
}.**`);
w(`Source article: ${reg.source.title} — ${reg.source.publisher} (${reg.source.url})`);
w();
w(`> Paste everything below the divider into your AI website builder. It is written as one`);
w(`> continuous brief: role, constraints, section-by-section blueprints, then per-effect specs.`);
w();
w(`---`);
w();
w(`## ROLE`);
w();
w(`You are a senior front-end engineer and motion designer. Build a single, production-quality,`);
w(`fully responsive marketing website that implements **every one of the ${chosen.length} animation`);
w(`effects specified below**, each in its assigned page slot. Do not skip, merge or silently`);
w(`substitute an effect. If an effect cannot be implemented with the available stack, say so`);
w(`explicitly and implement the closest faithful technique — never drop it silently.`);
w();
w(`## HARD CONSTRAINTS`);
w();
w(`1. **Coverage.** Every effect ID (${chosen.map((e) => e.id).join(', ')}) must be traceable to`);
w(`   visible, working code. At the end of the build, output a table: effect ID → file → component.`);
w(`2. **Reduced motion is not optional.** Every effect ships its \`prefers-reduced-motion\` fallback`);
w(`   below. An effect without its fallback is an incomplete effect.`);
w(`3. **Performance.** Respect each effect's frame budget. The ${chosen.filter((e) => e.slot !== 'G').length} section-bound effects`);
w(`   total ~${totalBudget}ms of frame time, but they never all run simultaneously (different slots,`);
w(`   different triggers, loops asleep off-screen) so no single frame may exceed 16.7ms.`);
w(`   Animate only \`transform\`, \`opacity\` and`);
w(`   \`filter\` where possible; never animate \`top\`/\`left\`/\`width\`/\`height\` for motion.`);
w(`4. **Accessibility.** Every animation is keyboard-equivalent, screen-reader-safe and passes`);
w(`   WCAG AA contrast in its final painted state.`);
w(`5. **No scroll-jacking.** Native scroll speed and position are never hijacked.`);
w(`6. **Progressive enhancement.** Content is complete and readable with JavaScript disabled.`);
w();

w(`## PERFORMANCE PROFILE`);
w();
w(`| Metric | Value |`);
w(`| --- | --- |`);
w(`| Effects to build | ${chosen.length} |`);
w(`| GPU-composited | ${gpuCount} of ${chosen.length} |`);
w(`| Cost split | ${Object.entries(costCounts).map(([k, v]) => `${v} ${k}`).join(', ')} |`);
w(`| Page slots used | ${[...new Set(chosen.map((e) => e.slot))].sort().join(', ')} |`);
w(`| Dominant techniques | ${topStack.slice(0, 8).join(', ')} |`);
w(`| Trigger mix | ${Object.entries(triggerTally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', ')} |`);
w();

w(`## PAGE ARCHITECTURE — SLOTS`);
w();
w(`The page is divided into named slots. Effects are assigned to exactly one slot, so no two`);
w(`effects compete for the same surface.`);
w();
w(`| Slot | Region | Effects |`);
w(`| --- | --- | --- |`);
SLOT_ORDER.forEach((s) => {
  const inSlot = chosen.filter((e) => e.slot === s);
  if (!inSlot.length) return;
  w(`| ${s} | ${reg.slots[s] || s} | ${inSlot.map((e) => `**${e.id}** ${esc(e.name)}`).join('<br>')} |`);
});
const globalFx = chosen.filter((e) => e.slot === 'G');
if (globalFx.length) {
  w(`| G | ${reg.slots.G || 'Global'} | ${globalFx.map((e) => `**${e.id}** ${esc(e.name)}`).join('<br>')} |`);
}
w();

// ---- section-by-section blueprints (build order)
const buildOrder = SLOT_ORDER.concat(['G']);
w(`## BUILD ORDER`);
w();
w(`Build the page in this order. Each step lists the effects it must include and the`);
w(`acceptance checks that close it out.`);
w();

buildOrder.forEach((slot) => {
  const inSlot = chosen.filter((e) => e.slot === slot);
  if (!inSlot.length) return;
  const label = reg.slots[slot] || slot;
  w(`### ${slot} — ${label}`);
  w();
  inSlot.forEach((e) => {
    w(`#### ${e.id} · ${esc(e.name)}  \`${e.family}\``);
    w();
    w(`- **What:** ${e.one_liner}`);
    w(`- **Why:** ${e.intent}`);
    w(`- **Where:** ${e.placement}`);
    w(`- **Trigger:** ${e.trigger}`);
    w(`- **Stack:** ${e.stack.join(', ')}`);
    w(`- **Motion:** ${paramsLine(e.params)}`);
    w(`- **Performance:** ${e.perf.cost} cost${e.perf.gpu ? ', GPU-composited' : ', CPU-bound'} — budget ≤${e.perf.frame_budget_ms}ms/frame`);
    w(`- **Reduced motion:** ${e.a11y.prefers_reduced_motion}`);
    w(`- **Keyboard:** ${e.a11y.keyboard}`);
    w(`- **Semantics:** ${e.a11y.aria}`);
    w(`- **Acceptance:**`);
    e.acceptance.forEach((a) => w(`  - [ ] ${a}`));
    w();
  });
});

// ---- paste-ready shorthand
w(`## PASTE-READY EFFECT PROMPTS`);
w();
w(`The same ${chosen.length} effects as one imperative line each. Use these verbatim when`);
w(`delegating individual effects, or as the checklist when reviewing the build.`);
w();
chosen.forEach((e) => {
  w(`- **${e.id} (${e.name})** — ${e.prompt_line}`);
});
w();

// ---- cross-cutting rules
w(`## CROSS-CUTTING IMPLEMENTATION RULES`);
w();
w(`**Motion tokens.** Define these once and reuse them everywhere — no ad-hoc durations.`);
w();
w('```css');
w(`:root {`);
w(`  --dur-instant: 120ms;   /* microinteractions, hover */`);
w(`  --dur-quick:   240ms;   /* icon + state changes */`);
w(`  --dur-base:    400ms;   /* reveals, transitions */`);
w(`  --dur-slow:    800ms;   /* hero, drawing, morphs */`);
w(`  --dur-story:  1600ms;   /* scrollytelling beats */`);
w();
w(`  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);`);
w(`  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);`);
w(`  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);`);
w(`  --ease-soft:  cubic-bezier(0.2, 0, 0, 1);`);
w();
w(`  --stagger-sm: 40ms;`);
w(`  --stagger-md: 80ms;`);
w(`}`);
w('```');
w();
w(`**The reduced-motion contract.** Ship exactly one global block, and make every effect`);
w(`resolve to a legible static state inside it:`);
w();
w('```css');
w(`@media (prefers-reduced-motion: reduce) {`);
w(`  *, *::before, *::after {`);
w(`    animation-duration: 0.01ms !important;`);
w(`    animation-iteration-count: 1 !important;`);
w(`    transition-duration: 0.01ms !important;`);
w(`    scroll-behavior: auto !important;`);
w(`  }`);
w(`  .js-motion { display: none; }      /* JS-driven canvases */`);
w(`  .static-fallback { display: block; } /* pre-rendered stills */`);
w(`}`);
w('```');
w();
w(`**Loops must sleep.** Every \`idle-loop\` effect (${chosen.filter((e) => e.trigger.includes('idle-loop')).map((e) => e.id).join(', ') || 'none'}) pauses when its section is`);
w(`out of the viewport and when the document is hidden:`);
w();
w('```js');
w(`const io = new IntersectionObserver(([entry]) => {`);
w(`  entry.isIntersecting ? startLoop() : stopLoop();`);
w(`}, { rootMargin: '10% 0px' });`);
w(`document.addEventListener('visibilitychange', () => {`);
w(`  document.hidden ? stopAllLoops() : resumeVisibleLoops();`);
w(`});`);
w('```');
w();
w(`**Scroll work is read-only and rAF-batched.** Never write layout during scroll; sample`);
w(`scroll progress in a \`requestAnimationFrame\` loop and drive transforms from it.`);
w();
w(`**Canvas and heavy effects are lazy.** Instantiate any WebGL/WebXR or particle system only`);
w(`when its slot first enters the viewport, and tear it down on exit.`);
w();
w(`**Every effect is announced or hidden, never silent-but-loud.** Decorative motion gets`);
w(`\`aria-hidden="true"\`; state-changing motion gets a polite live region or an updated ARIA state.`);
w();

// ---- QA gate
w(`## QA GATE — DO NOT SHIP UNTIL ALL PASS`);
w();
w(`1. All ${chosen.length} effect IDs appear in the coverage table with a file path.`);
w(`2. Every effect renders a legible static state under \`prefers-reduced-motion: reduce\`.`);
w(`3. Full keyboard pass: every trigger works via keyboard without a pointer.`);
w(`4. Tab away during each loop — animation stops. Scroll away — animation stops.`);
w(`5. Lighthouse performance ≥ 90 on mobile with all effects enabled.`);
w(`6. CLS ≈ 0; no effect shifts layout on entry or completion.`);
w(`7. Page is fully readable with JavaScript disabled.`);
w(`8. No console errors or warnings from any effect.`);
w();

// ---- appendix
w(`## APPENDIX — MACHINE-READABLE SPEC`);
w();
w(`The block below is the exact source data for everything above. Feed it to an AI when you`);
w(`want it to reason about the effects rather than just execute them.`);
w();
w('```json');
w(JSON.stringify({ source: reg.source, families: reg.families, slots: reg.slots, effects: chosen }, null, 2));
w('```');
w();

fs.writeFileSync(OUT, L.join('\n'), 'utf8');

const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`✓ ${path.basename(OUT)} — ${chosen.length} effects, ${L.length} lines, ${kb} KB`);
if (ONLY_SLOT || ONLY_FAMILY) {
  console.log(`  (filtered: ${ONLY_SLOT ? 'slot ' + ONLY_SLOT : ''}${ONLY_SLOT && ONLY_FAMILY ? ' + ' : ''}${ONLY_FAMILY ? 'family ' + ONLY_FAMILY : ''})`);
}
