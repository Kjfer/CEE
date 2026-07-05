-- ============================================================
-- 1. Crear la tabla students (Alumnos) si no existe
-- ============================================================
CREATE TABLE IF NOT EXISTS public.students (
  id uuid default gen_random_uuid() primary key,
  dni text not null,
  first_name text not null,
  last_name_paterno text not null,
  last_name_materno text not null,
  email text,
  phone text,
  is_working boolean default false,
  company text,
  profession text,
  address text,
  district text,
  city text,
  birth_date date,
  gender text,
  source text,
  notes text,
  moodle_user_id int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_admin_all" ON public.students
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 2. Seed para Inyectar Usuarios de Prueba en students
-- ============================================================

INSERT INTO public.students (
  id,
  dni,
  first_name,
  last_name_paterno,
  last_name_materno,
  email,
  phone,
  city,
  source
) VALUES
  ('11111111-1111-1111-1111-111111111111', '70000001', 'Carlos', 'Gómez', 'Pérez', 'carlos.prueba@universidad.edu.pe', '987654321', 'Lima', 'web'),
  ('22222222-2222-2222-2222-222222222222', '70000002', 'Lucía', 'Méndez', 'Ríos', 'lucia.mendez@universidad.edu.pe', '912345678', 'Lima', 'whatsapp'),
  ('33333333-3333-3333-3333-333333333333', '70000003', 'Miguel', 'Torres', 'López', 'miguel.torres@universidad.edu.pe', '998877665', 'Lima', 'web'),
  ('44444444-4444-4444-4444-444444444444', '70000004', 'Ana', 'Quispe', 'Flores', 'ana.quispe@universidad.edu.pe', '999888777', 'Lima', 'referido'),
  ('55555555-5555-5555-5555-555555555555', '70000005', 'Jorge', 'Salinas', 'Vargas', 'jorge.salinas@universidad.edu.pe', '965432187', 'Lima', 'manual')
ON CONFLICT (id) DO NOTHING;

-- También los insertamos en perfiles (profiles) para vincularlos con compras
INSERT INTO public.profiles (
  id,
  name,
  email,
  role
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Carlos Gómez Pérez', 'carlos.prueba@universidad.edu.pe', 'student'),
  ('22222222-2222-2222-2222-222222222222', 'Lucía Méndez Ríos', 'lucia.mendez@universidad.edu.pe', 'student'),
  ('33333333-3333-3333-3333-333333333333', 'Miguel Torres López', 'miguel.torres@universidad.edu.pe', 'student'),
  ('44444444-4444-4444-4444-444444444444', 'Ana Quispe Flores', 'ana.quispe@universidad.edu.pe', 'student'),
  ('55555555-5555-5555-5555-555555555555', 'Jorge Salinas Vargas', 'jorge.salinas@universidad.edu.pe', 'student')
ON CONFLICT (id) DO NOTHING;
