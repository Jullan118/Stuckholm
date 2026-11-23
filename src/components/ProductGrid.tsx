import { Link } from "react-router-dom";
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
const LINES_WIDE = [2.35, 26.25, 49.78, 73.38, 97.38];
const LINES_NARROW = [2.35, 49.78, 97.38];

export function ProductGrid({ products }: { products: ShopProduct[] }) {
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
        <div key={product.id} className="px-[1.2vw] md:px-[1.4vw]">
          <Link to={product.href}>
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/60">Image</div>
              )}
              {isSoldOut(product) && (
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1.5 text-sm uppercase tracking-wide text-[#8b2c35]">
                  Sold out
                </span>
              )}
            </div>
          </Link>
          {/* Name on the left and price on the right, on one line; the price
              in light grey (RGB 204, 204, 204). Colour, if any, under the name. */}
          <Link to={product.href} className="block pt-4 sm:pt-6 text-base sm:text-xl leading-snug text-black">
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0">{product.title}</span>
              <span className="shrink-0 whitespace-nowrap text-[rgb(204,204,204)]">{product.priceText}</span>
            </span>
            {product.colour && <span className="block">{product.colour}</span>}
          </Link>
        </div>
      ))}
      </div>
    </div>
  );
}
