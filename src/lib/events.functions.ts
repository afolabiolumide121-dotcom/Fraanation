import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export type EventRow = {
  id: string; slug: string; title: string; tagline: string; date_text: string; month_text: string;
  venue: string; city: string; price_text: string; details: string[]; registration_open: boolean;
  starts_at: string | null; time_text: string; address: string; max_guests_per_reservation: number;
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

export const getEvent = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("events")
      .select("id, slug, title, tagline, date_text, month_text, venue, city, price_text, details, registration_open, starts_at, time_text, address, max_guests_per_reservation")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as EventRow | null;
  });

export const registrationSchema = z.object({
  slug: z.string().max(80),
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20).regex(/^[+\d\s()-]+$/, "Enter a valid phone number"),
  instagram: z.string().trim().max(40).optional(),
  username: z.string().trim().regex(/^[A-Za-z0-9_.]{2,30}$/, "2–30 letters, numbers, _ or ."),
  guests: z.number().int().min(1, "At least 1 guest").max(10),
});

export const registerForEvent = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof registrationSchema>) => registrationSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("register_for_event" as never, {
      _slug: data.slug, _full_name: data.fullName, _email: data.email, _phone: data.phone, _instagram: data.instagram || null, _username: data.username, _guests: data.guests,
    } as never);
    if (error) return { ok: false as const, error: error.message };
    const r = (rows as unknown as { code: string; already_registered: boolean; full_name: string; guests: number }[])[0]!;
    return { ok: true as const, code: r.code, already: r.already_registered, fullName: r.full_name, guests: r.guests };
  });

export const lookupRegistration = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; email: string }) =>
    z.object({ code: z.string().trim().min(4).max(20), email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("lookup_registration" as never, { _code: data.code, _email: data.email } as never);
    if (error) throw new Error(error.message);
    const r = (rows as unknown as { full_name: string; code: string; status: string; event_title: string; guests: number }[])[0];
    return r ?? null;
  });
