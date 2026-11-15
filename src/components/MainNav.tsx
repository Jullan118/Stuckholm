import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES, CONSUME_HANDLE } from "@/lib/categories";
import { usePastHeaderGrid } from "@/components/HeaderBar";
import apparelUrl from "@/assets/portal-apparel.svg?inline";
import secondHandUrl from "@/assets/portal-2ndhand.svg?inline";
import artworkUrl from "@/assets/portal-artwork.svg?inline";
import signAllUrl from "@/assets/sign-all.svg?inline";
import signDescartesUrl from "@/assets/sign-descartes.svg?inline";
import signRoyaleUrl from "@/assets/sign-royale.svg?inline";
import signStuckholmUrl from "@/assets/sign-stuckholm.svg?inline";

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

// The drawn sign for each sub-category, by collection handle. `width` and
// `height` are the size of the drawing in its own units; the signs are drawn
// at the same scale, so they are all shown at the same letter size.
// A sub-category without a sign here is shown as plain text.
const SIGNS: Record<string, { src: string; width: number; height: number }> = {
  apparel: { src: signAllUrl, width: 67.59, height: 40.53 },
  "2ndhand-all": { src: signAllUrl, width: 67.59, height: 40.53 },
  descartes: { src: signDescartesUrl, width: 192.11, height: 42.98 },
  stuckholm: { src: signStuckholmUrl, width: 194.1, height: 42.98 },
  "stuck-royale": { src: signRoyaleUrl, width: 132.45, height: 42.98 },
};
const SIGN_UNITS = 42.98;

// Centred navigation: the categories as drawn portals, shown on the shop pages
// (/collections/...). At the top of the page the portals stand in the grid
// drawing and scroll away with it. Once the grid is gone they come back small,
// fixed in the white strip. The portal of the category you are in is a bit
// larger than the others.
// Sub-categories are drawn signs on a row of their own under the portals,
// still inside the grid. The row shows the sub-categories of the category you
// are in, or of the portal you hover. In the small fixed version it only
// shows on hover. Moving the mouse away, clicking outside, pressing Escape or
// changing page closes it.
// "Consume" is not in this menu. On the home page it is the only link, in the
// top-left corner, and it is the way in to the shop.
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

  // Height of the tallest portal. Large: a little less than the portal row, so the
  // enlarged portal still fits inside it. Compact: fits the fixed white strip.
  const portalHeight = compact ? "56px" : "calc(var(--header-portal-row-h) * 0.8 - 8px)";

  // Height of the signs on the sub-category row.
  const signHeight = compact ? "26px" : "clamp(20px, 2.9vw, 42px)";

  // Whose sub-categories the row shows: the hovered portal's, otherwise (in
  // the large version) those of the category you are in.
  const shownLabel = active ?? (compact ? null : currentCategory?.label ?? null);
  const shown = CATEGORIES.find((c) => c.label === shownLabel);

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
              : "absolute h-[var(--header-portal-row-h)] pb-1.5"
          }`}
        >
          <div className="pointer-events-auto relative" onMouseLeave={() => setActive(null)}>
            <div className="flex items-end justify-center gap-x-6 sm:gap-x-16 md:gap-x-28">
              {CATEGORIES.map((cat, i) => {
                const portal = PORTALS[cat.handle];
                const isCurrent = currentCategory?.label === cat.label;
                return (
                  <div
                    key={cat.label}
                    className={compact ? "" : "animate-slide-in-left"}
                    style={compact ? undefined : { animationDelay: `${120 + i * 90}ms` }}
                    onMouseEnter={() => setActive(cat.children ? cat.label : null)}
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
                  </div>
                );
              })}
            </div>

            {/* Sub-category row, centred under the portals. The outer div does
                the centring, because the fade-in animation on the list sets
                its own transform. */}
            {shown?.children && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-max max-w-[100vw]">
                <ul
                  key={shown.label}
                  className={`flex items-center justify-center gap-x-4 sm:gap-x-8 md:gap-x-10 whitespace-nowrap animate-blur-fade-in ${
                    compact ? "pt-4 pb-3 px-5 bg-white" : "pt-3 px-2"
                  }`}
                >
                  {shown.children.map((child) => {
                    const sign = SIGNS[child.handle];
                    const isCurrentChild = routeHandle === child.handle;
                    return (
                      <li key={child.label}>
                        <Link
                          to={`/collections/${child.handle}`}
                          aria-label={child.label}
                          aria-current={isCurrentChild ? "page" : undefined}
                          className={`block transition-transform duration-200 ${
                            isCurrentChild ? "scale-[1.12]" : "hover:scale-105"
                          }`}
                        >
                          {sign ? (
                            <img
                              src={sign.src}
                              alt=""
                              draggable={false}
                              className="block max-w-none select-none"
                              style={{
                                height: `calc(${signHeight} * ${sign.height / SIGN_UNITS})`,
                                width: `calc(${signHeight} * ${sign.width / SIGN_UNITS})`,
                              }}
                            />
                          ) : (
                            <span className={`text-sm sm:text-base ${inkClass}`}>{child.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
