import { Search, Filter } from 'lucide-react';
import { Users, Building2, FileText, Package, Truck, DollarSign } from 'lucide-react';
import { RichTabs } from '../../features/modern-cadastros/components/RichTabs';
import { MedicosTable } from '../../features/modern-cadastros/components/MedicosTable';
import { mockMedicos } from '../../features/modern-cadastros/data/mockMedicos';
import { useCadastrosStore } from '../../features/modern-cadastros/store/cadastrosStore';
import { Button } from '@/components/oraclusx-ds/Button';

const tabsData = [
  {
    id: 'medicos',
    icon: Users,
    label: 'Médicos Cirurgiões',
    count: 847,
    newCount: 15,
  },
  {
    id: 'hospitais',
    icon: Building2,
    label: 'Hospitais & Clínicas',
    count: 234,
    newCount: 8,
  },
  {
    id: 'convenios',
    icon: FileText,
    label: 'Convênios',
    count: 156,
    newCount: 3,
  },
  {
    id: 'fornecedores',
    icon: Truck,
    label: 'Fornecedores',
    count: 423,
    newCount: 12,
  },
  {
    id: 'produtos',
    icon: Package,
    label: 'Produtos OPME',
    count: 2418,
    newCount: 45,
  },
  {
    id: 'tabelas',
    icon: DollarSign,
    label: 'Tabelas de Preços',
    count: 89,
    newCount: 2,
  },
];

export function ModernCadastros() {
  const { activeTab } = useCadastrosStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestão de Cadastros IA</h1>
        <p className="text-slate-500 mt-1">
          Gerencie todos os cadastros do sistema com inteligência artificial
        </p>
      </div>

      {/* Rich Tabs */}
      <RichTabs tabs={tabsData} />

      {/* Search and Filters Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar ${
              tabsData.find((t) => t.id === activeTab)?.label.toLowerCase() || 'registros'
            }...`}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Content Area - Changes based on active tab */}
      <div className="mt-6">
        {activeTab === 'medicos' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Lista de Médicos Cirurgiões</h2>
              <Button className="bg-violet-600 hover:bg-violet-700">+ Novo Médico</Button>
            </div>
            <MedicosTable data={mockMedicos} />
          </div>
        )}

        {activeTab === 'hospitais' && (
          <div className="modern-card p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hospitais & Clínicas</h3>
            <p className="text-slate-600">Visualização de hospitais será implementada aqui</p>
          </div>
        )}

        {activeTab === 'convenios' && (
          <div className="modern-card p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Convênios</h3>
            <p className="text-slate-600">Visualização de convênios será implementada aqui</p>
          </div>
        )}

        {activeTab === 'fornecedores' && (
          <div className="modern-card p-8 text-center">
            <Truck className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Fornecedores</h3>
            <p className="text-slate-600">Visualização de fornecedores será implementada aqui</p>
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="modern-card p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Produtos OPME</h3>
            <p className="text-slate-600">Visualização de produtos será implementada aqui</p>
          </div>
        )}

        {activeTab === 'tabelas' && (
          <div className="modern-card p-8 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tabelas de Preços</h3>
            <p className="text-slate-600">Visualização de tabelas será implementada aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
