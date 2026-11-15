import * as React from "react";
import { useLocation } from "react-router-dom";
import { CONSUME_HANDLE } from "@/lib/categories";
import gridUrl from "@/assets/header-grid.svg?inline";

// Height of the fixed row holding the logo, nav and cart.
const FIXED_ROW_PX = 80;
// The grid height is the CSS variable --header-grid-h (see index.css).
const HEADER_GRID_ID = "header-grid";

// True once the grid has scrolled out from behind the fixed row. Also true
// on pages without the grid as soon as the page is scrolled a little.
// The nav (MainNav) uses it too, to switch to its small fixed version.
export function usePastHeaderGrid() {
  const { pathname } = useLocation();
  const [pastGrid, setPastGrid] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const height = document.getElementById(HEADER_GRID_ID)?.offsetHeight ?? 0;
      setPastGrid(window.scrollY > Math.max(height - FIXED_ROW_PX, 8));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return pastGrid;
}

// Header background on every page except the home page and the blurred
// entrance page (/collections/all), which have no header background.
// At the top of the page it is the perspective grid drawing, full width, and
// it scrolls away with the page. The logo, nav and cart are fixed, so once
// the grid has scrolled out a white strip fades in behind them. Without the
// strip, product images and text would show through between the header items.
export function HeaderBar() {
  const { pathname } = useLocation();
  const pastGrid = usePastHeaderGrid();
  const isBare = pathname === "/" || pathname === `/collections/${CONSUME_HANDLE}`;

  if (isBare) return null;

  return (
    <>
      {/* The pages below keep their own top padding (made for the old fixed
          strip), so the negative margin pulls them up closer to the grid. The image is
          scaled up a little to hide the frame line on its right and bottom edge. */}
      <div
        id={HEADER_GRID_ID}
        aria-hidden="true"
        className="w-full -mb-12 h-[var(--header-grid-h)] overflow-hidden"
      >
        <img
          src={gridUrl}
          alt=""
          draggable={false}
          className="w-full h-full object-cover object-top select-none origin-top-left scale-[1.03]"
        />
      </div>
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 top-0 h-20 z-[15] bg-white transition-opacity duration-200 ${
          pastGrid ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </>
  );
}
