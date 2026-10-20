import { Link } from "@tanstack/react-router";
import { poolParty } from "@/lib/brand-data";
import { useReserve } from "@/components/reserve-dialog";

/** The event, drawn as a clean ticket card. */
export function TicketCard({ onReserve, hasTicket }: { onReserve: () => void; hasTicket: boolean }) {
  return (
    <div className="reveal relative mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white text-ink shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)] md:mx-0 md:ml-auto">
      <div className="px-6 pb-6 pt-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted-foreground">FRAANATION presents</p>
          <span className="rounded-full bg-sun px-3 py-1 text-xs font-bold">Free entry</span>
        </div>
        <p className="font-display mt-6 text-[4.75rem] leading-[0.82]">After<br />Dark<span className="text-sun">.</span></p>
        <p className="font-editorial mt-4 text-xl text-muted-foreground">{poolParty.tagline}</p>
        <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
          <div><dt className="text-xs text-muted-foreground">Date</dt><dd className="mt-1 font-semibold">{poolParty.date}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Time</dt><dd className="mt-1 font-semibold">{poolParty.time}</dd></div>
          <div className="col-span-2 border-t border-ink/10 pt-5">
            <dt className="text-xs text-muted-foreground">Venue</dt>
            <dd className="mt-1 text-lg font-semibold">{poolParty.venue}</dd>
            <dd className="mt-0.5 text-sm text-muted-foreground">{poolParty.address}</dd>
          </div>
        </dl>
      </div>
      <div className="relative border-t border-dashed border-ink/20 bg-[oklch(0.975_0.003_95)] px-6 pb-6 pt-5">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-ink/10 bg-background" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-ink/10 bg-background" />
        <div className="barcode h-10 w-full opacity-80" aria-hidden="true" />
        <p className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Admit one</span><span>Reservation required</span></p>
        <button type="button" onClick={onReserve} className="btn-ink mt-5 w-full">{hasTicket ? "View my ticket" : "Get my ticket"} <span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}

/** A clean, swipeable row of photos. The last card is the invitation. */
export function PhotoRow({ frames, onReserve, hasTicket }: { frames: [string, string, string][]; onReserve: () => void; hasTicket: boolean }) {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {frames.map(([src, alt, label]) => (
        <Link to="/gallery" key={alt} className="group w-[72vw] shrink-0 snap-center md:w-auto">
          <div className="overflow-hidden rounded-[1.5rem]">
            <img src={src} alt={alt} loading="lazy" className="img-editorial aspect-[4/5] w-full object-cover" />
          </div>
          <p className="mt-3 text-sm font-medium">{label}</p>
        </Link>
      ))}
      <button type="button" onClick={onReserve} className="flex aspect-[4/5] w-[72vw] shrink-0 snap-center flex-col justify-between rounded-[1.5rem] bg-ink p-6 text-left text-ink-foreground md:w-auto">
        <span className="eyebrow text-sun">Nov 27</span>
        <span className="font-head text-5xl">You're<br />next.</span>
        <span className="flex items-center justify-between text-sm font-semibold">{hasTicket ? "View my ticket" : "Reserve your spot"} <span aria-hidden="true">→</span></span>
      </button>
    </div>
  );
}

/** Closing call-to-action used at the end of inner pages. */
export function CtaBand({ line, accent, secondary }: { line: string; accent: string; secondary?: { to: "/community" | "/collection" | "/events"; label: string } }) {
  const { open, hasTicket } = useReserve();
  return (
    <section className="px-3 pb-3 md:px-6 md:pb-6">
      <div className="mx-auto max-w-[1400px] rounded-[2rem] bg-ink px-6 py-16 text-ink-foreground md:px-16 md:py-28">
        <p className="eyebrow text-sun">After Dark · Nov 27 · Free entry</p>
        <h2 className="font-head reveal mt-5 max-w-4xl text-[clamp(2.5rem,9vw,6.5rem)]">{line} <span className="text-sun">{accent}</span></h2>
        <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <button type="button" onClick={open} className="btn-sun w-full md:w-auto">{hasTicket ? "View my ticket" : "Reserve your spot — it's free"} <span aria-hidden="true">→</span></button>
          {secondary && <Link to={secondary.to} className="link-draw w-fit pb-1 text-sm font-semibold">{secondary.label} →</Link>}
        </div>
      </div>
    </section>
  );
}
