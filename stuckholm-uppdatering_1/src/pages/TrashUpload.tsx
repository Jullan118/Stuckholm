import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return base || "plagg";
}

export function TrashUpload() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = React.useState(true);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");

  const [name, setName] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");

    try {
      let imageUrl = "";
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${slugify(name)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("garments")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("garments")
          .getPublicUrl(path);
        imageUrl = publicUrlData.publicUrl;
      }

      const slug = `${slugify(name)}-${Date.now().toString(36)}`;

      const { error: insertError } = await supabase.from("garments").insert({
        slug,
        name,
        short_description: shortDescription,
        details,
        price,
        image_url: imageUrl,
      });
      if (insertError) throw insertError;

      setMessage("Plagget är uppladdat!");
      setName("");
      setShortDescription("");
      setDetails("");
      setPrice("");
      setFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "okänt fel";
      setMessage(`Något gick fel: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="relative z-10 w-full max-w-md px-6 pt-28 pb-16 text-center">
        <h1 className="text-2xl font-skarp-italic text-black mb-4">
          Ladda upp plagg
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

  return (
    <div className="relative z-10 w-full max-w-md px-6 pt-28 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-skarp-italic text-black">Lägg till plagg</h1>
        <button onClick={handleLogout} className="text-black/60 text-sm underline">
          Logga ut
        </button>
      </div>

      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
          required
        />
        <textarea
          placeholder="Kort beskrivning (visas under bilden)"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
          rows={2}
        />
        <textarea
          placeholder="Mer info (material, skick, mått m.m. — visas vid hover och på produktsidan)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
          rows={3}
        />
        <input
          type="text"
          placeholder="Pris (t.ex. 199 kr)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />

        {message && <p className="text-sm text-black">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#d51f26] text-white rounded-full px-6 py-2 mt-2 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "Laddar upp…" : "Ladda upp plagg"}
        </button>
      </form>

      <Link to="/trash" className="block text-center text-black/60 text-sm mt-6">
        ← Se Gammalt Skräp
      </Link>
    </div>
  );
}
