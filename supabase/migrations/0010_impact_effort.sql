-- =============================================================================
-- Matriz Impacto × Esforço — Fase 3
-- =============================================================================
-- Quadrante derivado de (is_high_impact, is_high_effort):
--   IE1 (Ganhos rápidos):  impact + !effort   → faça primeiro
--   IE2 (Grandes apostas): impact + effort     → planeje
--   IE3 (Preenchimento):  !impact + !effort    → encaixe nas brechas
--   IE4 (Evitar):         !impact + effort     → evite
-- xp_awarded evita XP duplicado ao desmarcar/remarcar.
-- =============================================================================

create table if not exists public.impact_effort_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  is_high_impact boolean not null default false,
  is_high_effort boolean not null default false,
  is_completed boolean not null default false,
  xp_awarded boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists impact_effort_user_quadrant_idx
  on public.impact_effort_tasks (user_id, is_high_impact, is_high_effort, position);

create index if not exists impact_effort_user_completed_idx
  on public.impact_effort_tasks (user_id, is_completed);

-- updated_at automático (reusa set_updated_at do 0001)
drop trigger if exists impact_effort_set_updated_at on public.impact_effort_tasks;
create trigger impact_effort_set_updated_at
  before update on public.impact_effort_tasks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.impact_effort_tasks enable row level security;

drop policy if exists "impact_effort_select_own" on public.impact_effort_tasks;
create policy "impact_effort_select_own" on public.impact_effort_tasks
  for select using (auth.uid() = user_id);

drop policy if exists "impact_effort_insert_own" on public.impact_effort_tasks;
create policy "impact_effort_insert_own" on public.impact_effort_tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "impact_effort_update_own" on public.impact_effort_tasks;
create policy "impact_effort_update_own" on public.impact_effort_tasks
  for update using (auth.uid() = user_id);

drop policy if exists "impact_effort_delete_own" on public.impact_effort_tasks;
create policy "impact_effort_delete_own" on public.impact_effort_tasks
  for delete using (auth.uid() = user_id);
