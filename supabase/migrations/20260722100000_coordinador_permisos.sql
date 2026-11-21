-- =====================================================================
-- INDARTE — Migración 6: Permisos de coordinador de eje
-- =====================================================================
-- El coordinador de eje necesita ver las inscripciones y los docentes
-- asignados a los cursos de su(s) eje(s), y el perfil de esos docentes.

create policy "inscripciones_coordinador_select"
on public.inscripciones for select
using (
  public.get_my_role() = 'coordinador_eje'
  and exists (
    select 1 from public.cursos c
    where c.id = inscripciones.curso_id
      and public.is_coordinador_de_eje(c.eje_id)
  )
);

create policy "curso_docentes_coordinador_select"
on public.curso_docentes for select
using (
  public.get_my_role() = 'coordinador_eje'
  and exists (
    select 1 from public.cursos c
    where c.id = curso_docentes.curso_id
      and public.is_coordinador_de_eje(c.eje_id)
  )
);

create policy "profiles_coordinador_view_docentes"
on public.profiles for select
using (
  public.get_my_role() = 'coordinador_eje'
  and exists (
    select 1 from public.curso_docentes cd
    join public.cursos c on c.id = cd.curso_id
    where cd.docente_id = profiles.id
      and public.is_coordinador_de_eje(c.eje_id)
  )
);
