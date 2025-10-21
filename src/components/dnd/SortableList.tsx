/**
 * Sortable List Component - Drag & Drop
 * Lista reordenável com DnD Kit
 * 100% Neumorphism 3D Premium + Lucide React SVG + OraclusX DS
 */

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface SortableItem {
  id: string;
  content: React.ReactNode;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder?: (items: SortableItem[]) => void;
  className?: string;
}

interface SortableItemComponentProps {
  id: string;
  children: React.ReactNode;
}

// ============================================
// SORTABLE ITEM COMPONENT
// ============================================

function SortableItemComponent({ id, children }: SortableItemComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-4 rounded-xl transition-all',
        isDragging
          ? 'neuro-inset scale-105 opacity-50'
          : 'neuro-raised hover:neuro-flat'
      )}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="p-2 rounded-lg neuro-inset cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity"
        aria-label="Arraste para reordenar"
        role="button"
        tabIndex={0}
      >
        <GripVertical className="w-5 h-5 text-[var(--text-secondary)]" />
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ============================================
// SORTABLE LIST
// ============================================

export function SortableList({ items, onReorder, className }: SortableListProps) {
  const [localItems, setLocalItems] = useState(items);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Callback para atualizar estado externo
        if (onReorder) {
          onReorder(reorderedItems);
        }

        return reorderedItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={localItems} strategy={verticalListSortingStrategy}>
        <div className={cn('space-y-3', className)} role="list">
          {localItems.map((item) => (
            <SortableItemComponent key={item.id} id={item.id}>
              {item.content}
            </SortableItemComponent>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ============================================
// EXEMPLO DE USO
// ============================================

interface TaskItem extends SortableItem {
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export function ExemploSortableTaskList() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'Implementar autenticação', status: 'completed', content: null },
    { id: '2', title: 'Criar dashboard', status: 'in_progress', content: null },
    { id: '3', title: 'Integrar API de pagamento', status: 'pending', content: null },
    { id: '4', title: 'Testes E2E', status: 'pending', content: null },
    { id: '5', title: 'Deploy em produção', status: 'pending', content: null },
  ]);

  // Atualizar content de cada task
  const sortableItems: SortableItem[] = tasks.map((task) => ({
    id: task.id,
    content: (
      <div className="flex items-center justify-between w-full">
        <div>
          <h4
            className="text-[var(--text-primary)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
              fontWeight: 600,
            }}
          >
            {task.title}
          </h4>
          <p
            className="text-[var(--text-secondary)] mt-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          >
            ID: {task.id}
          </p>
        </div>
        <div>
          <span
            className={cn(
              'px-3 py-1 rounded-lg neuro-inset',
              task.status === 'completed' && 'text-success',
              task.status === 'in_progress' && 'text-[var(--primary)]',
              task.status === 'pending' && 'text-[var(--text-secondary)]'
            )}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
              fontWeight: 600,
            }}
          >
            {task.status === 'completed' && 'Concluído'}
            {task.status === 'in_progress' && 'Em Progresso'}
            {task.status === 'pending' && 'Pendente'}
          </span>
        </div>
      </div>
    ),
  }));

  const handleReorder = (reorderedItems: SortableItem[]) => {
    // Atualizar o estado das tasks com a nova ordem
    const newTasks = reorderedItems.map((item) =>
      tasks.find((task) => task.id === item.id)!
    );
    setTasks(newTasks);
    console.log('Nova ordem:', newTasks.map((t) => t.title));
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-[var(--text-primary)] mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.813rem',
              fontWeight: 700,
            }}
          >
            Lista de Tarefas (Drag & Drop)
          </h1>
          <p
            className="text-[var(--text-secondary)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          >
            Arraste os itens para reordenar a lista
          </p>
        </div>

        <div className="neuro-raised rounded-2xl p-6">
          <SortableList items={sortableItems} onReorder={handleReorder} />
        </div>

        {/* Ordem Atual */}
        <div className="mt-6 neuro-inset rounded-xl p-4">
          <h3
            className="text-[var(--text-primary)] mb-2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
              fontWeight: 600,
            }}
          >
            Ordem Atual:
          </h3>
          <ol className="list-decimal list-inside space-y-1">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                className="text-[var(--text-secondary)]"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.813rem',
                }}
              >
                {task.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

