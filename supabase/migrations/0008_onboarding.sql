-- =============================================================================
-- Onboarding — flag de boas-vindas concluído
-- =============================================================================
-- Controla a exibição do tour de boas-vindas (apenas na primeira vez).
-- =============================================================================

alter table public.profiles
  add column if not exists onboarded boolean not null default false;
