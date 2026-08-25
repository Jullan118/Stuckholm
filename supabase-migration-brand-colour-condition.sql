-- Kör den här filen EN gång i Supabase (SQL Editor > New query > klistra in > Run).
-- Den lägger bara till tre nya kolumner till din befintliga "garments"-tabell —
-- dina redan uppladdade plagg påverkas inte och försvinner inte.

alter table garments add column if not exists brand text;
alter table garments add column if not exists colour text;
alter table garments add column if not exists condition text;
