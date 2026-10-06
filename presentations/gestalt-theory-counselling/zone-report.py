#!/usr/bin/env python3
"""Zone-luminance report for background candidates.
Slide 13.333x7.5in mapped to 1600x900. Text zones where free bg text sits:
  header  (eyebrow+title)      x .66-8.5,  y 0.5-1.5
  cite    (citations)          x .66-7.6,  y 6.3-6.9
  footer  (brand + number)     x .66-12.6, y 7.05-7.42
  midleft (free lists/quotes)  x .66-8.5,  y 1.6-6.2
  hero    (S1 title slide)     x .60-7.6,  y 0.7-6.5
Light slides need mean-L >= 0.60 in header/cite/footer/midleft.
Dark slides need mean-L <= 0.26 in every zone (WHITE text 3:1).
"""
import subprocess, sys

def lum(path, zx, zy, zw, zh):
    # crop zone, average to 1 pixel, read sRGB, convert to WCAG luminance
    out = subprocess.run(
        ["convert", path, "-crop", f"{zw}x{zh}+{zx}+{zy}", "+repage",
         "-resize", "1x1!", "txt:-"], capture_output=True, text=True).stdout
    for line in out.splitlines():
        if line.startswith("#"):
            continue
        if "(" in line and "," in line:
            rgb = line.split("(")[1].split(")")[0].split(",")
            r, g, b = (float(c) / 255.0 for c in rgb[:3])
            f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    return None

Z = {  # name: (x, y, w, h) in 1600x900 px
    "header":  (79, 60, 941, 120),
    "cite":    (79, 756, 833, 72),
    "footer":  (79, 846, 1435, 48),
    "midleft": (79, 192, 941, 552),
    "hero":    (72, 84, 840, 696),
}

for path in sys.argv[1:]:
    vals = {n: lum(path, *z) for n, z in Z.items()}
    light_min = min(vals["header"], vals["cite"], vals["footer"], vals["midleft"])
    dark_max = max(vals.values())
    verdict = "LIGHT-OK" if light_min >= 0.60 else ("DARK-OK" if dark_max <= 0.26 else "fail")
    print(f"{path.split('/')[-1]:28s} {verdict:9s} "
          + " ".join(f"{n}={v:.3f}" for n, v in vals.items()))
