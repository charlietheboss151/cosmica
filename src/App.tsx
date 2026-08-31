import { lazy, Suspense, useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  catalog,
  moonsOf,
  objectById,
  parentsWithMoons,
  type GameMode,
} from "./catalog";
import {
  applyClick,
  formatElapsed,
  MAX_GUESSES_PER_BODY,
  startQuiz,
  type QuizState,
} from "./game";
import { randomizeOrbitalPositions, layoutProfileForMode } from "./layout";
import SolarSystemMap from "./SolarSystemMap";
import "./App.css";

const OrbitBackdrop = lazy(() => import("./OrbitBackdrop"));

type PlayConfig = {
  mode: GameMode;
  hardMode: boolean;
  parentIds?: string[];
};

type Screen = "menu" | "moons-setup" | PlayConfig;

function isPlayConfig(screen: Screen): screen is PlayConfig {
  return screen !== "menu" && screen !== "moons-setup";
}

const PLAYABLE_MODES: {
  id: GameMode;
  label: string;
  description: string;
  hardLabel?: string;
}[] = [
  { id: "planets", label: "Planets", description: "Find all 8 planets on the map" },
  {
    id: "moons",
    label: "Moons",
    description: "Find moons orbiting the planets",
  },
  {
    id: "celestial",
    label: "Celestial bodies",
    description: "Dwarf planets, famous asteroids, comets, and regions",
    hardLabel: "Include hard objects",
  },
];

const COMING_SOON = [
  { id: "spacecraft", label: "Spacecraft" },
  { id: "whoami", label: "Who am I?" },
  { id: "everything", label: "Everything" },
] as const;

function MenuBackdrop() {
  return (
    <div className="menu-backdrop" aria-hidden="true">
      <div className="starfield" />
      <div className="menu-glow" />
      <Suspense fallback={null}>
        <OrbitBackdrop className="orbit-backdrop-menu" speed={4} />
      </Suspense>
    </div>
  );
}

function Menu({
  onPlay,
  onMoonsSetup,
}: {
  onPlay: (config: PlayConfig) => void;
  onMoonsSetup: () => void;
}) {
  const [hardByMode, setHardByMode] = useState<Record<GameMode, boolean>>({
    planets: false,
    moons: false,
    celestial: false,
  });

  const toggleHard = (mode: GameMode, event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setHardByMode((current) => ({ ...current, [mode]: event.target.checked }));
  };

  const playMode = (mode: (typeof PLAYABLE_MODES)[number]) => {
    if (mode.id === "moons") {
      onMoonsSetup();
      return;
    }
    onPlay({ mode: mode.id, hardMode: hardByMode[mode.id] });
  };

  return (
    <main className="menu">
      <MenuBackdrop />
      <div className="menu-panel">
        <header className="menu-brand">
          <p className="eyebrow">Learn the Solar System by navigating it</p>
          <h1>COSMICA</h1>
          <p className="lede">
            An interactive map quiz — click the body named in the prompt.
          </p>
        </header>
        <section className="menu-play" aria-label="Play a mode">
          {PLAYABLE_MODES.map((mode) => (
            <div key={mode.id} className="mode-card-wrap">
              <button
                type="button"
                className="mode-card"
                aria-label={mode.label}
                onClick={() => playMode(mode)}
              >
                <span className="mode-card-label">{mode.label}</span>
                <span className="mode-card-desc">{mode.description}</span>
              </button>
              {mode.hardLabel ? (
                <label className="mode-hard-toggle">
                  <input
                    type="checkbox"
                    checked={hardByMode[mode.id]}
                    onChange={(event) => toggleHard(mode.id, event)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <span>{mode.hardLabel}</span>
                </label>
              ) : null}
            </div>
          ))}
        </section>
        <section className="menu-soon" aria-label="Coming soon">
          <p className="menu-soon-heading">Coming soon</p>
          <ul className="menu-soon-list">
            {COMING_SOON.map((mode) => (
              <li key={mode.id}>{mode.label}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function MoonsSetup({
  onBack,
  onPlay,
}: {
  onBack: () => void;
  onPlay: (config: PlayConfig) => void;
}) {
  const [hardMode, setHardMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const parentOptions = useMemo(
    () => parentsWithMoons({ hardMode }),
    [hardMode],
  );

  useEffect(() => {
    setSelected((current) => {
      const valid = new Set(parentOptions.map((parent) => parent.id));
      return new Set([...current].filter((id) => valid.has(id)));
    });
  }, [parentOptions]);

  const selectedIds = [...selected];
  const moonCount = selectedIds.reduce(
    (total, parentId) => total + moonsOf(parentId, { hardMode }).length,
    0,
  );

  const toggleParent = (parentId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const playAll = () => {
    onPlay({ mode: "moons", hardMode, parentIds: undefined });
  };

  const playSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }
    const allParentIds = parentOptions.map((parent) => parent.id);
    const parentIds =
      selectedIds.length < allParentIds.length ? selectedIds : undefined;
    onPlay({ mode: "moons", hardMode, parentIds });
  };

  return (
    <main className="menu">
      <MenuBackdrop />
      <div className="menu-panel menu-panel-sub">
        <header className="menu-sub-header">
          <button type="button" className="ghost menu-back" onClick={onBack}>
            Back
          </button>
          <h2 className="menu-sub-title">Moons</h2>
          <p className="menu-sub-lede">Pick one planet, mix a few, or play them all.</p>
        </header>
        <section className="menu-sub-play" aria-label="Moons options">
          <button
            type="button"
            className="mode-card"
            aria-label="All planet moons"
            onClick={playAll}
          >
            <span className="mode-card-label">All planet moons</span>
            <span className="mode-card-desc">
              Every major moon around Earth through Neptune
              {hardMode ? " plus obscure moons" : ""}
            </span>
          </button>
          <div className="menu-sub-section">
            <p className="menu-sub-heading">Pick planets</p>
            <div className="mode-planet-chips" role="group" aria-label="Planets">
              {parentOptions.map((parent) => {
                const on = selected.has(parent.id);
                return (
                  <button
                    key={parent.id}
                    type="button"
                    className={`mode-planet-chip${on ? " mode-planet-chip-on" : ""}`}
                    aria-pressed={on}
                    aria-label={parent.name}
                    onClick={() => toggleParent(parent.id)}
                  >
                    {parent.name}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="mode-play menu-sub-play-btn"
              disabled={selected.size === 0}
              onClick={playSelected}
            >
              {selected.size === 0
                ? "Play selected"
                : `Play selected (${moonCount} ${moonCount === 1 ? "moon" : "moons"})`}
            </button>
          </div>
          <button
            type="button"
            className={`mode-option-toggle${hardMode ? " mode-option-toggle-on" : ""}`}
            aria-pressed={hardMode}
            onClick={() => setHardMode((current) => !current)}
          >
            Include obscure moons
          </button>
        </section>
      </div>
    </main>
  );
}

function Play({ config, onMenu }: { config: PlayConfig; onMenu: () => void }) {
  const { mode, hardMode, parentIds } = config;
  const [objects, setObjects] = useState(() =>
    randomizeOrbitalPositions(catalog, Math.random, layoutProfileForMode(mode)),
  );
  const [quiz, setQuiz] = useState<QuizState>(() =>
    startQuiz(mode, Math.random, Date.now(), { hardMode, parentIds }),
  );
  const [now, setNow] = useState(() => Date.now());

  const replay = () => {
    setObjects(
      randomizeOrbitalPositions(catalog, Math.random, layoutProfileForMode(mode)),
    );
    setQuiz(startQuiz(mode, Math.random, Date.now(), { hardMode, parentIds }));
  };

  useEffect(() => {
    if (!quiz.wrongFlashId && quiz.lastResult !== "revealed") {
      return;
    }
    const delay = quiz.lastResult === "revealed" ? 1500 : 750;
    const timer = window.setTimeout(() => {
      setQuiz((current) =>
        current.wrongFlashId || current.lastResult === "revealed"
          ? {
              ...current,
              wrongFlashId: null,
              lastResolvedId:
                current.lastResult === "revealed" ? null : current.lastResolvedId,
              lastResult:
                current.lastResult === "incorrect" ||
                current.lastResult === "revealed"
                  ? null
                  : current.lastResult,
            }
          : current,
      );
    }, delay);
    return () => window.clearTimeout(timer);
  }, [quiz.wrongFlashId, quiz.lastResult]);

  useEffect(() => {
    if (quiz.finishedAt !== null) {
      return;
    }
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(tick);
  }, [quiz.finishedAt]);

  const choose = (id: string) => {
    setQuiz((current) => applyClick(current, id));
  };

  const elapsedMs = (quiz.finishedAt ?? now) - quiz.startedAt;
  const done = quiz.finishedAt !== null;

  return (
    <div className="play">
      <div className="starfield" aria-hidden="true" />
      <SolarSystemMap
        objects={objects}
        mode={mode}
        hardMode={hardMode}
        parentIds={parentIds}
        foundIds={quiz.foundIds}
        marks={quiz.marks}
        flashId={quiz.wrongFlashId}
        orbitStartMs={quiz.startedAt}
        orbitFreezeMs={quiz.finishedAt}
        focusId={mode === "moons" ? quiz.currentId : null}
        onSelect={choose}
      />
      <header className="hud">
        <button type="button" className="ghost" onClick={onMenu}>
          Menu
        </button>
        <p className="prompt" data-testid="find-prompt">
          {quiz.prompt}
        </p>
        <div className="stats">
          <p data-testid="score">
            {quiz.placed} / {quiz.total}
          </p>
          <p data-testid="timer">{formatElapsed(elapsedMs)}</p>
          <p data-testid="guesses-left">
            {MAX_GUESSES_PER_BODY - quiz.triesOnCurrent} left
          </p>
          <p data-testid="mistakes">
            {quiz.mistakes === 1 ? "1 miss" : `${quiz.mistakes} misses`}
          </p>
        </div>
      </header>
      {quiz.lastResult && !done ? (
        <p
          className={`feedback feedback-${quiz.lastResult}`}
          data-testid="feedback"
        >
          {quiz.lastResult === "correct"
            ? "CORRECT"
            : quiz.lastResult === "revealed"
              ? `It was ${objectById(quiz.lastResolvedId ?? "")?.name ?? "?"}`
              : objectById(quiz.wrongFlashId ?? "")?.name ?? "Wrong"}
        </p>
      ) : null}
      {done ? (
        <div className="results" role="dialog" aria-labelledby="results-title">
          <h2 id="results-title">Round complete</h2>
          <p data-testid="results-score">
            {quiz.placed} / {quiz.total}
          </p>
          <p data-testid="results-time">{formatElapsed(elapsedMs)}</p>
          <p data-testid="results-mistakes">
            {quiz.mistakes} {quiz.mistakes === 1 ? "mistake" : "mistakes"}
          </p>
          <div className="results-actions">
            <button type="button" className="mode-play" onClick={replay}>
              Play again
            </button>
            <button type="button" className="ghost" onClick={onMenu}>
              Menu
            </button>
          </div>
        </div>
      ) : null}
      <p className="hint">
        3 guesses per body · click the named body · scroll to zoom
      </p>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  if (isPlayConfig(screen)) {
    return <Play config={screen} onMenu={() => setScreen("menu")} />;
  }
  if (screen === "moons-setup") {
    return (
      <MoonsSetup onBack={() => setScreen("menu")} onPlay={(config) => setScreen(config)} />
    );
  }
  return (
    <Menu
      onPlay={(config) => setScreen(config)}
      onMoonsSetup={() => setScreen("moons-setup")}
    />
  );
}
