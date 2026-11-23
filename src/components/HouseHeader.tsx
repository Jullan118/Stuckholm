import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import houseSvg from "@/assets/house3/house.svg?raw";
import gridSvg from "@/assets/house3/grid.svg?raw";
import gateSvg from "@/assets/house3/gate.svg?raw";
import apparelSvg from "@/assets/house3/apparel.svg?raw";
import artworkSvg from "@/assets/house3/artwork.svg?raw";
import secondhandSvg from "@/assets/house3/secondhand.svg?raw";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { TowerGlobe } from "@/components/StuckholmGlobe";

// The shop header (every page except home): Julia's drawing of the house
// (hussss-25.svg) standing on her perspective grid. The portals in the house
// are the menu: Apparel, Art work and 2nd hand open their collection and
// grow to 1.5x on hover; Check out opens the cart, and on hover its gate (the
// right part) rattles, as if someone were shaking it to get out. When you
// are inside a category that has sub-categories, they are tossed out in a
// loose scatter under its portal. The 3D globe on the left tower goes home.
//
// The portals and the gate were lifted out of the house drawing as separate
// pieces (same units), so they can move. Everything is placed in the
// drawing's own units (its viewBox), so the header scales with the width.

const HOUSE_W = 2838.93;
const HOUSE_H = 995.28;
// The house's ground line.
const GROUND_Y = 920;
// The grid drawing, scaled to the house's width, placed so the ground line
// lies on one of its horizontal lines (702 grid units down).
const GRID_SCALE = HOUSE_W / 3017.07;
const GRID_TOP = GROUND_Y - 702 * GRID_SCALE;
const GRID_BOTTOM = GRID_TOP + 853 * GRID_SCALE;
// The header shows this band: from a little above the globe down to the
// bottom edge of the grid.
const CROP_TOP = 110;
const HEADER_H = GRID_BOTTOM - CROP_TOP;

type Portal = {
  key: string;
  label: string;
  svg: string;
  x: number;
  y: number;
  w: number;
  h: number;
  handle?: string; // collection it opens
  cart?: boolean; // opens the cart instead
};
// Boxes (drawing units) match the viewBox of each piece.
const PORTALS: Portal[] = [
  { key: "apparel", label: "Apparel", svg: apparelSvg, x: 622, y: 688, w: 266, h: 260, handle: "apparel" },
  { key: "artwork", label: "Art work", svg: artworkSvg, x: 982, y: 700, w: 226, h: 232, handle: "artwork" },
  { key: "secondhand", label: "2nd hand", svg: secondhandSvg, x: 1328, y: 700, w: 230, h: 232, handle: "2ndhand" },
  // Check out: the text stays in the house; the clickable area covers text
  // and gate, and only the gate is a separate (rattling) piece.
  { key: "checkout", label: "Check out (cart)", svg: gateSvg, x: 2478, y: 718, w: 150, h: 250, cart: true },
];
// Clickable area for Check out (text + gate).
const CHECKOUT_HIT = { x: 2360, y: 718, w: 268, h: 250 };

// The globe on the left tower.
// The box is roomy so the letter ring around the globe is never cut off.
const GLOBE_BOX = { x: 118, y: 60, size: 365 };

// Loose scatter for sub-categories under a portal: offsets from the portal's
// centre (x) and from the ground line (y), in drawing units, and a slight
// tilt. Fixed values, so the scatter looks random but doesn't jump around.
const SCATTER = [
  { dx: -125, dy: 35, rot: -7 },
  { dx: 45, dy: 30, rot: 5 },
  { dx: -40, dy: 90, rot: 3 },
  { dx: 135, dy: 82, rot: -4 },
  { dx: -160, dy: 100, rot: 8 },
];

function Svg({ markup, className, style }: { markup: string; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: markup }} />;
}

const pctX = (v: number) => `${(v / HOUSE_W) * 100}%`;
// Vertical positions are given in drawing units from the top of the drawing.
const pctY = (v: number) => `${((v - CROP_TOP) / HEADER_H) * 100}%`;
const pctH = (v: number) => `${(v / HEADER_H) * 100}%`;

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
      {/* The grid, faint, behind the house. */}
      <Svg
        markup={gridSvg}
        className="house-grid absolute left-0 w-full pointer-events-none"
        style={{ top: pctY(GRID_TOP) }}
      />

      {/* The house (without the portals and gate, which are drawn on top). */}
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
          height: pctH(p.h),
        };
        if (p.cart) {
          const hit = CHECKOUT_HIT;
          return (
            <button
              key={p.key}
              type="button"
              aria-label={p.label}
              onClick={openCart}
              className="house-checkout absolute block outline-none"
              style={{ left: pctX(hit.x), top: pctY(hit.y), width: pctX(hit.w), height: pctH(hit.h) }}
            >
              <Svg
                markup={p.svg}
                className="house-portal-art house-gate absolute"
                style={{
                  left: `${((p.x - hit.x) / hit.w) * 100}%`,
                  top: `${((p.y - hit.y) / hit.h) * 100}%`,
                  width: `${(p.w / hit.w) * 100}%`,
                  height: `${(p.h / hit.h) * 100}%`,
                }}
              />
              {totalQuantity > 0 && (
                <span className="absolute top-[18%] right-[8%] text-[10px] sm:text-xs tabular-nums text-black/70">
                  {totalQuantity}
                </span>
              )}
            </button>
          );
        }
        return (
          <Link
            key={p.key}
            to={`/collections/${p.handle}`}
            aria-label={p.label}
            className="house-portal absolute block origin-bottom transition-transform duration-300 ease-out hover:scale-150 focus-visible:scale-150 hover:z-30 outline-none"
            style={style}
          >
            <Svg markup={p.svg} className="house-portal-art" />
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
