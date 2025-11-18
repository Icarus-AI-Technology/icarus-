/**
 * KANBAN DE CIRURGIAS - OraclusX DS Neumorphic 3D
 * 
 * Visualização Kanban para gestão de cirurgias
 * Adaptado de padrões Nuxt-UI Dashboard para React
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, AlertTriangle, 
  XCircle, Plus, Filter, Search 
} from 'lucide-react';
import { toast } from 'sonner';
import { KanbanBoard, KanbanColumn, KanbanCard } from '@/components/kanban/KanbanBoard';

export default function KanbanCirurgias() {
  const [colunas, setColunas] = useState<KanbanColumn[]>([
    {
      id: 'agendada',
      titulo: 'Agendadas',
      cor: '#3B82F6', // Blue
      icone: <Calendar className="w-5 h-5 text-blue-600" />,
      cards: [
        {
          id: '1',
          titulo: 'Artroplastia Total de Joelho',
          subtitulo: 'Pac: M.S.S.',
          prioridade: 'media',
          data: '15/11/2025',
          hora: '08:00',
          responsavel: 'Dr. João Silva',
          local: 'Hospital São Lucas - Sala 3',
          tags: ['Ortopedia', 'OPME'],
          metadata: { codigo: 'CIR-2025-001' }
        },
        {
          id: '2',
          titulo: 'Angioplastia Coronariana',
          subtitulo: 'Pac: A.R.M.',
          prioridade: 'alta',
          data: '16/11/2025',
          hora: '14:00',
          responsavel: 'Dr. Carlos Santos',
          local: 'Hospital Santa Maria - Sala 1',
          tags: ['Cardiologia', 'Stent'],
          metadata: { codigo: 'CIR-2025-002' }
        }
      ]
    },
    {
      id: 'confirmada',
      titulo: 'Confirmadas',
      cor: '#10B981', // Green
      icone: <CheckCircle className="w-5 h-5 text-green-600" />,
      cards: [
        {
          id: '3',
          titulo: 'Laminectomia Lombar',
          subtitulo: 'Pac: J.P.A.',
          prioridade: 'alta',
          data: '14/11/2025',
          hora: '09:00',
          responsavel: 'Dr. Ana Paula',
          local: 'Hospital Central - Sala 2',
          tags: ['Neurocirurgia', 'Urgente'],
          metadata: { codigo: 'CIR-2025-003' }
        }
      ]
    },
    {
      id: 'preparacao',
      titulo: 'Em Preparação',
      cor: '#F59E0B', // Amber
      icone: <Clock className="w-5 h-5 text-amber-600" />,
      cards: [
        {
          id: '4',
          titulo: 'Colecistectomia Videolaparoscópica',
          subtitulo: 'Pac: L.M.R.',
          prioridade: 'media',
          data: '13/11/2025',
          hora: '10:30',
          responsavel: 'Dr. Pedro Costa',
          local: 'Hospital Geral - Sala 4',
          tags: ['Cirurgia Geral'],
          metadata: { codigo: 'CIR-2025-004' }
        }
      ]
    },
    {
      id: 'andamento',
      titulo: 'Em Andamento',
      cor: '#8B5CF6', // Purple
      icone: <AlertTriangle className="w-5 h-5 text-purple-600" />,
      cards: []
    },
    {
      id: 'concluida',
      titulo: 'Concluídas',
      cor: '#059669', // Emerald
      icone: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      cards: []
    },
    {
      id: 'cancelada',
      titulo: 'Canceladas',
      cor: '#DC2626', // Red
      icone: <XCircle className="w-5 h-5 text-red-600" />,
      cards: []
    }
  ]);

  const [filtroTexto, setFiltroTexto] = useState('');

  const handleCardMove = async (cardId: string, fromColumnId: string, toColumnId: string) => {
    console.log(`Movendo card ${cardId} de ${fromColumnId} para ${toColumnId}`);
    
    // TODO: Atualizar status no Supabase
    // await supabase.from('cirurgias').update({ status: toColumnId }).eq('id', cardId);
    
    toast.success(`Cirurgia movida para: ${toColumnId}`);
  };

  const handleCardClick = (card: KanbanCard) => {
    console.log('Card clicado:', card);
    // TODO: Abrir modal de detalhes
    toast.info(`Abrindo detalhes: ${card.titulo}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EAF6] to-[#F3E5F5] p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Gestão de Cirurgias - Kanban
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Arraste e solte para mover cirurgias entre os status
              </p>
            </div>

            <button type="button"
              className="px-6 py-3 rounded-xl
                         bg-gradient-to-br from-purple-500 to-purple-600
                         shadow-[5px_5px_10px_rgba(94,53,177,0.3),-5px_-5px_10px_rgba(255,255,255,0.5)]
                         hover:shadow-[8px_8px_16px_rgba(94,53,177,0.4),-8px_-8px_16px_rgba(255,255,255,0.6)]
                         hover:-translate-y-0.5
                         transition-all duration-200
                         text-white font-semibold
                         flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Cirurgia
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4
                         shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.8)]">
            <div className="flex items-center gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cirurgias..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg
                             bg-gradient-to-br from-gray-50 to-white
                             border border-gray-200
                             shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]
                             focus:shadow-[inset_5px_5px_10px_rgba(94,53,177,0.1),inset_-5px_-5px_10px_rgba(255,255,255,1)]
                             focus:border-purple-300
                             transition-all duration-200
                             text-sm text-gray-800"
                />
              </div>

              {/* Filtro por Prioridade */}
              <button type="button" className="px-4 py-2 rounded-lg
                                 bg-gradient-to-br from-gray-50 to-gray-100
                                 shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.8)]
                                 hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                                 transition-all duration-200
                                 text-sm text-gray-700 font-medium
                                 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard
          colunas={colunas}
          onCardMove={handleCardMove}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}

