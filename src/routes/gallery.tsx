import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { heroImage, lookTeeImage, crowdImage, products } from "@/lib/brand-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — FRAANATION" },
      { name: "description", content: "Moments, looks and energy from the FRAANATION world." },
      { property: "og:title", content: "Gallery — FRAANATION" },
      { property: "og:description", content: "Moments, looks and energy from the FRAANATION world." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const items = [
    { src: crowdImage, cls: "md:col-span-12 aspect-[4/3] md:aspect-[21/9]" },
    { src: lookTeeImage, cls: "md:col-span-5 aspect-[3/4]" },
    { src: heroImage, cls: "md:col-span-6 md:col-start-7 md:mt-32 aspect-[3/4]" },
    { src: products[1].image, cls: "md:col-span-4 md:col-start-2 aspect-[4/5]" },
    { src: products[2].image, cls: "md:col-span-4 md:col-start-8 md:-mt-24 aspect-[4/5]" },
  ];
  return (
    <>
      <PageHero index="05" eyebrow="Moments" title="Gallery" sub="Captured in the heat of it." />
      <section className="mx-auto grid max-w-[1400px] gap-4 px-5 pb-24 md:grid-cols-12 md:gap-8 md:px-10">
        {items.map((it, i) => (
          <figure key={i} className={`group overflow-hidden ${it.cls}`}>
            <img src={it.src} alt="FRAANATION moment" loading="lazy" className="img-editorial h-full w-full object-cover" />
          </figure>
        ))}
      </section>
    </>
  );
}
