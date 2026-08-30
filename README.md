# Cosmica

Cosmica is a browser game: an interactive 2D map of the Solar System that you learn by navigating. Find objects on the map — it is the answer interface, not a multiple-choice quiz.

This version is a **Planets** prototype on the **full map**. The Sun and planets use cartoon sticker art. Moons are hidden in Planets mode so the map stays readable; they will return in Moons mode. The first view shows the Sun through Jupiter. Belts stay grayed. Only planets (plus the Sun) light up as FIND targets.

## How to run it

Prerequisites:

- [Node.js](https://nodejs.org/) 20 or newer

Install and start a local dev server:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). There are no env files or secrets.

On the menu, choose **Planets**. Scroll to zoom, drag to pan, click a **lit** world on the map. Gray bodies are still there so you can learn the whole Solar System; they are just not in play.

## How it is built

Vite + React + TypeScript. Celestial bodies live in a data catalog so more objects can be added without rewriting the map.

```bash
npm run dev      # local dev server
npm test         # Vitest
npm run build    # typecheck and write production files to dist/
npm run preview  # serve the dist/ build locally
npm run lint     # oxlint
```
