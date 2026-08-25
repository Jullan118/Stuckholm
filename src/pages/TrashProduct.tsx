import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { garmentFromRow, type Garment } from "@/lib/garments";
import { TRASH_PRODUCTS } from "@/data/trashProducts";

export function TrashProduct() {
  const { slug } = useParams();
  const fallback = TRASH_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const [product, setProduct] = React.useState<Garment | null>(fallback);
  const [notFound, setNotFound] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabaseConfigured || !supabase || !slug) return;
    let cancelled = false;

    supabase
      .from("garments")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          setProduct(garmentFromRow(data));
        } else if (!fallback) {
          setNotFound(true);
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
  }, [slug]);

  if (notFound || !product) {
    return (
      <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-skarp-thin text-black mb-6">
          Not found
        </h1>
        <Link to="/trash" className="text-black underline">
          Back to Exes
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image].filter(Boolean);

  return (
    <div className="relative z-10 w-full max-w-5xl px-6 pt-28 pb-16">
      <Link
        to="/trash"
        className="inline-block text-black/70 hover:text-black text-sm mb-8 transition-colors"
      >
        ← Exes
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Image grid: up to 8 images, 4 across x 2 rows */}
        <div className="w-full md:w-3/5 flex-shrink-0">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {images.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden">
                  <img
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center text-black/60">
              Image
            </div>
          )}
        </div>

        {/* Text + order info */}
        <div className="w-full md:w-2/5 flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-skarp-thin text-black">
            {product.name}
          </h1>
          <p className="text-black font-medium text-lg">{product.price}</p>
          {product.shortDescription && (
            <p className="text-black/80">{product.shortDescription}</p>
          )}
          {product.details && <p className="text-black/70">{product.details}</p>}
          {product.sellerName && (
            <p className="text-black/60 text-sm">Seller: {product.sellerName}</p>
          )}

          <a
            href={`mailto:hello.stuckholm@gmail.com?subject=Order: ${encodeURIComponent(
              product.name
            )}`}
            className="mt-4 inline-block border border-[#d51f26] text-black px-6 py-2 rounded-full hover:bg-[#d51f26] hover:text-white transition-colors text-center"
          >
            Order via email
          </a>

          {userId && (userId === product.ownerId || !product.ownerId) && (
            <Link
              to={`/trash/edit/${product.slug}`}
              className="text-black/50 hover:text-black text-sm underline mt-2"
            >
              Edit item
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
