-- Feedback (👍/👎) sobre respuestas del Asistente CEE.
-- Idempotente: 0008 ya crea esta columna/policy en instalaciones nuevas;
-- este archivo solo aplica el ajuste en entornos donde chat_history ya
-- existía sin ellas (ver nota de idempotencia en 0008).

alter table public.chat_history
  add column if not exists feedback text check (feedback in ('positive', 'negative'));

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_update_own'
  ) then
    create policy "chat_history_update_own" on public.chat_history
      for update using (auth.uid() = user_id);
  end if;
end $$;
