import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AREAS = [
  { value: "educacion_artistica", label: "Educación Artística" },
  { value: "primera_infancia", label: "Atención a la Primera Infancia" },
  { value: "capacitacion_tecnica", label: "Capacitación Técnico Profesional" },
  { value: "artesania", label: "Fomento y Desarrollo Artesanal" },
  { value: "administrativo", label: "Apoyo Administrativo" },
  { value: "eventos", label: "Producción de Eventos" },
];

const EMPTY = {
  nombre: "",
  email: "",
  telefono: "",
  area_interes: "",
  experiencia_previa: "",
};


export const Route = createFileRoute("/voluntariado")({
  head: () => ({
    meta: [
      { title: "Voluntariado — INDARTE" },
      {
        name: "description",
        content:
          "Súmate como voluntario o voluntaria al INDARTE y aporta tu talento en programas educativos y artísticos.",
      },
      { property: "og:title", content: "Voluntariado — INDARTE" },
      {
        property: "og:description",
        content: "Aporta tu tiempo y talento a la cultura dominicana.",
      },
    ],
  }),
  component: Voluntariado,
});

function Voluntariado() {
  return (
    <div>
      <PageHero
        eyebrow="Súmate"
        title="Voluntariado"
        description="Comparte tu tiempo, talento y experiencia con las comunidades que acompañamos."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-semibold">¿Cómo participar?</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Apoyo en talleres y actividades comunitarias</li>
            <li>• Registro y documentación de artesanos</li>
            <li>• Producción de eventos culturales</li>
            <li>• Traducción y sistematización de materiales</li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Nuestro equipo se comunicará contigo para presentarte los programas activos según tu
            perfil y disponibilidad.
          </p>
        </div>
        <form
          className="rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("¡Gracias por postularte! Te contactaremos pronto.");
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="v-nombre">Nombre completo</Label>
              <Input id="v-nombre" required />
            </div>
            <div>
              <Label htmlFor="v-email">Correo electrónico</Label>
              <Input id="v-email" type="email" required />
            </div>
            <div>
              <Label htmlFor="v-tel">Teléfono</Label>
              <Input id="v-tel" />
            </div>
            <div>
              <Label htmlFor="v-msg">¿Por qué quieres ser voluntario?</Label>
              <Textarea id="v-msg" rows={4} />
            </div>
            <Button type="submit" className="w-full">
              Enviar postulación
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
