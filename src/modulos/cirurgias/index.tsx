import React, { useState } from 'react';
import { NavigationBar } from '@/components/oraclusx-ds/NavigationBar';
import { SubModulesNavigation } from '@/components/oraclusx-ds/SubModulesNavigation';
import { CardKpi } from '@/components/oraclusx-ds/CardKpi';
import { Button } from '@/components/oraclusx-ds/Button';
import { Plus, Calendar, Activity, AlertCircle } from 'lucide-react';

export default function CirurgiasPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const kpis = [
    {
      label: 'Cirurgias Hoje',
      value: '12',
      trend: { percentage: 2, direction: 'up' as const },
      icon: Activity,
      iconColor: 'text-blue-500',
    },
    {
      label: 'Agendadas (7 dias)',
      value: '45',
      trend: { percentage: 5, direction: 'up' as const },
      icon: Calendar,
      iconColor: 'text-purple-500',
    },
    {
      label: 'Pendentes OPME',
      value: '8',
      trend: { percentage: 1, direction: 'down' as const },
      icon: AlertCircle,
      iconColor: 'text-orange-500',
    },
  ];

  const cirurgias = [
    {
      id: 1,
      paciente: 'João Silva',
      procedimento: 'Artroplastia Total de Joelho',
      data: '2025-11-19',
      status: 'Agendada',
      medico: 'Dr. Santos',
    },
    {
      id: 2,
      paciente: 'Maria Oliveira',
      procedimento: 'Angioplastia',
      data: '2025-11-19',
      status: 'Em Andamento',
      medico: 'Dra. Costa',
    },
    {
      id: 3,
      paciente: 'Pedro Souza',
      procedimento: 'Hernioplastia',
      data: '2025-11-20',
      status: 'Pendente OPME',
      medico: 'Dr. Lima',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <NavigationBar 
        tabs={[
          { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
          { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
          { id: 'solicitacoes', label: 'Solicitações', icon: <AlertCircle className="w-4 h-4" /> },
          { id: 'opme', label: 'OPME', icon: <Plus className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="p-6 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Gestão de Cirurgias
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Controle de procedimentos e OPME
            </p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Nova Cirurgia
          </Button>
        </header>

        <SubModulesNavigation
          title="Submódulos"
          subModules={[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'agenda', label: 'Agenda' },
            { id: 'solicitacoes', label: 'Solicitações' },
            { id: 'opme', label: 'OPME' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi, index) => (
            <CardKpi key={index} {...kpi} />
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Próximas Cirurgias</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Placeholder para Tabela Real - Usando estrutura simples por enquanto se o componente Table for complexo */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-medium">Paciente</th>
                    <th className="p-4 font-medium">Procedimento</th>
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium">Médico</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {cirurgias.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-4 font-medium">{c.paciente}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{c.procedimento}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{c.data}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{c.medico}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${
                              c.status === 'Agendada'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : c.status === 'Em Andamento'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
