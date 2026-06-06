-- =============================================================================
-- Pomodoro: permitir vincular tarefas de qualquer módulo
-- =============================================================================
-- Antes task_id tinha FK fixa para eisenhower_tasks, impedindo vincular
-- tarefas da matriz Impacto × Esforço (ou futuras). O vínculo é informacional
-- (mostra o título no timer), então removemos a FK e mantemos task_id como
-- uuid livre. task_source identifica o módulo de origem.
-- =============================================================================

alter table public.pomodoro_sessions
  drop constraint if exists pomodoro_sessions_task_id_fkey;

alter table public.pomodoro_sessions
  add column if not exists task_source text;
