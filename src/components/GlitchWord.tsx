import { useEffect, useRef } from "react";
import { glitch, glitchTime } from "../lib/glitchClock";

// "STUCK" cut into horizontal slices. Each slice is shifted sideways at random,
// so the word breaks up like a damaged signal. Shown during the shatter.
const SLICES = 8;
const SHOW_FROM = 0.35;
const SHOW_TO = 0.85;
const WORD = "STUCK";

const textStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
  fontWeight: 900,
  fontSize: "clamp(56px, 14vw, 200px)",
  letterSpacing: "0.02em",
  color: "#ffffff",
  textShadow: "-4px 0 0 rgba(255, 40, 60, 0.9), 4px 0 0 rgba(0, 150, 255, 0.9)",
  whiteSpace: "nowrap",
  userSelect: "none",
};

export function GlitchWord() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sliceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lastShift = 0;
    const frame = () => {
      const wrap = wrapRef.current;
      if (wrap) {
        let visible = false;
        if (glitch.phase === "shatter") {
          const t = glitchTime();
          if (t >= SHOW_FROM && t <= SHOW_TO) {
            // Flicker: on for two frames, off for one, at about 30 Hz.
            visible = Math.floor(t * 30) % 3 !== 2;
            // Re-shift the slices about every 60 ms, so the cuts jump.
            if (t - lastShift > 0.06) {
              lastShift = t;
              const width = wrap.clientWidth || 1;
              sliceRefs.current.forEach((el) => {
                if (!el) return;
                const offset = Math.random() < 0.55 ? (Math.random() - 0.5) * width * 0.12 : 0;
                el.style.transform = `translateX(${offset.toFixed(1)}px)`;
              });
            }
          }
        }
        wrap.style.opacity = visible ? "1" : "0";
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 3,
        opacity: 0,
      }}
    >
      {Array.from({ length: SLICES }, (_, i) => {
        const top = (i / SLICES) * 100;
        const bottom = 100 - ((i + 1) / SLICES) * 100;
        return (
          <div
            key={i}
            ref={(el) => {
              sliceRefs.current[i] = el;
            }}
            style={{
              ...textStyle,
              clipPath: `inset(${top}% 0 ${bottom}% 0)`,
              willChange: "transform",
            }}
          >
            {WORD}
          </div>
        );
      })}
    </div>
  );
}
