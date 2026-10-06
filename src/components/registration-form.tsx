import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import { registerForEvent, lookupRegistration, registrationSchema, type EventRow } from "@/lib/events.functions";

const field = "w-full border-0 border-b hairline bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground focus:border-ink";
const TICKET_KEY = "fraa-splash-ticket";

export type Ticket = { code: string; fullName: string; guests: number; already?: boolean };

export function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function TicketPass({ t, ev }: { t: Ticket; ev: EventRow }) {
  return (
    <div className="rise mx-auto w-full max-w-sm bg-paper text-ink">
      <div className="bg-ink px-6 pb-6 pt-5 text-ink-foreground">
        <div className="flex items-center justify-between">
          <p className="eyebrow">FRAANATION presents</p>
          <p className="eyebrow text-sun">Admit {t.guests}</p>
        </div>
        <p className="font-display mt-4 text-7xl leading-[0.8]">FRAA<br />SPLASH<span className="text-sun">.</span></p>
        <p className="font-editorial mt-3 text-xl">{ev.tagline}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 py-5 text-sm">
        <div><p className="eyebrow text-muted-foreground">Date</p><p className="mt-1 font-semibold">{ev.date_text}</p></div>
        <div><p className="eyebrow text-muted-foreground">Time</p><p className="mt-1 font-semibold">{ev.time_text}</p></div>
        <div className="col-span-2"><p className="eyebrow text-muted-foreground">Venue</p><p className="mt-1 font-semibold">{ev.venue}</p><p className="text-muted-foreground">{ev.address}</p></div>
        <div><p className="eyebrow text-muted-foreground">Guest</p><p className="mt-1 font-semibold">{t.fullName}</p></div>
        <div><p className="eyebrow text-muted-foreground">Entry</p><p className="mt-1 font-semibold">Free</p></div>
      </div>
      <div className="relative border-t-2 border-dashed border-ink/25 px-6 py-6">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-background" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background" />
        <div className="flex items-center gap-5">
          <div className="bg-background p-2"><QRCodeSVG value={t.code} size={96} bgColor="transparent" fgColor="currentColor" /></div>
          <div>
            <p className="eyebrow text-muted-foreground">Reservation</p>
            <p className="font-display mt-1 text-3xl tracking-wide">{t.code}</p>
            <p className="eyebrow mt-2"><span className="bg-sun px-1.5 py-0.5">Reservation confirmed</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function YoureIn({ t, ev, onReset }: { t: Ticket; ev: EventRow; onReset: () => void }) {
  const [shareMsg, setShareMsg] = useState("");
  const text = "I'M GOING TO FRAA SPLASH.\nNOV 25.\n9PM TILL DAWN.\nFRAANATION.";
  async function share() {
    const url = `${window.location.origin}/events`;
    try {
      if (navigator.share) await navigator.share({ title: "FRAA SPLASH", text, url });
      else { await navigator.clipboard.writeText(`${text}\n${url}`); setShareMsg("Copied — paste it anywhere."); }
    } catch { /* user cancelled */ }
  }
  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-sun">{t.already ? "Already on the list" : "Reservation confirmed"}</p>
        <p className="font-display rise mt-3 text-7xl">You're in<span className="text-sun">.</span></p>
        <p className="mt-3 text-sm opacity-70">Screenshot your pass and show it at the entrance. Keep your reference safe.</p>
      </div>
      <TicketPass t={t} ev={ev} />
      <div className="grid gap-3">
        <button onClick={share} className="btn-light w-full">Share — I'm going <span>↗</span></button>
        <a href={mapsUrl(`${ev.venue}, ${ev.address}`)} target="_blank" rel="noreferrer" className="btn-light w-full">Get directions <span>→</span></a>
        {shareMsg && <p className="text-sm opacity-70">{shareMsg}</p>}
      </div>
      <div className="border-t border-ink-foreground/20 pt-8">
        <p className="font-editorial text-3xl">Welcome to FRAANATION.</p>
        <nav className="mt-6 border-t border-ink-foreground/15">
          {[
            ["/collection", "Explore the collection"],
            ["/community", "Join the community"],
            ["/about", "Discover FRAANATION"],
          ].map(([to, l]) => (
            <Link key={to} to={to as "/collection"} className="eyebrow flex min-h-14 items-center justify-between border-b border-ink-foreground/15">{l} <span>→</span></Link>
          ))}
          <button onClick={() => document.getElementById("pass")?.scrollIntoView({ behavior: "smooth" })} className="eyebrow flex min-h-14 w-full items-center justify-between border-b border-ink-foreground/15">View your ticket <span>↑</span></button>
        </nav>
        <p className="mt-6 text-sm opacity-70">Member profiles are coming to the community — reserve now, and claim your username when it opens.</p>
        <button onClick={onReset} className="eyebrow link-draw mt-6 opacity-60">Reserve for someone else</button>
      </div>
    </div>
  );
}

export function RegistrationForm({ ev }: { ev: EventRow }) {
  const register = useServerFn(registerForEvent);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", username: "", instagram: "" });
  const [guests, setGuests] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [serverError, setServerError] = useState("");
  const max = ev.max_guests_per_reservation || 4;

  useEffect(() => {
    try { const raw = localStorage.getItem(TICKET_KEY); if (raw) setTicket(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);

  if (ticket) return <div id="pass"><YoureIn t={ticket} ev={ev} onReset={() => { localStorage.removeItem(TICKET_KEY); setTicket(null); }} /></div>;
  if (!ev.registration_open) return <p className="font-display text-4xl">Reservations closed.</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const parsed = registrationSchema.safeParse({ slug: ev.slug, ...form, username: form.username.replace(/^@/, ""), instagram: form.instagram.replace(/^@/, ""), guests });
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
      if (res.ok) {
        const t = { code: res.code, fullName: res.fullName, guests: res.guests, already: res.already };
        localStorage.setItem(TICKET_KEY, JSON.stringify(t));
        setTicket(t);
        document.getElementById("reserve")?.scrollIntoView({ behavior: "smooth" });
      } else setServerError(res.error);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputs = [
    { k: "fullName", label: "Full name", type: "text", auto: "name" },
    { k: "email", label: "Email address", type: "email", auto: "email" },
    { k: "phone", label: "Phone (WhatsApp)", type: "tel", auto: "tel" },
    { k: "username", label: "Choose a FRAANATION username", type: "text", auto: "username" },
    { k: "instagram", label: "Instagram (optional)", type: "text", auto: "off" },
  ] as const;

  const darkField = field.replace("focus:border-ink", "focus:border-sun") + " placeholder:text-ink-foreground/45";

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <p className="eyebrow text-sun">Free reservation</p>
      {inputs.map((f) => (
        <label key={f.k} className="block">
          <span className="sr-only">{f.label}</span>
          <input type={f.type} autoComplete={f.auto} placeholder={f.label} value={form[f.k]} maxLength={f.k === "email" ? 255 : 100}
            onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={darkField} />
          {errors[f.k] && <span className="mt-1 block text-sm text-sun">{errors[f.k]}</span>}
        </label>
      ))}
      <div className="flex items-center justify-between border-b hairline py-3">
        <span className="text-lg opacity-80">Guests <span className="text-sm opacity-60">(incl. you, max {max})</span></span>
        <div className="flex items-center">
          <button type="button" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests(guests - 1)} className="h-11 w-11 text-xl disabled:opacity-30">−</button>
          <span className="font-display w-8 text-center text-3xl">{guests}</span>
          <button type="button" aria-label="More guests" disabled={guests >= max} onClick={() => setGuests(guests + 1)} className="h-11 w-11 text-xl disabled:opacity-30">+</button>
        </div>
      </div>
      {serverError && <p className="text-sm text-sun">{serverError}</p>}
      <button type="submit" disabled={busy} className="btn-light w-full">{busy ? "Reserving…" : "Reserve your spot"} <span>→</span></button>
      <p className="text-xs opacity-60">Your username will be saved for your FRAANATION community profile.</p>
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
      if (!r) setMsg("No reservation found for that reference and email.");
      else if (r.status === "cancelled") setMsg(`Reservation ${r.code} has been cancelled.`);
      else setMsg(`Confirmed — ${r.full_name}, ${r.guests} ${r.guests === 1 ? "guest" : "guests"} for ${r.event_title}.`);
    } catch { setMsg("Check your reference and email and try again."); }
  }
  return (
    <form onSubmit={go} className="space-y-4">
      <p className="eyebrow">Find your reservation</p>
      <input placeholder="Reference (FRAA-XXXXXX)" value={code} onChange={(e) => setCode(e.target.value)} maxLength={20} className={field} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={field} />
      <button type="submit" className="btn-ink w-full">Check <span>→</span></button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
