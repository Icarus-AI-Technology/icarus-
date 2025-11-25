import { useMemo, useState } from 'react';
import type { Key } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Tabs,
  Tab,
  Badge,
} from '@heroui/react';
import { DollarSign, FileText, Filter, Package, Plus, Sparkles } from 'lucide-react';

type Complexidade = 'baixa' | 'media' | 'alta' | 'muito_alta';

interface Procedimento {
  id: string;
  codigo_tuss?: string;
  nome: string;
  especialidade: string;
  duracao_media_minutos?: number;
  valor_tabela?: number;
  complexidade: Complexidade;
  materiais_necessarios?: string[];
}

const PROCEDURES: Procedimento[] = [
  {
    id: 'PROC-001',
    codigo_tuss: '31601190',
    nome: 'Artroplastia Total de Joelho',
    especialidade: 'Ortopedia',
    duracao_media_minutos: 180,
    valor_tabela: 25000,
    complexidade: 'muito_alta',
    materiais_necessarios: ['Kit Parafusos', 'Hastes Titânio', 'Cimento Ortopédico'],
  },
  {
    id: 'PROC-002',
    codigo_tuss: '31511144',
    nome: 'Artroscopia de Joelho',
    especialidade: 'Ortopedia',
    duracao_media_minutos: 90,
    valor_tabela: 8500,
    complexidade: 'media',
    materiais_necessarios: ['Câmera HD', 'Kit Brocas', 'Solução Salina'],
  },
  {
    id: 'PROC-003',
    codigo_tuss: '40804012',
    nome: 'Cirurgia Cardíaca Minimante Invasiva',
    especialidade: 'Cardiologia',
    duracao_media_minutos: 210,
    valor_tabela: 42000,
    complexidade: 'alta',
    materiais_necessarios: ['Stent Drug-Eluting', 'Cateter 3D', 'Equipamento ECMO'],
  },
];

const KPI_CARDS = [
  { label: 'Procedimentos TUSS', value: '1.280', helper: '+12 atualizados' },
  { label: 'Materiais Homologados', value: '5.743', helper: 'ANVISA validado' },
  { label: 'Protocolos IA', value: '48', helper: 'Recomendações inteligentes' },
  { label: 'Ticket Médio', value: 'R$ 16,7k', helper: '+1.2% no mês' },
];

const complexityTheme: Record<Complexidade, { label: string; color: 'success' | 'warning' | 'danger' | 'secondary' }> =
  {
    baixa: { label: 'Baixa', color: 'success' },
    media: { label: 'Média', color: 'warning' },
    alta: { label: 'Alta', color: 'danger' },
    muito_alta: { label: 'Muito Alta', color: 'secondary' },
  };

export default function GestaoProcedimentos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [complexity, setComplexity] = useState<string>('todos');

  const filteredProcedures = useMemo(() => {
    const term = search.toLowerCase();
    return PROCEDURES.filter((proc) => {
      const matchesSearch =
        proc.nome.toLowerCase().includes(term) || proc.codigo_tuss?.toLowerCase().includes(term);
      const matchesComplexity = complexity === 'todos' ? true : proc.complexidade === complexity;
      return matchesSearch && matchesComplexity;
    });
  }, [search, complexity]);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cirurgias & Procedimentos</p>
          <h1 className="text-2xl font-bold text-white">Catálogo TUSS + Parametrização Inteligente</h1>
          <p className="text-sm text-slate-400">
            Compare protocolos, kits de materiais e valores de referência com rastreabilidade ANVISA.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="flat" color="secondary" onClick={() => navigate('/cirurgias')}>
            Voltar para Cirurgias
          </Button>
          <Button color="primary" variant="shadow" startContent={<Plus size={18} />}>
            Novo Procedimento
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
          <Card key={card.label} className="bg-white/5 border border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-0">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{card.label}</p>
            </CardHeader>
            <CardBody className="pt-2">
              <p className="text-3xl font-semibold text-white">{card.value}</p>
              <p className="text-xs text-white/60">{card.helper}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            size="lg"
            radius="lg"
            label="Buscar procedimento"
            placeholder="Digite nome, código TUSS ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="bordered"
            color="primary"
            startContent={<Filter size={16} />}
            className="border-white/20"
          >
            Filtros avançados
          </Button>
        </div>

        <Tabs
          selectedKey={complexity}
          onSelectionChange={(key: Key) => setComplexity(String(key))}
          variant="solid"
          color="secondary"
          classNames={{
            tabList: 'bg-transparent gap-3',
            cursor: 'bg-gradient-to-r from-blue-500 to-purple-500',
            tabContent: 'text-white',
          }}
        >
          <Tab key="todos" title="Todos" />
          <Tab key="baixa" title="Baixa" />
          <Tab key="media" title="Média" />
          <Tab key="alta" title="Alta" />
          <Tab key="muito_alta" title="Muito Alta" />
        </Tabs>
      </section>

      <section className="space-y-4">
        {filteredProcedures.map((procedure) => (
          <Card
            key={procedure.id}
            className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg rounded-3xl"
          >
            <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">{procedure.nome}</h3>
                  {procedure.codigo_tuss && (
                    <Chip size="sm" color="secondary" variant="flat">
                      TUSS {procedure.codigo_tuss}
                    </Chip>
                  )}
                  <Chip
                    size="sm"
                    color={complexityTheme[procedure.complexidade].color}
                    variant="bordered"
                    startContent={<Sparkles size={14} />}
                  >
                    {complexityTheme[procedure.complexidade].label}
                  </Chip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-white/60">Especialidade</p>
                    <p className="text-sm font-medium text-white">{procedure.especialidade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Duração média</p>
                    <p className="text-sm font-medium text-white">
                      {procedure.duracao_media_minutos ? `${procedure.duracao_media_minutos} min` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Valor Tabela</p>
                    <p className="text-sm font-semibold text-emerald-300 flex items-center gap-1">
                      <DollarSign size={14} />
                      {procedure.valor_tabela
                        ? `R$ ${procedure.valor_tabela.toLocaleString('pt-BR')}`
                        : 'Sob consulta'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Materiais mapeados</p>
                    <Badge variant="flat" color="primary">
                      {procedure.materiais_necessarios?.length ?? 0} itens
                    </Badge>
                  </div>
                </div>

                {procedure.materiais_necessarios && (
                  <div className="flex flex-wrap gap-2">
                    {procedure.materiais_necessarios.map((material) => (
                      <Chip key={material} size="sm" variant="flat" className="bg-white/10 text-white">
                        {material}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="bordered" color="secondary" startContent={<Package size={16} />}>
                  Ver Kit
                </Button>
                <Button color="primary" variant="flat">
                  Editar
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredProcedures.length === 0 && (
          <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
            <CardBody className="text-center py-12 flex flex-col items-center gap-2">
              <FileText size={32} className="text-white/40" />
              <p className="text-lg font-semibold text-white">Nenhum procedimento encontrado</p>
              <p className="text-sm text-white/60">Tente ajustar a busca ou os filtros</p>
            </CardBody>
          </Card>
        )}
      </section>
    </div>
  );
}
