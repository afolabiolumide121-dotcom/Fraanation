import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Marquee } from "@/components/site-chrome";
import { heroImage, poolParty, products, formatNaira } from "@/lib/brand-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRAANATION — Entertainment, Fashion & Culture" },
      { name: "description", content: "FRAANATION is an entertainment, fashion and community brand. Free pool party coming next month." },
      { property: "og:title", content: "FRAANATION — Entertainment, Fashion & Culture" },
      { property: "og:description", content: "Events, THE FRAANATION COLLECTION and a community built for the culture." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden bg-ink text-ink-foreground">
        <img src={heroImage} alt="FRAANATION pool party crowd" width={1088} height={1440}
          className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-10">
          <p className="eyebrow"><span className="bg-sun px-2 py-1 text-ink">Upcoming · Free entry</span></p>
          <h1 className="font-display mt-5 text-[22vw] md:text-[11rem]">Pool<br /><span className="text-sun">Party</span></h1>
          <p className="font-editorial mt-3 text-2xl md:text-3xl">{poolParty.tagline}</p>
          <p className="eyebrow mt-3 opacity-80">{poolParty.month} · {poolParty.venue}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/events" className="btn-sun">Register free <ArrowRight size={16} /></Link>
            <Link to="/collection" className="btn-outline-light">Shop the drop</Link>
          </div>
        </div>
      </section>

      <Marquee text="FRAANATION · ENTERTAINMENT · FASHION · CULTURE" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The FRAANATION Collection</p>
            <h2 className="font-display mt-3 text-5xl md:text-7xl">Wear the <span className="font-editorial normal-case">signature</span></h2>
          </div>
          <Link to="/collection" className="eyebrow hidden underline md:block">View all</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {products.map((p, i) => (
            <Link to="/collection" key={p.id} className={i === 2 ? "col-span-2 md:col-span-1" : ""}>
              <div className="overflow-hidden border-2 border-ink bg-card">
                <img src={p.image} alt={p.name} loading="lazy" width={800} height={1008}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="mt-3 flex justify-between gap-2">
                <p className="text-sm font-bold uppercase">{p.name}</p>
                <p className="text-sm">{formatNaira(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-ink bg-sun px-4 py-16">
        <div className="mx-auto max-w-6xl md:grid md:grid-cols-2 md:gap-12">
          <h2 className="font-display text-6xl md:text-8xl">Not a brand.<br />A nation.</h2>
          <div className="mt-6 md:mt-0">
            <p className="font-editorial text-2xl md:text-3xl">
              FRAANATION brings entertainment, fashion and social culture together — events you remember, clothes with a signature, and a community that moves as one.
            </p>
            <Link to="/community" className="btn-ink mt-8">Join the community</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-px bg-ink md:grid-cols-3">
        {[
          { n: "01", t: "Events", d: "Parties, pop-ups and experiences.", to: "/events" as const },
          { n: "02", t: "Fashion", d: "Gen Z streetwear & poolwear, signed FRAA.", to: "/collection" as const },
          { n: "03", t: "Community", d: "Profiles, posts, chats — members only.", to: "/community" as const },
        ].map((c) => (
          <Link key={c.n} to={c.to} className="group bg-background p-8 transition-colors hover:bg-sun">
            <p className="eyebrow text-muted-foreground group-hover:text-ink">{c.n}</p>
            <h3 className="font-display mt-6 text-4xl">{c.t}</h3>
            <p className="mt-2 text-muted-foreground group-hover:text-ink">{c.d}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
