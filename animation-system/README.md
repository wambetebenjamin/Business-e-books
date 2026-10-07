# Website Animation Prompt System

Turns an inspiration list of website effects into a **build prompt that covers every single one**
— verifiably, not aspirationally.

Built by analysing:

> **31 Cool Website Animations Examples And Effects for Inspiration** — SVGator
> https://www.svgator.com/blog/website-animation-examples-and-effects/

---

## The one you want

**`SITE-ANIMATION-PROMPT.md`** — paste this into your AI website builder. It is a complete brief
covering all 31 effects: role, hard constraints, which effect lives in which page slot, a
section-by-section build order with per-effect specs and acceptance checkboxes, cross-cutting
implementation rules, and an 8-point QA gate.

---

## Files

| File | What it is |
| --- | --- |
| **`SITE-ANIMATION-PROMPT.md`** | ⭐ The deliverable — the full website build prompt, 31/31 effects |
| **`registry.json`** | The source of truth. 31 records × 14 fields — every effect decomposed into build instructions |
| **`ANIMATION-SPEC.md`** | The deduced structure explained: why the source can't be prompted directly, the 14 fields, 9 families, 11 slots, cross-cutting contracts |
| **`PROMPT-TEMPLATE.md`** | Blank re-usable version — apply the same structure to any other effect list |
| `schema.json` | Formal schema — enforces that every record carries all 14 fields |
| `build-prompt.js` | Compiles the registry → the prompt |
| `verify.js` | Coverage audit — proves no effect is missing |

---

## Use it

```bash
# prove all 31 effects are covered and consistent
node verify.js

# regenerate the prompt after editing registry.json
node build-prompt.js

# generate a focused prompt for one page region (e.g. the hero)
node build-prompt.js --slot S2 --out HERO-PROMPT.md

# generate a prompt for one family of techniques (e.g. vector craft)
node build-prompt.js --family D --out VECTOR-PROMPT.md
```

Requires Node 18+. No dependencies.

---

## How the structure works

The source article is a **catalogue of intents** written for humans browsing for inspiration.
A build prompt is a **specification of behaviours**. Three ideas bridge the two:

**1 — Fourteen fields per effect.** Every effect answers the same questions: what it is, why it
exists, what triggers it, what implements it, where it sits, how it moves, what it costs, what
happens without motion or a mouse, and how you know it's done. A record missing any of those is
an effect the AI will improvise — and improvising is how effects get silently dropped.

**2 — Eleven slots, assigned before anything else.** Every effect gets exactly one page
region. No effect is un-homed; no two collide for the same surface. Heavy effects are pushed
into different slots, and the three competing surface styles (neumorphic/glass/clay) are
quarantined so they don't all try to be the site's default look. This is the coverage guarantee.

**3 — Cross-cutting contracts instead of 31 repetitions.** One set of motion tokens, one
reduced-motion block, one frame budget model, one keyboard-equivalence rule — inherited by
every effect rather than restated.

Full reasoning in **`ANIMATION-SPEC.md`**.

---

## What the audit proves

```
records      31
families     9
slots        11 (9 populated)
reduced-motion fallbacks declared : 31/31
keyboard paths declared           : 31/31
acceptance checks total           : 95
GPU-composited                    : 26/31
✓ ALL 31 EFFECTS COVERED — registry complete and consistent
```

`verify.js` fails the build on: a missing field, a non-sequential ID, a reduced-motion fallback
that names no real static state (saying "disable animation" is not a fallback), an acceptance
check too vague to test, a `prompt_line` that isn't an imperative instruction, two heavy effects
sharing a slot, or a surface style escaping the playground.

---

## Apply it to a different list

`PROMPT-TEMPLATE.md` has the blank intake worksheet and prompt skeleton. The workflow:

1. Define your page slots **first** — the regions your site actually has.
2. Fill one row per effect: name, intent, **trigger**, stack, slot, params, perf, reduced-motion
   state, keyboard path, 2–3 binary acceptance checks.
3. Paste the rows into the skeleton.
4. Ship only when the coverage table has a row for every effect.

Part C of that file covers adaptations for small lists, 50+ effect lists, unnamed moodboards,
app/dashboard builds, e-commerce, and accessibility-critical work.
