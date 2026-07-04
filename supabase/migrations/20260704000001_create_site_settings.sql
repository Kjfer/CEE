-- Create site_settings table
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  about_title text not null default 'Centro de Especialización Ejecutiva',
  about_subtitle text not null default '"Impulsa tu carrera, lidera tu futuro"',
  about_description text not null default 'Formando líderes y profesionales a través de educación ejecutiva de primer nivel desde 1999, en alianza con la Universidad Nacional de Ingeniería (UNI) y la Facultad de Ingeniería Industrial y de Sistemas (FIIS)',
  mission text not null default 'Formar profesionales ejecutivos de excelencia a través de programas innovadores que integren teoría y práctica, fomentando el desarrollo integral del talento y su impacto en la transformación de organizaciones',
  vision text not null default 'Ser el referente de educación ejecutiva en América Latina, reconocido por la calidad de sus programas, la excelencia de sus docentes y el impacto de sus egresados en la comunidad empresarial global',
  history text not null default 'Desde 1999, el Centro de Especialización Ejecutiva ha sido pionero en la formación de profesionales de alto nivel. Nacido como una iniciativa de la Facultad de Ingeniería Industrial y de Sistemas de la Universidad Nacional de Ingeniería, el CEE ha evolucionado para convertirse en un ícono de educación ejecutiva en el país',
  about_image_url text not null default 'https://acreditacion.uni.edu.pe/wp-content/uploads/2025/10/250926-FIEE-2-720x340.jpg',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.site_settings enable row level security;

create policy "site_settings_select_public" on public.site_settings
  for select using (true);

create policy "site_settings_admin_update" on public.site_settings
  for update using (public.is_admin());

create policy "site_settings_admin_insert" on public.site_settings
  for insert with check (public.is_admin());

-- Insert default row
insert into public.site_settings (id) values (1) on conflict do nothing;

-- Create site-images bucket
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "Public Access site-images"
on storage.objects for select
using ( bucket_id = 'site-images' );

create policy "Admin insert site-images"
on storage.objects for insert
with check ( bucket_id = 'site-images' and public.is_admin() );

create policy "Admin update site-images"
on storage.objects for update
using ( bucket_id = 'site-images' and public.is_admin() );

create policy "Admin delete site-images"
on storage.objects for delete
using ( bucket_id = 'site-images' and public.is_admin() );
