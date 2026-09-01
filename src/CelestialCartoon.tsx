import { BODY_ART } from "./bodyArtAssets";
import type { CelestialStyle } from "./celestialStyles";
import { publicUrl } from "./publicUrl";

type Props = {
  id: string;
  radius: number;
  style: CelestialStyle;
};

function hash(id: string): number {
  let value = 0;
  for (let i = 0; i < id.length; i += 1) {
    value = (value * 31 + id.charCodeAt(i)) >>> 0;
  }
  return value;
}

function seededUnit(seed: number, slot: number): number {
  return ((seed * 1103515245 + slot * 12345 + 6789) >>> 0) / 0xffffffff;
}

function GlobeFallback({
  id,
  radius,
  style,
}: {
  id: string;
  radius: number;
  style: CelestialStyle;
}) {
  const seed = hash(id);
  const stretch = style.stretch ?? 1;
  const craterCount = 4 + (seed % 5);
  const craters = Array.from({ length: craterCount }, (_, index) => {
    const angle = seededUnit(seed, index * 2) * Math.PI * 2;
    const dist = radius * (0.15 + seededUnit(seed, index * 2 + 1) * 0.55);
    const size = radius * (0.08 + seededUnit(seed, index * 2 + 50) * 0.14);
    return {
      cx: Math.cos(angle) * dist * stretch,
      cy: Math.sin(angle) * dist,
      r: size,
      opacity: 0.18 + seededUnit(seed, index + 90) * 0.22,
    };
  });
  const bandCount = 1 + (seed % 3);
  const bands = Array.from({ length: bandCount }, (_, index) => ({
    cy: radius * (-0.35 + seededUnit(seed, index + 20) * 0.7),
    ry: radius * (0.12 + seededUnit(seed, index + 30) * 0.12),
    opacity: 0.25 + seededUnit(seed, index + 40) * 0.2,
  }));

  return (
    <g className="body-art celestial-art celestial-globe" data-testid={`art-${id}`}>
      <ellipse className="disc" rx={radius * stretch} ry={radius} fill={style.base} />
      {bands.map((band, index) => (
        <ellipse
          key={`band-${index}`}
          className="globe-band"
          rx={radius * stretch * 0.86}
          ry={band.ry}
          cy={band.cy}
          fill={style.accent}
          opacity={band.opacity}
        />
      ))}
      {craters.map((crater, index) => (
        <circle
          key={`crater-${index}`}
          className="globe-crater"
          cx={crater.cx}
          cy={crater.cy}
          r={crater.r}
          fill="#000"
          opacity={crater.opacity}
        />
      ))}
      {id === "haumea" ? (
        <ellipse
          rx={radius * stretch * 0.12}
          ry={radius * 0.55}
          fill={style.accent}
          opacity={0.35}
          transform="rotate(-24)"
        />
      ) : null}
      <ellipse
        className="shine"
        cx={-radius * 0.28 * stretch}
        cy={-radius * 0.34}
        rx={radius * 0.34 * stretch}
        ry={radius * 0.22}
        fill="#fff"
        opacity={0.42}
      />
    </g>
  );
}

export function CelestialCartoon({ id, radius, style }: Props) {
  const src = BODY_ART[id];
  if (src) {
    const clipId = `clip-${id}-photo`;
    return (
      <g className="body-art celestial-art" data-testid={`art-${id}`}>
        <defs>
          <clipPath id={clipId}>
            <circle r={radius * 1.04} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <image
            href={src}
            x={-radius * 1.12}
            y={-radius * 1.12}
            width={radius * 2.24}
            height={radius * 2.24}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </g>
    );
  }

  if (style.kind === "comet") {
    const angle = ((style.tailAngle ?? 200) * Math.PI) / 180;
    const tailX = Math.cos(angle);
    const tailY = Math.sin(angle);
    const tailLen = radius * 3.2;
    return (
      <g className="body-art celestial-art celestial-comet" data-testid={`art-${id}`}>
        <ellipse
          className="comet-tail"
          cx={-tailX * tailLen * 0.45}
          cy={-tailY * tailLen * 0.45}
          rx={tailLen}
          ry={radius * 0.55}
          fill={style.accent}
          opacity={0.55}
          transform={`rotate(${(style.tailAngle ?? 200) + 180})`}
        />
        <ellipse
          className="comet-tail-inner"
          cx={-tailX * tailLen * 0.35}
          cy={-tailY * tailLen * 0.35}
          rx={tailLen * 0.65}
          ry={radius * 0.32}
          fill={style.base}
          opacity={0.75}
          transform={`rotate(${(style.tailAngle ?? 200) + 180})`}
        />
        <circle className="disc" r={radius} fill={style.base} />
        <circle className="comet-nucleus" r={radius * 0.72} fill={style.accent} opacity={0.85} />
      </g>
    );
  }

  if (style.kind === "asteroid") {
    const spin = (hash(id) % 360) - 180;
    const hue = style.rockHue ?? 0;
    return (
      <g
        className="body-art celestial-art celestial-asteroid"
        data-testid={`art-${id}`}
        transform={`rotate(${spin})`}
      >
        <image
          href={publicUrl("bodies/asteroid-rock.png")}
          className="asteroid-rock-sprite"
          x={-radius * 1.35}
          y={-radius * 1.35}
          width={radius * 2.7}
          height={radius * 2.7}
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: `hue-rotate(${hue}deg) saturate(1.15)` }}
        />
        <ellipse
          className="shine"
          cx={-radius * 0.25}
          cy={-radius * 0.35}
          rx={radius * 0.28}
          ry={radius * 0.18}
          fill={style.accent}
          opacity={0.35}
        />
      </g>
    );
  }

  return <GlobeFallback id={id} radius={radius} style={style} />;
}
