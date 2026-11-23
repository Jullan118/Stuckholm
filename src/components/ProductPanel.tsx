import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
        {state.status === "loading" && (
          <div className="p-6 md:p-10">
            <CloseButton onClick={close} />
            <p className="mt-10 text-black/50 text-sm">Loading…</p>
          </div>
        )}
        {(state.status === "error" || (state.status === "ready" && !state.data)) && (
          <div className="p-6 md:p-10">
            <CloseButton onClick={close} />
            <p className="mt-10 text-black">
              {state.status === "error" ? "Couldn't load this product." : "Not found."}
            </p>
          </div>
        )}
        {state.status === "ready" && state.data && <PanelContent product={state.data} onClose={close} />}
      </div>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start text-sm uppercase tracking-[0.08em] text-black hover:opacity-60 transition-opacity"
    >
      Close
    </button>
  );
}

function PanelContent({ product, onClose }: { product: ShopProduct; onClose: () => void }) {
  const images = product.images;
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const imageRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Picking a colour (or size) scrolls to that variant's picture, if it has one.
  function showVariantImage(variantId: string | null) {
    if (!variantId) return;
    const url = product.variantImages[variantId];
    const index = url ? images.indexOf(url) : -1;
    imageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const meta: [string, string][] = [];
  if (product.isTrash) {
    if (product.vendor) meta.push(["Seller", product.vendor]);
    if (product.brand) meta.push(["Brand", product.brand]);
    if (product.colour) meta.push(["Colour", product.colour]);
    if (product.condition) meta.push(["Condition", product.condition]);
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      {/* Left: close, name, price, add to cart, text. Stays in view while the
          pictures scroll. */}
      <div className="w-full md:w-[38%] lg:w-[32%] shrink-0">
        <div className="md:sticky md:top-0 p-6 md:p-10 flex flex-col gap-6 text-left">
          <CloseButton onClick={onClose} />

          <div className="flex flex-col gap-1 pt-4 md:pt-10">
            <h1 className="text-xl sm:text-2xl leading-snug text-black">{product.title}</h1>
            {product.priceText && (
              <p className="text-xl sm:text-2xl leading-snug text-[rgb(204,204,204)]">{product.priceText}</p>
            )}
          </div>

          {product.description && (
            <p className="text-black/80 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          <AddToCart product={product} onVariantChange={showVariantImage} />

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

          <div className="flex flex-col gap-2 pt-4 text-sm uppercase tracking-[0.08em]">
            <Link to="/shipping" className="hover:opacity-60 transition-opacity">
              Shipping
            </Link>
            <Link to="/returns" className="hover:opacity-60 transition-opacity">
              Returns
            </Link>
          </div>
        </div>
      </div>

      {/* Right: the pictures, one under the other. Click to see larger. */}
      <div className="w-full md:flex-1 flex flex-col gap-2 md:gap-3 md:py-3 md:pr-3">
        {images.length > 0 ? (
          images.map((src, i) => (
            <button
              type="button"
              key={src + i}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              onClick={() => setLightboxIndex(i)}
              className="block w-full cursor-zoom-in scroll-mt-3"
              aria-label={`View image ${i + 1} larger`}
            >
              <FadeImage src={src} alt={i === 0 ? product.title : ""} />
            </button>
          ))
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

// Pictures fade in once they have loaded, instead of popping in.
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
      className={`w-full h-auto block transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
