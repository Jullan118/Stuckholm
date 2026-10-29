import { useEffect, useRef } from "react";
import { glitch } from "../lib/glitchClock";

// Pixel overlay for the "pixel" phase of the glitch. It looks like a broken
// video signal: torn horizontal strips shifted sideways, coarse compression
// blocks and scan lines, all in different blues. No characters.
const CELL = 12;
// Only blues, from deep ink to pale ice.
const BLUES = [
  "#0a1f7a",
  "#103bb0",
  "#1f4fe0",
  "#2f6bff",
  "#5a8dff",
  "#9cc2ff",
  "#d6e8ff",
];
const pick = () => BLUES[(Math.random() * BLUES.length) | 0];

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
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Dark base so the scene underneath reads as a damaged picture.
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#06124a";
        ctx.fillRect(0, 0, w, h);

        // Coarse compression blocks, some skipped, each in a random blue.
        const cols = Math.ceil(w / CELL);
        const rows = Math.ceil(h / CELL);
        ctx.globalAlpha = 0.6;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (Math.random() < 0.45) continue;
            ctx.fillStyle = pick();
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          }
        }

        // Torn strips: thin horizontal bands pushed sideways, wrapping at the edge.
        ctx.globalAlpha = 0.85;
        const strips = 14 + ((Math.random() * 10) | 0);
        for (let i = 0; i < strips; i++) {
          const sh = 2 + Math.random() * 26;
          const sy = Math.random() * h;
          const off = (Math.random() - 0.5) * w * 0.25;
          ctx.fillStyle = pick();
          ctx.fillRect(off, sy, w, sh);
          ctx.fillRect(off - w, sy, w, sh);
          ctx.fillRect(off + w, sy, w, sh);
        }

        // A few bright glitch lines.
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#d6e8ff";
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2);
        }

        // Scan lines over everything.
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#000a2e";
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1);
        }
        ctx.globalAlpha = 1;
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
