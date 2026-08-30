import { useState } from "react";
import { catalog, type GameMode } from "./catalog";
import { applyClick, startRound, type RoundState } from "./game";
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
  const objects = catalog;
  const [round, setRound] = useState<RoundState>(() =>
    startRound(Math.random, mode),
  );

  const choose = (id: string) => {
    setRound((current) => applyClick(current, id, Math.random));
  };

  return (
    <div className="play">
      <div className="starfield" aria-hidden="true" />
      <SolarSystemMap objects={objects} mode={mode} onSelect={choose} />
      <header className="hud">
        <button type="button" className="ghost" onClick={onMenu}>
          Menu
        </button>
        <p className="prompt" data-testid="find-prompt">
          {round.prompt}
        </p>
        <div className="stats">
          <p data-testid="score">{round.score} XP</p>
          <p data-testid="streak">🔥 {round.streak}</p>
        </div>
      </header>
      {round.feedback ? (
        <p
          className={`feedback feedback-${round.feedback}`}
          data-testid="feedback"
        >
          {round.feedback === "correct" ? "CORRECT" : "INCORRECT"}
        </p>
      ) : null}
      <p className="hint">
        Lit bodies are in play · gray is the rest of the map · scroll to zoom
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
