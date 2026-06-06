-- =============================================================================
-- Conquistas de hábitos + correção de ícones (nomes -> emojis)
-- =============================================================================

-- 1) Ícones do seed inicial eram nomes (ex.: "flame"); a UI renderiza como
--    emoji. Atualiza para emojis correspondentes.
update public.achievements set icon = '✨' where slug = 'first_steps';
update public.achievements set icon = '⭐' where slug in ('xp_100', 'xp_1000');
update public.achievements set icon = '👑' where slug = 'xp_10000';
update public.achievements set icon = '🛡️' where slug in ('level_5', 'level_10');
update public.achievements set icon = '🔥' where slug in ('streak_3', 'streak_7', 'streak_30');
update public.achievements set icon = '🧩' where slug = 'all_tools';

-- 2) Novas conquistas específicas de hábitos
insert into public.achievements (slug, title, description, icon, category, xp_reward, criteria) values
  ('habit_first',     'Primeiro Hábito',  'Marcou um hábito pela primeira vez.',              '🌱', 'habits', 25,  '{"type":"habit_checks","value":1}'),
  ('habit_checks_50', 'Disciplina',       'Acumulou 50 marcações de hábitos.',               '📿', 'habits', 150, '{"type":"habit_checks","value":50}'),
  ('habit_checks_200','Mestre do Hábito', 'Acumulou 200 marcações de hábitos.',              '🏅', 'habits', 400, '{"type":"habit_checks","value":200}'),
  ('habit_streak_7',  'Hábito Firme',     'Manteve um hábito por 7 dias seguidos.',          '🔥', 'habits', 100, '{"type":"habit_streak","value":7}'),
  ('habit_streak_30', 'Inquebrável',      'Manteve um hábito por 30 dias seguidos.',         '💎', 'habits', 500, '{"type":"habit_streak","value":30}'),
  ('habit_5_in_day',  'Dia Cheio',        'Concluiu 5 hábitos diferentes em um único dia.',  '🌟', 'habits', 100, '{"type":"habits_in_day","value":5}')
on conflict (slug) do nothing;
