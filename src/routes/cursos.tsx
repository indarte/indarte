import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Users, Loader2 } from "lucide-react";
import { useQuery, useQueryClient, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getCursosPublicos } from "@/lib/cursos.functions";

type CursoPublico = {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad: string | null;
  cupo_maximo: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  eje: { nombre: string | null; slug: string | null } | null;
};

const cursosQueryOptions = () =>
  queryOptions({
    queryKey: ["cursos-publicos"],
    queryFn: () => getCursosPublicos() as Promise<CursoPublico[]>,
  });

export const Route = createFileRoute("/cursos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(cursosQueryOptions()),
  head: () => ({
    meta: [
      { title: "Cursos e inscripciones — INDARTE" },
      {
        name: "description",
        content:
          "Programación de cursos del INDARTE: artes visuales, música, danza, cerámica y más. Inscripciones abiertas.",
      },
      { property: "og:title", content: "Cursos e inscripciones — INDARTE" },
      {
        property: "og:description",
        content: "Inscríbete en los cursos y talleres del INDARTE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cursos,
});

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatModalidad(modalidad: string | null) {
  if (!modalidad) return "Por definir";
  return modalidad.charAt(0).toUpperCase() + modalidad.slice(1);
}

function Cursos() {
  const { data: cursos } = useSuspenseQuery(cursosQueryOptions());
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const esEstudiante = !!user && role === "estudiante";

  const inscripcionesQ = useQuery({
    queryKey: ["mis-inscripciones", user?.id],
    enabled: esEstudiante,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select("curso_id, estado")
        .eq("estudiante_id", user!.id);
      if (error) throw error;
      return (data ?? []) as { curso_id: string; estado: string }[];
    },
  });

  const inscritos = new Set((inscripcionesQ.data ?? []).map((i) => i.curso_id));

  return (
    <div>
      <PageHero
        eyebrow="Formación"
        title="Cursos e inscripciones"
        description="Descubre nuestra oferta formativa y separa tu cupo. Todos los cursos incluyen certificación."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        {cursos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Próximamente nuevos cursos</h2>
            <p className="mt-2 text-muted-foreground">
              Aún no tenemos cursos activos publicados. Vuelve pronto para conocer la próxima programación.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {cursos.map((curso) => (
              <CursoCard
                key={curso.id}
                curso={curso}
                estaInscrito={inscritos.has(curso.id)}
                esEstudiante={esEstudiante}
                onInscrito={() =>
                  queryClient.invalidateQueries({ queryKey: ["mis-inscripciones", user?.id] })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CursoCard({
  curso,
  estaInscrito,
  esEstudiante,
  onInscrito,
}: {
  curso: CursoPublico;
  estaInscrito: boolean;
  esEstudiante: boolean;
  onInscrito: () => void;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleInscribirme = async () => {
    setIsPending(true);
    const { error } = await supabase.from("inscripciones").insert({
      curso_id: curso.id,
      estudiante_id: (await supabase.auth.getUser()).data.user!.id,
    });
    setIsPending(false);

    if (error) {
      toast.error(error.message || "No pudimos procesar tu inscripción. Intenta de nuevo.");
      return;
    }

    toast.success("Inscripción solicitada. Te notificaremos cuando sea confirmada.");
    onInscrito();
  };

  const fechaInicio = formatDate(curso.fecha_inicio);
  const fechaFin = formatDate(curso.fecha_fin);

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-primary">
            {curso.eje?.nombre ?? "INDARTE"}
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold leading-snug">{curso.nombre}</h3>
        </div>
        <Badge variant={curso.modalidad?.toLowerCase() === "virtual" ? "secondary" : "default"}>
          {formatModalidad(curso.modalidad)}
        </Badge>
      </div>

      {curso.descripcion ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{curso.descripcion}</p>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {fechaInicio ? (
            <span>
              {fechaFin ? `${fechaInicio} — ${fechaFin}` : `Inicio: ${fechaInicio}`}
            </span>
          ) : (
            <span>Fechas por anunciar</span>
          )}
        </li>
        <li className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Cupo: {curso.cupo_maximo ? `${curso.cupo_maximo} personas` : "Sin límite definido"}
        </li>
      </ul>

      <div className="mt-6 flex gap-2">
        {esEstudiante ? (
          estaInscrito ? (
            <Button variant="outline" className="flex-1" disabled>
              Ya inscrito
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleInscribirme} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                "Inscribirme"
              )}
            </Button>
          )
        ) : (
          <Button asChild variant="outline" className="flex-1">
            <Link to="/login" search={{ redirect: "/cursos" }}>
              Inicia sesión para inscribirte
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

import { useState } from "react";
