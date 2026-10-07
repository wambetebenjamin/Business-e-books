# Reusable Prompt Template

The blank version of the structure deduced in `ANIMATION-SPEC.md`. Use it on **any** list of
website effects — a different inspiration article, a client's moodboard, a competitor teardown —
to turn it into a prompt that covers every item.

Two parts:

- **Part A** — the intake worksheet: fill one row per effect. This is the thinking step.
- **Part B** — the prompt skeleton: paste the filled rows into it.

---

## PART A — Intake worksheet

One row per effect from your source list. Do not skip rows; do not merge rows. If a field is
unknown, write your best guess and mark it `?` — an effect with a guessed trigger still gets
built, an effect with no row gets forgotten.

### Header

```
Source:            <article / moodboard / brief name>
URL:               <link>
Publisher/author:  <name>
Total effects:     <N>
Target site:       <what is being built — marketing site, portfolio, product app…>
Audience:          <who it is for>
Brand note:        <tone: playful / premium / technical / editorial…>
```

### Effect rows

| ID | Name | Family | One-liner | Intent (why) | Trigger | Stack | Slot | Placement | Params | Perf | Reduced motion | Keyboard | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EFFECT-01 | | | | | | | | | | | | | |
| EFFECT-02 | | | | | | | | | | | | | |
| … | | | | | | | | | | | | | |

### Field cheat-sheet

- **Family** — the engineering discipline: `A` spatial/dimensional · `B` narrative/scroll ·
  `C` type/brand · `D` vector craft · `E` atmosphere · `F` interaction/UI · `G` state/feedback ·
  `H` surface styles · `I` editorial/media.
- **Trigger** — one of: `load`, `in-view`, `scroll`, `hover`, `focus`, `click`, `pointer`,
  `drag`, `idle-loop`, `state-change`, `navigation`, `data-loading`, `multi-user`, `session`.
  Combine with `+`. **This is the field that decides whether the page feels designed or chaotic.**
- **Slot** — assign from your own page regions. Define the slots *first*, then home every effect:
  ```
  S0 preloader · S1 nav chrome · S2 hero · S3 scrollytelling · S4 gallery/showcase
  S5 product/catalog viewer · S6 demo bay (live / AR) · S7 style playground
  S8 CTA + footer · S9 404 · G global
  ```
  Rules: one slot per effect; push `high`-cost effects into different slots; quarantine
  competing surface styles (neumorphic/glass/clay) into one playground slot; give decorative
  craft effects a gallery slot so they stay off the content-critical path.
- **Params** — duration (ms or ms range), easing (`cubic-bezier(...)`), stagger (ms),
  `fps_target`, `intensity` (low/medium/high).
- **Perf** — `cost` (low/medium/high), `gpu` (true if transform/opacity/filter only),
  `frame_budget_ms` out of 16.7ms.
- **Reduced motion** — the **legible static state**, not "off". e.g. "static line-art frame",
  "fully assembled scene", "plain percentage text".
- **Keyboard** — the keyboard path for the trigger, or `n/a` for purely decorative.
- **Acceptance** — 2–3 binary, testable checks. If you cannot write a check, you do not yet
  understand the effect well enough to prompt for it.

---

## PART B — Prompt skeleton

Copy everything below and replace the `<…>` markers. Each `<…>` is mandatory — the entire
point of the structure is that none of them get left as a guess.

````markdown
You are a senior front-end engineer and motion designer. Build a single, production-quality,
fully responsive <site type> that implements **every one of the <N> animation effects
specified below**, each in its assigned page slot. Do not skip, merge, or silently substitute
an effect. If an effect cannot be implemented, say so explicitly and implement the closest
faithful technique — never drop it silently.

## HARD CONSTRAINTS

1. **Coverage.** Every effect ID (<EFFECT-01 … EFFECT-NN>) must be traceable to visible,
   working code. End the build with a table: effect ID → file → component.
2. **Reduced motion is not optional.** Every effect ships its declared
   `prefers-reduced-motion` fallback. An effect without its fallback is an incomplete effect.
3. **Performance.** Respect each effect's frame budget. Animate only `transform`, `opacity`
   and `filter`; never animate `top`/`left`/`width`/`height` for motion.
4. **Accessibility.** Every animation is keyboard-equivalent, screen-reader-safe, and passes
   WCAG AA contrast in its final painted state.
5. **No scroll-jacking.** Native scroll speed and position are never hijacked.
6. **Progressive enhancement.** Content is complete and readable with JavaScript disabled.

## PAGE ARCHITECTURE — SLOTS

| Slot | Region | Effects |
| --- | --- | --- |
| S0 | Preloader / boot state | <…> |
| S1 | Sticky navigation + chrome | <…> |
| S2 | Hero (above the fold) | <…> |
| S3 | Scrollytelling chapter | <…> |
| S4 | Effect gallery | <…> |
| S5 | Product / catalog viewer | <…> |
| S6 | Live / AR-VR demo bay | <…> |
| S7 | Surface-style playground | <…> |
| S8 | CTA band + footer | <…> |
| S9 | 404 / error page | <…> |
| G | Global (all sections) | <…> |

## BUILD ORDER

### <SLOT> — <region name>

#### <EFFECT-ID> · <Name>  `<family>`

- **What:** <one_liner>
- **Why:** <intent>
- **Where:** <placement>
- **Trigger:** <trigger>
- **Stack:** <stack>
- **Motion:** <duration · easing · stagger · fps · intensity>
- **Performance:** <cost>, <gpu|cpu-bound> — budget ≤<n>ms/frame
- **Reduced motion:** <legible static state>
- **Keyboard:** <keyboard path>
- **Semantics:** <aria requirement>
- **Acceptance:**
  - [ ] <check 1>
  - [ ] <check 2>

… repeat for every effect, in the same order as the slot table …

## PASTE-READY EFFECT PROMPTS

- **<EFFECT-ID> (<Name>)** — <one imperative sentence: trigger + technique + placement + constraints>
- … all <N> …

## CROSS-CUTTING IMPLEMENTATION RULES

**Motion tokens.** Define once, reuse everywhere:
```css
:root {
  --dur-instant: 120ms; --dur-quick: 240ms; --dur-base: 400ms;
  --dur-slow: 800ms;    --dur-story: 1600ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-soft: cubic-bezier(0.2, 0, 0, 1);
  --stagger-sm: 40ms; --stagger-md: 80ms;
}
```

**The reduced-motion contract.** One global block; every effect resolves to a legible static
state inside it:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .js-motion { display: none; }
  .static-fallback { display: block; }
}
```

**Loops must sleep.** Every `idle-loop` effect (<list IDs>) pauses off-screen and when the
document is hidden:
```js
const io = new IntersectionObserver(([e]) => e.isIntersecting ? startLoop() : stopLoop(),
  { rootMargin: '10% 0px' });
document.addEventListener('visibilitychange', () =>
  document.hidden ? stopAllLoops() : resumeVisibleLoops());
```

**Scroll work is read-only and rAF-batched.** Sample scroll progress inside
`requestAnimationFrame`; never write layout during a scroll event.

**Canvas and heavy effects are lazy.** Instantiate WebGL/WebXR/particle systems only when
their slot enters the viewport; tear down on exit.

**Every effect is announced or hidden.** Decorative motion gets `aria-hidden="true"`;
state-changing motion updates ARIA state or a polite live region.

## QA GATE — DO NOT SHIP UNTIL ALL PASS

1. All <N> effect IDs appear in the coverage table with a file path.
2. Every effect renders a legible static state under `prefers-reduced-motion: reduce`.
3. Full keyboard pass: every trigger works without a pointer.
4. Tab away during each loop — it stops. Scroll away — it stops.
5. Lighthouse performance ≥ 90 on mobile with all effects enabled.
6. CLS ≈ 0; no effect shifts layout on entry or completion.
7. The page is fully readable with JavaScript disabled.
8. No console errors or warnings from any effect.
````

---

## Part C — Adapting the same structure to other situations

**Fewer effects (5–10).** Keep the worksheet and the slot table; drop the `PASTE-READY` section
and fold each `prompt_line` into its build-order heading. The coverage table in the QA gate is
still the point.

**Many effects (50+).** Keep every field but group the build order by **family** rather than by
slot, so shared code patterns are written once and inherited. Cap each gallery slot at ~12
items and open a second gallery slot (`S4b`) rather than crowding one.

**A client moodboard with no names.** The `intent` and `trigger` columns carry the weight: ask
"what job does this do, and what starts it?" for each reference image. Unnamed effects are
still buildable once those two are answered — that is why they are fields 6 and 7.

**Non-marketing sites (app, dashboard, docs).** Re-map the slots to real regions — onboarding
flow, empty state, data table, settings panel, notification toast — and re-run the family
clustering. Families A–I are disciplines, not topics, so they transfer unchanged.

**E-commerce.** Layer the catalogue slots: S2 hero, S5 product viewer (flipbook + faux-3D
rotation), S8 campaign CTA. Keep cart and checkout animation in the `microinteraction` family
and hold it to the 120–240ms band — confirmation motion is usability, not decoration.

**Accessibility-critical builds.** Promote `a11y` from a sub-object to top-level required fields
so it cannot be nested away, and add a ninth QA check: run the reduced-motion pass with a
screen reader before the visual pass.
