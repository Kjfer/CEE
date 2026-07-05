-- ============================================================
-- Bucket para imágenes públicas (blog, multimedia, etc)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

create policy "public_assets_read_public" on storage.objects
  for select using (bucket_id = 'public-assets');
create policy "public_assets_admin_insert" on storage.objects
  for insert with check (bucket_id = 'public-assets' and public.is_admin());
create policy "public_assets_admin_update" on storage.objects
  for update using (bucket_id = 'public-assets' and public.is_admin());
create policy "public_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'public-assets' and public.is_admin());
