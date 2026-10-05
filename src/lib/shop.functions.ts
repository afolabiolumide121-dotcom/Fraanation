import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export type ShopProduct = {
  id: string; name: string; price: number; stock: number; description: string; signature: string;
  colours: string[]; sizes: string[]; image_key: string;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select("id, name, price, stock, description, signature, colours, sizes, image_key")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as ShopProduct[];
});

export const productsQuery = () =>
  queryOptions({ queryKey: ["products"], queryFn: () => listProducts(), staleTime: 15_000 });

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20).regex(/^[+\d\s()-]+$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  address: z.string().trim().min(5, "Enter your delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Enter your state").max(60),
  instagram: z.string().trim().max(40).optional(),
});

const itemSchema = z.object({
  product_id: z.string().max(80), size: z.string().max(20), colour: z.string().max(30),
  quantity: z.number().int().min(1).max(20),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { customer: z.input<typeof checkoutSchema>; items: z.input<typeof itemSchema>[] }) =>
    z.object({ customer: checkoutSchema, items: z.array(itemSchema).min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const c = data.customer;
    const { data: rows, error } = await publicClient().rpc("place_order" as never, {
      _full_name: c.fullName, _email: c.email, _phone: c.phone, _address: c.address, _city: c.city,
      _state: c.state, _instagram: c.instagram || null, _items: data.items,
    } as never);
    if (error) return { ok: false as const, error: error.message };
    const r = (rows as unknown as { code: string; total: number }[])[0]!;
    return { ok: true as const, code: r.code, total: r.total };
  });
