from __future__ import annotations

import os
from functools import lru_cache
from typing import Tuple

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


REGULAR_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial.ttf",
]

BOLD_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial-Bold.ttf",
]


def _first_existing(paths):
    for p in paths:
        if p and os.path.exists(p):
            return p
    return None


@lru_cache(maxsize=1)
def get_pl_font_names() -> Tuple[str, str]:
    """
    Ensure a Unicode TTF font with Polish glyphs is registered.
    Returns a tuple of (regular_name, bold_name) to be used with canvas.setFont.
    Falls back to Helvetica variants if no TTF is available (may not render diacritics).
    """
    # Allow override via env
    override_regular = os.environ.get("PDF_FONT_REGULAR")
    override_bold = os.environ.get("PDF_FONT_BOLD")

    regular_path = override_regular or _first_existing(REGULAR_CANDIDATES)
    bold_path = override_bold or _first_existing(BOLD_CANDIDATES)

    regular_name = "PL-Regular"
    bold_name = "PL-Bold"

    try:
        if regular_path:
            if not pdfmetrics.getFont(regular_name):  # type: ignore[attr-defined]
                pass
        # The above getFont access pattern may raise; perform guarded registration below.
    except Exception:
        # Proceed to registration attempt
        pass

    registered = False
    try:
        if regular_path:
            pdfmetrics.registerFont(TTFont(regular_name, regular_path))
            registered = True
        if bold_path:
            pdfmetrics.registerFont(TTFont(bold_name, bold_path))
        else:
            # if bold missing, just reuse regular for bold
            bold_name = regular_name
    except Exception:
        registered = False

    if registered:
        return regular_name, bold_name

    # Fallback to built-in fonts (limited charset)
    return "Helvetica", "Helvetica-Bold"

