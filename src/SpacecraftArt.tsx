type Props = {
  id: string;
  radius: number;
  color: string;
};

function hash(id: string): number {
  let value = 0;
  for (let i = 0; i < id.length; i += 1) {
    value = (value * 31 + id.charCodeAt(i)) >>> 0;
  }
  return value;
}

function DishProbe({ radius, color }: { radius: number; color: string }) {
  const dish = radius * 0.72;
  return (
    <>
      <line
        x1={0}
        y1={radius * 0.08}
        x2={0}
        y2={radius * 0.92}
        stroke="#c8d0dc"
        strokeWidth={Math.max(radius * 0.06, 0.6)}
        strokeLinecap="round"
      />
      <rect
        x={-radius * 0.22}
        y={-radius * 0.12}
        width={radius * 0.44}
        height={radius * 0.4}
        rx={radius * 0.08}
        fill={color}
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
      <ellipse
        cx={0}
        cy={-radius * 0.28}
        rx={dish}
        ry={dish * 0.42}
        fill="#d8e4f4"
        stroke="#3a4860"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
      <ellipse
        cx={0}
        cy={-radius * 0.28}
        rx={dish * 0.42}
        ry={dish * 0.16}
        fill="#6a88b0"
        opacity={0.7}
      />
      <line
        x1={radius * 0.2}
        y1={radius * 0.08}
        x2={radius * 0.78}
        y2={radius * 0.42}
        stroke="#b8c0cc"
        strokeWidth={Math.max(radius * 0.045, 0.45)}
        strokeLinecap="round"
      />
    </>
  );
}

function Station({ radius, color }: { radius: number; color: string }) {
  const panelW = radius * 0.95;
  const panelH = radius * 0.28;
  return (
    <>
      <rect
        x={-panelW}
        y={-panelH * 0.5}
        width={panelW * 0.72}
        height={panelH}
        fill="#3a6cb0"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
      <rect
        x={panelW * 0.28}
        y={-panelH * 0.5}
        width={panelW * 0.72}
        height={panelH}
        fill="#3a6cb0"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
      <rect
        x={-radius * 0.38}
        y={-radius * 0.22}
        width={radius * 0.76}
        height={radius * 0.44}
        rx={radius * 0.08}
        fill={color}
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
    </>
  );
}

function TubeTelescope({ radius, color }: { radius: number; color: string }) {
  return (
    <>
      <rect
        x={-radius * 0.22}
        y={-radius * 0.7}
        width={radius * 0.44}
        height={radius * 1.28}
        rx={radius * 0.12}
        fill={color}
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
      <rect
        x={-radius * 0.7}
        y={-radius * 0.12}
        width={radius * 1.4}
        height={radius * 0.24}
        fill="#2a5a9a"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
      <circle
        cx={0}
        cy={-radius * 0.72}
        r={radius * 0.2}
        fill="#1a2840"
        stroke="#c8d8ec"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
    </>
  );
}

function Webb({ radius, color }: { radius: number; color: string }) {
  const hex = radius * 0.28;
  return (
    <>
      <polygon
        points={`0,${radius * 0.55} ${-radius * 0.85},${radius * 0.15} ${-radius * 0.7},${-radius * 0.2} ${radius * 0.7},${-radius * 0.2} ${radius * 0.85},${radius * 0.15}`}
        fill="#d8c898"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
      <polygon
        points={`0,${-hex} ${hex * 0.86},${-hex * 0.5} ${hex * 0.86},${hex * 0.5} 0,${hex} ${-hex * 0.86},${hex * 0.5} ${-hex * 0.86},${-hex * 0.5}`}
        fill={color}
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
        transform={`translate(0 ${-radius * 0.22})`}
      />
    </>
  );
}

function HeatShield({ radius, color }: { radius: number; color: string }) {
  return (
    <>
      <ellipse
        cx={0}
        cy={-radius * 0.15}
        rx={radius * 0.92}
        ry={radius * 0.38}
        fill="#3a2a28"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
      <ellipse
        cx={0}
        cy={-radius * 0.12}
        rx={radius * 0.72}
        ry={radius * 0.22}
        fill="#c06040"
        opacity={0.85}
      />
      <rect
        x={-radius * 0.18}
        y={radius * 0.02}
        width={radius * 0.36}
        height={radius * 0.55}
        rx={radius * 0.08}
        fill={color}
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
    </>
  );
}

function BusPanels({ radius, color, spin }: { radius: number; color: string; spin: number }) {
  return (
    <g transform={`rotate(${spin})`}>
      <rect
        x={-radius * 0.95}
        y={-radius * 0.16}
        width={radius * 0.55}
        height={radius * 0.32}
        fill="#2a6cb8"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
      <rect
        x={radius * 0.4}
        y={-radius * 0.16}
        width={radius * 0.55}
        height={radius * 0.32}
        fill="#2a6cb8"
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
      <rect
        x={-radius * 0.28}
        y={-radius * 0.28}
        width={radius * 0.56}
        height={radius * 0.56}
        rx={radius * 0.1}
        fill={color}
        stroke="#1a2438"
        strokeWidth={Math.max(radius * 0.05, 0.5)}
      />
      <circle
        cx={radius * 0.08}
        cy={-radius * 0.38}
        r={radius * 0.18}
        fill="#c8d8ec"
        stroke="#3a4860"
        strokeWidth={Math.max(radius * 0.04, 0.4)}
      />
    </g>
  );
}

export function SpacecraftArt({ id, radius, color }: Props) {
  const variant =
    id === "iss"
      ? "station"
      : id === "hubble" || id === "chandra"
        ? "tube"
        : id === "jwst"
          ? "webb"
          : id === "parker-solar-probe"
            ? "shield"
            : id.startsWith("voyager") || id.startsWith("pioneer") || id === "new-horizons"
              ? "dish"
              : "bus";

  return (
    <g className="body-art spacecraft-art" data-testid={`art-${id}`}>
      {variant === "station" ? <Station radius={radius} color={color} /> : null}
      {variant === "tube" ? <TubeTelescope radius={radius} color={color} /> : null}
      {variant === "webb" ? <Webb radius={radius} color={color} /> : null}
      {variant === "shield" ? <HeatShield radius={radius} color={color} /> : null}
      {variant === "dish" ? <DishProbe radius={radius} color={color} /> : null}
      {variant === "bus" ? (
        <BusPanels radius={radius} color={color} spin={(hash(id) % 50) - 25} />
      ) : null}
    </g>
  );
}
