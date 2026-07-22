import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type Artesano = {
  id: string;
  nombre: string;
  oficio: string | null;
  provincia: string | null;
  biografia: string | null;
  foto_url: string | null;
  disponible: boolean | null;
};

const artesanosQuery = queryOptions({
  queryKey: ["artesanos", "activos"],
  queryFn: async (): Promise<Artesano[]> => {
    const { data, error } = await supabase
      .from("artesanos")
      .select("id,nombre,oficio,provincia,biografia,foto_url,disponible")
      .eq("activo", true)
      .order("nombre", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Artesano[];
  },
});

export const Route = createFileRoute("/directorio-artesanos")({
  head: () => ({
    meta: [
      { title: "Directorio de Artesanos — INDARTE" },
      {
        name: "description",
        content:
          "Explora el directorio nacional de artesanos y artesanas registrados en el INDARTE, con sus oficios y provincias.",
      },
      { property: "og:title", content: "Directorio de Artesanos — INDARTE" },
      {
        property: "og:description",
        content: "Artesanos y artesanas de todas las provincias dominicanas.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(artesanosQuery),
  component: Directorio,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 font-serif text-3xl">No pudimos cargar el directorio</h1>
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-10">No hay artesanos.</div>,
});

function Directorio() {
  const { data: artesanos } = useSuspenseQuery(artesanosQuery);
  const [q, setQ] = useState("");
  const [oficio, setOficio] = useState<string>("all");
  const [provincia, setProvincia] = useState<string>("all");

  const oficios = useMemo(
    () =>
      Array.from(
        new Set(artesanos.map((a) => a.oficio).filter(Boolean) as string[]),
      ).sort(),
    [artesanos],
  );
  const provincias = useMemo(
    () =>
      Array.from(
        new Set(artesanos.map((a) => a.provincia).filter(Boolean) as string[]),
      ).sort(),
    [artesanos],
  );

  const filtered = artesanos.filter((a) => {
    if (oficio !== "all" && a.oficio !== oficio) return false;
    if (provincia !== "all" && a.provincia !== provincia) return false;
    if (q) {
      const hay = `${a.nombre} ${a.oficio ?? ""} ${a.provincia ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHero
        eyebrow="Comunidad"
        title="Directorio de Artesanos"
        description="Un registro nacional de las manos que dan forma a la identidad cultural dominicana."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Buscar por nombre, oficio o provincia…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={oficio} onValueChange={setOficio}>
            <SelectTrigger><SelectValue placeholder="Oficio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los oficios</SelectItem>
              {oficios.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={provincia} onValueChange={setProvincia}>
            <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las provincias</SelectItem>
              {provincias.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No encontramos artesanos con esos criterios.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Link
                key={a.id}
                to="/directorio-artesanos/$id"
                params={{ id: a.id }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/50 hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
                  {a.foto_url ? (
                    <img
                      src={a.foto_url}
                      alt={a.nombre}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-primary/40">
                      {a.nombre.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-xl leading-tight">{a.nombre}</h3>
                    {a.disponible && (
                      <Badge variant="secondary" className="shrink-0">Disponible</Badge>
                    )}
                  </div>
                  <div className="text-sm text-primary">{a.oficio ?? "—"}</div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {a.provincia ?? "—"}
                  </div>
                  {a.biografia && (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {a.biografia}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
