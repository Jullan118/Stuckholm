import { useLocation } from "react-router-dom";
import { CONSUME_HANDLE } from "@/lib/categories";
import gridUrl from "@/assets/header-grid.svg?inline";

// The grid height is the CSS variable --header-grid-h (see index.css).
// Header background on every page except the home page and the blurred
// entrance page (/collections/all), which have no header background.
// It is the perspective grid drawing, full width, at the top of the page. It
// scrolls away with the page, and so do the logo, nav and cart on top of it.
export function HeaderBar() {
  const { pathname } = useLocation();
  const isBare = pathname === "/" || pathname === `/collections/${CONSUME_HANDLE}`;

  if (isBare) return null;

  return (
    <>
      {/* The pages below keep their own top padding (made for the old fixed
          strip), so the negative margin pulls them up closer to the grid. The image is
          scaled up a little, about its top centre, to hide the frame line on
          its right and bottom edge. The --gl-* values in index.css depend on
          this scale and on object-cover/object-top, so change them together. */}
      <div
        aria-hidden="true"
        className="w-full -mb-12 h-[var(--header-grid-h)] overflow-hidden"
      >
        <img
          src={gridUrl}
          alt=""
          draggable={false}
          className="w-full h-full object-cover object-top select-none origin-top scale-[1.03]"
        />
      </div>
    </>
  );
}
