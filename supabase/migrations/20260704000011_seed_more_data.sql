-- ============================================================
-- 1. Insertar más Alumnos (Students)
-- ============================================================

-- Ahora insertamos en students (CRM administrativo)
INSERT INTO public.students (
  id, dni, first_name, last_name_paterno, last_name_materno, email, phone, city, profession, source
) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '71000001', 'Fernando', 'Ruiz', 'Díaz', 'fernando.ruiz@email.com', '987111222', 'Lima', 'Ingeniero Industrial', 'web'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '71000002', 'Patricia', 'Castro', 'Soto', 'patricia.castro@email.com', '987222333', 'Arequipa', 'Administradora', 'whatsapp'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '71000003', 'Roberto', 'Morales', 'Paz', 'roberto.morales@email.com', '987333444', 'Lima', 'Analista de Datos', 'referido'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '71000004', 'Camila', 'Ortiz', 'Vega', 'camila.ortiz@email.com', '987444555', 'Trujillo', 'Ingeniera de Sistemas', 'web'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '71000005', 'Hugo', 'Vargas', 'Ríos', 'hugo.vargas@email.com', '987555666', 'Lima', 'Contador', 'manual'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '71000006', 'Daniela', 'Mendoza', 'Gil', 'daniela.mendoza@email.com', '987666777', 'Piura', 'Marketing', 'web'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', '71000007', 'Andrés', 'Silva', 'Cueva', 'andres.silva@email.com', '987777888', 'Cusco', 'Economista', 'whatsapp'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', '71000008', 'Valeria', 'Rojas', 'Mora', 'valeria.rojas@email.com', '987888999', 'Lima', 'Psicóloga', 'referido'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9', '71000009', 'Martín', 'Peña', 'Lara', 'martin.pena@email.com', '987999000', 'Lima', 'Gerente de Proyectos', 'web'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10', '71000010', 'Sofía', 'Luna', 'Cruz', 'sofia.luna@email.com', '987000111', 'Arequipa', 'Diseñadora', 'manual')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Insertar Inscripciones a los Eventos (Event Registrations)
-- ============================================================

INSERT INTO public.event_registrations (
  id, event_id, first_name, last_name_paterno, last_name_materno, email, phone, is_working, wants_certificate, certificate_paid, source
) VALUES 
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Fernando', 'Ruiz', 'Díaz', 'fernando.ruiz@email.com', '987111222', true, true, true, 'web'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Patricia', 'Castro', 'Soto', 'patricia.castro@email.com', '987222333', true, false, false, 'whatsapp'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff3', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Roberto', 'Morales', 'Paz', 'roberto.morales@email.com', '987333444', false, true, false, 'manual'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff4', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Camila', 'Ortiz', 'Vega', 'camila.ortiz@email.com', '987444555', true, true, true, 'web'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'Hugo', 'Vargas', 'Ríos', 'hugo.vargas@email.com', '987555666', true, false, false, 'web'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff6', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'Daniela', 'Mendoza', 'Gil', 'daniela.mendoza@email.com', '987666777', false, false, false, 'whatsapp'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff7', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'Andrés', 'Silva', 'Cueva', 'andres.silva@email.com', '987777888', true, true, true, 'web'),
  ('ffffffff-aaaa-aaaa-aaaa-fffffffffff8', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'Valeria', 'Rojas', 'Mora', 'valeria.rojas@email.com', '987888999', true, true, false, 'manual')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Vincular Ventas (Sales) con la tabla Students en vez de Profiles
-- ============================================================
-- Esto soluciona de raíz el problema de autenticación para que puedas registrar 
-- alumnos en tus cursos directamente desde el CRM administrativo.

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
ALTER TABLE public.sales ADD CONSTRAINT sales_user_id_students_fkey FOREIGN KEY (user_id) REFERENCES public.students(id) ON DELETE RESTRICT;

-- ============================================================
-- 4. Seed de VENTAS (Sales) - Inscripciones a Cursos
-- ============================================================
-- Utilizamos un curso que ya existe en tu base de datos:
-- Liderazgo y Habilidades Directivas (ID: 93ed0fea-d8f3-4ad4-ba27-b50ef1b9c692)
INSERT INTO public.sales (
  id, course_id, course_name, user_id, amount, status
) VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '93ed0fea-d8f3-4ad4-ba27-b50ef1b9c692', 'Liderazgo y Habilidades Directivas', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 179.00, 'completed'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '93ed0fea-d8f3-4ad4-ba27-b50ef1b9c692', 'Liderazgo y Habilidades Directivas', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 100.00, 'pending'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '93ed0fea-d8f3-4ad4-ba27-b50ef1b9c692', 'Liderazgo y Habilidades Directivas', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 179.00, 'completed'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '93ed0fea-d8f3-4ad4-ba27-b50ef1b9c692', 'Liderazgo y Habilidades Directivas', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 179.00, 'completed'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', '93ed0fea-d8f3-4ad4-ba27-b50ef1b9c692', 'Liderazgo y Habilidades Directivas', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 0.00, 'refunded')
ON CONFLICT (id) DO NOTHING;
