# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
