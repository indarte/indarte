import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClipboardList, FileText, Plus, Download, ChevronDown, ChevronUp } from "lucide-react";

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
}

export function TareasDocenteSection({
  cursos,
  userId,
}: {
  cursos: Array<{ id: string; nombre: string }>;
  userId: string;
}) {
  const cursoIds = cursos.map((c) => c.id);
  const qc = useQueryClient();

  const tareasQ = useQuery({
    queryKey: ["av-doc-tareas", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("id, curso_id, titulo, descripcion, fecha_entrega, created_at")
        .in("curso_id", cursoIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const tareas = tareasQ.data ?? [];
  const tareasPorCurso = tareas.reduce((acc: Record<string, any[]>, t: any) => {
    (acc[t.curso_id] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <span className="text-primary"><ClipboardList className="h-5 w-5" /></span>
        Tareas y entregas
      </h2>
      <div className="space-y-4">
        {cursos.map((c) => (
          <CursoTareasCard
            key={c.id}
            curso={c}
            tareas={tareasPorCurso[c.id] ?? []}
            userId={userId}
            onChanged={() => qc.invalidateQueries({ queryKey: ["av-doc-tareas"] })}
          />
        ))}
      </div>
    </div>
  );
}

function CursoTareasCard({
  curso,
  tareas,
  userId,
  onChanged,
}: {
  curso: { id: string; nombre: string };
  tareas: any[];
  userId: string;
  onChanged: () => void;
}) {
  const [openTareaId, setOpenTareaId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{curso.nombre}</h3>
        <NuevaTareaDialog cursoId={curso.id} userId={userId} onCreated={onChanged} />
      </div>
      {tareas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Aún no has creado tareas para este curso.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {tareas.map((t) => (
            <li key={t.id} className="py-3">
              <button
                onClick={() => setOpenTareaId(openTareaId === t.id ? null : t.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <div className="font-medium">{t.titulo}</div>
                  <div className="text-sm text-muted-foreground">
                    Entrega: {formatDateTime(t.fecha_entrega)}
                  </div>
                </div>
                {openTareaId === t.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {openTareaId === t.id && <EntregasList tareaId={t.id} descripcion={t.descripcion} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NuevaTareaDialog({
  cursoId,
  userId,
  onCreated,
}: {
  cursoId: string;
  userId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const { error } = await supabase.from("tareas").insert({
      curso_id: cursoId,
      titulo,
      descripcion: descripcion || null,
      fecha_entrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : null,
      creado_por: userId,
    });
    setSaving(false);
    if (error) {
      toast.error("No se pudo crear la tarea", { description: error.message });
      return;
    }
    toast.success("Tarea creada");
    setTitulo("");
    setDescripcion("");
    setFechaEntrega("");
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" /> Nueva tarea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t-titulo">Título</Label>
            <Input
              id="t-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-desc">Descripción</Label>
            <Textarea
              id="t-desc"
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-fecha">Fecha de entrega</Label>
            <Input
              id="t-fecha"
              type="datetime-local"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EntregasList({ tareaId, descripcion }: { tareaId: string; descripcion: string | null }) {
  const qc = useQueryClient();
  const entregasQ = useQuery({
    queryKey: ["av-doc-entregas", tareaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entregas")
        .select(
          "id, estado, archivo_url, fecha_entregada, nota, feedback_docente, estudiante:profiles!entregas_estudiante_id_fkey(full_name, email)"
        )
        .eq("tarea_id", tareaId)
        .order("fecha_entregada", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const entregas = entregasQ.data ?? [];

  return (
    <div className="mt-3 rounded-lg bg-muted/40 p-4">
      {descripcion && <p className="mb-3 text-sm text-muted-foreground">{descripcion}</p>}
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4" /> Entregas recibidas ({entregas.length})
      </div>
      {entregas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay entregas.</p>
      ) : (
        <ul className="divide-y divide-border">
          {entregas.map((e: any) => (
            <EntregaRow
              key={e.id}
              entrega={e}
              onCalificada={() => qc.invalidateQueries({ queryKey: ["av-doc-entregas", tareaId] })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EntregaRow({ entrega, onCalificada }: { entrega: any; onCalificada: () => void }) {
  const [nota, setNota] = useState<string>(entrega.nota != null ? String(entrega.nota) : "");
  const [feedback, setFeedback] = useState<string>(entrega.feedback_docente ?? "");
  const [saving, setSaving] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const openFile = async () => {
    if (!entrega.archivo_url) return;
    const { data, error } = await supabase.storage
      .from("entregas")
      .createSignedUrl(entrega.archivo_url, 60 * 10);
    if (error || !data?.signedUrl) {
      toast.error("No se pudo abrir el archivo");
      return;
    }
    setFileUrl(data.signedUrl);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const calificar = async () => {
    if (saving) return;
    const notaNum = Number(nota);
    if (!nota || Number.isNaN(notaNum)) {
      toast.error("Ingresa una nota válida");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("entregas")
      .update({
        nota: notaNum,
        feedback_docente: feedback || null,
        estado: "calificada",
        fecha_calificada: new Date().toISOString(),
      })
      .eq("id", entrega.id);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar", { description: error.message });
      return;
    }
    toast.success("Entrega calificada");
    onCalificada();
  };

  return (
    <li className="space-y-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <div className="font-medium">{entrega.estudiante?.full_name || "—"}</div>
          <div className="text-xs text-muted-foreground">
            Entregada: {entrega.fecha_entregada ? formatDateTime(entrega.fecha_entregada) : "—"} ·{" "}
            <span className={entrega.estado === "calificada" ? "text-primary font-medium" : ""}>
              {entrega.estado}
            </span>
          </div>
        </div>
        {entrega.archivo_url && (
          <Button size="sm" variant="outline" onClick={openFile}>
            <Download className="mr-1 h-4 w-4" /> Ver archivo
          </Button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto] sm:items-start">
        <div>
          <Label className="text-xs">Nota</Label>
          <Input
            type="number"
            step="0.01"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Feedback</Label>
          <Textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <div className="sm:pt-5">
          <Button size="sm" onClick={calificar} disabled={saving}>
            {saving ? "Guardando…" : entrega.estado === "calificada" ? "Actualizar" : "Calificar"}
          </Button>
        </div>
      </div>
    </li>
  );
}
