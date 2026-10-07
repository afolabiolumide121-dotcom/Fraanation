import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
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
        <p className="font-display mt-4 text-7xl leading-[0.8]">AFTER<br />DARK<span className="text-sun">.</span></p>
        <p className="font-editorial mt-3 text-xl">{ev.tagline}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 py-5 text-sm">
        <div><p className="eyebrow text-muted-foreground">Date</p><p className="mt-1 font-semibold">{ev.date_text}</p></div>
        <div><p className="eyebrow text-muted-foreground">Time</p><p className="mt-1 font-semibold">{ev.time_text}</p></div>
        <div className="col-span-2 border-y border-ink/20 py-4"><p className="eyebrow text-muted-foreground">Your destination</p><p className="mt-2 font-display text-3xl leading-tight">{ev.venue}</p><address className="mt-2 text-base not-italic leading-relaxed">{ev.address}</address><a href={mapsUrl(`${ev.venue}, ${ev.address}`)} target="_blank" rel="noreferrer" className="mt-3 inline-block border-b border-ink text-sm font-semibold">Open in Maps ↗</a></div>
        <div><p className="eyebrow text-muted-foreground">Guest</p><p className="mt-1 break-words font-semibold">{t.fullName}</p></div>
        <div><p className="eyebrow text-muted-foreground">Entry</p><p className="mt-1 font-semibold">Free</p></div>
      </div>
      <div className="relative border-t-2 border-dashed border-ink/25 px-6 py-6">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-background" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background" />
        <div className="flex flex-wrap items-center gap-4">
          <div className="shrink-0 bg-background p-2"><QRCodeSVG value={t.code} size={80} bgColor="transparent" fgColor="currentColor" /></div>
          <div className="min-w-0">
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
  const text = "I'M GOING TO FRAANATION AFTER DARK.\nNOV 25.\n9PM TILL DAWN.\nFRAANATION.";
  async function share() {
    const url = `${window.location.origin}/events`;
    try {
      if (navigator.share) await navigator.share({ title: "FRAANATION After Dark", text, url });
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

  return (
    <form onSubmit={submit} noValidate className="reservation-sheet bg-paper text-ink">
      <div className="border-b border-ink/20 px-5 py-6 sm:px-7">
        <div className="flex items-center justify-between gap-3"><p className="eyebrow">FRAANATION · Guest list</p><span className="eyebrow shrink-0 bg-sun px-2 py-1">Free entry</span></div>
        <h2 className="font-display mt-6 text-6xl leading-[0.9]">Your night.<br />Your <span className="font-editorial text-5xl normal-case">invitation.</span></h2>
        <p className="mt-4 text-sm text-muted-foreground">{ev.title} · {ev.date_text}</p>
      </div>
      <div className="px-5 py-6 sm:px-7">
        <p className="eyebrow mb-6 flex items-center gap-3"><span className="font-display text-2xl">01</span> On the list</p>
        <div className="space-y-5">
          {inputs.map((f) => (
            <label key={f.k} className="block">
              <span className="block text-xs font-semibold">{f.label}</span>
              <input id={`reservation-${f.k}`} type={f.type} autoComplete={f.auto} placeholder={f.k === "username" || f.k === "instagram" ? "@yourname" : f.k === "phone" ? "+234" : f.k === "email" ? "you@example.com" : "Your name"} value={form[f.k]} maxLength={f.k === "email" ? 255 : 100}
                aria-invalid={Boolean(errors[f.k])} aria-describedby={errors[f.k] ? `error-${f.k}` : undefined}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={field + " transition-colors focus:border-b-2"} />
              {errors[f.k] && <span id={`error-${f.k}`} role="alert" className="mt-1 block text-sm text-destructive">{errors[f.k]}</span>}
            </label>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3 border-y border-ink/20 py-5">
          <div><p className="eyebrow">02 · Your people</p><p className="mt-2 text-xs text-muted-foreground">Including you · up to {max}</p></div>
          <div className="flex shrink-0 items-center">
            <Button variant="ghost" type="button" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests(guests - 1)} className="h-11 w-10 p-0 text-xl">−</Button>
            <output aria-live="polite" aria-label="Number of guests" className="font-display w-9 text-center text-4xl">{guests}</output>
            <Button variant="ghost" type="button" aria-label="More guests" disabled={guests >= max} onClick={() => setGuests(guests + 1)} className="h-11 w-10 p-0 text-xl">+</Button>
          </div>
        </div>
        {serverError && <p role="alert" className="mt-4 text-sm text-destructive">{serverError}</p>}
        <Button type="submit" disabled={busy} className="mt-6 h-auto min-h-14 w-full justify-between whitespace-normal bg-ink px-5 py-4 text-xs uppercase tracking-normal text-ink-foreground shadow-none hover:bg-sun hover:text-ink">{busy ? "Reserving…" : "Reserve your spot"} <span aria-hidden="true">→</span></Button>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Your username will be saved for your FRAANATION community profile.</p>
      </div>
      <div className="border-t-2 border-dashed border-ink/25 px-5 py-6 sm:px-7">
        <p className="eyebrow text-muted-foreground">03 · Meet us here</p>
        <p className="font-display mt-3 text-3xl leading-tight">{ev.venue}</p>
        <address className="mt-2 text-sm not-italic leading-relaxed">{ev.address}</address>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold">{ev.time_text}</p><a href={mapsUrl(`${ev.venue}, ${ev.address}`)} target="_blank" rel="noreferrer" className="border-b border-ink text-xs font-semibold">Get directions ↗</a></div>
      </div>
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
