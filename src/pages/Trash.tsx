import * as React from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { garmentFromRow, type Garment } from "@/lib/garments";
import { TRASH_PRODUCTS } from "@/data/trashProducts";
import { GenderScaleSlider } from "@/components/GenderScaleSlider";

export function Trash() {
  const [products, setProducts] = React.useState<Garment[]>(TRASH_PRODUCTS);
  // True while `products` is still the built-in example data (not real rows
  // from Supabase). The example items aren't editable/deletable — there's
  // nothing in the database to update — so the Edit link only shows once
  // real items have loaded.
  const [usingExamples, setUsingExamples] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  // `null` shows everything mixed together (the default) — nothing is
  // filtered by the feminine↔masculine scale until the visitor drags or taps
  // the slider, at which point it snaps to the nearest of 5 steps (1–5) and
  // only items scored exactly at that step remain visible.
  const [scale, setScale] = React.useState<number | null>(null);
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let cancelled = false;

    supabase
      .from("garments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        if (data.length > 0) {
          setProducts(data.map(garmentFromRow));
          setUsingExamples(false);
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
  }, []);

  return (
    <div className="relative z-10 w-full pt-24 pb-16">
      {/* Feminine↔masculine scale — replaces the old All/Women's/Men's
          tabs. Purely a view filter: nothing is grouped or sorted until the
          visitor drags/taps the slider, at which point it snaps to the
          nearest of 5 steps and only items scored at that exact step stay
          visible. */}
      <GenderScaleSlider
        value={scale}
        onCommit={setScale}
        leftLabel="Women's"
        centerLabel="Stuck, can't decide"
        rightLabel="Men's"
        resetLabel="All"
        onReset={() => setScale(null)}
      />

      {(() => {
        const visible =
          scale === null ? products : products.filter((p) => p.genderScale === scale);

        if (visible.length === 0) {
          return (
            <p className="text-center text-black/50 text-sm mb-16">
              No items here yet.
            </p>
          );
        }

        return (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 mb-16"
            onMouseLeave={() => setHoveredSlug(null)}
          >
            {visible.map((product) => (
              <div
                key={product.slug}
                className="border-r border-b transition-opacity duration-300"
                style={{
                  borderColor: "rgba(0,0,0,0.08)",
                  opacity:
                    hoveredSlug && hoveredSlug !== product.slug ? 0.4 : 1,
                }}
                onMouseEnter={() => setHoveredSlug(product.slug)}
              >
                <Link to={`/trash/${product.slug}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/60">
                        Image
                      </div>
                    )}

                    {/* hover overlay: brand / colour / condition, one per line */}
                    <div className="absolute inset-0 bg-white/90 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-center px-3 gap-1">
                      {product.brand && (
                        <span className="text-black text-sm">Brand: {product.brand}</span>
                      )}
                      {product.colour && (
                        <span className="text-black text-sm">Colour: {product.colour}</span>
                      )}
                      {product.condition && (
                        <span className="text-black text-sm">
                          Condition: {product.condition}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex items-baseline justify-between font-skarp-thin px-4 py-3">
                  <Link to={`/trash/${product.slug}`}>
                    <span className="text-black lowercase">{product.name}</span>
                  </Link>
                  <span style={{ color: "#999999" }}>{product.price}</span>
                </div>
                {!usingExamples &&
                  userId &&
                  (userId === product.ownerId || !product.ownerId) && (
                    <Link
                      to={`/trash/edit/${product.slug}`}
                      className="text-black/40 hover:text-black text-xs underline px-4 pb-3 block"
                    >
                      Edit
                    </Link>
                  )}
              </div>
            ))}
          </div>
        );
      })()}

      {userId && (
        <div className="mt-4 text-center">
          <Link
            to="/trash/upload"
            className="text-black/50 hover:text-black text-sm underline transition-colors"
          >
            + Add item
          </Link>
        </div>
      )}
    </div>
  );
}
