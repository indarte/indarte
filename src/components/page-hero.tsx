import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        {eyebrow && (
          <div className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
