import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — FRAANATION" },
      { name: "description", content: "Get in touch with FRAANATION for events, partnerships and press." },
      { property: "og:title", content: "Contact FRAANATION" },
      { property: "og:description", content: "Events, partnerships and press enquiries." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const rows = [
    { k: "General", v: "hello@fraanation.com" },
    { k: "Partnerships", v: "partners@fraanation.com" },
    { k: "Instagram", v: "@fraanation" },
  ];
  return (
    <>
      <PageHero index="07" eyebrow="Say hello" title="Contact" sub="Events, partnerships, press — talk to us." />
      <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
        {rows.map((r) => (
          <div key={r.k} className="group flex flex-col gap-2 border-t hairline py-8 md:flex-row md:items-baseline md:justify-between">
            <p className="eyebrow text-muted-foreground">{r.k}</p>
            <p className="font-display break-all text-[9vw] transition-colors group-hover:text-muted-foreground md:text-7xl">{r.v}</p>
          </div>
        ))}
      </section>
    </>
  );
}
