import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ejes, noticias } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INDARTE — Portal Institucional" },
      {
        name: "description",
        content:
          "El Instituto Nacional para el Desarrollo del Arte y la Educación, INC (INDARTE) promueve la formación artística, la primera infancia, la capacitación técnica y el desarrollo artesanal en República Dominicana.",
      },
      { property: "og:title", content: "INDARTE — Portal Institucional" },
      {
        property: "og:description",
        content:
          "Educación artística, primera infancia, capacitación y desarrollo artesanal dominicano.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-secondary via-background to-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div>
            <div className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
              Instituto Nacional para el Desarrollo del Arte y la Educación, INC · República Dominicana
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-foreground md:text-6xl">
              El arte que nos <span className="text-primary">forma</span> como pueblo.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Impulsamos la educación artística, la atención a la primera infancia, la capacitación
              técnico profesional y el desarrollo artesanal en todo el país.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/cursos">
                  Explorar cursos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quienes-somos">Conócenos</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
              <Stat value="+30" label="Años de labor" />
              <Stat value="+8K" label="Estudiantes formados" />
              <Stat value="32" label="Provincias con presencia" />
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 via-primary to-accent shadow-xl">
              <div className="flex h-full items-end p-8">
                <div className="text-primary-foreground">
                  <div className="font-display text-3xl leading-tight">
                    "Cada trazo, cada canto y cada tejido es memoria viva."
                  </div>
                  <div className="mt-3 text-sm opacity-90">— Fundación INDARTE</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden aspect-square w-40 rounded-2xl border border-border bg-card shadow-md md:block" />
          </div>
        </div>
      </section>

      {/* Ejes */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
              Nuestro trabajo
            </div>
            <h2 className="max-w-2xl font-display text-3xl font-semibold md:text-4xl">
              Cuatro ejes que sostienen nuestra misión
            </h2>
          </div>
          <Link
            to="/ejes"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ejes.map((e) => (
            <Link
              key={e.slug}
              to="/ejes/$eje"
              params={{ eje: e.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="text-3xl">{e.icon}</div>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                {e.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{e.tagline}</p>
              <div className="mt-4 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Conocer más →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Participa */}
      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <ActionCard
            icon={<GraduationCap className="h-6 w-6" />}
            title="Cursos e inscripciones"
            to="/cursos"
          />
          <ActionCard
            icon={<Users className="h-6 w-6" />}
            title="Voluntariado"
            to="/voluntariado"
          />
          <ActionCard
            icon={<Heart className="h-6 w-6" />}
            title="Dona ahora"
            to="/dona"
          />
          <ActionCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Biblioteca virtual"
            to="/biblioteca"
          />
        </div>
      </section>

      {/* Noticias */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
              Actualidad
            </div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Noticias y eventos</h2>
          </div>
          <Link to="/noticias" className="text-sm font-medium text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {noticias.map((n) => (
            <article
              key={n.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/70 to-accent" />
              <div className="flex flex-1 flex-col p-6">
                <div className="text-xs text-muted-foreground">{n.fecha}</div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground">
                  {n.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{n.resumen}</p>
                <Link to="/noticias" className="mt-4 text-sm font-medium text-primary hover:underline">
                  Leer más →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-primary md:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  to: "/cursos" | "/voluntariado" | "/dona" | "/biblioteca";
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-base font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground group-hover:text-primary">Participa →</div>
      </div>
    </Link>
  );
}
