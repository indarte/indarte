import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
        <form
          className="rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Mensaje enviado. Te responderemos pronto.");
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="c-nombre">Nombre</Label>
              <Input id="c-nombre" required />
            </div>
            <div>
              <Label htmlFor="c-email">Correo</Label>
              <Input id="c-email" type="email" required />
            </div>
            <div>
              <Label htmlFor="c-asunto">Asunto</Label>
              <Input id="c-asunto" required />
            </div>
            <div>
              <Label htmlFor="c-msg">Mensaje</Label>
              <Textarea id="c-msg" rows={5} required />
            </div>
            <Button type="submit" className="w-full">
              Enviar mensaje
            </Button>
          </div>
        </form>
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
