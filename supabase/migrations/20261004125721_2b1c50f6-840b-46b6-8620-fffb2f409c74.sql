create table public.products (
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
grant execute on function public.place_order(text,text,text,text,text,text,jsonb) to anon, authenticated;