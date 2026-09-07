# Cosmica

Cosmica is a browser game: an interactive 2D map of the Solar System that you learn by navigating. Find objects on the map — it is the answer interface, not a multiple-choice quiz.

This version is a **Planets**, **Moons**, **Celestial bodies**, and **Spacecraft** quiz on the **full map**, in the style of Seterra: click the named body, a timer runs, and each body is asked once. Scoring matches Elementra: **3 points** on the first try, **2** on the second, **1** on the third, and **0** if you miss all three. The score is those points divided by 3, so a first-try find is 1.0. You get **3 guesses per body**; a wrong body stays ringed in red and cannot be clicked again until the next body. Find it on the first try for a green ring, second for yellow, third for orange, or miss all three and the answer is revealed with a red ring. The Sun and planets use cartoon sticker art; moons use NASA mission photos; spacecraft use cut-out photos and drawings of the real probes. Names stay off the map until you place a body.

- **Planets** — find the eight planets; moons appear as tiny scenery.
- **Moons** — find moons on the map; planets stay visible but grayed. **All planet moons** quizzes every moon in the catalog. **Well-known moons** is the familiar set (the Moon, the Galileans, Titan, and others). You can also pick specific planets. The map only zooms in when you miss a moon, to show where it was; the next moon does not jump you to another planet.
- **Celestial bodies** — dwarf planets, famous asteroids, and comets. Planets and moons stay on the map but grayed. Each body has its own cartoon art or NASA photo. The map uses real AU spacing so objects sit in the right place relative to the Sun and planets — zoom and pan to explore. After you pick Celestial bodies, choose **All celestial bodies** (the full catalog, including hard objects), **Common bodies** (Pluto, Ceres, Vesta, Halley, and other familiar objects), or pick types.
- **Spacecraft** — find famous probes and satellites still in the Solar System, from Parker Solar Probe and the ISS out to **Voyager 1**. Planets stay on the map but grayed. The map keeps Voyager past Neptune but packs the outer system so the whole set fits the first view. After you pick Spacecraft, choose **All spacecraft** (the full catalog, including Pioneer, Cassini, Galileo, and other historic missions), **Common spacecraft** (ISS, Hubble, Voyager, and other familiar probes), or pick destinations. Earth has thousands of satellites; this mode is the well-known missions you can learn on the map.

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

The **home page** shows the Cosmica logo, the tagline **Explore the Solar System. Master the cosmos.**, and a **Play** button. Play opens mission select over the same solar-system sky: **Quick Play**, or tap **Earth** for Planets, the **Moon** for Moons, a **comet** for Celestial bodies, or a **probe** for Spacecraft — the four badges share the same blue haze outline. **Back** (or the logo) returns to the title screen. Moons setup offers all moons, well-known moons, or a planet mix. Celestial bodies setup offers all bodies, common bodies, or a type mix. Spacecraft setup offers all spacecraft, common spacecraft, or a destination mix. Best scores (%) are for the full catalog of that mode (all moons, all celestial bodies, all spacecraft), not a shorter easy list. Unique finds and XP stay in this browser. On a phone, drag to pan, pinch to zoom, and tap the named body. On a computer, click the body, scroll or pinch to zoom, drag to pan, or hold **WASD** / **arrow keys** to look around. **Tab** moves among the HUD and the body the prompt names, not every lit object. Gray bodies are still there so you can learn the whole Solar System; they are just not in play. The round ends when every lit body has been found. On the results screen, **Escape** returns to the menu.

## How it is built

Vite + React + TypeScript (`strict` and `noUncheckedIndexedAccess`). Celestial bodies live in a data catalog so more objects can be added without rewriting the map.

```bash
npm run dev      # local dev server
npm test         # Vitest
npm run build    # typecheck and write production files to dist/
npm run preview  # serve the dist/ build locally
npm run lint     # oxlint (fails on warnings)
npm run deploy   # publish to charlietheboss.com/cosmica/ (see deploy/README.md)
```

GitHub Actions runs `npm ci`, lint, test, and build on pushes to `main` and on pull requests (`.github/workflows/ci.yml`). Production deploy is local (`npm run deploy`); the **Deploy Cosmica** workflow is manual only and needs a `DEPLOY_SSH_KEY` secret.

## Deploy

Production URL: **https://charlietheboss.com/cosmica/**

**From Windows (no Mac needed):** run `npm run deploy` with Git Bash or WSL. Optional: add the `DEPLOY_SSH_KEY` GitHub secret and run the **Deploy Cosmica** workflow by hand. See [`deploy/GITHUB-ACTIONS.md`](deploy/GITHUB-ACTIONS.md) and [`deploy/README.md`](deploy/README.md).

Local deploy (Git Bash or WSL on Windows):

```bash
npm run deploy
```
