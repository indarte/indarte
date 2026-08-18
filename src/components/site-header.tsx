import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/quienes-somos", label: "Quiénes somos" },
  { to: "/ejes", label: "Ejes de trabajo" },
  { to: "/directorio-artesanos", label: "Artesanos" },
  { to: "/biblioteca", label: "Biblioteca" },
  { to: "/aula-virtual", label: "Aula Virtual" },
  { to: "/cursos", label: "Cursos" },
  { to: "/noticias", label: "Noticias" },
  { to: "/transparencia", label: "Transparencia" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, role, signOut } = useAuth();
  const navigate = useNavigate();


  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src="/indarte-logo.jpeg" alt="INDARTE" className="h-12 w-12 shrink-0 rounded-full object-contain" />
          <div className="min-w-0 leading-tight">
            <div className="font-display text-lg font-semibold text-foreground">INDARTE</div>
            <div className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              Instituto para el Desarrollo de las Artes y la Educación
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm text-foreground/80 transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {role === "admin" && (
            <Link
              to="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium text-primary transition hover:bg-secondary"
              activeProps={{ className: "bg-secondary" }}
            >
              Panel Admin
            </Link>
          )}
        </nav>


        <div className="flex items-center gap-2">
          {session ? (
            <Button size="sm" variant="outline" onClick={handleSignOut} className="hidden sm:inline-flex">
              <LogOut className="mr-1 h-4 w-4" /> Cerrar sesión
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to="/login">
                <LogIn className="mr-1 h-4 w-4" /> Ingresar
              </Link>
            </Button>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/dona">Dona ahora</Link>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border xl:hidden"
            aria-label="Abrir menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 lg:px-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {session ? (
              <button
                onClick={handleSignOut}
                className="mt-2 rounded-md border border-border px-3 py-2.5 text-left text-sm text-foreground/80 hover:bg-secondary"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-md border border-border px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary"
              >
                Ingresar
              </Link>
            )}
            <Link
              to="/dona"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Dona ahora
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
