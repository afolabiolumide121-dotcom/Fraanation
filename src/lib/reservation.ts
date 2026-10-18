import { supabase } from "@/integrations/supabase/client";
import { poolParty } from "@/lib/brand-data";
import type { EventRow } from "@/lib/events.functions";

export const EVENT_SLUG = "pool-party";
export const TICKET_KEY = "fraa-splash-ticket";
export const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/JfOiBnIXMlsIFFwse8F6Dn?mode=gi_t";

export type Ticket = { code: string; fullName: string; guests: number; already?: boolean };

// Shown if the event can't be read, so the page and the reservation pop-up still work.
export const fallbackEvent: EventRow = {
  id: "", slug: EVENT_SLUG, title: poolParty.title, tagline: poolParty.tagline, date_text: poolParty.date,
  month_text: poolParty.month, venue: poolParty.venue, city: poolParty.city, price_text: poolParty.price,
  details: poolParty.details, registration_open: true, starts_at: poolParty.startsAt, time_text: poolParty.time,
  address: poolParty.address, max_guests_per_reservation: 4,
};

export async function fetchEvent(): Promise<EventRow> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("id, slug, title, tagline, date_text, month_text, venue, city, price_text, details, registration_open, starts_at, time_text, address, max_guests_per_reservation")
      .eq("slug", EVENT_SLUG)
      .maybeSingle();
    if (error || !data) return fallbackEvent;
    return data as unknown as EventRow;
  } catch {
    return fallbackEvent;
  }
}

function makeUsername(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "guest";
  return `${base}${Math.floor(100 + Math.random() * 900)}`;
}

export type ReserveInput = { fullName: string; email: string; phone: string; guests: number };

export async function reserveSpot(i: ReserveInput): Promise<{ ok: true; ticket: Ticket } | { ok: false; error: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.rpc("register_for_event" as never, {
      _slug: EVENT_SLUG, _full_name: i.fullName.trim(), _email: i.email.trim(), _phone: i.phone.trim(),
      _instagram: null, _username: makeUsername(i.fullName), _guests: i.guests,
    } as never);
    if (error) {
      if (/username/i.test(error.message) && attempt < 2) continue;
      return { ok: false, error: error.message };
    }
    const r = (data as unknown as { code: string; already_registered: boolean; full_name: string; guests: number }[])?.[0];
    if (!r) return { ok: false, error: "Something went wrong. Please try again." };
    return { ok: true, ticket: { code: r.code, already: r.already_registered, fullName: r.full_name, guests: r.guests } };
  }
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function lookupSpot(code: string, email: string) {
  const { data, error } = await supabase.rpc("lookup_registration" as never, { _code: code.trim(), _email: email.trim() } as never);
  if (error) throw new Error(error.message);
  const r = (data as unknown as { full_name: string; code: string; status: string; event_title: string; guests: number }[])?.[0];
  return r ?? null;
}
