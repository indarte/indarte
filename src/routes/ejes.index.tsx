import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { ejes } from "@/lib/mock-data";

export const Route = createFileRoute("/ejes/")({
  head: () => ({
    meta: [
      { title: "Ejes de trabajo — INDARTE" },
      {
        name: "description",
        content:
          "Los cuatro ejes de trabajo del INDARTE: educación artística, primera infancia, capacitación técnico profesional y desarrollo artesanal.",
      },
      { property: "og:title", content: "Ejes de trabajo — INDARTE" },
      {
        property: "og:description",
        content: "Conoce las cuatro áreas estratégicas del INDARTE.",
      },
    ],
  }),
  component: EjesIndex,
});

function EjesIndex() {
  return (
    <div>
      <PageHero
        eyebrow="Nuestro trabajo"
        title="Ejes de trabajo"
        description="Cuatro áreas estratégicas que orientan toda nuestra acción institucional."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {ejes.map((e) => (
            <Link
              key={e.slug}
              to="/ejes/$eje"
              params={{ eje: e.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-8 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="text-4xl">{e.icon}</div>
              <h2 className="mt-4 font-display text-2xl font-semibold">{e.title}</h2>
              <p className="mt-2 text-sm font-medium text-primary">{e.tagline}</p>
              <p className="mt-4 flex-1 text-sm text-muted-foreground">{e.description}</p>
              <div className="mt-6 text-sm font-medium text-primary">Conocer el eje →</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
