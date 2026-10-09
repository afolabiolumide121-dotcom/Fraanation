import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, POST_SELECT, PostCard, useMe, type Post, type Profile } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/m/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — FRAANATION Community` },
      { name: "description", content: `Member profile of @${params.username} on FRAANATION.` },
      { property: "og:title", content: `@${params.username} — FRAANATION` },
      { property: "og:description", content: "A member of the nation." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profile = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
  const posts = useQuery({
    queryKey: ["posts", "user", profile.data?.id],
    enabled: !!profile.data,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("author_id", profile.data!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Post[];
    },
  });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const p = profile.data;
  if (profile.isLoading) return <div className="min-h-screen bg-ink p-10 text-ink-foreground opacity-50">Loading…</div>;
  if (!p) return (
    <div className="min-h-screen bg-ink px-5 py-20 text-ink-foreground">
      <p className="font-display text-6xl">No member here.</p>
      <Link to="/feed" className="eyebrow mt-6 inline-block text-sun">← Back to the feed</Link>
    </div>
  );
  const mine = me.data?.id === p.id;
  const name = p.display_name || p.username;
  const likes = posts.data?.reduce((n, x) => n + x.post_likes.length, 0) ?? 0;
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-8">
        <Link to="/feed" className="eyebrow min-h-11 inline-flex items-center opacity-60">← The Feed</Link>
        <div className="mt-4 flex items-end gap-5">
          <Avatar path={p.avatar_path} name={name} size={104} />
          <div className="min-w-0">
            <p className="eyebrow text-sun">@{p.username}</p>
            <h1 className="font-display mt-1 break-words text-5xl leading-none">{name}</h1>
          </div>
        </div>
        {p.bio && <p className="font-editorial mt-6 text-2xl leading-snug">{p.bio}</p>}
        {p.instagram && (
          <a href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="eyebrow link-draw mt-4 inline-block">
            Instagram · @{p.instagram.replace(/^@/, "")}
          </a>
        )}
        <div className="mt-6 flex gap-8 border-y border-ink-foreground/15 py-4">
          <span><span className="font-display text-3xl">{posts.data?.length ?? 0}</span> <span className="eyebrow opacity-50">Posts</span></span>
          <span><span className="font-display text-3xl">{likes}</span> <span className="eyebrow opacity-50">Likes</span></span>
        </div>
        {mine && (
          <div className="mt-4 flex gap-6">
            <Link to="/account" className="eyebrow min-h-11 inline-flex items-center text-sun">Edit profile</Link>
            <button onClick={signOut} className="eyebrow min-h-11 opacity-60">Sign out</button>
          </div>
        )}
        {posts.data?.length === 0 && <p className="font-editorial py-10 text-2xl opacity-70">No posts yet.</p>}
        {me.data && posts.data?.map((post) => <PostCard key={post.id} post={post} meId={me.data!.id} />)}
      </div>
    </div>
  );
}
