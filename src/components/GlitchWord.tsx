import { useEffect, useRef } from "react";
import { glitch, glitchTime } from "../lib/glitchClock";

// "STUCK" in heavy type with red and blue edges, shown during the shatter.
// It flickers on and off between 0.35 s and 0.85 s into the one-second sequence.
const SHOW_FROM = 0.35;
const SHOW_TO = 0.85;

export function GlitchWord() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const frame = () => {
      const el = ref.current;
      if (el) {
        let visible = false;
        if (glitch.phase === "shatter") {
          const t = glitchTime();
          if (t >= SHOW_FROM && t <= SHOW_TO) {
            // Flicker: on for two frames, off for one, at about 30 Hz.
            visible = Math.floor(t * 30) % 3 !== 2;
          }
        }
        el.style.opacity = visible ? "1" : "0";
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 3,
        opacity: 0,
        fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 900,
        fontSize: "clamp(56px, 14vw, 200px)",
        letterSpacing: "0.02em",
        color: "#ffffff",
        textShadow: "-4px 0 0 rgba(255, 40, 60, 0.9), 4px 0 0 rgba(0, 150, 255, 0.9)",
        userSelect: "none",
      }}
    >
      STUCK
    </div>
  );
}
