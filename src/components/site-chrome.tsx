import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { poolParty } from "@/lib/brand-data";

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
  const path = useRouterState({ select: (s) => s.location.pathname });
  const overHero = path === "/" && !open;
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  return (
    <>
      <header className={`${overHero ? "absolute text-ink-foreground" : "sticky bg-background text-foreground border-b hairline"} inset-x-0 top-0 z-50`}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="font-display text-[1.35rem] tracking-wide">
            FRAANATION<span className="text-sun">.</span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="eyebrow link-draw pb-1" activeProps={{ className: "text-sun" }}>{n.label}</Link>
            ))}
          </nav>
          <button className="eyebrow lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-ink px-5 pb-8 pt-20 text-ink-foreground lg:hidden">
          <nav className="flex flex-1 flex-col justify-center">
            {nav.map((n, i) => (
              <Link key={n.to} to={n.to} className="rise flex items-baseline gap-4 border-b border-ink-foreground/10 py-3"
                style={{ animationDelay: `${i * 50}ms` }} activeProps={{ className: "text-sun" }}>
                <span className="eyebrow w-6 opacity-50">0{i + 1}</span>
                <span className="font-display text-[3.4rem]">{n.label}</span>
              </Link>
            ))}
          </nav>
          <Link to="/events" hash="register" className="btn-light w-full">Register — Pool Party <span>→</span></Link>
        </div>
      )}
    </>
  );
}

export function EventTicker() {
  const t = `Upcoming — ${poolParty.title} · ${poolParty.price} entry · ${poolParty.month} · ${poolParty.city}`;
  const items = Array(6).fill(t);
  return (
    <Link to="/events" className="block overflow-hidden bg-ink py-3 text-ink-foreground">
      <div className="marquee">
        {[...items, ...items].map((x, i) => (
          <span key={i} className="eyebrow flex items-center gap-6 px-6">
            <span className="h-1.5 w-1.5 rounded-full bg-sun" />{x}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="font-editorial text-4xl md:col-span-6 md:text-6xl">
            A culture, <br />not a <span className="text-sun">moment.</span>
          </p>
          <nav className="grid grid-cols-2 gap-y-4 md:col-span-4 md:col-start-9">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="eyebrow link-draw w-fit opacity-80">{n.label}</Link>
            ))}
          </nav>
        </div>
        <p className="font-display mt-20 select-none text-[23vw] leading-[0.78] tracking-tight md:text-[17.5vw]">
          FRAANATION
        </p>
        <div className="flex justify-between border-t border-ink-foreground/15 py-5">
          <p className="eyebrow opacity-50">© {new Date().getFullYear()} FRAANATION</p>
          <p className="eyebrow opacity-50">Lagos — Worldwide</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ index, eyebrow, title, sub }: { index: string; eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-10 pt-12 md:px-10 md:pb-16 md:pt-20">
      <div className="flex items-center justify-between border-b hairline pb-4">
        <p className="eyebrow">{eyebrow}</p>
        <p className="eyebrow text-muted-foreground">N°{index}</p>
      </div>
      <h1 className="font-display rise mt-8 text-[22vw] md:text-[12rem]">{title}</h1>
      {sub && <p className="font-editorial rise mt-4 max-w-xl text-3xl md:ml-[40%] md:text-4xl" style={{ animationDelay: "120ms" }}>{sub}</p>}
    </section>
  );
}
