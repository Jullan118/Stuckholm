import { Link } from "react-router-dom";
import type { ShopProduct } from "@/lib/shopProducts";
import { isSoldOut } from "@/lib/commerce";

// Grid of product images with name and price under each.
// Sold-out items get a "Sold out" tag centred near the bottom of the image.
// Default: edge-to-edge, with hairlines between the products.
// `onHeaderGrid`: the columns sit between the header grid's lines continued
// down the page (drawn by GridLines), so only the line under each product is
// drawn here.
export function ProductGrid({
  products,
  onHeaderGrid = false,
}: {
  products: ShopProduct[];
  onHeaderGrid?: boolean;
}) {
  return (
    <div className={onHeaderGrid ? "products-on-grid" : "grid grid-cols-2 sm:grid-cols-4"}>
      {products.map((product) => (
        <div
          key={product.id}
          className={onHeaderGrid ? "border-b" : "border-r border-b"}
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <Link to={product.href}>
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/60">Image</div>
              )}
              {isSoldOut(product) && (
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1.5 font-cormorant text-sm uppercase tracking-wide text-[#8b2c35]">
                  Sold out
                </span>
              )}
            </div>
          </Link>
          <div className="flex items-baseline justify-between font-manrope font-light px-4 py-3">
            <Link to={product.href}>
              <span className="text-black">{product.title}</span>
            </Link>
            <span style={{ color: "#999999" }}>{product.priceText}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
