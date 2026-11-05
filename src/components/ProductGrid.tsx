import { Link } from "react-router-dom";
import type { ShopProduct } from "@/lib/shopProducts";
import { isSoldOut } from "@/lib/commerce";
// Imported with ?inline so the image is embedded in the theme bundle; the
// Shopify theme has no public/ folder to serve it from.
import soldOutShield from "@/assets/sold-out-shield.png?inline";

// Edge-to-edge grid of product images with name and price under each.
// Sold-out items get a hand-drawn "Sold Out" shield in the top-right corner of the image.
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
                <img
                  src={soldOutShield}
                  alt="Sold out"
                  className="absolute top-3 right-3 w-14 sm:w-20 h-auto pointer-events-none"
                />
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
