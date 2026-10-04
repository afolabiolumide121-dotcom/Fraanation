import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { lookTeeImage } from "@/lib/brand-data";

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
  const pillars = [["Entertainment", "Parties, pop-ups and experiences."], ["Fashion", "A real label. Every piece signed FRAA."], ["Community", "A members space for the nation."], ["Culture", "African energy, global standard."]];
  return (
    <>
      <PageHero index="06" eyebrow="Who we are" title="About" />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 md:grid-cols-12 md:px-10">
        <p className="font-editorial text-[2.3rem] md:col-span-8 md:text-6xl">
          FRAANATION is an entertainment, fashion, lifestyle and social culture brand — built for a generation that dresses loud, shows up and creates together.
        </p>
        <div className="group overflow-hidden md:col-span-5 md:col-start-2">
          <img src={lookTeeImage} alt="FRAANATION" loading="lazy" width={1088} height={1440} className="img-editorial aspect-[3/4] w-full object-cover" />
        </div>
        <ul className="self-end border-t hairline md:col-span-4 md:col-start-8">
          {pillars.map(([t, d]) => (
            <li key={t} className="border-b hairline py-5">
              <p className="font-display text-4xl">{t}</p>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
