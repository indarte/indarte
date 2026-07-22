import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { ejes } from "@/lib/mock-data";

export const Route = createFileRoute("/ejes/$eje")({
  loader: ({ params }) => {
    const eje = ejes.find((e) => e.slug === params.eje);
    if (!eje) throw notFound();
    return { eje };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.eje.title} — INDARTE` },
          { name: "description", content: loaderData.eje.description },
          { property: "og:title", content: `${loaderData.eje.title} — INDARTE` },
          { property: "og:description", content: loaderData.eje.description },
        ]
      : [
          { title: "Eje no encontrado — INDARTE" },
          { name: "robots", content: "noindex" },
        ],
  }),
  notFoundComponent: EjeNotFound,
  component: EjeDetail,
});

function EjeDetail() {
  const { eje } = Route.useLoaderData();
  return (
    <div>
      <PageHero eyebrow="Eje de trabajo" title={eje.title} description={eje.tagline} />
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="text-6xl">{eje.icon}</div>
        <p className="mt-6 text-lg text-foreground/90">{eje.description}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold">Programas</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Talleres presenciales y virtuales</li>
              <li>• Formación docente</li>
              <li>• Muestras y encuentros</li>
              <li>• Publicaciones especializadas</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold">Población atendida</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Niñas, niños y adolescentes</li>
              <li>• Docentes y facilitadores</li>
              <li>• Familias y comunidades</li>
              <li>• Artesanos y artistas</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/cursos">Ver cursos relacionados</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contacto">Contáctanos</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function EjeNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Eje no encontrado</h1>
      <p className="mt-3 text-muted-foreground">El eje que buscas no existe.</p>
      <Link to="/ejes" className="mt-6 inline-block text-primary hover:underline">
        ← Ver todos los ejes
      </Link>
    </div>
  );
}
