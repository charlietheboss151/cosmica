# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Document Windows deploy paths (GitHub Actions and Git Bash/WSL) in deploy README.

## [0.18.2] - 2026-09-01

### Fixed
- Prefix public asset paths with the Vite base URL (`/cosmica/`) so logos and body images load on charlietheboss.com instead of the site root HTML fallback.

### Changed
- Deploy script tries `id_ed25519_cosmica` when the Elementra key is unavailable.

## [0.18.1] - 2026-09-01

### Added
- GitHub Actions CI workflow (`lint`, `test`, `build`) on pushes to `main` and pull requests.
- Extended tests for hard-mode moons, full round results/replay, keyboard activation, and map pan/zoom/region hits.
- Repo hygiene test to keep unused scaffold assets from returning.

### Fixed
- Type `SolarSystemMap` `marks` as `Record<string, TryMark>`.

### Removed
- Unused Vite scaffold assets (`src/assets`), `public/icons.svg`, and unused `asteroid-rock.svg`.

## [0.18.0] - 2026-09-01

### Added
- Screen reader live regions for the quiz prompt, score, and feedback.
- Results dialog focus trap and `aria-modal`.
- Map keyboard pan/zoom when the SVG is focused; honors `prefers-reduced-motion`.
- DOM-driven orbit animation (`syncOrbitDom`) to avoid re-rendering body art every frame.

### Removed
- Unused catalog stubs: `isVisibleInMode`, `isQuizTarget`, `showsOrbitLine`, and the unused `difficulty` field on solar objects.

## [0.17.5] - 2026-09-01

### Fixed
- Call `useId` unconditionally in `BodyArt` so React hooks stay in a stable order when celestial cartoon art short-circuits the image path.
- Clear CORRECT feedback after a short delay, matching how miss and reveal feedback already fade out.

## [0.17.4] - 2026-09-01

### Added
- GitHub Actions workflow to deploy Cosmica to charlietheboss.com/cosmica/ on push to main.

## [0.17.3] - 2026-08-31

### Changed
- Production builds use `/cosmica/` base path for hosting at charlietheboss.com/cosmica/.
- Deploy script defaults to the Elementra server (`charlie@192.64.87.248`) and `~/.ssh/id_ed25519`.

## [0.17.2] - 2026-08-31

### Fixed
- Home page logo is pinned to the viewport center over the solar system backdrop; tagline and Play sit below it.

## [0.17.1] - 2026-08-31

### Changed
- Home page centers the logo over the animated solar system backdrop and drops the subtitle heading.

## [0.17.0] - 2026-08-31

### Added
- Home page with the Cosmica logo, Play button, and “Designed & created by Charlie Bishop” credit (Elementra-style landing).

### Changed
- Mode menu uses the logo instead of a text title; click the logo or Home to return to the landing page.

## [0.16.5] - 2026-08-31

### Fixed
- Moons mode now zooms to the active planet and shows only that planet’s moons, with larger minimum sizes, bright ring outlines, and backing discs so dark moon photos stay visible.

## [0.16.4] - 2026-08-31

### Fixed
- Small and hard-to-see moons are easier to spot: minimum size in Moons mode, color backing disc, better images for Nix/Hydra/Dysnomia/Namaka, and obscure moons hidden until hard mode is on.

## [0.16.3] - 2026-08-30

### Fixed
- Faster menu load: show a loading message immediately, lazy-load the animated backdrop, and clear stale Vite cache that could cause a white screen.

## [0.16.2] - 2026-08-30

### Changed
- Swapped Eros and Hale-Bopp for clearer mission images; added art for Haumea, Hygiea, Gonggong, Ixion, Orcus, and Varuna.

## [0.16.1] - 2026-08-30

### Changed
- Moons mode opens a setup screen: pick any combination of planets, play selected moons, or use All planet moons.

## [0.16.0] - 2026-08-30

### Added
- Moons mode planet picker: choose one or more planets and quiz only their moons.

## [0.15.11] - 2026-08-30

### Changed
- Swapped moon and celestial body photos for mission close-ups without text overlays or ground-based views (comets, asteroids, dwarf planets, and small moons).

## [0.15.10] - 2026-08-30

### Added
- NASA photos for all 35 moons in the catalog, including hard-mode moons (Charon, Amalthea, Hyperion, Pluto's small moons, and more).

## [0.15.9] - 2026-08-30

### Changed
- Moons mode shows solar orbit rings for the eight planets again as grayed guides; other modes still hide orbit lines for bodies outside the active group.

## [0.15.8] - 2026-08-30

### Changed
- The Sun rotates slowly during gameplay (and on the menu backdrop) so the surface art spins like the orbiting worlds.

## [0.15.7] - 2026-08-30

### Changed
- Orbit lines appear only for lit bodies in the active mode. Grayed scenery and belt regions no longer draw orbit rings.

## [0.15.6] - 2026-08-30

### Added
- **WASD** and **arrow keys** pan the map while you play (hold to move; same as drag-to-pan).

## [0.15.5] - 2026-08-30

### Changed
- Tightened the map layout so planets, moons, and celestial bodies sit closer together and the initial view fits more on screen without endless zooming.

## [0.15.4] - 2026-08-30

### Changed
- Orbital motion during gameplay is much slower so planets and moons stay easy to click (planets ~8 minutes per lap, moons ~4 minutes).

## [0.15.3] - 2026-08-30

### Fixed
- Celestial bodies no longer render as plain colored ovals. NASA photos are fetched for dwarf planets, asteroids, and comets; hard-mode candidates without photos get textured globe fallbacks with craters and bands.

## [0.15.2] - 2026-08-30

### Fixed
- Bodies inside belt regions (Pluto in the Kuiper Belt, Ceres in the Asteroid Belt, etc.) are clickable again. Belt art is drawn underneath with a separate hit layer so it no longer blocks clicks.

## [0.15.1] - 2026-08-30

### Changed
- Celestial bodies mode uses proportional spacing so objects sit at the right distance from the Sun (scroll out for the outer Kuiper region).
- Every dwarf planet, asteroid, and comet has distinct cartoon art (or a NASA photo when available) so they are easier to tell apart.
- The Sun stays full color in Moons and Celestial modes instead of graying out.

## [0.15.0] - 2026-08-30

### Added
- **Celestial bodies** mode: all five official dwarf planets, famous asteroids, comets, and solar-system regions (belts, scattered disc, heliosphere, trojans).
- **Hard mode** checkboxes on Moons and Celestial bodies — optional extra moons, dwarf-planet candidates, and lesser-known asteroids.

### Changed
- Moons hard mode adds Charon, Amalthea, Hyperion, and other moons beyond the original major set.

## [0.14.3] - 2026-08-30

### Changed
- Planets mode now shows tiny orbiting moons as scenery. They stay out of the way and are not clickable quiz targets.

## [0.14.2] - 2026-08-30

### Fixed
- Moons now orbit their parent planets during gameplay instead of staying locked in place.

## [0.14.1] - 2026-08-30

### Changed
- In-game orbital drift is a bit faster so the real planets and moons are easier to see moving.

## [0.14.0] - 2026-08-30

### Changed
- Planets and moons now slowly orbit along their paths during gameplay. The decorative in-game backdrop was removed.

## [0.13.0] - 2026-08-30

### Added
- The orbiting solar-system backdrop also played behind the map in-game, at a slower speed than the menu.

## [0.12.2] - 2026-08-30

### Changed
- Enlarged the menu solar-system backdrop so more of it is visible behind the panel.

## [0.12.1] - 2026-08-30

### Changed
- Menu backdrop now shows all eight planets, orbiting moons, and extra drifting moon sprites.

## [0.12.0] - 2026-08-30

### Changed
- Redesigned the front page with a starfield backdrop, orbiting planet art, and a cleaner glass panel for mode selection.

## [0.11.2] - 2026-08-30

### Fixed
- Enceladus moon art no longer uses a labeled NASA poster; it now shows a clean Cassini globe photo.

## [0.11.1] - 2026-08-30

### Changed
- The Asteroid Belt is drawn as scattered cartoon rocks with a soft band wash instead of a flat highlight ring.

## [0.11.0] - 2026-08-30

### Changed
- Each body allows 3 guesses total. Correct on try 1–3 gets a green, yellow, or orange ring; missing all three reveals the answer with a red ring and shows its name.

## [0.10.0] - 2026-08-30

### Added
- NASA mission photos for all playable moons, replacing plain colored discs. See `public/bodies/ATTRIBUTION.md` for sources.

## [0.9.1] - 2026-08-30

### Changed
- Wrong clicks flash a brief red ring instead of leaving it on the map, and show the name of the body you clicked.

## [0.9.0] - 2026-08-30

### Changed
- Planets and moons spawn at a random point along their orbit each round so players learn positions, not memorized spots.

## [0.8.1] - 2026-08-30

### Added

- Placed bodies get a small ring: green on the first try, yellow on the second, orange on the third, and red after that or when you click the wrong body.

## [0.8.0] - 2026-08-30

### Changed

- Play is a Seterra-style quiz: a timer, an X/Y score, each body once with no repeats, mistakes counted, and a results screen when the round is done.

## [0.7.0] - 2026-08-30

### Added

- Moons mode: FIND the major moons while planets stay on the map grayed out. Mercury and Venus have none; Earth, Mars, Jupiter, Saturn, Uranus, and Neptune include their main moons.

## [0.6.3] - 2026-08-30

### Fixed

- Saturn is a ringless globe with SVG rings that have a hole, drawn behind and in front of the planet, so the rings wrap the globe instead of covering it or showing a navy square.

## [0.6.2] - 2026-08-30

### Changed

- Planet names no longer appear on the map during FIND rounds, so the drawing is the clue.

### Fixed

- Saturn’s sticker shows rings going behind the globe instead of a cropped, flattened loop.

## [0.6.1] - 2026-08-30

### Changed

- Planets mode hides moons (and their local orbits) so they no longer crowd the cartoon planets.

## [0.6.0] - 2026-08-30

### Changed

- Sun and eight planets use cartoon sticker drawings (craters, continents, bands, rings, storms) instead of flat colored circles.

## [0.5.1] - 2026-08-30

### Fixed

- Cartoon planets no longer sit on top of each other. The first view frames the inner system through Jupiter at the real window size, instead of looking stuck zoomed out.

## [0.5.0] - 2026-08-30

### Changed

- Sun and planets use cartoon overscale: huge discs, thick outlines, and simple shine so the map reads like a stylized poster, not a scale model.

## [0.4.0] - 2026-08-30

### Added

- Asteroid Belt, Kuiper Belt, and Oort Cloud as grayed map regions in Planets mode.

### Changed

- Planets (and the Sun) are drawn larger so the map is easier to read at a glance.

## [0.3.0] - 2026-08-30

### Changed

- Planets mode now keeps the full map on screen: planets (and the Sun) light up, moons and dwarf planets stay visible but grayed out.

### Added

- Moons and dwarf planets on the shared map (Moon, Galilean moons, Titan and others, Ceres, Pluto) so mode highlighting has something to dim.

## [0.2.0] - 2026-08-30

### Added

- Planets mode: 2D Solar System map with a fixed Sun, eight planets, zoom/pan, and FIND-the-planet rounds with XP and streak.
- Mode menu for later moons, celestial objects, spacecraft, Who am I?, and Everything (not playable yet).

## [0.1.0] - 2026-08-30

### Added

- Project scaffold: title screen, Vite + React + TypeScript, README.
