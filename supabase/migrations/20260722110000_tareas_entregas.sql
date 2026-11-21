-- =====================================================================
-- INDARTE — Migración 7: Tareas y Entregas
-- =====================================================================

create type public.estado_entrega as enum ('pendiente', 'entregada', 'calificada');

create table public.tareas (
  id             uuid primary key default gen_random_uuid(),
  curso_id       uuid not null references public.cursos(id) on delete cascade,
  titulo         text not null,
  descripcion    text,
  fecha_entrega  timestamptz,
  creado_por     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.entregas (
  id                 uuid primary key default gen_random_uuid(),
  tarea_id           uuid not null references public.tareas(id) on delete cascade,
  estudiante_id      uuid not null references public.profiles(id) on delete cascade,
  archivo_url        text,
  comentario         text,
  estado             public.estado_entrega not null default 'pendiente',
  nota               numeric(5,2),
  feedback_docente   text,
  fecha_entregada    timestamptz,
  fecha_calificada   timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (tarea_id, estudiante_id)
);

create index idx_tareas_curso on public.tareas(curso_id);
create index idx_entregas_tarea on public.entregas(tarea_id);
create index idx_entregas_estudiante on public.entregas(estudiante_id);

alter table public.tareas enable row level security;
alter table public.entregas enable row level security;

-- ---------------------------------------------------------------------
-- TAREAS
-- ---------------------------------------------------------------------

create policy "tareas_select"
on public.tareas for select
using (
  public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
  or public.is_docente_de_curso(curso_id)
  or exists (
    select 1 from public.cursos c
    where c.id = tareas.curso_id and public.is_coordinador_de_eje(c.eje_id)
  )
  or exists (
    select 1 from public.inscripciones i
    where i.curso_id = tareas.curso_id
      and i.estudiante_id = auth.uid()
      and i.estado = 'confirmada'
  )
);

create policy "tareas_docente_manage"
on public.tareas for all
using (public.is_admin() or public.is_docente_de_curso(curso_id))
with check (public.is_admin() or public.is_docente_de_curso(curso_id));

-- ---------------------------------------------------------------------
-- ENTREGAS
-- ---------------------------------------------------------------------

create policy "entregas_select"
on public.entregas for select
using (
  estudiante_id = auth.uid()
  or public.is_admin()
  or public.get_my_role() = 'supervisor_infotep'
  or exists (
    select 1 from public.tareas t
    where t.id = entregas.tarea_id and public.is_docente_de_curso(t.curso_id)
  )
  or exists (
    select 1 from public.tareas t
    join public.cursos c on c.id = t.curso_id
    where t.id = entregas.tarea_id and public.is_coordinador_de_eje(c.eje_id)
  )
);

create policy "entregas_estudiante_insert"
on public.entregas for insert
with check (estudiante_id = auth.uid());

create policy "entregas_estudiante_update"
on public.entregas for update
using (estudiante_id = auth.uid() and estado <> 'calificada');

create policy "entregas_docente_update"
on public.entregas for update
using (
  public.is_admin()
  or exists (
    select 1 from public.tareas t
    where t.id = entregas.tarea_id and public.is_docente_de_curso(t.curso_id)
  )
);

create trigger set_updated_at before update on public.tareas
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.entregas
  for each row execute function public.set_updated_at();
