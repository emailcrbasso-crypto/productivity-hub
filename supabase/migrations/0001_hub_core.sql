-- =============================================================================
-- Productivity Hub — Hub-level schema (Etapa 3 / Fase 1)
-- =============================================================================
-- Tabelas: profiles, xp_events, achievements, user_achievements
-- Trigger: on_auth_user_created (cria profile automaticamente)
-- Helpers: calculate_level(xp), seed inicial de achievements
-- RLS: cada usuário lê/escreve seus próprios dados; achievements é público read
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enum: fontes de XP (cada módulo + hub)
-- -----------------------------------------------------------------------------
do $$ begin
  create type xp_source as enum (
    'hub',
    'eisenhower',
    'pomodoro',
    'timeboxing',
    'weekly_plan'
  );
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Helper: calcula nível a partir do XP total
-- Fórmula: level = floor(sqrt(total_xp / 100)) + 1
--   100 XP  -> level 2
--   400 XP  -> level 3
--   900 XP  -> level 4
--   1600 XP -> level 5
-- -----------------------------------------------------------------------------
create or replace function public.calculate_level(total_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(sqrt(greatest(total_xp, 0) / 100.0))::int + 1);
$$;

-- -----------------------------------------------------------------------------
-- Table: profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  total_xp integer not null default 0,
  current_level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: xp_events (log imutável de cada ganho de XP)
-- -----------------------------------------------------------------------------
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source xp_source not null,
  action text not null,
  xp_amount integer not null check (xp_amount > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_user_created_idx
  on public.xp_events (user_id, created_at desc);
create index if not exists xp_events_user_source_idx
  on public.xp_events (user_id, source);

-- -----------------------------------------------------------------------------
-- Table: achievements (catálogo público)
-- -----------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  category text not null,
  xp_reward integer not null default 0,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Table: user_achievements (junction)
-- -----------------------------------------------------------------------------
create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists user_achievements_user_idx
  on public.user_achievements (user_id);

-- -----------------------------------------------------------------------------
-- Trigger: on_auth_user_created
-- Cria profile automaticamente quando um auth.users é inserido.
-- Puxa full_name e avatar_url do raw_user_meta_data (Google OAuth).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- profiles: cada usuário lê/atualiza apenas o próprio
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- xp_events: insert/select próprios apenas (sem update/delete — log imutável)
alter table public.xp_events enable row level security;

drop policy if exists "xp_events_select_own" on public.xp_events;
create policy "xp_events_select_own" on public.xp_events
  for select using (auth.uid() = user_id);

drop policy if exists "xp_events_insert_own" on public.xp_events;
create policy "xp_events_insert_own" on public.xp_events
  for insert with check (auth.uid() = user_id);

-- achievements: catálogo público (read-only para usuários)
alter table public.achievements enable row level security;

drop policy if exists "achievements_select_all" on public.achievements;
create policy "achievements_select_all" on public.achievements
  for select using (true);

-- user_achievements: cada usuário vê/insere os próprios
alter table public.user_achievements enable row level security;

drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own" on public.user_achievements
  for select using (auth.uid() = user_id);

drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own" on public.user_achievements
  for insert with check (auth.uid() = user_id);

-- =============================================================================
-- Seed: achievements universais (hub-level)
-- =============================================================================
insert into public.achievements (slug, title, description, icon, category, xp_reward, criteria) values
  ('first_steps',        'Primeiros Passos',     'Ganhou seu primeiro XP em qualquer ferramenta.', 'sparkles',   'milestone', 50,  '{"type":"total_xp","value":1}'),
  ('xp_100',             'Centena',              'Acumulou 100 XP no total.',                       'star',       'milestone', 25,  '{"type":"total_xp","value":100}'),
  ('xp_1000',            'Milésimo',             'Acumulou 1.000 XP no total.',                     'star',       'milestone', 100, '{"type":"total_xp","value":1000}'),
  ('xp_10000',           'Lendário',             'Acumulou 10.000 XP no total.',                    'crown',      'milestone', 500, '{"type":"total_xp","value":10000}'),
  ('level_5',            'Nível 5',              'Alcançou o nível 5.',                             'shield',     'level',     50,  '{"type":"level","value":5}'),
  ('level_10',           'Nível 10',             'Alcançou o nível 10.',                            'shield',     'level',     150, '{"type":"level","value":10}'),
  ('streak_3',           'Consistente',          'Manteve uma sequência de 3 dias.',                'flame',      'streak',    30,  '{"type":"streak","value":3}'),
  ('streak_7',           'Semana Perfeita',      'Manteve uma sequência de 7 dias.',                'flame',      'streak',    100, '{"type":"streak","value":7}'),
  ('streak_30',          'Mês de Foco',          'Manteve uma sequência de 30 dias.',               'flame',      'streak',    500, '{"type":"streak","value":30}'),
  ('all_tools',          'Polivalente',          'Ganhou XP em todas as 4 ferramentas.',            'layers',     'breadth',   100, '{"type":"all_sources","value":4}')
on conflict (slug) do nothing;
