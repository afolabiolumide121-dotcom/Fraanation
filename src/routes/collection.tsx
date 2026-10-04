import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { products, lookTeeImage, formatNaira } from "@/lib/brand-data";

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
      <PageHero index="03" eyebrow="The FRAANATION Collection — Drop 01" title="Collection" sub="Every piece carries the signature." />

      <section className="group relative overflow-hidden">
        <img src={lookTeeImage} alt="FRAA lookbook" width={1088} height={1440} className="img-editorial h-[80svh] w-full object-cover object-top md:h-[95vh]" />
        <p className="font-editorial absolute bottom-6 left-5 text-4xl text-ink-foreground md:left-10 md:text-6xl">Signed FRAA.</p>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-28">
        {products.map((p, i) => (
          <article key={p.id} className={`grid gap-8 border-t hairline py-12 md:grid-cols-12 md:py-20`}>
            <div className={`group overflow-hidden bg-paper md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : ""}`}>
              <img src={p.image} alt={p.name} loading="lazy" width={800} height={1008} className="img-editorial aspect-[4/5] w-full object-cover" />
            </div>
            <div className={`flex flex-col justify-end md:col-span-5 ${i % 2 ? "md:order-1" : "md:col-start-8"}`}>
              <div className="flex justify-between">
                <p className="eyebrow text-muted-foreground">N°0{i + 1}</p>
                <p className="eyebrow">{p.stock <= 5 ? <span className="bg-sun px-1.5 py-0.5">Only {p.stock} left</span> : "In stock"}</p>
              </div>
              <h2 className="font-display mt-4 text-6xl md:text-7xl">{p.name}</h2>
              <p className="font-editorial mt-2 text-2xl">{p.signature}</p>
              <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
              <dl className="mt-8 border-t hairline text-sm">
                <div className="flex justify-between border-b hairline py-3"><dt className="eyebrow text-muted-foreground">Price</dt><dd className="font-semibold">{formatNaira(p.price)}</dd></div>
                <div className="flex justify-between border-b hairline py-3"><dt className="eyebrow text-muted-foreground">Colour</dt><dd>{p.colours.join(" / ")}</dd></div>
                <div className="flex justify-between border-b hairline py-3"><dt className="eyebrow text-muted-foreground">Size</dt><dd>{p.sizes.join(" · ")}</dd></div>
              </dl>
              <button disabled className="btn-ink mt-6 w-full">Shop opening soon <span>→</span></button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
