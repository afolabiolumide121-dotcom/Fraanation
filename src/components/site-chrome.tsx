import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { poolParty } from "@/lib/brand-data";
import { useCart } from "@/lib/cart";
import { ReserveButton } from "@/components/reserve-dialog";

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
  const { count } = useCart();
  const overHero = path === "/" && !open;
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  return (
    <>
      <header className={`${overHero ? "absolute text-ink-foreground" : "sticky border-b border-ink/10 bg-background/85 text-foreground backdrop-blur-md"} inset-x-0 top-0 z-50`}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="font-display text-[1.3rem] tracking-wide">
            FRAANATION<span className="text-sun">.</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-sm font-medium opacity-70 transition-opacity hover:opacity-100" activeProps={{ className: "!opacity-100" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="flex min-h-11 items-center gap-1.5 px-3 text-sm font-medium">
              Bag{count > 0 && <span className="rounded-full bg-sun px-1.5 text-xs font-bold text-ink">{count}</span>}
            </Link>
            <ReserveButton className={`hidden min-h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold sm:inline-flex ${overHero ? "bg-white text-ink" : "bg-ink text-ink-foreground"}`}>Reserve</ReserveButton>
            <button className="min-h-11 px-3 text-sm font-medium lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background px-5 pb-8 pt-24 text-foreground lg:hidden">
          <nav className="flex flex-1 flex-col justify-center">
            {nav.map((n, i) => (
              <Link key={n.to} to={n.to} className="rise border-b border-ink/10 py-3 font-head text-[2.4rem]"
                style={{ animationDelay: `${i * 50}ms` }} activeProps={{ className: "text-muted-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <ReserveButton className="btn-ink w-full">Reserve — After Dark</ReserveButton>
        </div>
      )}
    </>
  );
}

export function EventTicker() {
  const t = `${poolParty.title} · ${poolParty.month} · ${poolParty.time} · Free entry by reservation`;
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
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-display text-3xl tracking-wide">FRAANATION<span className="text-sun">.</span></p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-70">Entertainment, fashion and community. A culture, not a moment.</p>
            <ReserveButton className="btn-sun mt-8 w-full md:w-auto" />
          </div>
          <nav className="grid grid-cols-2 gap-y-3 md:col-span-4 md:col-start-9">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="w-fit text-sm opacity-70 transition-opacity hover:opacity-100">{n.label}</Link>
            ))}
          </nav>
        </div>
        <div className="mt-16 flex justify-between border-t border-ink-foreground/15 pt-6 text-xs opacity-50">
          <p>© {new Date().getFullYear()} FRAANATION</p>
          <p>Lagos — Worldwide</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, sub }: { index?: string; eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:px-10 md:pb-20 md:pt-28">
        <p className="rise eyebrow text-muted-foreground"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-sun align-middle" />{eyebrow}</p>
        <h1 className="font-head rise mt-6 text-[clamp(3rem,12vw,9rem)]" style={{ animationDelay: "80ms" }}>{title}<span className="text-sun">.</span></h1>
        {sub && <p className="font-editorial rise mt-6 max-w-xl text-2xl text-muted-foreground md:text-3xl" style={{ animationDelay: "160ms" }}>{sub}</p>}
      </div>
    </section>
  );
}
