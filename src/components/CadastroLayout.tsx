import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";
import { PageHeader } from "./PageHeader";
import { Container } from "./Container";

/**
 * CADASTRO PAGE LAYOUT
 * 
 * Template padrão para páginas de cadastro do ICARUS.
 * Aplica OraclusX DS consistentemente com:
 * - PageHeader com icon e descrição
 * - Container centralizado
 * - Cards neumórficos
 * - Seções opcionais
 * 
 * @example
 * <CadastroPageLayout
 *   title="Novo Paciente"
 *   description="Cadastre um novo paciente no sistema"
 *   icon={UserPlus}
 *   backHref="/cadastros"
 *   actions={<Button>Salvar</Button>}
 * >
 *   <CadastroSection
 *     title="Dados Pessoais"
 *     description="Informações básicas"
 *   >
 *     <FormFields />
 *   </CadastroSection>
 * </CadastroPageLayout>
 */

export interface CadastroPageLayoutProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: { label: string; variant?: "default" | "success" | "warning" | "error" | "info" };
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
  maxWidth?: "5xl" | "6xl" | "7xl";
}

export function CadastroPageLayout({
  title,
  description,
  icon,
  badge,
  actions,
  breadcrumbs,
  children,
  maxWidth = "5xl",
}: CadastroPageLayoutProps) {
  return (
    <Container maxWidth={maxWidth} padding="lg" className="orx-animate-fade-in">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        badge={badge}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
      <div className="mt-6 space-y-6">{children}</div>
    </Container>
  );
}

/**
 * CADASTRO SECTION
 * 
 * Seção de formulário com Card neumórfico.
 * Agrupa campos relacionados com título/descrição opcional.
 */

export interface CadastroSectionProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  variant?: "default" | "glass";
}

export function CadastroSection({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  footer,
  variant = "default",
}: CadastroSectionProps) {
  const cardClassName = variant === "glass" ? "orx-glass-card" : "";

  return (
    <Card className={`${cardClassName} ${className} orx-animate-slide-up orx-delay-50`}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-5 w-5 text-[var(--orx-primary)]" />}
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

/**
 * FORM GRID
 * 
 * Grid responsivo para campos de formulário.
 * Adapta de 1 a 4 colunas conforme breakpoints.
 */

export interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export function FormGrid({ columns = 2, children, className = "" }: FormGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return <div className={`grid ${gridClass} gap-4 ${className}`}>{children}</div>;
}

/**
 * FORM ACTIONS
 * 
 * Container para botões de ação do formulário.
 * Alinhamento responsivo (stacked mobile, inline desktop).
 */

export interface FormActionsProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center" | "between";
  className?: string;
}

export function FormActions({ children, align = "right", className = "" }: FormActionsProps) {
  const alignClass = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    between: "justify-between",
  }[align];

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 ${alignClass} ${className} orx-animate-slide-up orx-delay-100`}
    >
      {children}
    </div>
  );
}

