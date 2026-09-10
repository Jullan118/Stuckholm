-- Kör den här filen EN gång i Supabase (SQL Editor > New query > klistra in > Run) —
-- MEN BARA om du redan hunnit sätta gender_scale-värden (1–5) på riktiga plagg
-- med den förra versionen av redigeraren. Om inga plagg har ett värde än kan du
-- hoppa över den här filen helt.
--
-- Skalan är omgjord: istället för 1 (feminint) till 5 (maskulint) är det nu
-- -2 (feminint) till 2 (maskulint), med 0 som "Stuck, can't decide". Den här
-- filen flyttar dina befintliga värden till rätt plats på den nya skalan
-- (1->-2, 2->-1, 3->0, 4->1, 5->2) så du slipper sätta om dem för hand.
--
-- VIKTIGT: kör bara denna EN gång. Kör du den två gånger flyttas värdena fel.

update garments set gender_scale = gender_scale - 3 where gender_scale is not null;
