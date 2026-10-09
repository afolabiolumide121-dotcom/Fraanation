import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { crowdImage } from "@/lib/brand-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Join the Nation — FRAANATION" },
      { name: "description", content: "Sign in or become a FRAANATION member to post, like and comment in the community." },
      { property: "og:title", content: "Join the Nation — FRAANATION" },
      { property: "og:description", content: "Members-only community for FRAANATION." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/feed", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) navigate({ to: "/feed", replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setBusy(true);
    try {
      if (mode === "up") {
        if (!/^[A-Za-z0-9_.]{2,30}$/.test(username)) throw new Error("Username: 2–30 letters, numbers, _ or .");
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/auth", data: { username: username.toLowerCase() } },
        });
        if (error) throw error;
        if (!data.session) setMsg("Check your email to confirm your membership, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  async function google() {
    setMsg(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg(r.error.message ?? "Google sign-in failed");
  }

  const field = "min-h-12 w-full border-b border-ink-foreground/30 bg-transparent text-base outline-none placeholder:opacity-40 focus:border-sun";
  return (
    <div className="bg-ink text-ink-foreground">
      <div className="relative overflow-hidden">
        <img src={crowdImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto max-w-xl px-5 pb-10 pt-20">
          <p className="eyebrow text-sun">Members only</p>
          <h1 className="font-display mt-4 text-[18vw] leading-[0.9] md:text-8xl">{mode === "up" ? "Join the Nation" : "Welcome back"}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-xl px-5 pb-20">
        <button onClick={google} className="btn-light w-full">Continue with Google <span>→</span></button>
        <p className="eyebrow my-6 text-center opacity-40">or with email</p>
        <form onSubmit={submit} className="space-y-5">
          {mode === "up" && (
            <input className={field} placeholder="Username (e.g. fraa.kid)" value={username} onChange={(e) => setUsername(e.target.value)} aria-label="Username" required />
          )}
          <input className={field} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" required />
          <input className={field} type="password" placeholder="Password (6+ characters)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" required />
          {msg && <p className="border-l-2 border-sun pl-3 text-sm">{msg}</p>}
          <button disabled={busy} className="btn-light w-full bg-sun text-ink disabled:opacity-50">{busy ? "One moment…" : mode === "up" ? "Become a member" : "Sign in"} <span>→</span></button>
        </form>
        <button onClick={() => { setMode(mode === "up" ? "in" : "up"); setMsg(null); }} className="eyebrow mt-8 min-h-11 w-full text-center opacity-70">
          {mode === "up" ? "Already a member? Sign in" : "New here? Join the Nation"}
        </button>
      </div>
    </div>
  );
}
