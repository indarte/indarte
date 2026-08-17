import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getNoticiasPublicas = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  const { data, error } = await supabase
    .from("noticias_eventos")
    .select("id, tipo, titulo, contenido, fecha_evento, imagen_url, created_at, eje:ejes(nombre, slug)", { count: "exact" })
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
});
