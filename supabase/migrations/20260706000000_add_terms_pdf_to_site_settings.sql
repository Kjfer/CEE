-- ============================================================
-- Bucket para el PDF de Términos y Condiciones
-- ============================================================
insert into storage.buckets (id, name, public)
values ('legal-documents', 'legal-documents', true)
on conflict (id) do nothing;

create policy "legal_documents_read_public" on storage.objects
  for select using (bucket_id = 'legal-documents');

create policy "legal_documents_admin_insert" on storage.objects
  for insert with check (bucket_id = 'legal-documents' and public.is_admin());

create policy "legal_documents_admin_update" on storage.objects
  for update using (bucket_id = 'legal-documents' and public.is_admin());

create policy "legal_documents_admin_delete" on storage.objects
  for delete using (bucket_id = 'legal-documents' and public.is_admin());

-- ============================================================
-- Columnas para el PDF de Términos y Condiciones en site_settings
-- ============================================================
alter table public.site_settings
  add column if not exists terms_pdf_url text,
  add column if not exists terms_pdf_path text,
  add column if not exists terms_pdf_name text,
  add column if not exists terms_pdf_updated_at timestamp with time zone;
