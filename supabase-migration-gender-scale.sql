-- Kör den här filen EN gång i Supabase (SQL Editor > New query > klistra in > Run).
-- Lägger till en kolumn "gender_scale" på garments-tabellen — ett tal 1–5 som
-- ersätter den gamla Women's/Men's-kategorin på Trash-sidan med en skala:
-- 1 = 100% feminint, 3 = neutral ("Stuck, can't decide"), 5 = 100% maskulint.
-- Befintliga plagg påverkas inte och försvinner inte, men de har inget värde
-- här än — de dyker inte upp när någon filtrerar på skalan förrän du sätter
-- ett värde via redigera-formuläret.

alter table garments add column if not exists gender_scale smallint;
