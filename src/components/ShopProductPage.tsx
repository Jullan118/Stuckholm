import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ImageLightbox } from "@/components/ImageLightbox";
import { AddToCart } from "@/components/AddToCart";
import type { ShopProduct } from "@/lib/shopProducts";

// Shared product page for /in-stock/:handle and /trash/:handle. The back link
// returns to the exact page you came from; backTo is only used if there is no
// earlier page in this visit (for example when the product was opened directly).
export function ShopProductPage({
  product,
  backTo,
  backLabel,
}: {
  product: ShopProduct;
  backTo: string;
  backLabel: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const images = product.images;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Start at the first image whenever we land on another product.
  React.useEffect(() => {
    setActiveIndex(0);
  }, [product.handle]);

  // Picking a colour (or size) in the dropdown shows that variant's picture,
  // if the variant has one in Shopify.
  function showVariantImage(variantId: string | null) {
    if (!variantId) return;
    const url = product.variantImages[variantId];
    const index = url ? images.indexOf(url) : -1;
    if (index >= 0) setActiveIndex(index);
  }

  const current = images[activeIndex] ?? images[0];

  function goPrev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }
  function goNext() {
    setActiveIndex((i) => (i + 1) % images.length);
  }

  const meta: [string, string][] = [];
  if (product.isTrash) {
    if (product.vendor) meta.push(["Seller", product.vendor]);
    if (product.brand) meta.push(["Brand", product.brand]);
    if (product.colour) meta.push(["Colour", product.colour]);
    if (product.condition) meta.push(["Condition", product.condition]);
  }

  return (
    <div className="relative z-10 w-full max-w-5xl px-4 sm:px-8 pt-28 pb-16">
      <button
        type="button"
        onClick={() => {
          // location.key is "default" when the product was opened straight from
          // a link, with no earlier page in this visit.
          if (location.key !== "default") navigate(-1);
          else navigate(backTo, { replace: true });
        }}
        className="inline-block text-black/70 hover:text-black text-xs mb-8 transition-colors"
      >
        ← {backLabel}
      </button>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Image carousel: one big image with prev/next arrows, thumbnails below */}
        <div className="w-full md:w-3/5 flex-shrink-0">
          {images.length > 0 ? (
            <>
              <div className="flex items-center justify-center gap-3">
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous image"
                    className="shrink-0 text-black/40 hover:text-black transition-colors text-xl leading-none px-1"
                  >
                    ‹
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setLightboxIndex(activeIndex)}
                  className="w-full cursor-zoom-in"
                  aria-label="View image larger"
                >
                  <img src={current} alt={product.title} className="w-full h-auto block" />
                </button>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next image"
                    className="shrink-0 text-black/40 hover:text-black transition-colors text-xl leading-none px-1"
                  >
                    ›
                  </button>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4 max-w-md mx-auto">
                  {images.map((src, i) => (
                    <button
                      type="button"
                      key={src + i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-16 h-16 overflow-hidden border transition-colors ${
                        i === activeIndex ? "border-black" : "border-black/15 hover:border-black/40"
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-md aspect-square mx-auto flex items-center justify-center text-black/60 border border-black/15">
              Image
            </div>
          )}
        </div>

        {lightboxIndex !== null && (
          <ImageLightbox
            images={images}
            index={lightboxIndex}
            alt={product.title}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}

        {/* Name, price, sizes, add to cart, then the product copy (left-aligned) */}
        <div className="w-full md:w-2/5 flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg sm:text-xl font-manrope font-bold text-black">
              {product.title}
            </h1>
            {product.priceText && (
              <p className="text-black text-sm whitespace-nowrap">{product.priceText}</p>
            )}
          </div>

          <AddToCart product={product} onVariantChange={showVariantImage} />

          {product.description && (
            <p className="text-black/80 mt-4 whitespace-pre-line">{product.description}</p>
          )}

          {meta.length > 0 && (
            <dl className="text-black/70 text-xs flex flex-col items-start gap-1 mt-2">
              {meta.map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt className="text-black/50">{label}</dt>
                  <dd>{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
