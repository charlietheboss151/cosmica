import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import {
  cameraTransform,
  createCamera,
  fitCamera,
  panCamera,
  pinchDistance,
  screenPxToWorld,
  wheelZoomFactor,
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
  fitCameraOnMoonParent,
  layoutAll,
  layoutObject,
  layoutProfileForMode,
  MOON_ORBIT_SPEED_MULTIPLIER,
  orbitPhaseDeg,
  ORBIT_ANIMATION_PERIOD_MS,
  regionBand,
  SUN_SPIN_PERIOD_MS,
  visualLocalOrbit,
  visualOrbit,
} from "./layout";
import type { TryMark } from "./game";
import { syncOrbitDom } from "./orbitSync";

const KEYBOARD_PAN_PX = 48;
const KEYBOARD_ZOOM_IN = 1.12;
const KEYBOARD_ZOOM_OUT = 1 / 1.12;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function orbitElapsedMs(
  orbiting: boolean,
  orbitStartMs: number | null,
  orbitFreezeMs: number | null,
  nowMs: number = Date.now(),
): number {
  if (!orbiting || orbitStartMs === null) {
    return 0;
  }
  return Math.max(0, (orbitFreezeMs ?? nowMs) - orbitStartMs);
}

function objectsAtOrbitTime(
  objects: SolarObject[],
  elapsedMs: number,
): SolarObject[] {
  if (elapsedMs === 0) {
    return objects;
  }
  return applyOrbitPhase(
    objects,
    orbitPhaseDeg(elapsedMs, ORBIT_ANIMATION_PERIOD_MS),
    orbitPhaseDeg(
      elapsedMs,
      ORBIT_ANIMATION_PERIOD_MS / MOON_ORBIT_SPEED_MULTIPLIER,
    ),
  );
}

type Props = {
  objects: SolarObject[];
  mode: GameMode;
  hardMode?: boolean;
  parentIds?: string[];
  foundIds?: string[];
  marks?: Record<string, TryMark>;
  flashId?: string | null;
  orbitStartMs?: number | null;
  orbitFreezeMs?: number | null;
  /** In Moons mode, pans and zooms to the parent of this moon. */
  focusId?: string | null;
  onSelect: (id: string) => void;
};

export default function SolarSystemMap({
  objects,
  mode,
  hardMode = false,
  parentIds,
  foundIds = [],
  marks = {},
  flashId = null,
  orbitStartMs = null,
  orbitFreezeMs = null,
  focusId = null,
  onSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState<Camera>(createCamera);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchSpan = useRef<number | null>(null);
  const bodyElements = useRef(new Map<string, SVGGElement | null>());
  const moonOrbitElements = useRef(new Map<string, SVGCircleElement | null>());

  const orbiting = orbitStartMs !== null && !reduceMotion;
  const focusParentId =
    mode === "moons" && focusId
      ? objects.find((object) => object.id === focusId)?.parentId ?? undefined
      : undefined;
  const modeOptions = { hardMode, parentIds, focusParentId };
  const layoutProfile = layoutProfileForMode(mode);
  const orbitElapsed = orbitElapsedMs(orbiting, orbitStartMs, orbitFreezeMs);
  const displayObjects = objectsAtOrbitTime(objects, orbitElapsed);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!orbiting || orbitStartMs === null) {
      return;
    }
    const applyAt = (nowMs: number) => {
      const elapsedMs = orbitElapsedMs(true, orbitStartMs, orbitFreezeMs, nowMs);
      syncOrbitDom(
        objects,
        orbitPhaseDeg(elapsedMs, ORBIT_ANIMATION_PERIOD_MS),
        orbitPhaseDeg(
          elapsedMs,
          ORBIT_ANIMATION_PERIOD_MS / MOON_ORBIT_SPEED_MULTIPLIER,
        ),
        layoutProfile,
        bodyElements.current,
        moonOrbitElements.current,
      );
    };
    if (orbitFreezeMs !== null) {
      applyAt(orbitFreezeMs);
      return;
    }
    let frame = 0;
    const loop = () => {
      applyAt(Date.now());
      frame = requestAnimationFrame(loop);
    };
    applyAt(Date.now());
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [orbiting, orbitFreezeMs, orbitStartMs, objects, layoutProfile]);

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

  useEffect(() => {
    if (size.width < 80 || size.height < 80) {
      return;
    }
    if (mode === "moons" && focusParentId) {
      setCamera(
        fitCameraOnMoonParent(
          objectsAtOrbitTime(
            objects,
            orbitElapsedMs(orbiting, orbitStartMs, orbitFreezeMs),
          ),
          focusParentId,
          layoutProfile,
          size.width,
          size.height,
          { hardMode, parentIds, focusParentId },
        ),
      );
      return;
    }
    setCamera(
      fitCamera(
        cameraFitRadius(objects, layoutProfile, mode, parentIds),
        size.width,
        size.height,
      ),
    );
  }, [
    objects,
    size,
    layoutProfile,
    mode,
    parentIds,
    hardMode,
    focusParentId,
    orbiting,
    orbitStartMs,
    orbitFreezeMs,
  ]);

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
  const regions = displayObjects.filter(
    (object) =>
      object.type === "region" &&
      (mode !== "celestial" || isLitInMode(object, mode, modeOptions)),
  );
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
    const planetsSceneryMoon = mode === "planets" && object.type === "moon";
    const radius = displayRadius(object, mode, camera.zoom);
    const pad = (px: number) => screenPxToWorld(px, camera.zoom);
    const passive = decorMoon;
    const isSun = object.type === "star";
    const hitRadius =
      object.id === "saturn"
        ? laid.radius * 2.1
        : mode === "moons" && object.type === "moon"
          ? Math.max(radius, pad(14))
          : Math.max(laid.radius, 12);
    return (
      <g
        key={object.id}
        className={`body body-${object.type} ${shownLit ? "body-lit" : "body-dim"}${planetsSceneryMoon ? " body-moon-decor" : ""}${isSun ? " body-sun-anchor" : ""}`}
        transform={`translate(${laid.x} ${laid.y})`}
        ref={(element) => {
          bodyElements.current.set(object.id, element);
        }}
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
        {isSun && orbiting ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur={`${SUN_SPIN_PERIOD_MS / 1000}s`}
            repeatCount="indefinite"
          />
        ) : null}
        {passive || isSun ? null : (
          <circle className="hit" r={hitRadius} />
        )}
        {marks[object.id] ? (
          <circle
            className={`try-ring try-ring-${marks[object.id]}`}
            r={radius + pad(6)}
            fill="none"
          />
        ) : null}
        {flashId === object.id ? (
          <circle
            className="try-ring try-ring-flash"
            r={radius + pad(6)}
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
          <text className="label" y={radius + pad(16)}>
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
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size >= 2) {
      drag.current = null;
      const [first, second] = [...pointers.current.values()];
      pinchSpan.current = pinchDistance(first!, second!);
      return;
    }
    drag.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }
    if (pointers.current.size >= 2) {
      const [first, second] = [...pointers.current.values()];
      const nextSpan = pinchDistance(first!, second!);
      const prevSpan = pinchSpan.current ?? nextSpan;
      pinchSpan.current = nextSpan;
      if (prevSpan <= 0) {
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      const midX = (first!.x + second!.x) / 2 - bounds.left;
      const midY = (first!.y + second!.y) / 2 - bounds.top;
      setCamera((current) =>
        zoomCamera(
          current,
          nextSpan / prevSpan,
          midX,
          midY,
          bounds.width,
          bounds.height,
        ),
      );
      return;
    }
    if (!drag.current) {
      return;
    }
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setCamera((current) => panCamera(current, dx, dy));
  };

  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) {
      pinchSpan.current = null;
    }
    if (pointers.current.size === 0) {
      drag.current = null;
      return;
    }
    const leftover = [...pointers.current.values()][0]!;
    drag.current = { x: leftover.x, y: leftover.y };
  };

  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    setCamera((current) =>
      zoomCamera(
        current,
        wheelZoomFactor(event.deltaY, event.ctrlKey),
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        bounds.width,
        bounds.height,
      ),
    );
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCamera((current) => panCamera(current, KEYBOARD_PAN_PX, 0));
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCamera((current) => panCamera(current, -KEYBOARD_PAN_PX, 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCamera((current) => panCamera(current, 0, KEYBOARD_PAN_PX));
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCamera((current) => panCamera(current, 0, -KEYBOARD_PAN_PX));
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setCamera((current) =>
        zoomCamera(
          current,
          KEYBOARD_ZOOM_IN,
          bounds.width / 2,
          bounds.height / 2,
          bounds.width,
          bounds.height,
        ),
      );
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      setCamera((current) =>
        zoomCamera(
          current,
          KEYBOARD_ZOOM_OUT,
          bounds.width / 2,
          bounds.height / 2,
          bounds.width,
          bounds.height,
        ),
      );
    }
  };

  return (
    <div className="map" ref={hostRef}>
      <svg
        className="map-svg"
        width={size.width}
        height={size.height}
        tabIndex={0}
        role="application"
        aria-label="Solar system map. Arrow keys pan, plus and minus zoom. Pinch or scroll to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
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
                r={visualLocalOrbit(moon.localOrbit)}
                cx={at.x}
                cy={at.y}
                ref={(element) => {
                  moonOrbitElements.current.set(moon.id, element);
                }}
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
