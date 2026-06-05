-- =============================================================================
-- Pomodoro module — Fase 2
-- =============================================================================
-- Sessões de foco/pausa. Settings ficam em localStorage no MVP
-- (não há tabela pomodoro_settings ainda).
--
-- Padrão idempotente: CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
-- (lição aprendida do 0002).
-- =============================================================================

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.eisenhower_tasks(id) on delete set null,
  type text not null check (type in ('focus', 'short_break', 'long_break')),
  planned_duration_seconds integer not null check (planned_duration_seconds > 0),
  actual_duration_seconds integer check (actual_duration_seconds >= 0),
  status text not null default 'running'
    check (status in ('running', 'completed', 'interrupted')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  xp_awarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Defensive: garantir cada coluna mesmo se tabela já existia parcial
alter table public.pomodoro_sessions
  add column if not exists task_id uuid references public.eisenhower_tasks(id) on delete set null,
  add column if not exists actual_duration_seconds integer,
  add column if not exists ended_at timestamptz,
  add column if not exists xp_awarded boolean not null default false;

create index if not exists pomodoro_sessions_user_started_idx
  on public.pomodoro_sessions (user_id, started_at desc);

create index if not exists pomodoro_sessions_user_status_idx
  on public.pomodoro_sessions (user_id, status);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.pomodoro_sessions enable row level security;

drop policy if exists "pomodoro_select_own" on public.pomodoro_sessions;
create policy "pomodoro_select_own" on public.pomodoro_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "pomodoro_insert_own" on public.pomodoro_sessions;
create policy "pomodoro_insert_own" on public.pomodoro_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "pomodoro_update_own" on public.pomodoro_sessions;
create policy "pomodoro_update_own" on public.pomodoro_sessions
  for update using (auth.uid() = user_id);

drop policy if exists "pomodoro_delete_own" on public.pomodoro_sessions;
create policy "pomodoro_delete_own" on public.pomodoro_sessions
  for delete using (auth.uid() = user_id);
