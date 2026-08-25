-- Kör hela den här filen i Supabase: Project > SQL Editor > New query > klistra in > Run.
-- (Ett engångssteg — gör detta EFTER att du skapat projektet, men INNAN du testar uppladdningssidan.)

create table if not exists garments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text,
  colour text,
  condition text,
  short_description text not null default '',
  details text not null default '',
  price text not null default '',
  price_amount numeric,
  price_currency text not null default 'kr',
  image_url text not null default '',
  image_urls text[],
  seller_name text,
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table garments enable row level security;

-- Alla (även besökare utan inloggning) får LÄSA plaggen, så gallerit är publikt.
create policy "Public can view garments"
  on garments for select
  using (true);

-- Bara inloggade användare (du + din bror) får lägga till/ändra/ta bort plagg.
create policy "Authenticated users can insert garments"
  on garments for insert
  to authenticated
  with check (true);

-- Bara den som lade upp plagget får ändra eller ta bort det.
create policy "Owners can update their own garments"
  on garments for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own garments"
  on garments for delete
  to authenticated
  using (auth.uid() = owner_id);

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

create policy "Public can view flames"
  on flames for select
  using (true);

create policy "Authenticated users can insert flames"
  on flames for insert
  to authenticated
  with check (true);

create policy "Owners can update their own flames"
  on flames for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own flames"
  on flames for delete
  to authenticated
  using (auth.uid() = owner_id);

-- OBS: Skapa själva bildlagringen ("bucket") via Storage-fliken i Supabase FÖRST
-- (namn: "garments", markera den som "Public"), kör sedan raderna nedan.
-- Samma bucket används för både Gammalt Skräp och New Flames.

create policy "Public can view garment images"
  on storage.objects for select
  using (bucket_id = 'garments');

create policy "Authenticated users can upload garment images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'garments');
