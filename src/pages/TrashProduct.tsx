import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { garmentFromRow, type Garment } from "@/lib/garments";
import { TRASH_PRODUCTS } from "@/data/trashProducts";
import { ImageLightbox } from "@/components/ImageLightbox";
import { JumpyText } from "@/components/JumpyText";

export function TrashProduct() {
  const { slug } = useParams();
  const fallback = TRASH_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const [product, setProduct] = React.useState<Garment | null>(fallback);
  const [notFound, setNotFound] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Which image the big frame + thumbnail strip currently show.
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase || !slug) return;
    let cancelled = false;

    supabase
      .from("garments")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          setProduct(garmentFromRow(data));
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

  // Reset the carousel whenever we land on a different product.
  React.useEffect(() => {
    setActiveIndex(0);
  }, [product?.slug]);

  if (notFound || !product) {
    return (
      <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-skarp-thin text-black mb-6">
          Not found
        </h1>
        <Link to="/trash" className="text-black underline">
          Back to Trash
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

  return (
    <div className="relative z-10 w-full max-w-5xl px-6 pt-28 pb-16">
      <Link
        to="/trash"
        className="group inline-block text-black/70 hover:text-black text-sm mb-8 transition-colors"
      >
        ← <JumpyText text="Trash" />
      </Link>

      <div className="flex flex-col md:flex-row gap-5">
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
                  className="w-full max-w-md overflow-hidden cursor-zoom-in"
                  aria-label="View image larger"
                >
                  <img
                    src={current}
                    alt={`${product.name} ${activeIndex + 1}`}
                    className="w-full h-auto block"
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
                <div className="flex gap-2 mt-4 max-w-md mx-auto">
                  {images.map((src, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`flex-1 min-w-0 aspect-square overflow-hidden border transition-colors ${
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

        {/* Text + order info */}
        <div className="w-full md:w-2/5 flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-skarp-thin text-black">
            {product.name}
          </h1>
          <p className="text-black font-medium text-lg">{product.price}</p>
          {(product.brand || product.colour || product.condition) && (
            <div className="flex flex-col text-black/80">
              {product.brand && <span>Brand: {product.brand}</span>}
              {product.colour && <span>Colour: {product.colour}</span>}
              {product.condition && <span>Condition: {product.condition}</span>}
            </div>
          )}
          {product.shortDescription && (
            <p className="text-black/80">{product.shortDescription}</p>
          )}
          {product.details && <p className="text-black/70">{product.details}</p>}
          {product.sellerName && (
            <p className="text-black/60 text-sm">Seller: {product.sellerName}</p>
          )}

          <a
            href={`mailto:hello.stuckholm@gmail.com?subject=Order: ${encodeURIComponent(
              product.name
            )}`}
            className="mt-4 inline-block border border-black text-black px-6 py-2 w-fit hover:bg-black hover:text-white transition-colors text-center"
          >
            Add to cart
          </a>

          {userId && (userId === product.ownerId || !product.ownerId) && (
            <Link
              to={`/trash/edit/${product.slug}`}
              className="text-black/50 hover:text-black text-sm underline mt-2"
            >
              Edit item
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
