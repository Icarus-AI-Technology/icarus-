import React, { useMemo, useState } from 'react';
import { User2, Building2, Users, ClipboardList, Briefcase, Filter } from 'lucide-react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';

const kpis: ModuleKpiItem[] = [
  {
    id: 'medicos',
    icon: User2,
    label: 'Médicos Cirurgiões',
    value: '1.847',
    subtitle: 'Ativos no mês',
    trend: '+12.5%',
    trendPositive: true,
  },
  {
    id: 'hospitais',
    icon: Building2,
    label: 'Hospitais & Clínicas',
    value: '142',
    subtitle: 'Rede credenciada',
    trend: '+4.1%',
    trendPositive: true,
  },
  {
    id: 'convenios',
    icon: ClipboardList,
    label: 'Convênios',
    value: '89',
    subtitle: 'Cobertura nacional',
    trend: '+2.0%',
    trendPositive: true,
  },
  {
    id: 'fornecedores',
    icon: Briefcase,
    label: 'Fornecedores',
    value: '256',
    subtitle: 'Produtos homologados',
    trend: '+5.2%',
    trendPositive: true,
  },
  {
    id: 'equipes',
    icon: Users,
    label: 'Equipes Médicas',
    value: '124',
    subtitle: 'Times ativos',
    trend: '+1.8%',
    trendPositive: true,
  },
];

const tabs: ModuleTabItem[] = [
  { id: 'medicos', label: 'Médicos Cirurgiões', count: 1847 },
  { id: 'equipes', label: 'Equipes Médicas', count: 124 },
  { id: 'hospitais', label: 'Hospitais & Clínicas', count: 142 },
  { id: 'convenios', label: 'Convênios', count: 89 },
  { id: 'fornecedores', label: 'Fornecedores', count: 256 },
];

const CADASTROS = [
  {
    id: 'MED001',
    nome: 'Dr. Roberto Silva',
    crm: '123456-SP',
    especialidade: 'Ortopedia',
    hospital: 'Hospital São Lucas',
    telefone: '(11) 98765-4321',
    cirurgias: 18,
  },
  {
    id: 'MED002',
    nome: 'Dra. Ana Paula Costa',
    crm: '234567-RJ',
    especialidade: 'Cardiologia',
    hospital: 'Hospital Sírio-Libanês',
    telefone: '(21) 97654-3210',
    cirurgias: 12,
  },
  {
    id: 'MED003',
    nome: 'Dr. Henrique Martins',
    crm: '987654-SP',
    especialidade: 'Neurologia',
    hospital: 'Hospital Albert Einstein',
    telefone: '(11) 98888-0000',
    cirurgias: 22,
  },
  {
    id: 'MED004',
    nome: 'Dra. Fernanda Rocha',
    crm: '456789-MG',
    especialidade: 'Cirurgia Geral',
    hospital: 'Hospital Mater Dei',
    telefone: '(31) 98989-7777',
    cirurgias: 15,
  },
];

const GestaoCadastrosIA: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('medicos');
  const [search, setSearch] = useState('');

  const filteredCadastros = useMemo(() => {
    const term = search.toLowerCase();
    return CADASTROS.filter((cadastro) =>
      [cadastro.nome, cadastro.crm, cadastro.especialidade, cadastro.hospital].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  }, [search]);

  return (
    <ModulePageNeumo
      title="Gestão de Cadastros IA"
      subtitle="Clientes médicos, hospitais, convênios e produtos OPME"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar médicos cirurgiões..."
      onSearchChange={setSearch}
      onFilterClick={() => alert('Filtros avançados em construção')}
      primaryActionLabel="+ Novo Médico"
      onPrimaryAction={() => alert('Ação: Novo médico')}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-white/70">Exibindo registros mais recentes</p>
        </div>
        <div className="flex gap-3">
          <button className="ic-card-neumo px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
            <Filter className="w-4 h-4" />
            Filtros rápidos
          </button>
          <Button variant="secondary">Exportar</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-white/70">
            <tr className="[&_th]:text-left [&_th]:pb-3">
              <th className="pr-4">ID</th>
              <th className="pr-4">Nome Completo</th>
              <th className="pr-4">CRM</th>
              <th className="pr-4">Especialidade</th>
              <th className="pr-4">Hospital Principal</th>
              <th className="pr-4">Telefone</th>
              <th>Cirurgias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCadastros.map((cadastro) => (
              <tr key={cadastro.id} className="align-middle">
                <td className="py-3 pr-4 opacity-80">{cadastro.id}</td>
                <td className="py-3 pr-4 text-violet-100 font-medium">{cadastro.nome}</td>
                <td className="py-3 pr-4 opacity-80">{cadastro.crm}</td>
                <td className="py-3 pr-4">
                  <span className="ic-kpi-pill px-3 py-1 text-xs">{cadastro.especialidade}</span>
                </td>
                <td className="py-3 pr-4 opacity-80">{cadastro.hospital}</td>
                <td className="py-3 pr-4 opacity-80">{cadastro.telefone}</td>
                <td className="py-3 opacity-80">{cadastro.cirurgias} nos últimos 30 dias</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModulePageNeumo>
  );
};

export default GestaoCadastrosIA;
