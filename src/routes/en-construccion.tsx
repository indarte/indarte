import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/en-construccion")({
  head: () => ({
    meta: [
      { title: "INDARTE — Sitio en construcción" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnderConstructionPage,
});

function UnderConstructionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <img
        src="/indarte-logo.jpeg"
        alt="INDARTE"
        className="h-24 w-24 rounded-full object-contain"
      />
      <div className="mt-8 text-xs font-medium uppercase tracking-widest text-primary">
        Instituto Nacional para el Desarrollo del Arte y la Educación · República Dominicana
      </div>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
        Sitio en construcción
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
        Estamos preparando el nuevo portal institucional de INDARTE. Muy pronto estará disponible.
      </p>
      <Link
        to="/login"
        className="mt-12 text-xs text-muted-foreground/70 underline-offset-4 transition hover:text-foreground hover:underline"
      >
        Acceso del equipo
      </Link>
    </div>
  );
}
