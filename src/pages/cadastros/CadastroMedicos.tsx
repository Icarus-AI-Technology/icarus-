import React, { useState } from 'react';
import {
  User2,
  Plus,
  Filter,
  MoreVertical,
  FileSpreadsheet,
  Stethoscope,
  Building2,
  Activity,
} from 'lucide-react';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { MiniCardNeumo } from '../../components/oraclusx-ds/MiniCardNeumo';
import { SearchBarNeumo } from '../../components/oraclusx-ds/SearchBarNeumo';
import { Button } from '../../components/oraclusx-ds/Button';

// Mock data to match the print
const MOCK_MEDICOS = [
  {
    id: 'MED001',
    nome: 'Dr. Roberto Silva',
    crm: '123456-SP',
    especialidade: 'Ortopedia',
    hospital: 'Hospital São Lucas',
    telefone: '(11) 98765-4321',
    cirurgias: '18 nos últimos 30 dias',
    status: 'active',
  },
  {
    id: 'MED002',
    nome: 'Dra. Ana Paula Costa',
    crm: '234567-RJ',
    especialidade: 'Cardiologia',
    hospital: 'Hospital Sírio-Libanês',
    telefone: '(21) 97654-3210',
    cirurgias: '12 nos últimos 30 dias',
    status: 'active',
  },
  {
    id: 'MED003',
    nome: 'Dr. Carlos Eduardo',
    crm: '345678-MG',
    especialidade: 'Neurologia',
    hospital: 'Hospital Mater Dei',
    telefone: '(31) 96543-2109',
    cirurgias: '8 nos últimos 30 dias',
    status: 'inactive',
  },
  {
    id: 'MED004',
    nome: 'Dra. Fernanda Lima',
    crm: '456789-RS',
    especialidade: 'Dermatologia',
    hospital: 'Hospital Moinhos de Vento',
    telefone: '(51) 95432-1098',
    cirurgias: '24 nos últimos 30 dias',
    status: 'active',
  },
  {
    id: 'MED005',
    nome: 'Dr. Ricardo Santos',
    crm: '567890-PR',
    especialidade: 'Ortopedia',
    hospital: 'Hospital Pequeno Príncipe',
    telefone: '(41) 94321-0987',
    cirurgias: '15 nos últimos 30 dias',
    status: 'active',
  },
];

const CadastroMedicos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SubModuleLayout
      title="Médicos Cirurgiões"
      subtitle="Gerenciamento de base de médicos parceiros"
      breadcrumbs={[{ label: 'Cadastros' }, { label: 'Médicos', path: '/cadastros/medicos' }]}
      actions={
        <>
          <Button variant="neumo" className="p-2" aria-label="Filtrar médicos">
            <Filter size={20} />
          </Button>
          <Button
            variant="neumo"
            color="primary"
            leftIcon={Plus}
            className="shadow-[0_4px_14px_rgba(99,102,241,0.4)]"
          >
            Novo Médico
          </Button>
        </>
      }
      stats={
        <>
          <MiniCardNeumo
            label="Total de Médicos"
            value={847}
            icon={User2}
            trend="+12%"
            trendPositive={true}
          />
          <MiniCardNeumo
            label="Cirurgiões Ativos"
            value={624}
            icon={Stethoscope}
            trend="+5%"
            trendPositive={true}
          />
          <MiniCardNeumo label="Hospitais" value={142} icon={Building2} />
          <MiniCardNeumo
            label="Cirurgias/Mês"
            value={1250}
            icon={Activity}
            trend="+8%"
            trendPositive={true}
          />
          <MiniCardNeumo
            label="Novos Cadastros"
            value={28}
            icon={FileSpreadsheet}
            trend="-2%"
            trendPositive={false}
          />
        </>
      }
    >
      <div className="flex flex-col">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBarNeumo
              placeholder="Buscar por nome, CRM ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Mostrando <span className="font-semibold text-slate-800 dark:text-white">1-10</span>{' '}
              de <span className="font-semibold text-slate-800 dark:text-white">847</span>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nome Completo</th>
                <th className="px-6 py-4 font-semibold">CRM</th>
                <th className="px-6 py-4 font-semibold">Especialidade</th>
                <th className="px-6 py-4 font-semibold">Hospital Principal</th>
                <th className="px-6 py-4 font-semibold">Telefone</th>
                <th className="px-6 py-4 font-semibold">Cirurgias</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {MOCK_MEDICOS.map((medico) => (
                <tr
                  key={medico.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                    {medico.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                        {medico.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {medico.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{medico.crm}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {medico.especialidade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {medico.hospital}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {medico.telefone}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {medico.cirurgias}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Ações do médico"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-50">
            Anterior
          </button>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-indigo-500 text-white text-sm font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
              3
            </button>
            <span className="text-slate-400">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
              12
            </button>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            Próximo
          </button>
        </div>
      </div>
    </SubModuleLayout>
  );
};

export default CadastroMedicos;
