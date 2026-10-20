import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { CtaBand } from "@/components/flair";
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
      <PageHero eyebrow="Who we are" title="About" />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 md:grid-cols-12 md:px-10">
        <p className="font-editorial reveal pt-16 text-[2.3rem] md:col-span-8 md:pt-24 md:text-6xl">
          FRAANATION is an entertainment, fashion, lifestyle and social culture brand — built for a generation that dresses loud, shows up and creates together.
        </p>
        <div className="group overflow-hidden rounded-[1.75rem] md:col-span-5 md:col-start-2">
          <img src={lookTeeImage} alt="FRAANATION" loading="lazy" width={1088} height={1440} className="img-editorial aspect-[3/4] w-full object-cover" />
        </div>
        <ul className="grid gap-5 self-end md:col-span-4 md:col-start-8">
          {pillars.map(([t, d]) => (
            <li key={t} className="reveal rounded-[1.5rem] border border-ink/10 bg-paper p-6 transition-colors duration-300 hover:bg-sun/25">
              <p className="font-head text-3xl">{t}</p>
              <p className="mt-1 text-ink/70">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand line="Be in the" accent="room." secondary={{ to: "/community", label: "Join the community" }} />
    </>
  );
}
