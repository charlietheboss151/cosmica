import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  catalog,
  moonsOf,
  objectById,
  parentsWithMoons,
  type GameMode,
} from "./catalog";
import {
  accuracyPercent,
  applyClick,
  formatElapsed,
  formatScoreLine,
  MAX_GUESSES_PER_BODY,
  startQuiz,
  type QuizState,
  type TryMark,
} from "./game";
import { randomizeOrbitalPositions, layoutProfileForMode } from "./layout";
import {
  applyRound,
  formatBest,
  loadProgress,
  modeDenom,
  rankFromXp,
  saveProgress,
} from "./progress";
import { publicUrl } from "./publicUrl";
import SolarSystemMap from "./SolarSystemMap";
import SpaceScene from "./SpaceScene";
import "./App.css";

/** How long CORRECT / miss feedback stays visible. */
export const FEEDBACK_CLEAR_MS = 750;
/** How long a reveal (“It was …”) stays visible. */
export const REVEAL_CLEAR_MS = 1500;

const LOGO_SRC = publicUrl("cosmica-logo.png");
const LOGO_ALT = "Cosmica. Explore the Solar System. Master the cosmos.";
const QUICK_MODES: GameMode[] = ["planets", "moons", "celestial"];

const MODE_ICONS: Record<GameMode, string> = {
  planets: "🪐",
  moons: "🌙",
  celestial: "☄️",
};

function isCorrectMark(mark: TryMark | undefined): boolean {
  return mark === "green" || mark === "yellow" || mark === "orange";
}

type PlayConfig = {
  mode: GameMode;
  hardMode: boolean;
  parentIds?: string[];
};

type Screen = "home" | "menu" | "moons-setup" | PlayConfig;

function isPlayConfig(screen: Screen): screen is PlayConfig {
  return screen !== "home" && screen !== "menu" && screen !== "moons-setup";
}

const PLAYABLE_MODES: {
  id: GameMode;
  label: string;
  description: string;
  hardLabel?: string;
}[] = [
  { id: "planets", label: "Planets", description: "Find all 8 planets" },
  {
    id: "moons",
    label: "Moons",
    description: "Find moons orbiting the planets",
  },
  {
    id: "celestial",
    label: "Celestial bodies",
    description: "Dwarf planets, asteroids & comets",
    hardLabel: "Include hard objects",
  },
];

const COMING_SOON = [
  {
    id: "spacecraft",
    label: "Spacecraft",
    description: "Identify famous spacecraft",
  },
  {
    id: "whoami",
    label: "Who am I?",
    description: "Identify the mystery object",
  },
  {
    id: "everything",
    label: "Everything",
    description: "The ultimate Cosmica challenge",
  },
] as const;

function Home({ onPlay }: { onPlay: () => void }) {
  return (
    <main className="home">
      <div className="home-content">
        <div className="home-logo-wrap">
          <img className="home-logo" src={LOGO_SRC} alt={LOGO_ALT} width={480} height={480} />
        </div>
        <div className="home-actions">
          <p className="home-tagline">Explore the Solar System. Master the cosmos.</p>
          <button type="button" className="mode-play home-play" onClick={onPlay}>
            Play
          </button>
          <p className="home-credit">
            Designed &amp; created by <span>Charlie Bishop</span>
          </p>
        </div>
      </div>
    </main>
  );
}

function Menu({
  onPlay,
  onMoonsSetup,
  onHome,
}: {
  onPlay: (config: PlayConfig) => void;
  onMoonsSetup: () => void;
  onHome: () => void;
}) {
  const [hardByMode, setHardByMode] = useState<Record<GameMode, boolean>>({
    planets: false,
    moons: false,
    celestial: false,
  });
  const progress = loadProgress();
  const rank = rankFromXp(progress.xp);

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

  const quickPlay = () => {
    const mode = QUICK_MODES[Math.floor(Math.random() * QUICK_MODES.length)]!;
    onPlay({ mode, hardMode: false });
  };

  return (
    <main className="menu">
      <div className="menu-hud">
        <header className="menu-brand">
          <button type="button" className="menu-logo-btn" onClick={onHome} aria-label="Home">
            <img className="menu-logo" src={LOGO_SRC} alt="" width={96} height={96} />
          </button>
          <p className="eyebrow">Choose your mission</p>
          <h2 className="menu-mission">What will you explore?</h2>
        </header>
        <section className="menu-play" aria-label="Play a mode">
          <button type="button" className="quick-play" aria-label="Quick Play" onClick={quickPlay}>
            <span className="quick-play-label">▶ Quick Play</span>
            <span className="quick-play-desc">Random challenge</span>
          </button>
          <div className="menu-modes">
            {PLAYABLE_MODES.map((mode) => {
              const best = formatBest(progress.bestMs[mode.id]);
              return (
                <div key={mode.id} className="mode-card-wrap">
                  <button
                    type="button"
                    className={`mode-card mode-card-mission mode-card-${mode.id}`}
                    aria-label={mode.label}
                    onClick={() => playMode(mode)}
                  >
                    <span className="mode-card-icon" aria-hidden="true">
                      {MODE_ICONS[mode.id]}
                    </span>
                    <span className="mode-card-copy">
                      <span className="mode-card-label">{mode.label}</span>
                      <span className="mode-card-desc">{mode.description}</span>
                      <span className="mode-card-best">
                        {best ? `BEST • ${best}` : "BEST • —"}
                      </span>
                    </span>
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
              );
            })}
          </div>
        </section>
        <section className="menu-soon" aria-label="Coming soon">
          <p className="menu-soon-heading">Coming soon</p>
          <div className="menu-soon-cards">
            {COMING_SOON.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="mode-card mode-card-locked"
                disabled
                aria-label={`${mode.label}, coming soon`}
              >
                <span className="mode-card-icon" aria-hidden="true">
                  🔒
                </span>
                <span className="mode-card-copy">
                  <span className="mode-card-label">{mode.label}</span>
                  <span className="mode-card-desc">{mode.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="menu-progress" aria-label="Your progress">
          <p className="menu-progress-heading">Your progress</p>
          <p className="menu-rank">
            Level {rank.level} — {rank.title}
          </p>
          <div
            className="xp-track"
            role="progressbar"
            aria-label={`${rank.percent}% to level ${rank.level + 1}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rank.percent}
          >
            <span className="xp-fill" style={{ width: `${rank.percent}%` }} />
          </div>
          <p className="xp-meta">{rank.percent}% to Level {rank.level + 1}</p>
          <ul className="progress-modes">
            {PLAYABLE_MODES.map((mode) => {
              const found = progress.found[mode.id].length;
              const total = modeDenom(progress, mode.id);
              return (
                <li key={mode.id} data-testid={`progress-${mode.id}`}>
                  <span aria-hidden="true">{MODE_ICONS[mode.id]}</span>
                  {mode.label} {found}/{total}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}

function MoonsSetup({
  onBack,
  onPlay,
  onHome,
}: {
  onBack: () => void;
  onPlay: (config: PlayConfig) => void;
  onHome: () => void;
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
      <div className="menu-hud menu-hud-sub">
        <header className="menu-sub-header">
          <div className="menu-sub-nav">
            <button type="button" className="ghost menu-back" onClick={onBack}>
              Back
            </button>
            <button type="button" className="ghost menu-home" onClick={onHome}>
              Home
            </button>
          </div>
          <img className="menu-logo menu-logo-small" src={LOGO_SRC} alt="" width={96} height={96} />
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
            <span className="mode-card-icon" aria-hidden="true">
              🌙
            </span>
            <span className="mode-card-copy">
              <span className="mode-card-label">All planet moons</span>
              <span className="mode-card-desc">
                Every major moon around Earth through Neptune
                {hardMode ? " plus obscure moons" : ""}
              </span>
            </span>
            <span className="mode-card-arrow" aria-hidden="true">
              →
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
  const resultsRef = useRef<HTMLDivElement>(null);

  const recorded = useRef(false);

  const replay = () => {
    recorded.current = false;
    setObjects(
      randomizeOrbitalPositions(catalog, Math.random, layoutProfileForMode(mode)),
    );
    setQuiz(startQuiz(mode, Math.random, Date.now(), { hardMode, parentIds }));
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

  useEffect(() => {
    if (!done || recorded.current) {
      return;
    }
    recorded.current = true;
    const foundIds = quiz.foundIds.filter((id) => isCorrectMark(quiz.marks[id]));
    saveProgress(
      applyRound(loadProgress(), {
        mode,
        foundIds,
        elapsedMs,
        score: quiz.score,
        fullSet: parentIds === undefined,
      }),
    );
  }, [done, elapsedMs, mode, parentIds, quiz.foundIds, quiz.marks, quiz.score]);

  useEffect(() => {
    if (!done) {
      return;
    }
    const root = resultsRef.current;
    if (!root) {
      return;
    }
    const focusable = [
      ...root.querySelectorAll<HTMLElement>("button:not([disabled])"),
    ];
    focusable[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [done]);

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
        <p className="prompt" data-testid="find-prompt" aria-live="polite">
          {quiz.prompt}
        </p>
        <div className="stats">
          <p data-testid="score" aria-live="polite">
            {formatScoreLine(quiz.score, quiz.total)}
          </p>
          <p data-testid="timer">{formatElapsed(elapsedMs)}</p>
          <p data-testid="guesses-left">
            {MAX_GUESSES_PER_BODY - quiz.triesOnCurrent} left
          </p>
          <p data-testid="streak">Streak {quiz.streak}</p>
        </div>
      </header>
      {quiz.lastResult && !done ? (
        <p
          className={`feedback feedback-${quiz.lastResult}`}
          data-testid="feedback"
          aria-live="assertive"
        >
          {quiz.lastResult === "correct"
            ? "CORRECT"
            : quiz.lastResult === "revealed"
              ? `It was ${objectById(quiz.lastResolvedId ?? "")?.name ?? "?"}`
              : objectById(quiz.wrongFlashId ?? "")?.name ?? "Wrong"}
        </p>
      ) : null}
      {done ? (
        <div
          className="results"
          role="dialog"
          aria-modal="true"
          aria-labelledby="results-title"
          ref={resultsRef}
        >
          <h2 id="results-title">Round complete</h2>
          <p data-testid="results-found">
            {quiz.correct} / {quiz.total}
          </p>
          <ul className="results-stats">
            <li>
              <span>Score</span>
              <strong data-testid="results-score">
                {formatScoreLine(quiz.score, quiz.total)}
              </strong>
            </li>
            <li>
              <span>Correct</span>
              <strong data-testid="results-correct">{quiz.correct}</strong>
            </li>
            <li>
              <span>Incorrect</span>
              <strong data-testid="results-incorrect">{quiz.incorrect}</strong>
            </li>
            <li>
              <span>Accuracy</span>
              <strong data-testid="results-accuracy">
                {accuracyPercent(quiz.score, quiz.correct, quiz.incorrect)}%
              </strong>
            </li>
            <li>
              <span>Time</span>
              <strong data-testid="results-time">{formatElapsed(elapsedMs)}</strong>
            </li>
            <li>
              <span>Best streak</span>
              <strong data-testid="results-streak">{quiz.bestStreak}</strong>
            </li>
          </ul>
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
        3 guesses per body · click the named body · scroll or pinch to zoom
      </p>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  if (isPlayConfig(screen)) {
    return <Play config={screen} onMenu={() => setScreen("menu")} />;
  }
  const hubKind = screen === "home" ? "home" : "menu";
  return (
    <div className={`hub hub-${hubKind}`}>
      <div className={`hub-backdrop ${hubKind === "home" ? "home-backdrop" : "menu-backdrop"}`}>
        <SpaceScene
          orbitClass="orbit-backdrop-home"
          speed={5}
          glow={hubKind === "menu"}
        />
      </div>
      {screen === "moons-setup" ? (
        <MoonsSetup
          onBack={() => setScreen("menu")}
          onHome={() => setScreen("home")}
          onPlay={(config) => setScreen(config)}
        />
      ) : screen === "menu" ? (
        <Menu
          onPlay={(config) => setScreen(config)}
          onMoonsSetup={() => setScreen("moons-setup")}
          onHome={() => setScreen("home")}
        />
      ) : (
        <Home onPlay={() => setScreen("menu")} />
      )}
    </div>
  );
}
