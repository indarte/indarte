-- =====================================================================
-- INDARTE — Migración 8: Storage — bucket de entregas
-- =====================================================================
-- Convención de ruta de archivo: {estudiante_id}/{tarea_id}/{nombre_archivo}
-- Bucket privado: cada estudiante solo accede a su propia carpeta;
-- el personal (docente/coordinador/supervisor/admin) puede leer todo.

insert into storage.buckets (id, name, public)
values ('entregas', 'entregas', false)
on conflict (id) do nothing;

create policy "entregas_storage_estudiante_insert"
on storage.objects for insert
with check (
  bucket_id = 'entregas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "entregas_storage_estudiante_select"
on storage.objects for select
using (
  bucket_id = 'entregas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "entregas_storage_estudiante_update"
on storage.objects for update
using (
  bucket_id = 'entregas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "entregas_storage_estudiante_delete"
on storage.objects for delete
using (
  bucket_id = 'entregas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "entregas_storage_staff_select"
on storage.objects for select
using (
  bucket_id = 'entregas'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('docente', 'coordinador_eje', 'supervisor_infotep', 'admin')
  )
);
