import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Button
} from "@heroui/react";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Package,
  AlertCircle,
  CheckCircle2,
  Truck,
  Timer,
  Activity,
} from 'lucide-react';

// Mock Data conforme solicitação (Abbott Cardiologia, Vascular, Radio Intervencionista, Otorrino)
interface AgendaItem {
  id: number;
  data: string;
  hora: string;
  hospital: string;
  cidade: string;
  medico: { name: string; avatar: string };
  procedimento: string;
  especialidade: string;
  status: 'em_andamento' | 'agendado' | 'concluida' | 'confirmado' | 'pendente_material' | 'enviado';
  itens: Array<{ nome: string; marca: string; qtd: number }>;
}

const AGENDA_CIRURGIAS: AgendaItem[] = [
  {
    id: 1,
    data: '2025-11-24',
    hora: '07:30',
    hospital: 'Hosp. Sírio-Libanês',
    cidade: 'São Paulo, SP',
    medico: { name: 'Dr. Roberto Kalil', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    procedimento: 'Angioplastia Coronária',
    especialidade: 'Cardiologia',
    status: 'em_andamento',
    itens: [
      { nome: 'Stent Farmacológico Xience Sierra', marca: 'Abbott', qtd: 2 },
      { nome: 'Balão NC Trek', marca: 'Abbott', qtd: 1 },
      { nome: 'Guia Hi-Torque', marca: 'Abbott', qtd: 1 }
    ]
  },
  {
    id: 2,
    data: '2025-11-24',
    hora: '09:00',
    hospital: 'Copa D\'Or',
    cidade: 'Rio de Janeiro, RJ',
    medico: { name: 'Dra. Ana Vascular', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    procedimento: 'Correção de Aneurisma (EVAR)',
    especialidade: 'Vascular',
    status: 'agendado',
    itens: [
      { nome: 'Endoprótese Aórtica Excluder', marca: 'Gore', qtd: 1 },
      { nome: 'Cateter Pigtail', marca: 'Cordis', qtd: 1 }
    ]
  },
  {
    id: 3,
    data: '2025-11-24',
    hora: '14:00',
    hospital: 'Hosp. Moinhos de Vento',
    cidade: 'Porto Alegre, RS',
    medico: { name: 'Dr. Pedro Neuro', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
    procedimento: 'Embolização de Aneurisma Cerebral',
    especialidade: 'Radiologia Intervencionista',
    status: 'confirmado',
    itens: [
      { nome: 'Microcateter Headway', marca: 'Terumo', qtd: 1 },
      { nome: 'Molas Destacáveis Target', marca: 'Stryker', qtd: 5 },
      { nome: 'Fio Guia 0.014', marca: 'Asahi', qtd: 1 }
    ]
  },
  {
    id: 4,
    data: '2025-11-25',
    hora: '08:00',
    hospital: 'Hosp. Albert Einstein',
    cidade: 'São Paulo, SP',
    medico: { name: 'Dr. Marcos Otorrino', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708c' },
    procedimento: 'Sinusectomia Endoscópica',
    especialidade: 'Otorrinolaringologia',
    status: 'pendente_material',
    itens: [
      { nome: 'Lâmina Shaver 4.0mm Curva', marca: 'Medtronic', qtd: 1 },
      { nome: 'Cateter Balão Sinuplasty', marca: 'Acclarent', qtd: 1 },
      { nome: 'Kit Irrigação', marca: 'Genérico', qtd: 1 }
    ]
  },
  {
    id: 5,
    data: '2025-11-25',
    hora: '10:30',
    hospital: 'Hosp. Santa Joana',
    cidade: 'Recife, PE',
    medico: { name: 'Dra. Julia Coração', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d' },
    procedimento: 'Implante de Marcapasso',
    especialidade: 'Cardiologia',
    status: 'enviado',
    itens: [
      { nome: 'Marcapasso Bicameral Assurity', marca: 'Abbott', qtd: 1 },
      { nome: 'Eletrodo Tendril', marca: 'Abbott', qtd: 2 },
      { nome: 'Introdutor Peel-Away', marca: 'Abbott', qtd: 1 }
    ]
  }
];

const statusColorMap: Record<
  AgendaItem['status'],
  "success" | "warning" | "danger" | "primary" | "secondary" | "default"
> = {
  confirmado: "success",
  agendado: "primary",
  em_andamento: "warning",
  enviado: "secondary",
  pendente_material: "danger",
  concluida: "success",
};

const statusLabelMap: Record<AgendaItem['status'], string> = {
  confirmado: "Confirmado",
  agendado: "Agendado",
  em_andamento: "Em Cirurgia",
  enviado: "Em Trânsito",
  pendente_material: "Pendente OPME",
  concluida: "Concluída",
};

type ColumnKey = 'data' | 'hospital' | 'procedimento' | 'status' | 'actions';

const columns: Array<{ name: string; uid: ColumnKey }> = [
  { name: "DATA/HORA", uid: "data" },
  { name: "HOSPITAL / MÉDICO", uid: "hospital" },
  { name: "PROCEDIMENTO (OPME)", uid: "procedimento" },
  { name: "STATUS", uid: "status" },
  { name: "AÇÕES", uid: "actions" },
];

export default function AgendaOPME() {
  const renderCell = React.useCallback((item: AgendaItem, columnKey: ColumnKey) => {

    switch (columnKey) {
      case "data":
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
              <Calendar size={14} className="text-indigo-500" />
              {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {item.hora}
            </div>
          </div>
        );
      case "hospital":
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium text-gray-900 dark:text-white">{item.hospital}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={10} /> {item.cidade}
            </div>
            <User
              avatarProps={{ radius: "lg", src: item.medico.avatar, size: "sm", className: "w-6 h-6" }}
              description={item.especialidade}
              name={item.medico.name}
              classNames={{
                name: "text-xs font-medium text-gray-700 dark:text-gray-300",
                description: "text-[10px] text-gray-400"
              }}
            >
              {item.medico.name}
            </User>
          </div>
        );
      case "procedimento":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <Stethoscope size={14} />
              {item.procedimento}
            </div>
            <div className="flex flex-wrap gap-1">
              {item.itens.slice(0, 2).map((opme: AgendaItem['itens'][number], idx) => (
                <Chip key={idx} size="sm" variant="flat" classNames={{ base: "h-5 bg-gray-100 dark:bg-gray-800", content: "text-[10px] font-medium text-gray-600 dark:text-gray-400" }}>
                  {opme.qtd}x {opme.nome} ({opme.marca})
                </Chip>
              ))}
              {item.itens.length > 2 && (
                <Tooltip content={
                  <div className="px-1 py-2">
                    <div className="text-xs font-bold mb-1">Lista Completa de Materiais:</div>
                    <ul className="list-disc pl-4 text-xs space-y-1">
                      {item.itens.map((opme: AgendaItem['itens'][number], idx) => (
                        <li key={idx}>{opme.qtd}x {opme.nome} <span className="text-gray-400">({opme.marca})</span></li>
                      ))}
                    </ul>
                  </div>
                }>
                  <Chip size="sm" variant="flat" className="h-5 bg-gray-100 dark:bg-gray-800 text-[10px] cursor-pointer hover:bg-gray-200">
                    +{item.itens.length - 2}
                  </Chip>
                </Tooltip>
              )}
            </div>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[item.status] ?? 'default'}
            size="sm"
            variant="flat"
            startContent={
              item.status === 'confirmado' ? <CheckCircle2 size={12} /> :
              item.status === 'em_andamento' ? <Activity size={12} className="animate-pulse" /> :
              item.status === 'enviado' ? <Truck size={12} /> :
              item.status === 'pendente_material' ? <AlertCircle size={12} /> :
              <Timer size={12} />
            }
          >
            {statusLabelMap[item.status] ?? item.status}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Detalhes da Cirurgia">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Package size={18} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-indigo-500" />
            Agenda Cirúrgica (OPME)
          </h3>
          <p className="text-sm text-gray-500">Próximas cirurgias e status dos materiais</p>
        </div>
        <Button size="sm" color="primary" variant="flat" className="font-semibold">
          Nova Cirurgia
        </Button>
      </div>
      
      <Table 
        aria-label="Agenda de Cirurgias com OPME"
        classNames={{
          base: "max-h-[400px] overflow-scroll",
          table: "min-h-[300px]",
          th: "bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold text-xs",
          td: "border-b border-gray-100 dark:border-gray-800 py-3",
        }}
        isCompact
        removeWrapper
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={AGENDA_CIRURGIAS}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as ColumnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

