-- ============================================================
-- 1. Crear la tabla events y event_registrations si no existen
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id uuid default gen_random_uuid() primary key,
  slug text,
  title text not null,
  description text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  capacity int not null,
  has_certificate boolean default false not null,
  certificate_price numeric(10,2),
  status text not null check (status in ('draft', 'published', 'cancelled')),
  flyer_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_idx ON public.events (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  first_name text not null,
  last_name_paterno text not null,
  last_name_materno text not null,
  email text not null,
  phone text not null,
  is_working boolean default false not null,
  wants_certificate boolean default false not null,
  certificate_paid boolean default false not null,
  source text not null check (source in ('web', 'whatsapp', 'manual')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Políticas para events
CREATE POLICY "events_select_public" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_admin_all" ON public.events FOR ALL USING (public.is_admin());

-- Políticas para event_registrations
CREATE POLICY "event_registrations_insert_public" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "event_registrations_admin_all" ON public.event_registrations FOR ALL USING (public.is_admin());


-- ============================================================
-- 2. Seed para EVENTOS
-- ============================================================

INSERT INTO public.events (
  id, slug, title, description, event_date, start_time, end_time, location, capacity, has_certificate, certificate_price, status, flyer_url
) VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'masterclass-ia-negocios', 'Masterclass: Inteligencia Artificial en los Negocios', 'Descubre cómo implementar soluciones de IA generativa para optimizar procesos y escalar tu empresa en un entorno competitivo.', '2026-08-15', '18:00:00', '20:00:00', 'Zoom (Online)', 150, true, 49.00, 'published', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'networking-ceefiis-2026', 'Networking CEE-FIIS 2026', 'Encuentro anual de ex-alumnos, profesores y líderes del sector industrial y tecnológico. Conecta con los mejores.', '2026-09-10', '19:00:00', '22:00:00', 'Auditorio FIIS-UNI (Presencial)', 200, false, null, 'published', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Seed para INSCRripciones A EVENTOS
-- ============================================================

INSERT INTO public.event_registrations (
  id, event_id, first_name, last_name_paterno, last_name_materno, email, phone, is_working, wants_certificate, certificate_paid, source
) VALUES 
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'María', 'López', 'Rojas', 'maria.lopez@email.com', '987654321', true, true, true, 'web'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Pedro', 'Salinas', 'Gómez', 'pedro.sg@email.com', '999888777', false, false, false, 'whatsapp'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff3', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'Luis', 'Sánchez', 'Pérez', 'luis.sanchez@email.com', '912345678', true, false, false, 'manual')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Seed para MULTIMEDIA (Videos)
-- ============================================================

INSERT INTO public.videos (
  id, title, description, thumbnail_url, video_url, duration, category
) VALUES 
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'Tour Campus UNI-FIIS', 'Conoce las instalaciones donde se dictan nuestros programas presenciales.', 'https://img.youtube.com/vi/Vz96eSYVzCc/maxresdefault.jpg', 'https://www.youtube.com/watch?v=Vz96eSYVzCc', 180, 'Institucional'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'Testimonio: Carlos Gómez', 'Carlos nos cuenta cómo el diploma de Gestión de Procesos ayudó a su empresa.', 'https://img.youtube.com/vi/1La4QzGeaaQ/maxresdefault.jpg', 'https://www.youtube.com/watch?v=1La4QzGeaaQ', 120, 'Testimonios'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'Seminario: Tendencias de Ingeniería 2026', 'Revive el seminario completo dictado por nuestros expertos el pasado mes de marzo.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3600, 'Webinars')
ON CONFLICT (id) DO NOTHING;
