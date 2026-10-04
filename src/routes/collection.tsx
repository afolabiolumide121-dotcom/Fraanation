import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { products, formatNaira } from "@/lib/brand-data";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The FRAANATION Collection — Gen Z Streetwear & Poolwear" },
      { name: "description", content: "Streetwear, pool outfits and lifestyle clothing — every piece signed FRAA." },
      { property: "og:title", content: "The FRAANATION Collection" },
      { property: "og:description", content: "Every piece carries the FRAA signature." },
    ],
  }),
  component: Collection,
});

function Collection() {
  return (
    <>
      <PageHero eyebrow="Drop 01" title="The Collection" sub="Every piece carries the FRAA signature." />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        {products.map((p) => (
          <article key={p.id}>
            <div className="relative border-2 border-ink bg-card">
              <img src={p.image} alt={p.name} loading="lazy" width={800} height={1008} className="aspect-[4/5] w-full object-cover" />
              <span className="eyebrow absolute left-3 top-3 bg-ink px-2 py-1 text-ink-foreground">
                {p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}
              </span>
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <h2 className="font-display text-2xl">{p.name}</h2>
              <p className="font-bold">{formatNaira(p.price)}</p>
            </div>
            <p className="eyebrow mt-2 text-muted-foreground">{p.signature}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.sizes.map((s) => <span key={s} className="border border-ink px-2 py-1 text-xs font-bold">{s}</span>)}
            </div>
            <p className="mt-2 text-xs">Colours: {p.colours.join(" / ")}</p>
            <button disabled className="btn-ink mt-4 w-full">Shop opening soon</button>
          </article>
        ))}
      </section>
    </>
  );
}
