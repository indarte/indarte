// Configuración de Vite del portal INDARTE (independiente de Lovable).
//
// Stack: TanStack Start (SSR) + React 19 + Tailwind CSS v4 + Nitro.
// Nitro elige el destino de despliegue automáticamente:
//   - En Vercel (variable VERCEL=1) genera la salida para Vercel.
//   - Localmente genera un servidor Node (`node .output/server/index.mjs`).
// Para forzar otro destino: NITRO_PRESET=<preset> npm run build
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  // Inyecta las variables VITE_* de .env en el código del cliente y del servidor.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  );

  return {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": path.resolve(process.cwd(), "src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Usa src/server.ts como entrada del servidor (envoltorio de errores SSR).
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      // Nitro solo participa en `vite build` (genera .output/ para el destino elegido).
      ...(command === "build" ? [nitro()] : []),
      viteReact(),
    ],
  };
});
