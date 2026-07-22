import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { transparencia } from "@/lib/mock-data";

export const Route = createFileRoute("/transparencia")({
  head: () => ({
    meta: [
      { title: "Transparencia — INDARTE" },
      {
        name: "description",
        content:
          "Documentos de transparencia institucional del INDARTE: memoria, ejecución presupuestaria, nómina y más.",
      },
      { property: "og:title", content: "Transparencia — INDARTE" },
      {
        property: "og:description",
        content: "Rendición de cuentas y acceso a la información pública.",
      },
    ],
  }),
  component: Transparencia,
});

function Transparencia() {
  return (
    <div>
      <PageHero
        eyebrow="Rendición de cuentas"
        title="Transparencia"
        description="Toda la información pública del INDARTE en un solo lugar."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {transparencia.map((t) => (
            <div key={t.titulo} className="flex items-center gap-4 p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{t.titulo}</div>
                <div className="text-xs text-muted-foreground">{t.tipo}</div>
              </div>
              <Button size="sm" variant="outline">
                Abrir
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
