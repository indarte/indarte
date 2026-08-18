import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { HandCoins, HeartHandshake, GraduationCap, Palette, Mail } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  head: () => ({
    meta: [
      { title: "Panel Administrativo — INDARTE" },
      { name: "description", content: "Gestión interna del portal INDARTE: mensajes, voluntariado, donaciones y usuarios." },
      { property: "og:title", content: "Panel Administrativo — INDARTE" },
      { property: "og:description", content: "Gestión interna del portal INDARTE." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const ROLES = [
  "admin",
  "coordinador_eje",
  "docente",
  "supervisor_infotep",
  "estudiante",
  "artesano",
  "voluntario",
  "donante",
  "visitante",
] as const;

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMoney = (n: number, moneda = "DOP") =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: moneda || "DOP" }).format(n);

function AdminPage() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role !== "admin") {
      toast.error("Acceso denegado: esta sección es solo para administradores.");
      navigate({ to: "/", replace: true });
    }
  }, [loading, role, navigate]);

  if (loading || role !== "admin") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Administración"
        title="Panel Administrativo"
        description="Gestiona mensajes, voluntariado, donaciones y roles de usuario del INDARTE."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <Tabs defaultValue="resumen">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
            <TabsTrigger value="voluntariado">Voluntariado</TabsTrigger>
            <TabsTrigger value="donaciones">Donaciones</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios y Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-6"><Resumen /></TabsContent>
          <TabsContent value="mensajes" className="mt-6"><Mensajes /></TabsContent>
          <TabsContent value="voluntariado" className="mt-6"><Voluntariado /></TabsContent>
          <TabsContent value="donaciones" className="mt-6"><Donaciones /></TabsContent>
          <TabsContent value="usuarios" className="mt-6"><Usuarios /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function Card({ title, value, icon: Icon, sub }: { title: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-3 font-display text-3xl font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Resumen() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kpis"],
    queryFn: async () => {
      const [don, vol, est, art, msg] = await Promise.all([
        supabase.from("donaciones").select("monto, moneda").eq("estado", "completada"),
        supabase.from("voluntarios").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "estudiante"),
        supabase.from("artesanos").select("id", { count: "exact", head: true }).eq("activo", true),
        supabase.from("mensajes_contacto").select("id", { count: "exact", head: true }).eq("leido", false),
      ]);
      const total = (don.data ?? []).reduce((s, d) => s + Number(d.monto ?? 0), 0);
      return {
        totalDonado: total,
        cantidadDonaciones: don.data?.length ?? 0,
        voluntariosPendientes: vol.count ?? 0,
        estudiantes: est.count ?? 0,
        artesanos: art.count ?? 0,
        mensajesNoLeidos: msg.count ?? 0,
      };
    },
  });

  if (isLoading || !data) return <p className="text-muted-foreground">Cargando indicadores…</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        title="Donaciones completadas"
        value={fmtMoney(data.totalDonado)}
        sub={`${data.cantidadDonaciones} donación(es)`}
        icon={HandCoins}
      />
      <Card title="Voluntariado pendiente" value={String(data.voluntariosPendientes)} icon={HeartHandshake} />
      <Card title="Estudiantes activos" value={String(data.estudiantes)} icon={GraduationCap} />
      <Card title="Artesanos activos" value={String(data.artesanos)} icon={Palette} />
      <Card title="Mensajes sin leer" value={String(data.mensajesNoLeidos)} icon={Mail} />
    </div>
  );
}

function Mensajes() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "mensajes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mensajes_contacto")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggle = async (id: string, leido: boolean) => {
    const { error } = await supabase.from("mensajes_contacto").update({ leido: !leido }).eq("id", id);
    if (error) return toast.error("No se pudo actualizar el mensaje.");
    toast.success(!leido ? "Marcado como leído." : "Marcado como no leído.");
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando mensajes…</p>;
  if (!data?.length) return <p className="text-muted-foreground">No hay mensajes de contacto.</p>;

  return (
    <div className="space-y-3">
      {data.map((m) => (
        <div
          key={m.id}
          className={`rounded-2xl border p-5 ${m.leido ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{m.nombre}</span>
                {!m.leido && <Badge>Nuevo</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                {m.email}
                {m.telefono ? ` · ${m.telefono}` : ""}
              </div>
              {m.asunto && <div className="mt-2 text-sm font-medium">{m.asunto}</div>}
              <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{m.mensaje}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="text-xs text-muted-foreground">{fmtDate(m.created_at)}</span>
              <Button size="sm" variant="outline" onClick={() => toggle(m.id, m.leido)}>
                {m.leido ? "Marcar no leído" : "Marcar leído"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Voluntariado() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "voluntarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voluntarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setEstado = async (id: string, estado: "pendiente" | "aprobado" | "archivado") => {
    const { error } = await supabase.from("voluntarios").update({ estado }).eq("id", id);
    if (error) return toast.error("No se pudo actualizar la solicitud.");
    toast.success(`Solicitud marcada como ${estado}.`);
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando solicitudes…</p>;
  if (!data?.length) return <p className="text-muted-foreground">No hay solicitudes de voluntariado.</p>;

  return (
    <div className="space-y-3">
      {data.map((v) => (
        <div key={v.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{v.nombre}</span>
                <Badge variant={v.estado === "aprobado" ? "default" : "secondary"}>{v.estado}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{v.email}{v.telefono ? ` · ${v.telefono}` : ""}</div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Área de interés: </span>
                {v.area_interes}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Disponibilidad: </span>
                {v.disponibilidad || "—"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pendiente", "aprobado", "archivado"] as const).map((e) => (
                <Button
                  key={e}
                  size="sm"
                  variant={v.estado === e ? "default" : "outline"}
                  disabled={v.estado === e}
                  onClick={() => setEstado(v.id, e)}
                >
                  {e}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Donaciones() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "donaciones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donaciones")
        .select("id, nombre_donante, monto, moneda, tipo, estado, created_at, eje:ejes(nombre)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Cargando donaciones…</p>;
  if (!data?.length) return <p className="text-muted-foreground">Aún no hay donaciones registradas.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Donante</th>
            <th className="px-4 py-3 font-medium">Monto</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Eje</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3">{d.nombre_donante}</td>
              <td className="px-4 py-3">{fmtMoney(Number(d.monto), d.moneda ?? "DOP")}</td>
              <td className="px-4 py-3">{d.tipo}</td>
              <td className="px-4 py-3">{d.eje?.nombre ?? "General"}</td>
              <td className="px-4 py-3">
                <Badge variant={d.estado === "completada" ? "default" : "secondary"}>{d.estado}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDate(d.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Usuarios() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<{ id: string; email: string; role: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const applyChange = async () => {
    if (!pending) return;
    const { error } = await supabase
      .from("profiles")
      .update({ role: pending.role as (typeof ROLES)[number] })
      .eq("id", pending.id);
    setPending(null);
    if (error) return toast.error("No se pudo cambiar el rol: " + error.message);
    toast.success("Rol actualizado.");
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando usuarios…</p>;
  if (!data?.length) return <p className="text-muted-foreground">No hay usuarios registrados.</p>;

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">{p.email ?? "—"}</td>
                <td className="px-4 py-3">{p.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.created_at)}</td>
                <td className="px-4 py-3">
                  <Select
                    value={p.role}
                    onValueChange={(value) => {
                      if (value !== p.role) setPending({ id: p.id, email: p.email ?? p.id, role: value });
                    }}
                  >
                    <SelectTrigger className="w-[190px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar el rol de este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && (
                <>
                  Se asignará el rol <strong>{pending.role}</strong> a <strong>{pending.email}</strong>. Esto
                  modifica sus permisos de acceso en la plataforma.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={applyChange}>Confirmar cambio</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
