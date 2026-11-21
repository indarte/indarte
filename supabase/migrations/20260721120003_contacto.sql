-- =====================================================================
-- INDARTE — Migración 4: Formulario de Contacto
-- =====================================================================

create table public.mensajes_contacto (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  email       text not null,
  telefono    text,
  asunto      text,
  mensaje     text not null,
  leido       boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.mensajes_contacto is 'Mensajes enviados desde el formulario público de Contacto.';

alter table public.mensajes_contacto enable row level security;

-- Cualquiera (incluso anónimo) puede enviar un mensaje desde el formulario público
create policy "mensajes_contacto_public_insert"
on public.mensajes_contacto for insert
with check (true);

-- Solo el admin puede leerlos y marcarlos como leídos
create policy "mensajes_contacto_admin_select"
on public.mensajes_contacto for select
using (public.is_admin());

create policy "mensajes_contacto_admin_update"
on public.mensajes_contacto for update
using (public.is_admin());

create index idx_mensajes_contacto_leido on public.mensajes_contacto(leido);
