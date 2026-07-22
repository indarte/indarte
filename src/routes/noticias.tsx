import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { noticias } from "@/lib/mock-data";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Noticias y eventos — INDARTE" },
      {
        name: "description",
        content:
          "Últimas noticias, convocatorias y eventos del Instituto Nacional para el Desarrollo del Arte y la Educación, INC (INDARTE) de República Dominicana.",
      },
      { property: "og:title", content: "Noticias y eventos — INDARTE" },
      {
        property: "og:description",
        content: "Actualidad institucional del INDARTE.",
      },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  return (
    <div>
      <PageHero eyebrow="Actualidad" title="Noticias y eventos" />
      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {noticias.map((n) => (
            <article
              key={n.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/70 to-accent" />
              <div className="flex flex-1 flex-col p-6">
                <div className="text-xs text-muted-foreground">{n.fecha}</div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                  {n.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{n.resumen}</p>
                <a className="mt-4 cursor-pointer text-sm font-medium text-primary hover:underline">
                  Leer más →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
