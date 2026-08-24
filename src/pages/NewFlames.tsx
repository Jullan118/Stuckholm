import * as React from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { flameFromRow, formatColorCount, type Flame } from "@/lib/flames";
import { NEW_FLAMES_PRODUCTS } from "@/data/newFlamesProducts";

export function NewFlames() {
  const [products, setProducts] = React.useState<Flame[]>(NEW_FLAMES_PRODUCTS);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let cancelled = false;

    supabase
      .from("flames")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        if (data.length > 0) setProducts(data.map(flameFromRow));
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
    <div className="relative z-10 w-full px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-3xl sm:text-4xl font-skarp-thin text-black mb-10 text-center">
        New Flames
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-12">
        {products.map((product) => (
          <div key={product.slug} className="flex flex-col gap-2">
            <Link to={`/new-flames/${product.slug}`}>
              <div className="aspect-square overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/60">
                    Bild
                  </div>
                )}
              </div>
            </Link>

            <div className="flex items-baseline justify-between font-skarp-thin">
              <Link to={`/new-flames/${product.slug}`}>
                <span className="text-black">{product.name}</span>
              </Link>
              <span className="text-black">{product.price}</span>
            </div>
            {product.colorCount !== null && (
              <span
                className="font-skarp-thin -mt-1"
                style={{ color: "#d7d7d7" }}
              >
                {formatColorCount(product.colorCount)}
              </span>
            )}

            {userId && (userId === product.ownerId || !product.ownerId) && (
              <Link
                to={`/new-flames/edit/${product.slug}`}
                className="text-black/40 hover:text-black text-xs underline mt-1"
              >
                Redigera
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          to="/new-flames/upload"
          className="text-black/50 hover:text-black text-sm underline transition-colors"
        >
          + Lägg till produkt
        </Link>
      </div>
    </div>
  );
}
