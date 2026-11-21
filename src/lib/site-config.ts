// Modo "Sitio en construcción".
//
// Se activa con la variable de entorno VITE_SITE_UNDER_CONSTRUCTION=true (en Vercel:
// Settings → Environment Variables) y un nuevo despliegue. Para publicar el sitio,
// se borra la variable (o se pone en false) y se vuelve a desplegar.
//
// Con el modo activo, el público ve solo /en-construccion. El equipo puede seguir
// entrando por las rutas de la lista para cargar los datos reales.
export const UNDER_CONSTRUCTION =
  String(import.meta.env["VITE_SITE_UNDER_CONSTRUCTION"] ?? "")
    .trim()
    .toLowerCase() === "true";

const ALLOWED_WHEN_LOCKED = ["/en-construccion", "/login", "/auth", "/admin", "/aula-virtual"];

export function isAllowedWhenLocked(pathname: string): boolean {
  return ALLOWED_WHEN_LOCKED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
