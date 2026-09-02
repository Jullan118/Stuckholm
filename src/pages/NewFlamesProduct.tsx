import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { flameFromRow, formatColorCount, type Flame } from "@/lib/flames";
import { NEW_FLAMES_PRODUCTS } from "@/data/newFlamesProducts";
import { ImageLightbox } from "@/components/ImageLightbox";

export function NewFlamesProduct() {
  const { slug } = useParams();
  const fallback = NEW_FLAMES_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const [product, setProduct] = React.useState<Flame | null>(fallback);
  const [notFound, setNotFound] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Which image the big frame + thumbnail strip currently show.
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState("");
  const [sizeError, setSizeError] = React.useState(false);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase || !slug) return;
    let cancelled = false;

    supabase
      .from("flames")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          setProduct(flameFromRow(data));
        } else if (!fallback) {
          setNotFound(true);
        }
      });

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUserId(data.session?.user.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setUserId(s?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [slug]);

  // Reset the carousel + size choice whenever we land on a different product.
  React.useEffect(() => {
    setActiveIndex(0);
    setSelectedSize("");
    setSizeError(false);
  }, [product?.slug]);

  if (notFound || !product) {
    return (
      <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-skarp-thin text-black mb-6">
          Not found
        </h1>
        <Link to="/off-the-shelf" className="text-black underline">
          Back to Off the shelf
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  const current = images[activeIndex] ?? images[0];

  function goPrev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }
  function goNext() {
    setActiveIndex((i) => (i + 1) % images.length);
  }

  function handleAddToCart() {
    if (product && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const sizeNote = selectedSize ? ` (size ${selectedSize})` : "";
    const subject = `Order: ${product?.name}${sizeNote}`;
    window.location.href = `mailto:hello.stuckholm@gmail.com?subject=${encodeURIComponent(subject)}`;
  }

  return (
    <div className="relative z-10 w-full max-w-5xl px-6 pt-28 pb-16">
      <Link
        to="/off-the-shelf"
        className="inline-block text-black/70 hover:text-black text-sm mb-8 transition-colors"
      >
        ← Off the shelf
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
                  <img
                    src={current}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
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
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-16 h-16 overflow-hidden border transition-colors ${
                        i === activeIndex
                          ? "border-black"
                          : "border-black/15 hover:border-black/40"
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
            alt={product.name}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}

        {/* Name, price, size, add to cart, and all the product copy */}
        <div className="w-full md:w-2/5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-skarp-thin text-black">
              {product.name}
            </h1>
            <p className="text-black font-medium text-lg whitespace-nowrap">
              {product.price}
            </p>
          </div>
          {product.colorCount !== null && (
            <p style={{ color: "#d7d7d7" }} className="-mt-2">
              {formatColorCount(product.colorCount)}
            </p>
          )}

          {product.sizes.length > 0 && (
            <div>
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setSizeError(false);
                }}
                className="border border-black/30 px-3 py-2 w-full max-w-[10rem]"
              >
                <option value="" disabled>
                  Size
                </option>
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              {sizeError && (
                <p className="text-[#d51f26] text-sm mt-1">Pick a size first.</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="border border-black text-black px-6 py-2 w-fit hover:bg-black hover:text-white transition-colors"
          >
            Add to cart
          </button>

          {product.details && (
            <p className="text-black/80 mt-2">{product.details}</p>
          )}

          {product.productDetails.length > 0 && (
            <div>
              <p className="text-black font-medium">Product details</p>
              <ul className="list-disc list-inside text-black/70">
                {product.productDetails.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {product.modelInfo.length > 0 && (
            <div>
              <p className="text-black font-medium">Model info</p>
              <ul className="list-disc list-inside text-black/70">
                {product.modelInfo.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {userId && (userId === product.ownerId || !product.ownerId) && (
            <Link
              to={`/off-the-shelf/edit/${product.slug}`}
              className="text-black/50 hover:text-black text-sm underline mt-2"
            >
              Edit product
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
