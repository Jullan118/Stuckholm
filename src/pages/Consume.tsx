import { useShopProducts } from "@/lib/shopProducts";
import { ProductGrid } from "@/components/ProductGrid";

// Every product, new and secondhand together. Categories live in the header
// (see MainNav), so this page is just the grid.
export function Consume() {
  const state = useShopProducts("all");

  return (
    <div className="relative z-10 w-full pt-24 pb-16 animate-blur-fade-in">
      {state.status === "loading" && <p className="text-center text-black/50 text-sm">Loading…</p>}
      {state.status === "error" && (
        <p className="text-center text-black/50 text-sm">
          Couldn't load products right now. Please try again soon.
        </p>
      )}
      {state.status === "ready" &&
        (state.data.length === 0 ? (
          <p className="text-center text-black/50 text-sm">No products yet.</p>
        ) : (
          <ProductGrid products={state.data} />
        ))}
    </div>
  );
}
