-- =============================================================================
-- Plano Semanal — categoria das metas
-- =============================================================================
-- Adiciona coluna opcional `category` às metas semanais.
-- Valores esperados: 'trabalho' | 'pessoal' | 'saude' | 'estudo' | 'outro'
-- (validação feita na aplicação; null = sem categoria)
-- =============================================================================

alter table public.weekly_goals
  add column if not exists category text;
