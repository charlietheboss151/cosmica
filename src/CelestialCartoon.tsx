import { BODY_ART } from "./bodyArtAssets";
import type { CelestialStyle } from "./celestialStyles";

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
          href="/bodies/asteroid-rock.svg"
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

  const stretch = style.stretch ?? 1;
  return (
    <g className="body-art celestial-art celestial-globe" data-testid={`art-${id}`}>
      <ellipse className="disc" rx={radius * stretch} ry={radius} fill={style.base} />
      <ellipse
        className="globe-band"
        rx={radius * stretch * 0.82}
        ry={radius * 0.22}
        cy={radius * 0.08}
        fill={style.accent}
        opacity={0.45}
      />
      <ellipse
        className="shine"
        cx={-radius * 0.28 * stretch}
        cy={-radius * 0.34}
        rx={radius * 0.34 * stretch}
        ry={radius * 0.22}
        fill="#fff"
        opacity={0.42}
      />
      {id === "ceres" ? (
        <>
          <circle cx={radius * 0.2} cy={-radius * 0.1} r={radius * 0.16} fill="#fff" opacity={0.7} />
          <circle cx={-radius * 0.35} cy={radius * 0.25} r={radius * 0.1} fill="#fff" opacity={0.5} />
        </>
      ) : null}
      {id === "haumea" ? (
        <ellipse
          rx={radius * stretch * 0.12}
          ry={radius * 0.55}
          fill={style.accent}
          opacity={0.35}
          transform={`rotate(-24)`}
        />
      ) : null}
    </g>
  );
}
