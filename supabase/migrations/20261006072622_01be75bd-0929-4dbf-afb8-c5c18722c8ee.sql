alter table public.events
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
grant execute on function public.lookup_registration(text,text) to anon, authenticated;