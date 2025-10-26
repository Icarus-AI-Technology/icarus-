/**
 * 📋 WORKFLOW KANBAN — VISUALIZAÇÃO KANBAN
 * 
 * Componente Kanban Board para gerenciar visualmente múltiplas instâncias de workflow
 * Permite drag-and-drop entre estados, filtros, e ações em massa
 * 
 * Features:
 * - Colunas por estado
 * - Drag and drop entre colunas
 * - Filtros por prioridade, atribuído, vencimento
 * - Ações em massa
 * - Contador de itens por estado
 * - Responsivo
 * - Dark mode
 */

import React, { useState, useMemo } from 'react';
import { 
  AlertCircle,
  Calendar,
  Clock,
  Filter,
  Plus,
  Search,
  User,
} from 'lucide-react';
import type { WorkflowInstance, WorkflowDefinition, WorkflowState, WorkflowPriority } from '@/types/workflow';

interface WorkflowKanbanProps {
  instances: WorkflowInstance[];
  workflow: WorkflowDefinition;
  onTransition?: (instanceId: string, toStateId: string) => void;
  onCreateNew?: () => void;
  onViewInstance?: (instanceId: string) => void;
  showFilters?: boolean;
}

interface KanbanFilters {
  search: string;
  priority: WorkflowPriority | 'all';
  assignedTo: string | 'all';
  overdue: boolean;
}

export const WorkflowKanban: React.FC<WorkflowKanbanProps> = ({
  instances,
  workflow,
  onTransition,
  onCreateNew,
  onViewInstance,
  showFilters = true,
}) => {
  const [filters, setFilters] = useState<KanbanFilters>({
    search: '',
    priority: 'all',
    assignedTo: 'all',
    overdue: false,
  });
  const [draggedInstance, setDraggedInstance] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Filtrar instâncias
  const filteredInstances = useMemo(() => {
    return instances.filter(instance => {
      // Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !instance.entityId.toLowerCase().includes(searchLower) &&
          !instance.assignedToName?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      // Priority
      if (filters.priority !== 'all' && instance.priority !== filters.priority) {
        return false;
      }
      
      // Assigned to
      if (filters.assignedTo !== 'all' && instance.assignedTo !== filters.assignedTo) {
        return false;
      }
      
      // Overdue
      if (filters.overdue) {
        if (!instance.dueDate || new Date(instance.dueDate) >= new Date()) {
          return false;
        }
      }
      
      return true;
    });
  }, [instances, filters]);
  
  // Agrupar instâncias por estado
  const instancesByState = useMemo(() => {
    const grouped: Record<string, WorkflowInstance[]> = {};
    
    workflow.states.forEach(state => {
      grouped[state.id] = filteredInstances.filter(
        instance => instance.currentStateId === state.id
      );
    });
    
    return grouped;
  }, [filteredInstances, workflow.states]);
  
  // Obter cor da prioridade
  const getPriorityColor = (priority: WorkflowPriority): string => {
    switch (priority) {
      case 'urgent': return 'var(--orx-error)';
      case 'high': return 'var(--orx-warning)';
      case 'medium': return 'var(--orx-info)';
      case 'low': return 'var(--orx-gray-400)';
    }
  };
  
  // Verificar se está atrasado
  const isOverdue = (dueDate?: Date): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };
  
  // Formatar data
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(date));
  };
  
  // Handlers de drag and drop
  const handleDragStart = (instanceId: string) => {
    setDraggedInstance(instanceId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (stateId: string) => {
    if (!draggedInstance) return;
    
    const instance = instances.find(i => i.id === draggedInstance);
    if (!instance) return;
    
    // Só permite drop se for transição válida
    const currentState = workflow.states.find(s => s.id === instance.currentStateId);
    if (!currentState?.allowedTransitions.includes(stateId)) {
      return;
    }
    
    onTransition?.(draggedInstance, stateId);
    setDraggedInstance(null);
  };
  
  const handleDragEnd = () => {
    setDraggedInstance(null);
  };
  
  return (
    <div className="workflow-kanban" style={{ width: '100%', height: '100%' }}>
      {/* Header */}
      <div className="neumorphic-container p-4 mb-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ 
              fontSize: '0.813rem', 
              fontWeight: 'bold',
              color: 'var(--orx-text-primary)',
              marginBottom: '0.25rem',
            }}>
              {workflow.name}
            </h2>
            <p style={{ 
              fontSize: '0.813rem', 
              color: 'var(--orx-text-secondary)',
            }}>
              {filteredInstances.length} de {instances.length} itens
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {showFilters && (
              <button
                className="neumorphic-button"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                style={{
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '0.75rem',
                }}
              >
                <Filter style={{ width: '1rem', height: '1rem' }} />
                Filtros
                {(filters.search || filters.priority !== 'all' || filters.assignedTo !== 'all' || filters.overdue) && (
                  <span style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: 'var(--orx-primary)',
                    color: 'white',
                    fontSize: '0.813rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                  }}>
                    {[
                      filters.search,
                      filters.priority !== 'all',
                      filters.assignedTo !== 'all',
                      filters.overdue,
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            )}
            
            {onCreateNew && (
              <button
                className="neumorphic-button"
                onClick={onCreateNew}
                style={{
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '0.75rem',
                  background: 'var(--orx-primary)',
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Novo
              </button>
            )}
          </div>
        </div>
        
        {/* Painel de filtros */}
        {showFilterPanel && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: 'var(--orx-bg-light)',
            border: '1px solid var(--orx-gray-200)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {/* Search */}
              <div>
                <label style={{
                  fontSize: '0.813rem',
                  fontWeight: '600',
                  color: 'var(--orx-text-secondary)',
                  marginBottom: '0.5rem',
                  display: 'block',
                }}>
                  Buscar
                </label>
                <div style={{ position: 'relative' }}>
                  <Search style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1rem',
                    height: '1rem',
                    color: 'var(--orx-text-secondary)',
                  }} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="ID, nome, atribuído..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--orx-gray-300)',
                      background: 'var(--orx-bg-light)',
                      color: 'var(--orx-text-primary)',
                      fontSize: '0.813rem',
                    }}
                  />
                </div>
              </div>
              
              {/* Priority */}
              <div>
                <label style={{
                  fontSize: '0.813rem',
                  fontWeight: '600',
                  color: 'var(--orx-text-secondary)',
                  marginBottom: '0.5rem',
                  display: 'block',
                }}>
                  Prioridade
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value as WorkflowPriority | 'all' })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--orx-gray-300)',
                    background: 'var(--orx-bg-light)',
                    color: 'var(--orx-text-primary)',
                    fontSize: '0.813rem',
                  }}
                >
                  <option value="all">Todas</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
              
              {/* Overdue */}
              <div>
                <label style={{
                  fontSize: '0.813rem',
                  fontWeight: '600',
                  color: 'var(--orx-text-secondary)',
                  marginBottom: '0.5rem',
                  display: 'block',
                }}>
                  Filtros rápidos
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={filters.overdue}
                    onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
                    Apenas atrasados
                  </span>
                </label>
              </div>
            </div>
            
            {/* Clear filters */}
            {(filters.search || filters.priority !== 'all' || filters.assignedTo !== 'all' || filters.overdue) && (
              <button
                onClick={() => setFilters({ search: '', priority: 'all', assignedTo: 'all', overdue: false })}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.813rem',
                  color: 'var(--orx-primary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Kanban Board */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
      }}>
        {workflow.states.map(state => {
          const stateInstances = instancesByState[state.id] || [];
          const canDrop = draggedInstance 
            ? (() => {
                const instance = instances.find(i => i.id === draggedInstance);
                const currentState = instance 
                  ? workflow.states.find(s => s.id === instance.currentStateId)
                  : null;
                return currentState?.allowedTransitions.includes(state.id) || false;
              })()
            : false;
          
          return (
            <div
              key={state.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(state.id)}
              style={{
                flex: '0 0 320px',
                minHeight: '400px',
                background: canDrop ? `${state.color}10` : 'transparent',
                borderRadius: '0.75rem',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Column Header */}
              <div className="neumorphic-container" style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderTop: `4px solid ${state.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{
                    fontSize: '0.813rem',
                    fontWeight: '700',
                    color: state.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {state.label}
                  </h3>
                  <span style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: state.color,
                    color: 'white',
                    fontSize: '0.813rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                  }}>
                    {stateInstances.length}
                  </span>
                </div>
              </div>
              
              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stateInstances.map(instance => (
                  <div
                    key={instance.id}
                    draggable
                    onDragStart={() => handleDragStart(instance.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onViewInstance?.(instance.id)}
                    className="neumorphic-container"
                    style={{
                      padding: '1rem',
                      cursor: 'grab',
                      opacity: draggedInstance === instance.id ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '0.813rem',
                          color: 'var(--orx-text-secondary)',
                          marginBottom: '0.25rem',
                        }}>
                          {instance.entityType}
                        </p>
                        <p style={{
                          fontSize: '0.813rem',
                          fontWeight: '600',
                          color: 'var(--orx-text-primary)',
                        }}>
                          #{instance.entityId}
                        </p>
                      </div>
                      
                      <div style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        background: getPriorityColor(instance.priority),
                      }} />
                    </div>
                    
                    {/* Info */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.813rem',
                      color: 'var(--orx-text-secondary)',
                    }}>
                      {instance.assignedToName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User style={{ width: '0.875rem', height: '0.875rem' }} />
                          {instance.assignedToName}
                        </div>
                      )}
                      
                      {instance.dueDate && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: isOverdue(instance.dueDate) ? 'var(--orx-error)' : 'var(--orx-text-secondary)',
                        }}>
                          {isOverdue(instance.dueDate) ? (
                            <AlertCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                          ) : (
                            <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                          )}
                          {formatDate(instance.dueDate)}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
                        {formatDate(instance.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {stateInstances.length === 0 && (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--orx-text-secondary)',
                    fontSize: '0.813rem',
                  }}>
                    Nenhum item neste estado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowKanban;

