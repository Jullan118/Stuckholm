import { Link } from "react-router-dom";
import type { ShopProduct } from "@/lib/shopProducts";
import { isSoldOut } from "@/lib/commerce";

// Edge-to-edge grid of product images with name and price under each.
// Sold-out items get a small "SOLD OUT" tag centred near the bottom of the image.
export function ProductGrid({ products }: { products: ShopProduct[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="border-r border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <Link to={product.href}>
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f2f2f2]">
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
