# Gestalt Theory and Its Application to Counselling

A 22 slide presentation for Group 4, MCP504 Theories of Counseling and Psychotherapy,
Pan African Christian University. Lecturer, Dr. Lucy Gachenia.

| File | What it is |
| --- | --- |
| `Gestalt Theory and Its Application to Counselling.pptx` | the deliverable, editable in PowerPoint, with entrance animations |
| `preview/index.html` | web preview of every slide, open this to look the deck over quickly |
| `preview/contact-sheet.jpg` | one image showing all 22 slides |
| `assets/` | the generated artwork (backgrounds, tick badges, medallions) |
| `build/` | the generator. Everything above can be rebuilt from here |

## Design direction

* **Hand painted silhouette backgrounds.** Eighteen scenes were drawn in code:
  fractal ridge lines, forest canopies, savannah acacias, dunes, still water, birds,
  single figures and empty chairs, all composited over soft gradient skies with
  atmospheric haze between the layers. Each slide gets its own composition, so the
  deck belongs to one visual family rather than a stock photo pack.
* **Three dimensional ticks instead of bullets.** Every list line is introduced by a
  glossy bevelled tick badge (or a small extruded bare tick), with a light source,
  a bevel, an inner highlight, a specular sweep and a soft ground shadow.
  There are no bullet glyphs and no dashes anywhere in the deck.
* **No boxes, cards or rules.** No panel fills, no outlines, no underlines and no
  horizontal bars. Structure comes from spacing, weight contrast and the ticks.
* **No Office default type.** The whole deck uses Verdana for running text,
  Playfair Display for headings and Consolas for labels and numbers.
  Arial, Aptos, Calibri and Roboto are never referenced.
* **Animation.** Text fades in, headlines rise, ticks grow and fade in, and the
  background art fades up first. Each element carries its own delay, so slides
  assemble in reading order and then hold still.

## Slide flow

| # | Slide | Colour family |
| --- | --- | --- |
| 01 | Cover, group and course details | night, summit |
| 02 | Introduction | dawn ridge |
| 03 | Historical background | dawn, layered hills |
| 04 | Major theorists | dawn, three figures on the ridge |
| 05 | Core assumptions | dawn valley |
| 06 | Awareness | forest, mist and conifers |
| 07 | The here and now | forest, quiet lake |
| 08 | Figure and ground | forest, one lit figure stepping forward |
| 09 | Contact and the contact boundary | forest, two figures meeting |
| 10 | Unfinished business | forest, a distant tree |
| 11 | Personal responsibility | forest, a walker |
| 12 | Role of the Gestalt counsellor | rose, seated pair |
| 13 | Gestalt therapeutic techniques | rose, three chairs |
| 14 | Empty chair technique | rose, chair facing chair |
| 15 | Other experiential techniques | rose, reeds and birds |
| 16 | Application in counselling | rose, gathered figures |
| 17 | Strengths of Gestalt therapy | violet, sunrise dunes |
| 18 | Limitations and criticisms | violet, wind shaped trees |
| 19 | Case application | violet, the student |
| 20 | Critical evaluation | violet, twin ridges |
| 21 | Conclusion | night, summit and moon |
| 22 | References | night, still sky |

## Rebuilding

```bash
python -m venv .venv && .venv/bin/pip install python-pptx pillow numpy
cd presentations/gestalt-theory-counselling/build

python scenes.py         # paint the backgrounds, tick badges, medallions, chevrons
python render_pptx.py    # write the .pptx, including the animation tree
python build_preview.py  # write preview/web/*.jpg and preview/index.html
```

The layout lives in one place, `build/irspec.py`. It describes each slide as a list
of instructions on a virtual 1600 by 900 stage, and it measures every text block
before placing anything, so the PowerPoint file can never overlap itself. Two
renderers consume that description: `render_pptx.py` for the deliverable and
`render_png.py` for the previews.

## Notes

* Slide size is 13.33 by 7.5 inches (16:9).
* The deck is fully editable: text is live text in text boxes, artwork is pictures.
* Animations are set to start automatically after the previous effect. Clear them
  in PowerPoint under Animations, Animation Pane if you would rather present static.
