import * as React from "react";
import { Link } from "react-router-dom";
import { ImageLightbox } from "@/components/ImageLightbox";
import { AddToCart } from "@/components/AddToCart";
import type { ShopProduct } from "@/lib/shopProducts";

// Shared product page for /in-stock/:handle and /trash/:handle.
export function ShopProductPage({
  product,
  backTo,
  backLabel,
}: {
  product: ShopProduct;
  backTo: string;
  backLabel: string;
}) {
  const images = product.images;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Start at the first image whenever we land on another product.
  React.useEffect(() => {
    setActiveIndex(0);
  }, [product.handle]);

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
      <Link
        to={backTo}
        className="inline-block text-black/70 hover:text-black text-sm mb-8 transition-colors"
      >
        ← {backLabel}
      </Link>

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
                    className="shrink-0 text-black/40 hover:text-black transition-colors text-3xl leading-none px-1"
                  >
                    ‹
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setLightboxIndex(activeIndex)}
                  className="w-full max-w-md aspect-square border border-black/15 overflow-hidden cursor-zoom-in"
                  aria-label="View image larger"
                >
                  <img src={current} alt={product.title} className="w-full h-full object-cover" />
                </button>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next image"
                    className="shrink-0 text-black/40 hover:text-black transition-colors text-3xl leading-none px-1"
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

        {/* Name, price, options, add to cart, and the product copy */}
        <div className="w-full md:w-2/5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-manrope font-light text-black">
              {product.title}
            </h1>
            {product.priceText && (
              <p className="text-black font-medium text-lg whitespace-nowrap">{product.priceText}</p>
            )}
          </div>

          <AddToCart product={product} />

          {product.description && (
            <p className="text-black/80 mt-2 whitespace-pre-line">{product.description}</p>
          )}

          {meta.length > 0 && (
            <dl className="text-black/70 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mt-2">
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
