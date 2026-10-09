create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{2,30}$'),
  display_name text not null default '' check (length(display_name) <= 60),
  bio text not null default '' check (length(bio) <= 300),
  instagram text check (instagram is null or length(instagram) <= 40),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Members view profiles" on public.profiles for select to authenticated using (true);
create policy "Members update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Members insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare base text; candidate text; n int := 0;
begin
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1), 'member'), '[^a-zA-Z0-9_.]', '', 'g'));
  if length(base) < 2 then base := 'member'; end if;
  base := left(base, 24);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1; candidate := base || n::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 60));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '' check (length(body) <= 1000),
  image_path text,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Members view posts" on public.posts for select to authenticated using (true);
create policy "Members create own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id and (length(trim(body)) > 0 or image_path is not null));
create policy "Members delete own posts" on public.posts for delete to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));
create index posts_created_idx on public.posts (created_at desc);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select, insert, delete on public.post_likes to authenticated;
grant all on public.post_likes to service_role;
alter table public.post_likes enable row level security;
create policy "Members view likes" on public.post_likes for select to authenticated using (true);
create policy "Members like" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Members unlike" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.post_comments to authenticated;
grant all on public.post_comments to service_role;
alter table public.post_comments enable row level security;
create policy "Members view comments" on public.post_comments for select to authenticated using (true);
create policy "Members comment" on public.post_comments for insert to authenticated with check (auth.uid() = author_id);
create policy "Members delete own comments" on public.post_comments for delete to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));

create policy "Members read community media" on storage.objects for select to authenticated using (bucket_id = 'community');
create policy "Members upload own media" on storage.objects for insert to authenticated with check (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Members delete own media" on storage.objects for delete to authenticated using (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);