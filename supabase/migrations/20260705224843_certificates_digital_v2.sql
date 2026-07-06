-- Reconstruida a partir de supabase_migrations.schema_migrations (ya aplicada
-- en remoto el 2026-07-05 desde otra sesión/checkout; el archivo nunca se
-- había commiteado a este repo). Contenido verificado 1:1 contra el historial
-- remoto antes de reconstruir.

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS students_profile_id_idx ON public.students (profile_id);

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  grade numeric(4, 2),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'approved', 'failed')),
  completed_at date,
  approved_at date,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS student_enrollments_student_id_idx ON public.student_enrollments (student_id);
CREATE INDEX IF NOT EXISTS student_enrollments_course_id_idx ON public.student_enrollments (course_id);
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_enrollments_admin_all" ON public.student_enrollments;
CREATE POLICY "student_enrollments_admin_all" ON public.student_enrollments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "student_enrollments_select_own" ON public.student_enrollments;
CREATE POLICY "student_enrollments_select_own" ON public.student_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_enrollments.student_id AND s.profile_id = auth.uid())
);

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS course_name text,
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS certificate_type text NOT NULL DEFAULT 'course' CHECK (certificate_type IN ('course', 'program')),
  ADD COLUMN IF NOT EXISTS grade numeric(4, 2),
  ADD COLUMN IF NOT EXISTS academic_hours int,
  ADD COLUMN IF NOT EXISTS verification_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS preview_image_url text,
  ADD COLUMN IF NOT EXISTS completed_at date,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

UPDATE public.certificates c SET course_name = co.title FROM public.courses co WHERE c.course_id = co.id AND c.course_name IS NULL;

ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_status_check;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_status_check CHECK (status IN ('draft', 'pending_signature', 'issued', 'signed', 'revoked'));

CREATE INDEX IF NOT EXISTS certificates_profile_id_idx ON public.certificates (profile_id);
CREATE INDEX IF NOT EXISTS certificates_verification_code_idx ON public.certificates (verification_code);

CREATE UNIQUE INDEX IF NOT EXISTS certificates_unique_active_course ON public.certificates (student_id, course_id) WHERE status IN ('issued', 'signed', 'pending_signature') AND course_id IS NOT NULL AND student_id IS NOT NULL;

DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT USING (profile_id = auth.uid() AND status IN ('issued', 'signed'));

INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "certificates_storage_read_public" ON storage.objects;
CREATE POLICY "certificates_storage_read_public" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
DROP POLICY IF EXISTS "certificates_storage_admin_insert" ON storage.objects;
CREATE POLICY "certificates_storage_admin_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND public.is_admin());
DROP POLICY IF EXISTS "certificates_storage_admin_update" ON storage.objects;
CREATE POLICY "certificates_storage_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'certificates' AND public.is_admin());
DROP POLICY IF EXISTS "certificates_storage_admin_delete" ON storage.objects;
CREATE POLICY "certificates_storage_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'certificates' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.get_public_certificate(p_code text) RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'certificateNumber', cert.certificate_number,
    'studentName', cert.student_name,
    'courseName', coalesce(cert.course_name, co.title, 'Curso CEE'),
    'programId', cert.program_id,
    'grade', cert.grade,
    'academicHours', cert.academic_hours,
    'issuedAt', cert.issued_at,
    'status', cert.status,
    'verificationCode', cert.verification_code,
    'previewImageUrl', cert.preview_image_url,
    'pdfUrl', coalesce(cert.pdf_url, cert.signed_document_url)
  )
  FROM public.certificates cert
  LEFT JOIN public.courses co ON co.id = cert.course_id
  WHERE cert.verification_code = p_code AND cert.status IN ('issued', 'signed')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_certificate(text) TO anon, authenticated;
