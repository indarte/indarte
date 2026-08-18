-- 1. Fix mutable search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- 2. Revoke EXECUTE on functions that must never be called directly by API roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_role_self_escalation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Helper role-check functions are used inside RLS policies; keep them callable
-- only by the roles that actually evaluate those policies.
REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_coordinador_de_eje(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_docente_de_curso(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_coordinador_de_eje(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_docente_de_curso(uuid) TO anon, authenticated, service_role;

-- 3. Hide artisan phone/whatsapp from anonymous visitors via column privileges
REVOKE SELECT ON public.artesanos FROM anon;
GRANT SELECT (
  id, profile_id, nombre, oficio, biografia, provincia,
  instagram, facebook, foto_url, disponible, activo, created_at, updated_at
) ON public.artesanos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artesanos TO authenticated;
GRANT ALL ON public.artesanos TO service_role;