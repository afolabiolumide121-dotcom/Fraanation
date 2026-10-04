import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { heroImage, products } from "@/lib/brand-data";

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
  const imgs = [heroImage, ...products.map((p) => p.image)];
  return (
    <>
      <PageHero eyebrow="Moments" title="Gallery" sub="Captured in the heat of it." />
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-2 px-4 py-12 md:grid-cols-3">
        {imgs.map((src, i) => (
          <img key={i} src={src} alt="FRAANATION moment" loading="lazy"
            className={`w-full border-2 border-ink object-cover ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto md:h-full" : "aspect-[4/5]"}`} />
        ))}
      </section>
    </>
  );
}
