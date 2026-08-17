import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { FileText, Download, FolderOpen } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDocumentosTransparencia } from "@/lib/transparencia.functions";

type DocumentoTransparencia = {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: "memoria_anual" | "estado_financiero" | "aliados" | "otro";
  anio: number | null;
  archivo_url: string | null;
  created_at: string;
};

const transparenciaQueryOptions = () =>
  queryOptions({
    queryKey: ["documentos-transparencia"],
    queryFn: () => getDocumentosTransparencia() as Promise<DocumentoTransparencia[]>,
  });

const CATEGORIAS: { key: DocumentoTransparencia["categoria"]; label: string }[] = [
  { key: "memoria_anual", label: "Memoria Anual" },
  { key: "estado_financiero", label: "Estados Financieros" },
  { key: "aliados", label: "Aliados" },
  { key: "otro", label: "Otros" },
];

export const Route = createFileRoute("/transparencia")({
  loader: ({ context }) => context.queryClient.ensureQueryData(transparenciaQueryOptions()),
  head: () => ({
    meta: [
      { title: "Transparencia — INDARTE" },
      {
        name: "description",
        content:
          "Documentos de transparencia institucional del INDARTE: memoria anual, estados financieros, aliados y más.",
      },
      { property: "og:title", content: "Transparencia — INDARTE" },
      {
        property: "og:description",
        content: "Rendición de cuentas y acceso a la información pública del INDARTE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Transparencia,
});

function Transparencia() {
  const { data: documentos } = useSuspenseQuery(transparenciaQueryOptions());

  const porCategoria = new Map<DocumentoTransparencia["categoria"], DocumentoTransparencia[]>();
  for (const cat of CATEGORIAS) {
    porCategoria.set(cat.key, []);
  }
  for (const doc of documentos) {
    const lista = porCategoria.get(doc.categoria) ?? [];
    lista.push(doc);
    porCategoria.set(doc.categoria, lista);
  }

  const totalDocumentos = documentos.length;

  return (
    <div>
      <PageHero
        eyebrow="Rendición de cuentas"
        title="Transparencia"
        description="Toda la información pública del INDARTE en un solo lugar."
      />
      <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
        {totalDocumentos === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">No hay documentos publicados</h2>
            <p className="mt-2 text-muted-foreground">
              Pronto publicaremos los documentos de transparencia institucional.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORIAS.map(({ key, label }) => {
              const docs = porCategoria.get(key) ?? [];
              if (docs.length === 0) return null;
              return (
                <div key={key}>
                  <h2 className="mb-4 font-display text-2xl font-semibold">{label}</h2>
                  <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start"
                      >
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{doc.titulo}</h3>
                            {doc.anio ? (
                              <Badge variant="outline">{doc.anio}</Badge>
                            ) : null}
                          </div>
                          {doc.descripcion ? (
                            <p className="mt-1 text-sm text-muted-foreground">{doc.descripcion}</p>
                          ) : null}
                        </div>
                        {doc.archivo_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="shrink-0"
                          >
                            <a
                              href={doc.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
