import { useParams } from "react-router-dom";
import { useCollectionProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";
import { CONSUME_HANDLE } from "@/lib/categories";
import { BlurredBackdrop } from "@/components/BlurredBackdrop";
import { GridLines } from "@/components/GridLines";

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
    {/* Tall enough that the grid lines run on down below a short product list. */}
    <div
      className={`relative z-10 w-full min-h-screen pb-16 animate-blur-fade-in ${
        // 48px of the top padding is under the header; the rest is the gap below it.
        isEntrance ? "pt-24" : "pt-[68px]"
      }`}
    >
      {/* The header overlaps the top 48px of this box (its negative margin),
          so the lines start there, at the bottom edge of the header grid. */}
      {!isEntrance && (
        <div className="absolute inset-x-0 top-12 bottom-0">
          <GridLines />
        </div>
      )}
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
          <ProductGrid products={state.data} onHeaderGrid={!isEntrance} />
        ))}
    </div>
    {isEntrance && <BlurredBackdrop />}
    </>
  );
}
