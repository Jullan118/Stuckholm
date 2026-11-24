import { Link, useLocation } from "react-router-dom";
import type { ShopProduct } from "@/lib/shopProducts";
import { isSoldOut } from "@/lib/commerce";

// Grid of product images: two across on phones, four on wider screens.
// Under each image, on separate lines: name, colour and price. The colour
// comes from the product's "colour:..." tag in Shopify and is left out when
// there is no such tag.
// Sold-out items get a "Sold out" tag centred near the bottom of the image.
//
// The columns sit between the header grid's lines, continued straight down
// the page: every other line of the grid drawing meets the bottom edge at
// these points (percent of the width), so four columns fit exactly between
// them (two on phones, using every fourth line).
const LINES_WIDE = [2.35, 26.42, 50.01, 73.72, 97.38];
const LINES_NARROW = [2.35, 50.01, 97.38];

export function ProductGrid({ products }: { products: ShopProduct[] }) {
  // Products open as a panel over this list (see ProductPanel).
  const location = useLocation();
  return (
    <div className="relative w-full">
      {LINES_WIDE.map((x) => (
        <span
          key={x}
          aria-hidden="true"
          className={`grid-continue-line ${LINES_NARROW.includes(x) ? "" : "hidden md:block"}`}
          style={{ left: `${x}%` }}
        />
      ))}
      <div className="products-on-grid">
      {products.map((product) => (
        // Like Acne Studios: the whole cell (grid line to grid line) is one
        // link; the picture sits with a wide white margin inside it, name and
        // price run close to the cell's edges, and on hover the cell gets a
        // thin black frame. A faint line under each cell separates the rows,
        // like the grid lines between the columns.
        <Link
          key={product.id}
          to={product.href}
          state={{ background: location }}
          className="group relative block pb-3 sm:pb-4 border-b-[0.75px] border-black/20 outline-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-white p-[5%]">
            {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/60">Image</div>
            )}
            {isSoldOut(product) && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1.5 text-sm uppercase tracking-wide text-[#8b2c35]">
                Sold out
              </span>
            )}
          </div>
          {/* Name on the left and price on the right, on one line; the price
              in light grey (RGB 204, 204, 204). Colour, if any, under the name. */}
          <span className="block px-3 sm:px-4 text-base sm:text-xl leading-snug text-black">
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0">{product.title}</span>
              <span className="shrink-0 whitespace-nowrap text-[rgb(204,204,204)]">{product.priceText}</span>
            </span>
            {product.colour && <span className="block">{product.colour}</span>}
          </span>
          {/* Hover frame, on top of the picture. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 border border-black opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </Link>
      ))}
      </div>
    </div>
  );
}
