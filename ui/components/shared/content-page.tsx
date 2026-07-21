import type { ReactNode } from "react";

/**
 * Shared shell for static content pages (terms, docs, faqs).
 * Constrains reading width and gives every page one consistent header.
 */
export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-4 md:py-8">
      <header className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {intro && (
          <p className="mt-3 text-base text-muted-foreground max-w-[60ch] leading-relaxed">
            {intro}
          </p>
        )}
      </header>
      {children}
    </div>
  );
}

/** A titled block of prose used inside a ContentPage. */
export function ContentSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
