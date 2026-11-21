-- =====================================================================
-- INDARTE — Migración 3: Triggers y funciones de mantenimiento
-- =====================================================================

-- ---------------------------------------------------------------------
-- Crear automáticamente un profile cuando alguien se registra en auth.users
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'visitante')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on function public.handle_new_user() is
  'El rol inicial se toma de raw_user_meta_data.role si el flujo de registro lo envía (ej. artesano, voluntario); por defecto queda como visitante y un admin lo eleva desde el panel.';

-- ---------------------------------------------------------------------
-- updated_at automático en las tablas que lo tienen
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.artesanos
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.donaciones
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.voluntarios
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.recursos_biblioteca
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.cursos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Impedir que un usuario se auto-asigne un rol distinto (solo admin puede)
-- ---------------------------------------------------------------------

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'No tienes permiso para cambiar el rol de usuario.';
  end if;
  return new;
end;
$$;

create trigger guard_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();
