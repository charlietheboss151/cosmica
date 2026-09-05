import { lazy, Suspense, useEffect, useRef } from "react";

const OrbitBackdrop = lazy(() => import("./OrbitBackdrop"));

type Props = {
  orbitClass: string;
  speed: number;
  glow?: boolean;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function SpaceScene({ orbitClass, speed, glow = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || prefersReducedMotion()) {
      return;
    }
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;
      host.style.setProperty("--px", `${x.toFixed(2)}px`);
      host.style.setProperty("--py", `${y.toFixed(2)}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="space-scene" ref={ref} aria-hidden="true">
      <div className="starfield starfield-far" />
      <div className="starfield starfield-near" />
      <div className="shooting-stars">
        <span className="shooting-star shooting-star-a" />
        <span className="shooting-star shooting-star-b" />
        <span className="shooting-star shooting-star-c" />
      </div>
      {glow ? <div className="menu-glow" /> : null}
      <div className="space-scene-orbit">
        <Suspense fallback={null}>
          <OrbitBackdrop className={orbitClass} speed={speed} />
        </Suspense>
      </div>
    </div>
  );
}
