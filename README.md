# Cosmica

Cosmica is a browser game: an interactive 2D map of the Solar System that you learn by navigating. Find objects on the map — it is the answer interface, not a multiple-choice quiz.

This version is a **Planets**, **Moons**, and **Celestial bodies** quiz on the **full map**, in the style of Seterra: click the named body, a timer runs, the score is how many you have placed out of the set, and each body is asked once. You get **3 guesses per body**; find it on the first try for a green ring, second for yellow, third for orange, or miss all three and the answer is revealed with a red ring. The Sun and planets use cartoon sticker art; moons use NASA mission photos. Names stay off the map until you place a body.

- **Planets** — find the eight planets; moons appear as tiny scenery.
- **Moons** — find the major moons; planets stay visible but grayed. Optional **Include all moons** hard mode adds Charon, Amalthea, Hyperion, and more.
- **Celestial bodies** — dwarf planets, famous asteroids, comets, and regions (belts, scattered disc, heliosphere, trojans). Each body has its own cartoon art or NASA photo. The map uses real AU spacing so objects sit in the right place relative to the Sun and planets — zoom and pan to explore. Optional **Include hard objects** adds dwarf-planet candidates and extra asteroids.

Belts and regions are clickable in Celestial bodies mode only.

## How to run it

Prerequisites:

- [Node.js](https://nodejs.org/) 20 or newer

Install and start a local dev server:

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:5173/cosmica/** (production builds use the `/cosmica/` base path). There are no env files or secrets.

The **home page** shows the Cosmica logo and a **Play** button. Choose **Planets**, **Moons**, or **Celestial bodies** on the mode menu. Toggle hard mode on Moons or Celestial bodies if you want the extra objects. Scroll to zoom, drag to pan, or hold **WASD** / **arrow keys** to look around. Click the body named in the prompt. Gray bodies are still there so you can learn the whole Solar System; they are just not in play. The round ends when every lit body has been found.

## How it is built

Vite + React + TypeScript. Celestial bodies live in a data catalog so more objects can be added without rewriting the map.

```bash
npm run dev      # local dev server
npm test         # Vitest
npm run build    # typecheck and write production files to dist/
npm run preview  # serve the dist/ build locally
npm run lint     # oxlint
npm run deploy   # publish to charlietheboss.com/cosmica/ (see deploy/README.md)
```

GitHub Actions runs `npm ci`, lint, test, and build on pushes to `main` and on pull requests (`.github/workflows/ci.yml`). Deploy to production runs separately on push to `main` (`.github/workflows/deploy.yml`).

## Deploy

Production URL: **https://charlietheboss.com/cosmica/**

**From Windows (no Mac needed):** add the `DEPLOY_SSH_KEY` GitHub secret in the repo settings, then run the **Deploy Cosmica** workflow. See [`deploy/GITHUB-ACTIONS.md`](deploy/GITHUB-ACTIONS.md) and [`deploy/README.md`](deploy/README.md).

Local deploy (Git Bash or WSL on Windows):

```bash
npm run deploy
```
