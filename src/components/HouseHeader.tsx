import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import houseSvg from "@/assets/house/house.svg?raw";
import gridSvg from "@/assets/house/grid.svg?raw";
import apparelSvg from "@/assets/house/apparel.svg?raw";
import artworkSvg from "@/assets/house/artwork.svg?raw";
import secondhandSvg from "@/assets/house/secondhand.svg?raw";
import checkoutSvg from "@/assets/house/checkout.svg?raw";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { TowerGlobe } from "@/components/StuckholmGlobe";

// The shop header (every page except home): Julia's drawing of the house,
// standing on her perspective grid. The portals in the house are the menu:
// Apparel, Art work and 2nd hand open their collection, Check out opens the
// cart. A portal grows a little on hover. When you are inside a category
// that has sub-categories, they are tossed out in a loose, random-looking
// scatter under its portal. The 3D globe on the left tower goes home.
//
// Everything is placed in the house drawing's own units (its viewBox), so
// the whole header scales with the screen width and the parts stay in place.

const HOUSE_W = 3510.58;
const HOUSE_H = 1296.21;
// The grid drawing, scaled to the house's width. Its top sits this far below
// the top of the house, so that the house's (fragmented) ground line, at
// y = 1232, lies exactly on one of the grid's horizontal lines (702 grid
// units down = 817 house units).
const GROUND_Y = 1232;
const GRID_TOP = GROUND_Y - (702 * HOUSE_W) / 3017.07;
const GRID_H = (853 * HOUSE_W) / 3017.07;
// The drawing has empty sky above the globe; the header starts this far
// down, just above the globe, so there is no big white band at the top.
const CROP_TOP = 105;
const HEADER_H = GRID_TOP + GRID_H - CROP_TOP;

// Each portal file is cut from the same artboard as the house, so these are
// the exact spots where they sit in the house drawing.
const PORTAL_H = 403.89;
type Portal = {
  key: string;
  label: string;
  svg: string;
  x: number;
  y: number;
  w: number;
  handle?: string; // collection it opens
  cart?: boolean; // opens the cart instead
};
const PORTALS: Portal[] = [
  { key: "apparel", label: "Apparel", svg: apparelSvg, x: 640.09, y: 850.58, w: 344.42, handle: "apparel" },
  { key: "artwork", label: "Art work", svg: artworkSvg, x: 1169.45, y: 871.19, w: 344.42, handle: "artwork" },
  { key: "secondhand", label: "2nd hand", svg: secondhandSvg, x: 1685.05, y: 843.59, w: 344.42, handle: "2ndhand" },
  { key: "checkout", label: "Check out (cart)", svg: checkoutSvg, x: 2928.92, y: 853.68, w: 419.1, cart: true },
];

// The globe on the left tower, where the drawing had its sketched globe.
// The box is roomy so the letter ring around the globe is never cut off.
const GLOBE_BOX = { x: -50, y: -100, size: 800 };

// Loose scatter for sub-categories under a portal: offsets from the portal's
// centre (x) and from the ground line (y), in house units, and a slight tilt.
// Fixed values, so the scatter looks random but doesn't jump around.
const SCATTER = [
  { dx: -120, dy: 50, rot: -7 },
  { dx: 105, dy: 75, rot: 5 },
  { dx: -70, dy: 115, rot: 3 },
  { dx: 125, dy: 140, rot: -4 },
  { dx: -150, dy: 150, rot: 8 },
];

const pctX = (v: number) => `${(v / HOUSE_W) * 100}%`;
// Vertical positions are given in house units from the top of the drawing.
const pctY = (v: number) => `${((v - CROP_TOP) / HEADER_H) * 100}%`;
const pctH = (v: number) => `${(v / HEADER_H) * 100}%`;

function Svg({ markup, className, style }: { markup: string; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export function HouseHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { totalQuantity, openCart } = useCart();

  // The collection in the URL, and the category it belongs to.
  const routeHandle = pathname.startsWith("/collections/")
    ? pathname.slice("/collections/".length)
    : null;
  const currentCategory = CATEGORIES.find(
    (c) => c.handle === routeHandle || c.children?.some((child) => child.handle === routeHandle)
  );

  // Sub-categories of the category you are in (if it has any).
  const subs = currentCategory?.children ?? [];

  return (
    <>
    <header
      className="house-header relative z-20 w-full select-none"
      style={{ aspectRatio: `${HOUSE_W} / ${HEADER_H}` }}
    >
      {/* The grid, very faint, behind the house. */}
      <Svg
        markup={gridSvg}
        className="house-grid absolute left-0 w-full pointer-events-none"
        style={{ top: pctY(GRID_TOP) }}
      />

      {/* The house itself (without the portals, which are drawn on top). */}
      <Svg
        markup={houseSvg}
        className="house-svg absolute left-0 w-full pointer-events-none"
        style={{ top: pctY(0) }}
      />

      {/* The 3D globe on the tower: click to go home. */}
      <button
        type="button"
        aria-label="Stuck in Stuckholm, home"
        onClick={() => navigate("/")}
        className="absolute cursor-pointer"
        style={{
          left: pctX(GLOBE_BOX.x),
          top: pctY(GLOBE_BOX.y),
          width: pctX(GLOBE_BOX.size),
          height: pctH(GLOBE_BOX.size),
        }}
      >
        <TowerGlobe />
      </button>

      {/* The portals. */}
      {PORTALS.map((p) => {
        const style: React.CSSProperties = {
          left: pctX(p.x),
          top: pctY(p.y),
          width: pctX(p.w),
          height: pctH(PORTAL_H),
        };
        const inner = <Svg markup={p.svg} className="house-portal-art" />;
        const className =
          "house-portal absolute block origin-bottom transition-transform duration-300 ease-out hover:scale-[1.1] focus-visible:scale-[1.1] outline-none";
        if (p.cart) {
          return (
            <button key={p.key} type="button" aria-label={p.label} onClick={openCart} className={className} style={style}>
              {inner}
              {totalQuantity > 0 && (
                <span className="absolute top-[18%] right-[8%] text-[10px] sm:text-xs tabular-nums text-black/70">
                  {totalQuantity}
                </span>
              )}
            </button>
          );
        }
        return (
          <Link key={p.key} to={`/collections/${p.handle}`} aria-label={p.label} className={className} style={style}>
            {inner}
          </Link>
        );
      })}

      {/* Sub-categories, tossed out under the current category's portal. */}
      {PORTALS.map((p) => {
        const cat = CATEGORIES.find((c) => c.handle === p.handle);
        if (!cat?.children || currentCategory?.handle !== cat.handle) return null;
        const centre = p.x + p.w / 2;
        return cat.children.map((child, i) => {
          const s = SCATTER[i % SCATTER.length];
          const active = routeHandle === child.handle;
          return (
            <Link
              key={child.handle}
              to={`/collections/${child.handle}`}
              aria-current={active ? "page" : undefined}
              className={`house-sub absolute hidden sm:block whitespace-nowrap blackletter-outline leading-none animate-blur-fade-in hover:opacity-60 transition-opacity ${active ? "underline underline-offset-4" : ""}`}
              style={{
                left: pctX(centre + s.dx),
                top: pctY(GROUND_Y + s.dy),
                transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              }}
            >
              {child.label}
            </Link>
          );
        });
      })}
    </header>

    {/* Phones: the house is small, so the sub-categories go in a loose,
        slightly tilted row under it instead. */}
    {subs.length > 0 && (
      <nav className="sm:hidden relative z-20 w-full flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pt-1 pb-4">
        {subs.map((child, i) => {
          const active = routeHandle === child.handle;
          return (
            <Link
              key={child.handle}
              to={`/collections/${child.handle}`}
              aria-current={active ? "page" : undefined}
              className={`blackletter-outline text-base leading-none ${active ? "underline underline-offset-4" : ""}`}
              style={{ transform: `rotate(${SCATTER[i % SCATTER.length].rot}deg) translateY(${(i % 2) * 6}px)` }}
            >
              {child.label}
            </Link>
          );
        })}
      </nav>
    )}
    </>
  );
}
