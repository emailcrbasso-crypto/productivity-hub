-- =============================================================================
-- Matriz 5W2H — 7ª ferramenta do Hub
-- =============================================================================
-- Cada plano responde as 7 perguntas: O quê, Por quê, Onde, Quando, Quem,
-- Como e Quanto custa (opcional). O campo how_much pode ser deixado em branco.
-- xp_awarded evita XP duplicado ao desmarcar/remarcar conclusão.
-- =============================================================================

create table if not exists public.five_w2h_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  what text not null,
  why text not null,
  where_field text not null,
  when_field text not null,
  who text not null,
  how text not null,
  how_much text,
  is_completed boolean not null default false,
  xp_awarded boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists five_w2h_user_idx
  on public.five_w2h_plans (user_id, position);

create index if not exists five_w2h_user_completed_idx
  on public.five_w2h_plans (user_id, is_completed);

-- updated_at automático (reusa set_updated_at do 0001)
drop trigger if exists five_w2h_set_updated_at on public.five_w2h_plans;
create trigger five_w2h_set_updated_at
  before update on public.five_w2h_plans
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.five_w2h_plans enable row level security;

drop policy if exists "five_w2h_select_own" on public.five_w2h_plans;
create policy "five_w2h_select_own" on public.five_w2h_plans
  for select using (auth.uid() = user_id);

drop policy if exists "five_w2h_insert_own" on public.five_w2h_plans;
create policy "five_w2h_insert_own" on public.five_w2h_plans
  for insert with check (auth.uid() = user_id);

drop policy if exists "five_w2h_update_own" on public.five_w2h_plans;
create policy "five_w2h_update_own" on public.five_w2h_plans
  for update using (auth.uid() = user_id);

drop policy if exists "five_w2h_delete_own" on public.five_w2h_plans;
create policy "five_w2h_delete_own" on public.five_w2h_plans
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- XP: adiciona 'five_w2h' ao enum xp_source
-- -----------------------------------------------------------------------------
alter type public.xp_source add value if not exists 'five_w2h';
