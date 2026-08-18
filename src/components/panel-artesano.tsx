import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ExternalLink, Images, Trash2, Plus, Palette } from "lucide-react";

type Form = {
  nombre: string;
  oficio: string;
  biografia: string;
  provincia: string;
  telefono: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  disponible: boolean;
};

const EMPTY: Form = {
  nombre: "",
  oficio: "",
  biografia: "",
  provincia: "",
  telefono: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  disponible: true,
};

export function ArtesanoDashboard({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fichaQ = useQuery({
    queryKey: ["av-artesano-ficha", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artesanos")
        .select(
          "id, nombre, oficio, biografia, provincia, telefono, whatsapp, instagram, facebook, disponible",
        )
        .eq("profile_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const ficha = fichaQ.data ?? null;

  useEffect(() => {
    if (ficha) {
      setForm({
        nombre: ficha.nombre ?? "",
        oficio: ficha.oficio ?? "",
        biografia: ficha.biografia ?? "",
        provincia: ficha.provincia ?? "",
        telefono: ficha.telefono ?? "",
        whatsapp: ficha.whatsapp ?? "",
        instagram: ficha.instagram ?? "",
        facebook: ficha.facebook ?? "",
        disponible: ficha.disponible ?? true,
      });
    }
  }, [ficha?.id]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.nombre.trim() || !form.oficio.trim()) {
      toast.error("Nombre y oficio son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        oficio: form.oficio.trim(),
        biografia: form.biografia || null,
        provincia: form.provincia || null,
        telefono: form.telefono || null,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        disponible: form.disponible,
      };
      if (ficha) {
        const { error } = await supabase.from("artesanos").update(payload).eq("id", ficha.id);
        if (error) throw error;
        toast.success("Cambios guardados");
      } else {
        const { error } = await supabase
          .from("artesanos")
          .insert({ ...payload, profile_id: userId, activo: true });
        if (error) throw error;
        toast.success("Ficha creada");
      }
      qc.invalidateQueries({ queryKey: ["av-artesano-ficha", userId] });
    } catch (err: any) {
      toast.error("No se pudo guardar", { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHero
        eyebrow="Aula Virtual"
        title="Mi perfil de artesano"
        description="Actualiza tu ficha del Directorio Nacional de Artesanos y tu galería de obras."
      />
      <section className="mx-auto max-w-4xl space-y-10 px-4 py-14 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
              <Palette className="h-5 w-5 text-primary" />
              {ficha ? "Datos de mi ficha" : "Crear mi ficha"}
            </h2>
            {ficha && (
              <Button asChild size="sm" variant="outline">
                <Link to="/directorio-artesanos/$id" params={{ id: ficha.id }}>
                  Ver mi perfil público <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {fichaQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" id="a-nombre" value={form.nombre} onChange={set("nombre")} required />
              <Field label="Oficio" id="a-oficio" value={form.oficio} onChange={set("oficio")} required />
              <Field label="Provincia" id="a-prov" value={form.provincia} onChange={set("provincia")} />
              <Field label="Teléfono" id="a-tel" value={form.telefono} onChange={set("telefono")} />
              <Field label="WhatsApp" id="a-wa" value={form.whatsapp} onChange={set("whatsapp")} />
              <Field label="Instagram" id="a-ig" value={form.instagram} onChange={set("instagram")} />
              <Field label="Facebook" id="a-fb" value={form.facebook} onChange={set("facebook")} />
              <div className="flex items-center gap-3 sm:pt-6">
                <Switch
                  id="a-disp"
                  checked={form.disponible}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, disponible: v }))}
                />
                <Label htmlFor="a-disp">Disponible para encargos</Label>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="a-bio">Biografía</Label>
                <Textarea
                  id="a-bio"
                  rows={5}
                  value={form.biografia}
                  onChange={(e) => set("biografia")(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando…" : ficha ? "Guardar cambios" : "Crear mi ficha"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {ficha && <Galeria artesanoId={ficha.id} />}
      </section>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Galeria({ artesanoId }: { artesanoId: string }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const key = ["av-artesano-galeria", artesanoId];

  const galeriaQ = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artesano_galeria")
        .select("id, imagen_url, descripcion, orden")
        .eq("artesano_id", artesanoId)
        .order("orden", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fotos = galeriaQ.data ?? [];

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    if (!url.trim()) {
      toast.error("Pega la URL de una imagen");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("artesano_galeria").insert({
        artesano_id: artesanoId,
        imagen_url: url.trim(),
        descripcion: desc || null,
        orden: fotos.length,
      });
      if (error) throw error;
      setUrl("");
      setDesc("");
      toast.success("Foto agregada");
      qc.invalidateQueries({ queryKey: key });
    } catch (err: any) {
      toast.error("No se pudo agregar", { description: err?.message });
    } finally {
      setAdding(false);
    }
  };

  const eliminar = async (id: string) => {
    const { error } = await supabase.from("artesano_galeria").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar", { description: error.message });
      return;
    }
    toast.success("Foto eliminada");
    qc.invalidateQueries({ queryKey: key });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-semibold">
        <Images className="h-5 w-5 text-primary" /> Mi galería
      </h2>

      <form onSubmit={agregar} className="mb-6 grid gap-3 sm:grid-cols-[2fr_2fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="g-url">URL de la imagen</Label>
          <Input
            id="g-url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="g-desc">Descripción (opcional)</Label>
          <Input id="g-desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <Button type="submit" disabled={adding}>
          <Plus className="mr-1 h-4 w-4" /> {adding ? "Agregando…" : "Agregar"}
        </Button>
      </form>

      {fotos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no has agregado fotos de tus obras.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((f: any) => (
            <figure key={f.id} className="overflow-hidden rounded-xl border border-border">
              <div className="aspect-square w-full overflow-hidden bg-secondary">
                <img
                  src={f.imagen_url}
                  alt={f.descripcion ?? "Obra del artesano"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-2 p-3 text-sm">
                <span className="truncate text-muted-foreground">{f.descripcion ?? "Sin descripción"}</span>
                <Button size="icon" variant="ghost" onClick={() => eliminar(f.id)} aria-label="Eliminar foto">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
