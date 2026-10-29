import { useEffect, useRef } from "react";

// Symbols close to the reference: mixed symbols, a few digits and blocks.
const CHARS = "¤§¶ƒ±²³µ¿¡░▒▓█╬═║%&#@?*+=<>{}[]01";
const GLYPH_BLUE = "rgba(120, 165, 255, 0.95)";
const CELL = 14;          // size of one character cell in px
const BURST_MS = 700;     // length of one burst, same as the CSS glitch
const EVERY_MS = 15000;   // same 15 s cycle as the CSS glitch

// Draws a field of blue ASCII characters over the globe for 0.7 s every 15 s.
// The timer starts when the component mounts, which is the same moment the
// CSS .stuck-glitch animation starts, so the two stay in step.
export function AsciiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;

    const resize = () => {
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = parent ? new ResizeObserver(resize) : null;
    if (parent && ro) ro.observe(parent);

    let raf = 0;
    const draw = () => {
      if (!activeRef.current) return;
      const cols = Math.ceil(canvas.width / CELL);
      const rows = Math.ceil(canvas.height / CELL);

      // Dim the scene a little so the characters read clearly.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${CELL}px monospace`;
      ctx.fillStyle = GLYPH_BLUE;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (Math.random() < 0.35) continue; // gaps, as in the reference
          const ch = CHARS[(Math.random() * CHARS.length) | 0];
          ctx.fillText(ch, x * CELL, (y + 1) * CELL);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const burst = () => {
      activeRef.current = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
      window.setTimeout(() => {
        activeRef.current = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, BURST_MS);
    };

    burst();
    const id = window.setInterval(burst, EVERY_MS);

    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
      activeRef.current = false;
      ro?.disconnect();
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
