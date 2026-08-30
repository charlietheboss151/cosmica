type MoonOrbit = {
  src: string;
  localR: number;
  size: number;
  duration: number;
  start: number;
};

type PlanetOrbit = {
  id: string;
  src: string;
  r: number;
  size: number;
  duration: number;
  start: number;
  moons?: MoonOrbit[];
};

const PLANETS: PlanetOrbit[] = [
  {
    id: "mercury",
    src: "/bodies/mercury.png",
    r: 72,
    size: 9,
    duration: 38,
    start: 18,
  },
  {
    id: "venus",
    src: "/bodies/venus.png",
    r: 94,
    size: 13,
    duration: 50,
    start: 205,
  },
  {
    id: "earth",
    src: "/bodies/earth.png",
    r: 118,
    size: 16,
    duration: 64,
    start: 122,
    moons: [{ src: "/bodies/moon.png", localR: 22, size: 5, duration: 9, start: 0 }],
  },
  {
    id: "mars",
    src: "/bodies/mars.png",
    r: 140,
    size: 12,
    duration: 78,
    start: 312,
    moons: [{ src: "/bodies/phobos.png", localR: 16, size: 4, duration: 7, start: 40 }],
  },
  {
    id: "jupiter",
    src: "/bodies/jupiter.png",
    r: 178,
    size: 28,
    duration: 98,
    start: 236,
    moons: [
      { src: "/bodies/io.png", localR: 20, size: 6, duration: 8, start: 10 },
      { src: "/bodies/europa.png", localR: 28, size: 6, duration: 11, start: 140 },
    ],
  },
  {
    id: "saturn",
    src: "/bodies/saturn.png",
    r: 218,
    size: 32,
    duration: 124,
    start: 58,
    moons: [
      { src: "/bodies/enceladus.png", localR: 18, size: 5, duration: 10, start: 20 },
      { src: "/bodies/titan.png", localR: 30, size: 8, duration: 14, start: 200 },
    ],
  },
  {
    id: "uranus",
    src: "/bodies/uranus.png",
    r: 252,
    size: 22,
    duration: 152,
    start: 168,
    moons: [{ src: "/bodies/titania.png", localR: 17, size: 5, duration: 12, start: 75 }],
  },
  {
    id: "neptune",
    src: "/bodies/neptune.png",
    r: 282,
    size: 20,
    duration: 178,
    start: 286,
    moons: [{ src: "/bodies/triton.png", localR: 19, size: 6, duration: 11, start: 130 }],
  },
];

const DRIFTERS = [
  { src: "/bodies/ganymede.png", x: -248, y: -118, size: 7, duration: 52, start: 12 },
  { src: "/bodies/callisto.png", x: 236, y: -156, size: 7, duration: 48, start: 88 },
  { src: "/bodies/mimas.png", x: 210, y: 188, size: 6, duration: 44, start: 160 },
  { src: "/bodies/rhea.png", x: -210, y: 176, size: 6, duration: 46, start: 220 },
  { src: "/bodies/europa.png", x: -170, y: -210, size: 6, duration: 40, start: 300 },
  { src: "/bodies/iapetus.png", x: 168, y: 214, size: 7, duration: 56, start: 44 },
  { src: "/bodies/deimos.png", x: 260, y: 36, size: 4, duration: 36, start: 190 },
  { src: "/bodies/ariel.png", x: -258, y: 52, size: 5, duration: 42, start: 260 },
] as const;

const RING_RADII = [72, 118, 178, 218, 282];

type Props = {
  /** Higher values spin more slowly. Menu uses 1; gameplay uses ~4. */
  speed?: number;
  className?: string;
};

function spin(seconds: number, speed: number): string {
  return `${seconds * speed}s`;
}

function PlanetBody({
  planet,
  speed,
}: {
  planet: PlanetOrbit;
  speed: number;
}) {
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`${planet.start} 0 0`}
        to={`${planet.start + 360} 0 0`}
        dur={spin(planet.duration, speed)}
        repeatCount="indefinite"
      />
      <g transform={`translate(${planet.r} 0)`}>
        <image
          href={planet.src}
          x={-planet.size / 2}
          y={-planet.size / 2}
          width={planet.size}
          height={planet.size}
        />
        {planet.moons?.map((moon) => (
          <g key={moon.src}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${moon.start} 0 0`}
              to={`${moon.start + 360} 0 0`}
              dur={spin(moon.duration, speed)}
              repeatCount="indefinite"
            />
            <g transform={`translate(${moon.localR} 0)`}>
              <image
                href={moon.src}
                className="orbit-backdrop-moon"
                x={-moon.size / 2}
                y={-moon.size / 2}
                width={moon.size}
                height={moon.size}
              />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

function DrifterBody({
  body,
  speed,
}: {
  body: (typeof DRIFTERS)[number];
  speed: number;
}) {
  return (
    <g transform={`translate(${body.x} ${body.y})`}>
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`${body.start} 0 0`}
          to={`${body.start + 360} 0 0`}
          dur={spin(body.duration, speed)}
          repeatCount="indefinite"
        />
        <image
          href={body.src}
          className="orbit-backdrop-drift"
          x={-body.size / 2}
          y={-body.size / 2}
          width={body.size}
          height={body.size}
        />
      </g>
    </g>
  );
}

export default function OrbitBackdrop({ speed = 1, className = "" }: Props) {
  return (
    <div className={`orbit-backdrop ${className}`.trim()} aria-hidden="true">
      <svg viewBox="-300 -300 600 600" className="orbit-backdrop-svg">
        {RING_RADII.map((r) => (
          <circle
            key={r}
            className="orbit-backdrop-ring"
            r={r}
            cx={0}
            cy={0}
            fill="none"
          />
        ))}
        {DRIFTERS.map((body) => (
          <DrifterBody
            key={`${body.src}-${body.x}-${body.y}`}
            body={body}
            speed={speed}
          />
        ))}
        <g className="orbit-backdrop-sun">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur={`${120 * speed}s`}
            repeatCount="indefinite"
          />
          <image href="/bodies/sun.png" x={-36} y={-36} width={72} height={72} />
        </g>
        {PLANETS.map((planet) => (
          <PlanetBody key={planet.id} planet={planet} speed={speed} />
        ))}
      </svg>
    </div>
  );
}
