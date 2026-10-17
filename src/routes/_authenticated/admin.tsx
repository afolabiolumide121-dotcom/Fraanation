import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatNaira } from "@/lib/brand-data";
import { useMediaUrl } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — FRAANATION" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

const box = "w-full border border-ink/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink";
const chip = "min-h-9 border border-ink/40 px-3 text-xs font-semibold uppercase tracking-wide hover:bg-sun hover:text-ink";

function waLink(phone: string, text: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "234" + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
const when = (s: string) => new Date(s).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

function Admin() {
  const [tab, setTab] = useState<"orders" | "guests" | "stock" | "community">("orders");
  const role = useQuery({
    queryKey: ["admin-role"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { ok: false, email: null as string | null };
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin");
      if (error) throw error;
      return { ok: (data?.length ?? 0) > 0, email: u.user.email ?? null };
    },
  });

  if (role.isLoading) return <p className="px-5 py-20 text-center">Loading…</p>;
  if (!role.data?.ok) {
    return (
      <section className="mx-auto max-w-[700px] px-5 py-20">
        <h1 className="font-display text-6xl">Admin</h1>
        <p className="font-editorial mt-4 text-2xl">This account isn't an admin yet.</p>
        <p className="mt-4 text-sm text-muted-foreground">Signed in as {role.data?.email ?? "unknown"}. Ask the site owner to give this email the admin role in the database.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-24 pt-10 md:px-10">
      <div className="flex items-end justify-between border-b hairline pb-4">
        <h1 className="font-display text-6xl md:text-8xl">Admin</h1>
        <p className="eyebrow text-muted-foreground">{role.data.email}</p>
      </div>
      <div className="mt-6 flex gap-2">
        {(["orders", "guests", "stock", "community"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`${chip} ${tab === t ? "bg-ink text-ink-foreground" : ""}`}>{t === "guests" ? "Guest list" : t}</button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "orders" && <Orders />}
        {tab === "guests" && <Guests />}
        {tab === "stock" && <Stock />}
        {tab === "community" && <CommunityTab />}
      </div>
    </section>
  );
}

function Orders() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });
  async function patch(id: string, p: { status?: string; payment_status?: string }) {
    setErr("");
    const { error } = await supabase.from("orders").update(p).eq("id", id);
    if (error) setErr(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }
  const list = data.filter((o) => `${o.code} ${o.full_name} ${o.phone} ${o.email}`.toLowerCase().includes(q.toLowerCase()));
  const paid = data.filter((o) => o.payment_status === "paid").reduce((n, o) => n + o.total, 0);
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="border hairline p-3"><p className="font-display text-3xl">{data.length}</p><p className="eyebrow">Orders</p></div>
        <div className="border hairline p-3"><p className="font-display text-3xl">{data.filter((o) => o.status === "new").length}</p><p className="eyebrow">New</p></div>
        <div className="border hairline p-3"><p className="font-display text-2xl">{formatNaira(paid)}</p><p className="eyebrow">Paid</p></div>
      </div>
      <input className={`${box} mt-6`} placeholder="Search name, phone, email or code" value={q} onChange={(e) => setQ(e.target.value)} />
      {(error || err) && <p className="mt-3 text-sm text-destructive">{err || (error as Error).message}</p>}
      {isLoading && <p className="mt-6">Loading…</p>}
      <ul className="mt-4">
        {list.map((o) => (
          <li key={o.id} className="border-b hairline py-4">
            <button className="flex w-full items-baseline justify-between gap-3 text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
              <span><span className="font-display text-2xl">{o.code}</span><span className="block text-sm">{o.full_name} · {when(o.created_at)}</span></span>
              <span className="shrink-0 text-right"><span className="block font-semibold">{formatNaira(o.total)}</span><span className="eyebrow">{o.status} · {o.payment_status}</span></span>
            </button>
            {open === o.id && (
              <div className="mt-4 space-y-3 text-sm">
                <p>{o.phone} · {o.email}{o.instagram ? ` · @${o.instagram}` : ""}</p>
                <p>{o.address}, {o.city}, {o.state}</p>
                <ul className="border-y hairline py-2">
                  {o.order_items.map((i) => <li key={i.id} className="flex justify-between py-1"><span>{i.quantity} × {i.product_name} ({i.size}, {i.colour})</span><span>{formatNaira(i.unit_price * i.quantity)}</span></li>)}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <select className={box + " !w-auto"} value={o.status} onChange={(e) => patch(o.id, { status: e.target.value })}>
                    {["new", "confirmed", "delivered", "cancelled"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select className={box + " !w-auto"} value={o.payment_status} onChange={(e) => patch(o.id, { payment_status: e.target.value })}>
                    {["pending", "paid"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <a className={chip + " inline-flex items-center"} target="_blank" rel="noreferrer" href={waLink(o.phone, `Hi ${o.full_name}, this is FRAANATION about your order ${o.code}.`)}>WhatsApp</a>
                </div>
                <p className="text-xs text-muted-foreground">Cancelling does not put items back in stock. Adjust that in the Stock tab.</p>
              </div>
            )}
          </li>
        ))}
        {!isLoading && list.length === 0 && <li className="py-8 text-muted-foreground">No orders yet.</li>}
      </ul>
    </div>
  );
}

function Guests() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_registrations").select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });
  async function patch(id: string, p: { status?: string; checked_in_at?: string | null }) {
    setErr("");
    const { error } = await supabase.from("event_registrations").update(p).eq("id", id);
    if (error) setErr(error.message);
    qc.invalidateQueries({ queryKey: ["admin-guests"] });
  }
  const active = data.filter((r) => r.status !== "cancelled");
  const list = data.filter((r) => `${r.code} ${r.full_name} ${r.phone} ${r.email} ${r.username ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Code", "Name", "Phone", "Email", "Instagram", "Username", "Guests", "Status", "Checked in"], ...data.map((r) => [r.code, r.full_name, r.phone, r.email, r.instagram, r.username, r.guests, r.status, r.checked_in_at])];
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "fraanation-guest-list.csv";
    document.body.appendChild(a); a.click(); a.remove();
  }
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="border hairline p-3"><p className="font-display text-3xl">{active.length}</p><p className="eyebrow">Reservations</p></div>
        <div className="border hairline p-3"><p className="font-display text-3xl">{active.reduce((n, r) => n + r.guests, 0)}</p><p className="eyebrow">Guests</p></div>
        <div className="border hairline p-3"><p className="font-display text-3xl">{active.filter((r) => r.checked_in_at).reduce((n, r) => n + r.guests, 0)}</p><p className="eyebrow">Checked in</p></div>
      </div>
      <div className="mt-6 flex gap-2">
        <input className={box} placeholder="Search name, phone, code or username" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={exportCsv} className={chip + " shrink-0"}>CSV</button>
      </div>
      {(error || err) && <p className="mt-3 text-sm text-destructive">{err || (error as Error).message}</p>}
      {isLoading && <p className="mt-6">Loading…</p>}
      <ul className="mt-4">
        {list.map((r) => (
          <li key={r.id} className={`border-b hairline py-4 ${r.status === "cancelled" ? "opacity-50" : ""}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span><span className="font-display text-2xl">{r.code}</span><span className="block text-sm">{r.full_name} · {r.guests} {r.guests === 1 ? "guest" : "guests"}</span></span>
              <span className="eyebrow shrink-0">{r.status === "cancelled" ? "cancelled" : r.checked_in_at ? "checked in" : "reserved"}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{r.phone} · {r.email}{r.instagram ? ` · @${r.instagram}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status !== "cancelled" && (r.checked_in_at
                ? <button className={chip} onClick={() => patch(r.id, { checked_in_at: null })}>Undo check-in</button>
                : <button className={chip} onClick={() => patch(r.id, { checked_in_at: new Date().toISOString() })}>Check in</button>)}
              <a className={chip + " inline-flex items-center"} target="_blank" rel="noreferrer" href={waLink(r.phone, `Hi ${r.full_name}, this is FRAANATION. Your reservation ${r.code} is confirmed.`)}>WhatsApp</a>
              {r.status === "cancelled"
                ? <button className={chip} onClick={() => patch(r.id, { status: "reserved" })}>Restore</button>
                : <button className={chip} onClick={() => confirm(`Cancel ${r.code}?`) && patch(r.id, { status: "cancelled" })}>Cancel</button>}
            </div>
          </li>
        ))}
        {!isLoading && list.length === 0 && <li className="py-8 text-muted-foreground">No reservations yet.</li>}
      </ul>
    </div>
  );
}

const IMAGE_KEYS = ["pool-dress", "tee", "look-tee", "shorts", "hat"];

function Stock() {
  const qc = useQueryClient();
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: "", price: "", stock: "", description: "", signature: "", colours: "Black", sizes: "S, M, L, XL", image_key: "pool-dress" });
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  async function patch(id: string, p: { stock?: number; active?: boolean }) {
    setErr("");
    const { error } = await supabase.from("products").update(p).eq("id", id);
    if (error) setErr(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const id = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || !Number(f.price) || f.stock === "") { setErr("Enter a name, a price and a stock number."); return; }
    const { error } = await supabase.from("products").insert({
      id, name: f.name.trim(), price: Math.round(Number(f.price)), stock: Math.max(0, Math.round(Number(f.stock))),
      description: f.description.trim(), signature: f.signature.trim(), colours: list(f.colours), sizes: list(f.sizes),
      image_key: f.image_key, sort_order: data.length + 1, active: true,
    });
    if (error) { setErr(error.message); return; }
    setAdding(false);
    setF({ ...f, name: "", price: "", stock: "", description: "", signature: "" });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }
  return (
    <div>
      {(error || err) && <p className="mb-3 text-sm text-destructive">{err || (error as Error).message}</p>}
      {isLoading && <p>Loading…</p>}
      <ul>
        {data.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 border-b hairline py-4">
            <span className="min-w-0"><span className="font-display block text-2xl">{p.name}</span><span className="text-sm text-muted-foreground">{formatNaira(p.price)} · {p.active ? "visible" : "hidden"}</span></span>
            <span className="flex shrink-0 items-center gap-2">
              <input type="number" min={0} aria-label={`Stock for ${p.name}`} defaultValue={p.stock} key={p.stock} className={box + " !w-20"}
                onBlur={(e) => { const n = Math.max(0, Math.round(Number(e.target.value))); if (n !== p.stock) patch(p.id, { stock: n }); }} />
              <button className={chip} onClick={() => patch(p.id, { active: !p.active })}>{p.active ? "Hide" : "Show"}</button>
            </span>
          </li>
        ))}
      </ul>
      <button className={chip + " mt-6"} onClick={() => setAdding(!adding)}>{adding ? "Close" : "Add product"}</button>
      {adding && (
        <form onSubmit={add} className="mt-4 grid gap-3">
          <input className={box} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={box} type="number" min={0} placeholder="Price (₦)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            <input className={box} type="number" min={0} placeholder="Stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
          </div>
          <textarea className={box} rows={3} placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input className={box} placeholder="Signature detail (e.g. Gold FRAA embroidery)" value={f.signature} onChange={(e) => setF({ ...f, signature: e.target.value })} />
          <input className={box} placeholder="Colours, comma separated" value={f.colours} onChange={(e) => setF({ ...f, colours: e.target.value })} />
          <input className={box} placeholder="Sizes, comma separated" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} />
          <select className={box} value={f.image_key} onChange={(e) => setF({ ...f, image_key: e.target.value })}>
            {IMAGE_KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
          <button type="submit" className="btn-ink w-full">Save product <span>→</span></button>
        </form>
      )}
    </div>
  );
}

type AdminPost = { id: string; body: string; image_path: string | null; created_at: string; author: { username: string } | null };

function Thumb({ path }: { path: string }) {
  const url = useMediaUrl(path);
  return url ? <img src={url} alt="" className="mt-2 h-24 w-24 object-cover" /> : null;
}

function CommunityTab() {
  const qc = useQueryClient();
  const db = supabase as unknown as SupabaseClient;
  const [err, setErr] = useState("");
  const posts = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts")
        .select("id, body, image_path, created_at, author:profiles!posts_author_id_fkey(username)")
        .order("created_at", { ascending: false }).limit(80);
      if (error) throw error;
      return data as unknown as AdminPost[];
    },
  });
  const reports = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await db.from("post_reports").select("post_id");
      if (error) return null;
      return data as { post_id: string }[];
    },
  });
  const counts = new Map<string, number>();
  reports.data?.forEach((r) => counts.set(r.post_id, (counts.get(r.post_id) ?? 0) + 1));
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-posts"] }); qc.invalidateQueries({ queryKey: ["admin-reports"] }); qc.invalidateQueries({ queryKey: ["posts"] }); };
  async function del(id: string) {
    if (!confirm("Delete this post for everyone?")) return;
    setErr("");
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) setErr(error.message);
    refresh();
  }
  async function dismiss(id: string) {
    await db.from("post_reports").delete().eq("post_id", id);
    refresh();
  }
  const list = [...(posts.data ?? [])].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  const flagged = list.filter((p) => counts.has(p.id)).length;
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="border hairline p-3"><p className="font-display text-3xl">{posts.data?.length ?? 0}</p><p className="eyebrow">Recent posts</p></div>
        <div className="border hairline p-3"><p className="font-display text-3xl">{reports.data === null ? "–" : flagged}</p><p className="eyebrow">Reported</p></div>
      </div>
      {reports.data === null && <p className="mt-4 text-sm text-muted-foreground">Reporting isn't switched on yet. Run the community SQL in the database to turn it on. You can still delete posts below.</p>}
      {(posts.error || err) && <p className="mt-3 text-sm text-destructive">{err || (posts.error as Error).message}</p>}
      {posts.isLoading && <p className="mt-6">Loading…</p>}
      <ul className="mt-4">
        {list.map((p) => (
          <li key={p.id} className="border-b hairline py-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">@{p.author?.username ?? "member"}</span>
              <span className="eyebrow shrink-0">{counts.has(p.id) ? `${counts.get(p.id)} report${counts.get(p.id) === 1 ? "" : "s"} · ` : ""}{when(p.created_at)}</span>
            </div>
            {p.body && <p className="mt-2 whitespace-pre-wrap text-sm">{p.body.slice(0, 300)}</p>}
            {p.image_path && <Thumb path={p.image_path} />}
            <div className="mt-3 flex gap-2">
              <button className={chip} onClick={() => del(p.id)}>Delete post</button>
              {counts.has(p.id) && <button className={chip} onClick={() => dismiss(p.id)}>Dismiss reports</button>}
            </div>
          </li>
        ))}
        {!posts.isLoading && list.length === 0 && <li className="py-8 text-muted-foreground">No posts yet.</li>}
      </ul>
    </div>
  );
}
