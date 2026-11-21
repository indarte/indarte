-- =====================================================================
-- INDARTE — Migración 9: Noticias/Eventos y Transparencia
-- =====================================================================

create type public.tipo_noticia as enum ('noticia', 'evento');
create type public.categoria_transparencia as enum ('memoria_anual', 'estado_financiero', 'aliados', 'otro');

-- ---------------------------------------------------------------------
-- NOTICIAS Y EVENTOS
-- ---------------------------------------------------------------------

create table public.noticias_eventos (
  id            uuid primary key default gen_random_uuid(),
  tipo          public.tipo_noticia not null default 'noticia',
  titulo        text not null,
  contenido     text,
  eje_id        uuid references public.ejes(id),
  fecha_evento  timestamptz,
  imagen_url    text,
  publicado     boolean not null default true,
  creado_por    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.noticias_eventos enable row level security;

create policy "noticias_public_read"
on public.noticias_eventos for select
using (publicado = true or public.is_admin());

create policy "noticias_admin_write"
on public.noticias_eventos for all
using (public.is_admin())
with check (public.is_admin());

create policy "noticias_coordinador_write"
on public.noticias_eventos for all
using (
  eje_id is not null
  and public.get_my_role() = 'coordinador_eje'
  and public.is_coordinador_de_eje(eje_id)
)
with check (
  eje_id is not null
  and public.get_my_role() = 'coordinador_eje'
  and public.is_coordinador_de_eje(eje_id)
);

create trigger set_updated_at before update on public.noticias_eventos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- TRANSPARENCIA
-- ---------------------------------------------------------------------

create table public.documentos_transparencia (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  descripcion   text,
  categoria     public.categoria_transparencia not null default 'otro',
  anio          int,
  archivo_url   text,
  publicado     boolean not null default true,
  creado_por    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.documentos_transparencia enable row level security;

-- Solo admin gestiona transparencia (información institucional/financiera sensible)
create policy "transparencia_public_read"
on public.documentos_transparencia for select
using (publicado = true or public.is_admin());

create policy "transparencia_admin_write"
on public.documentos_transparencia for all
using (public.is_admin())
with check (public.is_admin());

create trigger set_updated_at before update on public.documentos_transparencia
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Datos de ejemplo para probar de inmediato
-- ---------------------------------------------------------------------

insert into public.noticias_eventos (tipo, titulo, contenido, publicado) values
  ('noticia', 'INDARTE inicia nueva convocatoria de capacitación técnica', 'Abrimos inscripciones para el nuevo ciclo de cursos técnico-profesionales certificados por INFOTEP.', true),
  ('evento', 'Graduación de artesanos 2026', 'Celebramos la graduación de la promoción 2026 del programa de Fomento y Desarrollo Artesanal.', true);

insert into public.documentos_transparencia (titulo, descripcion, categoria, anio, publicado) values
  ('Memoria Institucional 2025', 'Resumen de actividades, logros e impacto de INDARTE durante 2025.', 'memoria_anual', 2025, true),
  ('Aliados institucionales', 'Listado de instituciones aliadas: INFOTEP, INAIPI, y cooperantes.', 'aliados', null, true);
