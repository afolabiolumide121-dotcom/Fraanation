import { createFileRoute, Link } from "@tanstack/react-router";
import { TicketCard, PhotoRow } from "@/components/flair";
import { Countdown } from "@/components/countdown";
import { useReserve } from "@/components/reserve-dialog";
import { heroImage, lookTeeImage, crowdImage, poolParty, products, formatNaira } from "@/lib/brand-data";
import event1 from "@/assets/event-1.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRAANATION — Entertainment, Fashion & Culture" },
      { name: "description", content: "FRAANATION is an entertainment, fashion and community brand. FRAANATION After Dark — Nov 27, 2026, Lagos. Free entry by reservation." },
      { property: "og:title", content: "FRAANATION — Entertainment, Fashion & Culture" },
      { property: "og:description", content: "Events, THE FRAANATION COLLECTION and a community built for the culture." },
    ],
  }),
  component: Index,
});

function Index() {
  const { open, hasTicket } = useReserve();
  return (
    <>
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[620px] overflow-hidden rounded-b-[2rem] bg-ink text-ink-foreground md:rounded-b-[3rem]">
        <img src={heroImage} alt="FRAANATION summer" width={1088} height={1440}
          className="absolute inset-0 h-full w-full object-cover object-[60%_center] animate-in fade-in duration-[1500ms]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/85" />

        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-5 pt-24 md:px-10">
          <p className="rise text-sm font-medium opacity-90">After Dark · Nov 27 · Lagos</p>

          <div className="mt-auto pb-10 md:pb-14">
            <p className="font-editorial rise whitespace-nowrap text-[2.1rem] leading-none md:text-6xl" style={{ animationDelay: "120ms" }}>
              The summer belongs to
            </p>
            <h1 className="font-display rise -ml-1 mt-1 text-[17vw] leading-[0.82] md:text-[13vw]" style={{ animationDelay: "220ms" }}>
              FRAA<span className="text-sun">NATION</span>
            </h1>
            <div className="rise mt-8 flex flex-col gap-4 md:flex-row md:items-center md:gap-8" style={{ animationDelay: "340ms" }}>
              <button type="button" onClick={open} className="btn-light w-full md:w-auto">
                {hasTicket ? "View my ticket" : "Reserve your spot — it's free"} <span aria-hidden="true">→</span>
              </button>
              <p className="text-sm leading-relaxed opacity-80">{poolParty.month} · {poolParty.venue}<br />9PM till dawn · Limited spots</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE EVENT */}
      <section className="mx-auto grid max-w-[1400px] gap-14 px-5 py-20 md:grid-cols-12 md:items-center md:px-10 md:py-32">
        <div className="md:col-span-6">
          <p className="eyebrow mb-6 text-muted-foreground">Doors open in</p>
          <Countdown target={poolParty.startsAt} />
          <h2 className="font-head mt-12 max-w-lg text-[clamp(2rem,6vw,3.5rem)]">Dress code: bold, poolside, <span className="text-muted-foreground">unmistakably you.</span></h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">Music, fashion and people — one night, till dawn. Free entry, by reservation only.</p>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <TicketCard onReserve={open} hasTicket={hasTicket} />
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-40">
        <div className="grid gap-8 border-t border-ink/10 pt-12 md:grid-cols-12">
          <p className="eyebrow text-muted-foreground md:col-span-2">Who we are</p>
          <h2 className="font-head reveal text-[clamp(2rem,6.2vw,4.75rem)] md:col-span-9">
            Entertainment, fashion and social culture — moving as one nation.
          </h2>
        </div>
        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12">
          <Link to="/about" className="group overflow-hidden rounded-[1.75rem] md:col-span-6 md:col-start-2">
            <img src={crowdImage} alt="FRAANATION crowd" loading="lazy" width={1600} height={1008} className="img-editorial aspect-[4/5] w-full object-cover md:aspect-[4/3]" />
          </Link>
          <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Events you remember. Clothes with a signature. A community that shows up. FRAANATION is built for a generation that dresses loud and creates together.
            </p>
            <Link to="/about" className="link-draw mt-6 w-fit pb-1 text-sm font-semibold">Read the story →</Link>
          </div>
        </div>
      </section>

      {/* THE VIBE */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-head text-[clamp(2.5rem,9vw,6rem)]">The vibe<span className="text-sun">.</span></h2>
            <Link to="/gallery" className="link-draw pb-1 text-sm font-semibold">See all →</Link>
          </div>
          <PhotoRow onReserve={open} hasTicket={hasTicket} frames={[[event1, "Guests at a FRAANATION event", "Last event"], [event5, "A guest smiling at a FRAANATION event", "Good company"], [event6, "Guests dancing at a FRAANATION event", "The energy"]]} />
        </div>
      </section>

      {/* COLLECTION */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
        <div className="flex items-end justify-between">
          <h2 className="font-head text-[clamp(2.5rem,9vw,6rem)]">The collection<span className="text-sun">.</span></h2>
          <Link to="/collection" className="link-draw pb-1 text-sm font-semibold">Shop all →</Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <Link to="/collection" className="group relative overflow-hidden rounded-[1.75rem] md:col-span-7">
            <img src={lookTeeImage} alt="FRAA Heavyweight Tee lookbook" loading="lazy" width={1088} height={1440} className="img-editorial aspect-[3/4] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-6 text-ink-foreground">
              <p className="font-head text-4xl md:text-6xl">Drop 01</p>
              <p className="font-editorial mt-1 text-xl">Signed FRAA.</p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-5 md:col-span-5 md:grid-cols-1 md:content-start">
            {products.slice(0, 2).map((p) => (
              <Link to="/collection" key={p.id} className="group block">
                <div className="overflow-hidden rounded-[1.5rem] bg-paper">
                  <img src={p.image} alt={p.name} loading="lazy" width={800} height={1008} className="img-editorial aspect-[4/5] w-full object-cover" />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{formatNaira(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="px-3 pb-3 md:px-6 md:pb-6">
        <div className="mx-auto grid max-w-[1400px] gap-12 rounded-[2rem] bg-ink px-6 py-16 text-ink-foreground md:grid-cols-12 md:px-16 md:py-28">
          <div className="md:col-span-6">
            <p className="eyebrow text-sun">Members only</p>
            <h2 className="font-head mt-5 text-[clamp(3rem,11vw,7.5rem)]">The<br />Nation<span className="text-sun">.</span></h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 md:self-end">
            <ul className="border-t border-ink-foreground/15">
              {["Your profile & username", "Posts & pictures", "Comments & likes", "After Dark event chat"].map((f) => (
                <li key={f} className="border-b border-ink-foreground/15 py-4 text-lg">{f}</li>
              ))}
            </ul>
            <Link to="/community" className="btn-light mt-8 w-full">Enter the community <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
