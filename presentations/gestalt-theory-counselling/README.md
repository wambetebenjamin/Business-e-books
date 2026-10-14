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

* **The new book template's own theme.** Light pages in the template's near white,
  with its soft white petals, its pale blue wash and its striped disc; the cover and the
  conclusion take its blue field. The palette is the template's: `#4595C2`, `#5DC5E6`
  and `#006AAD`. Two counselling photographs sit behind the layout at about a tenth of
  their strength, reduced to the bare silhouette of two empty chairs and of two people
  in conversation, so they read as a whisper rather than as pictures.
* **The Word tick bullet, not an emoji.** Every list line opens with the same heavy
  checkmark Word uses when you set a list to the tick bullet (Wingdings "u"). It is
  drawn once as artwork and reused, so it looks identical on every machine and never
  falls back to an emoji font. The cross on the "avoid" line follows the same idea.
* **The template's fonts, embedded.** Poppins for running text and labels, Raleway for
  headings and figures, lifted out of the template itself and written back into our file
  as embedded fonts, so the deck sets in that type on any machine, installed or not.
* **Large type.** Headings are measured at the size they will really set and take the
  largest size that holds them on one line, 25 to 56 pt in Raleway caps over the
  template's blue; the three longest headings take two lines rather than shrink. Poppins
  running text sits at 13 to 14 pt on the page and nothing anywhere sets below 10.5 pt.
* **Every page is balanced.** Once a slide is built its body is read as a stack of rows:
  the room left under the last row is shared out between the rows, and what remains
  becomes even white space above and below. Lists also open their own gaps to reach the
  foot of the page. Nothing hangs at the top of an empty slide, and the heading, the
  folio and the citation never move.
* **No boxes, cards or rules.** No panel fills, no outlines, no underlines and no
  horizontal bars. Structure comes from spacing, weight contrast and the ticks.
* **Animation.** Background art fades up first, headings rise, text fades in and the
  ticks grow into place. Each element carries its own delay, so slides assemble in
  reading order and then hold still.

## Slide flow

| # | Slide | Accent family |
| --- | --- | --- |
| 01 | Cover, group and course details | blue |
| 02 | Introduction | light |
| 03 | Historical background | light |
| 04 | Major theorists | light |
| 05 | Core assumptions | light |
| 06 | Awareness | light |
| 07 | The here and now | light |
| 08 | Figure and ground | light |
| 09 | Contact and the contact boundary | light |
| 10 | Unfinished business | light |
| 11 | Personal responsibility | light |
| 12 | Role of the Gestalt counsellor | light |
| 13 | Gestalt therapeutic techniques | light |
| 14 | Empty chair technique | light |
| 15 | Other experiential techniques | light |
| 16 | Application in counselling | light |
| 17 | Strengths of Gestalt therapy | light |
| 18 | Limitations and criticisms | light |
| 19 | Case application | light |
| 20 | Critical evaluation | light |
| 21 | Conclusion | blue |
| 22 | References | light |

## Rebuilding

```bash
python -m venv .venv && .venv/bin/pip install python-pptx pillow numpy lxml
cd presentations/gestalt-theory-counselling/build

python extract_fonts.py  # lift Poppins and Raleway out of the template
python scenes.py         # paint the backgrounds
python marks.py          # draw the tick marks, medallions and chevrons
python render_pptx.py    # write the .pptx, including the animation tree
python build_preview.py  # write preview/web/*.jpg and preview/index.html
```

The layout lives in one place, `build/irspec.py`. It describes each slide as a list of
instructions on a virtual 1600 by 900 stage and measures every text block before
placing it, so the PowerPoint file cannot overlap itself. Every line is measured with
the template's own Poppins and Raleway, the same faces that are embedded in the
finished file, so what you see in the preview is what PowerPoint will lay out. Run
`python audit.py` after a layout change: it fails loudly on anything that runs off the
page, on a missing asset or on a dash of any kind.

## Notes

* Slide size is 13.33 by 7.5 inches (16:9).
* The deck is fully editable: text is live text in text boxes, artwork is pictures.
* Animations start automatically after the previous effect. Clear them in PowerPoint
  under Animations, Animation Pane if you would rather present static.
