import { useMemo, useState } from 'react';
import type { Key } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
} from '@heroui/react';
import {
  Building2,
  Filter,
  Plus,
  Shield,
  Stethoscope,
  Truck,
  Package,
  DollarSign,
  Users,
} from 'lucide-react';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  count: number;
  subtitle: string;
  draft?: string;
}

interface Doctor {
  id: string;
  name: string;
  crm: string;
  specialty: string;
  hospital: string;
  phone: string;
  avatarUrl: string;
  successRate: number;
}

const TABS: TabConfig[] = [
  { id: 'medicos', label: 'Médicos', icon: Stethoscope, count: 847, subtitle: 'Atualizado há 2h', draft: '+15' },
  { id: 'hospitais', label: 'Hospitais', icon: Building2, count: 156, subtitle: 'CNES sincronizado', draft: '+3' },
  { id: 'pacientes', label: 'Pacientes', icon: Users, count: 12453, subtitle: 'LGPD compliant' },
  { id: 'convenios', label: 'Convênios', icon: Shield, count: 43, subtitle: 'ANS TUSS' },
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck, count: 278, subtitle: 'Importação & nacional' },
  { id: 'produtos', label: 'Produtos OPME', icon: Package, count: 8934, subtitle: 'ANVISA homologado', draft: '+120' },
  { id: 'tabelas', label: 'Tabelas de Preço', icon: DollarSign, count: 8, subtitle: 'Versões oficiais' },
];

const DOCTORS_DATA: Doctor[] = [
  {
    id: 'DOC-001',
    name: 'Dr. Roberto Almeida',
    crm: 'CRM-SP 123456',
    specialty: 'Ortopedia',
    hospital: 'Hospital São Lucas',
    phone: '(11) 99999-8888',
    successRate: 98.5,
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: 'DOC-002',
    name: 'Dra. Juliana Costa',
    crm: 'CRM-SP 654321',
    specialty: 'Cardiologia',
    hospital: 'Albert Einstein',
    phone: '(11) 98888-7777',
    successRate: 96.2,
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: 'DOC-003',
    name: 'Dr. Marcos Silva',
    crm: 'CRM-RJ 112233',
    specialty: 'Neurologia',
    hospital: 'Copa Star',
    phone: '(21) 97777-6666',
    successRate: 94.8,
    avatarUrl: 'https://i.pravatar.cc/150?u=3',
  },
  {
    id: 'DOC-004',
    name: 'Dra. Fernanda Lima',
    crm: 'CRM-MG 445566',
    specialty: 'Ortopedia',
    hospital: 'Mater Dei',
    phone: '(31) 96666-5555',
    successRate: 99.1,
    avatarUrl: 'https://i.pravatar.cc/150?u=4',
  },
  {
    id: 'DOC-005',
    name: 'Dr. Carlos Santos',
    crm: 'CRM-SP 998877',
    specialty: 'Cirurgia Geral',
    hospital: 'Sírio-Libanês',
    phone: '(11) 95555-4444',
    successRate: 97.0,
    avatarUrl: 'https://i.pravatar.cc/150?u=5',
  },
];

const summaryCards = [
  {
    label: 'Validação em Tempo Real',
    value: 'CPF, CRM e CNES com Receita/CFM/DataSUS',
  },
  {
    label: 'Detecção de Duplicatas',
    value: 'IA Levenshtein + normalização automática de dados',
  },
  {
    label: 'Importação Inteligente',
    value: 'CSV/Excel com preview, correção e auditoria',
  },
  {
    label: 'Sincronização ANVISA/ANS',
    value: 'Tokens seguros e logs auditáveis em tempo real',
  },
];

export default function GestaoCadastros() {
  const [activeTab, setActiveTab] = useState<string>('medicos');
  const [search, setSearch] = useState('');

  const filteredDoctors = useMemo(
    () =>
      DOCTORS_DATA.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(search.toLowerCase()) ||
          doctor.crm.toLowerCase().includes(search.toLowerCase()) ||
          doctor.hospital.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const handleTabChange = (key: Key) => setActiveTab(String(key));

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            OraclusX / Cadastros
          </p>
          <h1 className="text-2xl font-bold text-white">Gestão de Cadastros Inteligentes</h1>
          <p className="text-sm text-slate-400">
            Todas as entidades críticas validadas com IA, integrações oficiais e rastreabilidade.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="flat" color="secondary">
            Importar Base
          </Button>
          <Button color="primary" variant="shadow" startContent={<Plus size={18} />}>
            Novo Cadastro
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-white/5 border border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-0">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
            </CardHeader>
            <CardBody className="pt-2">
              <p className="text-sm text-white/90">{card.value}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            size="lg"
            radius="lg"
            label="Busca Global"
            placeholder="Buscar nomes, CRM, hospital ou convênio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="bordered"
            color="primary"
            startContent={<Filter size={16} />}
            className="border-white/20"
          >
            Filtros Avançados
          </Button>
        </div>

        <Tabs
          variant="underlined"
          color="primary"
          selectedKey={activeTab}
          onSelectionChange={handleTabChange}
          classNames={{
            tabList: 'gap-6 overflow-x-auto',
            cursor: 'bg-gradient-to-r from-cyan-400 to-indigo-500',
            tab: 'px-2',
            tabContent: 'group-data-[selected=true]:text-white text-slate-400',
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.id}
              title={
                <div className="flex items-center gap-2">
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                  <Chip size="sm" variant="flat" className="bg-white/10 text-white">
                    {tab.count.toLocaleString('pt-BR')}
                  </Chip>
                  {tab.draft && (
                    <Badge color="success" variant="flat">
                      {tab.draft}
                    </Badge>
                  )}
                </div>
              }
            >
              {tab.id === 'medicos' ? (
                <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
                  <CardBody className="p-0">
                    <Table
                      aria-label="Tabela de médicos"
                      removeWrapper
                      classNames={{
                        th: 'bg-transparent text-xs text-white/60 uppercase tracking-wide',
                        td: 'text-sm text-white/80',
                      }}
                    >
                      <TableHeader>
                        <TableColumn>MÉDICO</TableColumn>
                        <TableColumn>CRM</TableColumn>
                        <TableColumn>ESPECIALIDADE</TableColumn>
                        <TableColumn>HOSPITAL</TableColumn>
                        <TableColumn>CONTATO</TableColumn>
                        <TableColumn>PRECISÃO</TableColumn>
                      </TableHeader>
                      <TableBody items={filteredDoctors}>
                        {(doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar src={doctor.avatarUrl} size="md" />
                                <div>
                                  <p className="font-semibold text-white">{doctor.name}</p>
                                  <p className="text-xs text-white/50">{doctor.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{doctor.crm}</TableCell>
                            <TableCell>
                              <Chip color="secondary" variant="flat">
                                {doctor.specialty}
                              </Chip>
                            </TableCell>
                            <TableCell>{doctor.hospital}</TableCell>
                            <TableCell>{doctor.phone}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-300 font-semibold">
                                  {doctor.successRate}%
                                </span>
                                <Chip size="sm" color="success" variant="bordered">
                                  IA Score
                                </Chip>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              ) : (
                <Card className="bg-white/5 border border-dashed border-white/15 backdrop-blur-xl">
                  <CardBody className="text-center text-slate-300 flex flex-col gap-2 py-10">
                    <p className="text-lg font-semibold">Área em construção</p>
                    <p className="text-sm text-white/60">
                      Estamos aplicando o novo design do HeroUI para o módulo de {tab.label}. Em breve,
                      você poderá explorar dados completos e ações rápidas aqui.
                    </p>
                  </CardBody>
                </Card>
              )}
            </Tab>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
