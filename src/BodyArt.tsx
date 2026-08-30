import { useId } from "react";
import { BODY_ART } from "./bodyArtAssets";

type Props = {
  id: string;
  radius: number;
  color: string;
};

export function BodyArt({ id, radius, color }: Props) {
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

  const pad = id === "saturn" ? 1.55 : id === "sun" ? 1.32 : 1.12;
  const clipR = id === "saturn" ? radius * 1.62 : id === "sun" ? radius * 1.28 : radius * 1.04;

  return (
    <g className="body-art" data-testid={`art-${id}`}>
      <defs>
        {id === "saturn" ? (
          <clipPath id={clipId}>
            <ellipse rx={clipR} ry={radius * 0.78} />
          </clipPath>
        ) : (
          <clipPath id={clipId}>
            <circle r={clipR} />
          </clipPath>
        )}
      </defs>
      <g clipPath={`url(#${clipId})`}>
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
