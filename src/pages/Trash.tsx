import * as React from "react";
import { GENDER_SCALE_NEUTRAL } from "@/lib/garments";
import { useShopProducts } from "@/lib/shopProducts";
import { GenderScaleSlider } from "@/components/GenderScaleSlider";
import { ProductGrid } from "@/components/ProductGrid";

export function Trash() {
  const state = useShopProducts("trash");
  // 0 ("Stuck, can't decide") shows every item, scored or not — the default.
  // Dragging toward either end narrows the grid instead of picking an exact
  // match: at -1, items scored -1 *and* -2 stay visible; at -2, only -2
  // remains. Same going the other way toward Men's.
  const [scale, setScale] = React.useState<number>(GENDER_SCALE_NEUTRAL);

  return (
    <div className="relative z-10 w-full pt-24 pb-16">
      <GenderScaleSlider
        value={scale}
        onCommit={setScale}
        leftLabel="Women's"
        centerLabel="Stuck, can't decide"
        rightLabel="Men's"
        resetLabel="All"
        onReset={() => setScale(GENDER_SCALE_NEUTRAL)}
      />

      {state.status === "loading" && <p className="text-center text-black/50 text-sm">Loading…</p>}
      {state.status === "error" && (
        <p className="text-center text-black/50 text-sm">
          Couldn't load items right now. Please try again soon.
        </p>
      )}
      {state.status === "ready" &&
        (() => {
          const visible = state.data.filter((p) => {
            if (scale === GENDER_SCALE_NEUTRAL) return true;
            if (p.genderScale === null) return false;
            return scale < GENDER_SCALE_NEUTRAL ? p.genderScale <= scale : p.genderScale >= scale;
          });
          if (visible.length === 0) {
            return <p className="text-center text-black/50 text-sm mb-16">No items here yet.</p>;
          }
          return (
            <div className="mb-16">
              <ProductGrid products={visible} />
            </div>
          );
        })()}
    </div>
  );
}
