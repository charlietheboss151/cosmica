"""Cut a spacecraft out of its photo and fit it in a 1024 transparent PNG."""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

SIZE = 1024
PAD = 0.06
DARK_LUMA = 22
SCENE_RATIO = 0.28
MIN_OPAQUE = 8_000

FORCE_REMBG = {"hope"}
PRE_CROP: dict[str, tuple[float, float, float, float]] = {}

_session = None
_hope_session = None


def session():
    global _session
    if _session is None:
        _session = new_session("u2net")
    return _session


def hope_session():
    global _hope_session
    if _hope_session is None:
        _hope_session = new_session("isnet-general-use")
    return _hope_session


def rembg_cutout(im: Image.Image, craft_id: str = "") -> Image.Image:
    chosen = hope_session() if craft_id == "hope" else session()
    return remove(im.convert("RGBA"), session=chosen).convert("RGBA")


def already_cutout(im: Image.Image) -> bool:
    arr = np.array(im.convert("RGBA"))
    height, width = arr.shape[:2]
    corners = [
        int(arr[2, 2, 3]),
        int(arr[2, width - 3, 3]),
        int(arr[height - 3, 2, 3]),
        int(arr[height - 3, width - 3, 3]),
    ]
    return sum(1 for alpha in corners if alpha <= 16) >= 3


def luma(pixel: np.ndarray) -> int:
    return int((int(pixel[0]) * 30 + int(pixel[1]) * 59 + int(pixel[2]) * 11) / 100)


def knockout_near_white(im: Image.Image, threshold: int = 236) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    height, width = arr.shape[:2]
    seen = np.zeros((height, width), dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()

    def is_white(y: int, x: int) -> bool:
        pixel = arr[y, x]
        return int(pixel[0]) >= threshold and int(pixel[1]) >= threshold and int(pixel[2]) >= threshold

    def seed(y: int, x: int) -> None:
        if is_white(y, x):
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
        if not is_white(y, x):
            continue
        seen[y, x] = 1
        arr[y, x, 3] = 0
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width and not seen[ny, nx]:
                queue.append((ny, nx))
    return Image.fromarray(arr)


def corners_look_white(im: Image.Image) -> bool:
    arr = np.array(im.convert("RGBA"))
    height, width = arr.shape[:2]
    samples = [arr[2, 2], arr[2, width - 3], arr[height - 3, 2], arr[height - 3, width - 3]]
    return all(int(p[0]) > 230 and int(p[1]) > 230 and int(p[2]) > 230 for p in samples)


def knockout_edge_blue(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    height, width = arr.shape[:2]
    seen = np.zeros((height, width), dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()

    def is_display(y: int, x: int) -> bool:
        red, green, blue = (int(v) for v in arr[y, x][:3])
        return blue > 90 and blue > red + 25 and blue > green + 10

    def seed(y: int, x: int) -> None:
        if is_display(y, x):
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
        if not is_display(y, x):
            continue
        seen[y, x] = 1
        arr[y, x, 3] = 0
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width and not seen[ny, nx]:
                queue.append((ny, nx))
    return Image.fromarray(arr)


def knockout_dark_space(im: Image.Image, luma_max: int = DARK_LUMA) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    height, width = arr.shape[:2]
    seen = np.zeros((height, width), dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if luma(arr[y, x]) <= luma_max:
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
        if luma(arr[y, x]) > luma_max:
            continue
        seen[y, x] = 1
        arr[y, x, 3] = 0
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width and not seen[ny, nx]:
                queue.append((ny, nx))
    return Image.fromarray(arr)


def keep_main_subject(im: Image.Image, min_ratio: float = 0.35) -> Image.Image:
    arr = np.array(im)
    mask = arr[:, :, 3] > 16
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=np.uint8)
    components: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if not mask[y, x] or seen[y, x]:
                continue
            stack = [(y, x)]
            cells: list[tuple[int, int]] = []
            seen[y, x] = 1
            while stack:
                cy, cx = stack.pop()
                cells.append((cy, cx))
                for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = 1
                        stack.append((ny, nx))
            components.append(cells)
    if not components:
        return im
    largest = max(len(cells) for cells in components)
    keep = {id(cells) for cells in components if len(cells) >= largest * min_ratio}
    for cells in components:
        if id(cells) in keep:
            continue
        for cy, cx in cells:
            arr[cy, cx, 3] = 0
    return Image.fromarray(arr)


def drop_specks(im: Image.Image, min_area: int = 40) -> Image.Image:
    arr = np.array(im)
    mask = arr[:, :, 3] > 16
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=np.uint8)
    for y in range(height):
        for x in range(width):
            if not mask[y, x] or seen[y, x]:
                continue
            stack = [(y, x)]
            cells: list[tuple[int, int]] = []
            seen[y, x] = 1
            while stack:
                cy, cx = stack.pop()
                cells.append((cy, cx))
                for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = 1
                        stack.append((ny, nx))
            if len(cells) < min_area:
                for cy, cx in cells:
                    arr[cy, cx, 3] = 0
    return Image.fromarray(arr)


def opaque_count(im: Image.Image) -> int:
    alpha = np.array(im.split()[-1])
    return int((alpha > 16).sum())


def crop_to_subject(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    if bbox is None:
        return im
    cropped = im.crop(bbox)
    pad = max(4, int(max(cropped.size) * PAD))
    canvas = Image.new(
        "RGBA",
        (cropped.size[0] + pad * 2, cropped.size[1] + pad * 2),
        (0, 0, 0, 0),
    )
    canvas.paste(cropped, (pad, pad), cropped)
    return canvas


def fit_in_square(im: Image.Image) -> Image.Image:
    subject = crop_to_subject(im)
    width, height = subject.size
    scale = min(SIZE / max(width, 1), SIZE / max(height, 1))
    new_size = (max(1, int(width * scale)), max(1, int(height * scale)))
    if new_size != subject.size:
        subject = subject.resize(new_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = (SIZE - subject.size[0]) // 2
    y = (SIZE - subject.size[1]) // 2
    canvas.paste(subject, (x, y), subject)
    return canvas


def isolate_subject(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    alpha = rgba.split()[-1]
    eroded = Image.new("RGBA", rgba.size)
    eroded.paste(rgba, mask=alpha.filter(ImageFilter.MinFilter(3)))
    kept = keep_main_subject(drop_specks(eroded), min_ratio=1.0)
    grown = kept.split()[-1].filter(ImageFilter.MaxFilter(3))
    out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    out.paste(rgba, mask=grown)
    return out


def pick_cutout(im: Image.Image) -> Image.Image:
    if corners_look_white(im):
        white = isolate_subject(knockout_edge_blue(knockout_near_white(im)))
        if opaque_count(white) >= MIN_OPAQUE:
            return white
    space = isolate_subject(knockout_dark_space(im))
    pixels = im.size[0] * im.size[1]
    space_opaque = opaque_count(space)
    if MIN_OPAQUE <= space_opaque <= pixels * SCENE_RATIO:
        return space
    machine = isolate_subject(rembg_cutout(im))
    machine_opaque = opaque_count(machine)
    if MIN_OPAQUE <= machine_opaque <= pixels * SCENE_RATIO:
        return machine
    if space_opaque >= MIN_OPAQUE and space_opaque <= machine_opaque:
        return space
    return machine if machine_opaque >= space_opaque else space


def process_file(source: Path, dest: Path) -> None:
    craft_id = dest.stem
    with Image.open(source) as image:
        frame = image.convert("RGBA")
        box = PRE_CROP.get(craft_id)
        if box:
            width, height = frame.size
            frame = frame.crop(
                (
                    int(width * box[0]),
                    int(height * box[1]),
                    int(width * box[2]),
                    int(height * box[3]),
                )
            )
        if already_cutout(frame):
            cut = frame
        elif craft_id in FORCE_REMBG:
            cut = rembg_cutout(frame, craft_id)
        else:
            cut = pick_cutout(frame)
        fit_in_square(cut).save(dest)


def main() -> int:
    if len(sys.argv) == 3 and sys.argv[1] != "--batch":
        process_file(Path(sys.argv[1]), Path(sys.argv[2]))
        return 0
    if len(sys.argv) >= 3 and sys.argv[1] == "--batch":
        folder = Path(sys.argv[2])
        ids = sys.argv[3:]
        if not ids:
            print("usage: process-spacecraft-png.py --batch <dir> <id>...", file=sys.stderr)
            return 2
        for craft_id in ids:
            path = folder / f"{craft_id}.png"
            print(f"Cutting {craft_id}...", flush=True)
            process_file(path, path)
        return 0
    print(
        "usage: process-spacecraft-png.py <input> <output>\n"
        "       process-spacecraft-png.py --batch <dir> <id>...",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
