import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import {
  cameraTransform,
  createCamera,
  fitCamera,
  panCamera,
  zoomCamera,
  type Camera,
} from "./camera";
import { BodyArt } from "./BodyArt";
import { AsteroidBeltArt } from "./AsteroidBeltArt";
import {
  displayRadius,
  isDecorativeMoon,
  isHeliocentric,
  isLitInMode,
  isShownLit,
  type GameMode,
  type SolarObject,
} from "./catalog";
import {
  applyOrbitPhase,
  annulusPath,
  beltDust,
  cameraFitRadius,
  layoutAll,
  layoutObject,
  layoutProfileForMode,
  MOON_ORBIT_SPEED_MULTIPLIER,
  orbitPhaseDeg,
  ORBIT_ANIMATION_PERIOD_MS,
  regionBand,
  visualOrbit,
} from "./layout";

type Props = {
  objects: SolarObject[];
  mode: GameMode;
  hardMode?: boolean;
  foundIds?: string[];
  marks?: Record<string, string>;
  flashId?: string | null;
  orbitStartMs?: number | null;
  orbitFreezeMs?: number | null;
  onSelect: (id: string) => void;
};

export default function SolarSystemMap({
  objects,
  mode,
  hardMode = false,
  foundIds = [],
  marks = {},
  flashId = null,
  orbitStartMs = null,
  orbitFreezeMs = null,
  onSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState<Camera>(createCamera);
  const [orbitNow, setOrbitNow] = useState(() => Date.now());
  const drag = useRef<{ x: number; y: number } | null>(null);

  const orbiting = orbitStartMs !== null;
  const orbitElapsedMs = orbiting
    ? Math.max(0, (orbitFreezeMs ?? orbitNow) - orbitStartMs)
    : 0;
  const heliocentricPhase = orbitPhaseDeg(
    orbitElapsedMs,
    ORBIT_ANIMATION_PERIOD_MS,
  );
  const moonPhase = orbitPhaseDeg(
    orbitElapsedMs,
    ORBIT_ANIMATION_PERIOD_MS / MOON_ORBIT_SPEED_MULTIPLIER,
  );
  const displayObjects = orbiting
    ? applyOrbitPhase(objects, heliocentricPhase, moonPhase)
    : objects;

  useEffect(() => {
    if (!orbiting || orbitFreezeMs !== null) {
      return;
    }
    let frame = 0;
    const loop = () => {
      setOrbitNow(Date.now());
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [orbiting, orbitFreezeMs, orbitStartMs]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const sync = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const modeOptions = { hardMode };
  const layoutProfile = layoutProfileForMode(mode);

  useEffect(() => {
    if (size.width < 80 || size.height < 80) {
      return;
    }
    setCamera(
      fitCamera(
        cameraFitRadius(objects, layoutProfile),
        size.width,
        size.height,
      ),
    );
  }, [objects, size, layoutProfile]);

  const positions = layoutAll(displayObjects, layoutProfile);
  const heliocentricOrbits = displayObjects.filter(
    (object) =>
      isHeliocentric(object) &&
      object.au > 0 &&
      isLitInMode(object, mode, modeOptions),
  );
  const moonOrbits = displayObjects.filter(
    (object) =>
      object.type === "moon" &&
      mode !== "planets" &&
      mode !== "celestial" &&
      isLitInMode(object, mode, modeOptions),
  );
  const regions = displayObjects.filter((object) => object.type === "region");
  const bodies = [...displayObjects.filter((object) => object.type !== "region")].sort(
    (a, b) =>
      Number(isShownLit(a, mode, modeOptions)) -
      Number(isShownLit(b, mode, modeOptions)),
  );

  const renderRegionVisual = (object: SolarObject) => {
    const shownLit = isShownLit(object, mode, modeOptions);
    const { inner, outer } = regionBand(object, layoutProfile);
    const mid = (inner + outer) / 2;
    if (object.id === "asteroid-belt") {
      return (
        <g
          key={`${object.id}-visual`}
          className={`body-region-visual ${shownLit ? "body-lit" : "body-dim"}`}
          aria-hidden="true"
        >
          <AsteroidBeltArt inner={inner} outer={outer} label={object.name} />
        </g>
      );
    }
    const width = Math.max(outer - inner, 6);
    const dust = beltDust(
      inner,
      outer,
      object.id === "kuiper-belt" ? 40 : 28,
    );
    return (
      <g
        key={`${object.id}-visual`}
        className={`body-region-visual ${shownLit ? "body-lit" : "body-dim"}`}
        aria-hidden="true"
      >
        <circle
          className={`belt belt-${object.id}`}
          r={mid}
          cx={0}
          cy={0}
          fill="none"
          stroke={object.color}
          strokeWidth={width}
        />
        {dust.map((dot, index) => (
          <circle
            key={`${object.id}-dust-${index}`}
            className="dust"
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
          />
        ))}
        <text
          className="belt-label"
          transform={`rotate(-18) translate(${mid} 0)`}
          dy="4"
        >
          {object.name}
        </text>
      </g>
    );
  };

  const renderRegionHit = (object: SolarObject) => {
    if (!isLitInMode(object, mode, modeOptions)) {
      return null;
    }
    const shownLit = isShownLit(object, mode, modeOptions);
    const { inner, outer } = regionBand(object, layoutProfile);
    const choose = () => onSelect(object.id);
    return (
      <g
        key={`${object.id}-hit`}
        className={`body body-region body-region-hit ${shownLit ? "body-lit" : "body-dim"}`}
        role="button"
        aria-label={object.name}
        tabIndex={0}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={choose}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            choose();
          }
        }}
      >
        <path
          className="region-hit"
          d={annulusPath(inner, outer)}
          fill="transparent"
          fillRule="evenodd"
        />
      </g>
    );
  };

  const renderBody = (object: SolarObject) => {
    const laid =
      positions.get(object.id) ??
      layoutObject(object, displayObjects, layoutProfile);
    const shownLit = isShownLit(object, mode, modeOptions);
    const quizTarget = isLitInMode(object, mode, modeOptions);
    const decorMoon = isDecorativeMoon(object, mode);
    const radius = displayRadius(object, mode);
    const passive = decorMoon;
    const isSun = object.type === "star";
    return (
      <g
        key={object.id}
        className={`body body-${object.type} ${shownLit ? "body-lit" : "body-dim"}${decorMoon ? " body-moon-decor" : ""}${isSun ? " body-sun-anchor" : ""}`}
        transform={`translate(${laid.x} ${laid.y})`}
        role={decorMoon ? "presentation" : isSun ? "img" : "button"}
        aria-label={decorMoon ? undefined : object.name}
        aria-hidden={decorMoon ? true : undefined}
        aria-disabled={decorMoon || isSun ? undefined : quizTarget ? undefined : true}
        tabIndex={decorMoon || isSun ? undefined : quizTarget ? 0 : -1}
        onPointerDown={passive || isSun ? undefined : (event) => event.stopPropagation()}
        onClick={
          passive || isSun
            ? undefined
            : () => {
                if (quizTarget) {
                  onSelect(object.id);
                }
              }
        }
        onKeyDown={
          passive || isSun
            ? undefined
            : (event) => {
                if (!quizTarget) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(object.id);
                }
              }
        }
      >
        {passive || isSun ? null : (
          <circle
            className="hit"
            r={
              object.id === "saturn"
                ? laid.radius * 2.1
                : Math.max(laid.radius, 12)
            }
          />
        )}
        {marks[object.id] ? (
          <circle
            className={`try-ring try-ring-${marks[object.id]}`}
            r={radius + 6}
            fill="none"
          />
        ) : null}
        {flashId === object.id ? (
          <circle
            className="try-ring try-ring-flash"
            r={radius + 6}
            fill="none"
          />
        ) : null}
        <BodyArt
          id={object.id}
          radius={radius}
          color={object.color}
          type={object.type}
        />
        {foundIds.includes(object.id) ? (
          <text className="label" y={radius + 18}>
            {object.name}
          </text>
        ) : null}
      </g>
    );
  };

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) {
      return;
    }
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) {
      return;
    }
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setCamera((current) => panCamera(current, dx, dy));
  };

  const endDrag = () => {
    drag.current = null;
  };

  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    setCamera((current) =>
      zoomCamera(
        current,
        factor,
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        bounds.width,
        bounds.height,
      ),
    );
  };

  return (
    <div className="map" ref={hostRef}>
      <svg
        className="map-svg"
        width={size.width}
        height={size.height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
      >
        <g transform={cameraTransform(camera, size.width, size.height)}>
          {heliocentricOrbits.map((object) => (
            <circle
              key={`${object.id}-orbit`}
              className="orbit"
              r={visualOrbit(object.au, layoutProfile)}
              cx={0}
              cy={0}
            />
          ))}
          {moonOrbits.map((moon) => {
            const parent = displayObjects.find((object) => object.id === moon.parentId);
            if (!parent) {
              return null;
            }
            const at = layoutObject(parent, displayObjects, layoutProfile);
            return (
              <circle
                key={`${moon.id}-orbit`}
                className="orbit orbit-local"
                r={moon.localOrbit}
                cx={at.x}
                cy={at.y}
              />
            );
          })}
          {regions.map(renderRegionVisual)}
          {regions.map(renderRegionHit)}
          {bodies.map(renderBody)}
        </g>
      </svg>
    </div>
  );
}
