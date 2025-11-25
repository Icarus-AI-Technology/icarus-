// React is automatically imported in JSX transform
import { Plus, FileText, Calculator, UserPlus, FileBarChart, Settings } from 'lucide-react';

const ACTIONS = [
  { label: 'Novo Pedido', icon: Plus },
  { label: 'Nova NF', icon: FileText },
  { label: 'Orçamento', icon: Calculator },
  { label: 'Cadastro', icon: UserPlus },
  { label: 'Relatórios', icon: FileBarChart },
  { label: 'Configurar', icon: Settings },
];

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {ACTIONS.map((action, index) => (
        <button
          key={index}
          className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-violet-600 text-white shadow-[0_8px_16px_rgba(124,58,237,0.3)] hover:bg-violet-700 hover:shadow-[0_12px_20px_rgba(124,58,237,0.4)] hover:-translate-y-1 transition-all duration-300 active:scale-95"
        >
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <action.icon size={24} className="text-white" />
          </div>
          <span className="text-sm font-semibold">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
