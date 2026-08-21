-- Kör den här filen EN gång i Supabase (SQL Editor > New query > klistra in > Run).
-- Den lägger bara till två nya kolumner till din befintliga "garments"-tabell —
-- dina två redan uppladdade plagg påverkas inte och försvinner inte.

alter table garments add column if not exists price_amount numeric;
alter table garments add column if not exists price_currency text not null default 'kr';
