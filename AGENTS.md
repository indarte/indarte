# Guía para asistentes de código

Proyecto INDARTE (TanStack Start + Supabase + Vercel). Ver `README.md`.

- Repositorio propio de la organización `indarte`; no depende de ninguna plataforma de generación de código.
- No reescribir el historial publicado de `main`.
- Las claves de servicio (`SUPABASE_SERVICE_ROLE_KEY`) jamás se versionan ni se exponen al cliente.
- Cambios de esquema: siempre como migración nueva en `supabase/migrations/`.
- Antes de proponer un cambio: `bun run typecheck && bun run lint && bun run build`.
