import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { heroImage, crowdImage, poolParty } from "@/lib/brand-data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — FRAANATION" },
      { name: "description", content: "Upcoming FRAANATION experiences, including a free pool party next month." },
      { property: "og:title", content: "Events — FRAANATION" },
      { property: "og:description", content: "Free FRAANATION Pool Party coming next month. Registration opens soon." },
    ],
  }),
  component: Events,
});

function Events() {
  return (
    <>
      <PageHero index="02" eyebrow="Experiences" title="Events" sub="Built for the culture. Remembered for longer." />

      <section className="relative">
        <div className="group overflow-hidden">
          <img src={heroImage} alt="Pool party" width={1088} height={1440} className="img-editorial h-[75svh] w-full object-cover md:h-[90vh]" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow"><span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-sun align-middle" />Upcoming · {poolParty.month}</p>
            <h2 className="font-display mt-6 text-[18vw] md:text-[9rem]">{poolParty.title}</h2>
            <p className="font-editorial mt-4 text-3xl md:text-4xl">{poolParty.tagline}</p>
            <ol className="mt-12 border-t hairline">
              {poolParty.details.map((d, i) => (
                <li key={d} className="flex gap-6 border-b hairline py-5">
                  <span className="eyebrow pt-1 text-muted-foreground">0{i + 1}</span>
                  <span className="text-lg">{d}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <div className="md:sticky md:top-24">
              <dl className="border-t-2 border-ink">
                {[["Date", poolParty.date], ["Venue", poolParty.venue], ["City", poolParty.city], ["Entry", poolParty.price]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b hairline py-4">
                    <dt className="eyebrow text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <button disabled className="btn-ink mt-6 w-full">Registration opens soon <span>→</span></button>
              <p className="mt-4 text-sm text-muted-foreground">Date and venue will be announced here first.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="group overflow-hidden bg-ink">
        <img src={crowdImage} alt="FRAANATION night" loading="lazy" width={1600} height={1008} className="img-editorial h-[60svh] w-full object-cover opacity-90" />
      </section>
    </>
  );
}
