import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import {
  cameraTransform,
  createCamera,
  fitCamera,
  panCamera,
  zoomCamera,
  type Camera,
} from "./camera";
import { isHeliocentric, isLitInMode, type GameMode, type SolarObject } from "./catalog";
import { layoutAll, layoutObject, visualOrbit } from "./layout";

type Props = {
  objects: SolarObject[];
  mode: GameMode;
  onSelect: (id: string) => void;
};

export default function SolarSystemMap({ objects, mode, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [camera, setCamera] = useState<Camera>(createCamera);
  const fitted = useRef(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const sync = () => {
      setSize({ width: host.clientWidth, height: host.clientHeight });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (fitted.current || size.width < 2 || size.height < 2) {
      return;
    }
    const maxRadius = Math.max(
      ...objects
        .filter((object) => isHeliocentric(object) && object.au > 0)
        .map((object) => visualOrbit(object.au)),
      1,
    );
    fitted.current = true;
    setCamera(fitCamera(maxRadius, size.width, size.height));
  }, [objects, size]);

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

  const positions = layoutAll(objects);
  const heliocentricOrbits = objects.filter(
    (object) => isHeliocentric(object) && object.au > 0,
  );
  const moonOrbits = objects.filter((object) => object.type === "moon");
  const drawOrder = [...objects].sort(
    (a, b) => Number(isLitInMode(a, mode)) - Number(isLitInMode(b, mode)),
  );

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
              className={
                isLitInMode(object, mode) ? "orbit" : "orbit orbit-dim"
              }
              r={visualOrbit(object.au)}
              cx={0}
              cy={0}
            />
          ))}
          {moonOrbits.map((moon) => {
            const parent = objects.find((object) => object.id === moon.parentId);
            if (!parent) {
              return null;
            }
            const at = layoutObject(parent, objects);
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
          {drawOrder.map((object) => {
            const laid = positions.get(object.id) ?? layoutObject(object, objects);
            const lit = isLitInMode(object, mode);
            return (
              <g
                key={object.id}
                className={`body body-${object.type} ${lit ? "body-lit" : "body-dim"}`}
                transform={`translate(${laid.x} ${laid.y})`}
                role="button"
                aria-label={object.name}
                aria-disabled={lit ? undefined : true}
                tabIndex={lit ? 0 : -1}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  if (lit) {
                    onSelect(object.id);
                  }
                }}
                onKeyDown={(event) => {
                  if (!lit) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(object.id);
                  }
                }}
              >
                {object.id === "saturn" ? (
                  <ellipse
                    className="ring"
                    rx={laid.radius * 2.1}
                    ry={laid.radius * 0.7}
                  />
                ) : null}
                <circle
                  className="hit"
                  r={Math.max(laid.radius, 12)}
                />
                <circle
                  className="disc"
                  r={laid.radius}
                  fill={object.color}
                />
                <text className="label" y={laid.radius + 14}>
                  {object.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
