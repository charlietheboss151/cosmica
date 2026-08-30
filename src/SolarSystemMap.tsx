import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import {
  cameraTransform,
  createCamera,
  fitCamera,
  panCamera,
  zoomCamera,
  type Camera,
} from "./camera";
import type { SolarObject } from "./catalog";
import { layoutObject, visualOrbit } from "./layout";

type Props = {
  objects: SolarObject[];
  onSelect: (id: string) => void;
};

export default function SolarSystemMap({ objects, onSelect }: Props) {
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
      ...objects.map((object) => visualOrbit(object.au)),
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

  const orbits = [
    ...new Set(
      objects
        .filter((object) => object.au > 0)
        .map((object) => visualOrbit(object.au)),
    ),
  ];

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
          {orbits.map((orbit) => (
            <circle
              key={orbit}
              className="orbit"
              r={orbit}
              cx={0}
              cy={0}
            />
          ))}
          {objects.map((object) => {
            const laid = layoutObject(object);
            return (
              <g
                key={object.id}
                className={`body body-${object.type}`}
                transform={`translate(${laid.x} ${laid.y})`}
                role="button"
                aria-label={object.name}
                tabIndex={0}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onSelect(object.id)}
                onKeyDown={(event) => {
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
