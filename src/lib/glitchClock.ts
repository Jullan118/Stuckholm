// One shared clock for the home-page glitch. Every 15 s a burst runs for
// 0.6 s, split into three 0.2 s phases:
//   pixel: pixels over the screen and the grid shakes
//   grid:  the grid turns into a scanning, coloured landscape
//   apple: the globe is replaced by the apple
// The CSS glitch in index.css uses the same 15 s / 0.6 s timings.

export type GlitchPhase = "pixel" | "grid" | null;

export const GLITCH_CYCLE_MS = 15000;
export const GLITCH_PHASE_MS = 200;

// Read every frame by the 3D scene and the pixel overlay.
export const glitch: { phase: GlitchPhase; start: number } = {
  phase: null,
  start: 0,
};

// Seconds since the current phase started.
export function glitchTime(): number {
  return (performance.now() - glitch.start) / 1000;
}

// Starts the cycle. Returns a function that stops it. Does nothing when the
// user has asked for reduced motion.
export function startGlitchClock(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }
  const timers: number[] = [];
  const set = (phase: GlitchPhase) => {
    glitch.phase = phase;
    glitch.start = performance.now();
  };
  const run = () => {
    set("pixel");
    timers.push(window.setTimeout(() => set("grid"), GLITCH_PHASE_MS));
    timers.push(window.setTimeout(() => set(null), GLITCH_PHASE_MS * 2));
  };
  // The first burst comes after one full cycle, not when the page opens.
  const id = window.setInterval(run, GLITCH_CYCLE_MS);
  return () => {
    window.clearInterval(id);
    timers.forEach((t) => window.clearTimeout(t));
    set(null);
  };
}
