import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES, CONSUME_HANDLE } from "@/lib/categories";
import { usePastHeaderGrid } from "@/components/HeaderBar";
import apparelUrl from "@/assets/portal-apparel.svg?inline";
import secondHandUrl from "@/assets/portal-2ndhand.svg?inline";
import artworkUrl from "@/assets/portal-artwork.svg?inline";

// The drawn portal for each category, by collection handle. `height` sets how
// tall the portal is shown next to the others (the tallest fills the row).
// Apparel and 2nd hand use the height of their drawing; Art work is shown
// about 20% larger than its drawing (137.86) so it does not look too small.
const PORTALS: Record<string, { src: string; height: number }> = {
  apparel: { src: apparelUrl, height: 210.39 },
  "2ndhand": { src: secondHandUrl, height: 193.03 },
  artwork: { src: artworkUrl, height: 166 },
};
const TALLEST_PORTAL = 210.39;

// Centred navigation: the categories as drawn portals, shown on the shop pages
// (/collections/...). At the top of the page the portals stand in the grid
// drawing and scroll away with it. Once the grid is gone they come back small,
// fixed in the white strip. The portal of the category you are in is a bit
// larger than the others.
// "Consume" is not in this menu. On the home page it is the only link, in the
// top-left corner, and it is the way in to the shop. Hovering (or clicking) a
// category shows its sub-categories directly under it. Moving the mouse away,
// clicking outside, pressing Escape or changing page closes them.
// On the home page the hero is a dark starfield, so the nav switches to white
// there. The mini globe (top-left) and the cart (top-right) sit in the corners.
export function MainNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isConsume = pathname === "/consume" || pathname.startsWith("/collections/");
  const [active, setActive] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLDivElement>(null);
  const compact = usePastHeaderGrid();

  // Close the sub-row when the page changes.
  React.useEffect(() => setActive(null), [pathname]);

  // Close on outside click or Escape.
  React.useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  // The category the current collection belongs to (or is). Its sub-categories
  // stay visible while you are on one of its pages.
  const routeHandle = pathname.split("/")[2];
  const currentCategory = CATEGORIES.find(
    (c) => c.handle === routeHandle || c.children?.some((ch) => ch.handle === routeHandle)
  );

  const inkClass = isHome
    ? "text-white home-ink hover:opacity-70"
    : "text-black hover:text-black/70";

  // Height of the tallest portal. Large: a little less than the grid, so the
  // enlarged portal still fits inside it. Compact: fits the fixed white strip.
  const portalHeight = compact ? "56px" : "calc(var(--header-grid-h) - 34px)";

  return (
    <>
      {isHome && (
        <Link
          to={`/collections/${CONSUME_HANDLE}`}
          className={`fixed top-4 left-4 sm:left-8 z-20 inline-block text-sm sm:text-base transition-opacity duration-200 ${inkClass}`}
        >
          Consume
        </Link>
      )}

      {isConsume && (
        <div
          ref={navRef}
          key={compact ? "compact" : "large"}
          className={`inset-x-0 top-0 z-20 flex items-end justify-center px-20 sm:px-32 pointer-events-none ${
            compact
              ? "fixed h-20 pb-3 animate-blur-fade-in"
              : "absolute h-[var(--header-grid-h)] pb-1.5"
          }`}
        >
          <div className="pointer-events-auto flex items-end justify-center gap-x-5 sm:gap-x-12 md:gap-x-20">
            {CATEGORIES.map((cat, i) => {
              const portal = PORTALS[cat.handle];
              const isCurrent = currentCategory?.label === cat.label;
              const showChildren = cat.children && (active === cat.label || (isCurrent && !compact));
              return (
                <div
                  key={cat.label}
                  className={`relative ${compact ? "" : "animate-slide-in-left"}`}
                  style={compact ? undefined : { animationDelay: `${120 + i * 90}ms` }}
                  onMouseEnter={() => cat.children && setActive(cat.label)}
                  onMouseLeave={() => setActive(null)}
                >
                  <Link
                    to={`/collections/${cat.handle}`}
                    aria-label={cat.label}
                    aria-current={isCurrent ? "page" : undefined}
                    onFocus={() => cat.children && setActive(cat.label)}
                    className={`block origin-bottom transition-transform duration-200 ${
                      isCurrent ? "scale-[1.18]" : "hover:scale-110"
                    }`}
                  >
                    {portal ? (
                      <img
                        src={portal.src}
                        alt=""
                        draggable={false}
                        className="block w-auto max-w-none select-none"
                        style={{ height: `calc(${portalHeight} * ${portal.height / TALLEST_PORTAL})` }}
                      />
                    ) : (
                      <span className={`text-sm sm:text-base ${inkClass}`}>{cat.label}</span>
                    )}
                  </Link>

                  {/* Centred under the portal. The outer div does the centring,
                      because the fade-in animation on the list sets its own transform. */}
                  {showChildren && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full">
                      <ul
                        className={`flex gap-5 sm:gap-8 whitespace-nowrap animate-blur-fade-in ${
                          compact ? "pt-4 pb-2 px-4 bg-white" : "pt-3"
                        }`}
                      >
                        {cat.children!.map((child) => (
                          <li key={child.label}>
                            <Link
                              to={`/collections/${child.handle}`}
                              className={`text-sm sm:text-base transition-opacity duration-200 ${inkClass}`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
