import { useId } from "react";
import { BODY_ART } from "./bodyArtAssets";
import { CelestialCartoon } from "./CelestialCartoon";
import { celestialStyleFor } from "./celestialStyles";
import type { ObjectType } from "./catalog";

type Props = {
  id: string;
  radius: number;
  color: string;
  type?: ObjectType;
};

function saturnRingPath(
  outerRx: number,
  outerRy: number,
  innerRx: number,
  innerRy: number,
) {
  return [
    `M ${-outerRx} 0`,
    `A ${outerRx} ${outerRy} 0 1 1 ${outerRx} 0`,
    `A ${outerRx} ${outerRy} 0 1 1 ${-outerRx} 0 Z`,
    `M ${-innerRx} 0`,
    `A ${innerRx} ${innerRy} 0 1 0 ${innerRx} 0`,
    `A ${innerRx} ${innerRy} 0 1 0 ${-innerRx} 0 Z`,
  ].join(" ");
}

function saturnRingFrontPath(
  outerRx: number,
  outerRy: number,
  innerRx: number,
  innerRy: number,
) {
  return [
    `M ${-outerRx} 0`,
    `A ${outerRx} ${outerRy} 0 0 0 ${outerRx} 0`,
    `L ${innerRx} 0`,
    `A ${innerRx} ${innerRy} 0 0 1 ${-innerRx} 0 Z`,
  ].join(" ");
}

export function BodyArt({ id, radius, color, type = "planet" }: Props) {
  const celestial = celestialStyleFor(id, type);
  if (celestial) {
    return <CelestialCartoon id={id} radius={radius} style={celestial} />;
  }

  const clipId = `clip-${id}-${useId().replace(/:/g, "")}`;
  const src = BODY_ART[id];
  if (!src) {
    return (
      <>
        <circle className="disc" r={radius} fill={color} />
        <ellipse
          className="shine"
          cx={-radius * 0.28}
          cy={-radius * 0.34}
          rx={radius * 0.36}
          ry={radius * 0.24}
        />
      </>
    );
  }

  if (id === "saturn") {
    const innerRx = radius * 1.18;
    const innerRy = radius * 0.34;
    const outerRx = radius * 2.16;
    const outerRy = radius * 0.6;
    const globeClip = `${clipId}-globe`;
    const behindClip = `${clipId}-behind`;
    const globePad = 1.08;
    const ringD = saturnRingPath(outerRx, outerRy, innerRx, innerRy);
    const frontD = saturnRingFrontPath(outerRx, outerRy, innerRx, innerRy);
    const globeR = radius * 1.02;
    return (
      <g className="body-art" data-testid="art-saturn">
        <defs>
          <clipPath id={globeClip}>
            <circle r={globeR} />
          </clipPath>
          <clipPath id={behindClip} clipRule="evenodd">
            <path
              d={`M ${-outerRx * 2} ${-outerRy * 2} H ${outerRx * 2} V ${outerRy * 2} H ${-outerRx * 2} Z M 0 ${-globeR} A ${globeR} ${globeR} 0 1 1 0 ${globeR} A ${globeR} ${globeR} 0 1 1 0 ${-globeR} Z`}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${behindClip})`}>
          <path
            className="saturn-ring-back"
            d={ringD}
            fill="#efe4b4"
            fillRule="evenodd"
            data-inner-rx={innerRx}
            data-outer-rx={outerRx}
          />
        </g>
        <g clipPath={`url(#${globeClip})`}>
          <image
            href={src}
            x={-radius * globePad}
            y={-radius * globePad}
            width={radius * globePad * 2}
            height={radius * globePad * 2}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
        <path
          className="saturn-ring-front"
          d={frontD}
          fill="#efe4b4"
        />
      </g>
    );
  }

  const pad = id === "sun" ? 1.32 : 1.12;
  const clipR = id === "sun" ? radius * 1.28 : radius * 1.04;

  const moonShell =
    type === "moon" ? (
      <>
        <circle
          className="moon-backing"
          r={radius * 1.04}
          fill={color}
          opacity={0.92}
        />
        <circle
          className="moon-shell"
          r={radius * 1.08}
          fill="none"
          stroke="#eef3ff"
          strokeWidth={Math.max(2.5, radius * 0.1)}
        />
      </>
    ) : null;

  return (
    <g className="body-art" data-testid={`art-${id}`}>
      <defs>
        <clipPath id={clipId}>
          <circle r={clipR} />
        </clipPath>
      </defs>
      {moonShell}
      <g clipPath={`url(#${clipId})`}>
        {type === "moon" ? (
          <circle className="moon-fill" r={radius * 1.02} fill={color} />
        ) : null}
        <image
          href={src}
          x={-radius * pad}
          y={-radius * pad}
          width={radius * pad * 2}
          height={radius * pad * 2}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </g>
  );
}
