-- =====================================================================
-- INDARTE — Migración 1: Esquema de base de datos
-- Portal institucional: 4 ejes, directorio de artesanos, donaciones,
-- voluntariado, biblioteca virtual y aula virtual (LMS).
-- =====================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------

create type public.user_role as enum (
  'admin',               -- Administrador general (INDARTE)
  'coordinador_eje',     -- Coordinador de eje
  'docente',             -- Docente / facilitador
  'supervisor_infotep',  -- Supervisor INFOTEP Virtual (solo lectura)
  'estudiante',          -- Estudiante
  'artesano',            -- Artesano
  'voluntario',          -- Voluntario registrado
  'donante',             -- Donante registrado
  'visitante'            -- Público general (rol por defecto)
);

create type public.estado_voluntario as enum ('pendiente', 'aprobado', 'archivado');
create type public.estado_inscripcion as enum ('pendiente', 'confirmada', 'cancelada', 'completada');
create type public.estado_donacion as enum ('pendiente', 'completada', 'fallida', 'cancelada');
create type public.tipo_donacion as enum ('unica', 'recurrente');
create type public.tipo_recurso as enum ('documento', 'video', 'audio', 'presentacion');
create type public.nivel_acceso as enum ('publico', 'restringido');

-- ---------------------------------------------------------------------
-- PROFILES (extiende auth.users)
-- ---------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'visitante',
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil extendido de cada usuario autenticado; el rol determina sus permisos en todo el sitio.';

-- ---------------------------------------------------------------------
-- EJES DE TRABAJO
-- ---------------------------------------------------------------------

create table public.ejes (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nombre      text not null,
  descripcion text,
  imagen_url  text,
  orden       int not null default 0,
  created_at  timestamptz not null default now()
);

-- Coordinadores asignados a uno o más ejes
create table public.coordinadores_eje (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  eje_id     uuid not null references public.ejes(id) on delete cascade,
  primary key (profile_id, eje_id)
);

-- ---------------------------------------------------------------------
-- DIRECTORIO DE ARTESANOS
-- ---------------------------------------------------------------------

create table public.artesanos (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid unique references public.profiles(id) on delete set null,
  nombre       text not null,
  oficio       text not null,            -- madera, reciclaje, joyería, textil, etc.
  biografia    text,
  provincia    text,
  telefono     text,
  whatsapp     text,
  instagram    text,
  facebook     text,
  foto_url     text,
  disponible   boolean not null default true,
  activo       boolean not null default true,  -- visibilidad pública (moderación admin)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.artesano_galeria (
  id           uuid primary key default gen_random_uuid(),
  artesano_id  uuid not null references public.artesanos(id) on delete cascade,
  imagen_url   text not null,
  descripcion  text,
  orden        int not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- DONACIONES
-- ---------------------------------------------------------------------

create table public.donaciones (
  id                     uuid primary key default gen_random_uuid(),
  donante_profile_id     uuid references public.profiles(id) on delete set null,
  nombre_donante         text not null,
  email_donante          text not null,
  telefono_donante       text,
  monto                  numeric(12,2) not null check (monto > 0),
  moneda                 text not null default 'DOP',
  tipo                   public.tipo_donacion not null default 'unica',
  eje_id                 uuid references public.ejes(id),
  metodo_pago            text,              -- azul | cardnet | paypal | stripe
  estado                 public.estado_donacion not null default 'pendiente',
  referencia_pago        text,              -- id de la pasarela externa
  desea_comprobante      boolean not null default false,
  desea_informe_impacto  boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on column public.donaciones.estado is 'El estado solo debe actualizarse desde el webhook de la pasarela de pago (service role), nunca desde el cliente.';

-- ---------------------------------------------------------------------
-- VOLUNTARIADO
-- ---------------------------------------------------------------------

create table public.voluntarios (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid references public.profiles(id) on delete set null,
  nombre             text not null,
  email              text not null,
  telefono           text,
  area_interes       text not null,   -- educacion_artistica | primera_infancia | capacitacion_tecnica | artesania | administrativo | eventos
  disponibilidad     text,
  experiencia_previa text,
  estado             public.estado_voluntario not null default 'pendiente',
  notas_internas     text,            -- solo visible para admin
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BIBLIOTECA VIRTUAL
-- ---------------------------------------------------------------------

create table public.recursos_biblioteca (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descripcion  text,
  eje_id       uuid references public.ejes(id),
  tipo         public.tipo_recurso not null,
  nivel        text,
  acceso       public.nivel_acceso not null default 'publico',
  archivo_url  text,
  etiquetas    text[] default '{}',
  creado_por   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AULA VIRTUAL (LMS)
-- ---------------------------------------------------------------------

create table public.cursos (
  id              uuid primary key default gen_random_uuid(),
  eje_id          uuid not null references public.ejes(id),
  nombre          text not null,
  descripcion     text,
  modalidad       text default 'virtual', -- presencial | virtual | mixta
  cupo_maximo     int,
  fecha_inicio    date,
  fecha_fin       date,
  coordinador_id  uuid references public.profiles(id),
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.curso_docentes (
  curso_id   uuid not null references public.cursos(id) on delete cascade,
  docente_id uuid not null references public.profiles(id) on delete cascade,
  primary key (curso_id, docente_id)
);

create table public.inscripciones (
  id                 uuid primary key default gen_random_uuid(),
  curso_id           uuid not null references public.cursos(id) on delete cascade,
  estudiante_id      uuid not null references public.profiles(id) on delete cascade,
  estado             public.estado_inscripcion not null default 'pendiente',
  fecha_inscripcion  timestamptz not null default now(),
  unique (curso_id, estudiante_id)
);

create table public.clases (
  id                    uuid primary key default gen_random_uuid(),
  curso_id              uuid not null references public.cursos(id) on delete cascade,
  docente_id            uuid references public.profiles(id),
  titulo                text not null,
  fecha                 timestamptz not null,
  link_videoconferencia text,
  grabacion_url         text,
  material_url          text,
  created_at            timestamptz not null default now()
);

create table public.asistencia (
  id              uuid primary key default gen_random_uuid(),
  clase_id        uuid not null references public.clases(id) on delete cascade,
  estudiante_id   uuid not null references public.profiles(id) on delete cascade,
  presente        boolean not null default false,
  registrado_por  uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  unique (clase_id, estudiante_id)
);

create table public.calificaciones (
  id              uuid primary key default gen_random_uuid(),
  curso_id        uuid not null references public.cursos(id) on delete cascade,
  estudiante_id   uuid not null references public.profiles(id) on delete cascade,
  concepto        text not null,   -- 'Tarea 1', 'Examen final', etc.
  nota            numeric(5,2),
  registrado_por  uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);

create table public.certificados (
  id                  uuid primary key default gen_random_uuid(),
  curso_id            uuid not null references public.cursos(id),
  estudiante_id       uuid not null references public.profiles(id),
  codigo_verificacion text unique not null,
  fecha_emision       date not null default current_date,
  url_pdf             text,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------

create index idx_artesanos_activo on public.artesanos(activo);
create index idx_artesanos_oficio on public.artesanos(oficio);
create index idx_donaciones_estado on public.donaciones(estado);
create index idx_voluntarios_estado on public.voluntarios(estado);
create index idx_recursos_eje on public.recursos_biblioteca(eje_id);
create index idx_cursos_eje on public.cursos(eje_id);
create index idx_inscripciones_estudiante on public.inscripciones(estudiante_id);
create index idx_clases_curso on public.clases(curso_id);
create index idx_calificaciones_estudiante on public.calificaciones(estudiante_id);

-- ---------------------------------------------------------------------
-- SEED: los 4 ejes de trabajo
-- ---------------------------------------------------------------------

insert into public.ejes (slug, nombre, descripcion, orden) values
  ('educacion-artistica', 'Educación Artística', 'Formación en artes desde edades tempranas y a lo largo de la vida.', 1),
  ('primera-infancia', 'Atención a la Primera Infancia', 'En articulación con INAIPI, a través del Centro de Atención a la Familia e Infancia (CAFI).', 2),
  ('capacitacion-tecnica', 'Capacitación Técnico Profesional', 'Cursos y carreras técnicas certificadas por INFOTEP.', 3),
  ('fomento-artesanal', 'Fomento y Desarrollo Artesanal', 'Formación de artesanos, incluyendo trabajo con materiales reciclados.', 4);
