-- Reconstruida a partir de supabase_migrations.schema_migrations (ya aplicada
-- en remoto el 2026-06-26 vía SQL Editor o CLI desde otro checkout; el
-- archivo nunca se había commiteado a este repo, por lo que `supabase db
-- push` la reportaba como "Remote migration versions not found in local
-- migrations directory" y bloqueaba cualquier push posterior, incluida la
-- migración 0008. Contenido verificado 1:1 contra el historial remoto.

ALTER TABLE public.contact_leads ADD COLUMN IF NOT EXISTS company text, ADD COLUMN IF NOT EXISTS position text, ADD COLUMN IF NOT EXISTS source text;
