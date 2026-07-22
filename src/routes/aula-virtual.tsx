import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { GraduationCap, PlayCircle, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/aula-virtual")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [
      { title: "Aula Virtual — INDARTE" },
      {
        name: "description",
        content:
          "Espacio de aprendizaje en línea para estudiantes del INDARTE. Accede a tus cursos, materiales y evaluaciones.",
      },
      { property: "og:title", content: "Aula Virtual — INDARTE" },
      { property: "og:description", content: "Plataforma de aprendizaje del INDARTE." },
    ],
  }),
  component: AulaVirtual,
});

function AulaVirtual() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (role === "visitante" || role === null) {
    return (
      <div>
        <PageHero eyebrow="Aula Virtual" title="Cuenta en revisión" description="" />
        <section className="mx-auto max-w-2xl px-4 py-14 text-center lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-semibold">Tu cuenta aún no tiene un rol asignado</h2>
            <p className="mt-3 text-muted-foreground">
              Contacta al administrador del INDARTE para que active tu perfil y puedas acceder al contenido del
              Aula Virtual.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link to="/contacto">Contactar al administrador</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Plataforma educativa"
        title="Aula Virtual"
        description="Bienvenido/a a tu espacio de aprendizaje. Continúa donde lo dejaste."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card icon={<PlayCircle className="h-6 w-6" />} title="Mis cursos activos" value="3" hint="Continuar aprendiendo" />
          <Card icon={<FileText className="h-6 w-6" />} title="Tareas pendientes" value="2" hint="Ver entregas" />
          <Card icon={<GraduationCap className="h-6 w-6" />} title="Certificados" value="1" hint="Descargar" />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">Próximamente</h2>
          <p className="mt-2 text-muted-foreground">
            Estamos preparando tus contenidos. Muy pronto podrás acceder a videos, materiales descargables y
            evaluaciones interactivas.
          </p>
          <Button asChild className="mt-6">
            <Link to="/cursos">Explorar más cursos</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Card({ icon, title, value, hint }: { icon: React.ReactNode; title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">{icon}</div>
      <div className="mt-4 text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 font-display text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-primary">{hint}</div>
    </div>
  );
}
