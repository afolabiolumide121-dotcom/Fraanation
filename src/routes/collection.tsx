import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site-chrome";
import { BuyPanel, StockLabel } from "@/components/shop";
import { lookTeeImage, formatNaira } from "@/lib/brand-data";
import { productsQuery } from "@/lib/shop.functions";
import { productImage } from "@/lib/product-images";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The FRAANATION Collection — Gen Z Streetwear & Poolwear" },
      { name: "description", content: "Streetwear, pool outfits and lifestyle clothing — every piece signed FRAA. Shop online, delivered in Nigeria." },
      { property: "og:title", content: "The FRAANATION Collection" },
      { property: "og:description", content: "Every piece carries the FRAA signature." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  errorComponent: () => <p className="px-5 py-24 text-center">The collection couldn't load. Please refresh.</p>,
  notFoundComponent: () => <p className="px-5 py-24 text-center">Not found.</p>,
  component: Collection,
});

function Collection() {
  const { data: products } = useSuspenseQuery(productsQuery());
  return (
    <>
      <PageHero index="03" eyebrow="The FRAANATION Collection — Drop 01" title="Collection" sub="Every piece carries the signature." />

      <section className="group relative overflow-hidden">
        <img src={lookTeeImage} alt="FRAA lookbook" width={1088} height={1440} className="img-editorial h-[70svh] w-full object-cover object-top md:h-[95vh]" />
        <p className="font-editorial absolute bottom-6 left-5 text-4xl text-ink-foreground md:left-10 md:text-6xl">Signed FRAA.</p>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-10 md:py-28">
        {products.map((p, i) => (
          <article key={p.id} className="grid gap-6 border-t hairline py-10 md:grid-cols-12 md:gap-8 md:py-20">
            <Link to="/product/$id" params={{ id: p.id }} className={`group relative block overflow-hidden bg-paper md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : ""}`}>
              <img src={productImage(p.image_key)} alt={p.name} loading="lazy" width={800} height={1008}
                className={`img-editorial aspect-[4/5] w-full object-cover ${p.stock <= 0 ? "grayscale" : ""}`} />
              <span className="eyebrow absolute bottom-4 left-4 bg-background px-2 py-1">View piece →</span>
            </Link>
            <div className={`flex flex-col justify-end md:col-span-5 ${i % 2 ? "md:order-1" : "md:col-start-8"}`}>
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted-foreground">N°0{i + 1}</p>
                <StockLabel stock={p.stock} />
              </div>
              <Link to="/product/$id" params={{ id: p.id }}>
                <h2 className="font-display mt-4 text-5xl md:text-7xl">{p.name}</h2>
              </Link>
              <p className="font-editorial mt-2 text-2xl">{p.signature}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{p.description}</p>
              <p className="font-display mt-6 text-4xl">{formatNaira(p.price)}</p>
              <BuyPanel p={p} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
