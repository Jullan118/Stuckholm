import * as React from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { garmentFromRow, type Garment } from "@/lib/garments";
import { TRASH_PRODUCTS } from "@/data/trashProducts";

export function Trash() {
  const [products, setProducts] = React.useState<Garment[]>(TRASH_PRODUCTS);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let cancelled = false;

    supabase
      .from("garments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        if (data.length > 0) setProducts(data.map(garmentFromRow));
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
    <div className="relative z-10 w-full max-w-6xl px-6 pt-28 pb-16">
      <h1 className="text-3xl sm:text-4xl font-skarp-italic text-black mb-10 text-center">
        Gammalt Skräp
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-10">
        {products.map((product) => (
          <div key={product.slug} className="group flex flex-col gap-2">
            <Link to={`/trash/${product.slug}`}>
              <div className="relative aspect-square overflow-hidden">
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

                {/* hover overlay: extra info + price */}
                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-center px-3 gap-1">
                  <span className="text-black text-sm">{product.details}</span>
                  <span className="text-black font-medium">{product.price}</span>
                </div>
              </div>
            </Link>

            <div className="flex flex-col">
              <Link to={`/trash/${product.slug}`}>
                <span className="text-black font-medium text-sm">{product.name}</span>
              </Link>
              <span className="text-black/70 text-sm">{product.shortDescription}</span>
              {userId && (userId === product.ownerId || !product.ownerId) && (
                <Link
                  to={`/trash/edit/${product.slug}`}
                  className="text-black/40 hover:text-black text-xs underline mt-1"
                >
                  Redigera
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          to="/trash/upload"
          className="text-black/50 hover:text-black text-sm underline transition-colors"
        >
          + Lägg till plagg
        </Link>
      </div>
    </div>
  );
}
