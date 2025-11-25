/**
 * Surgery Kanban Board - HeroUI Edition
 * 
 * Modern surgical workflow management with drag-and-drop Kanban interface.
 * Replaces legacy neumorphic implementation with HeroUI components and
 * connects to Supabase for real-time data synchronization.
 * 
 * Tech Stack:
 * - HeroUI: Card, Chip, Button, Input components
 * - @dnd-kit: Drag-and-drop functionality
 * - Supabase: Real-time database sync
 * - Lucide React: Icons
 * - Framer Motion: Animations
 * 
 * @author Icarus Prime Orchestrator
 * @date 2025-11-24
 */

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  Stethoscope,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Activity,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { useCirurgias, type Cirurgia } from '@/hooks/useCirurgias';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Types & Constants
// ============================================================================

type KanbanStatus = Cirurgia['status'];

interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  color: string;
  icon: JSX.Element;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'agendada',
    title: 'Agendadas',
    color: 'default',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: 'confirmada',
    title: 'Confirmadas',
    color: 'primary',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: 'preparacao',
    title: 'Preparação',
    color: 'secondary',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    id: 'andamento',
    title: 'Em Andamento',
    color: 'warning',
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: 'recuperacao',
    title: 'Recuperação',
    color: 'success',
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 'concluida',
    title: 'Concluídas',
    color: 'success',
    icon: <Activity className="w-5 h-5" />,
  },
];

// ============================================================================
// Sortable Card Component
// ============================================================================

interface SortableCardProps {
  cirurgia: Cirurgia;
  onClick: (cirurgia: Cirurgia) => void;
}

function SortableCard({ cirurgia, onClick }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cirurgia.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const urgencyColor = {
    eletiva: 'default',
    urgente: 'warning',
    emergencia: 'danger',
  }[cirurgia.urgencia || 'eletiva'] as 'default' | 'warning' | 'danger';

  const priorityColor = {
    baixa: 'default',
    media: 'primary',
    alta: 'warning',
    urgente: 'danger',
  }[cirurgia.prioridade || 'media'] as 'default' | 'primary' | 'warning' | 'danger';

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="
          border-white/10 bg-white/5 backdrop-blur-xl 
          shadow-[0_0_20px_rgba(45,212,191,0.05)]
          hover:shadow-[0_0_30px_rgba(45,212,191,0.15)]
          transition-all duration-300 cursor-pointer
          mb-3
        "
        isPressable
        onClick={() => onClick(cirurgia)}
      >
        <CardHeader className="flex gap-3 px-4 pt-4 pb-2">
          <div
            {...attributes}
            {...listeners}
            className="
              p-2 rounded-lg bg-white/5 cursor-grab active:cursor-grabbing
              hover:bg-white/10 transition-colors
            "
            aria-label="Drag to move"
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col flex-1">
            <h4 className="text-white font-semibold text-sm line-clamp-1">
              {cirurgia.procedimento || 'Procedimento não especificado'}
            </h4>
            <p className="text-slate-400 text-xs">
              {cirurgia.paciente_nome || 'Paciente'}
            </p>
          </div>
          <div className="flex gap-1">
            {cirurgia.urgencia && cirurgia.urgencia !== 'eletiva' && (
              <Chip size="sm" color={urgencyColor} variant="flat">
                {cirurgia.urgencia}
              </Chip>
            )}
          </div>
        </CardHeader>
        <CardBody className="px-4 pb-4 pt-0 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(cirurgia.data_cirurgia).toLocaleDateString('pt-BR')}
            </span>
            {cirurgia.hora_cirurgia && (
              <>
                <Clock className="w-3 h-3 ml-2" />
                <span>{cirurgia.hora_cirurgia}</span>
              </>
            )}
          </div>

          {cirurgia.medico && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User className="w-3 h-3" />
              <span className="line-clamp-1">{cirurgia.medico.nome}</span>
            </div>
          )}

          {cirurgia.hospital && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Building2 className="w-3 h-3" />
              <span className="line-clamp-1">{cirurgia.hospital.nome}</span>
            </div>
          )}

          {cirurgia.sala && (
            <div className="text-xs text-slate-400">
              Sala: {cirurgia.sala}
            </div>
          )}

          <div className="flex gap-1 flex-wrap mt-2">
            <Chip size="sm" color={priorityColor} variant="dot">
              {cirurgia.prioridade || 'média'}
            </Chip>
            {cirurgia.tipo_procedimento && (
              <Chip size="sm" variant="flat" className="bg-white/5">
                {cirurgia.tipo_procedimento}
              </Chip>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ============================================================================
// Kanban Column Component
// ============================================================================

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  cirurgias: Cirurgia[];
  onCardClick: (cirurgia: Cirurgia) => void;
}

function KanbanColumnComponent({
  column,
  cirurgias,
  onCardClick,
}: KanbanColumnComponentProps) {
  return (
    <div className="flex flex-col min-h-[600px] w-80 flex-shrink-0">
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
        <CardHeader className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className={`text-${column.color}`}>{column.icon}</div>
              <h3 className="text-white font-semibold">{column.title}</h3>
            </div>
            <Chip size="sm" variant="flat" className="bg-white/10">
              {cirurgias.length}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="p-4 overflow-y-auto">
          <SortableContext
            items={cirurgias.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {cirurgias.map((cirurgia) => (
                <motion.div
                  key={cirurgia.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SortableCard cirurgia={cirurgia} onClick={onCardClick} />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
          {cirurgias.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma cirurgia neste status</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Kanban Component
// ============================================================================

export default function SurgeryKanban() {
  const { cirurgias, loading, error, updateCirurgia } = useCirurgias();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCirurgia, setActiveCirurgia] = useState<Cirurgia | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCirurgia, setSelectedCirurgia] = useState<Cirurgia | null>(
    null
  );

  // DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter and organize cirurgias by status
  const cirurgiasByStatus = useMemo(() => {
    const filtered = cirurgias.filter((c) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        c.procedimento?.toLowerCase().includes(search) ||
        c.paciente_nome?.toLowerCase().includes(search) ||
        c.medico?.nome?.toLowerCase().includes(search)
      );
    });

    return KANBAN_COLUMNS.reduce(
      (acc, col) => {
        acc[col.id] = filtered.filter((c) => c.status === col.id);
        return acc;
      },
      {} as Record<KanbanStatus, Cirurgia[]>
    );
  }, [cirurgias, searchTerm]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const cirurgia = cirurgias.find((c) => c.id === active.id);
    setActiveCirurgia(cirurgia || null);
  }, [cirurgias]);

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCirurgia(null);

      if (!over) return;

      const cirurgiaId = active.id as string;
      const newStatus = over.id as KanbanStatus;

      const cirurgia = cirurgias.find((c) => c.id === cirurgiaId);
      if (!cirurgia || cirurgia.status === newStatus) return;

      // Optimistic update
      toast.promise(
        async () => {
          // Use the RPC function for atomic update with audit trail
          const { data, error } = await supabase.rpc('move_cirurgia_kanban', {
            p_cirurgia_id: cirurgiaId,
            p_new_status: newStatus,
            p_observacao: `Status alterado via Kanban: ${cirurgia.status} → ${newStatus}`,
          });

          if (error) throw error;

          // Update local state
          await updateCirurgia(cirurgiaId, { status: newStatus });

          return data;
        },
        {
          loading: 'Atualizando status...',
          success: 'Status atualizado com sucesso!',
          error: 'Erro ao atualizar status',
        }
      );
    },
    [cirurgias, updateCirurgia]
  );

  // Handle card click
  const handleCardClick = useCallback((cirurgia: Cirurgia) => {
    setSelectedCirurgia(cirurgia);
    onOpen();
  }, [onOpen]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-xl font-semibold text-white">
          Erro ao carregar cirurgias
        </h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0d16] to-[#15192b] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Kanban - Gestão Cirúrgica
            </h1>
            <p className="text-slate-400">
              Acompanhe o fluxo de cirurgias em tempo real
            </p>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            className="bg-[#2dd4bf] text-black font-semibold"
          >
            Nova Cirurgia
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por procedimento, paciente ou médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4 text-slate-400" />}
            className="max-w-md"
            classNames={{
              input: 'bg-white/5 text-white',
              inputWrapper:
                'border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10',
            }}
          />
          <Button
            variant="flat"
            startContent={<Filter className="w-4 h-4" />}
            className="border-white/10 bg-white/5"
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              cirurgias={cirurgiasByStatus[column.id] || []}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCirurgia ? (
            <div className="rotate-3 opacity-80">
              <SortableCard
                cirurgia={activeCirurgia}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent className="bg-[#15192b] border-white/10">
          {(onClose) => (
            <>
              <ModalHeader className="text-white border-b border-white/10">
                Detalhes da Cirurgia
              </ModalHeader>
              <ModalBody className="py-6">
                {selectedCirurgia && (
                  <div className="space-y-4 text-slate-300">
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Procedimento
                      </h4>
                      <p>{selectedCirurgia.procedimento}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Paciente
                      </h4>
                      <p>{selectedCirurgia.paciente_nome}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-semibold mb-1">Data</h4>
                        <p>
                          {new Date(
                            selectedCirurgia.data_cirurgia
                          ).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Horário
                        </h4>
                        <p>{selectedCirurgia.hora_cirurgia || 'Não definido'}</p>
                      </div>
                    </div>
                    {selectedCirurgia.observacoes && (
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Observações
                        </h4>
                        <p>{selectedCirurgia.observacoes}</p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-white/10">
                <Button variant="flat" onPress={onClose}>
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

