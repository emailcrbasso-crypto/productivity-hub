-- =============================================================================
-- LGPD: exclusão de conta pelo próprio titular (direito de eliminação)
-- =============================================================================
-- Apaga o usuário em auth.users. Como profiles referencia auth.users com
-- ON DELETE CASCADE — e todas as tabelas do app referenciam profiles também
-- com CASCADE — remover o usuário apaga TODOS os dados dele.
--
-- SECURITY DEFINER roda como dono da função (admin), que pode deletar de
-- auth.users. Sem necessidade de service-role key na aplicação.
-- =============================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
