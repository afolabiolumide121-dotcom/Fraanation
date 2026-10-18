import { Link } from "@tanstack/react-router";
import { poolParty } from "@/lib/brand-data";

/** Rotating RSVP sticker for the hero. */
export function Sticker({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Reserve your free spot"
      className="absolute right-4 top-[21%] z-10 h-28 w-28 transition-transform hover:scale-105 md:right-16 md:top-[26%] md:h-40 md:w-40">
      <svg viewBox="0 0 200 200" className="spin-slow h-full w-full" aria-hidden="true">
        <defs><path id="sticker-ring" d="M100,100 m-79,0 a79,79 0 1,1 158,0 a79,79 0 1,1 -158,0" /></defs>
        <circle cx="100" cy="100" r="99" fill="#FFD900" />
        <text fontSize="17" fontWeight="700" fill="#111" style={{ fontFamily: "Archivo, system-ui, sans-serif" }}>
          <textPath href="#sticker-ring" textLength="492" lengthAdjust="spacing">FREE ENTRY ✦ NOV 25 ✦ LAGOS ✦ AFTER DARK ✦ </textPath>
        </text>
      </svg>
      <span className="font-display absolute inset-0 grid place-items-center text-3xl text-ink md:text-5xl">RSVP</span>
    </button>
  );
}

const tape = "AFTER DARK ✦ NOV 25 ✦ THE GRAND ELYSIUM ✦ FREE ENTRY ✦ 9PM TILL DAWN ✦ ";

function Band({ className, reverse }: { className: string; reverse?: boolean }) {
  return (
    <div className={`absolute left-[-5%] w-[110%] overflow-hidden whitespace-nowrap py-2.5 ${className}`}>
      <div className={`marquee font-display text-3xl md:text-5xl ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className="px-3">{tape}</span>)}
      </div>
    </div>
  );
}

/** Two crossing tape bands between hero and content. */
export function TapeBands() {
  return (
    <div aria-hidden="true" className="relative h-32 overflow-hidden bg-ink md:h-44">
      <Band className="top-7 -rotate-2 bg-sun text-ink md:top-10" />
      <Band reverse className="top-14 rotate-2 bg-white text-ink md:top-20" />
    </div>
  );
}

/** The event, drawn as a ticket stub. */
export function TicketCard({ onReserve, hasTicket }: { onReserve: () => void; hasTicket: boolean }) {
  return (
    <div className="reveal relative mx-auto w-full max-w-md rotate-[-1.2deg] bg-paper text-ink shadow-[10px_10px_0_#FFD900] transition-transform duration-500 hover:rotate-0 md:mx-0 md:ml-auto">
      <span className="font-display absolute -right-2 -top-4 rotate-[8deg] border-2 border-ink bg-sun px-3 py-1 text-2xl">Free entry</span>
      <div className="px-6 pb-6 pt-7">
        <p className="eyebrow text-muted-foreground">FRAANATION presents</p>
        <p className="font-display mt-3 text-[5.5rem] leading-[0.8]">After<br />Dark<span className="text-sun">.</span></p>
        <p className="font-editorial mt-3 text-2xl">{poolParty.tagline}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <div><dt className="eyebrow text-muted-foreground">Date</dt><dd className="mt-1 font-semibold">{poolParty.date}</dd></div>
          <div><dt className="eyebrow text-muted-foreground">Time</dt><dd className="mt-1 font-semibold">{poolParty.time}</dd></div>
          <div className="col-span-2 border-t hairline pt-4">
            <dt className="eyebrow text-muted-foreground">Venue</dt>
            <dd className="font-display mt-2 text-3xl leading-tight">{poolParty.venue}</dd>
            <dd className="mt-1 text-sm">{poolParty.address}</dd>
          </div>
        </dl>
      </div>
      <div className="relative border-t-2 border-dashed border-ink/30 px-6 pb-6 pt-5">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-ink" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-ink" />
        <div className="barcode h-12 w-full" aria-hidden="true" />
        <p className="eyebrow mt-2 flex justify-between"><span>Admit one</span><span>Reservation required</span></p>
        <button type="button" onClick={onReserve} className="btn-ink mt-5 w-full">{hasTicket ? "View my ticket" : "Get my ticket"} <span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}

/** A strip of film. The last frame is the invitation. */
export function FilmStrip({ frames, onReserve, hasTicket }: { frames: [string, string, string][]; onReserve: () => void; hasTicket: boolean }) {
  return (
    <div className="relative -mx-5 overflow-hidden py-10 md:mx-0">
      <div className="-rotate-1 bg-[#0a0a0a] py-2 ring-1 ring-white/10">
        <div className="sprockets" />
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 py-3 md:grid md:grid-cols-4 md:overflow-visible">
          {frames.map(([src, alt, label], i) => (
            <Link to="/gallery" key={alt} className="group relative w-[68vw] shrink-0 snap-center overflow-hidden md:w-auto">
              <img src={src} alt={alt} loading="lazy" className="img-editorial aspect-[4/5] w-full object-cover" />
              <span className="font-display absolute left-2 top-2 text-lg text-sun">{String(i + 1).padStart(2, "0")}</span>
              <span className="eyebrow absolute bottom-2 left-2 text-white">{label}</span>
            </Link>
          ))}
          <button type="button" onClick={onReserve} className="flex aspect-[4/5] w-[68vw] shrink-0 snap-center flex-col justify-between bg-sun p-5 text-left text-ink md:w-auto">
            <span className="font-display text-lg">{String(frames.length + 1).padStart(2, "0")}</span>
            <span className="font-display text-6xl leading-[0.85]">You're<br />next.</span>
            <span className="eyebrow">{hasTicket ? "View my ticket" : "Reserve your spot"} →</span>
          </button>
        </div>
        <div className="sprockets" />
      </div>
    </div>
  );
}
