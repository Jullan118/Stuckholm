import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import houseSvg from "@/assets/house5/house.svg?raw";
import gridSvg from "@/assets/house5/grid.svg?raw";
import firsthandSvg from "@/assets/house5/firsthand.svg?raw";
import secondhandSvg from "@/assets/house5/secondhand.svg?raw";
import artworkSvg from "@/assets/house5/artwork.svg?raw";
import uc1Svg from "@/assets/house5/uc1.svg?raw";
import uc2Svg from "@/assets/house5/uc2.svg?raw";
import debtSvg from "@/assets/house5/debt.svg?raw";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { TowerGlobe } from "@/components/StuckholmGlobe";

// The shop header (every page except home), from Julia's sketch of 25 Nov.
// Her grid (nätet-2.svg: horizon, perspective floor) fills the width, and her
// house (huset.svg, 25 Nov) stands far forward on the floor, in the middle,
// its tall tower reaching up past the horizon. The 3D globe floats in the
// sky above it and goes home. The portals are the menu: 1st hand, 2nd hand
// and Art work open their collection and grow to 1.5x on hover; the two
// "under construction" portals rock on hover (and grow only a little); "settle your debt" (with the
// basket) opens the cart and rattles on hover.
//
// When you are in a category with sub-categories, a strip folds out from the
// floor's front edge towards you: the grid carries on down the front in a
// row of cells, one sub-category in each. The product list's column lines
// carry on below it.
//
// Everything is placed in the grid's units (its viewBox), so the header
// scales with the width. The house is placed in the grid with HOUSE_X/Y and
// HOUSE_S; the portals were lifted out of the house drawing as separate
// pieces (in house units), so they can move.

// The grid drawing: its width, the horizon, and the floor's front edge
// (FLOOR_Y), where the fold-out strip starts.
const GRID_W = 1890.86;
const HORIZON_Y = 392;
const FLOOR_Y = 777;
// The fold-out strip, as in Julia's sketch: three lines across (777, 833 and
// 895, two rows) and the floor's lines folding straight down at its front
// edge. Only the three column lines run on through the strip and down
// between the products (STRIP_LONG); a few others drip down a short way and
// stop at different heights (STRIP_SHORT, from her grid drawing).
const STRIP_ROWS = [777, 833, 895];
const STRIP_H = STRIP_ROWS[STRIP_ROWS.length - 1] - FLOOR_Y;
const STRIP_LONG = [489.63, 937.93, 1388.43];
const STRIP_SHORT: [number, number][] = [
  [66, 868],
  [275, 883],
  [720, 860],
];
// Where the sub-category names stand in the first row, from the left: the
// middle of each slot between these points.
const STRIP_SLOTS = [66, 275, 489.63, 720, 937.93, 1163, 1388.43, 1612, 1836];
// The house drawing, and where it stands: its ground line (HOUSE_GROUND,
// house units) on the floor's second row from the front (GROUND_ROW), its tower's left edge at about a
// quarter of the width.
const HOUSE_W = 1284.75;
const HOUSE_S = 0.9826;
const HOUSE_GROUND = 739;
const HOUSE_X = 296.6;
// The floor row the house stands on (the second row from the front).
const GROUND_ROW = 717;
const HOUSE_Y = GROUND_ROW - HOUSE_GROUND * HOUSE_S;
// The header shows the grid from just above the tower's crown down to the
// floor's front edge.
const CROP_TOP = -20;
const HEADER_H = FLOOR_Y - CROP_TOP;

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
  construction?: boolean; // not a link; rocks on hover
};
// Boxes in house units; they match the viewBox of each piece.
const PORTALS: Portal[] = [
  { key: "firsthand", label: "1st hand", svg: firsthandSvg, x: 405, y: 555, w: 115, h: 197, handle: "apparel" },
  { key: "secondhand", label: "2nd hand", svg: secondhandSvg, x: 560, y: 555, w: 105, h: 197, handle: "2ndhand" },
  { key: "artwork", label: "Art work", svg: artworkSvg, x: 700, y: 545, w: 103, h: 207, handle: "artwork" },
  { key: "uc1", label: "Under construction", svg: uc1Svg, x: 823, y: 540, w: 95, h: 212, construction: true },
  { key: "uc2", label: "Under construction", svg: uc2Svg, x: 932, y: 540, w: 98, h: 212, construction: true },
  { key: "debt", label: "Settle your debt (cart)", svg: debtSvg, x: 1040, y: 590, w: 100, h: 162, cart: true },
];

// The globe floating in the sky above the house, in grid units. The box is
// roomy so the letter ring is never cut off.
const GLOBE_BOX = { x: 790, y: -85, size: 385 };

// The stars from the home page (dots and eight-point sparkles), faint, in the
// sky above the horizon. A seeded scatter, so they are the same on every visit.
const SKY_DOTS = 60;
const SKY_SPARKLES = 10;
const SKY_OPACITY = 0.6;

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
  const stripOpen = subs.length > 0;
  const menuPortals = PORTALS.filter((p) => !p.construction);

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
        {menuPortals.map((p) => {
          const isCurrent = currentCategory?.handle === p.handle;
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
                <span className="house-gate block w-full">{art}</span>
                {totalQuantity > 0 && (
                  <span className="absolute top-0 right-0 font-cormorant text-xs leading-none">{totalQuantity}</span>
                )}
              </button>
            );
          }
          return (
            <Link
              key={p.key}
              to={`/collections/${p.handle}`}
              aria-label={p.label}
              aria-current={isCurrent ? "page" : undefined}
              className="relative flex-1 block outline-none"
            >
              {art}
            </Link>
          );
        })}
      </div>
    </nav>

    <header className="house-header hidden sm:block relative z-20 w-full select-none">
      <div className="relative w-full" style={{ aspectRatio: `${GRID_W} / ${HEADER_H}` }}>
        {/* Faint stars from the home page, in the sky. */}
        <HeaderSky />

        {/* The grid: horizon and floor (with its own stars). */}
        <Svg markup={gridSvg} className="house-grid absolute inset-0 pointer-events-none" />

        {/* The house (without the portals, which are drawn on top). */}
        <Svg
          markup={houseSvg}
          className="house-svg absolute pointer-events-none"
          style={{ left: pctX(hx(0)), top: pctY(hy(0)), width: pctX(HOUSE_W * HOUSE_S) }}
        />

        {/* The 3D globe floating above the house: click to go home. */}
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
            left: pctX(hx(p.x)),
            top: pctY(hy(p.y)),
            width: pctX(p.w * HOUSE_S),
            height: pctH(p.h * HOUSE_S),
          };
          if (p.construction) {
            return (
              <div
                key={p.key}
                aria-hidden="true"
                className="house-construction absolute origin-bottom transition-transform duration-300 ease-out hover:scale-110 hover:z-30"
                style={style}
              >
                <Svg markup={p.svg} className="house-portal-art house-construction-arch absolute inset-0" />
              </div>
            );
          }
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
                <Svg markup={p.svg} className="house-portal-art house-gate absolute inset-0" />
                {totalQuantity > 0 && (
                  <span className="absolute top-[22%] left-1/2 -translate-x-1/2 font-cormorant text-xs sm:text-sm tabular-nums">
                    {totalQuantity}
                  </span>
                )}
              </button>
            );
          }
          // In this portal's category: it stays big.
          const isCurrent = currentCategory?.handle === p.handle;
          return (
            <Link
              key={p.key}
              to={`/collections/${p.handle}`}
              aria-label={p.label}
              aria-current={isCurrent ? "page" : undefined}
              className={`house-portal absolute block origin-bottom transition-transform duration-300 ease-out hover:scale-150 focus-visible:scale-150 hover:z-30 outline-none ${isCurrent ? "scale-150 z-30" : ""}`}
              style={style}
            >
              <Svg markup={p.svg} className="house-portal-art" />
            </Link>
          );
        })}
      </div>

      {/* The fold-out strip: in a category with sub-categories, the grid
          folds down from the floor's front edge towards you, with the
          sub-categories in a row in its first band. */}
      <div
        className="relative w-full transition-[padding] duration-500 ease-out"
        style={{ paddingTop: stripOpen ? `${(STRIP_H / GRID_W) * 100}%` : 0 }}
      >
        <div
          className={`house-strip absolute inset-0 origin-top transition-[transform,opacity] duration-500 ease-out ${stripOpen ? "house-strip-open" : ""}`}
          aria-hidden={!stripOpen}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 ${FLOOR_Y} ${GRID_W} ${STRIP_H}`}
            preserveAspectRatio="none"
          >
            <g stroke="#000" strokeOpacity={0.2} strokeWidth={1} vectorEffect="non-scaling-stroke">
              {STRIP_ROWS.map((y) => (
                <line key={y} x1={0} x2={GRID_W} y1={y} y2={y} vectorEffect="non-scaling-stroke" />
              ))}
              {STRIP_LONG.map((x) => (
                <line key={x} x1={x} x2={x} y1={FLOOR_Y} y2={STRIP_ROWS[2]} vectorEffect="non-scaling-stroke" />
              ))}
              {STRIP_SHORT.map(([x, y2]) => (
                <line key={x} x1={x} x2={x} y1={FLOOR_Y} y2={y2} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          </svg>
          {subs.map((child, i) => {
            const left = STRIP_SLOTS[i];
            const right = STRIP_SLOTS[i + 1] ?? GRID_W;
            if (left === undefined) return null;
            const active = routeHandle === child.handle;
            return (
              <Link
                key={child.handle}
                to={`/collections/${child.handle}`}
                aria-current={active ? "page" : undefined}
                tabIndex={stripOpen ? 0 : -1}
                className="house-sub absolute flex items-center justify-center font-cormorant text-black leading-none hover:opacity-60 transition-opacity"
                style={{
                  left: pctX(left),
                  width: pctX(right - left),
                  top: 0,
                  height: `${((STRIP_ROWS[1] - FLOOR_Y) / STRIP_H) * 100}%`,
                }}
              >
                <span className={active ? "underline underline-offset-4 decoration-1" : ""}>{child.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>

    {/* Phones: the sub-categories in a row under the portals. */}
    {subs.length > 0 && (
      <nav className="sm:hidden relative z-20 w-full flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pt-3 pb-4">
        {subs.map((child) => {
          const active = routeHandle === child.handle;
          return (
            <Link
              key={child.handle}
              to={`/collections/${child.handle}`}
              aria-current={active ? "page" : undefined}
              className={`font-cormorant text-black text-lg leading-none ${active ? "underline underline-offset-4" : ""}`}
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
