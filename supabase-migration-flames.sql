-- Kör den här filen i Supabase: Project > SQL Editor > New query > klistra in > Run.
-- Skapar tabellen för "New Flames"-sidan. Bilder återanvänder samma
-- lagringsbucket ("garments") som Gammalt Skräp redan använder, så inget
-- behöver skapas i Storage-fliken för det här steget.

create table if not exists flames (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null default '',
  details text not null default '',
  price text not null default '',
  price_amount numeric,
  price_currency text not null default 'sek',
  color_count integer,
  image_url text not null default '',
  image_urls text[],
  seller_name text,
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table flames enable row level security;

-- Alla, även besökare utan inloggning, får LÄSA produkterna.
create policy "Public can view flames"
  on flames for select
  using (true);

-- Bara inloggade användare får lägga till nya produkter.
create policy "Authenticated users can insert flames"
  on flames for insert
  to authenticated
  with check (true);

-- Bara den som lade upp produkten får ändra eller ta bort den.
create policy "Owners can update their own flames"
  on flames for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own flames"
  on flames for delete
  to authenticated
  using (auth.uid() = owner_id);
