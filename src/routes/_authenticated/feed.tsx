import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Avatar, POST_SELECT, PostCard, uploadMedia, useMe, type Post } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "The Feed — FRAANATION Community" },
      { name: "description", content: "Posts, photos, likes and comments from FRAANATION members." },
      { property: "og:title", content: "The Feed — FRAANATION Community" },
      { property: "og:description", content: "Members-only feed of the nation." },
    ],
  }),
  component: Feed,
});

const db = supabase as unknown as SupabaseClient;
type Topic = "all" | "after-dark";

function Feed() {
  const me = useMe();
  const [topic, setTopic] = useState<Topic>("all");
  // Event chat needs a database column; only switch it on once that exists.
  const ready = useQuery({
    queryKey: ["topics-ready"],
    staleTime: Infinity,
    queryFn: async () => !(await db.from("posts").select("topic").limit(1)).error,
  }).data === true;
  const active: Topic = ready ? topic : "all";
  const posts = useQuery({
    queryKey: ["posts", "feed", active],
    queryFn: async () => {
      let q = db.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(50);
      if (active === "after-dark") q = q.eq("topic", "after-dark");
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Post[];
    },
  });
  const p = me.data;
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-10">
        <div className="flex items-end justify-between border-b border-ink-foreground/15 pb-6">
          <div>
            <p className="eyebrow text-sun">Members only</p>
            <h1 className="font-display mt-2 text-7xl leading-none">The Feed</h1>
          </div>
          {p && (
            <Link to="/m/$username" params={{ username: p.username }} className="flex items-center gap-2" aria-label="My profile">
              <Avatar path={p.avatar_path} name={p.display_name || p.username} size={44} />
            </Link>
          )}
        </div>
        {ready && (
          <div className="flex gap-6 border-b border-ink-foreground/15">
            {([["all", "Everyone"], ["after-dark", "After Dark"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTopic(k)} className={`eyebrow min-h-12 border-b-2 ${active === k ? "border-sun text-sun" : "border-transparent opacity-60"}`}>{l}</button>
            ))}
          </div>
        )}
        {active === "after-dark" && (
          <p className="font-editorial border-b border-ink-foreground/15 py-6 text-2xl">Going to FRAANATION After Dark? Say hi, share your fit, ask about the venue, find a ride.</p>
        )}
        {p && <Composer meId={p.id} topic={active} ready={ready} />}
        {posts.isLoading && <p className="py-10 opacity-50">Loading the nation…</p>}
        {posts.data?.length === 0 && <p className="font-editorial py-12 text-3xl">Quiet in here. Be the first to post.</p>}
        {p && posts.data?.map((post) => <PostCard key={post.id} post={post} meId={p.id} />)}
      </div>
    </div>
  );
}

function Composer({ meId, topic, ready }: { meId: string; topic: Topic; ready: boolean }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function pick(f: File | null) {
    setFile(f); setPreview(f ? URL.createObjectURL(f) : null);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setBusy(true); setErr(null);
    try {
      const image_path = file ? await uploadMedia(meId, file) : null;
      const row = { author_id: meId, body: body.trim().slice(0, 1000), image_path, ...(ready ? { topic: topic === "after-dark" ? "after-dark" : "general" } : {}) };
      const { error } = await db.from("posts").insert(row);
      if (error) throw error;
      setBody(""); pick(null);
      qc.invalidateQueries({ queryKey: ["posts"] });
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "Couldn't post"); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="border-b border-ink-foreground/15 py-6">
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} rows={3} placeholder={topic === "after-dark" ? "Talk about After Dark…" : "What's the move tonight?"}
        aria-label="Write a post" className="w-full resize-none bg-transparent text-lg outline-none placeholder:opacity-40" />
      {preview && (
        <div className="relative mt-3">
          <img src={preview} alt="Selected" className="max-h-80 w-full object-cover" />
          <button type="button" onClick={() => pick(null)} className="eyebrow absolute right-2 top-2 bg-ink px-2 py-1">Remove</button>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
      {err && <p className="mt-2 text-sm text-sun">{err}</p>}
      <p className="mt-2 text-xs opacity-50">Keep it respectful. Abusive posts get removed.</p>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => input.current?.click()} className="eyebrow min-h-11">+ Photo</button>
        <button disabled={busy || (!body.trim() && !file)} className="eyebrow min-h-11 bg-sun px-5 text-ink disabled:opacity-40">{busy ? "Posting…" : "Post"}</button>
      </div>
    </form>
  );
}
