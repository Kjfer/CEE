-- Historial persistente del Asistente CEE (apps/admin, SecretariaChat.tsx).
-- El código de apps/admin/src/services/chatHistoryService.ts ya asume esta
-- tabla (getHistory/saveMessage/clearHistory); esta migración la crea.

create table public.chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null default auth.uid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tool_calls jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index chat_history_user_created_idx on public.chat_history (user_id, created_at);

alter table public.chat_history enable row level security;

create policy "chat_history_select_own" on public.chat_history
  for select using (auth.uid() = user_id);
create policy "chat_history_insert_own" on public.chat_history
  for insert with check (auth.uid() = user_id);
create policy "chat_history_delete_own" on public.chat_history
  for delete using (auth.uid() = user_id);
