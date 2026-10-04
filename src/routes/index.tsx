import { createFileRoute, Link } from "@tanstack/react-router";
import { EventTicker } from "@/components/site-chrome";
import { heroImage, lookTeeImage, crowdImage, poolParty, products, formatNaira } from "@/lib/brand-data";

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
      {/* HERO — full-bleed editorial cover */}
      <section className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-ink-foreground">
        <img src={heroImage} alt="FRAANATION summer" width={1088} height={1440}
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[60%_center] animate-in fade-in zoom-in-105 duration-[2000ms]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/85" />

        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-5 pt-24 md:px-10">
          <div className="flex justify-between">
            <p className="eyebrow rise">Issue 01 — Summer</p>
            <p className="eyebrow rise hidden md:block">Lagos / Worldwide</p>
          </div>

          <div className="mt-auto pb-8">
            <p className="font-editorial rise text-[2.6rem] leading-none md:text-7xl" style={{ animationDelay: "150ms" }}>
              The summer belongs to
            </p>
            <h1 className="font-display rise -ml-1 text-[19.5vw] leading-[0.8] md:text-[15vw]" style={{ animationDelay: "250ms" }}>
              FRAA<span className="text-sun">NATION</span>
            </h1>

            <Link to="/events" className="rise group mt-8 flex items-end justify-between gap-6 border-t border-ink-foreground/30 pt-5 md:max-w-xl" style={{ animationDelay: "400ms" }}>
              <div>
                <p className="eyebrow text-sun">Upcoming experience</p>
                <p className="font-display mt-2 text-4xl">{poolParty.title}</p>
                <p className="eyebrow mt-2 opacity-70">{poolParty.price} entry · {poolParty.month} · {poolParty.venue}</p>
              </div>
              <span className="eyebrow whitespace-nowrap border-b border-ink-foreground pb-1 transition-colors group-hover:border-sun group-hover:text-sun">Register →</span>
            </Link>
          </div>
        </div>
      </section>

      <EventTicker />

      {/* MANIFESTO — asymmetric */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="eyebrow text-muted-foreground md:col-span-2">(01) Who we are</p>
          <h2 className="font-editorial text-[2.5rem] md:col-span-9 md:text-[5.2rem]">
            Entertainment, fashion and social culture — moving as one <span className="not-italic font-display text-[0.9em] tracking-normal">nation.</span>
          </h2>
        </div>
        <div className="mt-14 grid gap-10 md:mt-24 md:grid-cols-12">
          <Link to="/about" className="group overflow-hidden md:col-span-5 md:col-start-2">
            <img src={crowdImage} alt="FRAANATION crowd" loading="lazy" width={1600} height={1008} className="img-editorial aspect-[4/5] w-full object-cover md:aspect-[4/3]" />
          </Link>
          <div className="flex flex-col justify-end md:col-span-4 md:col-start-8">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Events you remember. Clothes with a signature. A community that shows up. FRAANATION is built for a generation that dresses loud and creates together.
            </p>
            <Link to="/about" className="eyebrow link-draw mt-8 w-fit pb-1">Read the story →</Link>
          </div>
        </div>
      </section>

      {/* COLLECTION — lookbook split */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
          <div className="flex items-end justify-between border-b hairline pb-5">
            <p className="eyebrow">(02) The FRAANATION Collection</p>
            <Link to="/collection" className="eyebrow link-draw pb-1">Shop all →</Link>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-8">
            <Link to="/collection" className="group relative overflow-hidden md:col-span-7">
              <img src={lookTeeImage} alt="FRAA Heavyweight Tee lookbook" loading="lazy" width={1088} height={1440} className="img-editorial aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-ink-foreground">
                <p className="font-display text-[15vw] leading-none md:text-[7rem]">Drop 01</p>
                <p className="font-editorial text-2xl">Signed FRAA.</p>
              </div>
            </Link>

            <div className="flex flex-col gap-10 md:col-span-4 md:col-start-9 md:pt-32">
              {products.slice(0, 2).map((p, i) => (
                <Link to="/collection" key={p.id} className="group block">
                  <div className="overflow-hidden bg-background">
                    <img src={p.image} alt={p.name} loading="lazy" width={800} height={1008} className="img-editorial aspect-[4/5] w-full object-cover" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <p className="eyebrow text-muted-foreground">N°0{i + 1}</p>
                    <p className="eyebrow">{formatNaira(p.price)}</p>
                  </div>
                  <p className="font-display mt-1 text-3xl">{p.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVENT FEATURE */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-40">
        <p className="eyebrow text-muted-foreground">(03) Upcoming</p>
        <div className="mt-8 grid items-end gap-10 md:grid-cols-12">
          <h2 className="font-display text-[24vw] md:col-span-8 md:text-[13rem]">
            Pool<br /><span className="font-editorial normal-case tracking-tight">Party</span>
          </h2>
          <div className="md:col-span-4">
            <dl className="divide-y hairline border-y hairline">
              {[["Date", poolParty.date], ["Venue", poolParty.venue], ["Entry", poolParty.price], ["City", poolParty.city]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3">
                  <dt className="eyebrow text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-semibold">{k === "Entry" ? <span className="bg-sun px-1.5">{v}</span> : v}</dd>
                </div>
              ))}
            </dl>
            <Link to="/events" className="btn-ink mt-6 w-full">Event details <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY — black block */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-36">
          <div className="md:col-span-6">
            <p className="eyebrow text-sun">(04) Members only</p>
            <h2 className="font-display mt-6 text-[17vw] md:text-[8rem]">The<br />Nation</h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 md:self-end">
            <ul className="border-t border-ink-foreground/15">
              {["Profiles", "Posts & pictures", "Likes, comments, follows", "Private messages"].map((f, i) => (
                <li key={f} className="flex items-baseline justify-between border-b border-ink-foreground/15 py-4">
                  <span className="font-editorial text-2xl md:text-3xl">{f}</span>
                  <span className="eyebrow opacity-40">0{i + 1}</span>
                </li>
              ))}
            </ul>
            <Link to="/community" className="btn-light mt-8 w-full">Enter the community <span>→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
