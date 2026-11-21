// supabase/functions/verificar-certificado/index.ts
//
// Verificación pública de certificados por código. No requiere sesión.
// Usa la service_role key (solo disponible en el entorno de la función,
// nunca en el cliente) para leer la tabla certificados, que normalmente
// está protegida por RLS y no es de lectura pública, y devuelve
// únicamente los campos necesarios para confirmar la validez —
// nunca el listado completo ni datos sensibles del estudiante.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { codigo } = await req.json()

    if (!codigo || typeof codigo !== 'string' || codigo.trim().length === 0) {
      return new Response(
        JSON.stringify({ valido: false, error: 'Código de verificación requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('certificados')
      .select(`
        fecha_emision,
        curso:cursos ( nombre ),
        estudiante:profiles!certificados_estudiante_id_fkey ( full_name )
      `)
      .eq('codigo_verificacion', codigo.trim())
      .maybeSingle()

    if (error || !data) {
      return new Response(
        JSON.stringify({ valido: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        valido: true,
        estudiante: (data.estudiante as { full_name: string } | null)?.full_name ?? null,
        curso: (data.curso as { nombre: string } | null)?.nombre ?? null,
        fecha_emision: data.fecha_emision,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (_e) {
    return new Response(
      JSON.stringify({ valido: false, error: 'Error interno al verificar el certificado' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
