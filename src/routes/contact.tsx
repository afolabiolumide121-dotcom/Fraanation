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
      <PageHero eyebrow="Say hi" title="Contact" sub="Events, partnerships, press — talk to us." />
      <section className="mx-auto max-w-4xl px-4 py-12">
        {rows.map((r) => (
          <div key={r.k} className="flex flex-col justify-between gap-1 border-b-2 border-ink py-6 md:flex-row md:items-center">
            <p className="eyebrow text-muted-foreground">{r.k}</p>
            <p className="font-display text-2xl md:text-4xl">{r.v}</p>
          </div>
        ))}
      </section>
    </>
  );
}
