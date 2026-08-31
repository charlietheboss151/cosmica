import { useEffect, useState, type ChangeEvent } from "react";
import { catalog, objectById, type GameMode } from "./catalog";
import {
  applyClick,
  formatElapsed,
  MAX_GUESSES_PER_BODY,
  startQuiz,
  type QuizState,
} from "./game";
import { randomizeOrbitalPositions, layoutProfileForMode } from "./layout";
import OrbitBackdrop from "./OrbitBackdrop";
import SolarSystemMap from "./SolarSystemMap";
import "./App.css";

/** How long CORRECT / miss feedback stays visible. */
export const FEEDBACK_CLEAR_MS = 750;
/** How long a reveal (“It was …”) stays visible. */
export const REVEAL_CLEAR_MS = 1500;

type PlayConfig = {
  mode: GameMode;
  hardMode: boolean;
};

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
    description: "Find the major moons of the outer worlds",
    hardLabel: "Include all moons",
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

function Menu({ onPlay }: { onPlay: (config: PlayConfig) => void }) {
  const [hardByMode, setHardByMode] = useState<Record<GameMode, boolean>>({
    planets: false,
    moons: false,
    celestial: false,
  });

  const toggleHard = (mode: GameMode, event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setHardByMode((current) => ({ ...current, [mode]: event.target.checked }));
  };

  return (
    <main className="menu">
      <div className="menu-backdrop" aria-hidden="true">
        <div className="starfield" />
        <div className="menu-glow" />
        <OrbitBackdrop className="orbit-backdrop-menu" />
      </div>
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
                onClick={() =>
                  onPlay({ mode: mode.id, hardMode: hardByMode[mode.id] })
                }
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

function Play({ config, onMenu }: { config: PlayConfig; onMenu: () => void }) {
  const { mode, hardMode } = config;
  const [objects, setObjects] = useState(() =>
    randomizeOrbitalPositions(catalog, Math.random, layoutProfileForMode(mode)),
  );
  const [quiz, setQuiz] = useState<QuizState>(() =>
    startQuiz(mode, Math.random, Date.now(), hardMode),
  );
  const [now, setNow] = useState(() => Date.now());

  const replay = () => {
    setObjects(
      randomizeOrbitalPositions(catalog, Math.random, layoutProfileForMode(mode)),
    );
    setQuiz(startQuiz(mode, Math.random, Date.now(), hardMode));
  };

  useEffect(() => {
    if (!quiz.lastResult) {
      return;
    }
    const delay =
      quiz.lastResult === "revealed" ? REVEAL_CLEAR_MS : FEEDBACK_CLEAR_MS;
    const timer = window.setTimeout(() => {
      setQuiz((current) => {
        if (!current.lastResult) {
          return current;
        }
        return {
          ...current,
          wrongFlashId: null,
          lastResolvedId:
            current.lastResult === "revealed" ? null : current.lastResolvedId,
          lastResult: null,
        };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [quiz.lastResult]);

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
        foundIds={quiz.foundIds}
        marks={quiz.marks}
        flashId={quiz.wrongFlashId}
        orbitStartMs={quiz.startedAt}
        orbitFreezeMs={quiz.finishedAt}
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
  const [screen, setScreen] = useState<"menu" | PlayConfig>("menu");
  if (screen !== "menu") {
    return <Play config={screen} onMenu={() => setScreen("menu")} />;
  }
  return <Menu onPlay={setScreen} />;
}
