-- ============================================================
-- Migración para la tabla de Blog
-- ============================================================

create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  summary text not null,
  content text not null,
  image_url text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blog_posts enable row level security;

-- Mantiene updated_at automáticamente
create or replace function public.handle_blog_posts_updated_at()
returns trigger as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.handle_blog_posts_updated_at();

-- Políticas
create policy "blog_posts_select_public" on public.blog_posts
  for select using (true);
create policy "blog_posts_admin_insert" on public.blog_posts
  for insert with check (public.is_admin());
create policy "blog_posts_admin_update" on public.blog_posts
  for update using (public.is_admin());
create policy "blog_posts_admin_delete" on public.blog_posts
  for delete using (public.is_admin());

-- ============================================================
-- Seed para Inyectar Blogs de Prueba
-- ============================================================

INSERT INTO public.blog_posts (slug, title, summary, content, image_url, date) VALUES
('5-consejos-mejorar-gestion-proyectos', '5 Consejos para mejorar tu Gestión de Proyectos', 'Aprende las claves fundamentales para liderar equipos y entregar resultados a tiempo.', '<p>La gestión de proyectos es fundamental para el éxito de cualquier iniciativa...</p>', 'https://picsum.photos/seed/post1/800/400', timezone('utc'::text, now())),
('futuro-inteligencia-artificial-2027', 'El Futuro de la Inteligencia Artificial en 2027', 'Descubre cómo la IA transformará los modelos de negocio tradicionales.', '<p>La inteligencia artificial avanza a pasos agigantados. Se espera que para 2027...</p>', 'https://picsum.photos/seed/post2/800/400', timezone('utc'::text, now() - interval '2 days')),
('transformacion-digital-empresas', 'Transformación Digital: Guía para Empresas', '¿Por dónde empezar si quieres digitalizar tu empresa hoy mismo?', '<p>El primer paso para la digitalización es entender los procesos actuales...</p>', 'https://picsum.photos/seed/post3/800/400', timezone('utc'::text, now() - interval '5 days'))
ON CONFLICT (slug) DO NOTHING;

