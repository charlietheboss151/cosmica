"""Build public/bodies/amalthea.png from NASA PIA07248.

Galileo flyby stills of Amalthea are too soft at map size. The left panel of
PIA07248 ("Amalthea, A Rubble-Pile Moon") is a shape model with a readable
potato silhouette; this grades it to Amalthea's rust color.
"""

from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "bodies" / "amalthea.png"
SOURCE = "https://images-assets.nasa.gov/image/PIA07248/PIA07248~orig.jpg"
USER_AGENT = "CosmicaGame/0.26.7 (educational; charlietheboss151/cosmica)"


def download() -> Image.Image:
    request = Request(SOURCE, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=40) as response:
        return Image.open(response).convert("RGB")


def to_square(im: Image.Image, zoom: float = 1.0) -> Image.Image:
    width, height = im.size
    side = min(width, height) / zoom
    cx, cy = width / 2, height / 2
    return im.crop((cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2))


def colorize(im: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(im)
    gray = ImageEnhance.Contrast(gray).enhance(1.22)
    gray = ImageEnhance.Brightness(gray).enhance(1.08)
    colored = ImageOps.colorize(gray, black="#120704", mid="#c45c34", white="#f4d0ae")
    return ImageEnhance.Color(colored).enhance(1.12)


def main() -> None:
    source = download()
    width, height = source.size
    left = source.crop((12, 6, width // 3 - 6, height - 6))
    framed = to_square(colorize(left), zoom=1.18).resize((1024, 1024), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    framed.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
