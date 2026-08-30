#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Wikimedia Commons filenames verified via the Commons API (Aug 2026). */
const CELESTIAL_FILES = {
  ceres: "Ceres - RC3 - Haulani Crater (22381131691) (cropped).jpg",
  pluto: "Pluto in True Color - High-Res.jpg",
  eris: "Eris and dysnomia.jpg",
  haumea: "Haumea Hubble.png",
  makemake: "Makemake and its moon.jpg",
  sedna: "Sedna Dwarf Planet (Artist\u2019s Interpretation).jpg",
  quaoar: "Quaoar-weywot hst.jpg",
  vesta: "Vesta as seen with the Dawn spacecraft (ann14003b).jpg",
  pallas: "Potw1749a Pallas crop.png",
  psyche: "Psyche VLT.png",
  bennu: "Bennu mosaic OSIRIS-REx (square).png",
  ryugu:
    "A Box of Treasure from Asteroid Ryugu (SVS14089 - AsteroidRyuguOrganicsV4).png",
  ida: "243 ida.jpg",
  gaspra: "951 Gaspra.jpg",
  mathilde: "(253) mathilde.jpg",
  eros: "PIA02475 Eros' Bland Butterscotch Colors.jpg",
  itokawa: "Itokawa06 hayabusa.jpg",
  lutetia: "Rosetta triumphs at asteroid Lutetia.jpg",
  halley: "Comet Halley close up-cropped.jpg",
  "hale-bopp": "Comet-Hale-Bopp-29-03-1997 hires adj.jpg",
  "67p": "Comet 67P on 19 September 2014 NavCam mosaic.jpg",
  "tempel-1":
    "Hubble Images Comet Tempel 1 Just Before Deep Impact Probe Arrives (heic0509h).jpg",
  "wild-2": "Comet Wild2.jpg",
  "shoemaker-levy-9": "Comet P-Shoemaker-Levy 9 (1994-43-203).jpg",
};

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../public/bodies");
const SIZE = 1024;
const USER_AGENT = "CosmicaGame/0.15.3 (educational; charlietheboss151/cosmica)";
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

const failures = [];

for (const [id, filename] of Object.entries(CELESTIAL_FILES)) {
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
console.log(`Processed ${Object.keys(CELESTIAL_FILES).length} celestial images in ${OUT_DIR}`);
