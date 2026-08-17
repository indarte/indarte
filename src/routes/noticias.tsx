import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Calendar, Newspaper, Megaphone } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { getNoticiasPublicas } from "@/lib/noticias.functions";

type NoticiaPublica = {
  id: string;
  tipo: "noticia" | "evento";
  titulo: string;
  contenido: string | null;
  fecha_evento: string | null;
  imagen_url: string | null;
  created_at: string;
  eje: { nombre: string | null; slug: string | null } | null;
};

const noticiasQueryOptions = () =>
  queryOptions({
    queryKey: ["noticias-publicas"],
    queryFn: () => getNoticiasPublicas() as Promise<NoticiaPublica[]>,
  });

export const Route = createFileRoute("/noticias")({
  loader: ({ context }) => context.queryClient.ensureQueryData(noticiasQueryOptions()),
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Noticias,
});

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Noticias() {
  const { data: noticias } = useSuspenseQuery(noticiasQueryOptions());

  return (
    <div>
      <PageHero
        eyebrow="Actualidad"
        title="Noticias y eventos"
        description="Entérate de las últimas novedades, convocatorias y actividades del INDARTE."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        {noticias.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">No hay publicaciones aún</h2>
            <p className="mt-2 text-muted-foreground">
              Pronto compartiremos noticias y eventos institucionales. Vuelve a visitarnos.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <article
                key={n.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                {n.imagen_url ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={n.imagen_url}
                      alt={n.titulo}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                    {n.tipo === "evento" ? (
                      <Calendar className="h-10 w-10 text-primary/60" />
                    ) : (
                      <Megaphone className="h-10 w-10 text-primary/60" />
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant={n.tipo === "evento" ? "default" : "secondary"}>
                      {n.tipo === "evento" ? "Evento" : "Noticia"}
                    </Badge>
                    {n.eje?.nombre ? (
                      <span className="text-muted-foreground">{n.eje.nombre}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                    {n.titulo}
                  </h3>
                  {n.contenido ? (
                    <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                      {n.contenido}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {n.tipo === "evento" && n.fecha_evento
                      ? formatDate(n.fecha_evento)
                      : formatDate(n.created_at)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
