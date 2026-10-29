import { useEffect, useRef } from "react";
import { glitch } from "../lib/glitchClock";

// Pixel overlay for the "pixel" phase of the glitch: coloured blocks over the
// whole globe area, with no characters.
const CELL = 10;
const COLOURS = ["rgba(120, 165, 255, 0.9)", "rgba(230, 240, 255, 0.9)", "rgba(60, 110, 255, 0.85)"];

export function GlitchBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const wrapper = canvas.parentElement;
    if (!ctx || !wrapper) return;

    const resize = () => {
      canvas.width = wrapper.clientWidth;
      canvas.height = wrapper.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    let raf = 0;
    let wasDrawn = false;
    const frame = () => {
      if (glitch.phase === "pixel") {
        const cols = Math.ceil(canvas.width / CELL);
        const rows = Math.ceil(canvas.height / CELL);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (Math.random() < 0.5) continue;
            ctx.fillStyle = COLOURS[(Math.random() * COLOURS.length) | 0];
            ctx.fillRect(x * CELL, y * CELL, CELL - 2, CELL - 2);
          }
        }
        wasDrawn = true;
      } else if (wasDrawn) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        wasDrawn = false;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}
