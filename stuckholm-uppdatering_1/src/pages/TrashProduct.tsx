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

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound || !product) {
    return (
      <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-skarp-italic text-black mb-6">
          Hittades inte
        </h1>
        <Link to="/trash" className="text-black underline">
          Tillbaka till Gammalt Skräp
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16">
      <Link
        to="/trash"
        className="inline-block text-black/70 hover:text-black text-sm mb-8 transition-colors"
      >
        ← Gammalt Skräp
      </Link>

      <div className="relative aspect-[3/4] max-w-md mx-auto bg-[#d51f26]/5 border border-[#d51f26]/20 rounded-lg overflow-hidden mb-8">
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

      <div className="max-w-md mx-auto text-center flex flex-col gap-3">
        <h1 className="text-2xl sm:text-3xl font-skarp-italic text-black">
          {product.name}
        </h1>
        <p className="text-black/80">{product.shortDescription}</p>
        <p className="text-black/70">{product.details}</p>
        <p className="text-black font-medium text-lg">{product.price}</p>

        <a
          href={`mailto:hello.stuckholm@gmail.com?subject=Beställning: ${encodeURIComponent(
            product.name
          )}`}
          className="mt-4 inline-block border border-[#d51f26] text-black px-6 py-2 rounded-full hover:bg-[#d51f26] hover:text-white transition-colors"
        >
          Beställ via mail
        </a>
      </div>
    </div>
  );
}
