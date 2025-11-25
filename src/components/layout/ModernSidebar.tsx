import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IcarusBrain } from '@/components/icons/IcarusBrain';

interface ModernSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/v5/dashboard' },
  { icon: Users, label: 'Cadastros', path: '/v5/cadastros' },
  { icon: Package, label: 'Produtos OPME', path: '/v5/produtos' },
  { icon: FileText, label: 'Pedidos', path: '/v5/pedidos' },
  { icon: ShoppingCart, label: 'Compras', path: '/v5/compras' },
  { icon: TrendingUp, label: 'Vendas', path: '/v5/vendas' },
  { icon: DollarSign, label: 'Financeiro', path: '/v5/financeiro' },
  { icon: ShieldCheck, label: 'Compliance', path: '/v5/compliance' },
  { icon: BarChart3, label: 'Relatórios', path: '/v5/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/v5/configuracoes' },
];

export function ModernSidebar({ collapsed, onToggle }: ModernSidebarProps) {
  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-600">
            <IcarusBrain className="w-7 h-7" size={28} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">ICARUS</span>
              <span className="text-xs text-slate-500">v5.0</span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-slate-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-slate-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-slate-50',
                  isActive ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:text-slate-900',
                  collapsed && 'justify-center'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <IcarusBrain className="w-5 h-5" size={20} glow={false} />
            <span>Powered by Icarus AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
