import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Input } from "@/components/ui/input";
import { artesanos } from "@/lib/mock-data";
import { useState } from "react";

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
  component: Directorio,
});

function Directorio() {
  const [q, setQ] = useState("");
  const filtered = artesanos.filter((a) =>
    (a.nombre + a.oficio + a.provincia).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <PageHero
        eyebrow="Comunidad"
        title="Directorio de Artesanos"
        description="Un registro nacional de las manos que dan forma a la identidad cultural dominicana."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-8 max-w-md">
          <Input
            placeholder="Buscar por nombre, oficio o provincia…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div
              key={a.nombre}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-lg text-primary">
                {a.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-base font-semibold">{a.nombre}</div>
                <div className="text-sm text-primary">{a.oficio}</div>
                <div className="text-xs text-muted-foreground">{a.provincia}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No se encontraron artesanos con ese criterio.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
