import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import houseSvg from "@/assets/house2/house.svg?raw";
import gateSvg from "@/assets/house2/gate.svg?raw";
import apparelRaw from "@/assets/house/apparel.svg?raw";
import artworkRaw from "@/assets/house/artwork.svg?raw";
import secondhandRaw from "@/assets/house/secondhand.svg?raw";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { TowerGlobe } from "@/components/StuckholmGlobe";

// The shop header (every page except home): Julia's drawing of the house
// on her perspective grid (header.svg). The portals in the house are the
// menu: Apparel, Art work and 2nd hand open their collection and grow to
// 1.5x on hover; Check out opens the cart, and on hover its gate (the right
// part) rattles, as if someone were shaking it to get out. When you are
// inside a category that has sub-categories, they are tossed out in a loose
// scatter under its portal. The 3D globe on the left tower goes home.
//
// The house drawing has holes where the portals and the gate are; those are
// drawn on top as separate pieces (from the portal files, fitted to this
// drawing), so they can move. Everything is placed in the drawing's own
// units (its viewBox), so the header scales with the screen width.

const HOUSE_W = 3627.28;
const HOUSE_H = 1437.9;
// The header shows this band of the drawing: from a little above the globe
// (room for its letter ring) down to the bottom edge of the grid.
const CROP_TOP = -50;
const GRID_BOTTOM = 870;
const HEADER_H = GRID_BOTTOM - CROP_TOP;
// The house's ground line.
const GROUND_Y = 746;

// The portal files keep their own proportions; this drawing is slightly
// squashed in height, so they are stretched to their box.
const fit = (svg: string) => svg.replace("<svg ", '<svg preserveAspectRatio="none" ');
const apparelSvg = fit(apparelRaw);
const artworkSvg = fit(artworkRaw);
const secondhandSvg = fit(secondhandRaw);

type Portal = {
  key: string;
  label: string;
  svg?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  handle?: string; // collection it opens
  cart?: boolean; // opens the cart instead
};
const PORTALS: Portal[] = [
  { key: "apparel", label: "Apparel", svg: apparelSvg, x: 705.21, y: 405.92, w: 344.05, h: 359.99, handle: "apparel" },
  { key: "artwork", label: "Art work", svg: artworkSvg, x: 1234.01, y: 424.29, w: 344.05, h: 359.99, handle: "artwork" },
  { key: "secondhand", label: "2nd hand", svg: secondhandSvg, x: 1749.06, y: 399.69, w: 344.05, h: 359.99, handle: "2ndhand" },
  // Check out: the text stays in the house; only the gate is drawn on top.
  { key: "checkout", label: "Check out (cart)", x: 2991.62, y: 408.68, w: 418.66, h: 359.99, cart: true },
];

// The globe on the left tower, where the drawing had its flat globe picture.
// The box is roomy so the letter ring around the globe is never cut off.
const GLOBE_BOX = { x: 288, y: -45, size: 250 };

// Loose scatter for sub-categories under a portal: offsets from the portal's
// centre (x) and from the ground line (y), in drawing units, and a slight
// tilt. Fixed values, so the scatter looks random but doesn't jump around.
const SCATTER = [
  { dx: -165, dy: 38, rot: -7 },
  { dx: 55, dy: 30, rot: 5 },
  { dx: -45, dy: 95, rot: 3 },
  { dx: 175, dy: 88, rot: -4 },
  { dx: -205, dy: 100, rot: 8 },
];

const pctX = (v: number) => `${(v / HOUSE_W) * 100}%`;
// Vertical positions are given in drawing units from the top of the drawing.
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
      {/* The house on its grid (with holes where the portals and gate go). */}
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
          return (
            <button
              key={p.key}
              type="button"
              aria-label={p.label}
              onClick={openCart}
              className="house-checkout absolute block outline-none"
              style={style}
            >
              <Svg markup={gateSvg} className="house-portal-art house-gate" />
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
            <Svg markup={p.svg ?? ""} className="house-portal-art" />
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
