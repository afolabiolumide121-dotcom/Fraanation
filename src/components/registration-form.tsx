import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { registerForEvent, lookupRegistration, registrationSchema } from "@/lib/events.functions";

const field = "w-full border-0 border-b hairline bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground focus:border-ink";

export function RegistrationForm({ slug, open, title }: { slug: string; open: boolean; title: string }) {
  const register = useServerFn(registerForEvent);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", instagram: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ code: string; already: boolean } | null>(null);
  const [serverError, setServerError] = useState("");

  if (!open) return <button disabled className="btn-ink w-full">Registration closed</button>;

  if (result) {
    return (
      <div className="bg-ink p-6 text-ink-foreground rise">
        <p className="eyebrow text-sun">{result.already ? "You're already on the list" : "Reservation confirmed"}</p>
        <p className="font-editorial mt-4 text-3xl">See you at {title}.</p>
        <p className="eyebrow mt-8 opacity-60">Your entry code</p>
        <p className="font-display mt-2 text-6xl tracking-wide text-sun">{result.code}</p>
        <p className="mt-6 text-sm opacity-70">Screenshot this code. Show it at the entrance with your name. Date and venue updates will appear on this page.</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const parsed = registrationSchema.safeParse({ slug, ...form });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await register({ data: parsed.data });
      if (res.ok) setResult({ code: res.code, already: res.already });
      else setServerError(res.error);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputs = [
    { k: "fullName", label: "Full name", type: "text", auto: "name" },
    { k: "email", label: "Email", type: "email", auto: "email" },
    { k: "phone", label: "Phone (WhatsApp)", type: "tel", auto: "tel" },
    { k: "instagram", label: "Instagram (optional)", type: "text", auto: "off" },
  ] as const;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <p className="eyebrow">Free registration</p>
      {inputs.map((f) => (
        <label key={f.k} className="block">
          <span className="sr-only">{f.label}</span>
          <input type={f.type} autoComplete={f.auto} placeholder={f.label} value={form[f.k]} maxLength={f.k === "email" ? 255 : 100}
            onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={field} />
          {errors[f.k] && <span className="mt-1 block text-sm text-destructive">{errors[f.k]}</span>}
        </label>
      ))}
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <button type="submit" disabled={busy} className="btn-ink w-full">{busy ? "Reserving…" : "Reserve my free spot"} <span>→</span></button>
    </form>
  );
}

export function LookupForm() {
  const lookup = useServerFn(lookupRegistration);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await lookup({ data: { code, email } });
      setMsg(r ? `Confirmed — ${r.full_name}, you're on the list for ${r.event_title}.` : "No reservation found for that code and email.");
    } catch { setMsg("Check your code and email and try again."); }
  }
  return (
    <form onSubmit={go} className="space-y-4">
      <p className="eyebrow">Check your reservation</p>
      <input placeholder="Entry code (FRAA-XXXXXX)" value={code} onChange={(e) => setCode(e.target.value)} maxLength={20} className={field} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={field} />
      <button type="submit" className="eyebrow link-draw pb-1">Check →</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
