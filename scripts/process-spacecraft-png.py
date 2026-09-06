"""Fit one spacecraft source image into a 1024 PNG for the map."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

SIZE = 1024


def knockout_near_white(im: Image.Image, threshold: int = 246) -> Image.Image:
    pixels = list(im.getdata())
    cleaned = []
    for red, green, blue, alpha in pixels:
        if red >= threshold and green >= threshold and blue >= threshold:
            cleaned.append((red, green, blue, 0))
        else:
            cleaned.append((red, green, blue, alpha))
    out = im.copy()
    out.putdata(cleaned)
    return out


def corners_are_white(im: Image.Image) -> bool:
    width, height = im.size
    samples = [
        im.getpixel((2, 2)),
        im.getpixel((width - 3, 2)),
        im.getpixel((2, height - 3)),
        im.getpixel((width - 3, height - 3)),
    ]
    return all(pixel[0] > 236 and pixel[1] > 236 and pixel[2] > 236 for pixel in samples)


def fit_square(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    if corners_are_white(rgba):
        rgba = knockout_near_white(rgba)
    rgba.thumbnail((SIZE, SIZE), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = (SIZE - rgba.size[0]) // 2
    y = (SIZE - rgba.size[1]) // 2
    canvas.paste(rgba, (x, y), rgba)
    return canvas


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: process-spacecraft-png.py <input> <output>", file=sys.stderr)
        return 2
    source = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    with Image.open(source) as image:
        fit_square(image).save(dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
