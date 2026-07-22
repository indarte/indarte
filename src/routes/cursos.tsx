import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cursos } from "@/lib/mock-data";

export const Route = createFileRoute("/cursos")({
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
    ],
  }),
  component: Cursos,
});

function Cursos() {
  return (
    <div>
      <PageHero
        eyebrow="Formación"
        title="Cursos e inscripciones"
        description="Descubre nuestra oferta formativa y separa tu cupo. Todos los cursos incluyen certificación."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {cursos.map((c) => (
            <article
              key={c.titulo}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-semibold leading-snug">{c.titulo}</h3>
                <Badge variant={c.modalidad === "Virtual" ? "secondary" : "default"}>
                  {c.modalidad}
                </Badge>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Duración: {c.duracion}
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Cupo: {c.cupo} personas
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Inicio: {c.inicio}
                </li>
              </ul>
              <div className="mt-6 flex gap-2">
                <Button className="flex-1">Inscribirme</Button>
                <Button variant="outline">Más info</Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
