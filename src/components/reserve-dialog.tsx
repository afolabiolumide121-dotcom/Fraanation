import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TicketPass, mapsUrl } from "@/components/registration-form";
import { renderTicketImage } from "@/lib/ticket-image";
import { fetchEvent, reserveSpot, fallbackEvent, TICKET_KEY, WHATSAPP_GROUP_URL, type Ticket } from "@/lib/reservation";
import type { EventRow } from "@/lib/events.functions";

const Ctx = createContext<{ open: () => void; hasTicket: boolean }>({ open: () => {}, hasTicket: false });
export const useReserve = () => useContext(Ctx);

export function ReserveButton({ className, children }: { className?: string; children?: ReactNode }) {
  const { open, hasTicket } = useReserve();
  return (
    <button type="button" onClick={open} className={className}>
      {children ?? (hasTicket ? "View my ticket" : "Reserve your spot")} <span aria-hidden="true">→</span>
    </button>
  );
}

export function ReserveProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  useEffect(() => {
    try { const raw = localStorage.getItem(TICKET_KEY); if (raw) setTicket(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);
  const ev = useQuery({ queryKey: ["event", "pool-party"], queryFn: fetchEvent, staleTime: 60_000 }).data ?? fallbackEvent;

  function saved(t: Ticket) {
    try { localStorage.setItem(TICKET_KEY, JSON.stringify(t)); } catch { /* ignore */ }
    setTicket(t);
  }
  function forget() {
    try { localStorage.removeItem(TICKET_KEY); } catch { /* ignore */ }
    setTicket(null);
  }

  return (
    <Ctx.Provider value={{ open: () => setOpen(true), hasTicket: !!ticket }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto rounded-t-2xl bg-paper p-0 text-ink max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 sm:max-w-md sm:rounded-none">
          {ticket ? <TicketView t={ticket} ev={ev} onNew={forget} /> : <ReserveForm ev={ev} onDone={saved} />}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

const input = "w-full border-0 border-b hairline bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground focus:border-b-2 focus:border-ink";

function ReserveForm({ ev, onDone }: { ev: EventRow; onDone: (t: Ticket) => void }) {
  const [f, setF] = useState({ fullName: "", phone: "", email: "" });
  const [guests, setGuests] = useState(1);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const max = ev.max_guests_per_reservation || 4;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { fullName?: string; phone?: string; email?: string } = {};
    if (f.fullName.trim().length < 2) errs.fullName = "Please enter your full name";
    if (!/^[+\d\s()-]{7,20}$/.test(f.phone.trim())) errs.phone = "Enter a valid phone number";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) errs.email = "Enter a valid email";
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await reserveSpot({ ...f, guests });
    setBusy(false);
    if (res.ok) onDone(res.ticket);
    else setServerError(res.error);
  }

  if (!ev.registration_open) {
    return <div className="p-6"><DialogTitle className="font-display text-4xl">Reservations closed.</DialogTitle><DialogDescription className="mt-2">Follow us for the next one.</DialogDescription></div>;
  }

  const fields = [
    { k: "fullName", label: "Full name", type: "text", auto: "name", ph: "Your name" },
    { k: "phone", label: "WhatsApp number", type: "tel", auto: "tel", ph: "+234" },
    { k: "email", label: "Email address", type: "email", auto: "email", ph: "you@example.com" },
  ] as const;

  return (
    <form onSubmit={submit} noValidate>
      <div className="border-b border-ink/20 px-6 pb-5 pt-6">
        <p className="eyebrow"><span className="bg-sun px-2 py-1">Free entry</span></p>
        <DialogTitle className="font-display mt-4 text-5xl leading-[0.9]">Reserve your spot<span className="text-sun">.</span></DialogTitle>
        <DialogDescription className="mt-3 text-sm text-muted-foreground">{ev.title} · {ev.date_text} · {ev.venue}</DialogDescription>
      </div>
      <div className="space-y-5 px-6 py-6">
        {fields.map((x) => (
          <label key={x.k} className="block">
            <span className="block text-xs font-semibold">{x.label}</span>
            <input type={x.type} autoComplete={x.auto} placeholder={x.ph} value={f[x.k]} maxLength={x.k === "email" ? 255 : 100}
              onChange={(e) => setF({ ...f, [x.k]: e.target.value })} className={input} aria-invalid={Boolean(errors[x.k])} />
            {errors[x.k] && <span role="alert" className="mt-1 block text-sm text-destructive">{errors[x.k]}</span>}
          </label>
        ))}
        <div className="flex items-center justify-between border-y border-ink/20 py-4">
          <div><p className="text-xs font-semibold">How many people?</p><p className="mt-1 text-xs text-muted-foreground">Including you · up to {max}</p></div>
          <div className="flex items-center">
            <button type="button" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests(guests - 1)} className="h-11 w-10 text-xl disabled:opacity-30">−</button>
            <output aria-live="polite" className="font-display w-9 text-center text-4xl">{guests}</output>
            <button type="button" aria-label="More guests" disabled={guests >= max} onClick={() => setGuests(guests + 1)} className="h-11 w-10 text-xl disabled:opacity-30">+</button>
          </div>
        </div>
        {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
        <button type="submit" disabled={busy} className="flex min-h-14 w-full items-center justify-between bg-ink px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground hover:bg-sun hover:text-ink disabled:opacity-60">
          {busy ? "Getting your ticket…" : "Get my ticket"} <span aria-hidden="true">→</span>
        </button>
        <p className="text-xs text-muted-foreground">Your ticket appears instantly. Save it to your phone and show it at the door.</p>
      </div>
    </form>
  );
}

function TicketView({ t, ev, onNew }: { t: Ticket; ev: EventRow; onNew: () => void }) {
  const qrWrap = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const qr = qrWrap.current?.querySelector("canvas") ?? null;
      const blob = await renderTicketImage(t, ev, qr);
      const file = new File([blob], `FRAANATION-ticket-${t.code}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "My FRAANATION ticket" }); setMsg("Choose Save Image to keep it in your photos."); }
        catch { /* cancelled */ }
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        setMsg("Ticket saved to your downloads.");
      }
    } catch {
      setMsg("Couldn't save the image. Please screenshot your ticket instead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 pb-8 pt-6">
      <p className="eyebrow">{t.already ? "Already on the list" : "Reservation confirmed"}</p>
      <DialogTitle className="font-display mt-2 text-6xl leading-[0.9]">You're in<span className="text-sun">.</span></DialogTitle>
      <DialogDescription className="mt-2 text-sm text-muted-foreground">Save your ticket and show it at the entrance.</DialogDescription>
      <div className="mt-6"><TicketPass t={t} ev={ev} /></div>
      <div ref={qrWrap} aria-hidden="true" style={{ position: "absolute", left: -9999, top: 0 }}>
        <QRCodeCanvas value={t.code} size={300} marginSize={1} bgColor="#FFFFFF" fgColor="#111111" />
      </div>
      <div className="mt-6 grid gap-3">
        <button onClick={save} disabled={saving} className="btn-ink w-full disabled:opacity-60">{saving ? "Preparing ticket…" : "Download my ticket"} <span>↓</span></button>
        <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer" className="btn-ink w-full">Join our WhatsApp group <span>→</span></a>
        <a href={mapsUrl(`${ev.venue}, ${ev.address}`)} target="_blank" rel="noreferrer" className="eyebrow link-draw mx-auto w-fit pb-1">Get directions ↗</a>
        {msg && <p className="text-center text-sm text-muted-foreground">{msg}</p>}
        <button onClick={onNew} className="eyebrow mx-auto mt-2 w-fit opacity-60">Reserve for someone else</button>
      </div>
    </div>
  );
}
