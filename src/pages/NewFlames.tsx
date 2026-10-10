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
    <div className="relative z-10 w-full pt-24 pb-16">
      {usingExamples && (
        <p
