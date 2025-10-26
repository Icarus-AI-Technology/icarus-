import type { ReactNode } from "react";

interface ModulePageProps {
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function ModulePage({ title, description, icon, actions, children }: ModulePageProps) {
  return (
    <section className="flex flex-col gap-8" aria-labelledby="module-page-heading">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--orx-primary)] to-[var(--orx-primary-hover)] text-white shadow-[var(--orx-shadow-light-1),var(--orx-shadow-light-2)]"
          >
            {icon}
          </div>
          <div>
            <h1 id="module-page-heading" className="text-heading-lg font-display text-[var(--orx-text-primary)]">
              {title}
            </h1>
            <p className="max-w-3xl text-[var(--orx-text-secondary)]">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </header>
      <main className="flex flex-col gap-6" role="main">
        {children}
      </main>
    </section>
  );
}
