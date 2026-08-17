import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getCursosPublicos = createServerFn({ method: "GET" }).handler(async () => {
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
    .from("cursos")
    .select(
      "id, nombre, descripcion, modalidad, cupo_maximo, fecha_inicio, fecha_fin, eje:ejes(nombre, slug)",
    )
    .eq("activo", true)
    .order("fecha_inicio", { ascending: true });

  if (error) throw error;
  return data ?? [];
});
