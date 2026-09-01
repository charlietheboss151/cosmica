import { useId } from "react";
import { annulusPath, beltAsteroids, beltDust } from "./layout";
import { publicUrl } from "./publicUrl";

type Props = {
  inner: number;
  outer: number;
  label: string;
};

const ROCK_SHAPES = [
  "M 0,-1 L 0.85,-0.15 L 0.95,0.55 L 0.25,1 L -0.75,0.75 L -1,0.05 Z",
  "M 0,-0.95 L 0.65,-0.55 L 1,0.15 L 0.45,0.95 L -0.55,0.85 L -0.9,0.1 Z",
  "M 0,-1 L 0.55,-0.35 L 0.9,0.35 L 0.15,0.95 L -0.85,0.65 L -0.75,-0.45 Z",
  "M 0,-0.9 L 0.75,-0.25 L 0.85,0.65 L -0.05,1 L -0.95,0.35 L -0.55,-0.55 Z",
  "M 0,-1 L 0.45,-0.65 L 0.95,0.05 L 0.35,0.9 L -0.35,0.95 L -0.95,0.2 Z",
  "M 0,-0.85 L 0.8,-0.05 L 0.7,0.75 L -0.15,0.95 L -0.9,0.25 L -0.6,-0.55 Z",
];

export function AsteroidBeltArt({ inner, outer, label }: Props) {
  const clipId = useId().replace(/:/g, "");
  const mid = (inner + outer) / 2;
  const asteroids = beltAsteroids(inner, outer, 48);
  const dust = beltDust(inner, outer, 36);
  const band = annulusPath(inner, outer);

  return (
    <g className="asteroid-belt-art" data-testid="asteroid-belt-art">
      <defs>
        <clipPath id={`${clipId}-band`} clipRule="evenodd">
          <path d={band} />
        </clipPath>
        <radialGradient id={`${clipId}-wash`} cx="50%" cy="50%" r="50%">
          <stop offset={`${(inner / outer) * 100}%`} stopColor="#2a2218" stopOpacity="0" />
          <stop offset="72%" stopColor="#6a5438" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#a88858" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <circle
        className="belt-orbit belt-orbit-inner"
        r={inner}
        cx={0}
        cy={0}
        fill="none"
      />
      <circle
        className="belt-orbit belt-orbit-outer"
        r={outer}
        cx={0}
        cy={0}
        fill="none"
      />
      <path className="belt-fill" d={band} fill={`url(#${clipId}-wash)`} fillRule="evenodd" />
      <g clipPath={`url(#${clipId}-band)`}>
        {dust.map((dot, index) => (
          <circle
            key={`dust-${index}`}
            className="belt-grain"
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
          />
        ))}
        {asteroids.map((rock, index) =>
          rock.sprite ? (
            <g
              key={`sprite-${index}`}
              className="belt-sprite"
              transform={`translate(${rock.x} ${rock.y}) rotate(${rock.rotation}) scale(${rock.size / 10})`}
            >
              <image
                href={publicUrl("bodies/asteroid-rock.png")}
                x={-5}
                y={-5}
                width={10}
                height={10}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          ) : (
            <g
              key={`rock-${index}`}
              className={`belt-rock belt-rock-${rock.variant % 3}`}
              transform={`translate(${rock.x} ${rock.y}) rotate(${rock.rotation}) scale(${rock.size})`}
            >
              <path d={ROCK_SHAPES[rock.variant] ?? ROCK_SHAPES[0]} />
              <ellipse
                className="belt-rock-shine"
                cx={-0.25}
                cy={-0.35}
                rx={0.28}
                ry={0.18}
              />
            </g>
          ),
        )}
      </g>
      <text
        className="belt-label"
        transform={`rotate(-18) translate(${mid} 0)`}
        dy="4"
      >
        {label}
      </text>
    </g>
  );
}
