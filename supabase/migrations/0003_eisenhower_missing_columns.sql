-- =============================================================================
-- Fix: adiciona colunas faltantes em eisenhower_tasks.
-- "create table if not exists" no 0002 é silencioso se a tabela já existia,
-- então campos novos podem não ter sido aplicados. Esta migration garante
-- o schema final por meio de ADD COLUMN IF NOT EXISTS.
-- =============================================================================

alter table public.eisenhower_tasks
  add column if not exists description text,
  add column if not exists xp_awarded boolean not null default false,
  add column if not exists completed_at timestamptz,
  add column if not exists due_date date,
  add column if not exists position integer not null default 0;
