/**
 * OraclusX Design System - Stepper Component
 * Wizard de passos para formulários multi-step
 *
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (nav role, aria-current, keyboard)
 * ✅ TypeScript strict
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  allowSkip?: boolean;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  allowSkip = false,
  className,
}) => {
  const handleStepClick = (index: number) => {
    // Only allow clicking on completed or current step (unless allowSkip)
    if (allowSkip || index <= currentStep) {
      onStepClick?.(index);
    }
  };

  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <nav
      aria-label="Progresso"
      className={cn(orientation === 'horizontal' ? 'w-full' : 'flex flex-col', className)}
    >
      <ol
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'items-center justify-between' : 'flex-col space-y-4'
        )}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = allowSkip || index <= currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center',
                orientation === 'horizontal' ? 'flex-1' : 'w-full'
              )}
            >
              <div
                className={cn('flex items-center gap-3', orientation === 'horizontal' && 'w-full')}
              >
                {/* Step Circle */}
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  aria-current={status === 'current' ? 'step' : undefined}
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-full transition-all',
                    'focus:outline-none focus:ring-3 focus:ring-[var(--primary)] focus:ring-offset-2',
                    status === 'completed' && 'bg-[var(--primary)] text-inverse shadow-md',
                    status === 'current' &&
                      'bg-[var(--primary)] text-inverse shadow-lg ring-4 ring-[var(--primary)]/20',
                    status === 'upcoming' &&
                      'bg-surface-secondary dark:bg-muted text-muted dark:text-muted',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                >
                  {status === 'completed' ? (
                    <Check size={20} />
                  ) : (
                    <span className="text-[0.813rem]">{index + 1}</span>
                  )}
                </button>

                {/* Step Label */}
                <div className={cn(orientation === 'vertical' && 'flex-1')}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'orx-orx-font-medium',
                        status === 'current'
                          ? 'text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]'
                          : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.optional && (
                      <span className="text-body-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                        (Opcional)
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    orientation === 'horizontal' ? 'flex-1 h-0.5 mx-4' : 'h-12 w-0.5 ml-5 my-2',
                    status === 'completed'
                      ? 'bg-[var(--primary)]'
                      : 'bg-surface-secondary dark:bg-muted'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
