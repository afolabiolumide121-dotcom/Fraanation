import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/brand-data";
import { productsQuery } from "@/lib/shop.functions";
import { productImage } from "@/lib/product-images";
import { Qty } from "@/components/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — FRAANATION" },
      { name: "description", content: "Your FRAANATION Collection cart." },
      { property: "og:title", content: "Cart — FRAANATION" },
      { property: "og:description", content: "Review your FRAANATION pieces before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

const sel = "min-h-11 border hairline bg-transparent px-2 text-sm";

function CartPage() {
  const cart = useCart();
  const { data: products = [] } = useQuery(productsQuery());

  return (
    <section className="mx-auto max-w-[1000px] px-5 pb-24 pt-12 md:px-10 md:pt-20">
      <div className="flex items-end justify-between border-b hairline pb-4">
        <h1 className="font-display text-7xl md:text-9xl">Cart</h1>
        <p className="eyebrow text-muted-foreground">{cart.count} {cart.count === 1 ? "piece" : "pieces"}</p>
      </div>

      {cart.items.length === 0 ? (
        <div className="py-16">
          <p className="font-editorial text-3xl">Your cart is empty.</p>
          <Link to="/collection" className="btn-ink mt-8 w-full md:w-auto">Shop the collection <span>→</span></Link>
        </div>
      ) : (
        <>
          <ul>
            {cart.items.map((i) => {
              const p = products.find((x) => x.id === i.productId);
              const otherQty = cart.items.filter((x) => x.productId === i.productId && x.key !== i.key).reduce((n, x) => n + x.quantity, 0);
              const max = p ? Math.max(1, p.stock - otherQty) : 20;
              const over = p ? i.quantity + otherQty > p.stock : false;
              return (
                <li key={i.key} className="flex gap-4 border-b hairline py-6">
                  <Link to="/product/$id" params={{ id: i.productId }} className="w-24 shrink-0 bg-paper md:w-32">
                    <img src={productImage(i.imageKey)} alt={i.name} className="aspect-[4/5] w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="font-display text-2xl md:text-3xl">{i.name}</p>
                      <p className="shrink-0 font-semibold">{formatNaira(i.price * i.quantity)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p && p.colours.length > 1 ? (
                        <select aria-label="Colour" className={sel} value={i.colour} onChange={(e) => cart.update(i.key, { colour: e.target.value })}>
                          {p.colours.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      ) : <span className="eyebrow self-center">{i.colour}</span>}
                      {p && p.sizes.length > 1 ? (
                        <select aria-label="Size" className={sel} value={i.size} onChange={(e) => cart.update(i.key, { size: e.target.value })}>
                          {p.sizes.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      ) : <span className="eyebrow self-center">· {i.size}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Qty value={i.quantity} max={max} onChange={(n) => cart.update(i.key, { quantity: n })} />
                      <button onClick={() => cart.remove(i.key)} className="eyebrow link-draw min-h-11 text-muted-foreground">Remove</button>
                    </div>
                    {over && <p className="mt-2 text-sm text-destructive">{p!.stock === 0 ? "Now out of stock — please remove." : `Only ${p!.stock} available.`}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 md:ml-auto md:w-96">
            <div className="flex justify-between border-b hairline pb-4">
              <p className="eyebrow">Subtotal</p>
              <p className="font-display text-3xl">{formatNaira(cart.subtotal)}</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Delivery is arranged with you after your order.</p>
            <Link to="/checkout" className="btn-ink mt-6 w-full">Checkout <span>→</span></Link>
            <Link to="/collection" className="eyebrow link-draw mt-6 block w-fit">← Continue shopping</Link>
          </div>
        </>
      )}
    </section>
  );
}
