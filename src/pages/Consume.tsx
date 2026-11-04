import { useParams } from "react-router-dom";
import { useCollectionProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";
import { CONSUME_HANDLE } from "@/lib/categories";
import { BlurredBackdrop } from "@/components/BlurredBackdrop";

// One Shopify collection as a product grid. /collections/all shows every
// product; /collections/apparel, /collections/descartes etc. show their own.
// Categories live in the header (see MainNav).
export function Consume() {
  const { handle = CONSUME_HANDLE } = useParams();
  const state = useCollectionProducts(handle);
  // The entrance (/collections/all, reached from Consume on the home page) is
  // fully blurred over the products; category pages show them on white.
  const isEntrance = handle === CONSUME_HANDLE;

  return (
    <>
    <div className="relative z-10 w-full pt-24 pb-16 animate-blur-fade-in">
      {state.status === "loading" && <p className="text-center text-black/50 text-xs">Loading…</p>}
      {state.status === "error" && (
        <p className="text-center text-black/50 text-xs">
          Couldn't load products right now. Please try again soon.
        </p>
      )}
      {state.status === "ready" &&
        (state.data.length === 0 ? (
          <p className="text-center text-black/50 text-xs">No products yet.</p>
        ) : (
          <ProductGrid products={state.data} />
        ))}
    </div>
    {isEntrance && <BlurredBackdrop />}
    </>
  );
}
