# Booklet assets

Support files for `../generate-treasure-tuesday.js`.

## fonts/

Premium typefaces, all under the SIL Open Font License, taken from the
[google/fonts](https://github.com/google/fonts) repository. The variable
families were instantiated to static weights with
`fontTools.varLib.instancer` (see the commands in the git history of this file).

| file | face | used for |
|---|---|---|
| `playfair-700.ttf` | Playfair Display 700 | cover title, page headlines, section heads |
| `playfair-500.ttf` | Playfair Display 500 | numerals, lighter display |
| `playfair-it500.ttf` | Playfair Display Italic 500 | sublines, card titles |
| `lora-400.ttf` | Lora 400 | body copy |
| `lora-600.ttf` | Lora 600 | list headings |
| `lora-it400.ttf` / `lora-it500.ttf` | Lora Italic | intros, notes |
| `cormorant-500.ttf` | Cormorant Garamond 500 | pull quotes |
| `cormorant-it500.ttf` | Cormorant Garamond Italic | scripture quotations |
| `marcellussc.ttf` | Marcellus SC | kickers, labels, the G R A C E discs |
| `droid-serif-*.ttf` | Droid Serif | kept for reference: it is the typeface of the supplied template |

## img/

Photography is from Pexels: free to use, no attribution required, no watermark
(<https://www.pexels.com/license/>). Nothing here is stock licensed by Getty,
Dreamstime or Shutterstock.

`prepare-book-images.py` centre crops each source, grades it slightly and
unsharps it, then writes `manifest.json`. **The generator reads that manifest and
caps every photo box at the file's own resolution**, so no panel is ever enlarged
and every image in the book prints at 190 dpi or better (the build log reports
the actual figure per panel).

| file | px | where it appears |
|---|---|---|
| `cover.jpg` | 870x750 | front cover panel |
| `community.jpg` | 500x316 | page 2 |
| `balance.jpg` | 1125x643 | page 6, full width strip |
| `choir.jpg` | 500x750 | page 7 |
| `nairobi.jpg` | 500x316 | page 8 |
| `worship.jpg` | 500x750 | back cover |
| `scripture.jpg`, `reflect.jpg`, `grace.jpg`, `gathering.jpg` | 500px class | spare, not used in this edition |
