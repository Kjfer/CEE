-- Agregamos campos adicionales a la tabla instructors para el perfil completo
ALTER TABLE public.instructors
ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0.00 NOT NULL,
ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS publications jsonb DEFAULT '[]'::jsonb NOT NULL;
