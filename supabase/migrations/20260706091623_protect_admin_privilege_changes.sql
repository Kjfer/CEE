-- Salvaguarda a nivel de base de datos para cambios de rol/estado en profiles.
--
-- Contexto: la policy "profiles_admin_all" (0001_init.sql) da acceso ALL a
-- cualquier fila de profiles a cualquier usuario donde is_admin() es true
-- (role='admin' AND is_active=true). Eso significa que, sin este trigger,
-- CUALQUIER admin (no solo un Super Admin) podría auto-promoverse llamando
-- directo a supabase.from('profiles').update({is_superadmin: true}) desde
-- el cliente, saltándose por completo la verificación que hoy solo vive en
-- el código de las Edge Functions (create-admin / toggle-admin-status).
--
-- Este trigger es la fuente de verdad real de la regla de negocio (no solo
-- las Edge Functions), y cubre dos cosas:
--   1. Solo un Super Admin activo (o una llamada con service_role, donde
--      auth.uid() es NULL) puede cambiar role / is_superadmin / is_active.
--   2. Nunca se puede dejar el sistema sin ningún Super Admin activo —
--      cubre tanto "otro admin degrada al último Super Admin" como
--      "el único Super Admin se auto-degrada o se auto-desactiva".

create or replace function public.enforce_admin_privilege_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_active_superadmins integer;
begin
  -- Paso 1: solo un Super Admin activo (o el backend vía service_role,
  -- donde auth.uid() es NULL) puede tocar estos campos sensibles.
  if (new.is_superadmin is distinct from old.is_superadmin)
     or (new.is_active is distinct from old.is_active)
     or (new.role is distinct from old.role) then

    if auth.uid() is not null then
      if not exists (
        select 1 from public.profiles
        where id = auth.uid() and is_superadmin = true and is_active = true
      ) then
        raise exception 'Solo un Super Administrador activo puede modificar rol, estado o privilegios de administrador.';
      end if;
    end if;
  end if;

  -- Paso 2: nunca dejar el sistema sin ningún Super Admin activo. Se evalúa
  -- si ESTA fila deja de contar como "super admin activo" con el cambio.
  if old.is_superadmin = true and old.is_active = true
     and (new.is_superadmin = false or new.is_active = false) then

    select count(*) into remaining_active_superadmins
    from public.profiles
    where is_superadmin = true and is_active = true and id <> old.id;

    if remaining_active_superadmins = 0 then
      raise exception 'No se puede completar: el sistema debe tener al menos un Super Administrador activo.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_admin_privilege_changes on public.profiles;
create trigger trg_enforce_admin_privilege_changes
  before update on public.profiles
  for each row execute function public.enforce_admin_privilege_changes();
