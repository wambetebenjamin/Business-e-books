# Gestalt Theory and Its Application to Counselling

A 22 slide presentation for Group 4, MCP504 Theories of Counseling and Psychotherapy,
Pan African Christian University. Lecturer, Dr. Lucy Gachenia.

| File | What it is |
| --- | --- |
| `Gestalt Theory and Its Application to Counselling.pptx` | the deliverable, editable in PowerPoint, with entrance animations |
| `preview/index.html` | web preview of every slide, plus a download link |
| `preview/web/*.jpg` | one image per slide |
| `assets/` | the generated artwork: backgrounds and tick marks |
| `build/` | the generator. Everything above can be rebuilt from here |

## Design direction

* **Quiet backgrounds.** Each slide is one smooth dark gradient with a soft glow and a
  single low ridge line along the bottom edge. No stock photography, no trees, no
  figures, no clip art. Five accent families run across the talk: night for the cover
  and references, dawn for foundations, forest for core concepts, rose for practice,
  violet for evaluation.
* **The Word tick bullet, not an emoji.** Every list line opens with the same heavy
  checkmark Word uses when you set a list to the tick bullet (Wingdings "u"). It is
  drawn once as artwork and reused, so it looks identical on every machine and never
  falls back to an emoji font. The cross on the "avoid" line follows the same idea.
* **Standard Office fonts only.** Calibri for running text, Cambria for headings,
  Consolas for labels, numbers and citations. Nothing exotic, nothing that needs a
  font download.
* **Large type.** Running text sits at 15 to 17 pt, list lines at 16 to 18 pt, slide
  titles at 38 to 46 pt. Lists open their gaps evenly so they use the full height of
  the slide instead of bunching at the top.
* **No boxes, cards or rules.** No panel fills, no outlines, no underlines and no
  horizontal bars. Structure comes from spacing, weight contrast and the ticks.
* **Animation.** Background art fades up first, headings rise, text fades in and the
  ticks grow into place. Each element carries its own delay, so slides assemble in
  reading order and then hold still.

## Slide flow

| # | Slide | Accent family |
| --- | --- | --- |
| 01 | Cover, group and course details | night |
| 02 | Introduction | dawn |
| 03 | Historical background | dawn |
| 04 | Major theorists | dawn |
| 05 | Core assumptions | dawn |
| 06 | Awareness | forest |
| 07 | The here and now | forest |
| 08 | Figure and ground | forest |
| 09 | Contact and the contact boundary | forest |
| 10 | Unfinished business | forest |
| 11 | Personal responsibility | forest |
| 12 | Role of the Gestalt counsellor | rose |
| 13 | Gestalt therapeutic techniques | rose |
| 14 | Empty chair technique | rose |
| 15 | Other experiential techniques | rose |
| 16 | Application in counselling | rose |
| 17 | Strengths of Gestalt therapy | violet |
| 18 | Limitations and criticisms | violet |
| 19 | Case application | violet |
| 20 | Critical evaluation | violet |
| 21 | Conclusion | night |
| 22 | References | night |

## Rebuilding

```bash
python -m venv .venv && .venv/bin/pip install python-pptx pillow numpy lxml
cd presentations/gestalt-theory-counselling/build

python scenes.py         # paint the backgrounds
python marks.py          # draw the tick marks, medallions and chevrons
python render_pptx.py    # write the .pptx, including the animation tree
python build_preview.py  # write preview/web/*.jpg and preview/index.html
```

The layout lives in one place, `build/irspec.py`. It describes each slide as a list of
instructions on a virtual 1600 by 900 stage and measures every text block before
placing it, so the PowerPoint file cannot overlap itself. Text is measured with fonts
that are metric compatible with Calibri and Cambria, so what you see in the preview is
what PowerPoint will lay out.

## Notes

* Slide size is 13.33 by 7.5 inches (16:9).
* The deck is fully editable: text is live text in text boxes, artwork is pictures.
* Animations start automatically after the previous effect. Clear them in PowerPoint
  under Animations, Animation Pane if you would rather present static.
