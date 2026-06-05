-- =============================================================================
-- Eisenhower module — Fase 2
-- =============================================================================
-- Quadrante é derivado: (is_urgent, is_important) → Q1/Q2/Q3/Q4
--   Q1 (Fazer agora):  urgent + important
--   Q2 (Agendar):      !urgent + important
--   Q3 (Delegar):      urgent + !important
--   Q4 (Eliminar):     !urgent + !important
-- xp_awarded evita XP duplicado ao desmarcar/remarcar.
-- =============================================================================

create table if not exists public.eisenhower_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  is_urgent boolean not null default false,
  is_important boolean not null default false,
  is_completed boolean not null default false,
  xp_awarded boolean not null default false,
  completed_at timestamptz,
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eisenhower_tasks_user_quadrant_idx
  on public.eisenhower_tasks (user_id, is_urgent, is_important, position);

create index if not exists eisenhower_tasks_user_completed_idx
  on public.eisenhower_tasks (user_id, is_completed);

-- updated_at automático (reusa set_updated_at do 0001)
drop trigger if exists eisenhower_tasks_set_updated_at on public.eisenhower_tasks;
create trigger eisenhower_tasks_set_updated_at
  before update on public.eisenhower_tasks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.eisenhower_tasks enable row level security;

drop policy if exists "eisenhower_select_own" on public.eisenhower_tasks;
create policy "eisenhower_select_own" on public.eisenhower_tasks
  for select using (auth.uid() = user_id);

drop policy if exists "eisenhower_insert_own" on public.eisenhower_tasks;
create policy "eisenhower_insert_own" on public.eisenhower_tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "eisenhower_update_own" on public.eisenhower_tasks;
create policy "eisenhower_update_own" on public.eisenhower_tasks
  for update using (auth.uid() = user_id);

drop policy if exists "eisenhower_delete_own" on public.eisenhower_tasks;
create policy "eisenhower_delete_own" on public.eisenhower_tasks
  for delete using (auth.uid() = user_id);
