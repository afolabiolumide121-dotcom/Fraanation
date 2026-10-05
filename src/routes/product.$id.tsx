import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BuyPanel, StockLabel } from "@/components/shop";
import { formatNaira } from "@/lib/brand-data";
import { productsQuery } from "@/lib/shop.functions";
import { productImage } from "@/lib/product-images";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const list = await context.queryClient.ensureQueryData(productsQuery());
    const p = list.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — The FRAANATION Collection` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Piece not found — FRAANATION" }, { name: "robots", content: "noindex" }],
  }),
  errorComponent: () => <p className="px-5 py-24 text-center">This piece couldn't load. Please refresh.</p>,
  notFoundComponent: () => (
    <div className="px-5 py-24 text-center">
      <p className="font-editorial text-3xl">This piece isn't in the collection.</p>
      <Link to="/collection" className="btn-ink mt-6">Back to collection</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(productsQuery());
  const p = data.find((x) => x.id === id)!;
  const others = data.filter((x) => x.id !== id).slice(0, 2);

  return (
    <>
      <div className="md:grid md:grid-cols-12">
        <div className="group overflow-hidden bg-paper md:sticky md:top-16 md:col-span-7 md:h-[calc(100vh-4rem)]">
          <img src={productImage(p.image_key)} alt={p.name} width={800} height={1008}
            className={`img-editorial aspect-[4/5] w-full object-cover md:h-full md:aspect-auto ${p.stock <= 0 ? "grayscale" : ""}`} />
        </div>
        <div className="px-5 py-8 md:col-span-5 md:px-10 md:py-16">
          <Link to="/collection" className="eyebrow link-draw text-muted-foreground">← The Collection</Link>
          <div className="mt-8 flex items-center justify-between border-b hairline pb-3">
            <p className="eyebrow">FRAANATION — Drop 01</p>
            <StockLabel stock={p.stock} />
          </div>
          <h1 className="font-display rise mt-6 text-6xl md:text-7xl">{p.name}</h1>
          <p className="font-editorial mt-3 text-2xl">{p.signature}</p>
          <p className="font-display mt-6 text-4xl">{formatNaira(p.price)}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          <BuyPanel p={p} />
          <dl className="mt-10 border-t hairline text-sm">
            <div className="flex justify-between border-b hairline py-3"><dt className="eyebrow text-muted-foreground">Signature</dt><dd>{p.signature}</dd></div>
            <div className="flex justify-between border-b hairline py-3"><dt className="eyebrow text-muted-foreground">Payment</dt><dd>Confirmed manually</dd></div>
            <div className="flex justify-between border-b hairline py-3"><dt className="eyebrow text-muted-foreground">Ships from</dt><dd>Lagos</dd></div>
          </dl>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
          <p className="eyebrow border-b hairline pb-4">Also in the drop</p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:gap-8">
            {others.map((o) => (
              <Link key={o.id} to="/product/$id" params={{ id: o.id }} className="group block">
                <div className="overflow-hidden bg-paper">
                  <img src={productImage(o.image_key)} alt={o.name} loading="lazy" className="img-editorial aspect-[4/5] w-full object-cover" />
                </div>
                <p className="font-display mt-3 text-2xl md:text-3xl">{o.name}</p>
                <p className="mt-1 text-sm">{formatNaira(o.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
