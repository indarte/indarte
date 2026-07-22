import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { GraduationCap, PlayCircle, FileText, Calendar, Video, Download, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/aula-virtual")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [
      { title: "Aula Virtual — INDARTE" },
      {
        name: "description",
        content:
          "Espacio de aprendizaje en línea para estudiantes del INDARTE. Accede a tus cursos, materiales y evaluaciones.",
      },
      { property: "og:title", content: "Aula Virtual — INDARTE" },
      { property: "og:description", content: "Plataforma de aprendizaje del INDARTE." },
    ],
  }),
  component: AulaVirtual,
});

function AulaVirtual() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (role === "visitante" || role === null) {
    return (
      <div>
        <PageHero eyebrow="Aula Virtual" title="Cuenta en revisión" description="" />
        <section className="mx-auto max-w-2xl px-4 py-14 text-center lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-semibold">Tu cuenta aún no tiene un rol asignado</h2>
            <p className="mt-3 text-muted-foreground">
              Contacta al administrador del INDARTE para que active tu perfil y puedas acceder al contenido del
              Aula Virtual.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link to="/contacto">Contactar al administrador</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return <StudentDashboard userId={user!.id} />;
}

function StudentDashboard({ userId }: { userId: string }) {
  const inscripcionesQ = useQuery({
    queryKey: ["av-inscripciones", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select("id, estado, fecha_inscripcion, curso:cursos(id, nombre, fecha_inicio, fecha_fin, eje:ejes(nombre, slug))")
        .eq("estudiante_id", userId)
        .eq("estado", "confirmada");
      if (error) throw error;
      return data ?? [];
    },
  });

  const cursoIds = (inscripcionesQ.data ?? []).map((i: any) => i.curso?.id).filter(Boolean) as string[];

  const clasesQ = useQuery({
    queryKey: ["av-clases", userId, cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clases")
        .select("id, titulo, fecha, link_videoconferencia, curso:cursos(nombre)")
        .in("curso_id", cursoIds)
        .gte("fecha", new Date().toISOString())
        .order("fecha", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const calificacionesQ = useQuery({
    queryKey: ["av-calificaciones", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calificaciones")
        .select("id, concepto, nota, created_at, curso:cursos(nombre)")
        .eq("estudiante_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const certificadosQ = useQuery({
    queryKey: ["av-certificados", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificados")
        .select("id, codigo_verificacion, fecha_emision, url_pdf, curso:cursos(nombre)")
        .eq("estudiante_id", userId)
        .order("fecha_emision", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const inscripciones = inscripcionesQ.data ?? [];
  const clases = clasesQ.data ?? [];
  const calificaciones = calificacionesQ.data ?? [];
  const certificados = certificadosQ.data ?? [];

  const califsPorCurso = calificaciones.reduce((acc: Record<string, any[]>, c: any) => {
    const key = c.curso?.nombre ?? "Sin curso";
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  const noInscripciones = !inscripcionesQ.isLoading && inscripciones.length === 0;

  return (
    <div>
      <PageHero
        eyebrow="Plataforma educativa"
        title="Aula Virtual"
        description="Bienvenido/a a tu espacio de aprendizaje. Continúa donde lo dejaste."
      />
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<PlayCircle className="h-6 w-6" />} title="Mis cursos activos" value={String(inscripciones.length)} />
          <StatCard icon={<Calendar className="h-6 w-6" />} title="Próximas clases" value={String(clases.length)} />
          <StatCard icon={<Award className="h-6 w-6" />} title="Certificados" value={String(certificados.length)} />
        </div>

        {noInscripciones ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Aún no tienes cursos inscritos</h2>
            <p className="mt-2 text-muted-foreground">
              Explora nuestro catálogo y encuentra un curso que te interese para comenzar tu aprendizaje.
            </p>
            <Button asChild className="mt-6">
              <Link to="/cursos">Explorar cursos</Link>
            </Button>
          </div>
        ) : (
          <>
            <Section title="Mis cursos activos" icon={<PlayCircle className="h-5 w-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                {inscripciones.map((i: any) => (
                  <div key={i.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="text-xs uppercase tracking-wide text-primary">{i.curso?.eje?.nombre ?? "—"}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{i.curso?.nombre}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(i.curso?.fecha_inicio)} — {formatDate(i.curso?.fecha_fin)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Próximas clases" icon={<Calendar className="h-5 w-5" />}>
              {clases.length === 0 ? (
                <EmptyRow text="No tienes clases próximas programadas." />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                  {clases.map((c: any) => (
                    <li key={c.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{c.titulo}</div>
                        <div className="text-sm text-muted-foreground">
                          {c.curso?.nombre} · {formatDateTime(c.fecha)}
                        </div>
                      </div>
                      {c.link_videoconferencia ? (
                        <Button asChild size="sm" variant="outline">
                          <a href={c.link_videoconferencia} target="_blank" rel="noreferrer">
                            <Video className="mr-2 h-4 w-4" /> Unirse
                          </a>
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Calificaciones" icon={<FileText className="h-5 w-5" />}>
              {calificaciones.length === 0 ? (
                <EmptyRow text="Aún no tienes calificaciones registradas." />
              ) : (
                <div className="space-y-4">
                  {Object.entries(califsPorCurso).map(([curso, items]) => (
                    <div key={curso} className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-display text-lg font-semibold">{curso}</h3>
                      <ul className="mt-3 divide-y divide-border">
                        {items.map((c: any) => (
                          <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                            <span>{c.concepto}</span>
                            <span className="font-semibold">{Number(c.nota).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Certificados" icon={<Award className="h-5 w-5" />}>
              {certificados.length === 0 ? (
                <EmptyRow text="Aún no tienes certificados emitidos." />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                  {certificados.map((c: any) => (
                    <li key={c.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{c.curso?.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          Emitido el {formatDate(c.fecha_emision)} · Código: <span className="font-mono">{c.codigo_verificacion}</span>
                        </div>
                      </div>
                      {c.url_pdf ? (
                        <Button asChild size="sm" variant="outline">
                          <a href={c.url_pdf} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Descargar
                          </a>
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">{icon}</div>
      <div className="mt-4 text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">{text}</div>;
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-DO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
