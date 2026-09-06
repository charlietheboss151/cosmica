#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Prefer in-space photos, then in-space artist concepts, then a clean model
 * or drawing of that specific craft. First filename is preferred.
 */
const SPACECRAFT_FILES = {
  "parker-solar-probe": [
    "Solar Probe Plus spacecraft on approach to the sun.jpg",
    "Parker Solar Probe spacecraft model.png",
  ],
  "solar-orbiter": [
    "Solar Orbiter spacecraft.png",
    "Solar Orbiter ESA20813950.jpg",
    "Solar Orbiter- journey around the Sun ESA21809047.jpg",
  ],
  bepicolombo: [
    "BepiColombo spacecraft model.png",
    "BepiColombo spacecraft stack ESA380846.jpg",
  ],
  akatsuki: ["Akatsuki CG01.png", "Akatsuki.jpg"],
  iss: [
    "ISS-56 International Space Station fly-around (07).jpg",
    "International Space Station after undocking of STS-132.jpg",
  ],
  hubble: ["Hubble 2009 close-up 2.jpg", "HST-SM4.jpeg", "Hubble 01.jpg"],
  jwst: ["JWST spacecraft model 3.png", "JWST spacecraft model 2.png"],
  chandra: [
    "Chandra artist illustration.jpg",
    "Chandra X-ray Observatory spacecraft model.png",
  ],
  mro: [
    "Mars Reconnaissance Orbiter, front view, artist's concept (PIA07245).jpg",
    "Mars Reconnaissance Orbiter spacecraft model.png",
  ],
  maven: [
    "The MAVEN spacecraft and the limb of Mars.jpg",
    "MAVEN spacecraft model.png",
  ],
  hope: [
    "Emirates Mars Mission mockup at IAC 2021 01 (cropped).jpg",
    "Emirates Mars Mission mockup at IAC 2021 01.jpg",
  ],
  "mars-odyssey": [
    "Mars Odyssey spacecraft model.png",
    "2001 mars odyssey wizja.jpg",
  ],
  "mars-express": [
    "Mars Express over Tharsis volcanoes.jpg",
    "Mars Express.jpg",
  ],
  "tianwen-1": ["Tianwen-1 schematic.png", "Tianwen-1 in Mars orbit.jpg"],
  juno: ["Juno spacecraft model 1.png", "Juno & Jupiter (30273927457).jpg"],
  juice: ["Juice launch kit cover close-up.png", "JUICE spacecraft model 2.png"],
  "europa-clipper": [
    "Europa Clipper spacecraft model.png",
    "The Clipper Spacecraft Above Europa - Ver 2-A (15585466881).jpg",
  ],
  "galileo-spacecraft": [
    "Artwork Galileo-Io-Jupiter.JPG",
    "Galileo spacecraft model.png",
  ],
  cassini: [
    "Cassini Over Enceladus (29863511980).png",
    "Cassini Saturn Orbit Insertion.jpg",
    "Cassini spacecraft model.png",
  ],
  "new-horizons": [
    "NASA’s New Horizons spacecraft (NH final).jpg",
    "New Horizons Spacecraft (ann24023a).jpg",
    "New Horizons spacecraft model 1.png",
  ],
  "voyager-1": ["Voyager spacecraft model.png", "Voyager spacecraft.jpg"],
  "voyager-2": ["Voyager spacecraft model.png", "Voyager spacecraft.jpg"],
  "pioneer-10": [
    "Pioneer 10-11 spacecraft.jpg",
    "An artist's impression of a Pioneer spacecraft on its way to interstellar space.jpg",
  ],
  "pioneer-11": [
    "Pioneer 10 or 11 in outer solar system.jpg",
    "Pioneer 10-11 spacecraft.jpg",
    "An artist's impression of a Pioneer spacecraft on its way to interstellar space.jpg",
  ],
  ulysses: ["Ulysses spacecraft model.png", "Ulysses spacecraft.jpg"],
  lucy: ["Lucy spacecraft model.png", "Lucy-PatroclusMenoetius-art.png"],
  "psyche-probe": [
    "PIA21499 - Artist's Concept of Psyche Spacecraft with Five-Panel Array.jpg",
    "Psyche spacecraft model.png",
  ],
};

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(ROOT, "../public/bodies");
const PROCESS = join(ROOT, "process-spacecraft-png.py");
const USER_AGENT = "CosmicaGame/0.28.0 (educational; charlietheboss151/cosmica)";
const API_DELAY_MS = 4000;

/** Direct NASA image-library URLs used when Commons is missing or rate-limits. */
const NASA_URLS = {
  "mars-odyssey":
    "https://images-assets.nasa.gov/image/PIA04244/PIA04244~medium.jpg",
  juno: "https://images-assets.nasa.gov/image/PIA16869/PIA16869~medium.jpg",
  "galileo-spacecraft":
    "https://images-assets.nasa.gov/image/PIA18176/PIA18176~medium.jpg",
  cassini: "https://images-assets.nasa.gov/image/PIA04233/PIA04233~orig.jpg",
  "psyche-probe":
    "https://images-assets.nasa.gov/image/PIA21499/PIA21499~medium.jpg",
};

const NASA_FALLBACKS = {
  ulysses:
    "https://images-assets.nasa.gov/image/s41-601-009/s41-601-009~medium.jpg",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, label, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (response.ok) {
      return response;
    }
    if ((response.status === 429 || response.status >= 500) && attempt < attempts) {
      await sleep(Math.min(3000 * attempt, 12000));
      continue;
    }
    throw new Error(`${label} failed: ${response.status}`);
  }
  throw new Error(`${label} failed after retries`);
}

async function resolveUrl(filename) {
  const title = encodeURIComponent(`File:${filename}`);
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&iiurlwidth=2048&format=json`;
  const response = await fetchWithRetry(api, `API for ${filename}`);
  const data = await response.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (page?.missing) {
    return null;
  }
  const info = page?.imageinfo?.[0];
  return info?.thumburl || info?.url || null;
}

async function download(filename) {
  try {
    const url = await resolveUrl(filename);
    if (url) {
      try {
        const response = await fetchWithRetry(url, `Download for ${filename}`);
        return Buffer.from(await response.arrayBuffer());
      } catch {
        // Commons bitservers 429 often; try the public thumb proxy.
      }
    }
  } catch {
    // Commons API 429
  }
  return downloadWeserv(filename);
}

function commonsStoredName(filename) {
  return filename.replaceAll(" ", "_");
}

function commonsMd5Path(filename) {
  const stored = commonsStoredName(filename);
  const hash = createHash("md5").update(stored).digest("hex");
  return `${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(stored)}`;
}

async function downloadWeserv(filename) {
  const path = commonsMd5Path(filename);
  const url = `https://images.weserv.nl/?url=${encodeURIComponent(`upload.wikimedia.org/wikipedia/commons/${path}`)}&w=1600`;
  const response = await fetchWithRetry(url, `Weserv for ${filename}`);
  return Buffer.from(await response.arrayBuffer());
}

function toPng(id, inputBuffer) {
  const tmpIn = join(OUT_DIR, `.${id}.src`);
  const tmpOut = join(OUT_DIR, `${id}.png`);
  writeFileSync(tmpIn, inputBuffer);
  try {
    execFileSync("python", [PROCESS, tmpIn, tmpOut], { stdio: "pipe" });
  } finally {
    try {
      unlinkSync(tmpIn);
    } catch {
      // ignore
    }
  }
  return tmpOut;
}

mkdirSync(OUT_DIR, { recursive: true });

const failures = [];
const used = [];
const force = process.argv.includes("--force");
const onlyIds = process.argv.filter(
  (arg) => arg !== "--force" && !arg.endsWith(".mjs") && !arg.endsWith(".js"),
);

for (const [id, filenames] of Object.entries(SPACECRAFT_FILES)) {
  if (onlyIds.length > 0 && !onlyIds.includes(id)) {
    continue;
  }
  const outPath = join(OUT_DIR, `${id}.png`);
  if (!force && onlyIds.length === 0) {
    try {
      accessSync(outPath);
      process.stdout.write(`Skipping ${id}, already exists\n`);
      continue;
    } catch {
      // fetch missing file
    }
  }
  process.stdout.write(`Fetching ${id}... `);
  try {
    let chosen = null;
    let bytes = null;
    let lastError = "no source resolved";
    const nasaUrl = NASA_URLS[id];
    if (nasaUrl) {
      try {
        const response = await fetchWithRetry(nasaUrl, `NASA for ${id}`);
        bytes = Buffer.from(await response.arrayBuffer());
        chosen = nasaUrl;
      } catch (error) {
        lastError = error.message;
      }
    }
    if (!bytes) {
      for (const filename of filenames) {
        try {
          bytes = await download(filename);
          if (bytes) {
            chosen = filename;
            break;
          }
          lastError = `missing ${filename}`;
        } catch (error) {
          lastError = error.message;
        }
        await sleep(API_DELAY_MS);
      }
    }
    if (!bytes) {
      const fallback = NASA_FALLBACKS[id];
      if (fallback) {
        const response = await fetchWithRetry(fallback, `NASA fallback for ${id}`);
        bytes = Buffer.from(await response.arrayBuffer());
        chosen = fallback;
      }
    }
    if (!bytes || !chosen) {
      throw new Error(lastError);
    }
    toPng(id, bytes);
    process.stdout.write(`ok (${chosen})\n`);
    used.push(`${id}: ${chosen}`);
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
    process.stdout.write(`failed (${error.message})\n`);
  }
  await sleep(API_DELAY_MS);
}

if (used.length > 0) {
  console.log("\nUsed files:\n" + used.map((line) => `- ${line}`).join("\n"));
}
if (failures.length > 0) {
  console.warn("Some images failed:\n" + failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Processed ${Object.keys(SPACECRAFT_FILES).length} spacecraft images in ${OUT_DIR}`);
}
