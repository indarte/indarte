import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/quienes-somos")({
  head: () => ({
    meta: [
      { title: "Quiénes somos — INDARTE" },
      {
        name: "description",
        content:
          "Conoce la historia, misión, visión y equipo del Instituto Nacional de Arte de República Dominicana.",
      },
      { property: "og:title", content: "Quiénes somos — INDARTE" },
      {
        property: "og:description",
        content: "Historia, misión y visión del INDARTE.",
      },
    ],
  }),
  component: QuienesSomos,
});

function QuienesSomos() {
  return (
    <div>
      <PageHero
        eyebrow="Institucional"
        title="Quiénes somos"
        description="El INDARTE es una institución dedicada al fomento de la educación artística, la cultura y la artesanía en República Dominicana."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="prose prose-neutral max-w-none">
          <h2 className="font-display text-2xl font-semibold">Historia</h2>
          <p className="text-muted-foreground">
            Desde nuestra fundación, hemos trabajado por acercar el arte y la cultura a todas las
            comunidades del país, con especial énfasis en la niñez, la juventud y los artesanos
            tradicionales.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold text-primary">Misión</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Promover, coordinar y ejecutar programas de educación artística, atención a la
                primera infancia, capacitación técnico profesional y desarrollo artesanal.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold text-primary">Visión</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Ser la institución líder en la República Dominicana en formación artística y
                fortalecimiento de las expresiones culturales del pueblo dominicano.
              </p>
            </div>
          </div>

          <h2 className="mt-12 font-display text-2xl font-semibold">Valores</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {["Identidad cultural", "Inclusión", "Excelencia", "Colaboración", "Transparencia", "Innovación"].map(
              (v) => (
                <li
                  key={v}
                  className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm font-medium"
                >
                  {v}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
