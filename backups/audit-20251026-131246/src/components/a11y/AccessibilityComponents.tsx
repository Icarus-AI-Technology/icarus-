/**
 * Sistema de Acessibilidade
 * ARIA labels, keyboard navigation, focus management
 * WCAG 2.1 AA Compliant
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ============================================
// SKIP TO CONTENT LINK
// ============================================

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:rounded-xl focus:neuro-raised bg-[var(--primary)] text-white"
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.813rem",
        fontWeight: 600,
      }}
    >
      Pular para o conteúdo principal
    </a>
  );
}

// ============================================
// FOCUS TRAP
// ============================================

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => handleTabKey(event);

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// ============================================
// ACCESSIBLE BUTTON
// ============================================

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  ariaLabel?: string;
  loading?: boolean;
}

export function AccessibleButton({
  children,
  variant = "primary",
  ariaLabel,
  loading = false,
  disabled,
  className,
  ...props
}: AccessibleButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      className={cn(
        "px-6 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
        variant === "primary" &&
          "neuro-raised bg-[var(--orx-primary)] text-white hover:neuro-flat",
        variant === "secondary" &&
          "neuro-raised hover:neuro-flat text-[var(--text-primary)]",
        variant === "danger" &&
          "neuro-raised bg-destructive text-white hover:neuro-flat",
        variant === "ghost" &&
          "neuro-flat hover:neuro-raised text-[var(--text-primary)]",
        (disabled || loading) && "neuro-inset opacity-50 cursor-not-allowed",
        className,
      )}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.813rem",
        fontWeight: 600,
      }}
      {...props}
    >
      {loading ? (
        <>
          <span className="sr-only">Carregando...</span>
          <span aria-hidden="true">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================
// ACCESSIBLE INPUT
// ============================================

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export function AccessibleInput({
  label,
  error,
  helpText,
  required,
  id,
  className,
  ...props
}: AccessibleInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-[var(--text-primary)]"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.813rem",
          fontWeight: 600,
        }}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        )}
      </label>

      <input
        id={inputId}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={cn(error && errorId, helpText && helpId)}
        className={cn(
          "w-full px-4 py-3 rounded-xl neuro-inset bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
          error && "border-2 border-destructive",
          className,
        )}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.813rem",
        }}
        {...props}
      />

      {helpText && !error && (
        <p
          id={helpId}
          className="text-[var(--text-secondary)]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.813rem",
          }}
        >
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-destructive"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.813rem",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// LIVE REGION (Announcements)
// ============================================

interface LiveRegionProps {
  message?: string;
  politeness?: "polite" | "assertive" | "off";
}

export function LiveRegion({
  message,
  politeness = "polite",
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// ============================================
// KEYBOARD NAVIGATION HELPER
// ============================================

export function useKeyboardNavigation(
  onEscape?: () => void,
  onEnter?: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
      }
      if (e.key === "Enter" && onEnter) {
        onEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, onEnter]);
}

// ============================================
// EXEMPLO COMPLETO (Formulário Acessível)
// ============================================

export function ExemploFormularioAcessivel() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    // Validação
    if (!nome || !email) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSucesso("Formulário enviado com sucesso!");
      setNome("");
      setEmail("");
    }, 2000);
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--bg-primary)]">
      <SkipToContent />

      <div className="max-w-2xl mx-auto">
        <main id="main-content">
          <h1
            className="text-[var(--text-primary)] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.813rem",
              fontWeight: 700,
            }}
          >
            Formulário Acessível
          </h1>

          <form
            onSubmit={handleSubmit}
            className="neuro-raised rounded-2xl p-6 space-y-6"
            aria-label="Formulário de cadastro"
          >
            <AccessibleInput
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              helpText="Digite seu nome completo"
            />

            <AccessibleInput
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={erro}
              helpText="Usaremos este e-mail para contato"
            />

            <div className="flex gap-4">
              <AccessibleButton
                type="submit"
                variant="primary"
                loading={loading}
                ariaLabel="Enviar formulário"
              >
                {loading ? "Enviando..." : "Enviar"}
              </AccessibleButton>

              <AccessibleButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setNome("");
                  setEmail("");
                  setErro("");
                  setSucesso("");
                }}
                ariaLabel="Limpar formulário"
              >
                Limpar
              </AccessibleButton>
            </div>

            {/* Live Region para anúncios */}
            <LiveRegion message={sucesso || erro} politeness="assertive" />

            {sucesso && (
              <div
                role="alert"
                className="p-4 rounded-xl neuro-inset bg-success/10 text-success"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.813rem",
                }}
              >
                {sucesso}
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
