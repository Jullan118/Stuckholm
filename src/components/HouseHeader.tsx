import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import houseSvg from "@/assets/house4/house.svg?raw";
import gridSvg from "@/assets/house4/grid.svg?raw";
import gateSvg from "@/assets/house4/gate.svg?raw";
import apparelSvg from "@/assets/house4/apparel.svg?raw";
import artworkSvg from "@/assets/house4/artwork.svg?raw";
import secondhandSvg from "@/assets/house4/secondhand.svg?raw";
import constructionSvg from "@/assets/house4/construction.svg?raw";
import banner1Svg from "@/assets/house4/banner1.svg?raw";
import banner2Svg from "@/assets/house4/banner2.svg?raw";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { TowerGlobe } from "@/components/StuckholmGlobe";

// The shop header (every page except home): Julia's Artboard 6. Her grid
// (rutnätet.svg: sky with stars, horizon, perspective floor) fills the
// width, and her house (HUSET.svg) stands on it, its ground line on one of
// the floor's rows. The floor's front edge is the bottom of the header, where
// the product list's column lines carry on. The portals in the house are the
// menu: Apparel, Art work and 2nd hand open their collection and grow to
// 1.5x on hover; Check out (the "cash out" text and the gate) opens the cart,
// and on hover the gate rattles, as if someone were shaking it to get out.
// When you are inside a category that has sub-categories, they are tossed
// out in a loose scatter under its portal. The 3D globe on the left tower
// goes home.
//
// Everything is placed in the grid's units (its viewBox), so the header
// scales with the width. The house is placed in the grid with HOUSE_X/Y and
// HOUSE_S; the portals and the gate were lifted out of the house drawing as
// separate pieces (in house units), so they can move.

// The grid drawing: its width, and its height down to the floor's front edge.
const GRID_W = 1900.34;
const GRID_H = 600;
// The house drawing, and where it stands in the grid: its ground line
// (HOUSE_GROUND, house units) lies on the floor row at GROUND_ROW (grid units).
const HOUSE_W = 2080.97;
const HOUSE_H = 435.65;
const HOUSE_S = 1.04;
const HOUSE_GROUND = 367;
const GROUND_ROW = 389;
const HOUSE_X = -107;
const HOUSE_Y = GROUND_ROW - HOUSE_GROUND * HOUSE_S;
// The header shows the grid from a little above the globe down to the floor's
// front edge.
const CROP_TOP = -63;
const HEADER_H = GRID_H - CROP_TOP;

// House units to grid units.
const hx = (v: number) => HOUSE_X + v * HOUSE_S;
const hy = (v: number) => HOUSE_Y + v * HOUSE_S;

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
// Boxes in house units; they match the viewBox of each piece.
const PORTALS: Portal[] = [
  { key: "apparel", label: "Apparel", svg: apparelSvg, x: 425, y: 215, w: 165, h: 165, handle: "apparel" },
  { key: "artwork", label: "Art work", svg: artworkSvg, x: 705, y: 220, w: 170, h: 160, handle: "artwork" },
  { key: "secondhand", label: "2nd hand", svg: secondhandSvg, x: 1000, y: 210, w: 165, h: 170, handle: "2ndhand" },
  // Check out: the "cash out" text stays in the house; the clickable area
  // covers text and gate, and only the gate is a separate (rattling) piece.
  { key: "checkout", label: "Check out (cart)", svg: gateSvg, x: 1800, y: 220, w: 125, h: 160, cart: true },
];
// Port 4, "under construction" (house units). Not a link; on hover the portal
// rocks a little and its two banners sway, each on its own.
const CONSTRUCTION = { x: 1215, y: 222, w: 185, h: 158 };
// While you are in a category, its portal stays big and the other portals
// fade to this opacity.
const OTHER_PORTAL_OPACITY = 0.5;

// Clickable area for Check out (text + gate), house units.
const CHECKOUT_HIT = { x: 1720, y: 220, w: 205, h: 160 };

// The globe resting on the left tower's slanted top, in grid units. The box
// is roomy so the letter ring around the globe is never cut off (its empty
// top may stick out above the header).
const GLOBE_BOX = { x: 74, y: -175, size: 402 };

// Loose scatter for sub-categories under a portal: offsets from the portal's
// centre (x) and from the ground line (y), in grid units, and a slight
// tilt. Fixed values, so the scatter looks random but doesn't jump around.
const SCATTER = [
  { dx: -150, dy: 34, rot: -7 },
  { dx: 70, dy: 30, rot: 5 },
  { dx: -50, dy: 100, rot: 3 },
  { dx: 175, dy: 92, rot: -4 },
  { dx: -205, dy: 118, rot: 8 },
];

// The stars from the home page (dots and eight-point sparkles), faint, in the
// sky above the horizon. A seeded scatter, so they are the same on every visit.
const HORIZON_Y = 214; // the grid's horizon line, grid units
const SKY_DOTS = 60;
const SKY_SPARKLES = 10;
const SKY_OPACITY = 0.3;

function seeded(seed: number) {
  let v = seed;
  return () => {
    v = (v * 1664525 + 1013904223) % 4294967296;
    return v / 4294967296;
  };
}

// Same shape as the home page sparkles: eight tips (long and short in turn),
// joined by curves pinched towards the centre.
function sparklePath(size: number, pinch = 0.12) {
  const tips = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
    const l = size * (i % 2 === 0 ? 1 : 0.45);
    return [Math.cos(a) * l, Math.sin(a) * l];
  });
  let d = `M${tips[0][0].toFixed(2)},${tips[0][1].toFixed(2)}`;
  for (let i = 0; i < 8; i++) {
    const a = tips[i];
    const b = tips[(i + 1) % 8];
    const cx = (a[0] + b[0]) * 0.5 * pinch;
    const cy = (a[1] + b[1]) * 0.5 * pinch;
    d += `Q${cx.toFixed(2)},${cy.toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
  }
  return d + "Z";
}

function HeaderSky() {
  const { dots, sparkles } = React.useMemo(() => {
    const rand = seeded(20261124);
    const top = CROP_TOP + 4;
    const span = HORIZON_Y - 8 - top;
    return {
      dots: Array.from({ length: SKY_DOTS }, () => ({
        x: rand() * GRID_W,
        y: top + rand() * span,
        r: 0.9 + rand() * 0.9,
      })),
      sparkles: Array.from({ length: SKY_SPARKLES }, (_, i) => ({
        x: rand() * GRID_W,
        y: top + rand() * span,
        d: sparklePath(i < 6 ? 6 + rand() * 4 : 3.5 + rand() * 2.5),
      })),
    };
  }, []);
  return (
    <svg
      aria-hidden="true"
      className="house-sky absolute left-0 top-0 w-full pointer-events-none"
      viewBox={`0 ${CROP_TOP} ${GRID_W} ${HORIZON_Y - CROP_TOP}`}
      style={{ opacity: SKY_OPACITY }}
    >
      {dots.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#191919" />
      ))}
      {sparkles.map((s, i) => (
        <path
          key={i}
          d={s.d}
          transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`}
          fill="none"
          stroke="#191919"
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function Svg({ markup, className, style }: { markup: string; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: markup }} />;
}

const pctX = (v: number) => `${(v / GRID_W) * 100}%`;
// Vertical positions are given in grid units from the top of the grid.
const pctY = (v: number) => `${((v - CROP_TOP) / HEADER_H) * 100}%`;
const pctH = (v: number) => `${(v / HEADER_H) * 100}%`;

export function HouseHeader({ pathname }: { pathname: string }) {
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
    {/* Phones: the whole house would be too small to read, so only the
        globe and the portals stand in a row on a ground line. */}
    <nav className="house-header sm:hidden relative z-20 w-full select-none px-3 pt-4">
      <div className="flex items-end gap-1 border-b-[0.75px] border-black/70 pb-px">
        <button
          type="button"
          aria-label="Stuck in Stuckholm, home"
          onClick={() => navigate("/")}
          className="relative flex-1 aspect-square cursor-pointer"
        >
          <span className="absolute -left-1/4 -right-1/4 bottom-0 aspect-square">
            <TowerGlobe />
          </span>
        </button>
        {PORTALS.map((p) => {
          const isCurrent = currentCategory?.handle === p.handle;
          const faded = !!currentCategory && !isCurrent && !p.cart;
          const art = (
            <Svg
              markup={p.svg}
              className="house-portal-art block w-full"
              style={{ aspectRatio: `${p.w} / ${p.h}` }}
            />
          );
          if (p.cart) {
            return (
              <button
                key={p.key}
                type="button"
                aria-label={p.label}
                onClick={openCart}
                className="house-checkout relative flex-1 flex flex-col items-center outline-none"
              >
                <span className="font-cormorant text-sm leading-none mb-1">
                  cash out{totalQuantity > 0 ? ` (${totalQuantity})` : ""}
                </span>
                <span className="house-gate block w-[80%]">{art}</span>
              </button>
            );
          }
          return (
            <Link
              key={p.key}
              to={`/collections/${p.handle}`}
              aria-label={p.label}
              aria-current={isCurrent ? "page" : undefined}
              className="relative flex-1 block transition-opacity duration-300 outline-none"
              style={{ opacity: faded ? OTHER_PORTAL_OPACITY : 1 }}
            >
              {art}
            </Link>
          );
        })}
      </div>
    </nav>

    <header
      className="house-header hidden sm:block relative z-20 w-full select-none"
      style={{ aspectRatio: `${GRID_W} / ${HEADER_H}` }}
    >
      {/* Faint stars from the home page, in the sky. */}
      <HeaderSky />

      {/* The grid: sky with stars, horizon and floor. */}
      <Svg
        markup={gridSvg}
        className="house-grid absolute left-0 w-full pointer-events-none"
        style={{ top: pctY(0) }}
      />

      {/* The house (without the portals and gate, which are drawn on top). */}
      <Svg
        markup={houseSvg}
        className="house-svg absolute pointer-events-none"
        style={{ left: pctX(hx(0)), top: pctY(hy(0)), width: pctX(HOUSE_W * HOUSE_S) }}
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

      {/* Port 4, under construction: rocks and its banners sway on hover. */}
      <div
        aria-hidden="true"
        className="house-construction absolute transition-opacity duration-300"
        style={{
          left: pctX(hx(CONSTRUCTION.x)),
          top: pctY(hy(CONSTRUCTION.y)),
          width: pctX(CONSTRUCTION.w * HOUSE_S),
          height: pctH(CONSTRUCTION.h * HOUSE_S),
          opacity: currentCategory ? OTHER_PORTAL_OPACITY : 1,
        }}
      >
        <Svg markup={constructionSvg} className="house-portal-art house-construction-arch absolute inset-0" />
        <Svg markup={banner1Svg} className="house-portal-art house-banner1 absolute inset-0" />
        <Svg markup={banner2Svg} className="house-portal-art house-banner2 absolute inset-0" />
      </div>

      {/* The portals. */}
      {PORTALS.map((p) => {
        const style: React.CSSProperties = {
          left: pctX(hx(p.x)),
          top: pctY(hy(p.y)),
          width: pctX(p.w * HOUSE_S),
          height: pctH(p.h * HOUSE_S),
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
              style={{ left: pctX(hx(hit.x)), top: pctY(hy(hit.y)), width: pctX(hit.w * HOUSE_S), height: pctH(hit.h * HOUSE_S) }}
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
        // In this portal's category: it stays big. In another: it fades.
        const isCurrent = currentCategory?.handle === p.handle;
        const faded = !!currentCategory && !isCurrent;
        return (
          <Link
            key={p.key}
            to={`/collections/${p.handle}`}
            aria-label={p.label}
            aria-current={isCurrent ? "page" : undefined}
            className={`house-portal absolute block origin-bottom transition-[transform,opacity] duration-300 ease-out hover:scale-150 focus-visible:scale-150 hover:z-30 hover:!opacity-100 outline-none ${isCurrent ? "scale-150 z-30" : ""}`}
            style={{ ...style, opacity: faded ? OTHER_PORTAL_OPACITY : 1 }}
          >
            <Svg markup={p.svg} className="house-portal-art" />
          </Link>
        );
      })}

      {/* Sub-categories, tossed out under the current category's portal. */}
      {PORTALS.map((p) => {
        const cat = CATEGORIES.find((c) => c.handle === p.handle);
        if (!cat?.children || currentCategory?.handle !== cat.handle) return null;
        const centre = hx(p.x + p.w / 2);
        return cat.children.map((child, i) => {
          const s = SCATTER[i % SCATTER.length];
          const active = routeHandle === child.handle;
          return (
            <Link
              key={child.handle}
              to={`/collections/${child.handle}`}
              aria-current={active ? "page" : undefined}
              className={`house-sub absolute hidden sm:block whitespace-nowrap font-cormorant text-black leading-none animate-blur-fade-in hover:opacity-60 transition-opacity ${active ? "underline underline-offset-4" : ""}`}
              style={{
                left: pctX(centre + s.dx),
                top: pctY(GROUND_ROW + s.dy),
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
      <nav className="sm:hidden relative z-20 w-full flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pt-3 pb-4">
        {subs.map((child, i) => {
          const active = routeHandle === child.handle;
          return (
            <Link
              key={child.handle}
              to={`/collections/${child.handle}`}
              aria-current={active ? "page" : undefined}
              className={`font-cormorant text-black text-lg leading-none ${active ? "underline underline-offset-4" : ""}`}
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
