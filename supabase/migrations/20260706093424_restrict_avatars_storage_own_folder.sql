-- Las policies avatars_upload / avatars_update permitían a CUALQUIER usuario
-- autenticado subir o sobrescribir el avatar de CUALQUIER otro usuario (el
-- check solo validaba bucket_id = 'avatars', sin restringir la carpeta).
-- profileService.updateAvatar() sube a `${user.id}/avatar.<ext>`, así que se
-- restringe a que el primer segmento de la ruta coincida con auth.uid().

drop policy if exists "avatars_upload" on storage.objects;
create policy "avatars_upload" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update" on storage.objects;
create policy "avatars_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
