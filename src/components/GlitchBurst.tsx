import { useEffect, useRef } from "react";

// One burst every BURST_EVERY_MS, lasting BURST_MS. The CSS glitch on
// .stuck-glitch (index.css) uses the same timings, so the two stay in step.
const BURST_MS = 700;
const BURST_EVERY_MS = 15000;

// The three variants take turns, one per burst.
type Variant = "ascii" | "terrain" | "apple";
const VARIANTS: Variant[] = ["ascii", "terrain", "apple"];

const CHARS = "¤§¶ƒ±²³µ¿¡░▒▓█╬═║%&#@?*+=<>{}[]01";
const GLYPH_BLUE = "rgba(120, 165, 255, 0.95)";
const CELL = 14;

// Colour ramp for the terrain, from low (blue) to high (magenta), as in the reference.
const RAMP = [
  [40, 90, 255],
  [40, 220, 255],
  [90, 255, 120],
  [240, 255, 90],
  [255, 150, 50],
  [255, 60, 60],
  [220, 60, 255],
];

export function GlitchBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const wrapper = canvas.parentElement; // the .stuck-glitch div
    if (!wrapper) return;

    // Preload the apple cutout for the apple variant.
    const img = new Image();
    img.src = "/images/apple-worm.png";
    imgRef.current = img;

    const resize = () => {
      canvas.width = wrapper.clientWidth;
      canvas.height = wrapper.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    let variant: Variant = "ascii";
    let raf = 0;
    let running = false;
    let burstIndex = 0;
    let startedAt = 0;

    const drawAscii = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CELL}px monospace`;
      ctx.fillStyle = GLYPH_BLUE;
      const cols = Math.ceil(canvas.width / CELL);
      const rows = Math.ceil(canvas.height / CELL);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (Math.random() < 0.35) continue;
          ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], x * CELL, (y + 1) * CELL);
        }
      }
    };

    const drawTerrain = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, w, h);
      const step = 6;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          // Smooth, moving height field: a few overlapping waves.
          const nx = x / w;
          const ny = y / h;
          const v =
            0.5 +
            0.25 * Math.sin(nx * 9 + t * 3) +
            0.2 * Math.cos(ny * 7 - t * 2) +
            0.15 * Math.sin((nx + ny) * 12 + t * 4);
          const idx = Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)));
          const [r, g, b] = RAMP[idx];
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
          ctx.fillRect(x, y, step - 2, step - 2);
        }
      }
    };

    const drawApple = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(0, 0, w, h);
      const img = imgRef.current;
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const scale = Math.min((w * 0.6) / img.naturalWidth, (h * 0.6) / img.naturalHeight);
      const iw = img.naturalWidth * scale;
      const ih = img.naturalHeight * scale;
      const ox = (w - iw) / 2;
      const oy = (h - ih) / 2;
      // Slice the image into horizontal strips and shift some of them sideways.
      const slice = 8;
      for (let sy = 0; sy < ih; sy += slice) {
        const jitter = Math.random() < 0.2 ? (Math.random() - 0.5) * 80 : 0;
        ctx.drawImage(
          img,
          0,
          sy / scale,
          img.naturalWidth,
          slice / scale,
          ox + jitter,
          oy + sy,
          iw,
          slice,
        );
      }
    };

    const frame = () => {
      if (!running) return;
      const t = (performance.now() - startedAt) / 1000;
      if (variant === "ascii") drawAscii();
      else if (variant === "terrain") drawTerrain(t);
      else drawApple();
      raf = requestAnimationFrame(frame);
    };

    const burst = () => {
      variant = VARIANTS[burstIndex % VARIANTS.length];
      burstIndex++;
      // CSS hides the globe during the terrain and apple variants.
      wrapper.dataset.variant = variant;
      running = true;
      startedAt = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
      window.setTimeout(() => {
        running = false;
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        delete wrapper.dataset.variant;
      }, BURST_MS);
    };

    burst();
    const id = window.setInterval(burst, BURST_EVERY_MS);

    return () => {
      window.clearInterval(id);
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      delete wrapper.dataset.variant;
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
