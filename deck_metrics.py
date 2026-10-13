"""
Shared text-metric helpers used by BOTH the deck builder and the verifier.

There is no LibreOffice in this sandbox, so we cannot rasterise the .pptx to
check layout. Instead we measure string widths with real TrueType metrics
(DejaVuSans, which is ~10% wider than Calibri) and apply a conservative scale
factor. Being deliberately pessimistic means the builder leaves slack and the
verifier never passes a box that would actually overflow.
"""
from PIL import ImageFont

TTF = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
TTF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SCALE = 0.92          # Calibri is narrower than DejaVu Sans
LINE_FACTOR = 1.21    # single-space line height as a multiple of font size

_cache = {}


def _font(size_pt, bold):
    key = (round(size_pt, 1), bold)
    if key not in _cache:
        path = TTF_B if bold else TTF
        _cache[key] = ImageFont.truetype(path, max(1, int(round(size_pt * 4))))
    return _cache[key]


def width_in(text, size_pt, bold=False):
    """Rendered width of `text` in inches at `size_pt`."""
    f = _font(size_pt, bold)
    return (f.getlength(text) / 4.0) * SCALE / 72.0


def n_lines(text, size_pt, box_w_in, bold=False):
    if not text:
        return 1
    w = width_in(text, size_pt, bold)
    return max(1, int(w / max(box_w_in, 0.05)) + 1)


def para_height_in(text, size_pt, box_w_in, bold=False, line_spacing=1.0,
                   space_before=0.0, space_after=0.0):
    lines = n_lines(text, size_pt, box_w_in, bold)
    return lines * size_pt * LINE_FACTOR * line_spacing / 72.0 \
        + (space_before + space_after) / 72.0
