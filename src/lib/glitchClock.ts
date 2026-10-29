// One shared clock for the home-page glitch. Every 15 s a one-second
// sequence runs: the globe breaks into blue particles from the inside out.
// The CSS glitch in index.css uses the same 15 s / 1 s timings.

export const GLITCH_CYCLE_MS = 15000;
export const GLITCH_SHATTER_MS = 1000;

export type GlitchPhase = "shatter" | null;

// Read every frame by the 3D scene.
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
    set("shatter");
    timers.push(window.setTimeout(() => set(null), GLITCH_SHATTER_MS));
  };
  run();
  const id = window.setInterval(run, GLITCH_CYCLE_MS);
  return () => {
    window.clearInterval(id);
    timers.forEach((t) => window.clearTimeout(t));
    set(null);
  };
}
