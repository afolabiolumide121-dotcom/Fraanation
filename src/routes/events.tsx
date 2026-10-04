import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site-chrome";
import { RegistrationForm, LookupForm } from "@/components/registration-form";
import { heroImage, crowdImage, poolParty } from "@/lib/brand-data";
import { getEvent } from "@/lib/events.functions";

const eventQuery = queryOptions({ queryKey: ["event", "pool-party"], queryFn: () => getEvent({ data: { slug: "pool-party" } }) });

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — FRAANATION" },
      { name: "description", content: "Upcoming FRAANATION experiences. Register free for the pool party next month." },
      { property: "og:title", content: "Events — FRAANATION" },
      { property: "og:description", content: "Free FRAANATION Pool Party coming next month. Reserve your spot." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventQuery),
  errorComponent: () => <p className="p-10">Couldn't load events. Please refresh.</p>,
  notFoundComponent: () => <p className="p-10">Event not found.</p>,
  component: Events,
});

function Events() {
  const { data } = useSuspenseQuery(eventQuery);
  const ev = data ?? {
    slug: "pool-party", title: poolParty.title, tagline: poolParty.tagline, date_text: poolParty.date, month_text: poolParty.month,
    venue: poolParty.venue, city: poolParty.city, price_text: poolParty.price, details: poolParty.details, registration_open: false,
  };

  return (
    <>
      <PageHero index="02" eyebrow="Experiences" title="Events" sub="Built for the culture. Remembered for longer." />

      <section className="group overflow-hidden">
        <img src={heroImage} alt="Pool party" width={1088} height={1440} className="img-editorial h-[75svh] w-full object-cover md:h-[90vh]" />
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow"><span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-sun align-middle" />Upcoming · {ev.month_text}</p>
            <h2 className="font-display mt-6 text-[18vw] md:text-[9rem]">{ev.title}</h2>
            <p className="font-editorial mt-4 text-3xl md:text-4xl">{ev.tagline}</p>
            <dl className="mt-12 grid grid-cols-2 border-t-2 border-ink">
              {[["Date", ev.date_text], ["Venue", ev.venue], ["City", ev.city], ["Entry", ev.price_text]].map(([k, v]) => (
                <div key={k} className="border-b hairline py-4 pr-3">
                  <dt className="eyebrow text-muted-foreground">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-10 border-t hairline">
              {ev.details.map((d, i) => (
                <li key={d} className="flex gap-6 border-b hairline py-5">
                  <span className="eyebrow pt-1 text-muted-foreground">0{i + 1}</span>
                  <span className="text-lg">{d}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside id="register" className="md:col-span-4 md:col-start-9">
            <div className="space-y-14 md:sticky md:top-24">
              <RegistrationForm slug={ev.slug} open={ev.registration_open} title={ev.title} />
              <LookupForm />
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
