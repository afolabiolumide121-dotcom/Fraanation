import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Marquee } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FRAANATION" },
      { name: "description", content: "FRAANATION is an entertainment, fashion, lifestyle and social culture brand." },
      { property: "og:title", content: "About FRAANATION" },
      { property: "og:description", content: "Entertainment, fashion, lifestyle and social culture." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="Who we are" title="About" />
      <section className="mx-auto max-w-4xl px-4 py-14">
        <p className="font-editorial text-3xl leading-snug md:text-5xl">
          FRAANATION is an entertainment, fashion, lifestyle and social culture brand — built for a generation that dresses loud, shows up and creates together.
        </p>
        <p className="mt-8 text-lg text-muted-foreground">
          From events and experiences to our own fashion label and a members community, everything we make carries one signature: FRAA.
        </p>
      </section>
      <Marquee text="EVENTS · FASHION DROPS · COMMUNITY · EXPERIENCES" />
    </>
  );
}
