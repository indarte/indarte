import { createFileRoute } from "@tanstack/react-router";
import { FileText, BookOpen } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { biblioteca } from "@/lib/mock-data";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca Virtual — INDARTE" },
      {
        name: "description",
        content:
          "Publicaciones, cuadernos pedagógicos, guías metodológicas y catálogos del INDARTE, disponibles en línea.",
      },
      { property: "og:title", content: "Biblioteca Virtual — INDARTE" },
      {
        property: "og:description",
        content: "Acceso libre a publicaciones y recursos del INDARTE.",
      },
    ],
  }),
  component: Biblioteca,
});

function Biblioteca() {
  return (
    <div>
      <PageHero
        eyebrow="Recursos"
        title="Biblioteca Virtual"
        description="Consulta y descarga publicaciones, guías y catálogos del INDARTE."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {biblioteca.map((b) => (
            <div
              key={b.titulo}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                {b.tipo === "PDF" ? <FileText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold">{b.titulo}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {b.tipo} · {b.anio}
                </div>
              </div>
              <Button size="sm" variant="outline">
                Descargar
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
