# Cosmica

Cosmica is a browser game: an interactive 2D map of the Solar System that you learn by navigating. Find objects on the map — it is the answer interface, not a multiple-choice quiz.

This version is a **Planets**, **Moons**, and **Celestial bodies** quiz on the **full map**, in the style of Seterra: click the named body, a timer runs, and each body is asked once. Scoring matches Elementra: **3 points** on the first try, **2** on the second, **1** on the third, and **0** if you miss all three. The score is those points divided by 3, so a first-try find is 1.0. You get **3 guesses per body**; find it on the first try for a green ring, second for yellow, third for orange, or miss all three and the answer is revealed with a red ring. The Sun and planets use cartoon sticker art; moons use NASA mission photos. Names stay off the map until you place a body.

- **Planets** — find the eight planets; moons appear as tiny scenery.
- **Moons** — find the major moons; planets stay visible but grayed. Optional **Include all moons** hard mode adds Charon, Amalthea, Hyperion, and more. If you miss a moon, the map slowly moves to it so you can see where it was.
- **Celestial bodies** — dwarf planets, famous asteroids, and comets. Planets and moons stay on the map but grayed. Each body has its own cartoon art or NASA photo. The map uses real AU spacing so objects sit in the right place relative to the Sun and planets — zoom and pan to explore. Optional **Include hard objects** adds dwarf-planet candidates and extra asteroids.

Scattered disc, heliosphere, and trojan regions are clickable in Celestial bodies mode. The Asteroid Belt and Kuiper Belt are not quiz targets there.

## How to run it

Prerequisites:

- [Node.js](https://nodejs.org/) 20 or newer

Install and start a local dev server:

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:5173/cosmica/** (production builds use the `/cosmica/` base path). There are no env files or secrets.

The **home page** shows the Cosmica logo, the tagline **Explore the Solar System. Master the cosmos.**, and a **Play** button. Play opens mission select over the same solar-system sky: **Quick Play**, or tap **Earth** for Planets, the **Moon** for Moons, or a **comet** for Celestial bodies. **Back** (or the logo) returns to the title screen. Toggle hard mode on Moons or Celestial bodies if you want the extra objects. Best times, unique finds, and XP stay in this browser. On a phone, drag to pan, pinch to zoom, and tap the named body. On a computer, click the body, scroll or pinch to zoom, drag to pan, or hold **WASD** / **arrow keys** to look around. Gray bodies are still there so you can learn the whole Solar System; they are just not in play. The round ends when every lit body has been found.

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
