"""
audit.py
Checks the built slide spec before anything is rendered.

  * nothing runs off the bottom or the right of the stage (the folio and the
    citation sit deliberately in the foot of the page and are skipped)
  * no dash of any kind appears in visible text
  * every asset a slide asks for exists
  * reports the type sizes in points, so the deck cannot quietly shrink
"""

import os

import irspec as S
import render_common as RC

SKIP = ("folio", "cite")
DASHES = "\u2010\u2011\u2012\u2013\u2014\u2015-"


def ink_right(el, sl):
    """Where the right hand end of the longest line actually falls."""
    widest = 0.0
    for p in el["paras"]:
        for line in RC.wrap_runs(p["runs"], el["w"]):
            w = 0.0
            for word, r in line:
                w += S.text_width(word + " ", r["size"], r["font"], r["bold"],
                                  r.get("spacing") or 0.0)
            widest = max(widest, w)
    align = el["paras"][0].get("align") or el.get("align", "l")
    if align == "c":
        return el["x"] + (el["w"] + widest) / 2
    if align == "r":
        return el["x"] + el["w"]
    return el["x"] + widest


def main():
    slides = S.build()
    problems, sizes, ticks, texts = [], [], 0, 0
    for sl in slides:
        for el in sl["els"]:
            if el["k"] == "text":
                texts += 1
                h = S.block_height(el["paras"], el["w"], el.get("line"))
                if el["y"] + h > S.STAGE_H - 26 and el.get("name") not in SKIP:
                    problems.append("slide %d: runs %.0f px past the foot: %r"
                                    % (sl["n"], el["y"] + h - S.STAGE_H + 26,
                                       el["paras"][0]["runs"][0]["s"][:44]))
                ink = ink_right(el, sl)
                if ink > S.STAGE_W - S.MARGIN + 60:
                    problems.append("slide %d: text reaches x=%.0f: %r"
                                    % (sl["n"], ink, el["paras"][0]["runs"][0]["s"][:44]))
                for p in el["paras"]:
                    for r in p["runs"]:
                        sizes.append(r["size"] * S.PT_PER_PX)
                        bad = [c for c in r["s"] if c in DASHES]
                        if bad:
                            problems.append("slide %d: dash %r in %r"
                                            % (sl["n"], bad[0], r["s"][:44]))
            elif el["k"] in ("img", "tick", "cross"):
                ticks += 1
                name = el.get("src")
                if el["k"] in ("tick", "cross"):
                    name = RC.TICK_FILES.get(el["color"])
                if name and not os.path.exists(os.path.join(RC.ASSETS, name)):
                    problems.append("slide %d: missing asset %s" % (sl["n"], name))
        for el in sl["els"]:
            if el["k"] == "text" and el["y"] + S.block_height(el["paras"], el["w"]) > S.STAGE_H:
                problems.append("slide %d: text past the page" % sl["n"])

    sizes.sort()
    n = len(sizes)
    print("%d slides, %d text blocks, %d ticks and marks" % (len(slides), texts, ticks))
    print("type in points: min %.1f  p25 %.1f  median %.1f  p75 %.1f  max %.1f"
          % (sizes[0], sizes[n // 4], sizes[n // 2], sizes[3 * n // 4], sizes[-1]))
    print("under 11 pt: %d of %d runs" % (sum(1 for s in sizes if s < 11), n))
    print("problems: %d" % len(problems))
    for p in problems[:40]:
        print("  ", p)
    return problems


if __name__ == "__main__":
    main()
