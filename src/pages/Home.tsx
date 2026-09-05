import * as React from "react";
import { StuckholmGlobe } from "@/components/StuckholmGlobe";

// How much extra scrolling (in viewport-heights) it takes for the globe to
// fully spin away into the starfield once it starts. The hero itself stays
// pinned (sticky) for that whole stretch.
const SPIN_AWAY_VH = 120;

export function Home() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
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
      setProgress(scrolled / scrollable);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `${100 + SPIN_AWAY_VH}vh` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#04050c]">
        <StuckholmGlobe scrollProgress={progress} />
      </div>
    </div>
  );
}
