/**
 * OraclusX Forms - Components Index
 * Componentes de formulário reutilizáveis
 */

import React from 'react';
import { Button } from '@/components/oraclusx-ds/Button';
import { NeumoInput } from '../oraclusx-ds/NeumoInput';
import { Select } from '../oraclusx-ds/Select';
import { cn } from '@/lib/utils';

// Re-exportar componentes do design system com nomes consistentes
export { NeumoInput as NeuInput };
export { Select as NeuSelect };

/**
 * FormTemplate - Wrapper para formulários
 */
export interface FormSection {
  id: string;
  titulo: string;
  descricao?: string;
  icon?: React.ReactNode;
  campos: React.ReactNode;
  actions?: React.ReactNode;
}

export interface FormTemplateProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children?: React.ReactNode;
  titulo?: string;
  subtitulo?: string;
  ajudaBadgeCount?: number;
  textoSubmit?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  secoes?: FormSection[];
  footerContent?: React.ReactNode;
}

export const FormTemplate: React.FC<FormTemplateProps> = ({
  children,
  onSubmit,
  className,
  titulo,
  subtitulo,
  ajudaBadgeCount,
  textoSubmit = 'Salvar',
  isSubmitting,
  onCancel,
  secoes,
  footerContent,
  ...rest
}) => {
  const showHeader = titulo || subtitulo || typeof ajudaBadgeCount === 'number';
  const showFooter = footerContent || onCancel || typeof onSubmit === 'function';

  return (
    <form onSubmit={onSubmit} className={cn('space-y-8', className)} {...rest}>
      {showHeader && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {titulo && <h1 className="text-2xl font-semibold text-white">{titulo}</h1>}
            {subtitulo && <p className="text-slate-400 mt-1">{subtitulo}</p>}
          </div>
          {typeof ajudaBadgeCount === 'number' && (
            <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80">
              {ajudaBadgeCount}
            </span>
          )}
        </div>
      )}

      {secoes?.map((secao) => (
        <section
          key={secao.id}
          className="rounded-2xl border border-white/10 bg-[#15192b]/70 p-6 shadow-[0_0_25px_rgba(15,23,42,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              {secao.icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-cyan-300">
                  {secao.icon}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-white">{secao.titulo}</h2>
                {secao.descricao && <p className="text-sm text-slate-400">{secao.descricao}</p>}
              </div>
            </div>
            {secao.actions}
          </div>
          <div className="mt-6">{secao.campos}</div>
        </section>
      ))}

      {children}

      {showFooter && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {footerContent}
          {onCancel && (
            <Button type="button" variant="light" color="default" onPress={onCancel} className="min-w-[120px]">
              Cancelar
            </Button>
          )}
          {typeof onSubmit === 'function' && (
            <Button color="primary" type="submit" className="min-w-[140px]" isLoading={isSubmitting}>
              {isSubmitting ? 'Salvando...' : textoSubmit}
            </Button>
          )}
        </div>
      )}
    </form>
  );
};

/**
 * FormField - Container para campo de formulário
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  helpText?: React.ReactNode;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className,
  label,
  error,
  required,
  helpText,
  htmlFor,
  id,
  ...rest
}) => {
  const targetId = htmlFor ?? (typeof id === 'string' ? id : undefined);
  const hasError = Boolean(error);

  return (
    <div className={cn('w-full', className)} id={id} {...rest}>
      {label && (
        <label
          htmlFor={targetId}
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {children}
      {hasError ? (
        <p className="mt-1.5 text-sm text-danger" role="alert">
          {typeof error === 'string' ? error : 'Campo inválido'}
        </p>
      ) : (
        helpText && <p className="mt-1.5 text-xs text-slate-400">{helpText}</p>
      )}
    </div>
  );
};

/**
 * NeuTextarea - Textarea neumórfico
 */
export interface NeuTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const NeuTextarea = React.forwardRef<HTMLTextAreaElement, NeuTextareaProps>(
  ({ label, error, hint, className, required, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return React.createElement(
      'div',
      { className: 'w-full' },
      label &&
        React.createElement(
          'label',
          {
            htmlFor: textareaId,
            className: 'block text-sm font-medium text-primary mb-2',
          },
          label,
          required && React.createElement('span', { className: 'text-danger ml-1' }, '*')
        ),
      React.createElement('textarea', {
        ref,
        id: textareaId,
        className: cn(
          'w-full rounded-lg px-4 py-3',
          'bg-surface text-primary placeholder:text-muted',
          'border border-border',
          'transition-all duration-200',
          'shadow-neumo-sm-inset focus:shadow-neumo-inset',
          'focus:outline-none focus:ring-3 focus:ring-primary/20',
          hasError && 'border-danger focus:ring-danger/20',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        ),
        'aria-invalid': hasError,
        'aria-describedby': error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined,
        ...props,
      }),
      error &&
        React.createElement(
          'p',
          {
            id: `${textareaId}-error`,
            className: 'mt-1.5 text-sm text-danger',
            role: 'alert',
          },
          error
        ),
      hint &&
        !error &&
        React.createElement(
          'p',
          {
            id: `${textareaId}-hint`,
            className: 'mt-1.5 text-sm text-muted',
          },
          hint
        )
    );
  }
);

NeuTextarea.displayName = 'NeuTextarea';
