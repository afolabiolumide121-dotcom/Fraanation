import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/events", label: "Events" },
  { to: "/collection", label: "Collection" },
  { to: "/community", label: "Community" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl" onClick={() => setOpen(false)}>
          FRAA<span className="bg-sun px-1">NATION</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="eyebrow hover:underline" activeProps={{ className: "underline decoration-sun decoration-4 underline-offset-4" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col border-t-2 border-ink bg-ink md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className="font-display border-b border-ink-foreground/10 px-4 py-4 text-3xl text-ink-foreground"
              activeProps={{ className: "text-sun" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/events" onClick={() => setOpen(false)} className="btn-sun m-4">Register free — Pool Party</Link>
        </nav>
      )}
    </header>
  );
}

export function Marquee({ text }: { text: string }) {
  const items = Array(8).fill(text);
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-sun py-3">
      <div className="marquee">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="font-display px-6 text-lg">{t} ✦</span>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="font-display text-[18vw] leading-none text-sun md:text-[10rem]">FRAA</p>
        <p className="font-editorial mt-4 text-2xl">Entertainment. Fashion. Culture. Nation.</p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-6">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="eyebrow opacity-80 hover:text-sun">{n.label}</Link>
          ))}
        </div>
        <p className="mt-10 text-xs opacity-50">© {new Date().getFullYear()} FRAANATION. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="border-b-2 border-ink px-4 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow"><span className="bg-sun px-2 py-1">{eyebrow}</span></p>
        <h1 className="font-display mt-6 text-6xl md:text-8xl">{title}</h1>
        {sub && <p className="font-editorial mt-4 max-w-xl text-2xl text-muted-foreground">{sub}</p>}
      </div>
    </section>
  );
}
