import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; username: string; display_name: string; bio: string; instagram: string | null; avatar_path: string | null };
export type Post = {
  id: string; body: string; image_path: string | null; created_at: string; author_id: string;
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_path"> | null;
  post_likes: { user_id: string }[];
  post_comments: { count: number }[];
};

export const POST_SELECT = "id, body, image_path, created_at, author_id, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_path), post_likes(user_id), post_comments(count)";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return data as Profile | null;
    },
  });
}

const urlCache = new Map<string, string>();
export function useMediaUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(path ? urlCache.get(path) ?? null : null);
  useEffect(() => {
    if (!path) { setUrl(null); return; }
    if (urlCache.has(path)) { setUrl(urlCache.get(path)!); return; }
    supabase.storage.from("community").createSignedUrl(path, 60 * 60 * 6).then(({ data }) => {
      if (data?.signedUrl) { urlCache.set(path, data.signedUrl); setUrl(data.signedUrl); }
    });
  }, [path]);
  return url;
}

export async function uploadMedia(userId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo");
  if (file.size > 10 * 1024 * 1024) throw new Error("Photo must be under 10MB");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("community").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export function Avatar({ path, name, size = 40 }: { path: string | null | undefined; name: string; size?: number }) {
  const url = useMediaUrl(path);
  return (
    <span className="inline-flex shrink-0 items-center justify-center overflow-hidden bg-sun font-display text-ink" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : (name[0] || "F").toUpperCase()}
    </span>
  );
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

type Comment = { id: string; body: string; created_at: string; author_id: string; author: { username: string } | null };

export function PostCard({ post, meId }: { post: Post; meId: string }) {
  const qc = useQueryClient();
  const img = useMediaUrl(post.image_path);
  const liked = post.post_likes.some((l) => l.user_id === meId);
  const [likeState, setLikeState] = useState({ liked, count: post.post_likes.length });
  useEffect(() => setLikeState({ liked, count: post.post_likes.length }), [liked, post.post_likes.length]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const commentCount = post.post_comments[0]?.count ?? 0;
  const comments = useQuery({
    queryKey: ["comments", post.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("post_comments")
        .select("id, body, created_at, author_id, author:profiles!post_comments_author_id_fkey(username)")
        .eq("post_id", post.id).order("created_at");
      if (error) throw error;
      return data as unknown as Comment[];
    },
  });
  const name = post.author?.display_name || post.author?.username || "member";

  async function toggleLike() {
    const next = !likeState.liked;
    setLikeState((s) => ({ liked: next, count: s.count + (next ? 1 : -1) }));
    const res = next
      ? await supabase.from("post_likes").insert({ post_id: post.id, user_id: meId })
      : await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", meId);
    if (res.error) setLikeState({ liked: !next, count: likeState.count });
  }
  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("post_comments").insert({ post_id: post.id, author_id: meId, body: text.trim().slice(0, 500) });
    setBusy(false);
    if (!error) { setText(""); qc.invalidateQueries({ queryKey: ["comments", post.id] }); qc.invalidateQueries({ queryKey: ["posts"] }); }
  }
  async function removePost() {
    if (!confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", post.id);
    if (post.image_path) await supabase.storage.from("community").remove([post.image_path]);
    qc.invalidateQueries({ queryKey: ["posts"] });
  }
  async function removeComment(id: string) {
    await supabase.from("post_comments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["comments", post.id] }); qc.invalidateQueries({ queryKey: ["posts"] });
  }

  return (
    <article className="border-b border-ink-foreground/15 py-6">
      <header className="flex items-center gap-3">
        {post.author && (
          <Link to="/m/$username" params={{ username: post.author.username }} className="flex items-center gap-3">
            <Avatar path={post.author.avatar_path} name={name} />
            <span>
              <span className="block font-semibold leading-tight">{name}</span>
              <span className="eyebrow opacity-50">@{post.author.username} · {timeAgo(post.created_at)}</span>
            </span>
          </Link>
        )}
        {post.author_id === meId && <button onClick={removePost} className="eyebrow ml-auto min-h-11 opacity-50 hover:opacity-100">Delete</button>}
      </header>
      {post.body && <p className="mt-4 whitespace-pre-wrap text-[1.05rem] leading-relaxed">{post.body}</p>}
      {post.image_path && (
        <div className="mt-4 bg-ink-foreground/5">
          {img ? <img src={img} alt={`Post by ${name}`} className="w-full object-cover" loading="lazy" /> : <div className="aspect-[4/5]" />}
        </div>
      )}
      <div className="mt-4 flex items-center gap-6">
        <button onClick={toggleLike} aria-pressed={likeState.liked} className={`eyebrow min-h-11 ${likeState.liked ? "text-sun" : ""}`}>
          {likeState.liked ? "♥ Liked" : "♡ Like"} · {likeState.count}
        </button>
        <button onClick={() => setOpen(!open)} className="eyebrow min-h-11">Comments · {commentCount}</button>
      </div>
      {open && (
        <div className="mt-2 border-l-2 border-sun pl-4">
          {comments.data?.map((c) => (
            <div key={c.id} className="flex items-start gap-2 py-2 text-sm">
              <p className="flex-1"><span className="font-semibold">@{c.author?.username}</span> {c.body}</p>
              {c.author_id === meId && <button onClick={() => removeComment(c.id)} className="eyebrow opacity-50">×</button>}
            </div>
          ))}
          {comments.data?.length === 0 && <p className="py-2 text-sm opacity-50">No comments yet. Start it.</p>}
          <form onSubmit={addComment} className="mt-2 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Add a comment" aria-label="Add a comment"
              className="min-h-11 flex-1 border-b border-ink-foreground/30 bg-transparent text-base outline-none focus:border-sun" />
            <button disabled={busy || !text.trim()} className="eyebrow min-h-11 text-sun disabled:opacity-40">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}
