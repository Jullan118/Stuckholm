-- Kör den här filen EN gång i Supabase (SQL Editor > New query > klistra in > Run).
-- Efter detta kan man bara redigera/ta bort SINA EGNA plagg, inte varandras.
-- Dina redan uppladdade plagg påverkas inte och försvinner inte.

alter table garments add column if not exists owner_id uuid references auth.users(id);

-- Sätt ägare på plagg som saknar det (t.ex. de du redan laddat upp) till det
-- första kontot som skapades i Supabase Authentication — vilket ska vara ditt.
update garments
set owner_id = (select id from auth.users order by created_at asc limit 1)
where owner_id is null;

-- Byt ut de gamla "alla inloggade får ändra/ta bort allt"-reglerna mot
-- regler som bara tillåter ägaren av plagget.
drop policy if exists "Authenticated users can update garments" on garments;
drop policy if exists "Authenticated users can delete garments" on garments;

create policy "Owners can update their own garments"
  on garments for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own garments"
  on garments for delete
  to authenticated
  using (auth.uid() = owner_id);
