-- Agregamos url de LinkedIn y especialidades a la tabla instructors
ALTER TABLE public.instructors
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}'::text[] NOT NULL;
