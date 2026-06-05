-- =============================================================================
-- Time Boxing module — Fase 2
-- =============================================================================
-- Padrão idempotente: CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
-- =============================================================================

create table if not exists public.timeboxing_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  date date not null,
  start_time time not null,
  end_time time not null,
  color text not null default 'indigo'
    check (color in ('indigo','red','amber','emerald','sky','violet','pink','orange')),
  is_completed boolean not null default false,
  completed_at timestamptz,
  xp_awarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Defensive add columns
alter table public.timeboxing_blocks
  add column if not exists description text,
  add column if not exists completed_at timestamptz,
  add column if not exists xp_awarded boolean not null default false;

create index if not exists timeboxing_blocks_user_date_idx
  on public.timeboxing_blocks (user_id, date, start_time);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.timeboxing_blocks enable row level security;

drop policy if exists "timebox_select_own" on public.timeboxing_blocks;
create policy "timebox_select_own" on public.timeboxing_blocks
  for select using (auth.uid() = user_id);

drop policy if exists "timebox_insert_own" on public.timeboxing_blocks;
create policy "timebox_insert_own" on public.timeboxing_blocks
  for insert with check (auth.uid() = user_id);

drop policy if exists "timebox_update_own" on public.timeboxing_blocks;
create policy "timebox_update_own" on public.timeboxing_blocks
  for update using (auth.uid() = user_id);

drop policy if exists "timebox_delete_own" on public.timeboxing_blocks;
create policy "timebox_delete_own" on public.timeboxing_blocks
  for delete using (auth.uid() = user_id);
