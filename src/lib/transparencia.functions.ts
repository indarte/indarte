import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getDocumentosTransparencia = createServerFn({ method: "GET" }).handler(async () => {
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
    .from("documentos_transparencia")
    .select("id, titulo, descripcion, categoria, anio, archivo_url, created_at")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
});
