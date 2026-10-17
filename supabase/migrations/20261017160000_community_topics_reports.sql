-- 1) After Dark event chat: tag each post with a topic
alter table public.posts
  add column if not exists topic text not null default 'general' check (topic in ('general', 'after-dark'));
create index if not exists posts_topic_created_idx on public.posts (topic, created_at desc);

-- 2) Report a post
create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '' check (length(reason) <= 300),
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);
grant select, insert, delete on public.post_reports to authenticated;
grant all on public.post_reports to service_role;
alter table public.post_reports enable row level security;

drop policy if exists "Members report posts" on public.post_reports;
create policy "Members report posts" on public.post_reports for insert to authenticated
  with check (auth.uid() = reporter_id);
drop policy if exists "Admins view reports" on public.post_reports;
create policy "Admins view reports" on public.post_reports for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins clear reports" on public.post_reports;
create policy "Admins clear reports" on public.post_reports for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));
