alter table public.products
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
grant execute on function public.place_order(text,text,text,text,text,text,text,jsonb) to anon, authenticated;