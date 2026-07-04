-- Reconciliación de la tabla chat_history ya existente en producción
-- (yusaeqpjnnxrykunzopr), creada fuera de las migraciones versionadas con un
-- esquema incompleto respecto a lo que 0008/0009 y chatHistoryService.ts
-- necesitan. Verificado por introspección directa antes de escribir esto:
--
--   - Faltaba la columna tool_calls (chatHistoryService.saveMessage() la
--     inserta siempre) -> todo insert real fallaba con
--     "column tool_calls does not exist".
--   - user_id era NULLABLE y SIN default de auth.uid() -> incluso agregando
--     tool_calls, el insert seguía fallando: la policy de insert exige
--     auth.uid() = user_id, y sin default, user_id llegaba NULL.
--   - No existía policy de DELETE -> el botón "Limpiar historial" no borraba
--     nada contra Supabase real (silenciosamente, RLS deniega por defecto).
--   - Faltaba el índice (user_id, created_at) que usa getHistory().
--
-- Con estos cuatro puntos corregidos, chatHistoryService.ts (getHistory,
-- saveMessage, clearHistory, setFeedback) queda funcional end-to-end.
-- Todo idempotente: seguro de re-ejecutar y no-op en un entorno que ya haya
-- corrido 0008 desde cero con el esquema completo.

alter table public.chat_history
  add column if not exists tool_calls jsonb;

alter table public.chat_history
  alter column user_id set default auth.uid();

-- Seguro: no hay filas con user_id NULL a la fecha de esta migración
-- (tabla vacía por el bug de arriba); si en el futuro llegara a haber
-- filas NULL por cualquier motivo, este paso fallaría de forma visible
-- en vez de dejar el esquema en un estado inconsistente sin avisar.
alter table public.chat_history
  alter column user_id set not null;

create index if not exists chat_history_user_created_idx on public.chat_history (user_id, created_at);

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_delete_own'
  ) then
    create policy "chat_history_delete_own" on public.chat_history
      for delete using (auth.uid() = user_id);
  end if;
end $$;
