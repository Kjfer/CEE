-- Historial persistente del Asistente CEE (apps/admin, SecretariaChat.tsx).
-- El código de apps/admin/src/services/chatHistoryService.ts ya asume esta
-- tabla (getHistory/saveMessage/clearHistory).
--
-- Idempotente a propósito: en el proyecto real (yusaeqpjnnxrykunzopr) esta
-- tabla ya existía, creada fuera de las migraciones versionadas (no hay
-- ningún archivo previo que la genere). Ver 0010_reconcile_chat_history.sql
-- para el ajuste de esa tabla ya existente al esquema completo de abajo.
-- Este archivo solo crea desde cero en un entorno nuevo (o si faltara).

create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tool_calls jsonb,
  feedback text check (feedback in ('positive', 'negative')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists chat_history_user_created_idx on public.chat_history (user_id, created_at);

alter table public.chat_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_select_own'
  ) then
    create policy "chat_history_select_own" on public.chat_history
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_insert_own'
  ) then
    create policy "chat_history_insert_own" on public.chat_history
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_delete_own'
  ) then
    create policy "chat_history_delete_own" on public.chat_history
      for delete using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_update_own'
  ) then
    create policy "chat_history_update_own" on public.chat_history
      for update using (auth.uid() = user_id);
  end if;
end $$;
