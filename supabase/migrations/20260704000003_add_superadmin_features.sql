alter table public.profiles
add column is_superadmin boolean not null default false,
add column is_active boolean not null default true;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() 
      and role = 'admin' 
      and is_active = true
  );
$$ language sql security definer stable set search_path = public;

update public.profiles 
set is_superadmin = true 
where id = (
  select id from public.profiles 
  order by created_at asc 
  limit 1
);
