-- =====================================================================
-- INDARTE — Migración 5: Visibilidad de perfiles de estudiantes para staff
-- =====================================================================
-- Sin esto, un docente/coordinador/supervisor puede ver la fila de
-- inscripciones pero no el nombre del estudiante (bloqueado por RLS en
-- profiles), porque las políticas actuales solo permiten ver el propio
-- perfil o ser admin.

create policy "profiles_staff_view_related_students"
on public.profiles for select
using (
  public.get_my_role() = 'supervisor_infotep'
  or (
    public.get_my_role() = 'docente'
    and exists (
      select 1 from public.inscripciones i
      where i.estudiante_id = profiles.id
        and public.is_docente_de_curso(i.curso_id)
    )
  )
  or (
    public.get_my_role() = 'coordinador_eje'
    and exists (
      select 1 from public.inscripciones i
      join public.cursos c on c.id = i.curso_id
      where i.estudiante_id = profiles.id
        and public.is_coordinador_de_eje(c.eje_id)
    )
  )
);
