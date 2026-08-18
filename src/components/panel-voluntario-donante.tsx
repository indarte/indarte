import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { HandHeart, HeartHandshake } from "lucide-react";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-DO", { dateStyle: "medium" });
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    aprobado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    completada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    archivado: "bg-muted text-muted-foreground",
    cancelada: "bg-muted text-muted-foreground",
    fallida: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${map[estado] ?? "bg-muted text-muted-foreground"}`}>
      {estado}
    </span>
  );
}

export function VoluntarioDashboard({ userId }: { userId: string }) {
  const q = useQuery({
    queryKey: ["av-voluntario", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voluntarios")
        .select("id, area_interes, disponibilidad, experiencia_previa, estado, created_at")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const solicitudes = q.data ?? [];

  return (
    <div>
      <PageHero
        eyebrow="Aula Virtual"
        title="Mi voluntariado"
        description="Consulta el estado de tus postulaciones de voluntariado en el INDARTE."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : solicitudes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <HandHeart className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Aún no tienes postulaciones</h2>
            <p className="mt-2 text-muted-foreground">
              Completa el formulario de voluntariado para sumarte a nuestros programas.
            </p>
            <Button asChild className="mt-6">
              <Link to="/voluntariado">Ir al formulario de voluntariado</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {solicitudes.map((s: any) => (
              <li key={s.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.area_interes}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Disponibilidad: {s.disponibilidad ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Postulación enviada el {formatDate(s.created_at)}
                    </p>
                  </div>
                  <EstadoBadge estado={s.estado} />
                </div>
                {s.experiencia_previa && (
                  <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-sm text-muted-foreground">
                    {s.experiencia_previa}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function DonanteDashboard({ userId }: { userId: string }) {
  const q = useQuery({
    queryKey: ["av-donante", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donaciones")
        .select("id, monto, moneda, tipo, estado, created_at, eje:ejes(nombre)")
        .eq("donante_profile_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const donaciones = q.data ?? [];
  const total = donaciones
    .filter((d: any) => d.estado === "completada")
    .reduce((sum: number, d: any) => sum + Number(d.monto ?? 0), 0);

  return (
    <div>
      <PageHero
        eyebrow="Aula Virtual"
        title="Mis donaciones"
        description="Historial de tus aportes al Instituto Nacional para el Desarrollo del Arte y la Educación."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : donaciones.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <HeartHandshake className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Aún no tienes donaciones registradas</h2>
            <p className="mt-2 text-muted-foreground">
              Tu aporte sostiene los programas educativos y artísticos del INDARTE.
            </p>
            <Button asChild className="mt-6">
              <Link to="/dona">Hacer una donación</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="text-sm text-muted-foreground">Total donado (completadas)</div>
              <div className="mt-1 font-display text-3xl font-semibold text-primary">
                {total.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
              </div>
            </div>
            <ul className="space-y-4">
              {donaciones.map((d: any) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
                >
                  <div>
                    <div className="font-display text-lg font-semibold">
                      {Number(d.monto).toLocaleString("es-DO", {
                        style: "currency",
                        currency: d.moneda || "DOP",
                      })}
                      <span className="ml-2 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                        {d.tipo}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(d.created_at)} · {d.eje?.nombre ?? "Aporte general"}
                    </p>
                  </div>
                  <EstadoBadge estado={d.estado} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
