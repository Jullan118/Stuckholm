import { StuckholmGlobe } from "@/components/StuckholmGlobe";

// How strongly the space background shows on the pages other than home.
// 0.2 = 20 %, so it is only just visible behind the content.
const BACKDROP_OPACITY = 0.2;

// The home page's night sky, stars and line grid (without the globe), laid
// faintly behind every other page. It stays still while the page scrolls and
// ignores the mouse.
export function SpaceBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: BACKDROP_OPACITY }}
    >
      <StuckholmGlobe backgroundOnly />
    </div>
  );
}
