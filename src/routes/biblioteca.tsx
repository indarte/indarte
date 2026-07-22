import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FileText,
  Video,
  Music,
  Presentation,
  ExternalLink,
  BookOpen,
} from "lucide-react";

type TipoRecurso = "documento" | "video" | "audio" | "presentacion";

type Recurso = {
  id: string;
  titulo: string;
  descripcion: string | null;
  eje_id: string | null;
  tipo: TipoRecurso;
  nivel: string | null;
  archivo_url: string | null;
  etiquetas: string[] | null;
};

type Eje = { id: string; nombre: string };

const bibliotecaQuery = queryOptions({
  queryKey: ["biblioteca", "publicos"],
  queryFn: async () => {
    const [{ data: recursos, error: e1 }, { data: ejes, error: e2 }] =
      await Promise.all([
        supabase
          .from("recursos_biblioteca")
          .select(
            "id,titulo,descripcion,eje_id,tipo,nivel,archivo_url,etiquetas",
          )
          .order("created_at", { ascending: false }),
        supabase.from("ejes").select("id,nombre").order("orden"),
      ]);
    if (e1) throw e1;
    if (e2) throw e2;
    return {
      recursos: (recursos ?? []) as Recurso[],
      ejes: (ejes ?? []) as Eje[],
    };
  },
});

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca Virtual — INDARTE" },
      {
        name: "description",
        content:
          "Documentos, videos, audios y presentaciones abiertos al público sobre educación artística, primera infancia, capacitación técnica y fomento artesanal.",
      },
      { property: "og:title", content: "Biblioteca Virtual — INDARTE" },
      {
        property: "og:description",
        content:
          "Recursos abiertos de INDARTE para educadores, artesanos y comunidad.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bibliotecaQuery),
  component: Biblioteca,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 font-serif text-3xl">
        No pudimos cargar la biblioteca
      </h1>
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10">No hay recursos disponibles.</div>
  ),
});

const tipoMeta: Record<
  TipoRecurso,
  { label: string; icon: typeof FileText; className: string }
> = {
  documento: {
    label: "Documento",
    icon: FileText,
    className: "bg-primary/10 text-primary",
  },
  video: {
    label: "Video",
    icon: Video,
    className: "bg-destructive/10 text-destructive",
  },
  audio: {
    label: "Audio",
    icon: Music,
    className: "bg-secondary text-secondary-foreground",
  },
  presentacion: {
    label: "Presentación",
    icon: Presentation,
    className: "bg-accent/20 text-accent-foreground",
  },
};

function Biblioteca() {
  const { data } = useSuspenseQuery(bibliotecaQuery);
  const { recursos, ejes } = data;

  const [q, setQ] = useState("");
  const [ejeId, setEjeId] = useState<string>("all");
  const [tipo, setTipo] = useState<string>("all");

  const ejeById = useMemo(
    () => Object.fromEntries(ejes.map((e) => [e.id, e.nombre])),
    [ejes],
  );

  const filtered = recursos.filter((r) => {
    if (ejeId !== "all" && r.eje_id !== ejeId) return false;
    if (tipo !== "all" && r.tipo !== tipo) return false;
    if (q) {
      const hay = `${r.titulo} ${r.descripcion ?? ""} ${(r.etiquetas ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHero
        eyebrow="Recursos abiertos"
        title="Biblioteca Virtual"
        description="Materiales de acceso público publicados por el INDARTE para educadores, artesanos y comunidad."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Buscar por título, descripción o etiqueta…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={ejeId} onValueChange={setEjeId}>
            <SelectTrigger>
              <SelectValue placeholder="Eje de trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los ejes</SelectItem>
              {ejes.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de recurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {(Object.keys(tipoMeta) as TipoRecurso[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {tipoMeta[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 py-16 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-primary/60" />
            <h2 className="mb-1 font-serif text-2xl">Aún no hay recursos</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              No encontramos recursos públicos con esos criterios. Prueba
              cambiar los filtros o el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const meta = tipoMeta[r.tipo];
              const Icon = meta.icon;
              const eje = r.eje_id ? ejeById[r.eje_id] : null;
              const disabled = !r.archivo_url;
              return (
                <a
                  key={r.id}
                  href={r.archivo_url ?? "#"}
                  target={r.archivo_url ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  onClick={(e) => {
                    if (disabled) e.preventDefault();
                  }}
                  className={`group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition ${
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : "hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    {r.archivo_url && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    )}
                  </div>

                  <h3 className="font-serif text-xl leading-tight">
                    {r.titulo}
                  </h3>

                  {r.descripcion && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {r.descripcion}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                    {eje && (
                      <span className="rounded-full bg-secondary px-2 py-0.5">
                        {eje}
                      </span>
                    )}
                    {r.nivel && (
                      <span className="uppercase tracking-wide">
                        · {r.nivel}
                      </span>
                    )}
                  </div>

                  {r.etiquetas && r.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.etiquetas.slice(0, 5).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
