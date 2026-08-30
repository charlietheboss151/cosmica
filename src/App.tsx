import { useEffect, useState } from "react";
import { catalog, objectById, type GameMode } from "./catalog";
import {
  applyClick,
  formatElapsed,
  startQuiz,
  type QuizState,
} from "./game";
import { randomizeOrbitalPositions } from "./layout";
import SolarSystemMap from "./SolarSystemMap";
import "./App.css";

const PLAYABLE_MODES: { id: GameMode; label: string }[] = [
  { id: "planets", label: "Planets" },
  { id: "moons", label: "Moons" },
];

const COMING_SOON = [
  { id: "celestial", label: "Celestial objects" },
  { id: "spacecraft", label: "Spacecraft" },
  { id: "whoami", label: "Who am I?" },
  { id: "everything", label: "Everything" },
] as const;

function Menu({ onPlay }: { onPlay: (mode: GameMode) => void }) {
  return (
    <main className="menu">
      <p className="eyebrow">Learn the Solar System by navigating it</p>
      <h1>COSMICA</h1>
      <p className="lede">
        An interactive map of our Solar System — click what you find.
      </p>
      <div className="modes">
        {PLAYABLE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className="mode-play"
            onClick={() => onPlay(mode.id)}
          >
            {mode.label}
          </button>
        ))}
        {COMING_SOON.map((mode) => (
          <button key={mode.id} type="button" className="mode-soon" disabled>
            {mode.label}
            <span>Soon</span>
          </button>
        ))}
      </div>
    </main>
  );
}

function Play({ mode, onMenu }: { mode: GameMode; onMenu: () => void }) {
  const [objects, setObjects] = useState(() =>
    randomizeOrbitalPositions(catalog, Math.random),
  );
  const [quiz, setQuiz] = useState<QuizState>(() =>
    startQuiz(mode, Math.random),
  );
  const [now, setNow] = useState(() => Date.now());

  const replay = () => {
    setObjects(randomizeOrbitalPositions(catalog, Math.random));
    setQuiz(startQuiz(mode, Math.random));
  };

  useEffect(() => {
    if (!quiz.wrongFlashId) {
      return;
    }
    const timer = window.setTimeout(() => {
      setQuiz((current) =>
        current.wrongFlashId
          ? {
              ...current,
              wrongFlashId: null,
              lastResult:
                current.lastResult === "incorrect" ? null : current.lastResult,
            }
          : current,
      );
    }, 750);
    return () => window.clearTimeout(timer);
  }, [quiz.wrongFlashId]);

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

  const elapsedMs =
    (quiz.finishedAt ?? now) - quiz.startedAt;
  const done = quiz.finishedAt !== null;

  return (
    <div className="play">
      <div className="starfield" aria-hidden="true" />
      <SolarSystemMap
        objects={objects}
        mode={mode}
        foundIds={quiz.foundIds}
        marks={quiz.marks}
        flashId={quiz.wrongFlashId}
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
            <button
              type="button"
              className="mode-play"
              onClick={replay}
            >
              Play again
            </button>
            <button type="button" className="ghost" onClick={onMenu}>
              Menu
            </button>
          </div>
        </div>
      ) : null}
      <p className="hint">
        Click the named body · gray is the rest of the map · scroll to zoom
      </p>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"menu" | GameMode>("menu");
  if (screen !== "menu") {
    return <Play mode={screen} onMenu={() => setScreen("menu")} />;
  }
  return <Menu onPlay={setScreen} />;
}
