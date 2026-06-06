-- =============================================================================
-- Calendar feed (.ics) — assinatura do Time Boxing
-- =============================================================================
-- O feed é buscado por servidores externos (Google/Apple/Outlook) SEM a
-- sessão do usuário. Para autorizar a leitura usamos um token secreto por
-- usuário na URL + uma função SECURITY DEFINER que resolve token -> blocos.
-- =============================================================================

alter table public.profiles
  add column if not exists calendar_token uuid not null default gen_random_uuid();

create unique index if not exists profiles_calendar_token_idx
  on public.profiles (calendar_token);

-- Retorna os blocos do dono do token (sem expor user_id).
create or replace function public.calendar_blocks_by_token(p_token uuid)
returns table (
  id uuid,
  title text,
  description text,
  block_date date,
  start_time time,
  end_time time,
  is_completed boolean
)
language sql
security definer
set search_path = public
as $$
  select b.id, b.title, b.description, b.date, b.start_time, b.end_time, b.is_completed
  from public.timeboxing_blocks b
  join public.profiles p on p.id = b.user_id
  where p.calendar_token = p_token
  order by b.date, b.start_time
$$;

-- Permite chamar sem sessão (o feed roda como anon).
revoke all on function public.calendar_blocks_by_token(uuid) from public;
grant execute on function public.calendar_blocks_by_token(uuid) to anon, authenticated;
