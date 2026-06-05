-- =============================================================================
-- Plano Semanal — Fase 2
-- =============================================================================
-- Padrão idempotente: CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
-- week_start é sempre a segunda-feira da semana
-- =============================================================================

create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  week_start date not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  xp_awarded boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.weekly_goals
  add column if not exists description text,
  add column if not exists completed_at timestamptz,
  add column if not exists xp_awarded boolean not null default false,
  add column if not exists position integer not null default 0;

create index if not exists weekly_goals_user_week_idx
  on public.weekly_goals (user_id, week_start, position);

-- -----------------------------------------------------------------------------

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  what_went_well text,
  what_to_improve text,
  next_week_focus text,
  xp_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_reviews
  add column if not exists xp_awarded boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists weekly_reviews_user_week_idx
  on public.weekly_reviews (user_id, week_start);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.weekly_goals enable row level security;
alter table public.weekly_reviews enable row level security;

drop policy if exists "goals_select_own"  on public.weekly_goals;
drop policy if exists "goals_insert_own"  on public.weekly_goals;
drop policy if exists "goals_update_own"  on public.weekly_goals;
drop policy if exists "goals_delete_own"  on public.weekly_goals;

create policy "goals_select_own" on public.weekly_goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.weekly_goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.weekly_goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.weekly_goals for delete using (auth.uid() = user_id);

drop policy if exists "reviews_select_own" on public.weekly_reviews;
drop policy if exists "reviews_insert_own" on public.weekly_reviews;
drop policy if exists "reviews_update_own" on public.weekly_reviews;

create policy "reviews_select_own" on public.weekly_reviews for select using (auth.uid() = user_id);
create policy "reviews_insert_own" on public.weekly_reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.weekly_reviews for update using (auth.uid() = user_id);
