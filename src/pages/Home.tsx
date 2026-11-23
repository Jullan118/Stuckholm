import * as React from "react";
import { useNavigate } from "react-router-dom";
import { StuckholmGlobe } from "@/components/StuckholmGlobe";
import { CONSUME_HANDLE } from "@/lib/categories";

// How much extra scrolling (in viewport-heights) it takes for the sky
// behind the globe to fully fade from the starry night down to white. The
// hero itself stays pinned (sticky) for that whole stretch; the globe keeps
// spinning in place the entire time, it never shrinks or flies away.
const SPIN_AWAY_VH = 200;

// The quote above the footer, on the home page only. The word "nature"
// glitches back and forth into "stuckholm" (see GlitchWord).
const QUOTE_BEFORE = "life in ";
const QUOTE_AFTER = " is nasty, brutish and short.";

// How long each word stays before it glitches over to the other, and how
// long the glitch itself lasts (milliseconds).
const NATURE_MS = 3200;
const STUCKHOLM_MS = 1800;
const GLITCH_MS = 380;

// A word that every few seconds glitches (shakes, splits into blue and red)
// and swaps between "nature" and "stuckholm".
function GlitchWord() {
  const [showStuckholm, setShowStuckholm] = React.useState(false);
  const [glitching, setGlitching] = React.useState(false);

  React.useEffect(() => {
    let timer: number;
    let stuck = false;
    const next = () => {
      timer = window.setTimeout(() => {
        setGlitching(true);
        // Swap the word halfway through the glitch.
        timer = window.setTimeout(() => {
          stuck = !stuck;
          setShowStuckholm(stuck);
          timer = window.setTimeout(() => {
            setGlitching(false);
            next();
          }, GLITCH_MS / 2);
        }, GLITCH_MS / 2);
      }, stuck ? STUCKHOLM_MS : NATURE_MS);
    };
    next();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span className={`inline-block ${glitching ? "word-glitch" : ""}`}>
      {showStuckholm ? "stuckholm" : "nature"}
    </span>
  );
}

export function Home() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    function handleScroll() {
      const el = wrapperRef.current;
      if (!el) return;

      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const rect = el.getBoundingClientRect();
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const next = scrolled / scrollable;
      setProgress(next);
      // Once the background has turned mostly white, the header and corners
      // switch from white to black (see .home-ink in index.css).
      document.documentElement.classList.toggle("hero-light", next > 0.5);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      document.documentElement.classList.remove("hero-light");
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: `${100 + SPIN_AWAY_VH}vh` }}
      >
        <div className="sticky top-0 left-0 w-full h-[100svh] overflow-hidden bg-[#04050c]">
          {/* Clicking the globe is the way in to the shop (replaces the old
              "Enter" link in the top left corner). */}
          <StuckholmGlobe
            scrollProgress={progress}
            onEnter={() => navigate(`/collections/${CONSUME_HANDLE}`)}
          />
        </div>
      </div>

      <section className="w-full px-4 sm:px-8 py-16 font-instrument text-black">
        <p className="mx-auto max-w-3xl text-xs sm:text-base leading-relaxed">
          {QUOTE_BEFORE}
          <GlitchWord />
          {QUOTE_AFTER}
        </p>
      </section>
    </>
  );
}
