import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { PageHero } from "@/components/site-chrome";
import { heroImage, poolParty } from "@/lib/brand-data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — FRAANATION" },
      { name: "description", content: "Upcoming FRAANATION events, including our free pool party next month." },
      { property: "og:title", content: "Events — FRAANATION" },
      { property: "og:description", content: "Free FRAANATION Pool Party coming next month. Registration opens soon." },
    ],
  }),
  component: Events,
});

function Events() {
  const facts = [
    { icon: Calendar, label: "Date", value: poolParty.date },
    { icon: MapPin, label: "Venue", value: poolParty.venue },
    { icon: Ticket, label: "Entry", value: poolParty.price },
  ];
  return (
    <>
      <PageHero eyebrow="Upcoming events" title="Events" sub="Experiences built for the culture." />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <article className="border-2 border-ink md:grid md:grid-cols-2">
          <img src={heroImage} alt="Pool party" loading="lazy" width={1088} height={1440} className="aspect-[4/5] w-full object-cover md:h-full" />
          <div className="p-6 md:p-10">
            <p className="eyebrow"><span className="bg-sun px-2 py-1">Upcoming · {poolParty.month}</span></p>
            <h2 className="font-display mt-5 text-5xl">{poolParty.title}</h2>
            <p className="font-editorial mt-3 text-2xl">{poolParty.tagline}</p>
            <div className="mt-8 grid grid-cols-3 border-y-2 border-ink">
              {facts.map((f) => (
                <div key={f.label} className="border-r border-border py-4 pr-2 last:border-0">
                  <f.icon size={18} />
                  <p className="eyebrow mt-2 text-muted-foreground">{f.label}</p>
                  <p className="mt-1 text-sm font-bold">{f.value}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 space-y-2">
              {poolParty.details.map((d) => <li key={d} className="flex gap-3"><span className="text-sun">✦</span>{d}</li>)}
            </ul>
            <button disabled className="btn-sun mt-8 w-full opacity-90">Free registration opening soon</button>
          </div>
        </article>
      </section>
    </>
  );
}
