# The Deduced Structure

How the SVGator article *"31 Cool Website Animations Examples And Effects"* was analysed, and
the repeatable structure that came out of it — designed so an AI can reproduce **every** effect
in a website build prompt without silently dropping any.

---

## 1. Why the source can't be used as a prompt directly

The article is written for **humans browsing for inspiration**. It gives:

- a name per effect ("Morphing Animation Effects"),
- a designer's rationale (why it feels good),
- example GIFs credited to studios (Noomo, Koto, WIX Studio, Aaron Iker…).

It does **not** give an AI anything executable. Specifically, a raw list of 31 names fails in
five ways:

| Failure | Consequence if you prompt an AI with the raw list |
| --- | --- |
| No trigger | The AI animates everything on page load, or nothing |
| No placement | 31 effects get stacked into one hero and overwhelm the page |
| No motion values | Durations and easings are invented wildly, so it doesn't feel like the reference |
| No reduced-motion fallback | The build ships inaccessible by default |
| No acceptance test | "Done" is unverifiable — effects quietly go missing and nobody notices |

**The core insight:** an inspiration list is a *catalogue of intents*. A build prompt is a
*specification of behaviours*. The structure below is the conversion layer between the two.

---

## 2. The reduction

Every effect in the article, considered as an engineering artefact, answers the same
fourteen questions. Those fourteen answers became the record schema — one record per effect,
31 records total.

| # | Field | Question it answers | Why an AI needs it |
| --- | --- | --- | --- |
| 1 | `id` | Which effect is this? | Stable handle for the coverage audit (`EFFECT-07`) |
| 2 | `n` | Where in the source order? | Traceability back to the article; preserves intended prominence |
| 3 | `name` | What is it called? | Human/designer recognition in review |
| 4 | `family` | What kind of thing is it? | Groups related techniques so the AI can share a code pattern |
| 5 | `one_liner` | What is it, plainly? | The AI's reasoning substrate when adapting the design |
| 6 | `intent` | *Why* does it exist? | Lets the AI preserve the job while changing the technique |
| 7 | `trigger` | What starts it? | The single most important field — gets it wrong and the page is chaos |
| 8 | `stack` | What implements it? | Constrains output to real, client-side-implementable tech |
| 9 | `slot` | Where on the page? | Guarantees no two effects collide for the same surface |
| 10 | `placement` | Exactly how is it placed? | Turns a slot assignment into build instructions |
| 11 | `params` | How does it move? | Duration / easing / stagger / fps — the "feel" the reference has |
| 12 | `perf` | What does it cost? | Prevents a beautiful page that runs at 12fps |
| 13 | `a11y` | What happens without motion / mouse / sight? | Makes the reduced-motion fallback mandatory, not optional |
| 14 | `acceptance` | How do we know it's done? | Binary checks that close each effect out |
| — | `prompt_line` | — | A pre-composed imperative sentence: trigger + technique + placement + constraints, paste-ready |

`prompt_line` is deliberately redundant with fields 7–13. It exists because the AI that *builds*
the site is often not the AI that *reads* the registry — the compressed line is what survives
a copy-paste into a chat box.

---

## 3. Families — clustering by engineering discipline, not by topic

The article's own ordering mixes disciplines (a scroll effect sits between two surface styles).
Re-clustering the 31 effects by **how they are built** turns 31 bespoke jobs into 9 reusable
patterns:

| Family | Name | Effects | Shared pattern |
| --- | --- | --- | --- |
| **A** | Spatial & Dimensional | 01, 03, 14, 19 | Depth illusion — real 3D, or faked with layering/perspective/isometric grids |
| **B** | Narrative & Scroll | 02, 15, 22 | Position-driven: scroll or navigation progress is the timeline |
| **C** | Type & Brand Motion | 04, 10 | Identity in motion — kinetic type, animated marks |
| **D** | Vector Craft | 07, 08, 09, 11, 13, 16, 21 | Hand-authored SVG: line, draw, morph, icon, character, collage, doodle |
| **E** | Atmosphere & Background | 06, 17, 18, 20 | Non-interactive ambience behind the content layer |
| **F** | Interaction & UI | 05, 12, 26 | User input produces immediate, confirming feedback |
| **G** | State & Feedback | 24, 25 | System state (loading) communicated through motion |
| **H** | Surface Styles | 27, 28, 29 | Material metaphors — neumorphic, glass, clay — each a token set + motion rule |
| **I** | Editorial & Media | 23, 30, 31 | Staged presentation: hero composition, catalogues, frame-sequenced media |

Why this matters for prompting: within a family the AI reuses one implementation (e.g. one
scroll-progress engine serves B; one SVG registry serves D), instead of writing 31 unrelated
snippets. It also makes the *conflicts* visible — three members of family H cannot all be the
default surface style, so they get scoped to a playground slot.

---

## 4. Slots — the coverage guarantee

This is the mechanism that makes "include each of all those" actually true rather than
aspirational.

Ten named regions are defined **before** any effect is assigned:

```
S0  Preloader / boot state            S5  Product / catalog viewer
S1  Sticky navigation + chrome        S6  Live collaboration + AR/VR demo bay
S2  Hero (above the fold)             S7  Surface-style playground
S3  Scrollytelling chapter            S8  CTA band + footer
S4  Effect gallery (showcase grid)    S9  404 / error page
G   Global — applies across all sections
```

Three rules make the structure airtight:

1. **Every effect gets exactly one slot.** No effect is left un-homed, and no two fight for
   the same surface. (Where an effect legitimately recurs, the record says so in `placement` —
   e.g. the self-drawing wordmark also serves the S0 preloader.)
2. **Heavy effects are separated by slot.** The two `high`-cost effects (01 WebGL, 03 WebXR)
   land in different slots (S2 and S6) so they never contend for one frame.
3. **Family H is quarantined to S7.** Neumorphic, glassmorphic and claymorphic cannot coexist
   as the site's default surface, and the sticky nav needs exactly one glass treatment, so the
   styles are scoped: glass takes S1, the other two share the S7 playground.

`S4` deliberately carries the most effects (11). It is a *gallery* — the article's own framing —
so a grid of distinct, self-contained showpieces is the correct, honest presentation, and it
keeps the decorative craft effects out of the content-critical path.

---

## 5. Cross-cutting contracts

Applied to all 31 records rather than repeated 31 times:

**Motion tokens.** Four durations (120 / 240 / 400 / 800ms + a 1600ms story beat) and four
easings are defined once. Every record's `params` maps onto them, so the whole site has one
consistent feel instead of 31 invented ones.

**The reduced-motion contract.** Every record carries a `prefers_reduced_motion` value naming
a *legible static state* — not "disable animation". An effect that vanishes under reduced
motion is a broken effect. This is enforced at the record level so it cannot be forgotten.

**Frame budget.** Each record declares `frame_budget_ms` out of a 16.7ms frame. Section-bound
effects total ~112ms, which sounds impossible until you note the sequencing: different slots,
different triggers, and every loop asleep when off-screen or when the tab is hidden. The
budget is a *per-frame, per-visible-effect* ceiling.

**Keyboard equivalence.** Every pointer trigger has a keyboard path recorded in `a11y.keyboard`
— hover reactions fire on `focus-visible`, WebGL orbits respond to arrow keys, flipbooks get
prev/next. This is listed per effect because "make it accessible" as a global instruction is
routinely ignored for exactly the effects that need it most.

---

## 6. The generated prompt

`build-prompt.js` compiles the registry into `SITE-ANIMATION-PROMPT.md`, which is ordered the
way a build actually happens:

```
ROLE                  → who the AI is and what "done" means
HARD CONSTRAINTS      → coverage, reduced motion, performance, a11y, no scroll-jacking
PERFORMANCE PROFILE   → the rollup, so the AI can see the shape of the work
PAGE ARCHITECTURE     → the slot table: which effects live where
BUILD ORDER           → S0 → S9 → Global, each effect with its full spec + acceptance boxes
PASTE-READY PROMPTS   → 31 one-liners for delegating or reviewing effects individually
CROSS-CUTTING RULES   → motion tokens, reduced-motion block, loop-sleeping, rAF batching
QA GATE               → 8 pass/fail checks, including a full coverage audit
APPENDIX              → the raw registry JSON for AI reasoning
```

Because it is generated, the prompt and the registry can never drift. Edit
`registry.json` → rerun `node build-prompt.js` → the prompt is correct again.

---

## 7. The coverage audit

The structure's promise is that no effect goes missing. That is checked mechanically:

- Every record must carry all 14 fields (`schema.json` enforces this).
- `verify.js` asserts 31 records, sequential IDs, no duplicate slot+name collisions, and
  prints the ID → slot → family matrix so a missing effect is visible at a glance.
- The generated prompt ends with a QA gate requiring a 31-row ID → file → component table
  from the builder — the audit happens again at ship time, on the built site.

---

## 8. Extending the structure

To add a 32nd effect (or to analyse a different inspiration article):

1. Append a record to `registry.json` with `id: "EFFECT-32"` and all 14 fields.
2. If it belongs to a new discipline, add a family (`J`, …) in the `families` map.
3. Assign it a slot. If it truly needs new page real estate, add the slot to `slots` and to
   `SLOT_ORDER` in `build-prompt.js`.
4. Add a font/script → rerun `node build-prompt.js`.

The same procedure converts **any** inspiration list into the same reproducible form — see
`PROMPT-TEMPLATE.md` for the blank version of this structure to use on a new list.
