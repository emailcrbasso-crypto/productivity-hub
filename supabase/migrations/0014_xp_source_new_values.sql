-- =============================================================================
-- Estende o enum xp_source com as novas fontes de XP
-- =============================================================================
-- Os módulos Impacto × Esforço e Hábitos gravam XP com source 'impact_effort'
-- e 'habits'. Sem estes valores no enum, o insert em xp_events falha e a ação
-- inteira (marcar hábito / concluir tarefa) dá erro.
--
-- ALTER TYPE ... ADD VALUE é idempotente com IF NOT EXISTS (PG 10+).
-- =============================================================================

alter type public.xp_source add value if not exists 'impact_effort';
alter type public.xp_source add value if not exists 'habits';
