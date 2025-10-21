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
    () => workflow.states.find(s => s.id === instance.currentStateId),
    [workflow.states, instance.currentStateId]
  );
  
  // Calcular estados já passados
  const passedStates = useMemo(() => {
    const passed = new Set<string>();
    instance.history.forEach(transition => {
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
  const canTransition = (toStateId: string): boolean => {
    return currentState?.allowedTransitions.includes(toStateId) || false;
  };
  
  // Obter transição para um estado
  const getTransitionForState = (stateId: string) => {
    return instance.history.find(t => t.toStateId === stateId);
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
    <div className="workflow-timeline" style={{ width: '100%' }}>
      {/* Header */}
      <div className="neumorphic-container p-4 mb-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ 
              fontSize: '0.813rem', 
              fontWeight: 'bold',
              color: 'var(--orx-text-primary)',
              marginBottom: '0.5rem',
            }}>
              {workflow.name}
            </h3>
            <p style={{ 
              fontSize: '0.813rem', 
              color: 'var(--orx-text-secondary)',
            }}>
              {instance.entityType} • {instance.entityId}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              background: currentState?.color || 'var(--orx-primary)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.813rem',
              boxShadow: 'var(--orx-shadow-sm)',
            }}>
              {currentState?.label || 'Estado Desconhecido'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="neumorphic-container p-6">
        <div style={{ position: 'relative' }}>
          {/* Linha vertical */}
          <div style={{
            position: 'absolute',
            left: '1rem',
            top: '1rem',
            bottom: '1rem',
            width: '2px',
            background: 'linear-gradient(180deg, var(--orx-primary) 0%, var(--orx-gray-300) 100%)',
          }} />
          
          {/* Estados */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {workflow.states.map((state, index) => {
              const isCurrent = state.id === instance.currentStateId;
              const isPassed = passedStates.has(state.id);
              const transition = getTransitionForState(state.id);
              const isInitial = state.isInitial;
              const isFinal = state.isFinal;
              const canGoTo = canTransition(state.id);
              
              return (
                <div
                  key={state.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: compact ? '1.5rem' : '2rem',
                    paddingLeft: '3rem',
                    position: 'relative',
                  }}
                >
                  {/* Ícone do estado */}
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCurrent 
                      ? state.color 
                      : isPassed 
                        ? 'var(--orx-success)' 
                        : 'var(--orx-bg-light)',
                    border: isCurrent 
                      ? `3px solid ${state.color}` 
                      : isPassed 
                        ? '3px solid var(--orx-success)' 
                        : '3px solid var(--orx-gray-300)',
                    boxShadow: isCurrent 
                      ? `0 0 0 4px ${state.color}20` 
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {isPassed ? (
                      <CheckCircle style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        color: 'white',
                      }} />
                    ) : isCurrent ? (
                      <Clock style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        color: 'white',
                      }} />
                    ) : (
                      <Circle style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        color: 'var(--orx-gray-400)',
                      }} />
                    )}
                  </div>
                  
                  {/* Conteúdo do estado */}
                  <div style={{ flex: 1 }}>
                    {/* Header do estado */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                      }}>
                        <h4 style={{
                          fontSize: compact ? '0.875rem' : '1rem',
                          fontWeight: '600',
                          color: isCurrent ? state.color : 'var(--orx-text-primary)',
                        }}>
                          {state.label}
                        </h4>
                        
                        {isInitial && (
                          <span style={{
                            fontSize: '0.813rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'var(--orx-info-light)',
                            color: 'var(--orx-info)',
                            fontWeight: '600',
                          }}>
                            INICIAL
                          </span>
                        )}
                        
                        {isFinal && (
                          <span style={{
                            fontSize: '0.813rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'var(--orx-success-light)',
                            color: 'var(--orx-success)',
                            fontWeight: '600',
                          }}>
                            FINAL
                          </span>
                        )}
                        
                        {isCurrent && getTimeInState(state.id) && (
                          <span style={{
                            fontSize: '0.813rem',
                            color: 'var(--orx-text-secondary)',
                          }}>
                            • há {getTimeInState(state.id)}
                          </span>
                        )}
                      </div>
                      
                      {state.description && !compact && (
                        <p style={{
                          fontSize: '0.813rem',
                          color: 'var(--orx-text-secondary)',
                        }}>
                          {state.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Informações da transição */}
                    {transition && !compact && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'var(--orx-bg-light)',
                        border: '1px solid var(--orx-gray-200)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          fontSize: '0.813rem',
                          color: 'var(--orx-text-secondary)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User style={{ width: '0.875rem', height: '0.875rem' }} />
                            {transition.executedByName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                            {formatDate(transition.executedAt)}
                          </div>
                        </div>
                        
                        {transition.comment && (
                          <div style={{
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.25rem',
                            fontSize: '0.813rem',
                            color: 'var(--orx-text-primary)',
                          }}>
                            <MessageSquare style={{ 
                              width: '0.875rem', 
                              height: '0.875rem', 
                              marginTop: '0.125rem',
                              flexShrink: 0,
                            }} />
                            <span>{transition.comment}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Ações disponíveis no estado atual */}
                    {isCurrent && showActions && availableActions.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{
                          fontSize: '0.813rem',
                          fontWeight: '600',
                          color: 'var(--orx-text-secondary)',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Ações Disponíveis
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}>
                          {availableActions.map(action => (
                            <button
                              key={action.id}
                              className="neumorphic-button"
                              onClick={() => onTransition?.(state.id, action.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.813rem',
                                fontWeight: '600',
                                color: action.color || 'var(--orx-primary)',
                                border: `1px solid ${action.color || 'var(--orx-primary)'}`,
                                borderRadius: '0.5rem',
                                background: 'var(--orx-bg-light)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              {action.label}
                              <ArrowRight style={{ width: '0.875rem', height: '0.875rem' }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Alerta de auto-progressão */}
                    {isCurrent && state.autoProgressAfterDays && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'var(--orx-warning-light)',
                        border: '1px solid var(--orx-warning)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <AlertCircle style={{ 
                          width: '1rem', 
                          height: '1rem', 
                          color: 'var(--orx-warning)',
                          flexShrink: 0,
                        }} />
                        <p style={{
                          fontSize: '0.813rem',
                          color: 'var(--orx-warning-dark)',
                        }}>
                          Alerta se permanecer mais de {state.autoProgressAfterDays} dia(s) neste estado
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <div>
            <p style={{ 
              fontSize: '0.813rem', 
              color: 'var(--orx-text-secondary)',
              marginBottom: '0.25rem',
            }}>
              Criado por
            </p>
            <p style={{ 
              fontSize: '0.813rem', 
              fontWeight: '600',
              color: 'var(--orx-text-primary)',
            }}>
              {instance.createdByName}
            </p>
          </div>
          
          <div>
            <p style={{ 
              fontSize: '0.813rem', 
              color: 'var(--orx-text-secondary)',
              marginBottom: '0.25rem',
            }}>
              Data de criação
            </p>
            <p style={{ 
              fontSize: '0.813rem', 
              fontWeight: '600',
              color: 'var(--orx-text-primary)',
            }}>
              {formatDate(instance.createdAt)}
            </p>
          </div>
          
          {instance.assignedTo && (
            <div>
              <p style={{ 
                fontSize: '0.813rem', 
                color: 'var(--orx-text-secondary)',
                marginBottom: '0.25rem',
              }}>
                Atribuído a
              </p>
              <p style={{ 
                fontSize: '0.813rem', 
                fontWeight: '600',
                color: 'var(--orx-text-primary)',
              }}>
                {instance.assignedToName}
              </p>
            </div>
          )}
          
          {instance.dueDate && (
            <div>
              <p style={{ 
                fontSize: '0.813rem', 
                color: 'var(--orx-text-secondary)',
                marginBottom: '0.25rem',
              }}>
                Data de vencimento
              </p>
              <p style={{ 
                fontSize: '0.813rem', 
                fontWeight: '600',
                color: new Date(instance.dueDate) < new Date() 
                  ? 'var(--orx-error)' 
                  : 'var(--orx-text-primary)',
              }}>
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

