-- Añadir campos de duración y fecha de inicio a la tabla de cursos
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS duration_weeks integer,
ADD COLUMN IF NOT EXISTS schedule_description text;
