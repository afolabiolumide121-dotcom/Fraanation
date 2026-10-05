import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/brand-data";
import type { ShopProduct } from "@/lib/shop.functions";

export function StockLabel({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="eyebrow bg-ink px-1.5 py-0.5 text-ink-foreground">Out of stock</span>;
  if (stock <= 5) return <span className="eyebrow bg-sun px-1.5 py-0.5 text-ink">Only {stock} left</span>;
  return <span className="eyebrow">In stock</span>;
}

export function Chips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-5">
      <p className="eyebrow text-muted-foreground">{label} — <span className="text-foreground">{value}</span></p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={o === value}
            className={`min-h-11 min-w-11 border px-4 text-sm transition-colors ${o === value ? "border-ink bg-ink text-ink-foreground" : "hairline hover:border-ink"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Qty({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex h-12 items-center border hairline">
      <button type="button" aria-label="Decrease" className="h-full w-12 text-lg disabled:opacity-30" disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button>
      <span className="w-8 text-center font-semibold tabular-nums">{value}</span>
      <button type="button" aria-label="Increase" className="h-full w-12 text-lg disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function BuyPanel({ p }: { p: ShopProduct }) {
  const cart = useCart();
  const [colour, setColour] = useState(p.colours[0] ?? "");
  const [size, setSize] = useState(p.sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = cart.items.filter((i) => i.productId === p.id).reduce((n, i) => n + i.quantity, 0);
  const left = Math.max(0, p.stock - inCart);
  const out = p.stock <= 0;

  function add() {
    cart.add({ productId: p.id, name: p.name, price: p.price, imageKey: p.image_key, size, colour, quantity: Math.min(qty, left) });
    setQty(1); setAdded(true); setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <Chips label="Colour" options={p.colours} value={colour} onChange={setColour} />
      <Chips label="Size" options={p.sizes} value={size} onChange={setSize} />
      {out ? (
        <button disabled className="btn-ink mt-6 w-full opacity-60">Out of stock</button>
      ) : (
        <div className="mt-6 flex gap-3">
          <Qty value={Math.min(qty, Math.max(1, left))} max={Math.max(1, left)} onChange={setQty} />
          <button onClick={add} disabled={left <= 0} className="btn-ink flex-1 disabled:opacity-50">
            {left <= 0 ? "All stock in your cart" : <>Add to cart <span>{formatNaira(p.price * Math.min(qty, left))}</span></>}
          </button>
        </div>
      )}
      {added && (
        <p className="rise mt-3 flex items-center justify-between border-l-2 border-sun pl-3 text-sm">
          Added to your cart. <Link to="/cart" className="eyebrow link-draw">View cart →</Link>
        </p>
      )}
    </div>
  );
}
