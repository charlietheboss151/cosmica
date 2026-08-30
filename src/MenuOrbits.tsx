const ORBITS = [
  { src: "/bodies/mercury.png", r: 88, size: 10, duration: 48, start: 12 },
  { src: "/bodies/earth.png", r: 118, size: 16, duration: 72, start: 128 },
  { src: "/bodies/jupiter.png", r: 168, size: 28, duration: 110, start: 240 },
  { src: "/bodies/saturn.png", r: 210, size: 34, duration: 140, start: 64 },
] as const;

export default function MenuOrbits() {
  return (
    <div className="menu-orbits" aria-hidden="true">
      <svg viewBox="-240 -240 480 480" className="menu-orbits-svg">
        {ORBITS.map((orbit) => (
          <circle
            key={orbit.r}
            className="menu-orbit-ring"
            r={orbit.r}
            cx={0}
            cy={0}
            fill="none"
          />
        ))}
        <image
          href="/bodies/sun.png"
          x={-34}
          y={-34}
          width={68}
          height={68}
          className="menu-orbit-sun"
        />
        {ORBITS.map((orbit) => (
          <g key={orbit.src}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${orbit.start} 0 0`}
              to={`${orbit.start + 360} 0 0`}
              dur={`${orbit.duration}s`}
              repeatCount="indefinite"
            />
            <g transform={`translate(${orbit.r} 0)`}>
              <image
                href={orbit.src}
                x={-orbit.size / 2}
                y={-orbit.size / 2}
                width={orbit.size}
                height={orbit.size}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
