import * as React from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { flameFromRow, formatColorCount, type Flame } from "@/lib/flames";
import { NEW_FLAMES_PRODUCTS } from "@/data/newFlamesProducts";

export function NewFlames() {
  const [products, setProducts] = React.useState<Flame[]>(NEW_FLAMES_PRODUCTS);
  // True while `products` is still the built-in example data (not real rows
  // from Supabase). The example items aren't editable/deletable — there's
  // nothing in the database to update — so the Edit link only shows once
  // real products have loaded.
  const [usingExamples, setUsingExamples] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let cancelled = false;

    supabase
      .from("flames")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        if (data.length > 0) {
          setProducts(data.map(flameFromRow));
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
    <div className="relative z-10 w-full pt-28 pb-16">
      <h1 className="text-3xl sm:text-4xl font-skarp-thin text-black mb-4 text-center">
        Off the shelf
      </h1>

      {usingExamples && (
        <p className="text-center text-black/50 text-sm mb-6">
          Showing example products — add your own below and these will disappear.
        </p>
      )}

      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {products.map((product) => (
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
            <Link to={`/off-the-shelf/${product.slug}`}>
              <div className="aspect-[4/5] overflow-hidden">
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
              </div>
            </Link>

            <div className="flex items-baseline justify-between font-skarp-thin px-4 py-3">
              <Link to={`/off-the-shelf/${product.slug}`}>
                <span className="text-black lowercase">{product.name}</span>
              </Link>
              <span style={{ color: "#999999" }}>{product.price}</span>
            </div>
            {product.colorCount !== null && (
              <span
                className="font-skarp-thin -mt-2 px-4 pb-3 block"
                style={{ color: "#d7d7d7" }}
              >
                {formatColorCount(product.colorCount)}
              </span>
            )}

            {!usingExamples && userId && (userId === product.ownerId || !product.ownerId) && (
              <Link
                to={`/off-the-shelf/edit/${product.slug}`}
                className="text-black/40 hover:text-black text-xs underline px-4 pb-3 block"
              >
                Edit
              </Link>
            )}
          </div>
        ))}
      </div>

      {userId && (
        <div className="mt-16 text-center">
          <Link
            to="/off-the-shelf/upload"
            className="text-black/50 hover:text-black text-sm underline transition-colors"
          >
            + Add product
          </Link>
        </div>
      )}
    </div>
  );
}
