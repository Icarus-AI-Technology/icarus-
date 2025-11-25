import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Shield, Zap, UserCheck } from 'lucide-react';
import { Modal } from '../../components/Modal';

interface StatusBadgeProps {
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    Ativo: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    Pendente: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Bloqueado: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  const dotColor = {
    Ativo: 'bg-emerald-400',
    Pendente: 'bg-amber-400',
    Bloqueado: 'bg-red-400',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${styles[status]}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`}></div>
      {status}
    </span>
  );
};

const mockData = [
  {
    id: 1,
    name: 'Dr. Roberto Silva',
    role: 'Neurocirurgião',
    crm: '52341-SP',
    status: 'Ativo' as const,
    avatar: '33',
    hospital: 'Albert Einstein',
  },
  {
    id: 2,
    name: 'Dra. Julia Mendes',
    role: 'Cardiologista',
    crm: '12933-RJ',
    status: 'Pendente' as const,
    avatar: '44',
    hospital: 'Copa Star',
  },
  {
    id: 3,
    name: 'Dr. Carlos H. Lima',
    role: 'Ortopedista',
    crm: '99281-MG',
    status: 'Ativo' as const,
    avatar: '12',
    hospital: 'Mater Dei',
  },
  {
    id: 4,
    name: 'Dra. Ana Clara',
    role: 'Anestesista',
    crm: '88273-SP',
    status: 'Bloqueado' as const,
    avatar: '25',
    hospital: 'Sírio Libanês',
  },
  {
    id: 5,
    name: 'Dr. Pedro Quintão',
    role: 'Cirurgião Geral',
    crm: '44212-SP',
    status: 'Ativo' as const,
    avatar: '67',
    hospital: 'Vila Nova Star',
  },
];

export const Cadastros: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Cadastros Inteligentes</h2>
          <p className="text-gray-400 text-sm">Gerenciamento de médicos e credenciamentos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Cadastro
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181b29] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Total Ativos
            </p>
            <h4 className="text-2xl font-bold text-white">1,847</h4>
          </div>
        </div>
        <div className="bg-[#181b29] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Credenciamentos
            </p>
            <h4 className="text-2xl font-bold text-white">28</h4>
          </div>
        </div>
        <div className="bg-[#181b29] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Eficiência IA
            </p>
            <h4 className="text-2xl font-bold text-white">99.1%</h4>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#181b29] p-2 rounded-2xl mb-6 border border-white/5 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex items-center bg-[#11131f] rounded-xl px-4 py-2.5 w-full md:w-96 border border-white/5 focus-within:border-indigo-500/50 transition-colors">
          <Search className="text-gray-500 mr-3" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, CRM ou hospital..."
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button className="px-4 py-2.5 bg-[#11131f] hover:bg-gray-800 text-gray-300 rounded-xl border border-white/5 text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter size={16} /> Filtros
          </button>
          <button className="px-4 py-2.5 bg-[#11131f] hover:bg-gray-800 text-gray-300 rounded-xl border border-white/5 text-sm font-medium flex items-center gap-2 transition-colors">
            Exportar
          </button>
        </div>
      </div>

      {/* Tabela com Linhas Flutuantes */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <table className="w-full border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr className="text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Médico
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                CRM/UF
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockData.map((item) => (
              <tr
                key={item.id}
                className="bg-[#181b29] hover:bg-[#1f2233] transition-all duration-200 group shadow-sm hover:shadow-md hover:translate-x-1"
              >
                <td className="px-6 py-4 rounded-l-2xl border-y border-l border-white/5 group-hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://i.pravatar.cc/150?img=${item.avatar}`}
                      alt={item.name}
                      className="w-10 h-10 rounded-full border-2 border-[#181b29] group-hover:border-indigo-500 transition-colors"
                    />
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-y border-white/5 group-hover:border-white/10 text-gray-300">
                  {item.hospital}
                </td>
                <td className="px-6 py-4 border-y border-white/5 group-hover:border-white/10 text-gray-400 font-mono">
                  {item.crm}
                </td>
                <td className="px-6 py-4 border-y border-white/5 group-hover:border-white/10">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 rounded-r-2xl border-y border-r border-white/5 group-hover:border-white/10 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Novo Especialista"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Seção de Upload de Foto */}
          <div className="flex items-center gap-6 pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-full bg-[#11131f] border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors group">
              <Plus className="text-gray-500 group-hover:text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Foto de Perfil</p>
              <p className="text-xs text-gray-500 mt-1">Recomendado: 400x400px (PNG, JPG)</p>
            </div>
          </div>

          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: Dr. Roberto Silva"
                className="w-full bg-[#11131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">
                E-mail Corporativo
              </label>
              <input
                type="email"
                placeholder="medico@hospital.com"
                className="w-full bg-[#11131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">Especialidade</label>
              <select className="w-full bg-[#11131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                <option>Neurocirurgia</option>
                <option>Cardiologia</option>
                <option>Ortopedia</option>
                <option>Anestesiologia</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">CRM / UF</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="12345"
                  className="flex-1 bg-[#11131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
                />
                <input
                  type="text"
                  placeholder="SP"
                  className="w-20 bg-[#11131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600 text-center uppercase"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">
              Status do Credenciamento
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Ativo', 'Pendente', 'Bloqueado'].map((status) => (
                <label key={status} className="cursor-pointer">
                  <input type="radio" name="status" className="peer sr-only" />
                  <div className="p-3 rounded-xl border border-white/10 bg-[#11131f] text-center text-sm text-gray-400 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-500 hover:bg-white/5 transition-all">
                    {status}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 transition-colors"
            >
              Salvar Especialista
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
