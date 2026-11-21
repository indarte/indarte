-- =====================================================================
-- INDARTE — Migración 2: Row Level Security (RLS) por rol
-- =====================================================================

-- ---------------------------------------------------------------------
-- FUNCIONES AUXILIARES (security definer para evitar recursión en RLS)
-- ---------------------------------------------------------------------

create or replace function public.get_my_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_my_role() = 'admin';
$$;

create or replace function public.is_coordinador_de_eje(target_eje_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.coordinadores_eje
    where profile_id = auth.uid() and eje_id = target_eje_id
  );
$$;

create or replace function public.is_docente_de_curso(target_curso_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.curso_docentes
    where docente_id = auth.uid() and curso_id = target_curso_id
  );
$$;

-- ---------------------------------------------------------------------
-- Activar RLS en todas las tablas
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.ejes enable row level security;
alter table public.coordinadores_eje enable row level security;
alter table public.artesanos enable row level security;
alter table public.artesano_galeria enable row level security;
alter table public.donaciones enable row level security;
alter table public.voluntarios enable row level security;
alter table public.recursos_biblioteca enable row level security;
alter table public.cursos enable row level security;
alter table public.curso_docentes enable row level security;
alter table public.inscripciones enable row level security;
alter table public.clases enable row level security;
alter table public.asistencia enable row level security;
alter table public.calificaciones enable row level security;
alter table public.certificados enable row level security;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());
-- Nota: esta policy permite al usuario editar su propio perfil.
-- El bloqueo para que NO pueda cambiarse su propio rol se hace con el
-- trigger guard_role_change (ver migración 20260721120002_triggers.sql).

create policy "profiles_admin_update_any"
on public.profiles for update
using (public.is_admin());

-- ---------------------------------------------------------------------
-- EJES (lectura pública, escritura solo admin)
-- ---------------------------------------------------------------------

create policy "ejes_public_read"
on public.ejes for select
using (true);

create policy "ejes_admin_write"
on public.ejes for all
using (public.is_admin())
with check (public.is_admin());

create policy "coordinadores_eje_admin_manage"
on public.coordinadores_eje for all
using (public.is_admin())
with check (public.is_admin());

create policy "coordinadores_eje_self_read"
on public.coordinadores_eje for select
using (profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- ARTESANOS (directorio público)
-- ---------------------------------------------------------------------

create policy "artesanos_public_read_activos"
on public.artesanos for select
using (activo = true or profile_id = auth.uid() or public.is_admin());

create policy "artesanos_self_insert"
on public.artesanos for insert
with check (profile_id = auth.uid() or public.is_admin());

create policy "artesanos_self_update"
on public.artesanos for update
using (profile_id = auth.uid() or public.is_admin());

create policy "artesanos_admin_delete"
on public.artesanos for delete
using (public.is_admin());

create policy "galeria_public_read"
on public.artesano_galeria for select
using (
  exists (select 1 from public.artesanos a where a.id = artesano_id and (a.activo = true or a.profile_id = auth.uid()))
  or public.is_admin()
);

create policy "galeria_owner_manage"
on public.artesano_galeria for all
using (
  exists (select 1 from public.artesanos a where a.id = artesano_id and a.profile_id = auth.uid())
  or public.is_admin()
)
with check (
  exists (select 1 from public.artesanos a where a.id = artesano_id and a.profile_id = auth.uid())
  or public.is_admin()
);

-- ---------------------------------------------------------------------
-- DONACIONES
-- ---------------------------------------------------------------------

-- Cualquiera (incluso anónimo) puede registrar una donación desde el formulario público
create policy "donaciones_public_insert"
on public.donaciones for insert
with check (true);

create policy "donaciones_select_own_or_admin"
on public.donaciones for select
using (donante_profile_id = auth.uid() or public.is_admin());

-- El estado de pago solo lo actualiza el backend (service_role), no hay policy de update
-- para usuarios normales: las actualizaciones desde el cliente quedan bloqueadas por defecto.

-- ---------------------------------------------------------------------
-- VOLUNTARIOS
-- ---------------------------------------------------------------------

create policy "voluntarios_public_insert"
on public.voluntarios for insert
with check (true);

create policy "voluntarios_select_own_or_admin"
on public.voluntarios for select
using (profile_id = auth.uid() or public.is_admin());

create policy "voluntarios_admin_update"
on public.voluntarios for update
using (public.is_admin());

-- ---------------------------------------------------------------------
-- BIBLIOTECA VIRTUAL
-- ---------------------------------------------------------------------

create policy "recursos_public_or_restringido"
on public.recursos_biblioteca for select
using (
  acceso = 'publico'
  or public.get_my_role() in ('estudiante','docente','coordinador_eje','admin','supervisor_infotep')
);

create policy "recursos_admin_coordinador_write"
on public.recursos_biblioteca for all
using (
  public.is_admin()
  or (public.get_my_role() = 'coordinador_eje' and public.is_coordinador_de_eje(eje_id))
  or (public.get_my_role() = 'docente' and creado_por = auth.uid())
)
with check (
  public.is_admin()
  or (public.get_my_role() = 'coordinador_eje' and public.is_coordinador_de_eje(eje_id))
  or (public.get_my_role() = 'docente' and creado_por = auth.uid())
);

-- ---------------------------------------------------------------------
-- CURSOS (catálogo público de lectura; escritura admin/coordinador)
-- ---------------------------------------------------------------------

create policy "cursos_public_read"
on public.cursos for select
using (true);

create policy "cursos_admin_coordinador_write"
on public.cursos for all
using (public.is_admin() or (public.get_my_role() = 'coordinador_eje' and public.is_coordinador_de_eje(eje_id)))
with check (public.is_admin() or (public.get_my_role() = 'coordinador_eje' and public.is_coordinador_de_eje(eje_id)));

create policy "curso_docentes_read"
on public.curso_docentes for select
using (
  docente_id = auth.uid()
  or public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
);

create policy "curso_docentes_admin_manage"
on public.curso_docentes for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------
-- INSCRIPCIONES
-- ---------------------------------------------------------------------

create policy "inscripciones_select"
on public.inscripciones for select
using (
  estudiante_id = auth.uid()
  or public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
  or public.is_docente_de_curso(curso_id)
);

create policy "inscripciones_self_insert"
on public.inscripciones for insert
with check (estudiante_id = auth.uid() or public.is_admin());

create policy "inscripciones_update"
on public.inscripciones for update
using (public.is_admin() or public.is_docente_de_curso(curso_id));

-- ---------------------------------------------------------------------
-- CLASES
-- ---------------------------------------------------------------------

create policy "clases_select"
on public.clases for select
using (
  public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
  or docente_id = auth.uid()
  or exists (
    select 1 from public.inscripciones i
    where i.curso_id = clases.curso_id and i.estudiante_id = auth.uid() and i.estado = 'confirmada'
  )
);

create policy "clases_docente_manage"
on public.clases for all
using (public.is_admin() or docente_id = auth.uid())
with check (public.is_admin() or docente_id = auth.uid());

-- ---------------------------------------------------------------------
-- ASISTENCIA
-- ---------------------------------------------------------------------

create policy "asistencia_select"
on public.asistencia for select
using (
  public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
  or estudiante_id = auth.uid()
  or exists (select 1 from public.clases c where c.id = clase_id and c.docente_id = auth.uid())
);

create policy "asistencia_docente_manage"
on public.asistencia for all
using (
  public.is_admin()
  or exists (select 1 from public.clases c where c.id = clase_id and c.docente_id = auth.uid())
)
with check (
  public.is_admin()
  or exists (select 1 from public.clases c where c.id = clase_id and c.docente_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- CALIFICACIONES
-- ---------------------------------------------------------------------

create policy "calificaciones_select"
on public.calificaciones for select
using (
  public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
  or estudiante_id = auth.uid()
  or public.is_docente_de_curso(curso_id)
);

create policy "calificaciones_docente_manage"
on public.calificaciones for all
using (public.is_admin() or public.is_docente_de_curso(curso_id))
with check (public.is_admin() or public.is_docente_de_curso(curso_id));

-- ---------------------------------------------------------------------
-- CERTIFICADOS
-- ---------------------------------------------------------------------

create policy "certificados_select"
on public.certificados for select
using (public.is_admin() or estudiante_id = auth.uid() or public.get_my_role() = 'supervisor_infotep');

create policy "certificados_admin_manage"
on public.certificados for all
using (public.is_admin())
with check (public.is_admin());

-- Nota: la verificación pública de un certificado por código (para terceros
-- sin cuenta) se debe exponer mediante una Edge Function con service_role,
-- nunca abriendo SELECT público sobre esta tabla.
