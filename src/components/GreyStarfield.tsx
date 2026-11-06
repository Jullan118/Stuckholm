import * as React from "react";

// Faint grey stars behind a page. A fixed SVG layer with a seeded random
// scatter, so the same stars appear on every visit. It sits behind the page
// content and ignores pointer input.
const STAR_COUNT = 160;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function GreyStarfield() {
  const stars = React.useMemo(() => {
    const rand = seeded(20261106);
    return Array.from({ length: STAR_COUNT }, () => ({
      x: rand() * 1000,
      y: rand() * 1000,
      r: 0.8 + rand() * 1.6,
      o: 0.35 + rand() * 0.65,
    }));
  }, []);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-0 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#8a8a8a" opacity={s.o * 0.3} />
      ))}
    </svg>
  );
}
