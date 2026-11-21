# INDARTE — Portal institucional

Portal web de INDARTE, ONG dominicana de desarrollo cultural y educativo.
Incluye sitio público (quiénes somos, ejes, directorio de artesanos, biblioteca,
noticias, transparencia, contacto, dona, voluntariado), aula virtual por roles
y panel de administración.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend / SSR | TanStack Start + React 19 + Tailwind CSS v4 + shadcn/ui (Radix) |
| Backend | Supabase (Postgres + RLS, Auth, Storage, Edge Functions) |
| Hosting | Vercel (build con Nitro) |
| DNS | Cloudflare (solo DNS, sin proxy) |

## Desarrollo local

Requisitos: Node 22+ y [Bun](https://bun.sh) (o npm).

```sh
bun install          # o: npm install
cp .env.example .env # completar con las claves del proyecto Supabase
bun run dev          # http://localhost:8080
```

Scripts: `dev`, `build`, `start` (sirve `.output/` con Node), `lint`, `typecheck`, `format`.

## Variables de entorno

| Variable | Dónde | Uso |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | cliente | conexión pública a Supabase |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` | servidor | server functions |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** (Vercel) | operaciones privilegiadas; nunca en el cliente ni en git |

## Base de datos

Las migraciones viven en `supabase/migrations/` y se aplican con la CLI de Supabase
(`supabase link --project-ref <ref>` y `supabase db push`).

## Despliegue

Vercel construye con `bun run build` y Nitro detecta el destino automáticamente.
Documentación del proceso de independización: `docs/INDEPENDENCIA.md`.
