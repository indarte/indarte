import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — INDARTE" },
      {
        name: "description",
        content:
          "Contáctanos: dirección, teléfono, correo electrónico y formulario para comunicarte con el INDARTE.",
      },
      { property: "og:title", content: "Contacto — INDARTE" },
      { property: "og:description", content: "Escríbenos o visítanos en Santo Domingo." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      nombre: String(fd.get("nombre") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      telefono: String(fd.get("telefono") ?? "").trim() || null,
      asunto: String(fd.get("asunto") ?? "").trim() || null,
      mensaje: String(fd.get("mensaje") ?? "").trim(),
    };
    if (!payload.nombre || !payload.email || !payload.mensaje) {
      toast.error("Completa nombre, correo y mensaje.");
      return;
    }
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("mensajes_contacto").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("No pudimos enviar tu mensaje. Intenta de nuevo.");
      console.error("mensajes_contacto insert error", error);
      return;
    }
    toast.success("Mensaje enviado. Te responderemos pronto.");
    form.reset();
    setSent(true);
  }

  return (
    <div>
      <PageHero eyebrow="Estamos para ti" title="Contacto" />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <InfoRow icon={<MapPin className="h-5 w-5" />} label="Dirección">
            Av. Independencia, Santo Domingo, República Dominicana
          </InfoRow>
          <InfoRow icon={<Phone className="h-5 w-5" />} label="Teléfono">
            +1 (809) 555-0100
          </InfoRow>
          <InfoRow icon={<Mail className="h-5 w-5" />} label="Correo electrónico">
            info@indarte.gob.do
          </InfoRow>
          <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-secondary" />
        </div>
        {sent ? (
          <div className="flex flex-col items-start justify-center gap-4 rounded-2xl border border-border bg-card p-8">
            <div className="text-xs uppercase tracking-widest text-primary">Mensaje recibido</div>
            <h2 className="font-serif text-2xl">¡Gracias por escribirnos!</h2>
            <p className="text-muted-foreground">
              Hemos recibido tu mensaje y te responderemos lo antes posible al correo indicado.
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>
              Enviar otro mensaje
            </Button>
          </div>
        ) : (
          <form className="rounded-2xl border border-border bg-card p-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="c-nombre">Nombre</Label>
                <Input id="c-nombre" name="nombre" required maxLength={120} />
              </div>
              <div>
                <Label htmlFor="c-email">Correo</Label>
                <Input id="c-email" name="email" type="email" required maxLength={255} />
              </div>
              <div>
                <Label htmlFor="c-telefono">Teléfono (opcional)</Label>
                <Input id="c-telefono" name="telefono" type="tel" maxLength={40} />
              </div>
              <div>
                <Label htmlFor="c-asunto">Asunto (opcional)</Label>
                <Input id="c-asunto" name="asunto" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="c-msg">Mensaje</Label>
                <Textarea id="c-msg" name="mensaje" rows={5} required maxLength={2000} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enviando…" : "Enviar mensaje"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 text-foreground">{children}</div>
      </div>
    </div>
  );
}
