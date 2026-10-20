import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "Status — FRAANATION" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Status,
});

const TABLES = ["events", "products", "event_registrations", "orders", "order_items", "profiles", "posts", "user_roles"];

type Row = { table: string; result: string; ok: boolean };

function Status() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const host = String(import.meta.env["VITE_SUPABASE_URL"] ?? "").replace("https://", "");

  useEffect(() => {
    (async () => {
      const out: Row[] = [];
      for (const t of TABLES) {
        const { count, error } = await supabase.from(t as never).select("*", { count: "exact", head: true });
        if (error) out.push({ table: t, ok: false, result: `${error.code ?? ""} ${error.message}`.trim() });
        else out.push({ table: t, ok: true, result: `readable (${count ?? 0} rows)` });
      }
      setRows(out);
    })();
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-head text-4xl">Status</h1>
      <p className="mt-2 break-all text-sm text-muted-foreground">Backend: {host || "unknown"}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        events should show 1 row and products should show 5 rows or more. The other tables are private, so 0 rows is normal for them.
        "Could not find the table" means the table is missing or hidden.
      </p>
      <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {(rows ?? TABLES.map((t) => ({ table: t, ok: false, result: "checking…" }))).map((r) => (
          <li key={r.table} className="py-3 text-sm">
            <span className="font-semibold">{r.table}</span>
            <span className={`mt-0.5 block break-words ${r.ok ? "text-green-700" : "text-muted-foreground"}`}>{r.result}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
