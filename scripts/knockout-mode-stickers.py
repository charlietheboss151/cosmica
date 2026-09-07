"""Knock out the navy square behind mission-picker stickers so the blue haze shows."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BODIES = ROOT / "public" / "bodies"

JOBS = (
    ("earth.png", "earth-sticker.png"),
    ("moon-sticker.png", "moon-sticker.png"),
    ("comet-sticker.png", "comet-sticker.png"),
)

BG_DIST = 24.0
SOFT_DIST = 48.0


def color_dist(pixels: np.ndarray, bg: np.ndarray) -> np.ndarray:
    delta = pixels.astype(np.float32) - bg
    return np.sqrt(np.sum(delta * delta, axis=-1))


def flood_background(dist: np.ndarray, limit: float) -> np.ndarray:
    height, width = dist.shape
    seen = np.zeros((height, width), dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if dist[y, x] < limit:
            queue.append((y, x))

    for x in range(width):
        seed(0, x)
        seed(height - 1, x)
    for y in range(height):
        seed(y, 0)
        seed(y, width - 1)

    while queue:
        y, x = queue.popleft()
        if seen[y, x]:
            continue
        if dist[y, x] >= limit:
            continue
        seen[y, x] = 1
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width and not seen[ny, nx]:
                queue.append((ny, nx))
    return seen.astype(bool)


def knockout(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    rgb = arr[:, :, :3]
    height, width = rgb.shape[:2]
    corners = np.array(
        [rgb[2, 2], rgb[2, width - 3], rgb[height - 3, 2], rgb[height - 3, width - 3]],
        dtype=np.float32,
    )
    bg = np.median(corners, axis=0)
    dist = color_dist(rgb, bg)
    background = flood_background(dist, SOFT_DIST)
    alpha = arr[:, :, 3].astype(np.float32)
    fade = np.clip((dist - BG_DIST) / (SOFT_DIST - BG_DIST), 0.0, 1.0)
    alpha[background] = np.minimum(alpha[background], fade[background] * 255.0)
    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr)


def main() -> None:
    for src_name, dest_name in JOBS:
        src = BODIES / src_name
        dest = BODIES / dest_name
        knocked = knockout(Image.open(src))
        knocked.save(dest)
        print(f"wrote {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
