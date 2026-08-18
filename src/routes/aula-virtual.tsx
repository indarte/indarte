import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { GraduationCap, PlayCircle, FileText, Calendar, Video, Download, Award, Eye, ClipboardList, Layers, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { TareasDocenteSection } from "@/components/tareas-docente";
import { TareasEstudianteSection } from "@/components/tareas-estudiante";
import { ArtesanoDashboard } from "@/components/panel-artesano";
import { VoluntarioDashboard, DonanteDashboard } from "@/components/panel-voluntario-donante";

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

  if (role === "docente") {
    return <DocenteDashboard userId={user!.id} />;
  }

  if (role === "supervisor_infotep") {
    return <SupervisorDashboard />;
  }

  if (role === "coordinador_eje") {
    return <CoordinadorDashboard userId={user!.id} />;
  }

  if (role === "artesano") {
    return <ArtesanoDashboard userId={user!.id} />;
  }

  if (role === "voluntario") {
    return <VoluntarioDashboard userId={user!.id} />;
  }

  if (role === "donante") {
    return <DonanteDashboard userId={user!.id} />;
  }

  return <StudentDashboard userId={user!.id} />;
}

function CoordinadorDashboard({ userId }: { userId: string }) {
  const ejesQ = useQuery({
    queryKey: ["av-coord-ejes", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coordinadores_eje")
        .select("eje:ejes(id, nombre, slug)")
        .eq("profile_id", userId);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.eje).filter(Boolean);
    },
  });

  const ejes = ejesQ.data ?? [];
  const ejeIds = ejes.map((e: any) => e.id);

  const cursosQ = useQuery({
    queryKey: ["av-coord-cursos", ejeIds.join(",")],
    enabled: ejeIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("id, nombre, fecha_inicio, fecha_fin, eje_id, eje:ejes(nombre)")
        .in("eje_id", ejeIds)
        .order("fecha_inicio", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const cursos = cursosQ.data ?? [];
  const cursoIds = cursos.map((c: any) => c.id);

  const docentesQ = useQuery({
    queryKey: ["av-coord-docentes", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curso_docentes")
        .select("curso_id, docente:profiles!curso_docentes_docente_id_fkey(full_name)")
        .in("curso_id", cursoIds);
      if (error) throw error;
      return data ?? [];
    },
  });

  const inscripcionesQ = useQuery({
    queryKey: ["av-coord-inscripciones", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select("id, curso_id")
        .in("curso_id", cursoIds)
        .eq("estado", "confirmada");
      if (error) throw error;
      return data ?? [];
    },
  });

  const recursosQ = useQuery({
    queryKey: ["av-coord-recursos", ejeIds.join(",")],
    enabled: ejeIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recursos_biblioteca")
        .select("id, titulo, tipo, nivel, eje_id, archivo_url, created_at")
        .in("eje_id", ejeIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const docentes = docentesQ.data ?? [];
  const inscripciones = inscripcionesQ.data ?? [];
  const recursos = recursosQ.data ?? [];

  const docentesPorCurso = docentes.reduce((acc: Record<string, string[]>, d: any) => {
    const n = d.docente?.full_name;
    if (!n) return acc;
    (acc[d.curso_id] ||= []).push(n);
    return acc;
  }, {});

  const inscPorCurso = inscripciones.reduce((acc: Record<string, number>, i: any) => {
    acc[i.curso_id] = (acc[i.curso_id] ?? 0) + 1;
    return acc;
  }, {});

  const ejeNombre = (id: string | null) => ejes.find((e: any) => e.id === id)?.nombre ?? "—";
  const sinEjes = !ejesQ.isLoading && ejes.length === 0;

  return (
    <div>
      <PageHero
        eyebrow="Coordinación de eje"
        title="Aula Virtual"
        description="Gestiona los cursos, docentes y recursos de tu(s) eje(s) de trabajo."
      />
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<Layers className="h-6 w-6" />} title="Ejes asignados" value={String(ejes.length)} />
          <StatCard icon={<PlayCircle className="h-6 w-6" />} title="Cursos del eje" value={String(cursos.length)} />
          <StatCard icon={<GraduationCap className="h-6 w-6" />} title="Estudiantes inscritos" value={String(inscripciones.length)} />
        </div>

        {sinEjes ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Aún no tienes ejes asignados</h2>
            <p className="mt-2 text-muted-foreground">
              Contacta al administrador para que te asigne uno o más ejes de trabajo.
            </p>
          </div>
        ) : (
          <>
            <Section title="Mi(s) eje(s)" icon={<Layers className="h-5 w-5" />}>
              <div className="flex flex-wrap gap-2">
                {ejes.map((e: any) => (
                  <span key={e.id} className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    {e.nombre}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Cursos del eje" icon={<PlayCircle className="h-5 w-5" />}>
              {cursos.length === 0 ? (
                <EmptyRow text="Aún no hay cursos registrados en tu(s) eje(s)." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {cursos.map((c: any) => {
                    const docs = docentesPorCurso[c.id] ?? [];
                    return (
                      <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="text-xs uppercase tracking-wide text-primary">{c.eje?.nombre ?? ejeNombre(c.eje_id)}</div>
                        <h3 className="mt-1 font-display text-lg font-semibold">{c.nombre}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatDate(c.fecha_inicio)} — {formatDate(c.fecha_fin)}
                        </p>
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">Docente(s): </span>
                          <span className="font-medium">{docs.length > 0 ? docs.join(", ") : "Sin asignar"}</span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="text-muted-foreground">Inscritos: </span>
                          <span className="font-medium">{inscPorCurso[c.id] ?? 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            <Section title="Recursos de biblioteca de mi eje" icon={<BookOpen className="h-5 w-5" />}>
              {recursos.length === 0 ? (
                <EmptyRow text="Aún no hay recursos publicados en tu(s) eje(s)." />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                  {recursos.map((r: any) => (
                    <li key={r.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{r.titulo}</div>
                        <div className="text-sm text-muted-foreground">
                          {ejeNombre(r.eje_id)} · {r.tipo}{r.nivel ? ` · ${r.nivel}` : ""}
                        </div>
                      </div>
                      {r.archivo_url ? (
                        <Button asChild size="sm" variant="outline">
                          <a href={r.archivo_url} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Ver
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

function SupervisorDashboard() {
  const cursosQ = useQuery({
    queryKey: ["av-sup-cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("id, nombre, fecha_inicio, fecha_fin, eje:ejes!inner(nombre, slug)")
        .eq("eje.slug", "capacitacion-tecnica")
        .order("fecha_inicio", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const cursos = cursosQ.data ?? [];
  const cursoIds = cursos.map((c: any) => c.id);

  const inscripcionesQ = useQuery({
    queryKey: ["av-sup-inscripciones", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select("id, curso_id, estudiante:profiles(id, full_name, email)")
        .in("curso_id", cursoIds)
        .eq("estado", "confirmada");
      if (error) throw error;
      return data ?? [];
    },
  });

  const asistenciaQ = useQuery({
    queryKey: ["av-sup-asistencia", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asistencia")
        .select("id, presente, clase:clases!inner(id, titulo, fecha, curso_id), estudiante:profiles!asistencia_estudiante_id_fkey(full_name)")
        .in("clase.curso_id", cursoIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const calificacionesQ = useQuery({
    queryKey: ["av-sup-calificaciones", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calificaciones")
        .select("id, concepto, nota, curso_id, curso:cursos(nombre), estudiante:profiles!calificaciones_estudiante_id_fkey(full_name)")
        .in("curso_id", cursoIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const inscripciones = inscripcionesQ.data ?? [];
  const asistencia = asistenciaQ.data ?? [];
  const calificaciones = calificacionesQ.data ?? [];

  const inscPorCurso = inscripciones.reduce((acc: Record<string, any[]>, i: any) => {
    (acc[i.curso_id] ||= []).push(i);
    return acc;
  }, {});

  const asistPorClase = asistencia.reduce((acc: Record<string, { clase: any; items: any[] }>, a: any) => {
    if (!a.clase) return acc;
    const k = a.clase.id;
    if (!acc[k]) acc[k] = { clase: a.clase, items: [] };
    acc[k].items.push(a);
    return acc;
  }, {});

  const califPorCurso = calificaciones.reduce((acc: Record<string, { nombre: string; items: any[] }>, c: any) => {
    const k = c.curso_id;
    if (!acc[k]) acc[k] = { nombre: c.curso?.nombre ?? "—", items: [] };
    acc[k].items.push(c);
    return acc;
  }, {});

  const sinCursos = !cursosQ.isLoading && cursos.length === 0;

  return (
    <div>
      <PageHero
        eyebrow="Supervisión INFOTEP"
        title="Aula Virtual"
        description="Vista de auditoría para cursos de Capacitación Técnico Profesional."
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Eye className="h-4 w-4" />
          Modo supervisión — solo lectura
        </div>
      </PageHero>
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<PlayCircle className="h-6 w-6" />} title="Cursos técnicos" value={String(cursos.length)} />
          <StatCard icon={<GraduationCap className="h-6 w-6" />} title="Estudiantes inscritos" value={String(inscripciones.length)} />
          <StatCard icon={<ClipboardList className="h-6 w-6" />} title="Registros de asistencia" value={String(asistencia.length)} />
        </div>

        {sinCursos ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">No hay cursos técnicos registrados</h2>
            <p className="mt-2 text-muted-foreground">
              Cuando se creen cursos bajo el eje de Capacitación Técnico Profesional, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <Section title="Cursos de Capacitación Técnico Profesional" icon={<PlayCircle className="h-5 w-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                {cursos.map((c: any) => (
                  <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="text-xs uppercase tracking-wide text-primary">{c.eje?.nombre ?? "—"}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{c.nombre}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(c.fecha_inicio)} — {formatDate(c.fecha_fin)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Avance por curso" icon={<GraduationCap className="h-5 w-5" />}>
              <div className="space-y-4">
                {cursos.map((c: any) => {
                  const items = inscPorCurso[c.id] ?? [];
                  return (
                    <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold">{c.nombre}</h3>
                        <span className="text-sm text-muted-foreground">
                          {items.length} estudiante{items.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {items.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">Sin estudiantes inscritos aún.</p>
                      ) : (
                        <ul className="mt-3 divide-y divide-border">
                          {items.map((i: any) => (
                            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
                              <span>{i.estudiante?.full_name || "—"}</span>
                              <span className="text-muted-foreground">{i.estudiante?.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Asistencia por clase" icon={<ClipboardList className="h-5 w-5" />}>
              {Object.keys(asistPorClase).length === 0 ? (
                <EmptyRow text="Aún no hay registros de asistencia." />
              ) : (
                <div className="space-y-4">
                  {Object.values(asistPorClase).map(({ clase, items }) => (
                    <div key={clase.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold">{clase.titulo}</h3>
                        <span className="text-sm text-muted-foreground">{formatDateTime(clase.fecha)}</span>
                      </div>
                      <ul className="mt-3 divide-y divide-border">
                        {items.map((a: any) => (
                          <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                            <span>{a.estudiante?.full_name || "—"}</span>
                            <span className={a.presente ? "text-primary font-medium" : "text-muted-foreground"}>
                              {a.presente ? "Presente" : "Ausente"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Calificaciones" icon={<FileText className="h-5 w-5" />}>
              {calificaciones.length === 0 ? (
                <EmptyRow text="Aún no hay calificaciones registradas." />
              ) : (
                <div className="space-y-4">
                  {Object.values(califPorCurso).map((grp) => (
                    <div key={grp.nombre} className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-display text-lg font-semibold">{grp.nombre}</h3>
                      <ul className="mt-3 divide-y divide-border">
                        {grp.items.map((c: any) => (
                          <li key={c.id} className="grid grid-cols-3 items-center gap-2 py-2 text-sm">
                            <span>{c.estudiante?.full_name || "—"}</span>
                            <span className="text-muted-foreground">{c.concepto}</span>
                            <span className="text-right font-semibold">{Number(c.nota).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </section>
    </div>
  );
}

function DocenteDashboard({ userId }: { userId: string }) {
  const cursosQ = useQuery({
    queryKey: ["av-doc-cursos", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curso_docentes")
        .select("curso:cursos(id, nombre, fecha_inicio, fecha_fin, eje:ejes(nombre, slug))")
        .eq("docente_id", userId);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.curso).filter(Boolean);
    },
  });

  const cursos = cursosQ.data ?? [];
  const cursoIds = cursos.map((c: any) => c.id);

  const estudiantesQ = useQuery({
    queryKey: ["av-doc-estudiantes", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select("id, curso_id, estudiante:profiles(full_name, email)")
        .in("curso_id", cursoIds)
        .eq("estado", "confirmada");
      if (error) throw error;
      return data ?? [];
    },
  });

  const clasesQ = useQuery({
    queryKey: ["av-doc-clases", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clases")
        .select("id, titulo, fecha, link_videoconferencia, curso:cursos(nombre)")
        .eq("docente_id", userId)
        .gte("fecha", new Date().toISOString())
        .order("fecha", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const clases = clasesQ.data ?? [];
  const estudiantes = estudiantesQ.data ?? [];
  const porCurso = estudiantes.reduce((acc: Record<string, any[]>, e: any) => {
    (acc[e.curso_id] ||= []).push(e);
    return acc;
  }, {});

  const totalEst = estudiantes.length;
  const sinCursos = !cursosQ.isLoading && cursos.length === 0;

  return (
    <div>
      <PageHero
        eyebrow="Panel docente"
        title="Aula Virtual"
        description="Gestiona tus cursos, estudiantes y clases programadas."
      />
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard icon={<PlayCircle className="h-6 w-6" />} title="Cursos asignados" value={String(cursos.length)} />
          <StatCard icon={<GraduationCap className="h-6 w-6" />} title="Estudiantes inscritos" value={String(totalEst)} />
          <StatCard icon={<Calendar className="h-6 w-6" />} title="Próximas clases" value={String(clases.length)} />
        </div>

        {sinCursos ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Aún no tienes cursos asignados</h2>
            <p className="mt-2 text-muted-foreground">
              Cuando el coordinador te asigne un curso, aparecerá aquí junto con tus estudiantes y clases.
            </p>
          </div>
        ) : (
          <>
            <Section title="Mis cursos asignados" icon={<PlayCircle className="h-5 w-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                {cursos.map((c: any) => (
                  <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="text-xs uppercase tracking-wide text-primary">{c.eje?.nombre ?? "—"}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{c.nombre}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(c.fecha_inicio)} — {formatDate(c.fecha_fin)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Estudiantes por curso" icon={<GraduationCap className="h-5 w-5" />}>
              <div className="space-y-4">
                {cursos.map((c: any) => {
                  const items = porCurso[c.id] ?? [];
                  return (
                    <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold">{c.nombre}</h3>
                        <span className="text-sm text-muted-foreground">{items.length} estudiante{items.length === 1 ? "" : "s"}</span>
                      </div>
                      {items.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">Sin estudiantes inscritos aún.</p>
                      ) : (
                        <ul className="mt-3 divide-y divide-border">
                          {items.map((i: any) => (
                            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
                              <span>{i.estudiante?.full_name || "—"}</span>
                              <span className="text-muted-foreground">{i.estudiante?.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Mis próximas clases" icon={<Calendar className="h-5 w-5" />}>
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

            <TareasDocenteSection cursos={cursos} userId={userId} />
          </>
        )}
      </section>
    </div>
  );
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

            <TareasEstudianteSection cursoIds={cursoIds} userId={userId} />


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
