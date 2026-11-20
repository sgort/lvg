"""Export the LVG social cards from "Social cards LVG.html" as PNG at exactly 1200x630.

Usage (from this folder):
    pip install playwright && playwright install chromium   # once
    python render-cards.py [output-folder]

Writes og-image-prod.png and og-image-acc.png. The default output folder is the repository's
public/ (../../public from docs/social/).
Fonts: the card asks for RijksoverheidSansWebText and falls back to Fira Sans. Install
Fira Sans (OFL) locally, or the browser falls back further and the layout shifts.
"""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "Social cards LVG.html"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent.parent / "public"
CARDS = {"card-prod": "og-image-prod.png", "card-acc": "og-image-acc.png"}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1300, "height": 800}, device_scale_factor=1)
        page.goto(SOURCE.as_uri())
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")
        for card_id, name in CARDS.items():
            card = page.locator(f"#{card_id}")
            box = card.bounding_box()
            if not box or round(box["width"]) != 1200 or round(box["height"]) != 630:
                raise SystemExit(f"#{card_id} is not 1200x630: {box}")
            card.screenshot(path=str(OUT / name))
            print(f"wrote {OUT / name}")
        browser.close()


if __name__ == "__main__":
    main()
