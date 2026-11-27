import * as React from "react";
import { SizeGuide } from "@/components/SizeGuide";
import { DriftingStars } from "@/components/DriftingStars";
import { useNavigate, useParams } from "react-router-dom";
import { AddToCart } from "@/components/AddToCart";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useShopProduct, type ShopProduct } from "@/lib/shopProducts";

// A product opened from a product list: the product slides in from the right
// as a panel over the list, which stays visible (toned down) in a strip on
// the left. Close with CLOSE, by clicking the toned strip, or with Esc; the
// browser's back button closes it too, since the address is the product's
// own. (Opening a product link directly shows the full product page.)

const SLIDE_MS = 320;

export function ProductPanel() {
  const { slug } = useParams();
  const state = useShopProduct(slug);
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const closing = React.useRef(false);

  // Slide in on the next frame (so the transition runs).
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOpen(false);
    window.setTimeout(() => navigate(-1), SLIDE_MS);
  }, [navigate]);

  // Esc closes; the list behind doesn't scroll while the panel is open.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-40">
      {/* The list behind, toned down; clicking it closes the panel. */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={`absolute inset-0 w-full h-full cursor-default bg-white/70 transition-opacity ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: `${SLIDE_MS}ms` }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={state.status === "ready" && state.data ? state.data.title : "Product"}
        className={`absolute top-0 right-0 h-full w-full md:w-[calc(100%-8vw)] bg-white overflow-y-auto overscroll-contain shadow-[-12px_0_40px_rgba(0,0,0,0.06)] transition-transform ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionDuration: `${SLIDE_MS}ms` }}
      >
        {/* CLOSE in the panel's top-left corner. */}
        {/* The home page's stars, faint and slowly drifting; they stay put
            while the panel scrolls. */}
        <div aria-hidden="true" className="pointer-events-none sticky top-0 h-0 w-full">
          <div className="h-[100dvh] w-full">
            <DriftingStars opacity={0.2} />
          </div>
        </div>
        <div className="absolute top-5 left-6 md:left-10 z-10">
          <CloseButton onClick={close} />
        </div>
        {state.status === "loading" && (
          <div className="p-6 md:p-10 pt-14 md:pt-[4.5rem]">
            <p className="text-black/50 text-sm">Loading…</p>
          </div>
        )}
        {(state.status === "error" || (state.status === "ready" && !state.data)) && (
          <div className="p-6 md:p-10 pt-14 md:pt-[4.5rem]">
            <p className="text-black">
              {state.status === "error" ? "Couldn't load this product." : "Not found."}
            </p>
          </div>
        )}
        {state.status === "ready" && state.data && <PanelContent product={state.data} />}
      </div>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start text-xs uppercase tracking-[0.08em] text-black hover:opacity-60 transition-opacity"
    >
      Close
    </button>
  );
}

function PanelContent({ product }: { product: ShopProduct }) {
  const images = product.images;
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [active, setActive] = React.useState(0);
  const thumbRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => setActive(0), [product.handle]);

  const go = React.useCallback(
    (i: number) => {
      if (images.length === 0) return;
      const next = (i + images.length) % images.length;
      setActive(next);
      // Bring the thumbnail into view in its own row only, never by moving
      // the page (scrollIntoView would scroll the panel too).
      const thumb = thumbRefs.current[next];
      const row = thumb?.parentElement;
      if (thumb && row && row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: thumb.offsetLeft - (row.clientWidth - thumb.offsetWidth) / 2, behavior: "smooth" });
      }
    },
    [images.length]
  );

  // Arrow keys flip through the pictures (unless the big view is open).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) return;
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go, lightboxIndex]);

  // Picking a colour (or size) shows that variant's picture, if it has one.
  function showVariantImage(variantId: string | null) {
    if (!variantId) return;
    const url = product.variantImages[variantId];
    const index = url ? images.indexOf(url) : -1;
    if (index >= 0) go(index);
  }

  const meta: [string, string][] = [];
  if (product.isTrash) {
    if (product.vendor) meta.push(["Seller", product.vendor]);
    if (product.brand) meta.push(["Brand", product.brand]);
    if (product.colour) meta.push(["Colour", product.colour]);
    if (product.condition) meta.push(["Condition", product.condition]);
  }

  return (
    <div className="relative flex flex-col md:flex-row min-h-full">
      {/* Left: name, price, text, add to cart. Stays in view while the
          pictures scroll. */}
      {/* Left column, with a thin line to the pictures, like the grid lines
          on the product list. */}
      <div className="relative w-full md:w-[38%] lg:w-[32%] shrink-0 md:border-r-[0.75px] md:border-black/20">
        <div className="md:sticky md:top-0 p-6 md:p-10 pt-14 md:pt-[4.5rem] flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-1">
            <h1 className="text-base sm:text-lg leading-snug text-black">{product.title}</h1>
            {product.priceText && (
              <p className="text-base sm:text-lg leading-snug text-[rgb(204,204,204)]">{product.priceText}</p>
            )}
          </div>

          {product.description && (
            <p className="text-black text-base sm:text-lg leading-snug whitespace-pre-line">
              {product.description}
            </p>
          )}

          <AddToCart product={product} onVariantChange={showVariantImage} />
          <SizeGuide guide={product.sizeGuide} />

          {meta.length > 0 && (
            <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              {meta.map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt className="text-black/50">{label}</dt>
                  <dd className="text-black">{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}

        </div>
      </div>

      {/* Right: a carousel. One big picture that always fits on the screen,
          arrows to flip, and small thumbnails just under it. Click the big
          picture to see it larger. */}
      <div className="relative w-full md:flex-1 md:sticky md:top-0 md:h-screen flex flex-col gap-3 px-6 pb-8 md:p-6 min-w-0">
        {images.length > 0 ? (
          <>
            <div className="relative flex-1 min-h-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setLightboxIndex(active)}
                className="h-full w-full flex items-center justify-center cursor-zoom-in"
                aria-label="View picture larger"
              >
                <FadeImage key={images[active]} src={images[active]} alt={product.title} />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(active - 1)}
                    aria-label="Previous picture"
                    className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-6 text-3xl leading-none text-black/40 hover:text-black transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => go(active + 1)}
                    aria-label="Next picture"
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-6 text-3xl leading-none text-black/40 hover:text-black transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* All pictures as small thumbnails, just under the big one. */}
            {images.length > 1 && (
              <div className="relative shrink-0 flex justify-center gap-2 overflow-x-auto py-1 px-[3px]">
                {images.map((src, i) => (
                  <button
                    type="button"
                    key={src + i}
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    onClick={() => go(i)}
                    aria-label={`Show picture ${i + 1}`}
                    aria-current={i === active ? "true" : undefined}
                    className={`shrink-0 w-10 h-[3.1rem] md:w-12 md:h-[3.75rem] overflow-hidden transition-opacity ${
                      i === active ? "opacity-100 outline outline-1 outline-black outline-offset-2" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="aspect-[4/5] w-full flex items-center justify-center text-black/50">Image</div>
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
    </div>
  );
}

// Pictures fade in once they have loaded (and when switching), instead of
// popping in. Fits inside its box without cropping.
function FadeImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      className={`block max-w-full max-h-[70vh] md:max-h-full w-auto h-auto object-contain transition-opacity duration-500 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
