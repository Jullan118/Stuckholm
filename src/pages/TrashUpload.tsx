import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import {
  CURRENCIES,
  MAX_IMAGES,
  SHORT_DESCRIPTION_MAX,
  garmentFromRow,
  type Currency,
} from "@/lib/garments";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return base || "plagg";
}

let imageIdCounter = 0;
function nextImageId() {
  imageIdCounter += 1;
  return `img-${imageIdCounter}`;
}

type ImageSlot = {
  id: string;
  // Either an already-uploaded URL (existing image) or a freshly picked File.
  url?: string;
  file?: File;
  preview: string;
};

export function TrashUpload() {
  const { slug: editSlug } = useParams();
  const isEditMode = Boolean(editSlug);
  const navigate = useNavigate();

  const [session, setSession] = React.useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = React.useState(true);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");

  const [name, setName] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [sellerName, setSellerName] = React.useState("");
  const [priceAmount, setPriceAmount] = React.useState("");
  const [priceCurrency, setPriceCurrency] = React.useState<Currency>("kr");
  const [images, setImages] = React.useState<ImageSlot[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const [loadingGarment, setLoadingGarment] = React.useState(isEditMode);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [notOwner, setNotOwner] = React.useState(false);

  React.useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // In edit mode, once logged in, load the existing garment and prefill the form.
  React.useEffect(() => {
    if (!isEditMode || !session || !supabase || !editSlug) return;
    let cancelled = false;

    supabase
      .from("garments")
      .select("*")
      .eq("slug", editSlug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          const g = garmentFromRow(data);
          if (g.ownerId && g.ownerId !== session.user.id) {
            setNotOwner(true);
            setLoadingGarment(false);
            return;
          }
          setName(g.name);
          setShortDescription(g.shortDescription);
          setDetails(g.details);
          setSellerName(g.sellerName);
          setPriceAmount(g.priceAmount !== null ? String(g.priceAmount) : "");
          setPriceCurrency(g.priceCurrency);
          setImages(
            g.images.map((url) => ({ id: nextImageId(), url, preview: url }))
          );
        } else {
          setMessage("Kunde inte hitta plagget.");
        }
        setLoadingGarment(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, session, editSlug]);

  function handleAddFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setImages((prev) => {
      const room = MAX_IMAGES - prev.length;
      if (room <= 0) return prev;
      const chosen = Array.from(fileList).slice(0, room);
      const added: ImageSlot[] = chosen.map((file) => ({
        id: nextImageId(),
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...added];
    });
  }

  function handleRemoveImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Fel e-post eller lösenord.");
  }

  async function handleLogout() {
    await supabase?.auth.signOut();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");

    try {
      const finalUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.url) {
          finalUrls.push(img.url);
          continue;
        }
        if (img.file) {
          const ext = img.file.name.split(".").pop() ?? "jpg";
          const path = `${Date.now()}-${i}-${slugify(name)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("garments")
            .upload(path, img.file);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage
            .from("garments")
            .getPublicUrl(path);
          finalUrls.push(publicUrlData.publicUrl);
        }
      }

      const amount = priceAmount.trim() === "" ? null : Number(priceAmount);
      const priceDisplay = amount !== null ? `${amount} ${priceCurrency}` : "";

      if (isEditMode && editSlug) {
        const { error: updateError } = await supabase
          .from("garments")
          .update({
            name,
            short_description: shortDescription,
            details,
            seller_name: sellerName,
            price_amount: amount,
            price_currency: priceCurrency,
            price: priceDisplay,
            image_url: finalUrls[0] ?? "",
            image_urls: finalUrls,
          })
          .eq("slug", editSlug);
        if (updateError) throw updateError;
        setMessage("Ändringarna är sparade!");
      } else {
        const slug = `${slugify(name)}-${Date.now().toString(36)}`;
        const { error: insertError } = await supabase.from("garments").insert({
          slug,
          name,
          short_description: shortDescription,
          details,
          seller_name: sellerName,
          price_amount: amount,
          price_currency: priceCurrency,
          price: priceDisplay,
          image_url: finalUrls[0] ?? "",
          image_urls: finalUrls,
          owner_id: session?.user.id,
        });
        if (insertError) throw insertError;

        setMessage("Plagget är uppladdat!");
        setName("");
        setShortDescription("");
        setDetails("");
        setSellerName("");
        setPriceAmount("");
        setPriceCurrency("kr");
        setImages([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "okänt fel";
      setMessage(`Något gick fel: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!supabase || !editSlug) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from("garments").delete().eq("slug", editSlug);
    setDeleting(false);
    if (error) {
      setMessage(`Kunde inte ta bort: ${error.message}`);
      return;
    }
    navigate("/trash");
  }

  if (!supabaseConfigured) {
    return (
      <div className="relative z-10 w-full max-w-md px-6 pt-28 pb-16 text-center">
        <h1 className="text-2xl font-skarp-italic text-black mb-4">
          {isEditMode ? "Redigera plagg" : "Ladda upp plagg"}
        </h1>
        <p className="text-black/70">
          Uppladdning är inte ihopkopplad än — Supabase-nycklarna saknas.
        </p>
        <Link to="/trash" className="block text-black/60 text-sm mt-6 underline">
          ← Tillbaka
        </Link>
      </div>
    );
  }

  if (checkingSession) return null;

  if (!session) {
    return (
      <div className="relative z-10 w-full max-w-sm px-6 pt-28 pb-16">
        <h1 className="text-2xl font-skarp-italic text-black mb-6 text-center">
          Logga in
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black/20 rounded-lg px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-black/20 rounded-lg px-3 py-2"
            required
          />
          {loginError && <p className="text-[#d51f26] text-sm">{loginError}</p>}
          <button
            type="submit"
            className="bg-black text-white rounded-full px-6 py-2 mt-2 hover:opacity-80 transition-opacity"
          >
            Logga in
          </button>
        </form>
        <Link to="/trash" className="block text-center text-black/60 text-sm mt-6">
          ← Tillbaka
        </Link>
      </div>
    );
  }

  if (isEditMode && loadingGarment) return null;

  if (isEditMode && notOwner) {
    return (
      <div className="relative z-10 w-full max-w-md px-6 pt-28 pb-16 text-center">
        <h1 className="text-2xl font-skarp-italic text-black mb-4">
          Redigera plagg
        </h1>
        <p className="text-black/70">
          Det här plagget är upplagt av någon annan — du kan bara redigera
          och ta bort dina egna annonser.
        </p>
        <Link to="/trash" className="block text-black/60 text-sm mt-6 underline">
          ← Tillbaka
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-md px-6 pt-28 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-skarp-italic text-black">
          {isEditMode ? "Redigera plagg" : "Lägg till plagg"}
        </h1>
        <button onClick={handleLogout} className="text-black/60 text-sm underline">
          Logga ut
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square">
                <img
                  src={img.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-black"
                  aria-label="Ta bort bild"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="aspect-square border border-dashed border-black/30 flex items-center justify-center text-black/50 text-sm cursor-pointer hover:border-black/60">
                + Bild
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleAddFiles(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="text-right text-xs text-black/40 mt-1">
            {images.length}/{MAX_IMAGES} bilder
          </div>
        </div>

        <input
          type="text"
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
          required
        />

        <div>
          <textarea
            placeholder="Kort beskrivning (visas under bilden)"
            value={shortDescription}
            onChange={(e) =>
              setShortDescription(e.target.value.slice(0, SHORT_DESCRIPTION_MAX))
            }
            maxLength={SHORT_DESCRIPTION_MAX}
            className="border border-black/20 rounded-lg px-3 py-2 w-full"
            rows={2}
          />
          <div className="text-right text-xs text-black/40 mt-1">
            {shortDescription.length}/{SHORT_DESCRIPTION_MAX}
          </div>
        </div>

        <textarea
          placeholder="Mer info (material, skick, mått, hur man beställer m.m. — visas på produktsidan)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
          rows={3}
        />

        <input
          type="text"
          placeholder="Säljare (t.ex. ditt namn)"
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
        />

        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Pris"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            className="border border-black/20 rounded-lg px-3 py-2 flex-1"
          />
          <select
            value={priceCurrency}
            onChange={(e) => setPriceCurrency(e.target.value as Currency)}
            className="border border-black/20 rounded-lg px-3 py-2"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {message && <p className="text-sm text-black">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#d51f26] text-white rounded-full px-6 py-2 mt-2 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving
            ? "Sparar…"
            : isEditMode
              ? "Spara ändringar"
              : "Ladda upp plagg"}
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-[#d51f26] text-sm mt-1 hover:underline disabled:opacity-50"
          >
            {deleting
              ? "Tar bort…"
              : confirmDelete
                ? "Klicka igen för att bekräfta borttagning"
                : "Ta bort plagg"}
          </button>
        )}
      </form>

      <Link to="/trash" className="block text-center text-black/60 text-sm mt-6">
        ← Se Gammalt Skräp
      </Link>
    </div>
  );
}
