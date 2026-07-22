import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Iniciar sesión — INDARTE" },
      { name: "description", content: "Accede al Aula Virtual del INDARTE con tu correo y contraseña." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function isSafePath(p: string | undefined) {
  return typeof p === "string" && p.startsWith("/") && !p.startsWith("//");
}

function translateError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Credenciales incorrectas. Verifica tu correo y contraseña.";
  if (m.includes("email not confirmed")) return "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.";
  if (m.includes("user not found")) return "No existe una cuenta con ese correo.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Has enviado demasiadas solicitudes. Espera un momento e intenta de nuevo.";
  return "No pudimos iniciar sesión. Por favor, intenta de nuevo en unos minutos.";
}

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const inFlightRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const target = isSafePath(search.redirect) ? search.redirect! : "/aula-virtual";
        navigate({ to: target, replace: true });
      }
    });
  }, [navigate, search.redirect]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    // Bloquear el envío nativo del formulario inmediatamente
    e.preventDefault();
    e.stopPropagation();

    // Evitar envíos múltiples incluso si React aún no ha actualizado el estado
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(translateError(error.message));
        return;
      }

      toast.success("¡Bienvenido/a!");
      const target = isSafePath(search.redirect) ? search.redirect! : "/aula-virtual";
      navigate({ to: target, replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado al iniciar sesión.";
      toast.error(msg);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accede a tu Aula Virtual</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
