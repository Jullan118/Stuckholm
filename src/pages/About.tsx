import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

// This is the site-wide login. Logging in here (or on /trash/upload or
// /off-the-shelf/upload directly) unlocks the "+ Add product" / "+ Add item"
// links on the Trash and Off the shelf pages, since it's the same Supabase
// auth session everywhere. Only Julia and her brother have accounts — there's
// no sign-up form, on purpose.
export function About() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");

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
    if (error) setLoginError("Wrong email or password.");
  }

  async function handleLogout() {
    await supabase?.auth.signOut();
  }

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl sm:text-4xl font-skarp-thin text-black mb-8">
        Contact
      </h1>

      {!supabaseConfigured ? (
        <p className="text-black/50 text-sm">Login isn't connected yet.</p>
      ) : checkingSession ? null : session ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-black/70 text-sm">Logged in as {session.user.email}</p>
          <button
            onClick={handleLogout}
            className="text-black/60 text-sm underline hover:text-black transition-colors"
          >
            Log out
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-3 w-full max-w-xs text-left"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black/20 rounded-lg px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
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
            Log in
          </button>
        </form>
      )}
    </div>
  );
}
