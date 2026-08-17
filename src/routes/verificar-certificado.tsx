import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/verificar-certificado")({
  head: () => ({
    meta: [
      { title: "Verificar certificado — INDARTE" },
      {
        name: "description",
        content:
          "Valida la autenticidad de un certificado emitido por el INDARTE ingresando su código de verificación.",
      },
      { property: "og:title", content: "Verificar certificado — INDARTE" },
      {
        property: "og:description",
        content: "Consulta si un certificado del INDARTE es auténtico con su código.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Verificar certificado — INDARTE" },
      {
        name: "twitter:description",
        content: "Consulta si un certificado del INDARTE es auténtico con su código.",
      },
    ],
  }),
  component: VerificarCertificado,
});

const FUNCTION_URL =
  "https://yairwymymtcbuypwnfmq.supabase.co/functions/v1/verificar-certificado";
const ANON_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;

type Resultado =
  | { valido: true; estudiante?: string | null; curso?: string | null; fecha_emision?: string | null }
  | { valido: false };

function VerificarCertificado() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = codigo.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ codigo: value }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok && data?.["valido"] === undefined) {
        throw new Error("respuesta inválida");
      }
      if (data["valido"] === true) {
        setResultado({
          valido: true,
          estudiante:
            (data["estudiante"] as string) ??
            (data["nombre_estudiante"] as string) ??
            (data["full_name"] as string) ??
            null,
          curso: (data["curso"] as string) ?? (data["nombre_curso"] as string) ?? null,
          fecha_emision:
            (data["fecha_emision"] as string) ?? (data["fecha"] as string) ?? null,
        });
      } else {
        setResultado({ valido: false });
      }
    } catch (err) {
      console.error("verificar-certificado error", err);
      setError("No pudimos verificar el certificado en este momento. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const fechaLegible =
    resultado && resultado.valido && resultado.fecha_emision
      ? new Date(resultado.fecha_emision).toLocaleDateString("es-DO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <>
      <PageHero
        title="Verificar certificado"
        subtitle="Ingresa el código de verificación impreso en el certificado para confirmar su autenticidad."
      />

      <section className="container mx-auto max-w-2xl px-4 py-14">
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código del certificado</Label>
            <Input
              id="codigo"
              name="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. INDARTE-2026-000123"
              autoComplete="off"
              required
            />
          </div>
          <Button type="submit" className="mt-5 w-full" disabled={loading || !codigo.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Verificando…
              </>
            ) : (
              "Verificar"
            )}
          </Button>
        </form>

        {error ? (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {resultado?.valido === true ? (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Certificado válido</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Estudiante</dt>
                <dd className="font-medium">{resultado.estudiante ?? "No disponible"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Curso</dt>
                <dd className="font-medium">{resultado.curso ?? "No disponible"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fecha de emisión</dt>
                <dd className="font-medium">{fechaLegible ?? "No disponible"}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {resultado?.valido === false ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border bg-muted/40 p-6">
            <XCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">Código no encontrado</h2>
              <p className="text-sm text-muted-foreground">
                Verifica que el código esté escrito correctamente o comunícate con nosotros.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
