import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, uploadMedia, useMe } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Edit profile — FRAANATION" },
      { name: "description", content: "Update your FRAANATION member profile." },
      { property: "og:title", content: "Edit profile — FRAANATION" },
      { property: "og:description", content: "Your FRAANATION member profile." },
    ],
  }),
  component: Account,
});

function Account() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ username: "", display_name: "", bio: "", instagram: "" });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (me.data) {
      setF({ username: me.data.username, display_name: me.data.display_name, bio: me.data.bio, instagram: me.data.instagram ?? "" });
      setAvatar(me.data.avatar_path);
    }
  }, [me.data]);

  async function pickAvatar(file: File | undefined) {
    if (!file || !me.data) return;
    setBusy(true); setMsg(null);
    try { setAvatar(await uploadMedia(me.data.id, file)); } catch (e) { setMsg(e instanceof Error ? e.message : "Upload failed"); }
    setBusy(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!me.data) return;
    const username = f.username.trim().toLowerCase();
    if (!/^[a-z0-9_.]{2,30}$/.test(username)) { setMsg("Username: 2–30 letters, numbers, _ or ."); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("profiles").update({
      username, display_name: f.display_name.trim().slice(0, 60), bio: f.bio.trim().slice(0, 300),
      instagram: f.instagram.trim().replace(/^@/, "").slice(0, 40) || null, avatar_path: avatar,
    }).eq("id", me.data.id);
    setBusy(false);
    if (error) { setMsg(error.code === "23505" ? "That username is taken" : error.message); return; }
    await qc.invalidateQueries();
    navigate({ to: "/m/$username", params: { username } });
  }

  const field = "min-h-12 w-full border-b border-ink-foreground/30 bg-transparent text-base outline-none focus:border-sun";
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <form onSubmit={save} className="mx-auto max-w-xl space-y-6 px-5 pb-24 pt-10">
        <p className="eyebrow text-sun">Your profile</p>
        <h1 className="font-display text-6xl leading-none">Edit profile</h1>
        <div className="flex items-center gap-5">
          <Avatar path={avatar} name={f.display_name || f.username} size={88} />
          <button type="button" onClick={() => fileRef.current?.click()} className="eyebrow min-h-11">{busy ? "Uploading…" : "Change photo"}</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickAvatar(e.target.files?.[0])} />
        </div>
        <label className="block"><span className="eyebrow opacity-50">Username</span>
          <input className={field} value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></label>
        <label className="block"><span className="eyebrow opacity-50">Display name</span>
          <input className={field} maxLength={60} value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} /></label>
        <label className="block"><span className="eyebrow opacity-50">Bio</span>
          <textarea className={`${field} resize-none py-2`} rows={3} maxLength={300} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></label>
        <label className="block"><span className="eyebrow opacity-50">Instagram (optional)</span>
          <input className={field} maxLength={40} placeholder="@yourname" value={f.instagram} onChange={(e) => setF({ ...f, instagram: e.target.value })} /></label>
        {msg && <p className="border-l-2 border-sun pl-3 text-sm">{msg}</p>}
        <button disabled={busy} className="btn-light w-full bg-sun text-ink disabled:opacity-50">Save profile <span>→</span></button>
      </form>
    </div>
  );
}
