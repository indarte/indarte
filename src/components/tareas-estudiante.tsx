import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ClipboardList, Download, Upload, CheckCircle2 } from "lucide-react";

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
}

export function TareasEstudianteSection({
  cursoIds,
  userId,
}: {
  cursoIds: string[];
  userId: string;
}) {
  const qc = useQueryClient();

  const tareasQ = useQuery({
    queryKey: ["av-est-tareas", cursoIds.join(",")],
    enabled: cursoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("id, curso_id, titulo, descripcion, fecha_entrega, curso:cursos(nombre)")
        .in("curso_id", cursoIds)
        .order("fecha_entrega", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const tareas = tareasQ.data ?? [];
  const tareaIds = tareas.map((t: any) => t.id);

  const entregasQ = useQuery({
    queryKey: ["av-est-entregas", userId, tareaIds.join(",")],
    enabled: tareaIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entregas")
        .select("id, tarea_id, estado, archivo_url, fecha_entregada, nota, feedback_docente, comentario")
        .eq("estudiante_id", userId)
        .in("tarea_id", tareaIds);
      if (error) throw error;
      return data ?? [];
    },
  });

  const entregas = entregasQ.data ?? [];
  const entregaPorTarea: Record<string, any> = {};
  for (const e of entregas as any[]) entregaPorTarea[e.tarea_id] = e;

  if (cursoIds.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <span className="text-primary"><ClipboardList className="h-5 w-5" /></span>
        Mis tareas
      </h2>
      {tareas.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Aún no hay tareas asignadas en tus cursos.
        </div>
      ) : (
        <ul className="space-y-3">
          {tareas.map((t: any) => (
            <TareaCard
              key={t.id}
              tarea={t}
              entrega={entregaPorTarea[t.id] ?? null}
              userId={userId}
              onSubmitted={() => qc.invalidateQueries({ queryKey: ["av-est-entregas", userId] })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TareaCard({
  tarea,
  entrega,
  userId,
  onSubmitted,
}: {
  tarea: any;
  entrega: any | null;
  userId: string;
  onSubmitted: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [comentario, setComentario] = useState<string>(entrega?.comentario ?? "");
  const [uploading, setUploading] = useState(false);

  const estado = entrega?.estado ?? "pendiente";
  const calificada = estado === "calificada";

  const openArchivo = async () => {
    if (!entrega?.archivo_url) return;
    const { data, error } = await supabase.storage
      .from("entregas")
      .createSignedUrl(entrega.archivo_url, 60 * 10);
    if (error || !data?.signedUrl) {
      toast.error("No se pudo abrir el archivo");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    if (!file && !entrega) {
      toast.error("Selecciona un archivo para entregar");
      return;
    }
    setUploading(true);
    try {
      let archivoPath = entrega?.archivo_url ?? null;
      if (file) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        archivoPath = `${userId}/${tarea.id}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("entregas")
          .upload(archivoPath, file, { upsert: true });
        if (upErr) throw upErr;
      }

      const payload: any = {
        tarea_id: tarea.id,
        estudiante_id: userId,
        archivo_url: archivoPath,
        comentario: comentario || null,
        estado: "entregada",
        fecha_entregada: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase
        .from("entregas")
        .upsert(payload, { onConflict: "tarea_id,estudiante_id" });
      if (upsertErr) throw upsertErr;

      toast.success("Entrega enviada");
      setFile(null);
      onSubmitted();
    } catch (err: any) {
      toast.error("No se pudo enviar", { description: err?.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <li className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-primary">{tarea.curso?.nombre}</div>
          <h3 className="mt-1 font-display text-lg font-semibold">{tarea.titulo}</h3>
          {tarea.descripcion && (
            <p className="mt-1 text-sm text-muted-foreground">{tarea.descripcion}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Entrega: {formatDateTime(tarea.fecha_entrega)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            calificada
              ? "bg-primary/10 text-primary"
              : estado === "entregada"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {estado}
        </span>
      </div>

      {calificada ? (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" /> Calificada
          </div>
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Nota: </span>
            <span className="font-semibold">
              {entrega.nota != null ? Number(entrega.nota).toFixed(2) : "—"}
            </span>
          </div>
          {entrega.feedback_docente && (
            <div className="mt-2 text-sm">
              <div className="text-muted-foreground">Feedback del docente:</div>
              <p className="mt-1 whitespace-pre-wrap">{entrega.feedback_docente}</p>
            </div>
          )}
          {entrega.archivo_url && (
            <Button size="sm" variant="outline" className="mt-3" onClick={openArchivo}>
              <Download className="mr-1 h-4 w-4" /> Ver mi archivo
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-4 space-y-3 border-t border-border pt-4">
          {entrega?.archivo_url && (
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Archivo entregado previamente</span>
              <Button type="button" size="sm" variant="outline" onClick={openArchivo}>
                <Download className="mr-1 h-4 w-4" /> Ver
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`file-${tarea.id}`}>
              {entrega ? "Reemplazar archivo" : "Archivo de entrega"}
            </Label>
            <Input
              id={`file-${tarea.id}`}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`com-${tarea.id}`}>Comentario (opcional)</Label>
            <Textarea
              id={`com-${tarea.id}`}
              rows={2}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" disabled={uploading}>
            <Upload className="mr-1 h-4 w-4" />
            {uploading ? "Enviando…" : entrega ? "Actualizar entrega" : "Enviar entrega"}
          </Button>
        </form>
      )}
    </li>
  );
}
