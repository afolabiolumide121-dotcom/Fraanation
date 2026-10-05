import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { formatNaira } from "@/lib/brand-data";
import { placeOrder, checkoutSchema } from "@/lib/shop.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — FRAANATION" },
      { name: "description", content: "Complete your FRAANATION Collection order." },
      { property: "og:title", content: "Checkout — FRAANATION" },
      { property: "og:description", content: "Guest checkout for THE FRAANATION COLLECTION." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const field = "w-full border-0 border-b hairline bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground focus:border-ink";
const fields = [
  { k: "fullName", label: "Full name", type: "text", ac: "name" },
  { k: "phone", label: "Phone number", type: "tel", ac: "tel" },
  { k: "email", label: "Email", type: "email", ac: "email" },
  { k: "address", label: "Delivery address", type: "text", ac: "street-address" },
  { k: "city", label: "City", type: "text", ac: "address-level2" },
  { k: "state", label: "State", type: "text", ac: "address-level1" },
  { k: "instagram", label: "Instagram username (optional)", type: "text", ac: "off" },
] as const;

type Form = Record<(typeof fields)[number]["k"], string>;

function Summary({ items, total }: { items: CartItem[]; total: number }) {
  return (
    <div>
      <ul>
        {items.map((i) => (
          <li key={i.key} className="flex justify-between gap-3 border-b hairline py-3 text-sm">
            <span>
              <span className="font-semibold">{i.name}</span>
              <span className="block text-muted-foreground">{i.size} · {i.colour} · Qty {i.quantity}</span>
            </span>
            <span className="shrink-0">{formatNaira(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between py-3 text-sm"><span className="eyebrow">Subtotal</span><span>{formatNaira(total)}</span></div>
      <div className="flex items-baseline justify-between border-t border-current pt-3"><span className="eyebrow">Total</span><span className="font-display text-3xl">{formatNaira(total)}</span></div>
    </div>
  );
}

function Checkout() {
  const cart = useCart();
  const qc = useQueryClient();
  const submitOrder = useServerFn(placeOrder);
  const [form, setForm] = useState<Form>({ fullName: "", phone: "", email: "", address: "", city: "", state: "", instagram: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<{ code: string; total: number; items: CartItem[] } | null>(null);

  if (done) {
    return (
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[900px] px-5 py-16 md:px-10 md:py-28">
          <p className="eyebrow rise text-sun">The FRAANATION Collection</p>
          <h1 className="font-display rise mt-6 text-[19vw] md:text-[9rem]" style={{ animationDelay: "80ms" }}>
            Order<br />received<span className="text-sun">.</span>
          </h1>
          <p className="font-editorial rise mt-6 max-w-xl text-2xl md:text-3xl" style={{ animationDelay: "160ms" }}>
            Your FRAANATION order has been received. We'll contact you shortly to confirm payment and delivery.
          </p>
          <div className="rise mt-12 border-y border-ink-foreground/20 py-6" style={{ animationDelay: "240ms" }}>
            <p className="eyebrow opacity-60">Order reference</p>
            <p className="font-display mt-2 text-5xl tracking-wide text-sun md:text-7xl">{done.code}</p>
            <p className="mt-3 text-sm opacity-70">Screenshot this. Quote it when we contact you.</p>
          </div>
          <div className="rise mt-10" style={{ animationDelay: "320ms" }}>
            <p className="eyebrow mb-2 opacity-60">Order summary</p>
            <Summary items={done.items} total={done.total} />
          </div>
          <Link to="/" className="btn-light mt-12 w-full md:w-auto">Back to FRAANATION <span>→</span></Link>
        </div>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-[900px] px-5 py-20 md:px-10">
        <h1 className="font-display text-7xl">Checkout</h1>
        <p className="font-editorial mt-6 text-3xl">Your cart is empty.</p>
        <Link to="/collection" className="btn-ink mt-8 w-full md:w-auto">Shop the collection <span>→</span></Link>
      </section>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      document.getElementById(`f-${parsed.error.issues[0]!.path[0]}`)?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const items = cart.items;
      const res = await submitOrder({ data: { customer: parsed.data, items: items.map((i) => ({ product_id: i.productId, size: i.size, colour: i.colour, quantity: i.quantity })) } });
      if (res.ok) {
        setDone({ code: res.code, total: res.total, items });
        cart.clear();
        qc.invalidateQueries({ queryKey: ["products"] });
        window.scrollTo({ top: 0 });
      } else setServerError(res.error);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 md:px-10 md:pt-20">
      <div className="flex items-end justify-between border-b hairline pb-4">
        <h1 className="font-display text-6xl md:text-9xl">Checkout</h1>
        <Link to="/cart" className="eyebrow link-draw">← Cart</Link>
      </div>
      <form onSubmit={submit} noValidate className="mt-10 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow">01 — Your details</p>
          {fields.map((f) => (
            <div key={f.k} className="mt-4">
              <label htmlFor={`f-${f.k}`} className="sr-only">{f.label}</label>
              <input id={`f-${f.k}`} type={f.type} autoComplete={f.ac} placeholder={f.label} className={field}
                value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
              {errors[f.k] && <p className="mt-1 text-sm text-destructive">{errors[f.k]}</p>}
            </div>
          ))}

          <p className="eyebrow mt-12">02 — Payment method</p>
          <div className="mt-4 border border-ink p-5">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 bg-sun ring-1 ring-ink" />
              <p className="font-display text-2xl">Manual payment</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Payment will be confirmed manually after your order is submitted.</p>
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="md:sticky md:top-24">
            <p className="eyebrow">03 — Order summary</p>
            <Summary items={cart.items} total={cart.subtotal} />
            {serverError && <p className="mt-4 border-l-2 border-destructive pl-3 text-sm text-destructive">{serverError}</p>}
            <button type="submit" disabled={busy} className="btn-ink mt-6 w-full disabled:opacity-60">
              {busy ? "Placing order…" : <>Place order <span>→</span></>}
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}
