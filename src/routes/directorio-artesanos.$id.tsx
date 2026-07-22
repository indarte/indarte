import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MessageCircle, Instagram, Facebook } from "lucide-react";

type ArtesanoDetalle = {
  id: string;
  nombre: string;
  oficio: string | null;
  provincia: string | null;
  biografia: string | null;
  foto_url: string | null;
  disponible: boolean | null;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
};

type GaleriaItem = {
  id: string;
  imagen_url: string;
  descripcion: string | null;
  orden: number | null;
};

const artesanoQuery = (id: string) =>
  queryOptions({
    queryKey: ["artesano", id],
    queryFn: async () => {
      const [{ data: artesano, error: e1 }, { data: galeria, error: e2 }] =
        await Promise.all([
          supabase
            .from("artesanos")
            .select(
              "id,nombre,oficio,provincia,biografia,foto_url,disponible,telefono,whatsapp,instagram,facebook,activo",
            )
            .eq("id", id)
            .maybeSingle(),
          supabase
            .from("artesano_galeria")
            .select("id,imagen_url,descripcion,orden")
            .eq("artesano_id", id)
            .order("orden", { ascending: true }),
        ]);
      if (e1) throw e1;
      if (e2) throw e2;
      if (!artesano || artesano.activo === false) throw notFound();
      return {
        artesano: artesano as ArtesanoDetalle,
        galeria: (galeria ?? []) as GaleriaItem[],
      };
    },
  });

export const Route = createFileRoute("/directorio-artesanos/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(artesanoQuery(params.id)),
  head: ({ loaderData }) => {
    const nombre = loaderData?.artesano.nombre ?? "Artesano";
    const desc =
      loaderData?.artesano.biografia?.slice(0, 160) ??
      "Perfil de artesano registrado en el directorio nacional del INDARTE.";
    return {
      meta: [
        { title: `${nombre} — Directorio de Artesanos INDARTE` },
        { name: "description", content: desc },
        { property: "og:title", content: `${nombre} — INDARTE` },
        { property: "og:description", content: desc },
        ...(loaderData?.artesano.foto_url
          ? [
              { property: "og:image", content: loaderData.artesano.foto_url },
              { name: "twitter:image", content: loaderData.artesano.foto_url },
            ]
          : []),
      ],
    };
  },
  component: PerfilArtesano,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 font-serif text-3xl">No pudimos cargar el perfil</h1>
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 font-serif text-3xl">Artesano no encontrado</h1>
      <Link to="/directorio-artesanos" className="text-primary underline">
        Volver al directorio
      </Link>
    </div>
  ),
});

function PerfilArtesano() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(artesanoQuery(id));
  const { artesano, galeria } = data;

  const contactos = [
    artesano.telefono && {
      icon: Phone,
      label: artesano.telefono,
      href: `tel:${artesano.telefono.replace(/\s/g, "")}`,
    },
    artesano.whatsapp && {
      icon: MessageCircle,
      label: `WhatsApp: ${artesano.whatsapp}`,
      href: `https://wa.me/${artesano.whatsapp.replace(/[^0-9]/g, "")}`,
    },
    artesano.instagram && {
      icon: Instagram,
      label: artesano.instagram,
      href: artesano.instagram.startsWith("http")
        ? artesano.instagram
        : `https://instagram.com/${artesano.instagram.replace(/^@/, "")}`,
    },
    artesano.facebook && {
      icon: Facebook,
      label: artesano.facebook,
      href: artesano.facebook.startsWith("http")
        ? artesano.facebook
        : `https://facebook.com/${artesano.facebook}`,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string }[];

  return (
    <div>
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
          <Link
            to="/directorio-artesanos"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al directorio
          </Link>
          <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-start">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-card">
              {artesano.foto_url ? (
                <img
                  src={artesano.foto_url}
                  alt={artesano.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-6xl text-primary/40">
                  {artesano.nombre.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="mb-3 text-xs font-medium uppercase tracking-widest text-primary">
                {artesano.oficio ?? "Artesano"}
              </div>
              <h1 className="mb-3 font-serif text-4xl lg:text-5xl">
                {artesano.nombre}
              </h1>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {artesano.provincia && <span>{artesano.provincia}</span>}
                {artesano.disponible && (
                  <Badge variant="secondary">Disponible para encargos</Badge>
                )}
              </div>
              {contactos.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {contactos.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:border-primary hover:text-primary"
                    >
                      <c.icon className="h-4 w-4" />
                      <span>{c.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        {artesano.biografia && (
          <div className="mb-14 max-w-3xl">
            <h2 className="mb-4 font-serif text-2xl">Biografía</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/80">
              {artesano.biografia}
            </p>
          </div>
        )}

        {galeria.length > 0 && (
          <div>
            <h2 className="mb-6 font-serif text-2xl">Galería</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galeria.map((g) => (
                <figure
                  key={g.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="aspect-square w-full overflow-hidden bg-secondary">
                    <img
                      src={g.imagen_url}
                      alt={g.descripcion ?? "Obra del artesano"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {g.descripcion && (
                    <figcaption className="p-3 text-sm text-muted-foreground">
                      {g.descripcion}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
