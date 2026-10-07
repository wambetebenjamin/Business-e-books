#!/usr/bin/env node
/**
 * verify.js — coverage audit for the animation registry.
 *
 * The structure's core promise is "no effect goes missing". This proves it.
 * Exit code 0 = the registry is complete and internally consistent.
 *
 * Usage: node verify.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'registry.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.json'), 'utf8'));

const REQUIRED = schema.properties.effects.items.required;
const FAMILIES = Object.keys(reg.families);
const SLOTS = Object.keys(reg.slots);
const TRIGGERS = new Set([
  'load', 'in-view', 'scroll', 'hover', 'focus', 'click', 'pointer', 'pointer-drag', 'drag',
  'idle-loop', 'state-change', 'navigation', 'data-loading', 'data-loading state',
  'async request', 'multi-user', 'multi-user event', 'session', 'device motion', 'click (opt-in)',
  'click (replay)',
]);

const fails = [];
const warns = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); return ok; };
const warn = (ok, msg) => { if (!ok) warns.push(msg); return ok; };

const effects = reg.effects.slice().sort((a, b) => a.n - b.n);

// ---------------------------------------------------------------- structural
check(effects.length === reg.source.effect_count,
  `effect count ${effects.length} != source.effect_count ${reg.source.effect_count}`);

check(effects.length === 31, `expected 31 effects, found ${effects.length}`);

// sequential ids and n
effects.forEach((e, i) => {
  const expectedId = `EFFECT-${String(i + 1).padStart(2, '0')}`;
  check(e.id === expectedId, `record ${i + 1}: id ${e.id} != ${expectedId}`);
  check(e.n === i + 1, `${e.id}: n ${e.n} != ${i + 1}`);
});

// duplicate names
const names = effects.map((e) => e.name.toLowerCase());
check(new Set(names).size === names.length, 'duplicate effect names present');

// ---------------------------------------------------------------- per record
effects.forEach((e) => {
  REQUIRED.forEach((k) => check(k in e, `${e.id}: missing required field "${k}"`));

  if (e.family && !FAMILIES.includes(e.family)) fails.push(`${e.id}: unknown family "${e.family}"`);
  if (e.slot && !SLOTS.includes(e.slot)) fails.push(`${e.id}: unknown slot "${e.slot}"`);

  // trigger vocabulary (split on '+' for combined triggers)
  if (e.trigger) {
    e.trigger.split('+').map((t) => t.trim()).forEach((t) => {
      warn(TRIGGERS.has(t), `${e.id}: trigger "${t}" is outside the documented vocabulary`);
    });
  }

  // perf sanity
  if (e.perf) {
    check(['low', 'medium', 'high'].includes(e.perf.cost), `${e.id}: bad perf.cost "${e.perf.cost}"`);
    check(typeof e.perf.gpu === 'boolean', `${e.id}: perf.gpu must be boolean`);
    check(e.perf.frame_budget_ms > 0 && e.perf.frame_budget_ms <= 16.7,
      `${e.id}: frame_budget_ms ${e.perf.frame_budget_ms} outside 0-16.7`);
  }

  // a11y must declare a real static state, not "disable" / "none"
  if (e.a11y) {
    const rm = (e.a11y.prefers_reduced_motion || '').toLowerCase();
    check(rm.length > 3, `${e.id}: reduced-motion fallback missing`);
    check(!/^(none|disable|off|n\/a)\.?$/.test(rm.trim()),
      `${e.id}: reduced-motion fallback "${e.a11y.prefers_reduced_motion}" names no static state`);
    ['keyboard', 'aria'].forEach((k) =>
      check(!!e.a11y[k], `${e.id}: a11y.${k} missing`));
  }

  // acceptance must be binary/testable and plentiful
  if (e.acceptance) {
    check(e.acceptance.length >= 2, `${e.id}: needs at least 2 acceptance checks`);
    e.acceptance.forEach((a, i) =>
      check(a.length > 15, `${e.id}: acceptance[${i}] too vague: "${a}"`));
  }

  // prompt line must be imperative and self-contained
  if (e.prompt_line) {
    check(e.prompt_line.length >= 60, `${e.id}: prompt_line too short to be actionable`);
    check(/^(Build|Create|Add|Animate|Apply|Implement|Show|Turn|Give|Orchestrate|Make)/.test(e.prompt_line),
      `${e.id}: prompt_line is not an imperative instruction`);
  }
});

// ---------------------------------------------------------------- coverage
const covered = new Set(effects.map((e) => e.id));
check(covered.size === 31, `only ${covered.size} unique effect ids`);
check(SLOTS.filter((s) => !['S8', 'S9'].includes(s)).every((s) => effects.some((e) => e.slot === s)),
  'a required slot has no assigned effect');

// heavy effects must not share a slot
const heavy = effects.filter((e) => e.perf.cost === 'high');
const heavySlots = heavy.map((e) => e.slot);
check(new Set(heavySlots).size === heavySlots.length,
  `high-cost effects share a slot: ${heavy.map((e) => `${e.id}@${e.slot}`).join(', ')}`);

// surface styles must stay in the playground (glass excepted — it takes the nav)
const surface = effects.filter((e) => e.family === 'H');
const strays = surface.filter((e) => !['S7', 'S1'].includes(e.slot));
check(strays.length === 0,
  `surface styles outside the playground: ${strays.map((e) => `${e.id}@${e.slot}`).join(', ')}`);

// ---------------------------------------------------------------- report
const pad = (s, n) => String(s).padEnd(n);
const famName = (f) => (reg.families[f] || '').split('—')[0].trim();

console.log('\n  ANIMATION REGISTRY — COVERAGE AUDIT');
console.log('  ' + '─'.repeat(76));
console.log(`  source        ${reg.source.publisher} · ${reg.source.effect_count} effects`);
console.log(`  records       ${effects.length}`);
console.log(`  families      ${FAMILIES.length}`);
console.log(`  slots         ${SLOTS.length} (${SLOTS.filter((s) => effects.some((e) => e.slot === s)).length} populated)`);
console.log('  ' + '─'.repeat(76));
console.log(`  ${pad('ID', 11)}${pad('EFFECT NAME', 42)}${pad('FAM', 5)}${pad('SLOT', 6)}COST`);
console.log('  ' + '─'.repeat(76));
effects.forEach((e) => {
  console.log(`  ${pad(e.id, 11)}${pad(e.name.slice(0, 40), 42)}${pad(e.family, 5)}${pad(e.slot, 6)}${e.perf.cost}`);
});
console.log('  ' + '─'.repeat(76));

// per-slot rollup
SLOTS.forEach((s) => {
  const inSlot = effects.filter((e) => e.slot === s);
  if (!inSlot.length) return;
  const budget = inSlot.reduce((a, e) => a + e.perf.frame_budget_ms, 0);
  console.log(`  ${pad(s, 4)}${pad((reg.slots[s] || s).slice(0, 40), 42)}${pad(inSlot.length + ' fx', 7)}${budget}ms/frame if all simultaneous`);
});
console.log('  ' + '─'.repeat(76));

const gpu = effects.filter((e) => e.perf.gpu).length;
console.log(`  reduced-motion fallbacks declared : ${effects.filter((e) => e.a11y.prefers_reduced_motion).length}/${effects.length}`);
console.log(`  keyboard paths declared           : ${effects.filter((e) => e.a11y.keyboard).length}/${effects.length}`);
console.log(`  acceptance checks total           : ${effects.reduce((a, e) => a + e.acceptance.length, 0)}`);
console.log(`  GPU-composited                    : ${gpu}/${effects.length}`);
console.log('  ' + '─'.repeat(76));

if (warns.length) {
  console.log(`\n  ⚠ ${warns.length} warning(s):`);
  warns.forEach((m) => console.log(`    · ${m}`));
}

if (fails.length) {
  console.log(`\n  ✗ ${fails.length} failure(s):`);
  fails.forEach((m) => console.log(`    · ${m}`));
  console.log('\n  AUDIT FAILED\n');
  process.exit(1);
}

console.log(`\n  ✓ ALL ${effects.length} EFFECTS COVERED — registry complete and consistent\n`);
