import { Link } from "react-router-dom";
import type { ShopProduct } from "@/lib/shopProducts";
import { isSoldOut } from "@/lib/commerce";

// Grid of product images: two across on phones, four on wider screens.
// Under each image, on separate lines: name, colour and price. The colour
// comes from the product's "colour:..." tag in Shopify and is left out when
// there is no such tag.
// Sold-out items get a "Sold out" tag centred near the bottom of the image.
export function ProductGrid({ products }: { products: ShopProduct[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-10 gap-y-12 sm:gap-y-16 px-4 sm:px-8">
      {products.map((product) => (
        <div key={product.id}>
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
          <Link to={product.href} className="block pt-4 sm:pt-6 text-base sm:text-xl leading-snug lowercase text-black">
            <span className="block">{product.title}</span>
            {product.colour && <span className="block">{product.colour}</span>}
            <span className="block">{product.priceText}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
