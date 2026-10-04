create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  date_text text not null default 'TBA',
  month_text text not null default '',
  venue text not null default 'Venue to be revealed',
  city text not null default 'Lagos',
  price_text text not null default 'Free',
  details text[] not null default '{}',
  registration_open boolean not null default true,
  capacity integer,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Events are public" on public.events for select to anon, authenticated using (true);
create policy "Admins manage events" on public.events for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  instagram text,
  code text not null unique,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  unique (event_id, email)
);
grant select, update, delete on public.event_registrations to authenticated;
grant all on public.event_registrations to service_role;
alter table public.event_registrations enable row level security;
create policy "Admins view registrations" on public.event_registrations for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update registrations" on public.event_registrations for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete registrations" on public.event_registrations for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Public registration via validated function (no direct table access for visitors)
create or replace function public.register_for_event(_slug text, _full_name text, _email text, _phone text, _instagram text)
returns table (code text, already_registered boolean)
language plpgsql security definer set search_path = public
as $$
declare ev public.events; existing text; new_code text; taken int;
begin
  select * into ev from public.events where slug = _slug;
  if ev.id is null then raise exception 'Event not found'; end if;
  if not ev.registration_open then raise exception 'Registration is closed'; end if;
  if length(trim(_full_name)) < 2 or length(_full_name) > 100 then raise exception 'Invalid name'; end if;
  if _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 255 then raise exception 'Invalid email'; end if;
  if length(trim(_phone)) < 7 or length(_phone) > 20 then raise exception 'Invalid phone'; end if;
  if _instagram is not null and length(_instagram) > 40 then raise exception 'Invalid Instagram'; end if;

  select r.code into existing from public.event_registrations r where r.event_id = ev.id and lower(r.email) = lower(trim(_email));
  if existing is not null then return query select existing, true; return; end if;

  if ev.capacity is not null then
    select count(*) into taken from public.event_registrations r where r.event_id = ev.id;
    if taken >= ev.capacity then raise exception 'Event is full'; end if;
  end if;

  new_code := 'FRAA-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  insert into public.event_registrations (event_id, full_name, email, phone, instagram, code)
  values (ev.id, trim(_full_name), lower(trim(_email)), trim(_phone), nullif(trim(coalesce(_instagram,'')), ''), new_code);
  return query select new_code, false;
end $$;
revoke all on function public.register_for_event(text,text,text,text,text) from public;
grant execute on function public.register_for_event(text,text,text,text,text) to anon, authenticated;

create or replace function public.lookup_registration(_code text, _email text)
returns table (full_name text, code text, status text, event_title text)
language sql stable security definer set search_path = public
as $$
  select r.full_name, r.code, r.status, e.title from public.event_registrations r
  join public.events e on e.id = r.event_id
  where r.code = upper(trim(_code)) and r.email = lower(trim(_email))
$$;
revoke all on function public.lookup_registration(text,text) from public;
grant execute on function public.lookup_registration(text,text) to anon, authenticated;

insert into public.events (slug, title, tagline, date_text, month_text, venue, city, price_text, details, is_featured)
values ('pool-party', 'The Pool Party', 'Free entry. Summer on full volume.', 'TBA', 'Next month', 'Venue to be revealed', 'Lagos', 'Free',
  array['Free entry — registration required','DJs, music and summer energy all day','First look at THE FRAANATION COLLECTION','Dress code: poolside, bold, unmistakably you'], true);