-- Kör hela den här filen i Supabase: Project > SQL Editor > New query > klistra in > Run.
-- (Ett engångssteg — gör detta EFTER att du skapat projektet, men INNAN du testar uppladdningssidan.)

create table if not exists garments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null default '',
  details text not null default '',
  price text not null default '',
  image_url text not null default '',
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

create policy "Authenticated users can update garments"
  on garments for update
  to authenticated
  using (true);

create policy "Authenticated users can delete garments"
  on garments for delete
  to authenticated
  using (true);

-- OBS: Skapa själva bildlagringen ("bucket") via Storage-fliken i Supabase FÖRST
-- (namn: "garments", markera den som "Public"), kör sedan raderna nedan.

create policy "Public can view garment images"
  on storage.objects for select
  using (bucket_id = 'garments');

create policy "Authenticated users can upload garment images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'garments');
