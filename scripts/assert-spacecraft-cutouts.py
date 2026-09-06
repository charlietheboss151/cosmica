"""Fail if spacecraft map art still has an opaque square background."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BODIES = ROOT / "public" / "bodies"

# These use cartoon art; their photos are a sun or a museum hall.
SKIP = {"solar-orbiter", "hope"}


def main() -> int:
    ids = [
        path.stem
        for path in sorted(BODIES.glob("*.png"))
        if path.stem
        in {
            "parker-solar-probe",
            "solar-orbiter",
            "bepicolombo",
            "akatsuki",
            "iss",
            "hubble",
            "jwst",
            "chandra",
            "mro",
            "maven",
            "hope",
            "mars-odyssey",
            "mars-express",
            "tianwen-1",
            "juno",
            "juice",
            "europa-clipper",
            "galileo-spacecraft",
            "cassini",
            "new-horizons",
            "voyager-1",
            "voyager-2",
            "pioneer-10",
            "pioneer-11",
            "ulysses",
            "lucy",
            "psyche-probe",
        }
    ]
    failed: list[str] = []
    for craft_id in ids:
        if craft_id in SKIP:
            continue
        image = Image.open(BODIES / f"{craft_id}.png").convert("RGBA")
        width, height = image.size
        corners = [
            image.getpixel((2, 2))[3],
            image.getpixel((width - 3, 2))[3],
            image.getpixel((2, height - 3))[3],
            image.getpixel((width - 3, height - 3))[3],
        ]
        if any(alpha > 16 for alpha in corners):
            failed.append(f"{craft_id}: opaque corners {corners}")
    if failed:
        print("\n".join(failed), file=sys.stderr)
        return 1
    print(f"checked {len(ids) - len(SKIP)} spacecraft cutouts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
