import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dona")({
  head: () => ({
    meta: [
      { title: "Dona ahora — INDARTE" },
      {
        name: "description",
        content:
          "Tu aporte impulsa la educación artística, la primera infancia y el desarrollo artesanal en República Dominicana.",
      },
      { property: "og:title", content: "Dona ahora — INDARTE" },
      {
        property: "og:description",
        content: "Apoya la formación artística y cultural en RD.",
      },
    ],
  }),
  component: Dona,
});

function Dona() {
  const montos = [500, 1000, 2500, 5000];
  return (
    <div>
      <PageHero
        eyebrow="Apoya nuestra misión"
        title="Dona ahora"
        description="Cada aporte se convierte en talleres, materiales, becas y oportunidades para nuevas generaciones."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Elige un monto (DOP)</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {montos.map((m) => (
              <Button key={m} variant="outline" className="h-14 font-display text-lg">
                RD${m.toLocaleString()}
              </Button>
            ))}
          </div>
          <div className="mt-6">
            <Button className="w-full" size="lg">
              Continuar con la donación
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Aceptamos tarjeta, transferencia bancaria y pagos móviles.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
