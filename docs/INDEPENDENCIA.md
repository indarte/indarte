# Independencia de Lovable — estado y plan

Fecha: 21-nov-2026. Rama: `independencia-lovable`.

## Qué dependía de Lovable (inventario)

| # | Dependencia | Riesgo | Estado |
|---|---|---|---|
| 1 | `@lovable.dev/vite-tanstack-config` (envoltorio de `vite.config.ts`) | Alto: sin él no compila | ✅ Reemplazado por `vite.config.ts` propio |
| 2 | `bun.lock` con 9 URLs a la caché privada de Lovable (`europe-west1-npm.pkg.dev/lovable-core-prod/...`) | Alto: instalaciones futuras podrían fallar | ✅ Reapuntado a `registry.npmjs.org` (mismas versiones, misma integridad sha512) |
| 3 | `bunfig.toml` con excepciones para paquetes `@lovable.dev/*` | Bajo | ✅ Limpiado |
| 4 | `src/lib/lovable-error-reporting.ts` + uso en `__root.tsx` | Bajo (solo telemetría del editor) | ✅ Eliminado |
| 5 | Mensajes "Connect Supabase in Lovable Cloud" | Cosmético | ✅ Reescritos |
| 6 | `.lovable/project.json`, `AGENTS.md`, `README.md` | Cosmético | ✅ Reemplazados |
| 7 | Migraciones SQL: solo 1 en el repo (las 9 base vivían fuera) | Medio: el repo no podía recrear la BD | ✅ Añadidas a `supabase/migrations/` + Edge Function |
| 8 | Vínculo GitHub ↔ proyecto Lovable (`80a5959d…`) | Medio: un prompt en Lovable puede hacer commit a `main` | ⏳ Desconectar tras aprobar esta rama |
| 9 | Cuenta personal de José como propietaria del proyecto Lovable | Medio | ⏳ Dejar de usarlo; eliminar/archivar cuando el cliente confirme |

Lo que NO dependía de Lovable: Supabase (proyecto propio), GitHub (org `indarte`), Vercel (team `indarte1`), Cloudflare.

## Verificación de fidelidad

- Compilación idéntica: con las mismas versiones de dependencias, los 63 archivos del cliente (`.output/public`) salen **idénticos byte a byte** entre el build con el envoltorio de Lovable y el build con `vite.config.ts` propio.
- Tras quitar el código de telemetría: `tsc --noEmit` sin errores; build correcto.
- Captura de 9 rutas (inicio, quiénes somos, ejes, dona, login, registro, contacto, voluntariado, 404) en escritorio (1440) y móvil (390): **idénticas píxel a píxel** entre versión original y nueva.
- Mismos códigos HTTP por ruta en ambos servidores SSR.

## Plan de cambio en producción

1. Revisar y aprobar la rama `independencia-lovable` (Pull Request en `indarte/indarte`).
2. Merge a `main` → disparar Deploy Hook de Vercel → verificar `www.indarte.org` (inicio, login, registro, /cursos, /noticias).
3. En Vercel, confirmar Build Command `bun run build` y las 7 variables de entorno.
4. Desconectar GitHub en Lovable y archivar el proyecto (cuenta personal de José).
5. Reactivar auto-deploy Vercel↔GitHub (hoy se usa Deploy Hook manual).

## Seguridad: TanStack Start (CVE-2026-102989)

Vercel bloquea el despliegue de `@tanstack/react-start@1.168.26` por una vulnerabilidad XSS reflejada
(afecta a respuestas de server functions; corregida desde react-start 1.168.60 / start-server-core 1.169.39).
Actualizado a react-start 1.169.7 (start-server-core 1.169.45), react-router 1.170.46 y router-plugin 1.169.0.
`main` usa la versión vulnerable: este cambio debe llegar a producción.

## Pendientes heredados / recomendaciones

- `.env` está versionado (solo claves publicables, no secretas). Recomendado: dejar de versionarlo y usar `.env.example`; las variables ya existen en Vercel.
- ESLint/Prettier: ~1 100 avisos de formato en código generado por Lovable (`bun run format` los corrige; no afecta al comportamiento). Pendiente decidir si se formatea todo en un commit aparte.
- La migración `20260818…` (generada por Lovable) referencia `rls_auto_enable()`, que existe en la BD actual pero no en una instalación vacía: para recrear la BD desde cero habría que protegerla con un `IF EXISTS`.
- Producción: pasarela de pago, SMTP propio, reactivar "Confirm email", restaurar rate limits de Auth.
- Vercel Hobby con repo público: valorar plan Pro (repo privado) cuando el cliente lo apruebe.
- Observación visual (ya existía antes): en el hero de inicio la tarjeta blanca del logo tapa parte de la cita; conviene revisarlo.
