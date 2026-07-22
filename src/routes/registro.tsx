import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/registro")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Registro — INDARTE" },
      { name: "description", content: "Crea tu cuenta de estudiante en el Aula Virtual del INDARTE." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

function translateError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese correo.";
  if (m.includes("password")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("email not confirmed") || m.includes("confirmed"))
    return "Debes confirmar tu correo antes de iniciar sesión.";
  return "No pudimos procesar tu registro. Por favor, intenta de nuevo en unos minutos.";
}

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: fullName, role: "estudiante" },
        },
      });
      if (error) {
        toast.error(translateError(error.message));
        return;
      }
      toast.success("Cuenta creada. Revisa tu correo para confirmarla.");
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado al crear la cuenta.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 text-center lg:px-8">
        <h1 className="font-display text-3xl font-semibold">Revisa tu correo</h1>
        <p className="mt-3 text-muted-foreground">
          Te enviamos un enlace de confirmación a <span className="font-medium text-foreground">{email}</span>.
          Debes confirmar tu correo antes de iniciar sesión.
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/login" })}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Regístrate como estudiante</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
