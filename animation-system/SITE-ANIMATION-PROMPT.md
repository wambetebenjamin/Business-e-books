# Website Animation Build Prompt

**Generated from `registry.json` — 31 of 31 effects.**
Source article: 31 Cool Website Animations Examples And Effects for Inspiration — SVGator (https://www.svgator.com/blog/website-animation-examples-and-effects/)

> Paste everything below the divider into your AI website builder. It is written as one
> continuous brief: role, constraints, section-by-section blueprints, then per-effect specs.

---

## ROLE

You are a senior front-end engineer and motion designer. Build a single, production-quality,
fully responsive marketing website that implements **every one of the 31 animation
effects specified below**, each in its assigned page slot. Do not skip, merge or silently
substitute an effect. If an effect cannot be implemented with the available stack, say so
explicitly and implement the closest faithful technique — never drop it silently.

## HARD CONSTRAINTS

1. **Coverage.** Every effect ID (EFFECT-01, EFFECT-02, EFFECT-03, EFFECT-04, EFFECT-05, EFFECT-06, EFFECT-07, EFFECT-08, EFFECT-09, EFFECT-10, EFFECT-11, EFFECT-12, EFFECT-13, EFFECT-14, EFFECT-15, EFFECT-16, EFFECT-17, EFFECT-18, EFFECT-19, EFFECT-20, EFFECT-21, EFFECT-22, EFFECT-23, EFFECT-24, EFFECT-25, EFFECT-26, EFFECT-27, EFFECT-28, EFFECT-29, EFFECT-30, EFFECT-31) must be traceable to
   visible, working code. At the end of the build, output a table: effect ID → file → component.
2. **Reduced motion is not optional.** Every effect ships its `prefers-reduced-motion` fallback
   below. An effect without its fallback is an incomplete effect.
3. **Performance.** Respect each effect's frame budget. The 24 section-bound effects
   total ~112ms of frame time, but they never all run simultaneously (different slots,
   different triggers, loops asleep off-screen) so no single frame may exceed 16.7ms.
   Animate only `transform`, `opacity` and
   `filter` where possible; never animate `top`/`left`/`width`/`height` for motion.
4. **Accessibility.** Every animation is keyboard-equivalent, screen-reader-safe and passes
   WCAG AA contrast in its final painted state.
5. **No scroll-jacking.** Native scroll speed and position are never hijacked.
6. **Progressive enhancement.** Content is complete and readable with JavaScript disabled.

## PERFORMANCE PROFILE

| Metric | Value |
| --- | --- |
| Effects to build | 31 |
| GPU-composited | 26 of 31 |
| Cost split | 2 high, 11 medium, 18 low |
| Page slots used | G, S0, S1, S2, S3, S4, S5, S6, S7 |
| Dominant techniques | SVG, CSS keyframes, CSS transforms, CSS transitions, IntersectionObserver, CSS animation, CSS, Web Animations API |
| Trigger mix | in-view (15), hover (10), scroll (8), click (6), load (5), idle-loop (3), pointer-drag (1), click (opt-in) (1), device motion (1), multi-user event (1), click (replay) (1), state-change (1), pointer (1), navigation (1), data-loading state (1), async request (1), focus (1), drag (1) |

## PAGE ARCHITECTURE — SLOTS

The page is divided into named slots. Effects are assigned to exactly one slot, so no two
effects compete for the same surface.

| Slot | Region | Effects |
| --- | --- | --- |
| S0 | Preloader / boot state | **EFFECT-25** Loading Animations |
| S1 | Sticky navigation + header chrome | **EFFECT-10** Animated Logos<br>**EFFECT-11** Animated Icons<br>**EFFECT-28** Glassmorphic Animation Effect |
| S2 | Hero (above the fold) | **EFFECT-01** Real-Time Rendering<br>**EFFECT-04** Expressive Typography Animations<br>**EFFECT-23** Hero Section Web Animations |
| S3 | Scrollytelling chapter | **EFFECT-02** Scrollytelling |
| S4 | Effect gallery (showcase grid) | **EFFECT-07** Line Animation Examples<br>**EFFECT-08** Self-Drawing Animation Effects<br>**EFFECT-09** Morphing Animation Effects<br>**EFFECT-13** Character Website Animations<br>**EFFECT-14** Faux 3D Animation Effects<br>**EFFECT-15** Vertical and Horizontal Scrolling Effects<br>**EFFECT-16** Mixed Media Web Animation Examples<br>**EFFECT-17** Liquid Motion Effects<br>**EFFECT-19** Isometric Animation Effects<br>**EFFECT-21** Doodle Web Animations<br>**EFFECT-31** Stop-Motion Animation Effect |
| S5 | Product / catalog viewer | **EFFECT-30** Animated Flipbooks |
| S6 | Live collaboration + AR/VR demo bay | **EFFECT-03** AR/VR Motion Graphics<br>**EFFECT-05** Real-Time Collaborative Animations |
| S7 | Surface-style playground (neumorphic / glass / clay) | **EFFECT-27** Neumorphic Animation Effect<br>**EFFECT-29** Claymorphic Animation Effect |
| G | Global — applies across all sections | **EFFECT-06** Ambient Background Motion<br>**EFFECT-12** Microinteractions \| UI Animation Examples<br>**EFFECT-18** Animated Gradient Effects<br>**EFFECT-20** Background Website Animations<br>**EFFECT-22** Website Page Transition Effects<br>**EFFECT-24** Loading Skeleton Screens<br>**EFFECT-26** Hover Web Animation Effects |

## BUILD ORDER

Build the page in this order. Each step lists the effects it must include and the
acceptance checks that close it out.

### S0 — Preloader / boot state

#### EFFECT-25 · Loading Animations  `G`

- **What:** Progress and preloader animations that confirm a request is being handled.
- **Why:** Reduce frustration when load time exceeds the user's expectation of zero.
- **Where:** Branded preloader on boot (mascot + progress), plus a thin top scroll-progress bar.
- **Trigger:** load + async request
- **Stack:** SVG, CSS keyframes, scroll-progress bar
- **Motion:** duration ms: until ready · easing: ease-out · fps target: 60 · intensity: medium
- **Performance:** low cost, GPU-composited — budget ≤3ms/frame
- **Reduced motion:** static 'Loading…' text with percentage
- **Keyboard:** focus is not trapped during load
- **Semantics:** role=status with polite live announcement on completion
- **Acceptance:**
  - [ ] Preloader never blocks content longer than 2s
  - [ ] A skip/continue control appears if load exceeds 3s
  - [ ] role=status announces completion
  - [ ] Keyboard focus can leave the preloader at any time (no focus trap)

### S1 — Sticky navigation + header chrome

#### EFFECT-10 · Animated Logos  `C`

- **What:** The logotype, logomark or mascot animated as a reusable brand asset.
- **Why:** Push brand identity to the front of the visitor's memory.
- **Where:** Nav logo animates on first load and replays on click; also the S0 preloader mark.
- **Trigger:** load + click (replay)
- **Stack:** SVG, CSS keyframes
- **Motion:** duration ms: 900–1600 · easing: cubic-bezier(0.34,1.56,0.64,1) · fps target: 60 · intensity: medium
- **Performance:** low cost, GPU-composited — budget ≤3ms/frame
- **Reduced motion:** static logo
- **Keyboard:** logo is a focusable link
- **Semantics:** accessible name is the brand, not 'animation'
- **Acceptance:**
  - [ ] Animation plays once on load, not on every route change
  - [ ] Logo remains a working home link
  - [ ] Animation replays on click for delight

#### EFFECT-11 · Animated Icons  `D`

- **What:** Icons that respond to clicks or hover, adding clarity and feedback.
- **Why:** Improve usability and signal a two-way interaction with the brand.
- **Where:** Nav and utility icons animate on hover; active state animates on click.
- **Trigger:** hover + click
- **Stack:** inline SVG, CSS transitions
- **Motion:** duration ms: 180–420 · easing: cubic-bezier(0.2,0,0,1) · fps target: 60 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤2ms/frame
- **Reduced motion:** instant state swap
- **Keyboard:** focus-visible triggers the same animation
- **Semantics:** icons labelled or aria-hidden inside labelled buttons
- **Acceptance:**
  - [ ] Every icon button has an accessible name
  - [ ] focus-visible mirrors hover behaviour
  - [ ] No icon animation exceeds 420ms

#### EFFECT-28 · Glassmorphic Animation Effect  `H`

- **What:** Translucent, layered glass panels with depth, blur and texture.
- **Why:** Make UI surfaces feel premium and dimensional.
- **Where:** Sticky nav becomes a glass panel on scroll; surface card 2 is a glass widget set.
- **Trigger:** scroll + hover
- **Stack:** backdrop-filter: blur(), translucent borders, noise texture
- **Motion:** duration ms: 250–500 · easing: ease-out · blur px: 8–20 · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** static translucent panel, no blur animation
- **Keyboard:** focus ring visible against the blurred backdrop
- **Semantics:** content inside glass meets contrast (backdrop is not guaranteed)
- **Acceptance:**
  - [ ] Solid colour fallback when backdrop-filter is unsupported
  - [ ] Blur radius capped at 20px for paint cost
  - [ ] Focus indicators remain visible over the glass

### S2 — Hero (above the fold)

#### EFFECT-01 · Real-Time Rendering  `A`

- **What:** Hyper-realistic, GPU-accelerated 3D environments the visitor can explore live.
- **Why:** Add depth, detail and interactivity; let users inspect a product or space from any angle.
- **Where:** Full-bleed canvas behind the hero copy; drag to orbit a hero product/object.
- **Trigger:** load + pointer-drag
- **Stack:** WebGL, Three.js, GPU
- **Motion:** duration ms: continuous · easing: damped orbit (lerp 0.08) · fps target: 60 · intensity: medium
- **Performance:** high cost, GPU-composited — budget ≤8ms/frame
- **Reduced motion:** swap canvas for a pre-rendered poster image
- **Keyboard:** arrow keys orbit the object
- **Semantics:** canvas labelled + text alternative describing the object
- **Acceptance:**
  - [ ] Object orbits on drag at 60fps
  - [ ] Scene degrades to static poster under reduced-motion
  - [ ] No layout shift on scene init

#### EFFECT-04 · Expressive Typography Animations  `C`

- **What:** Bold kinetic type, glitch effects and animated lettering that carry the message.
- **Why:** Convey brand personality and grab attention in the first second.
- **Where:** Hero H1 — per-letter stagger reveal, plus a glitch pass on the key word.
- **Trigger:** load + in-view
- **Stack:** CSS keyframes, clip-path, split-text spans
- **Motion:** duration ms: 700–1200 · stagger ms: 40 · easing: cubic-bezier(0.16,1,0.3,1) · fps target: 60 · intensity: medium
- **Performance:** low cost, GPU-composited — budget ≤4ms/frame
- **Reduced motion:** letters render final state instantly
- **Keyboard:** n/a
- **Semantics:** split letters wrapped in aria-hidden spans with an sr-only full string
- **Acceptance:**
  - [ ] Text is selectable and searchable
  - [ ] Screen reader announces one clean sentence, not 40 letters
  - [ ] No FOUT jump on reveal

#### EFFECT-23 · Hero Section Web Animations  `I`

- **What:** The staged entrance of the entire above-the-fold composition.
- **Why:** Make the strongest possible first impression and land the key message fast.
- **Where:** Orchestration layer for the hero: eyebrow, headline, sub, CTA, visual — in sequence.
- **Trigger:** load
- **Stack:** CSS keyframes, orchestrated delays, Web Animations API
- **Motion:** duration ms: 400–900 · stagger ms: 80 · easing: cubic-bezier(0.16,1,0.3,1) · fps target: 60 · intensity: high
- **Performance:** low cost, GPU-composited — budget ≤4ms/frame
- **Reduced motion:** all hero elements visible immediately
- **Keyboard:** CTA is focusable before animation completes
- **Semantics:** no aria-live churn during the entrance
- **Acceptance:**
  - [ ] Whole sequence completes under 1.6s
  - [ ] LCP element is not delayed by the animation
  - [ ] CTA is clickable before the sequence ends

### S3 — Scrollytelling chapter

#### EFFECT-02 · Scrollytelling  `B`

- **What:** Scroll position drives a narrative; the story unfolds as the user moves down the page.
- **Why:** Turn passive scrolling into a guided journey that delivers content in sequence.
- **Where:** Pinned chapter that advances through 4 beats as scroll progress goes 0→1.
- **Trigger:** scroll
- **Stack:** IntersectionObserver, CSS transforms, scroll-timeline
- **Motion:** duration ms: scroll-linked · easing: linear progress + eased reveals · fps target: 60 · intensity: high
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** unpin; render all beats as a normal stacked article
- **Keyboard:** every beat reachable and readable without scrolling animations
- **Semantics:** beats are real headings in order
- **Acceptance:**
  - [ ] 4 beats advance with scroll
  - [ ] Fully readable as static stacked content with JS off
  - [ ] No scroll-jacking; wheel speed stays native

### S4 — Effect gallery (showcase grid)

#### EFFECT-07 · Line Animation Examples  `D`

- **What:** Thin-line vector artwork animated with weightless, unrestricted motion.
- **Why:** Give illustration life with minimal visual weight.
- **Where:** Gallery card 1 — line-art scene with looping subtle motion.
- **Trigger:** in-view
- **Stack:** SVG, stroke-dasharray, CSS
- **Motion:** duration ms: 1200–2200 · easing: ease-in-out · fps target: 60 · intensity: low
- **Performance:** low cost, CPU-bound — budget ≤3ms/frame
- **Reduced motion:** static line-art frame
- **Keyboard:** n/a
- **Semantics:** role=img with descriptive aria-label
- **Acceptance:**
  - [ ] SVG stays sharp at any zoom
  - [ ] Animation only runs while card is in viewport
  - [ ] Inline SVG payload stays under 40KB uncompressed

#### EFFECT-08 · Self-Drawing Animation Effects  `D`

- **What:** Stroke-path animation that draws (and un-draws) artwork as if by hand.
- **Why:** Produce intricate sketch-like reveals for wordmarks, illustrations and loaders.
- **Where:** Gallery card 2 — wordmark that draws itself on entry; also used in the S0 preloader.
- **Trigger:** in-view + scroll
- **Stack:** SVG path, stroke-dashoffset, scroll-linked
- **Motion:** duration ms: 1400–2600 · easing: ease-out · fps target: 60 · intensity: medium
- **Performance:** low cost, CPU-bound — budget ≤3ms/frame
- **Reduced motion:** wordmark shown complete
- **Keyboard:** n/a
- **Semantics:** role=img + aria-label
- **Acceptance:**
  - [ ] Path draws once, does not loop distractingly
  - [ ] Final stroke state persists after animation
  - [ ] Path length computed at runtime, not hardcoded

#### EFFECT-09 · Morphing Animation Effects  `D`

- **What:** One shape continuously transforms into another — liquid, match-cut, object-to-object.
- **Why:** Create fast-paced, surprising transitions and visual storytelling.
- **Where:** Gallery card 3 — shape morphs through 3 states on hover/in-view.
- **Trigger:** in-view + hover
- **Stack:** SVG morph, matched point count, SMIL/CSS
- **Motion:** duration ms: 600–1100 · easing: cubic-bezier(0.65,0,0.35,1) · fps target: 60 · intensity: medium
- **Performance:** medium cost, CPU-bound — budget ≤5ms/frame
- **Reduced motion:** crossfade between states instead of morph
- **Keyboard:** focus triggers the same transition as hover
- **Semantics:** role=img + aria-label describing both shapes
- **Acceptance:**
  - [ ] Both paths share equal command/point counts
  - [ ] Morph is reversible on mouse-out
  - [ ] Keyboard focus triggers identical transition

#### EFFECT-13 · Character Website Animations  `D`

- **What:** Animated characters and mascots that make a brand feel human and relatable.
- **Why:** Build emotional connection and carry brand voice.
- **Where:** Gallery card 4 — mascot reacts to hover; a second mascot waves in the S8 CTA band.
- **Trigger:** in-view + hover + scroll
- **Stack:** SVG rig, CSS keyframes, transform origins
- **Motion:** duration ms: 500–1800 · easing: ease-in-out with overshoot · fps target: 60 · intensity: medium
- **Performance:** low cost, GPU-composited — budget ≤4ms/frame
- **Reduced motion:** static pose
- **Keyboard:** hover reaction also fires on focus
- **Semantics:** role=img + aria-label
- **Acceptance:**
  - [ ] Character motion is decoupled from page scroll performance
  - [ ] Hover reaction also fires on focus
  - [ ] Mascot is decorative — never the only carrier of information

#### EFFECT-14 · Faux 3D Animation Effects  `A`

- **What:** The illusion of 3D built from layering, perspective, scale, skew and rotate.
- **Why:** Get depth and dimension at a fraction of true-3D performance cost.
- **Where:** Gallery card 5 — layered object rotates and parallaxes with the pointer.
- **Trigger:** in-view + pointer
- **Stack:** CSS 3D transforms, perspective, stacked SVG layers
- **Motion:** duration ms: 700–1400 · easing: ease-out · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤5ms/frame
- **Reduced motion:** single flat front-on view
- **Keyboard:** tilt can be driven by arrow keys or omitted without info loss
- **Semantics:** role=img + aria-label
- **Acceptance:**
  - [ ] No WebGL dependency
  - [ ] Rotation is bounded (never spins fully away from content)
  - [ ] Layer count under 12 for paint cost

#### EFFECT-15 · Vertical and Horizontal Scrolling Effects  `B`

- **What:** Carousels, scroll snapping, reveals and parallax across both scroll axes.
- **Why:** Direct focus and create anticipation as the visitor travels the page.
- **Where:** Horizontal snap rail inside the gallery, plus parallax depth on section backgrounds.
- **Trigger:** scroll
- **Stack:** scroll-snap, CSS transforms, IntersectionObserver
- **Motion:** duration ms: scroll-linked · easing: snap easing · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** rail becomes a wrapped grid, no snapping
- **Keyboard:** rail items are focusable and scroll into view
- **Semantics:** rail labelled as a list/group with item count
- **Acceptance:**
  - [ ] Horizontal rail is keyboard-scrollable
  - [ ] Parallax layers use transform only, never top/left
  - [ ] No snap traps the user between items

#### EFFECT-16 · Mixed Media Web Animation Examples  `D`

- **What:** Photography, vector, grain, texture and type collaged into one moving composition.
- **Why:** Deliver a fresh, striking, editorial feel that reads as culturally current.
- **Where:** Gallery card 6 — photo cut-outs collage and drift against a grainy vector backdrop.
- **Trigger:** in-view + scroll
- **Stack:** SVG masks, blend modes, grain overlay, video
- **Motion:** duration ms: 900–2000 · easing: ease-in-out · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** static collage
- **Keyboard:** n/a
- **Semantics:** informative images have alt text; decorative grain is aria-hidden
- **Acceptance:**
  - [ ] Grain overlay is aria-hidden decoration
  - [ ] Images are lazy-loaded and dimensioned (no CLS)
  - [ ] Blend modes do not break text contrast

#### EFFECT-17 · Liquid Motion Effects  `E`

- **What:** Organic, flowing movement — morphing blobs, liquid text, ripples, colour shifts.
- **Why:** Create captivating, soft transitions with an organic feel.
- **Where:** Gallery card 7 — gooey blob transition; liquid spill motif reused on the S9 404 page.
- **Trigger:** in-view + hover
- **Stack:** SVG filter (feGaussianBlur + feColorMatrix), border-radius morph, canvas
- **Motion:** duration ms: 900–1800 · easing: ease-in-out · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** simple opacity fade
- **Keyboard:** hover reaction fires on focus
- **Semantics:** role=img + aria-label
- **Acceptance:**
  - [ ] SVG filter is not applied to text (blur/legibility)
  - [ ] Filter region bounded to avoid full-page repaint
  - [ ] 404 page keeps its message readable

#### EFFECT-19 · Isometric Animation Effects  `A`

- **What:** 2D isometric perspective (axes at 120 degrees) that reads as dimensional space.
- **Why:** Show structure and process with clarity while adding dimensionality.
- **Where:** Gallery card 8 — isometric scene assembles piece by piece on scroll.
- **Trigger:** in-view + scroll
- **Stack:** SVG, isometric grid, CSS transforms
- **Motion:** duration ms: 800–1600 · easing: cubic-bezier(0.16,1,0.3,1) · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤5ms/frame
- **Reduced motion:** fully assembled scene
- **Keyboard:** n/a
- **Semantics:** role=img + aria-label describing the scene
- **Acceptance:**
  - [ ] Axes hold consistent 120-degree isometric angles
  - [ ] No converging/perspective lines
  - [ ] Scene readable as a static diagram when paused

#### EFFECT-21 · Doodle Web Animations  `D`

- **What:** Playful hand-drawn sketches brought to life in the interface.
- **Why:** Make interacting fun and encourage longer exploration.
- **Where:** Gallery card 9 — doodle header scribbles; doodle arrows on the menu open state.
- **Trigger:** in-view + hover + click
- **Stack:** SVG, stroke animation, CSS
- **Motion:** duration ms: 600–1500 · easing: ease-out with slight overshoot · fps target: 60 · intensity: low
- **Performance:** low cost, CPU-bound — budget ≤3ms/frame
- **Reduced motion:** static doodle
- **Keyboard:** menu doodle tied to aria-expanded state
- **Semantics:** decorative doodles aria-hidden
- **Acceptance:**
  - [ ] Doodles never obscure labels or controls
  - [ ] Menu doodle state matches aria-expanded
  - [ ] Stroke animation does not run on every re-render

#### EFFECT-31 · Stop-Motion Animation Effect  `I`

- **What:** Sequenced still frames that create a nostalgic, hand-made illusion of movement.
- **Why:** Deliver a distinctive, highly engaging retro aesthetic.
- **Where:** Gallery card 10 — frame-stepped sprite animation at 8-12fps.
- **Trigger:** in-view + hover
- **Stack:** sprite sheet, steps() timing, frame sequence
- **Motion:** duration ms: 800–1600 · easing: steps(n) · fps target: 12 · intensity: medium
- **Performance:** low cost, GPU-composited — budget ≤2ms/frame
- **Reduced motion:** single representative frame
- **Keyboard:** n/a
- **Semantics:** role=img + aria-label
- **Acceptance:**
  - [ ] Uses steps() timing, not a smooth tween
  - [ ] Sprite sheet is one optimised image request
  - [ ] Animation halts when off-screen

### S5 — Product / catalog viewer

#### EFFECT-30 · Animated Flipbooks  `I`

- **What:** Interactive page-flip catalogues with embedded media, video, audio and maps.
- **Why:** Present long-form or PDF content as a browsable, tactile publication.
- **Where:** Catalog viewer with realistic 3D page flip and a plain reading-mode toggle.
- **Trigger:** click + drag
- **Stack:** CSS 3D transforms, pointer/touch drag, embedded media
- **Motion:** duration ms: 500–900 · easing: cubic-bezier(0.4,0,0.2,1) · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** instant page swap
- **Keyboard:** prev/next buttons and page-number input
- **Semantics:** page changes announced; every page available as selectable text
- **Acceptance:**
  - [ ] Flip works with keyboard prev/next, not only drag
  - [ ] A text/reading mode exists for assistive tech and SEO
  - [ ] Pages are lazily rendered, not all mounted at once

### S6 — Live collaboration + AR/VR demo bay

#### EFFECT-03 · AR/VR Motion Graphics  `A`

- **What:** Animation placed into augmented or virtual space, reacting to the real environment.
- **Why:** Guide attention and tell stories inside immersive environments.
- **Where:** Demo bay with an 'Enter AR' button; non-AR devices get a draggable 360 preview.
- **Trigger:** click (opt-in) + device motion
- **Stack:** WebXR, DeviceOrientation, fallback: 360 video
- **Motion:** duration ms: session · easing: spatial damping · fps target: 60 · intensity: high
- **Performance:** high cost, GPU-composited — budget ≤8ms/frame
- **Reduced motion:** static 360 still
- **Keyboard:** 'Enter AR' is a real focusable button
- **Semantics:** button announces AR availability and device support
- **Acceptance:**
  - [ ] AR start is user-initiated, never autoplay
  - [ ] Unsupported devices get the 360 fallback
  - [ ] Exit control always visible

#### EFFECT-05 · Real-Time Collaborative Animations  `F`

- **What:** Several users animate and interact with the same elements simultaneously.
- **Why:** Make digital interaction feel shared, connected and alive.
- **Where:** Live board where visitor cursors and reactions broadcast to all open sessions.
- **Trigger:** multi-user event
- **Stack:** WebSocket, CRDT/presence, optimistic UI
- **Motion:** duration ms: 200–400 · easing: spring · fps target: 60 · intensity: medium
- **Performance:** medium cost, CPU-bound — budget ≤6ms/frame
- **Reduced motion:** presence shown as static avatars, no motion
- **Keyboard:** solo users can still act on the board
- **Semantics:** live region announces join/leave politely
- **Acceptance:**
  - [ ] Works with a single visitor (no crash, no empty state)
  - [ ] Presence updates under 200ms locally via optimistic UI
  - [ ] Reconnects automatically after network drop

### S7 — Surface-style playground (neumorphic / glass / clay)

#### EFFECT-27 · Neumorphic Animation Effect  `H`

- **What:** Soft, extruded, tactile UI that appears to rise out of the background.
- **Why:** Create intuitive, physically legible controls.
- **Where:** Surface playground card 1 — neumorphic toggle, spinner, clock and chart cluster.
- **Trigger:** hover + click + in-view
- **Stack:** CSS box-shadow (dual, light/dark), matching base colour
- **Motion:** duration ms: 200–600 · easing: ease-out · fps target: 60 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤4ms/frame
- **Reduced motion:** static shadow states
- **Keyboard:** pressed state visible on focus and activation
- **Semantics:** contrast of label text verified against the soft base (common neumorphism failure)
- **Acceptance:**
  - [ ] Text contrast passes WCAG AA against the base surface
  - [ ] Pressed state is distinguishable, not just a shadow inversion
  - [ ] Shadow animation does not trigger full repaint

#### EFFECT-29 · Claymorphic Animation Effect  `H`

- **What:** Claymation-inspired surfaces: pastel, oversized radii, heavy inner and outer shadow.
- **Why:** Add a playful, soft, tactile personality to the UI.
- **Where:** Surface playground card 3 — clay buttons and a clay writing/drawing animation.
- **Trigger:** hover + click + in-view
- **Stack:** CSS box-shadow (inner + outer), large border-radius, pastel palette
- **Motion:** duration ms: 300–900 · easing: cubic-bezier(0.34,1.56,0.64,1) · fps target: 60 · intensity: medium
- **Performance:** low cost, GPU-composited — budget ≤4ms/frame
- **Reduced motion:** static clay surface
- **Keyboard:** squish/press state on focus and activation
- **Semantics:** pastel-on-pastel contrast verified
- **Acceptance:**
  - [ ] Pastel palette meets AA contrast for all text
  - [ ] Press state reads as physical deformation
  - [ ] Inner+outer shadows defined once as tokens, reused

### G — Global — applies across all sections

#### EFFECT-06 · Ambient Background Motion  `E`

- **What:** Subtle gradients, particles and slow flows that add depth without stealing focus.
- **Why:** Create atmosphere while keeping attention on the content layer.
- **Where:** Site-wide ambient layer behind all sections, capped at low opacity.
- **Trigger:** idle-loop
- **Stack:** SVG, CSS animation, canvas particles
- **Motion:** duration ms: infinite loop 18-30s · easing: linear / ease-in-out · fps target: 30 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤3ms/frame
- **Reduced motion:** freeze on first frame
- **Keyboard:** n/a
- **Semantics:** aria-hidden, decorative only
- **Acceptance:**
  - [ ] Ambient layer never exceeds 0.25 opacity behind text
  - [ ] Pauses when tab is hidden
  - [ ] Text contrast still passes WCAG AA over the moving layer

#### EFFECT-12 · Microinteractions \| UI Animation Examples  `F`

- **What:** Small single-purpose animations that confirm a specific user action.
- **Why:** Make the interface feel responsive, reduce confusion, guide the journey.
- **Where:** Buttons, toggles, form fields, nav bar, search box, CTA states.
- **Trigger:** click + state-change
- **Stack:** CSS transitions, Web Animations API
- **Motion:** duration ms: 120–320 · easing: cubic-bezier(0.2,0,0,1) · fps target: 60 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤2ms/frame
- **Reduced motion:** instant state change
- **Keyboard:** all states reachable and visible on focus
- **Semantics:** aria-pressed on toggles, aria-invalid on errors
- **Acceptance:**
  - [ ] Every interactive element has hover, active, focus and disabled motion states
  - [ ] Toggle exposes aria-pressed
  - [ ] No microinteraction blocks the action it confirms

#### EFFECT-18 · Animated Gradient Effects  `E`

- **What:** Colour transitions in motion that set mood and pull the eye to key elements.
- **Why:** Shape tone and guide focus using motion alone.
- **Where:** Hero backdrop and CTA band; animated gradient accents on highlight cards.
- **Trigger:** idle-loop + in-view
- **Stack:** CSS gradient, background-position, @property, SVG gradient
- **Motion:** duration ms: loop 8-16s · easing: linear · fps target: 30 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤3ms/frame
- **Reduced motion:** static gradient stop
- **Keyboard:** n/a
- **Semantics:** decorative, aria-hidden
- **Acceptance:**
  - [ ] Animates background-position or a registered custom property, never repaints layout
  - [ ] Contrast verified at both gradient extremes
  - [ ] Frame rate throttled to ~30fps for background loops

#### EFFECT-20 · Background Website Animations  `E`

- **What:** Animated section backdrops that set atmosphere and frame the value proposition.
- **Why:** Add depth and introduce the brand promise before a word is read.
- **Where:** Distinct animated backdrop per major section, all under the content layer.
- **Trigger:** in-view + idle-loop
- **Stack:** SVG pattern, CSS animation, video (muted, lazy)
- **Motion:** duration ms: loop 12-24s · easing: ease-in-out · fps target: 30 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤3ms/frame
- **Reduced motion:** first frame only
- **Keyboard:** n/a
- **Semantics:** aria-hidden, decorative
- **Acceptance:**
  - [ ] Backgrounds pause when scrolled out of view
  - [ ] Content contrast maintained over every backdrop
  - [ ] Total background payload under 300KB

#### EFFECT-22 · Website Page Transition Effects  `B`

- **What:** Fades, slides and full-page reveals that carry the user between views.
- **Why:** Make navigation feel seamless and give clear cues about where the user went.
- **Where:** Between sections/views and on anchor navigation.
- **Trigger:** navigation + scroll
- **Stack:** View Transitions API, CSS fallback, router hooks
- **Motion:** duration ms: 300–700 · easing: cubic-bezier(0.4,0,0.2,1) · fps target: 60 · intensity: medium
- **Performance:** medium cost, GPU-composited — budget ≤6ms/frame
- **Reduced motion:** instant cut (or 1-frame crossfade)
- **Keyboard:** focus moves to the new view's heading on completion
- **Semantics:** route change announced via live region
- **Acceptance:**
  - [ ] Total transition under 700ms
  - [ ] Focus moves to the new view heading
  - [ ] No double-scroll or scroll-position loss
  - [ ] Progressive enhancement if View Transitions unsupported

#### EFFECT-24 · Loading Skeleton Screens  `G`

- **What:** Shimmering placeholder shapes that stand in for content while it loads.
- **Why:** Make waiting feel faster and hold layout stable during fetch.
- **Where:** Bento-grid cards in the gallery show skeletons until their content resolves.
- **Trigger:** data-loading state
- **Stack:** CSS shimmer, bento grid, aria-busy
- **Motion:** duration ms: loop 1.2-2s · easing: linear · fps target: 30 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤2ms/frame
- **Reduced motion:** static grey placeholders, no shimmer
- **Keyboard:** n/a
- **Semantics:** container aria-busy=true while loading, aria-hidden skeletons
- **Acceptance:**
  - [ ] Skeleton dimensions match the loaded content exactly (zero CLS)
  - [ ] aria-busy cleared on resolve
  - [ ] Skeleton is replaced within one frame of data arriving

#### EFFECT-26 · Hover Web Animation Effects  `F`

- **What:** Hover states that reveal extra information on icons, buttons and cards.
- **Why:** Keep the interface clean while adding depth and immersion on intent.
- **Where:** All cards, links, avatars and submenu items.
- **Trigger:** hover + focus
- **Stack:** CSS transitions, pointer media query
- **Motion:** duration ms: 150–400 · easing: cubic-bezier(0.2,0,0,1) · fps target: 60 · intensity: low
- **Performance:** low cost, GPU-composited — budget ≤2ms/frame
- **Reduced motion:** instant state change
- **Keyboard:** every hover reveal is also reachable via focus-visible
- **Semantics:** hover-only content is not the sole source of information
- **Acceptance:**
  - [ ] Hover effects gated behind @media (hover: hover)
  - [ ] No information exists only on hover
  - [ ] Touch devices get an equivalent tap state

## PASTE-READY EFFECT PROMPTS

The same 31 effects as one imperative line each. Use these verbatim when
delegating individual effects, or as the checklist when reviewing the build.

- **EFFECT-01 (Real-Time Rendering)** — Build a WebGL/Three.js canvas behind the hero that renders one product object in real time, orbitable by drag (arrow keys for keyboard users), with a pre-rendered poster-image fallback when prefers-reduced-motion is set.
- **EFFECT-02 (Scrollytelling)** — Create a pinned scrollytelling chapter of 4 narrative beats driven by scroll progress, using IntersectionObserver, that flattens into a plain stacked article under prefers-reduced-motion and never hijacks native wheel speed.
- **EFFECT-03 (AR/VR Motion Graphics)** — Add a demo bay with an opt-in 'Enter AR' WebXR experience (never autoplaying), a draggable 360 preview fallback for unsupported devices, and a persistent, focusable exit control.
- **EFFECT-04 (Expressive Typography Animations)** — Animate the hero headline with a per-letter stagger reveal and a glitch pass on the emphasised keyword, wrapping split glyphs in aria-hidden spans with one sr-only full-string copy so screen readers read a clean sentence.
- **EFFECT-05 (Real-Time Collaborative Animations)** — Build a presence-driven live board over WebSockets where visitor cursors and reactions broadcast to all open sessions, using optimistic local updates, automatic reconnect, and a graceful single-visitor state.
- **EFFECT-06 (Ambient Background Motion)** — Add a site-wide ambient background layer of slow-drifting gradients and particles, aria-hidden and capped below 0.25 opacity, paused when the tab is hidden and frozen entirely under prefers-reduced-motion.
- **EFFECT-07 (Line Animation Examples)** — Build gallery card 1 as inline SVG line-art with looping subtle motion, running only while in viewport, role=img with a descriptive label, and a static frame under reduced-motion.
- **EFFECT-08 (Self-Drawing Animation Effects)** — Implement a self-drawing stroke-path wordmark in gallery card 2 (reused by the preloader), computing path length at runtime, drawing once on entry and persisting the final state.
- **EFFECT-09 (Morphing Animation Effects)** — Create gallery card 3 as an SVG morph cycling three states, with matched point counts, reversible on mouse-out, triggered identically by keyboard focus, and replaced by a crossfade under reduced-motion.
- **EFFECT-10 (Animated Logos)** — Animate the brand logo in the navigation so it plays once on first load and replays on click, keeping it a focusable home link whose accessible name is the brand name.
- **EFFECT-11 (Animated Icons)** — Animate the navigation and utility icons on hover, focus-visible and click (180-420ms), with every icon button carrying an accessible name and instant state swaps under reduced-motion.
- **EFFECT-12 (Microinteractions | UI Animation Examples)** — Give every interactive element (buttons, toggles, form fields, search, nav) hover, active, focus and disabled motion states between 120-320ms, with aria-pressed on toggles and aria-invalid on errors.
- **EFFECT-13 (Character Website Animations)** — Add an SVG mascot character in gallery card 4 (plus a waving variant in the CTA band) that reacts to hover and focus, stays decorative, and holds a static pose under reduced-motion.
- **EFFECT-14 (Faux 3D Animation Effects)** — Build gallery card 5 as a faux-3D object using stacked layers and CSS perspective transforms with bounded pointer-driven tilt — no WebGL — falling back to a flat front-on view under reduced-motion.
- **EFFECT-15 (Vertical and Horizontal Scrolling Effects)** — Add a horizontal scroll-snap rail with parallax depth inside the gallery, keyboard-scrollable and labelled with its item count, that becomes a plain wrapped grid without snapping under reduced-motion.
- **EFFECT-16 (Mixed Media Web Animation Examples)** — Build gallery card 6 as a mixed-media collage combining photo cut-outs, vector shapes and an aria-hidden grain overlay, with lazy-loaded dimensioned images and a static composition under reduced-motion.
- **EFFECT-17 (Liquid Motion Effects)** — Create a liquid gooey blob transition in gallery card 7 using an SVG filter with a bounded filter region (never applied to text), reused as the spill motif on the 404 page.
- **EFFECT-18 (Animated Gradient Effects)** — Apply slow looping animated gradients to the hero backdrop and CTA band, animating only background-position or a registered custom property, with contrast verified at both colour extremes.
- **EFFECT-19 (Isometric Animation Effects)** — Build gallery card 8 as an isometric scene that assembles piece by piece on scroll, holding true 120-degree axes with no perspective convergence, and rendering fully assembled under reduced-motion.
- **EFFECT-20 (Background Website Animations)** — Give each major section its own animated SVG-pattern backdrop that runs only while in view, sits aria-hidden beneath the content, and holds its first frame under reduced-motion.
- **EFFECT-21 (Doodle Web Animations)** — Add hand-drawn doodle animations to gallery card 9 and the menu open state, kept clear of all labels, with the menu doodle driven by the same aria-expanded state as the control.
- **EFFECT-22 (Website Page Transition Effects)** — Implement page/section transitions with the View Transitions API and a CSS fallback, under 700ms, moving focus to the new view's heading and announcing the route change via a live region.
- **EFFECT-23 (Hero Section Web Animations)** — Orchestrate the hero entrance as a sequenced reveal (eyebrow, headline, sub-copy, CTA, visual) completing under 1.6s, with the CTA focusable immediately and no delay to the LCP element.
- **EFFECT-24 (Loading Skeleton Screens)** — Show shimmer skeleton placeholders in the bento-grid cards while content loads, with dimensions matching the final content exactly for zero CLS, aria-busy on the container, and a non-shimmering static state under reduced-motion.
- **EFFECT-25 (Loading Animations)** — Build a branded SVG preloader for boot (plus a thin top scroll-progress bar) that never blocks content beyond 2s, offers a skip control after 3s, announces completion via role=status, and shows plain percentage text under reduced-motion.
- **EFFECT-26 (Hover Web Animation Effects)** — Add hover reveal animations to cards, links, avatars and submenu items (150-400ms), gated behind @media (hover: hover), with every hover-only reveal duplicated on focus-visible and an equivalent tap state on touch.
- **EFFECT-27 (Neumorphic Animation Effect)** — Build a neumorphic cluster (toggle, spinner, clock, chart) in surface card 1 using dual light/dark box-shadows, with WCAG AA text contrast against the base surface and a clearly distinguishable pressed state.
- **EFFECT-28 (Glassmorphic Animation Effect)** — Turn the sticky nav into an animated glassmorphic panel on scroll (blur capped at 20px) with a solid-colour fallback when backdrop-filter is unsupported, and focus rings that stay visible over the blur.
- **EFFECT-29 (Claymorphic Animation Effect)** — Build claymorphic buttons and a clay writing animation in surface card 3, using pastel tokens that still meet AA text contrast and a press state that reads as physical deformation.
- **EFFECT-30 (Animated Flipbooks)** — Build a flipbook catalog viewer with realistic 3D page-flip (CSS transforms, lazy page mounting), keyboard prev/next and page-number navigation, announced page changes, and a text reading-mode toggle.
- **EFFECT-31 (Stop-Motion Animation Effect)** — Build gallery card 10 as a stop-motion sprite animation using steps() timing at 8-12fps from a single optimised sprite-sheet request, halting off-screen and resting on one frame under reduced-motion.

## CROSS-CUTTING IMPLEMENTATION RULES

**Motion tokens.** Define these once and reuse them everywhere — no ad-hoc durations.

```css
:root {
  --dur-instant: 120ms;   /* microinteractions, hover */
  --dur-quick:   240ms;   /* icon + state changes */
  --dur-base:    400ms;   /* reveals, transitions */
  --dur-slow:    800ms;   /* hero, drawing, morphs */
  --dur-story:  1600ms;   /* scrollytelling beats */

  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-soft:  cubic-bezier(0.2, 0, 0, 1);

  --stagger-sm: 40ms;
  --stagger-md: 80ms;
}
```

**The reduced-motion contract.** Ship exactly one global block, and make every effect
resolve to a legible static state inside it:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .js-motion { display: none; }      /* JS-driven canvases */
  .static-fallback { display: block; } /* pre-rendered stills */
}
```

**Loops must sleep.** Every `idle-loop` effect (EFFECT-06, EFFECT-18, EFFECT-20) pauses when its section is
out of the viewport and when the document is hidden:

```js
const io = new IntersectionObserver(([entry]) => {
  entry.isIntersecting ? startLoop() : stopLoop();
}, { rootMargin: '10% 0px' });
document.addEventListener('visibilitychange', () => {
  document.hidden ? stopAllLoops() : resumeVisibleLoops();
});
```

**Scroll work is read-only and rAF-batched.** Never write layout during scroll; sample
scroll progress in a `requestAnimationFrame` loop and drive transforms from it.

**Canvas and heavy effects are lazy.** Instantiate any WebGL/WebXR or particle system only
when its slot first enters the viewport, and tear it down on exit.

**Every effect is announced or hidden, never silent-but-loud.** Decorative motion gets
`aria-hidden="true"`; state-changing motion gets a polite live region or an updated ARIA state.

## QA GATE — DO NOT SHIP UNTIL ALL PASS

1. All 31 effect IDs appear in the coverage table with a file path.
2. Every effect renders a legible static state under `prefers-reduced-motion: reduce`.
3. Full keyboard pass: every trigger works via keyboard without a pointer.
4. Tab away during each loop — animation stops. Scroll away — animation stops.
5. Lighthouse performance ≥ 90 on mobile with all effects enabled.
6. CLS ≈ 0; no effect shifts layout on entry or completion.
7. Page is fully readable with JavaScript disabled.
8. No console errors or warnings from any effect.

## APPENDIX — MACHINE-READABLE SPEC

The block below is the exact source data for everything above. Feed it to an AI when you
want it to reason about the effects rather than just execute them.

```json
{
  "source": {
    "title": "31 Cool Website Animations Examples And Effects for Inspiration",
    "publisher": "SVGator",
    "url": "https://www.svgator.com/blog/website-animation-examples-and-effects/",
    "analyzed_on": "2026-10-07",
    "effect_count": 31
  },
  "families": {
    "A": "Spatial & Dimensional — depth, 3D, AR/VR, isometric illusion",
    "B": "Narrative & Scroll — story that unfolds as the user moves",
    "C": "Type & Brand Motion — kinetic type and logo identity in motion",
    "D": "Vector Craft — SVG line, draw, morph, icon, character, doodle, collage",
    "E": "Atmosphere & Background — ambient, gradient, liquid, backdrop motion",
    "F": "Interaction & UI — microinteractions, hover, real-time collaboration",
    "G": "State & Feedback — loaders, skeletons, progress",
    "H": "Surface Styles — neumorphism, glassmorphism, claymorphism",
    "I": "Editorial & Media — hero staging, flipbooks, stop-motion"
  },
  "slots": {
    "S0": "Preloader / boot state",
    "S1": "Sticky navigation + header chrome",
    "S2": "Hero (above the fold)",
    "S3": "Scrollytelling chapter",
    "S4": "Effect gallery (showcase grid)",
    "S5": "Product / catalog viewer",
    "S6": "Live collaboration + AR/VR demo bay",
    "S7": "Surface-style playground (neumorphic / glass / clay)",
    "S8": "CTA band + footer",
    "S9": "404 / error page",
    "G": "Global — applies across all sections"
  },
  "effects": [
    {
      "id": "EFFECT-01",
      "n": 1,
      "name": "Real-Time Rendering",
      "family": "A",
      "one_liner": "Hyper-realistic, GPU-accelerated 3D environments the visitor can explore live.",
      "intent": "Add depth, detail and interactivity; let users inspect a product or space from any angle.",
      "trigger": "load + pointer-drag",
      "stack": [
        "WebGL",
        "Three.js",
        "GPU"
      ],
      "slot": "S2",
      "placement": "Full-bleed canvas behind the hero copy; drag to orbit a hero product/object.",
      "params": {
        "duration_ms": "continuous",
        "easing": "damped orbit (lerp 0.08)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "high",
        "gpu": true,
        "frame_budget_ms": 8
      },
      "a11y": {
        "prefers_reduced_motion": "swap canvas for a pre-rendered poster image",
        "keyboard": "arrow keys orbit the object",
        "aria": "canvas labelled + text alternative describing the object"
      },
      "acceptance": [
        "Object orbits on drag at 60fps",
        "Scene degrades to static poster under reduced-motion",
        "No layout shift on scene init"
      ],
      "prompt_line": "Build a WebGL/Three.js canvas behind the hero that renders one product object in real time, orbitable by drag (arrow keys for keyboard users), with a pre-rendered poster-image fallback when prefers-reduced-motion is set."
    },
    {
      "id": "EFFECT-02",
      "n": 2,
      "name": "Scrollytelling",
      "family": "B",
      "one_liner": "Scroll position drives a narrative; the story unfolds as the user moves down the page.",
      "intent": "Turn passive scrolling into a guided journey that delivers content in sequence.",
      "trigger": "scroll",
      "stack": [
        "IntersectionObserver",
        "CSS transforms",
        "scroll-timeline"
      ],
      "slot": "S3",
      "placement": "Pinned chapter that advances through 4 beats as scroll progress goes 0→1.",
      "params": {
        "duration_ms": "scroll-linked",
        "easing": "linear progress + eased reveals",
        "fps_target": 60,
        "intensity": "high"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "unpin; render all beats as a normal stacked article",
        "keyboard": "every beat reachable and readable without scrolling animations",
        "aria": "beats are real headings in order"
      },
      "acceptance": [
        "4 beats advance with scroll",
        "Fully readable as static stacked content with JS off",
        "No scroll-jacking; wheel speed stays native"
      ],
      "prompt_line": "Create a pinned scrollytelling chapter of 4 narrative beats driven by scroll progress, using IntersectionObserver, that flattens into a plain stacked article under prefers-reduced-motion and never hijacks native wheel speed."
    },
    {
      "id": "EFFECT-03",
      "n": 3,
      "name": "AR/VR Motion Graphics",
      "family": "A",
      "one_liner": "Animation placed into augmented or virtual space, reacting to the real environment.",
      "intent": "Guide attention and tell stories inside immersive environments.",
      "trigger": "click (opt-in) + device motion",
      "stack": [
        "WebXR",
        "DeviceOrientation",
        "fallback: 360 video"
      ],
      "slot": "S6",
      "placement": "Demo bay with an 'Enter AR' button; non-AR devices get a draggable 360 preview.",
      "params": {
        "duration_ms": "session",
        "easing": "spatial damping",
        "fps_target": 60,
        "intensity": "high"
      },
      "perf": {
        "cost": "high",
        "gpu": true,
        "frame_budget_ms": 8
      },
      "a11y": {
        "prefers_reduced_motion": "static 360 still",
        "keyboard": "'Enter AR' is a real focusable button",
        "aria": "button announces AR availability and device support"
      },
      "acceptance": [
        "AR start is user-initiated, never autoplay",
        "Unsupported devices get the 360 fallback",
        "Exit control always visible"
      ],
      "prompt_line": "Add a demo bay with an opt-in 'Enter AR' WebXR experience (never autoplaying), a draggable 360 preview fallback for unsupported devices, and a persistent, focusable exit control."
    },
    {
      "id": "EFFECT-04",
      "n": 4,
      "name": "Expressive Typography Animations",
      "family": "C",
      "one_liner": "Bold kinetic type, glitch effects and animated lettering that carry the message.",
      "intent": "Convey brand personality and grab attention in the first second.",
      "trigger": "load + in-view",
      "stack": [
        "CSS keyframes",
        "clip-path",
        "split-text spans"
      ],
      "slot": "S2",
      "placement": "Hero H1 — per-letter stagger reveal, plus a glitch pass on the key word.",
      "params": {
        "duration_ms": [
          700,
          1200
        ],
        "stagger_ms": 40,
        "easing": "cubic-bezier(0.16,1,0.3,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 4
      },
      "a11y": {
        "prefers_reduced_motion": "letters render final state instantly",
        "keyboard": "n/a",
        "aria": "split letters wrapped in aria-hidden spans with an sr-only full string"
      },
      "acceptance": [
        "Text is selectable and searchable",
        "Screen reader announces one clean sentence, not 40 letters",
        "No FOUT jump on reveal"
      ],
      "prompt_line": "Animate the hero headline with a per-letter stagger reveal and a glitch pass on the emphasised keyword, wrapping split glyphs in aria-hidden spans with one sr-only full-string copy so screen readers read a clean sentence."
    },
    {
      "id": "EFFECT-05",
      "n": 5,
      "name": "Real-Time Collaborative Animations",
      "family": "F",
      "one_liner": "Several users animate and interact with the same elements simultaneously.",
      "intent": "Make digital interaction feel shared, connected and alive.",
      "trigger": "multi-user event",
      "stack": [
        "WebSocket",
        "CRDT/presence",
        "optimistic UI"
      ],
      "slot": "S6",
      "placement": "Live board where visitor cursors and reactions broadcast to all open sessions.",
      "params": {
        "duration_ms": [
          200,
          400
        ],
        "easing": "spring",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": false,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "presence shown as static avatars, no motion",
        "keyboard": "solo users can still act on the board",
        "aria": "live region announces join/leave politely"
      },
      "acceptance": [
        "Works with a single visitor (no crash, no empty state)",
        "Presence updates under 200ms locally via optimistic UI",
        "Reconnects automatically after network drop"
      ],
      "prompt_line": "Build a presence-driven live board over WebSockets where visitor cursors and reactions broadcast to all open sessions, using optimistic local updates, automatic reconnect, and a graceful single-visitor state."
    },
    {
      "id": "EFFECT-06",
      "n": 6,
      "name": "Ambient Background Motion",
      "family": "E",
      "one_liner": "Subtle gradients, particles and slow flows that add depth without stealing focus.",
      "intent": "Create atmosphere while keeping attention on the content layer.",
      "trigger": "idle-loop",
      "stack": [
        "SVG",
        "CSS animation",
        "canvas particles"
      ],
      "slot": "G",
      "placement": "Site-wide ambient layer behind all sections, capped at low opacity.",
      "params": {
        "duration_ms": "infinite loop 18-30s",
        "easing": "linear / ease-in-out",
        "fps_target": 30,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "freeze on first frame",
        "keyboard": "n/a",
        "aria": "aria-hidden, decorative only"
      },
      "acceptance": [
        "Ambient layer never exceeds 0.25 opacity behind text",
        "Pauses when tab is hidden",
        "Text contrast still passes WCAG AA over the moving layer"
      ],
      "prompt_line": "Add a site-wide ambient background layer of slow-drifting gradients and particles, aria-hidden and capped below 0.25 opacity, paused when the tab is hidden and frozen entirely under prefers-reduced-motion."
    },
    {
      "id": "EFFECT-07",
      "n": 7,
      "name": "Line Animation Examples",
      "family": "D",
      "one_liner": "Thin-line vector artwork animated with weightless, unrestricted motion.",
      "intent": "Give illustration life with minimal visual weight.",
      "trigger": "in-view",
      "stack": [
        "SVG",
        "stroke-dasharray",
        "CSS"
      ],
      "slot": "S4",
      "placement": "Gallery card 1 — line-art scene with looping subtle motion.",
      "params": {
        "duration_ms": [
          1200,
          2200
        ],
        "easing": "ease-in-out",
        "fps_target": 60,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": false,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "static line-art frame",
        "keyboard": "n/a",
        "aria": "role=img with descriptive aria-label"
      },
      "acceptance": [
        "SVG stays sharp at any zoom",
        "Animation only runs while card is in viewport",
        "Inline SVG payload stays under 40KB uncompressed"
      ],
      "prompt_line": "Build gallery card 1 as inline SVG line-art with looping subtle motion, running only while in viewport, role=img with a descriptive label, and a static frame under reduced-motion."
    },
    {
      "id": "EFFECT-08",
      "n": 8,
      "name": "Self-Drawing Animation Effects",
      "family": "D",
      "one_liner": "Stroke-path animation that draws (and un-draws) artwork as if by hand.",
      "intent": "Produce intricate sketch-like reveals for wordmarks, illustrations and loaders.",
      "trigger": "in-view + scroll",
      "stack": [
        "SVG path",
        "stroke-dashoffset",
        "scroll-linked"
      ],
      "slot": "S4",
      "placement": "Gallery card 2 — wordmark that draws itself on entry; also used in the S0 preloader.",
      "params": {
        "duration_ms": [
          1400,
          2600
        ],
        "easing": "ease-out",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": false,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "wordmark shown complete",
        "keyboard": "n/a",
        "aria": "role=img + aria-label"
      },
      "acceptance": [
        "Path draws once, does not loop distractingly",
        "Final stroke state persists after animation",
        "Path length computed at runtime, not hardcoded"
      ],
      "prompt_line": "Implement a self-drawing stroke-path wordmark in gallery card 2 (reused by the preloader), computing path length at runtime, drawing once on entry and persisting the final state."
    },
    {
      "id": "EFFECT-09",
      "n": 9,
      "name": "Morphing Animation Effects",
      "family": "D",
      "one_liner": "One shape continuously transforms into another — liquid, match-cut, object-to-object.",
      "intent": "Create fast-paced, surprising transitions and visual storytelling.",
      "trigger": "in-view + hover",
      "stack": [
        "SVG morph",
        "matched point count",
        "SMIL/CSS"
      ],
      "slot": "S4",
      "placement": "Gallery card 3 — shape morphs through 3 states on hover/in-view.",
      "params": {
        "duration_ms": [
          600,
          1100
        ],
        "easing": "cubic-bezier(0.65,0,0.35,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": false,
        "frame_budget_ms": 5
      },
      "a11y": {
        "prefers_reduced_motion": "crossfade between states instead of morph",
        "keyboard": "focus triggers the same transition as hover",
        "aria": "role=img + aria-label describing both shapes"
      },
      "acceptance": [
        "Both paths share equal command/point counts",
        "Morph is reversible on mouse-out",
        "Keyboard focus triggers identical transition"
      ],
      "prompt_line": "Create gallery card 3 as an SVG morph cycling three states, with matched point counts, reversible on mouse-out, triggered identically by keyboard focus, and replaced by a crossfade under reduced-motion."
    },
    {
      "id": "EFFECT-10",
      "n": 10,
      "name": "Animated Logos",
      "family": "C",
      "one_liner": "The logotype, logomark or mascot animated as a reusable brand asset.",
      "intent": "Push brand identity to the front of the visitor's memory.",
      "trigger": "load + click (replay)",
      "stack": [
        "SVG",
        "CSS keyframes"
      ],
      "slot": "S1",
      "placement": "Nav logo animates on first load and replays on click; also the S0 preloader mark.",
      "params": {
        "duration_ms": [
          900,
          1600
        ],
        "easing": "cubic-bezier(0.34,1.56,0.64,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "static logo",
        "keyboard": "logo is a focusable link",
        "aria": "accessible name is the brand, not 'animation'"
      },
      "acceptance": [
        "Animation plays once on load, not on every route change",
        "Logo remains a working home link",
        "Animation replays on click for delight"
      ],
      "prompt_line": "Animate the brand logo in the navigation so it plays once on first load and replays on click, keeping it a focusable home link whose accessible name is the brand name."
    },
    {
      "id": "EFFECT-11",
      "n": 11,
      "name": "Animated Icons",
      "family": "D",
      "one_liner": "Icons that respond to clicks or hover, adding clarity and feedback.",
      "intent": "Improve usability and signal a two-way interaction with the brand.",
      "trigger": "hover + click",
      "stack": [
        "inline SVG",
        "CSS transitions"
      ],
      "slot": "S1",
      "placement": "Nav and utility icons animate on hover; active state animates on click.",
      "params": {
        "duration_ms": [
          180,
          420
        ],
        "easing": "cubic-bezier(0.2,0,0,1)",
        "fps_target": 60,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 2
      },
      "a11y": {
        "prefers_reduced_motion": "instant state swap",
        "keyboard": "focus-visible triggers the same animation",
        "aria": "icons labelled or aria-hidden inside labelled buttons"
      },
      "acceptance": [
        "Every icon button has an accessible name",
        "focus-visible mirrors hover behaviour",
        "No icon animation exceeds 420ms"
      ],
      "prompt_line": "Animate the navigation and utility icons on hover, focus-visible and click (180-420ms), with every icon button carrying an accessible name and instant state swaps under reduced-motion."
    },
    {
      "id": "EFFECT-12",
      "n": 12,
      "name": "Microinteractions | UI Animation Examples",
      "family": "F",
      "one_liner": "Small single-purpose animations that confirm a specific user action.",
      "intent": "Make the interface feel responsive, reduce confusion, guide the journey.",
      "trigger": "click + state-change",
      "stack": [
        "CSS transitions",
        "Web Animations API"
      ],
      "slot": "G",
      "placement": "Buttons, toggles, form fields, nav bar, search box, CTA states.",
      "params": {
        "duration_ms": [
          120,
          320
        ],
        "easing": "cubic-bezier(0.2,0,0,1)",
        "fps_target": 60,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 2
      },
      "a11y": {
        "prefers_reduced_motion": "instant state change",
        "keyboard": "all states reachable and visible on focus",
        "aria": "aria-pressed on toggles, aria-invalid on errors"
      },
      "acceptance": [
        "Every interactive element has hover, active, focus and disabled motion states",
        "Toggle exposes aria-pressed",
        "No microinteraction blocks the action it confirms"
      ],
      "prompt_line": "Give every interactive element (buttons, toggles, form fields, search, nav) hover, active, focus and disabled motion states between 120-320ms, with aria-pressed on toggles and aria-invalid on errors."
    },
    {
      "id": "EFFECT-13",
      "n": 13,
      "name": "Character Website Animations",
      "family": "D",
      "one_liner": "Animated characters and mascots that make a brand feel human and relatable.",
      "intent": "Build emotional connection and carry brand voice.",
      "trigger": "in-view + hover + scroll",
      "stack": [
        "SVG rig",
        "CSS keyframes",
        "transform origins"
      ],
      "slot": "S4",
      "placement": "Gallery card 4 — mascot reacts to hover; a second mascot waves in the S8 CTA band.",
      "params": {
        "duration_ms": [
          500,
          1800
        ],
        "easing": "ease-in-out with overshoot",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 4
      },
      "a11y": {
        "prefers_reduced_motion": "static pose",
        "keyboard": "hover reaction also fires on focus",
        "aria": "role=img + aria-label"
      },
      "acceptance": [
        "Character motion is decoupled from page scroll performance",
        "Hover reaction also fires on focus",
        "Mascot is decorative — never the only carrier of information"
      ],
      "prompt_line": "Add an SVG mascot character in gallery card 4 (plus a waving variant in the CTA band) that reacts to hover and focus, stays decorative, and holds a static pose under reduced-motion."
    },
    {
      "id": "EFFECT-14",
      "n": 14,
      "name": "Faux 3D Animation Effects",
      "family": "A",
      "one_liner": "The illusion of 3D built from layering, perspective, scale, skew and rotate.",
      "intent": "Get depth and dimension at a fraction of true-3D performance cost.",
      "trigger": "in-view + pointer",
      "stack": [
        "CSS 3D transforms",
        "perspective",
        "stacked SVG layers"
      ],
      "slot": "S4",
      "placement": "Gallery card 5 — layered object rotates and parallaxes with the pointer.",
      "params": {
        "duration_ms": [
          700,
          1400
        ],
        "easing": "ease-out",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 5
      },
      "a11y": {
        "prefers_reduced_motion": "single flat front-on view",
        "keyboard": "tilt can be driven by arrow keys or omitted without info loss",
        "aria": "role=img + aria-label"
      },
      "acceptance": [
        "No WebGL dependency",
        "Rotation is bounded (never spins fully away from content)",
        "Layer count under 12 for paint cost"
      ],
      "prompt_line": "Build gallery card 5 as a faux-3D object using stacked layers and CSS perspective transforms with bounded pointer-driven tilt — no WebGL — falling back to a flat front-on view under reduced-motion."
    },
    {
      "id": "EFFECT-15",
      "n": 15,
      "name": "Vertical and Horizontal Scrolling Effects",
      "family": "B",
      "one_liner": "Carousels, scroll snapping, reveals and parallax across both scroll axes.",
      "intent": "Direct focus and create anticipation as the visitor travels the page.",
      "trigger": "scroll",
      "stack": [
        "scroll-snap",
        "CSS transforms",
        "IntersectionObserver"
      ],
      "slot": "S4",
      "placement": "Horizontal snap rail inside the gallery, plus parallax depth on section backgrounds.",
      "params": {
        "duration_ms": "scroll-linked",
        "easing": "snap easing",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "rail becomes a wrapped grid, no snapping",
        "keyboard": "rail items are focusable and scroll into view",
        "aria": "rail labelled as a list/group with item count"
      },
      "acceptance": [
        "Horizontal rail is keyboard-scrollable",
        "Parallax layers use transform only, never top/left",
        "No snap traps the user between items"
      ],
      "prompt_line": "Add a horizontal scroll-snap rail with parallax depth inside the gallery, keyboard-scrollable and labelled with its item count, that becomes a plain wrapped grid without snapping under reduced-motion."
    },
    {
      "id": "EFFECT-16",
      "n": 16,
      "name": "Mixed Media Web Animation Examples",
      "family": "D",
      "one_liner": "Photography, vector, grain, texture and type collaged into one moving composition.",
      "intent": "Deliver a fresh, striking, editorial feel that reads as culturally current.",
      "trigger": "in-view + scroll",
      "stack": [
        "SVG masks",
        "blend modes",
        "grain overlay",
        "video"
      ],
      "slot": "S4",
      "placement": "Gallery card 6 — photo cut-outs collage and drift against a grainy vector backdrop.",
      "params": {
        "duration_ms": [
          900,
          2000
        ],
        "easing": "ease-in-out",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "static collage",
        "keyboard": "n/a",
        "aria": "informative images have alt text; decorative grain is aria-hidden"
      },
      "acceptance": [
        "Grain overlay is aria-hidden decoration",
        "Images are lazy-loaded and dimensioned (no CLS)",
        "Blend modes do not break text contrast"
      ],
      "prompt_line": "Build gallery card 6 as a mixed-media collage combining photo cut-outs, vector shapes and an aria-hidden grain overlay, with lazy-loaded dimensioned images and a static composition under reduced-motion."
    },
    {
      "id": "EFFECT-17",
      "n": 17,
      "name": "Liquid Motion Effects",
      "family": "E",
      "one_liner": "Organic, flowing movement — morphing blobs, liquid text, ripples, colour shifts.",
      "intent": "Create captivating, soft transitions with an organic feel.",
      "trigger": "in-view + hover",
      "stack": [
        "SVG filter (feGaussianBlur + feColorMatrix)",
        "border-radius morph",
        "canvas"
      ],
      "slot": "S4",
      "placement": "Gallery card 7 — gooey blob transition; liquid spill motif reused on the S9 404 page.",
      "params": {
        "duration_ms": [
          900,
          1800
        ],
        "easing": "ease-in-out",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "simple opacity fade",
        "keyboard": "hover reaction fires on focus",
        "aria": "role=img + aria-label"
      },
      "acceptance": [
        "SVG filter is not applied to text (blur/legibility)",
        "Filter region bounded to avoid full-page repaint",
        "404 page keeps its message readable"
      ],
      "prompt_line": "Create a liquid gooey blob transition in gallery card 7 using an SVG filter with a bounded filter region (never applied to text), reused as the spill motif on the 404 page."
    },
    {
      "id": "EFFECT-18",
      "n": 18,
      "name": "Animated Gradient Effects",
      "family": "E",
      "one_liner": "Colour transitions in motion that set mood and pull the eye to key elements.",
      "intent": "Shape tone and guide focus using motion alone.",
      "trigger": "idle-loop + in-view",
      "stack": [
        "CSS gradient",
        "background-position",
        "@property",
        "SVG gradient"
      ],
      "slot": "G",
      "placement": "Hero backdrop and CTA band; animated gradient accents on highlight cards.",
      "params": {
        "duration_ms": "loop 8-16s",
        "easing": "linear",
        "fps_target": 30,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "static gradient stop",
        "keyboard": "n/a",
        "aria": "decorative, aria-hidden"
      },
      "acceptance": [
        "Animates background-position or a registered custom property, never repaints layout",
        "Contrast verified at both gradient extremes",
        "Frame rate throttled to ~30fps for background loops"
      ],
      "prompt_line": "Apply slow looping animated gradients to the hero backdrop and CTA band, animating only background-position or a registered custom property, with contrast verified at both colour extremes."
    },
    {
      "id": "EFFECT-19",
      "n": 19,
      "name": "Isometric Animation Effects",
      "family": "A",
      "one_liner": "2D isometric perspective (axes at 120 degrees) that reads as dimensional space.",
      "intent": "Show structure and process with clarity while adding dimensionality.",
      "trigger": "in-view + scroll",
      "stack": [
        "SVG",
        "isometric grid",
        "CSS transforms"
      ],
      "slot": "S4",
      "placement": "Gallery card 8 — isometric scene assembles piece by piece on scroll.",
      "params": {
        "duration_ms": [
          800,
          1600
        ],
        "easing": "cubic-bezier(0.16,1,0.3,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 5
      },
      "a11y": {
        "prefers_reduced_motion": "fully assembled scene",
        "keyboard": "n/a",
        "aria": "role=img + aria-label describing the scene"
      },
      "acceptance": [
        "Axes hold consistent 120-degree isometric angles",
        "No converging/perspective lines",
        "Scene readable as a static diagram when paused"
      ],
      "prompt_line": "Build gallery card 8 as an isometric scene that assembles piece by piece on scroll, holding true 120-degree axes with no perspective convergence, and rendering fully assembled under reduced-motion."
    },
    {
      "id": "EFFECT-20",
      "n": 20,
      "name": "Background Website Animations",
      "family": "E",
      "one_liner": "Animated section backdrops that set atmosphere and frame the value proposition.",
      "intent": "Add depth and introduce the brand promise before a word is read.",
      "trigger": "in-view + idle-loop",
      "stack": [
        "SVG pattern",
        "CSS animation",
        "video (muted, lazy)"
      ],
      "slot": "G",
      "placement": "Distinct animated backdrop per major section, all under the content layer.",
      "params": {
        "duration_ms": "loop 12-24s",
        "easing": "ease-in-out",
        "fps_target": 30,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "first frame only",
        "keyboard": "n/a",
        "aria": "aria-hidden, decorative"
      },
      "acceptance": [
        "Backgrounds pause when scrolled out of view",
        "Content contrast maintained over every backdrop",
        "Total background payload under 300KB"
      ],
      "prompt_line": "Give each major section its own animated SVG-pattern backdrop that runs only while in view, sits aria-hidden beneath the content, and holds its first frame under reduced-motion."
    },
    {
      "id": "EFFECT-21",
      "n": 21,
      "name": "Doodle Web Animations",
      "family": "D",
      "one_liner": "Playful hand-drawn sketches brought to life in the interface.",
      "intent": "Make interacting fun and encourage longer exploration.",
      "trigger": "in-view + hover + click",
      "stack": [
        "SVG",
        "stroke animation",
        "CSS"
      ],
      "slot": "S4",
      "placement": "Gallery card 9 — doodle header scribbles; doodle arrows on the menu open state.",
      "params": {
        "duration_ms": [
          600,
          1500
        ],
        "easing": "ease-out with slight overshoot",
        "fps_target": 60,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": false,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "static doodle",
        "keyboard": "menu doodle tied to aria-expanded state",
        "aria": "decorative doodles aria-hidden"
      },
      "acceptance": [
        "Doodles never obscure labels or controls",
        "Menu doodle state matches aria-expanded",
        "Stroke animation does not run on every re-render"
      ],
      "prompt_line": "Add hand-drawn doodle animations to gallery card 9 and the menu open state, kept clear of all labels, with the menu doodle driven by the same aria-expanded state as the control."
    },
    {
      "id": "EFFECT-22",
      "n": 22,
      "name": "Website Page Transition Effects",
      "family": "B",
      "one_liner": "Fades, slides and full-page reveals that carry the user between views.",
      "intent": "Make navigation feel seamless and give clear cues about where the user went.",
      "trigger": "navigation + scroll",
      "stack": [
        "View Transitions API",
        "CSS fallback",
        "router hooks"
      ],
      "slot": "G",
      "placement": "Between sections/views and on anchor navigation.",
      "params": {
        "duration_ms": [
          300,
          700
        ],
        "easing": "cubic-bezier(0.4,0,0.2,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "instant cut (or 1-frame crossfade)",
        "keyboard": "focus moves to the new view's heading on completion",
        "aria": "route change announced via live region"
      },
      "acceptance": [
        "Total transition under 700ms",
        "Focus moves to the new view heading",
        "No double-scroll or scroll-position loss",
        "Progressive enhancement if View Transitions unsupported"
      ],
      "prompt_line": "Implement page/section transitions with the View Transitions API and a CSS fallback, under 700ms, moving focus to the new view's heading and announcing the route change via a live region."
    },
    {
      "id": "EFFECT-23",
      "n": 23,
      "name": "Hero Section Web Animations",
      "family": "I",
      "one_liner": "The staged entrance of the entire above-the-fold composition.",
      "intent": "Make the strongest possible first impression and land the key message fast.",
      "trigger": "load",
      "stack": [
        "CSS keyframes",
        "orchestrated delays",
        "Web Animations API"
      ],
      "slot": "S2",
      "placement": "Orchestration layer for the hero: eyebrow, headline, sub, CTA, visual — in sequence.",
      "params": {
        "duration_ms": [
          400,
          900
        ],
        "stagger_ms": 80,
        "easing": "cubic-bezier(0.16,1,0.3,1)",
        "fps_target": 60,
        "intensity": "high"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 4
      },
      "a11y": {
        "prefers_reduced_motion": "all hero elements visible immediately",
        "keyboard": "CTA is focusable before animation completes",
        "aria": "no aria-live churn during the entrance"
      },
      "acceptance": [
        "Whole sequence completes under 1.6s",
        "LCP element is not delayed by the animation",
        "CTA is clickable before the sequence ends"
      ],
      "prompt_line": "Orchestrate the hero entrance as a sequenced reveal (eyebrow, headline, sub-copy, CTA, visual) completing under 1.6s, with the CTA focusable immediately and no delay to the LCP element."
    },
    {
      "id": "EFFECT-24",
      "n": 24,
      "name": "Loading Skeleton Screens",
      "family": "G",
      "one_liner": "Shimmering placeholder shapes that stand in for content while it loads.",
      "intent": "Make waiting feel faster and hold layout stable during fetch.",
      "trigger": "data-loading state",
      "stack": [
        "CSS shimmer",
        "bento grid",
        "aria-busy"
      ],
      "slot": "G",
      "placement": "Bento-grid cards in the gallery show skeletons until their content resolves.",
      "params": {
        "duration_ms": "loop 1.2-2s",
        "easing": "linear",
        "fps_target": 30,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 2
      },
      "a11y": {
        "prefers_reduced_motion": "static grey placeholders, no shimmer",
        "keyboard": "n/a",
        "aria": "container aria-busy=true while loading, aria-hidden skeletons"
      },
      "acceptance": [
        "Skeleton dimensions match the loaded content exactly (zero CLS)",
        "aria-busy cleared on resolve",
        "Skeleton is replaced within one frame of data arriving"
      ],
      "prompt_line": "Show shimmer skeleton placeholders in the bento-grid cards while content loads, with dimensions matching the final content exactly for zero CLS, aria-busy on the container, and a non-shimmering static state under reduced-motion."
    },
    {
      "id": "EFFECT-25",
      "n": 25,
      "name": "Loading Animations",
      "family": "G",
      "one_liner": "Progress and preloader animations that confirm a request is being handled.",
      "intent": "Reduce frustration when load time exceeds the user's expectation of zero.",
      "trigger": "load + async request",
      "stack": [
        "SVG",
        "CSS keyframes",
        "scroll-progress bar"
      ],
      "slot": "S0",
      "placement": "Branded preloader on boot (mascot + progress), plus a thin top scroll-progress bar.",
      "params": {
        "duration_ms": "until ready",
        "easing": "ease-out",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 3
      },
      "a11y": {
        "prefers_reduced_motion": "static 'Loading…' text with percentage",
        "keyboard": "focus is not trapped during load",
        "aria": "role=status with polite live announcement on completion"
      },
      "acceptance": [
        "Preloader never blocks content longer than 2s",
        "A skip/continue control appears if load exceeds 3s",
        "role=status announces completion",
        "Keyboard focus can leave the preloader at any time (no focus trap)"
      ],
      "prompt_line": "Build a branded SVG preloader for boot (plus a thin top scroll-progress bar) that never blocks content beyond 2s, offers a skip control after 3s, announces completion via role=status, and shows plain percentage text under reduced-motion."
    },
    {
      "id": "EFFECT-26",
      "n": 26,
      "name": "Hover Web Animation Effects",
      "family": "F",
      "one_liner": "Hover states that reveal extra information on icons, buttons and cards.",
      "intent": "Keep the interface clean while adding depth and immersion on intent.",
      "trigger": "hover + focus",
      "stack": [
        "CSS transitions",
        "pointer media query"
      ],
      "slot": "G",
      "placement": "All cards, links, avatars and submenu items.",
      "params": {
        "duration_ms": [
          150,
          400
        ],
        "easing": "cubic-bezier(0.2,0,0,1)",
        "fps_target": 60,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 2
      },
      "a11y": {
        "prefers_reduced_motion": "instant state change",
        "keyboard": "every hover reveal is also reachable via focus-visible",
        "aria": "hover-only content is not the sole source of information"
      },
      "acceptance": [
        "Hover effects gated behind @media (hover: hover)",
        "No information exists only on hover",
        "Touch devices get an equivalent tap state"
      ],
      "prompt_line": "Add hover reveal animations to cards, links, avatars and submenu items (150-400ms), gated behind @media (hover: hover), with every hover-only reveal duplicated on focus-visible and an equivalent tap state on touch."
    },
    {
      "id": "EFFECT-27",
      "n": 27,
      "name": "Neumorphic Animation Effect",
      "family": "H",
      "one_liner": "Soft, extruded, tactile UI that appears to rise out of the background.",
      "intent": "Create intuitive, physically legible controls.",
      "trigger": "hover + click + in-view",
      "stack": [
        "CSS box-shadow (dual, light/dark)",
        "matching base colour"
      ],
      "slot": "S7",
      "placement": "Surface playground card 1 — neumorphic toggle, spinner, clock and chart cluster.",
      "params": {
        "duration_ms": [
          200,
          600
        ],
        "easing": "ease-out",
        "fps_target": 60,
        "intensity": "low"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 4
      },
      "a11y": {
        "prefers_reduced_motion": "static shadow states",
        "keyboard": "pressed state visible on focus and activation",
        "aria": "contrast of label text verified against the soft base (common neumorphism failure)"
      },
      "acceptance": [
        "Text contrast passes WCAG AA against the base surface",
        "Pressed state is distinguishable, not just a shadow inversion",
        "Shadow animation does not trigger full repaint"
      ],
      "prompt_line": "Build a neumorphic cluster (toggle, spinner, clock, chart) in surface card 1 using dual light/dark box-shadows, with WCAG AA text contrast against the base surface and a clearly distinguishable pressed state."
    },
    {
      "id": "EFFECT-28",
      "n": 28,
      "name": "Glassmorphic Animation Effect",
      "family": "H",
      "one_liner": "Translucent, layered glass panels with depth, blur and texture.",
      "intent": "Make UI surfaces feel premium and dimensional.",
      "trigger": "scroll + hover",
      "stack": [
        "backdrop-filter: blur()",
        "translucent borders",
        "noise texture"
      ],
      "slot": "S1",
      "placement": "Sticky nav becomes a glass panel on scroll; surface card 2 is a glass widget set.",
      "params": {
        "duration_ms": [
          250,
          500
        ],
        "easing": "ease-out",
        "blur_px": [
          8,
          20
        ],
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "static translucent panel, no blur animation",
        "keyboard": "focus ring visible against the blurred backdrop",
        "aria": "content inside glass meets contrast (backdrop is not guaranteed)"
      },
      "acceptance": [
        "Solid colour fallback when backdrop-filter is unsupported",
        "Blur radius capped at 20px for paint cost",
        "Focus indicators remain visible over the glass"
      ],
      "prompt_line": "Turn the sticky nav into an animated glassmorphic panel on scroll (blur capped at 20px) with a solid-colour fallback when backdrop-filter is unsupported, and focus rings that stay visible over the blur."
    },
    {
      "id": "EFFECT-29",
      "n": 29,
      "name": "Claymorphic Animation Effect",
      "family": "H",
      "one_liner": "Claymation-inspired surfaces: pastel, oversized radii, heavy inner and outer shadow.",
      "intent": "Add a playful, soft, tactile personality to the UI.",
      "trigger": "hover + click + in-view",
      "stack": [
        "CSS box-shadow (inner + outer)",
        "large border-radius",
        "pastel palette"
      ],
      "slot": "S7",
      "placement": "Surface playground card 3 — clay buttons and a clay writing/drawing animation.",
      "params": {
        "duration_ms": [
          300,
          900
        ],
        "easing": "cubic-bezier(0.34,1.56,0.64,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 4
      },
      "a11y": {
        "prefers_reduced_motion": "static clay surface",
        "keyboard": "squish/press state on focus and activation",
        "aria": "pastel-on-pastel contrast verified"
      },
      "acceptance": [
        "Pastel palette meets AA contrast for all text",
        "Press state reads as physical deformation",
        "Inner+outer shadows defined once as tokens, reused"
      ],
      "prompt_line": "Build claymorphic buttons and a clay writing animation in surface card 3, using pastel tokens that still meet AA text contrast and a press state that reads as physical deformation."
    },
    {
      "id": "EFFECT-30",
      "n": 30,
      "name": "Animated Flipbooks",
      "family": "I",
      "one_liner": "Interactive page-flip catalogues with embedded media, video, audio and maps.",
      "intent": "Present long-form or PDF content as a browsable, tactile publication.",
      "trigger": "click + drag",
      "stack": [
        "CSS 3D transforms",
        "pointer/touch drag",
        "embedded media"
      ],
      "slot": "S5",
      "placement": "Catalog viewer with realistic 3D page flip and a plain reading-mode toggle.",
      "params": {
        "duration_ms": [
          500,
          900
        ],
        "easing": "cubic-bezier(0.4,0,0.2,1)",
        "fps_target": 60,
        "intensity": "medium"
      },
      "perf": {
        "cost": "medium",
        "gpu": true,
        "frame_budget_ms": 6
      },
      "a11y": {
        "prefers_reduced_motion": "instant page swap",
        "keyboard": "prev/next buttons and page-number input",
        "aria": "page changes announced; every page available as selectable text"
      },
      "acceptance": [
        "Flip works with keyboard prev/next, not only drag",
        "A text/reading mode exists for assistive tech and SEO",
        "Pages are lazily rendered, not all mounted at once"
      ],
      "prompt_line": "Build a flipbook catalog viewer with realistic 3D page-flip (CSS transforms, lazy page mounting), keyboard prev/next and page-number navigation, announced page changes, and a text reading-mode toggle."
    },
    {
      "id": "EFFECT-31",
      "n": 31,
      "name": "Stop-Motion Animation Effect",
      "family": "I",
      "one_liner": "Sequenced still frames that create a nostalgic, hand-made illusion of movement.",
      "intent": "Deliver a distinctive, highly engaging retro aesthetic.",
      "trigger": "in-view + hover",
      "stack": [
        "sprite sheet",
        "steps() timing",
        "frame sequence"
      ],
      "slot": "S4",
      "placement": "Gallery card 10 — frame-stepped sprite animation at 8-12fps.",
      "params": {
        "duration_ms": [
          800,
          1600
        ],
        "easing": "steps(n)",
        "fps_target": 12,
        "intensity": "medium"
      },
      "perf": {
        "cost": "low",
        "gpu": true,
        "frame_budget_ms": 2
      },
      "a11y": {
        "prefers_reduced_motion": "single representative frame",
        "keyboard": "n/a",
        "aria": "role=img + aria-label"
      },
      "acceptance": [
        "Uses steps() timing, not a smooth tween",
        "Sprite sheet is one optimised image request",
        "Animation halts when off-screen"
      ],
      "prompt_line": "Build gallery card 10 as a stop-motion sprite animation using steps() timing at 8-12fps from a single optimised sprite-sheet request, halting off-screen and resting on one frame under reduced-motion."
    }
  ]
}
```
