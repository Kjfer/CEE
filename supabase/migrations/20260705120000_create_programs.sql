-- Programas: contenedor de N cursos (módulos) vía tabla puente program_courses.
-- ADITIVO: no modifica public.courses.

create table public.programs (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  category text not null check (category in ('Ingeniería', 'Gestión', 'Tecnología', 'Habilidades Blandas', 'Finanzas')),
  modality text not null check (modality in ('Virtual', 'Presencial', 'Híbrido')),
  level text not null check (level in ('Básico', 'Intermedio', 'Avanzado')),
  short_description text not null,
  description text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  image_url text not null,
  academic_hours int not null,
  certification text not null,
  rating numeric(3,2) default 5.0 not null,
  enrolled_count int default 0 not null,
  start_date date,
  duration_weeks integer,
  schedule_description text,
  syllabus_pdf_url text,
  status text not null default 'draft' check (status in ('published', 'draft', 'review')),
  graduate_profile text[] default '{}'::text[] not null,
  benefits text[] default '{}'::text[] not null,
  syllabus jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.program_courses (
  id uuid default gen_random_uuid() primary key,
  program_id uuid not null references public.programs(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  sort_order int not null check (sort_order > 0),
  unique (program_id, course_id),
  unique (program_id, sort_order),
  unique (course_id)
);

create index program_courses_program_id_idx on public.program_courses (program_id);
create index program_courses_course_id_idx on public.program_courses (course_id);

alter table public.programs enable row level security;
alter table public.program_courses enable row level security;

create policy "programs_select_published_or_admin" on public.programs
  for select using (status = 'published' or public.is_admin());

create policy "programs_admin_insert" on public.programs
  for insert with check (public.is_admin());

create policy "programs_admin_update" on public.programs
  for update using (public.is_admin());

create policy "programs_admin_delete" on public.programs
  for delete using (public.is_admin());

create policy "program_courses_select_published_or_admin" on public.program_courses
  for select using (
    exists (
      select 1 from public.programs p
      where p.id = program_courses.program_id
        and (p.status = 'published' or public.is_admin())
    )
  );

create policy "program_courses_admin_insert" on public.program_courses
  for insert with check (public.is_admin());

create policy "program_courses_admin_update" on public.program_courses
  for update using (public.is_admin());

create policy "program_courses_admin_delete" on public.program_courses
  for delete using (public.is_admin());
