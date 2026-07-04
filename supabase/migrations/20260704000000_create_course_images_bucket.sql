-- ------------------------------------------------------------
-- STORAGE — bucket de imágenes de cursos
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do nothing;

create policy "course_images_read_public" on storage.objects
  for select using (bucket_id = 'course-images');
create policy "course_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'course-images' and public.is_admin());
create policy "course_images_admin_update" on storage.objects
  for update using (bucket_id = 'course-images' and public.is_admin());
create policy "course_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'course-images' and public.is_admin());
