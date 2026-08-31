#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Wikimedia Commons filenames verified via the Commons API (Aug 2026). */
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
  oberon: "Voyager 2 picture of Oberon.jpg",
  triton: "Triton moon mosaic Voyager 2 (large).jpg",
  charon: "Charon in True Color - High-Res.jpg",
  nix: "Nix viewed from New Horizons 2015-07-14 (cropped).jpg",
  hydra: "Hydra true color map.png",
  kerberos: "Kerberos (moon).jpg",
  styx: "Styx (moon).jpg",
  amalthea: "Jupiter's moon Amalthea photographed by Galileo.jpg",
  hyperion: "Hyperion false color.jpg",
  phoebe: "Phoebe closeup cassini NASA.jpg",
  puck: "Puck, moon of Uranus (1986).png",
  proteus: "Proteus (Voyager 2).jpg",
  nereid: "Nereid - Voyager 2.jpg",
  dysnomia: "Dysnomia-moon.png",
  hiiaka: "Hi'iakaMoon.png",
  namaka: "Namaka Hubble.png",
  mk2: "Makemake moon Hubble image only.jpg",
};

/** Center-crop zoom when the source frame includes a companion object. */
const CROP_ZOOM = {
  mk2: 2.8,
};

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../public/bodies");
const SIZE = 1024;
const USER_AGENT = "CosmicaGame/0.16.4 (educational; charlietheboss151/cosmica)";
const API_DELAY_MS = 2200;

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
      await sleep(2000 * attempt);
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
  const zoom = CROP_ZOOM[id] ?? 1;
  const scaled = Math.round(SIZE * zoom);
  writeFileSync(tmpIn, inputBuffer);
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      tmpIn,
      "-vf",
      `scale=${scaled}:${scaled}:force_original_aspect_ratio=increase,crop=${SIZE}:${SIZE}`,
      tmpOut,
    ],
    { stdio: "pipe" },
  );
  execFileSync("rm", ["-f", tmpIn]);
  return tmpOut;
}

mkdirSync(OUT_DIR, { recursive: true });

const failures = [];

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
  try {
    process.stdout.write(`Fetching ${id} (${filename})... `);
    const bytes = await download(filename);
    toPng(id, bytes);
    process.stdout.write("ok\n");
    await sleep(API_DELAY_MS);
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
    process.stdout.write(`failed (${error.message})\n`);
  }
}

if (failures.length > 0) {
  console.warn("Some images failed:\n" + failures.join("\n"));
  process.exitCode = 1;
}
console.log(`Processed ${Object.keys(MOON_FILES).length} moon images in ${OUT_DIR}`);
