-- FRAANATION: complete setup for a NEW Supabase project.
-- Paste this whole file into Supabase > SQL Editor > New query, tap Run ONCE, then restart the project.
grant usage on schema public to anon, authenticated, service_role;

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
  array['Free entry — registration required','DJs, music and summer energy all day','First look at THE FRAANATION COLLECTION','Dress code: poolside, bold, unmistakably you'], true);revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;create table public.products (
  id text primary key, name text not null, price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0), active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Products are public" on public.products for select to anon, authenticated using (true);
create policy "Admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.products (id,name,price,stock) values
 ('fraa-heavy-tee','FRAA Heavyweight Tee',25000,24),
 ('fraa-swim-short','FRAA Pool Short',18000,8),
 ('fraanation-bucket','FRAANATION Bucket Hat',12000,3);

create table public.orders (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  full_name text not null, email text not null, phone text not null,
  address text not null, city text not null, notes text,
  total integer not null, status text not null default 'pending',
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null, size text not null, colour text not null,
  quantity integer not null check (quantity > 0), unit_price integer not null
);
grant select, update, delete on public.orders, public.order_items to authenticated;
grant all on public.orders, public.order_items to service_role;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "Admins view orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins view order items" on public.order_items for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.place_order(_full_name text, _email text, _phone text, _address text, _city text, _notes text, _items jsonb)
returns table(code text, total integer)
language plpgsql security definer set search_path = public as $$
declare it jsonb; p public.products; q int; sum_total int := 0; oid uuid; new_code text;
begin
  if length(trim(_full_name)) < 2 or length(_full_name) > 100 then raise exception 'Invalid name'; end if;
  if _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 255 then raise exception 'Invalid email'; end if;
  if length(trim(_phone)) < 7 or length(_phone) > 20 then raise exception 'Invalid phone'; end if;
  if length(trim(_address)) < 5 or length(_address) > 300 then raise exception 'Invalid address'; end if;
  if length(trim(_city)) < 2 or length(_city) > 60 then raise exception 'Invalid city'; end if;
  if _notes is not null and length(_notes) > 500 then raise exception 'Notes too long'; end if;
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 or jsonb_array_length(_items) > 20 then raise exception 'Cart is empty'; end if;

  new_code := 'FRAA-O-' || upper(substr(md5(gen_random_uuid()::text),1,6));
  insert into public.orders (code, full_name, email, phone, address, city, notes, total)
  values (new_code, trim(_full_name), lower(trim(_email)), trim(_phone), trim(_address), trim(_city), nullif(trim(coalesce(_notes,'')),''), 0)
  returning id into oid;

  for it in select * from jsonb_array_elements(_items) loop
    q := (it->>'quantity')::int;
    if q is null or q < 1 or q > 10 then raise exception 'Invalid quantity'; end if;
    select * into p from public.products where id = it->>'product_id' and active for update;
    if p.id is null then raise exception 'Product not found'; end if;
    if p.stock < q then raise exception '% is out of stock', p.name; end if;
    update public.products set stock = stock - q where id = p.id;
    insert into public.order_items (order_id, product_id, product_name, size, colour, quantity, unit_price)
    values (oid, p.id, p.name, left(coalesce(it->>'size',''),20), left(coalesce(it->>'colour',''),30), q, p.price);
    sum_total := sum_total + q * p.price;
  end loop;

  update public.orders set total = sum_total where id = oid;
  return query select new_code, sum_total;
end $$;
grant execute on function public.place_order(text,text,text,text,text,text,jsonb) to anon, authenticated;alter table public.products
  add column description text not null default '',
  add column signature text not null default '',
  add column colours text[] not null default '{}',
  add column sizes text[] not null default '{}',
  add column image_key text not null default 'tee',
  add column sort_order integer not null default 0,
  add column updated_at timestamptz not null default now();

delete from public.products where id in ('fraa-heavy-tee','fraa-swim-short','fraanation-bucket')
  and not exists (select 1 from public.order_items oi where oi.product_id = products.id);

insert into public.products (id,name,price,stock,description,signature,colours,sizes,image_key,sort_order) values
 ('signature-tee','FRAANATION Signature Tee',25000,24,'Oversized 280gsm heavyweight cotton with a raised yellow FRAA chest embroidery and woven neck label.','Embroidered FRAA chest mark','{Black,White}','{S,M,L,XL}','tee',1),
 ('pool-tee','FRAANATION Pool Tee',22000,12,'Boxy summer tee cut for heat — lightweight, breathable, finished with the FRAA signature print.','Printed FRAA signature','{White,Black}','{S,M,L,XL}','look-tee',2),
 ('summer-shorts','FRAANATION Summer Shorts',18000,8,'Quick-dry short built for the pool and the after-party. Mesh lined, drawcord waist, FRAA leg embroidery.','FRAA leg embroidery','{Sun Yellow,Black}','{S,M,L,XL}','shorts',3),
 ('signature-cap','FRAANATION Cap',12000,3,'Structured cotton twill with the full FRAANATION wordmark stitched up front.','FRAANATION front embroidery','{White,Black}','{One size}','hat',4)
on conflict (id) do nothing;

alter table public.orders
  add column state text not null default '',
  add column instagram text,
  add column subtotal integer not null default 0,
  add column payment_status text not null default 'pending',
  add column updated_at timestamptz not null default now();
alter table public.orders alter column status set default 'new';

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

drop function public.place_order(text,text,text,text,text,text,jsonb);

create function public.place_order(_full_name text, _email text, _phone text, _address text, _city text, _state text, _instagram text, _items jsonb)
returns table(code text, total integer)
language plpgsql security definer set search_path = public as $$
declare it jsonb; p public.products; q int; sum_total int := 0; oid uuid; new_code text; sz text; col text;
begin
  if length(trim(_full_name)) < 2 or length(_full_name) > 100 then raise exception 'Invalid name'; end if;
  if _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 255 then raise exception 'Invalid email'; end if;
  if length(trim(_phone)) < 7 or length(_phone) > 20 then raise exception 'Invalid phone'; end if;
  if length(trim(_address)) < 5 or length(_address) > 300 then raise exception 'Invalid address'; end if;
  if length(trim(_city)) < 2 or length(_city) > 60 then raise exception 'Invalid city'; end if;
  if length(trim(_state)) < 2 or length(_state) > 60 then raise exception 'Invalid state'; end if;
  if _instagram is not null and length(_instagram) > 40 then raise exception 'Invalid Instagram'; end if;
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 or jsonb_array_length(_items) > 20 then raise exception 'Your cart is empty'; end if;

  loop
    new_code := 'FRAA-O-' || upper(substr(md5(gen_random_uuid()::text),1,6));
    exit when not exists (select 1 from public.orders o where o.code = new_code);
  end loop;
  insert into public.orders (code, full_name, email, phone, address, city, state, instagram, subtotal, total)
  values (new_code, trim(_full_name), lower(trim(_email)), trim(_phone), trim(_address), trim(_city), trim(_state),
          nullif(trim(coalesce(_instagram,'')),''), 0, 0)
  returning id into oid;

  for it in select * from jsonb_array_elements(_items) loop
    q := (it->>'quantity')::int; sz := it->>'size'; col := it->>'colour';
    if q is null or q < 1 or q > 20 then raise exception 'Invalid quantity'; end if;
    select * into p from public.products where id = it->>'product_id' and active for update;
    if p.id is null then raise exception 'A product in your cart is no longer available'; end if;
    if not (sz = any(p.sizes)) or not (col = any(p.colours)) then raise exception 'Invalid size or colour for %', p.name; end if;
    if p.stock < q then
      if p.stock = 0 then raise exception '% is out of stock', p.name;
      else raise exception 'Only % left of %', p.stock, p.name; end if;
    end if;
    update public.products set stock = stock - q where id = p.id;
    insert into public.order_items (order_id, product_id, product_name, size, colour, quantity, unit_price)
    values (oid, p.id, p.name, sz, col, q, p.price);
    sum_total := sum_total + q * p.price;
  end loop;

  update public.orders set subtotal = sum_total, total = sum_total where id = oid;
  return query select new_code, sum_total;
end $$;
revoke all on function public.place_order(text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.place_order(text,text,text,text,text,text,text,jsonb) to anon, authenticated;delete from public.orders where code = 'FRAA-O-082631';
update public.products set stock = 24 where id = 'signature-tee';alter table public.events
  add column starts_at timestamptz,
  add column time_text text not null default '',
  add column address text not null default '',
  add column max_guests_per_reservation integer not null default 4;

update public.events set
  title = 'FRAA SPLASH', tagline = 'The night starts here.',
  date_text = 'November 25, 2026', month_text = 'Nov 25, 2026', time_text = '9:00 PM — Till Dawn',
  venue = 'The Grand Elysium', address = '9 Taiye Odunjo St., Behind Grace Hotel, Idimu, Lagos', city = 'Lagos',
  price_text = 'Free — entry is by reservation', starts_at = '2026-11-25 21:00:00+01',
  details = array['Free entry — reservation required','Music, fashion and people — one night, till dawn','The FRAA Collection, worn by the crowd','Dress code: bold, poolside, unmistakably you'],
  registration_open = true, is_featured = true, updated_at = now()
where slug = 'pool-party';

alter table public.event_registrations
  add column username text,
  add column guests integer not null default 1 check (guests between 1 and 10),
  add column user_id uuid,
  add column checked_in_at timestamptz,
  add column updated_at timestamptz not null default now();
alter table public.event_registrations alter column status set default 'reserved';
update public.event_registrations set status = 'reserved' where status = 'confirmed';
create trigger event_registrations_touch before update on public.event_registrations for each row execute function public.touch_updated_at();

drop function public.register_for_event(text,text,text,text,text);
create function public.register_for_event(_slug text, _full_name text, _email text, _phone text, _instagram text, _username text, _guests integer)
returns table(code text, already_registered boolean, full_name text, guests integer)
language plpgsql security definer set search_path = public as $$
declare ev public.events; ex public.event_registrations; new_code text; taken int;
begin
  select * into ev from public.events where slug = _slug;
  if ev.id is null then raise exception 'Event not found'; end if;
  if not ev.registration_open then raise exception 'Reservations are closed'; end if;
  if length(trim(_full_name)) < 2 or length(_full_name) > 100 then raise exception 'Invalid name'; end if;
  if _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 255 then raise exception 'Invalid email'; end if;
  if length(trim(_phone)) < 7 or length(_phone) > 20 then raise exception 'Invalid phone'; end if;
  if _instagram is not null and length(_instagram) > 40 then raise exception 'Invalid Instagram'; end if;
  if _username is null or trim(_username) !~ '^[A-Za-z0-9_.]{2,30}$' then raise exception 'Invalid username'; end if;
  if _guests is null or _guests < 1 or _guests > ev.max_guests_per_reservation then raise exception 'Guests must be between 1 and %', ev.max_guests_per_reservation; end if;

  select * into ex from public.event_registrations r where r.event_id = ev.id and lower(r.email) = lower(trim(_email)) and r.status <> 'cancelled';
  if ex.id is not null then return query select ex.code, true, ex.full_name, ex.guests; return; end if;

  if ev.capacity is not null then
    select coalesce(sum(r.guests),0) into taken from public.event_registrations r where r.event_id = ev.id and r.status <> 'cancelled';
    if taken + _guests > ev.capacity then raise exception 'Reservations are full'; end if;
  end if;

  loop
    new_code := 'FRAA-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.event_registrations r where r.code = new_code);
  end loop;
  insert into public.event_registrations (event_id, full_name, email, phone, instagram, username, guests, code, user_id)
  values (ev.id, trim(_full_name), lower(trim(_email)), trim(_phone), nullif(trim(coalesce(_instagram,'')), ''), trim(_username), _guests, new_code, auth.uid());
  return query select new_code, false, trim(_full_name), _guests;
end $$;
revoke all on function public.register_for_event(text,text,text,text,text,text,integer) from public;
grant execute on function public.register_for_event(text,text,text,text,text,text,integer) to anon, authenticated;

drop function public.lookup_registration(text,text);
create function public.lookup_registration(_code text, _email text)
returns table(full_name text, code text, status text, event_title text, guests integer)
language sql stable security definer set search_path = public as $$
  select r.full_name, r.code, r.status, e.title, r.guests from public.event_registrations r
  join public.events e on e.id = r.event_id
  where r.code = upper(trim(_code)) and r.email = lower(trim(_email))
$$;
revoke all on function public.lookup_registration(text,text) from public;
grant execute on function public.lookup_registration(text,text) to anon, authenticated;update public.events set title = 'FRAANATION After Dark', tagline = 'Where the night gets wet.', date_text = 'November 25, 2026', month_text = '25.11.26', time_text = '9:00 PM — Till Dawn', venue = 'The Grand Elysium', address = '9 Taiye Odunjo St., Behind Grace Hotel, Idimu, Lagos', price_text = 'Entry by reservation', updated_at = now() where slug = 'pool-party';

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
alter table public.posts
  add column if not exists topic text not null default 'general' check (topic in ('general', 'after-dark'));
create index if not exists posts_topic_created_idx on public.posts (topic, created_at desc);

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
insert into public.products (id, name, price, stock, description, signature, colours, sizes, image_key, sort_order, active)
values (
  'pool-party-dress',
  'FRAANATION Pool Party Dress',
  28000,
  10,
  'Stretch mini dress made for the pool and the after-party. Ruched side drawstrings let you shape the length and fit, finished with the gold FRAA signature on the chest.',
  'Gold FRAA signature embroidery · side drawstrings',
  '{Black}',
  '{S,M,L,XL}',
  'pool-dress',
  5,
  true
)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('community', 'community', false, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']) on conflict (id) do nothing;


-- final event details (Nov 27, 2026)
update public.events set title = 'FRAANATION After Dark', tagline = 'Where the night gets wet.', date_text = 'November 27, 2026', month_text = '27.11.26', time_text = '9:00 PM — Till Dawn', venue = 'The Grand Elysium', address = '9 Taiye Odunjo St., Behind Grace Hotel, Idimu, Lagos', city = 'Lagos', price_text = 'Entry by reservation', starts_at = '2026-11-27 21:00:00+01', registration_open = true, updated_at = now() where slug = 'pool-party';

notify pgrst, 'reload schema';
select (select count(*) from public.events) as events, (select count(*) from public.products) as products,
       (select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname in ('register_for_event','lookup_registration','place_order','has_role')) as functions;
