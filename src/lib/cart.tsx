import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = { key: string; productId: string; name: string; price: number; imageKey: string; size: string; colour: string; quantity: number };

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (i: Omit<CartItem, "key">) => void;
  update: (key: string, patch: Partial<Pick<CartItem, "size" | "colour" | "quantity">>) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const STORAGE = "fraa-cart-v1";
const k = (p: string, s: string, c: string) => `${p}|${s}|${c}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE); if (raw) setItems(JSON.parse(raw)); } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE, JSON.stringify(items)); }, [items, ready]);

  const merge = (list: CartItem[]) => {
    const out: CartItem[] = [];
    for (const it of list) {
      const ex = out.find((o) => o.key === it.key);
      if (ex) ex.quantity += it.quantity; else out.push({ ...it });
    }
    return out;
  };

  const value: Ctx = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.quantity * i.price, 0),
    add: (i) => setItems((cur) => merge([...cur, { ...i, key: k(i.productId, i.size, i.colour) }])),
    update: (key, patch) => setItems((cur) => merge(cur.map((i) => {
      if (i.key !== key) return i;
      const n = { ...i, ...patch };
      return { ...n, key: k(n.productId, n.size, n.colour) };
    }))),
    remove: (key) => setItems((cur) => cur.filter((i) => i.key !== key)),
    clear: () => setItems([]),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
