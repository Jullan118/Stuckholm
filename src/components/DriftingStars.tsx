import * as React from "react";

// The home page's stars (small dots and eight-point sparkles) as a faint,
// slowly moving layer behind a page. A seeded scatter, so they are the same
// on every visit; each star drifts a little and twinkles on its own clock.

export function seeded(seed: number) {
  let v = seed;
  return () => {
    v = (v * 1664525 + 1013904223) % 4294967296;
    return v / 4294967296;
  };
}

// Same shape as the home page sparkles: eight tips (long and short in turn),
// joined by curves pinched towards the centre.
export function sparklePath(size: number, pinch = 0.12) {
  const tips = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
    const l = size * (i % 2 === 0 ? 1 : 0.45);
    return [Math.cos(a) * l, Math.sin(a) * l];
  });
  let d = `M${tips[0][0].toFixed(2)},${tips[0][1].toFixed(2)}`;
  for (let i = 0; i < 8; i++) {
    const a = tips[i];
    const b = tips[(i + 1) % 8];
    const cx = (a[0] + b[0]) * 0.5 * pinch;
    const cy = (a[1] + b[1]) * 0.5 * pinch;
    d += `Q${cx.toFixed(2)},${cy.toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
  }
  return d + "Z";
}

export function DriftingStars({
  opacity = 0.1,
  dots = 90,
  sparkles = 18,
  seed = 20261124,
  className = "",
}: {
  opacity?: number;
  dots?: number;
  sparkles?: number;
  seed?: number;
  className?: string;
}) {
  const stars = React.useMemo(() => {
    const rand = seeded(seed);
    const anim = () => ({
      animationDuration: `${7 + rand() * 9}s`,
      animationDelay: `${-rand() * 16}s`,
    });
    return {
      dots: Array.from({ length: dots }, () => ({
        x: rand() * 1000,
        y: rand() * 1000,
        r: 1.1 + rand() * 1.4,
        style: anim(),
      })),
      sparkles: Array.from({ length: sparkles }, (_, i) => ({
        x: rand() * 1000,
        y: rand() * 1000,
        d: sparklePath(i < 8 ? 7 + rand() * 5 : 4 + rand() * 3),
        style: anim(),
      })),
    };
  }, [dots, sparkles, seed]);

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none w-full h-full ${className}`}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {stars.dots.map((s, i) => (
        <g key={`d${i}`} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`}>
          <circle r={s.r} fill="#191919" className="star-drift" style={s.style} />
        </g>
      ))}
      {stars.sparkles.map((s, i) => (
        <g key={`s${i}`} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`}>
          <path
            d={s.d}
            fill="none"
            stroke="#191919"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className="star-drift"
            style={s.style}
          />
        </g>
      ))}
    </svg>
  );
}
