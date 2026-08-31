#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MOON_FILES = {
  moon: "Full_Moon_Luc_Viatour.jpg",
  phobos: "Phobos_colour_2008.jpg",
  deimos: "Deimos-MRO.jpg",
  io: "Io, moon of Jupiter, NASA.jpg",
  europa: "PIA19048 realistic color Europa mosaic edited.jpg",
  ganymede: "Ganymede, moon of Jupiter, NASA.jpg",
  callisto: "Callisto, moon of Jupiter, NASA.jpg",
  mimas: "Mimas Cassini.jpg",
  enceladus: "Enceladusstripes cassini-edit2.jpg",
  tethys: "Tethys from Cassini (1).jpg",
  dione: "Dione-from-Cassini(Nov-2004).jpg",
  rhea: "PIA07763 Rhea full globe5.jpg",
  titan: "Titan in true color.jpg",
  iapetus: "Iapetus as seen by the Cassini probe - 20071008.jpg",
  miranda: "Miranda mosaic in color - Voyager 2.png",
  ariel: "Ariel in monochrome.jpg",
  umbriel: "PIA00040 Umbrielx2.47.jpg",
  titania: "Titania (moon) color, cropped.jpg",
  oberon: "Oberon map JPL USGS.jpg",
  triton: "Triton moon mosaic Voyager 2 (large).jpg",
};

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../public/bodies");
const SIZE = 1024;
const USER_AGENT = "CosmicaGame/0.15.3 (educational; charlietheboss151/cosmica)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, label, attempts = 6) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (response.ok) {
      return response;
    }
    if (response.status === 429 && attempt < attempts) {
      await sleep(1500 * attempt);
      continue;
    }
    throw new Error(`${label} failed: ${response.status}`);
  }
  throw new Error(`${label} failed after retries`);
}

async function resolveUrl(filename) {
  const title = encodeURIComponent(`File:${filename}`);
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&format=json`;
  const response = await fetchWithRetry(api, `API for ${filename}`);
  const data = await response.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (page?.missing) {
    throw new Error(`Missing file on Commons: ${filename}`);
  }
  const url = page?.imageinfo?.[0]?.url;
  if (!url) {
    throw new Error(`No download URL for ${filename}`);
  }
  return url;
}

async function download(filename) {
  const url = await resolveUrl(filename);
  const response = await fetchWithRetry(url, `Download for ${filename}`);
  return Buffer.from(await response.arrayBuffer());
}

function toPng(id, inputBuffer) {
  const tmpIn = join(OUT_DIR, `.${id}.src`);
  const tmpOut = join(OUT_DIR, `${id}.png`);
  writeFileSync(tmpIn, inputBuffer);
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      tmpIn,
      "-vf",
      `scale=${SIZE}:${SIZE}:force_original_aspect_ratio=increase,crop=${SIZE}:${SIZE}`,
      tmpOut,
    ],
    { stdio: "pipe" },
  );
  execFileSync("rm", ["-f", tmpIn]);
  return tmpOut;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const [id, filename] of Object.entries(MOON_FILES)) {
  const outPath = join(OUT_DIR, `${id}.png`);
  if (!process.argv.includes("--force")) {
    try {
      accessSync(outPath);
      process.stdout.write(`Skipping ${id}, already exists\n`);
      continue;
    } catch {
      // fetch missing file
    }
  }
  process.stdout.write(`Fetching ${id} (${filename})... `);
  const bytes = await download(filename);
  toPng(id, bytes);
  process.stdout.write("ok\n");
  await sleep(1200);
}

console.log(`Wrote ${Object.keys(MOON_FILES).length} moon images to ${OUT_DIR}`);
