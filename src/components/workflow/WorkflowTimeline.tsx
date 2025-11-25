/**
 * 🔄 WORKFLOW TIMELINE — COMPONENTE VISUAL
 *
 * Componente visual para exibir o histórico e progresso de uma instância de workflow
 * Mostra todos os estados, transições executadas e ações disponíveis
 *
 * Features:
 * - Timeline vertical com todos os estados
 * - Estado atual destacado
 * - Histórico de transições com timestamps
 * - Ações disponíveis no estado atual
 * - Suporte a dark mode
 * - Responsivo
 */

import React, { useMemo } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface WorkflowTimelineProps {
  instance: WorkflowInstance;
  workflow: WorkflowDefinition;
  onTransition?: (toStateId: string, actionId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  instance,
  workflow,
  onTransition,
  showActions = true,
  compact = false,
}) => {
  // Encontrar estado atual
  const currentState = useMemo(
    () => workflow.states.find((s) => s.id === instance.currentStateId),
    [workflow.states, instance.currentStateId]
  );

  // Calcular estados já passados
  const passedStates = useMemo(() => {
    const passed = new Set<string>();
    instance.history.forEach((transition) => {
      passed.add(transition.fromStateId);
    });
    if (currentState && !currentState.isFinal) {
      passed.add(currentState.id);
    }
    return passed;
  }, [instance.history, currentState]);

  // Obter ações disponíveis
  const availableActions = currentState?.actions || [];

  // Verificar se pode fazer transição
  // const canTransition = (toStateId: string): boolean => currentState?.allowedTransitions.includes(toStateId) || false; // não utilizado

  // Obter transição para um estado
  const getTransitionForState = (stateId: string) => {
    return instance.history.find((t) => t.toStateId === stateId);
  };

  // Formatar data
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Calcular tempo no estado
  const getTimeInState = (stateId: string): string => {
    const transition = getTransitionForState(stateId);
    if (!transition) return '';

    const now = Date.now();
    const then = new Date(transition.executedAt).getTime();
    const diff = now - then;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `< 1h`;
  };

  return (
    <div className="workflow-timeline w-full">
      {/* Header */}
      <div className="neumorphic-container p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[0.813rem] font-bold text-[var(--orx-text-primary)] mb-2">
              {workflow.name}
            </h3>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
              {instance.entityType} • {instance.entityId}
            </p>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--orx-primary)] text-white font-semibold text-[0.813rem] shadow-[var(--orx-shadow-sm)]">
              {currentState?.label || 'Estado Desconhecido'}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="neumorphic-container p-6">
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-[linear-gradient(180deg,var(--orx-primary)_0%,var(--orx-gray-300)_100%)]" />

          {/* Estados */}
          <div className="relative z-[1]">
            {workflow.states.map((state, index) => {
              const isCurrent = state.id === instance.currentStateId;
              const isPassed = passedStates.has(state.id);
              const transition = getTransitionForState(state.id);
              const isInitial = state.isInitial;
              const isFinal = state.isFinal;
              // const canGoTo = canTransition(state.id); // não utilizado

              const setIconStyles = (el: HTMLDivElement | null) => {
                if (el) {
                  const bg = isCurrent
                    ? state.color || 'var(--orx-primary)'
                    : isPassed
                      ? 'var(--orx-success)'
                      : 'var(--orx-bg-light)';
                  const border = isCurrent
                    ? `3px solid ${state.color || 'var(--orx-primary)'}`
                    : isPassed
                      ? '3px solid var(--orx-success)'
                      : '3px solid var(--orx-gray-300)';
                  const boxShadow = isCurrent
                    ? `0 0 0 4px ${state.color || 'var(--orx-primary)'}20`
                    : 'none';
                  el.style.background = bg;
                  el.style.border = border;
                  el.style.boxShadow = boxShadow;
                }
              };

              const setTitleColor = (el: HTMLHeadingElement | null) => {
                if (el) {
                  el.style.color = isCurrent
                    ? state.color || 'var(--orx-text-primary)'
                    : 'var(--orx-text-primary)';
                }
              };

              return (
                <div
                  key={state.id}
                  className={`flex items-start ${compact ? 'mb-6' : 'mb-8'} pl-12 relative`}
                >
                  {/* Ícone do estado */}
                  <div
                    ref={setIconStyles}
                    className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  >
                    {isPassed ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-[var(--orx-gray-400)]" />
                    )}
                  </div>

                  {/* Conteúdo do estado */}
                  <div className="flex-1">
                    {/* Header do estado */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          ref={setTitleColor}
                          className={`${compact ? 'text-[0.875rem]' : 'text-[1rem]'} font-semibold`}
                        >
                          {state.label}
                        </h4>

                        {isInitial && (
                          <span className="text-[0.813rem] px-2 py-0.5 rounded bg-[var(--orx-info-light)] text-[var(--orx-info)] font-semibold">
                            INICIAL
                          </span>
                        )}

                        {isFinal && (
                          <span className="text-[0.813rem] px-2 py-0.5 rounded bg-[var(--orx-success-light)] text-[var(--orx-success)] font-semibold">
                            FINAL
                          </span>
                        )}

                        {isCurrent && getTimeInState(state.id) && (
                          <span className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                            • há {getTimeInState(state.id)}
                          </span>
                        )}
                      </div>

                      {state.description && !compact && (
                        <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                          {state.description}
                        </p>
                      )}
                    </div>

                    {/* Informações da transição */}
                    {transition && !compact && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--orx-bg-light)] border border-[var(--orx-gray-200)]">
                        <div className="flex items-center gap-4 text-[0.813rem] text-[var(--orx-text-secondary)]">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {transition.executedByName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(transition.executedAt)}
                          </div>
                        </div>

                        {transition.comment && (
                          <div className="mt-2 flex items-start gap-1 text-[0.813rem] text-[var(--orx-text-primary)]">
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{transition.comment}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ações disponíveis no estado atual */}
                    {isCurrent && showActions && availableActions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[0.813rem] font-semibold text-[var(--orx-text-secondary)] mb-2 uppercase tracking-wider">
                          Ações Disponíveis
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {availableActions.map((action) => (
                            <button
                              key={action.id}
                              className="neumorphic-button"
                              onClick={() => onTransition?.(state.id, action.id)}
                              ref={(el) => {
                                if (el) {
                                  const color = action.color || 'var(--orx-primary)';
                                  el.style.color = color;
                                  el.style.border = `1px solid ${color}`;
                                }
                              }}
                              className="neumorphic-button inline-flex items-center gap-2 px-4 py-2 text-[0.813rem] font-semibold rounded-lg bg-[var(--orx-bg-light)] cursor-pointer transition-all"
                            >
                              {action.label}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerta de auto-progressão */}
                    {isCurrent && state.autoProgressAfterDays && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--orx-warning-light)] border border-[var(--orx-warning)] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[var(--orx-warning)] shrink-0" />
                        <p className="text-[0.813rem] text-[var(--orx-warning-dark)]">
                          Alerta se permanecer mais de {state.autoProgressAfterDays} dia(s) neste
                          estado
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer com informações */}
      <div className="neumorphic-container p-4 mt-4">
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
          <div>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mb-1">Criado por</p>
            <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              {instance.createdByName}
            </p>
          </div>

          <div>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mb-1">Data de criação</p>
            <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              {formatDate(instance.createdAt)}
            </p>
          </div>

          {instance.assignedTo && (
            <div>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mb-1">Atribuído a</p>
              <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                {instance.assignedToName}
              </p>
            </div>
          )}

          {instance.dueDate && (
            <div>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mb-1">
                Data de vencimento
              </p>
              <p
                className={`text-[0.813rem] font-semibold ${new Date(instance.dueDate) < new Date() ? 'text-[var(--orx-error)]' : 'text-[var(--orx-text-primary)]'}`}
              >
                {formatDate(instance.dueDate)}
                {new Date(instance.dueDate) < new Date() && ' (Atrasado)'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowTimeline;
