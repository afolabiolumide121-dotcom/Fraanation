import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { CtaBand } from "@/components/flair";

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
    { k: "Email", v: "officialfraanation@gmail.com", href: "mailto:officialfraanation@gmail.com" },
    { k: "Sponsorship · WhatsApp", v: "09082556742", href: "https://wa.me/2349082556742" },
    { k: "Instagram", v: "@fraanation", href: "https://instagram.com/fraanation" },
  ];
  return (
    <>
      <PageHero eyebrow="Say hello" title="Contact" sub="Events, partnerships, press — talk to us." />
      <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
        {rows.map((r) => (
          <a key={r.k} href={r.href} target="_blank" rel="noreferrer" className="group flex flex-col gap-2 border-t hairline px-0 py-8 transition-all duration-300 hover:bg-ink hover:px-4 hover:text-ink-foreground md:flex-row md:items-baseline md:justify-between">
            <p className="eyebrow text-muted-foreground group-hover:text-sun">{r.k}</p>
            <p className="font-display break-all text-[9vw] md:text-7xl">{r.v} <span className="text-sun">↗</span></p>
          </a>
        ))}
      </section>

      <CtaBand line="See you at" accent="After Dark." />
    </>
  );
}
