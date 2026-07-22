import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="INDARTE" className="h-11 w-11 rounded-full object-contain" />
            <div className="font-display text-lg font-semibold">INDARTE</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Instituto Nacional de Arte. Promoviendo la educación artística, la artesanía y la
            cultura en la República Dominicana.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-semibold">Explora</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/quienes-somos" className="hover:text-foreground">Quiénes somos</Link></li>
            <li><Link to="/ejes" className="hover:text-foreground">Ejes de trabajo</Link></li>
            <li><Link to="/directorio-artesanos" className="hover:text-foreground">Directorio de artesanos</Link></li>
            <li><Link to="/biblioteca" className="hover:text-foreground">Biblioteca virtual</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-semibold">Participa</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/cursos" className="hover:text-foreground">Cursos e inscripciones</Link></li>
            <li><Link to="/voluntariado" className="hover:text-foreground">Voluntariado</Link></li>
            <li><Link to="/dona" className="hover:text-foreground">Dona ahora</Link></li>
            <li><Link to="/transparencia" className="hover:text-foreground">Transparencia</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-semibold">Contacto</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Av. Independencia, Santo Domingo, RD</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /> +1 (809) 555-0100</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> info@indarte.gob.do</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row lg:px-8">
          <span>© {new Date().getFullYear()} INDARTE. Todos los derechos reservados.</span>
          <span>Portal institucional</span>
        </div>
      </div>
    </footer>
  );
}
