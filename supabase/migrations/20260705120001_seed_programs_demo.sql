-- Seed idempotente: 1 programa demo con 3 módulos (cursos existentes por slug).
-- Re-ejecutable: ON CONFLICT DO NOTHING en program y program_courses.

insert into public.programs (
  slug,
  title,
  category,
  modality,
  level,
  short_description,
  description,
  price,
  original_price,
  image_url,
  academic_hours,
  certification,
  rating,
  enrolled_count,
  start_date,
  duration_weeks,
  schedule_description,
  status,
  graduate_profile,
  benefits,
  syllabus
) values (
  'diploma-liderazgo-gestion',
  'Diploma en Liderazgo y Gestión Ejecutiva',
  'Gestión',
  'Híbrido',
  'Avanzado',
  'Programa integral que combina liderazgo directivo, gestión ágil y finanzas corporativas para formar ejecutivos de alto impacto.',
  'Este diploma está diseñado para profesionales que buscan consolidar competencias de liderazgo, gestión de proyectos y toma de decisiones financieras. A lo largo de tres módulos secuenciales desarrollarás habilidades directivas, metodologías ágiles y criterio financiero aplicado al negocio.',
  549,
  699,
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=75',
  144,
  'Diploma CEE-FIIS',
  4.9,
  128,
  '2026-08-01',
  16,
  'Sesiones los sábados 9:00 - 13:00',
  'published',
  array[
    'Liderar equipos multidisciplinarios con enfoque estratégico y humano.',
    'Gestionar proyectos complejos con metodologías ágiles probadas.',
    'Tomar decisiones financieras informadas en contextos corporativos reales.'
  ],
  array[
    'Comprender los fundamentos del liderazgo transformacional.',
    'Aplicar Scrum y Kanban en proyectos reales de la organización.',
    'Interpretar estados financieros y evaluar inversiones estratégicas.'
  ],
  '[]'::jsonb
) on conflict (slug) do nothing;

insert into public.program_courses (program_id, course_id, sort_order)
select p.id, c.id, v.sort_order
from public.programs p
cross join (
  values
    ('liderazgo-habilidades', 1),
    ('gestion-proyectos-agiles', 2),
    ('finanzas-corporativas', 3)
) as v(course_slug, sort_order)
join public.courses c on c.slug = v.course_slug
where p.slug = 'diploma-liderazgo-gestion'
on conflict (course_id) do nothing;
