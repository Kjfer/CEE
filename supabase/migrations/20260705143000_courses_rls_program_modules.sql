-- Permite leer cursos que son módulos de un programa publicado (landing, redirect, acordeón).
-- Sin esto, cursos en status draft/review no son visibles vía RLS aunque el programa esté publicado.

drop policy if exists "courses_select_published_or_admin" on public.courses;

create policy "courses_select_published_or_admin" on public.courses
  for select using (
    status = 'published'
    or public.is_admin()
    or exists (
      select 1
      from public.program_courses pc
      inner join public.programs p on p.id = pc.program_id
      where pc.course_id = courses.id
        and p.status = 'published'
    )
  );
