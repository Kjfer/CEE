-- Feedback (👍/👎) sobre respuestas del Asistente CEE.

alter table public.chat_history
  add column feedback text check (feedback in ('positive', 'negative'));

create policy "chat_history_update_own" on public.chat_history
  for update using (auth.uid() = user_id);
