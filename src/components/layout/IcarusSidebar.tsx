/**
 * ICARUS v5.0 - Sidebar Completa
 * 58 módulos organizados hierarquicamente
 * Design: Standard HeroUI / Cyberpunk
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, Activity } from 'lucide-react';
import { Avatar, Tooltip } from "@heroui/react";

type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;
import * as Icons from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: SidebarItem[];
  badge?: string;
  status?: 'healthy' | 'warning' | 'critical';
  iconColor?: string;
}

export interface IcarusSidebarProps {
  collapsed: boolean;
  onNavigate?: (moduleId: string) => void;
}

// 58 MÓDULOS COMPLETOS CONFORME DOCUMENTAÇÃO E FIGMA
export const sidebarModules: SidebarItem[] = [
  // 1. DASHBOARD
  {
    id: 'dashboard',
    label: 'Dashboard Principal',
    icon: Icons.Home,
    path: '/dashboard',
    iconColor: 'text-secondary',
  },

  // 2. CADASTROS INTELIGENTES (9 sub-módulos)
  {
    id: 'cadastros',
    label: 'Cadastros Inteligentes',
    icon: Icons.ClipboardList,
    path: '/cadastros',
    iconColor: 'text-secondary',
    children: [
      {
        id: 'medicos',
        label: 'Médicos',
        icon: Icons.Stethoscope,
        path: '/cadastros/medicos',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'hospitais',
        label: 'Hospitais',
        icon: Icons.Building2,
        path: '/cadastros/hospitais',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'pacientes',
        label: 'Pacientes',
        icon: Icons.UserCheck,
        path: '/cadastros/pacientes',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'convenios',
        label: 'Convênios',
        icon: Icons.Shield,
        path: '/cadastros/convenios',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'fornecedores',
        label: 'Fornecedores',
        icon: Icons.Truck,
        path: '/cadastros/fornecedores',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'produtos-opme',
        label: 'Produtos OPME',
        icon: Icons.Package,
        path: '/cadastros/produtos',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'tabelas-precos',
        label: 'Tabelas de Preços',
        icon: Icons.DollarSign,
        path: '/cadastros/tabelas-precos',
        iconColor: 'text-success',
      },
      {
        id: 'equipes-medicas',
        label: 'Equipes Médicas',
        icon: Icons.Users,
        path: '/cadastros/equipes',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'transportadoras',
        label: 'Transportadoras',
        icon: Icons.Plane,
        path: '/cadastros/transportadoras',
        iconColor: 'text-secondary-400',
      },
    ],
  },

  // 3. COMPRAS E FORNECEDORES (6 sub-módulos)
  {
    id: 'compras',
    label: 'Compras e Fornecedores',
    icon: Icons.ShoppingCart,
    path: '/compras',
    iconColor: 'text-primary',
    children: [
      {
        id: 'cotacoes',
        label: 'Gestão de Cotações',
        icon: Icons.FileSearch,
        path: '/compras/cotacoes',
        iconColor: 'text-primary-400',
      },
      {
        id: 'pedidos-compra',
        label: 'Pedidos de Compra',
        icon: Icons.ShoppingBag,
        path: '/compras/pedidos',
        iconColor: 'text-primary-400',
      },
      {
        id: 'notas-compra',
        label: 'Notas de Compra',
        icon: Icons.FileText,
        path: '/compras/notas',
        iconColor: 'text-primary-400',
      },
      {
        id: 'compras-internacionais',
        label: 'Compras Internacionais',
        icon: Icons.Globe,
        path: '/compras/internacionais',
        iconColor: 'text-primary-400',
      },
      {
        id: 'ia-compras',
        label: 'IA para Compras',
        icon: Icons.Cpu,
        path: '/compras/ia',
        iconColor: 'text-primary-400',
      },
      {
        id: 'integracao-fornecedores',
        label: 'Integração Fornecedores',
        icon: Icons.Link,
        path: '/compras/integracao',
        iconColor: 'text-primary-400',
      },
    ],
  },

  // 4. GESTÃO DE CONTRATOS (5 sub-módulos)
  {
    id: 'contratos',
    label: 'Gestão de Contratos',
    icon: Icons.FileText,
    path: '/contratos',
    iconColor: 'text-secondary-600',
    children: [
      {
        id: 'gestao-contratos',
        label: 'Dashboard Contratos',
        icon: Icons.BarChart3,
        path: '/contratos/dashboard',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'contratos-fornecedores',
        label: 'Contratos Fornecedores',
        icon: Icons.Building2,
        path: '/contratos/fornecedores',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'contratos-hospitais',
        label: 'Contratos Hospitais',
        icon: Icons.Building2,
        path: '/contratos/hospitais',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'renovacoes',
        label: 'Renovações',
        icon: Icons.RefreshCcw,
        path: '/contratos/renovacoes',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'vencimentos-contratos',
        label: 'Vencimentos',
        icon: Icons.AlertTriangle,
        path: '/contratos/vencimentos',
        iconColor: 'text-secondary-500',
      },
    ],
  },

  // 5. VENDAS & CRM (4 sub-módulos)
  {
    id: 'crm-vendas',
    label: 'Vendas & CRM',
    icon: Icons.Briefcase,
    path: '/crm',
    iconColor: 'text-secondary',
    children: [
      {
        id: 'prospecoes',
        label: 'Prospecções',
        icon: Icons.TrendingUp,
        path: '/crm/prospecoes',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'propostas-comerciais',
        label: 'Propostas Comerciais',
        icon: Icons.FileText,
        path: '/crm/propostas',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'relacionamento-medicos',
        label: 'Relacionamento Médicos',
        icon: Icons.Stethoscope,
        path: '/crm/relacionamento',
        iconColor: 'text-secondary-400',
      },
      {
        id: 'vendas',
        label: 'Vendas & Contratos',
        icon: Icons.BarChart3,
        path: '/crm/vendas',
        iconColor: 'text-secondary-400',
      },
    ],
  },

  // 6. GESTÃO DE CIRURGIAS (4 sub-módulos)
  {
    id: 'cirurgias',
    label: 'Gestão de Cirurgias',
    icon: Icons.Ambulance,
    path: '/cirurgias',
    iconColor: 'text-danger',
    children: [
      {
        id: 'pedidos-pendentes',
        label: 'Pedidos Pendentes',
        icon: Icons.Clock,
        path: '/cirurgias/pendentes',
        iconColor: 'text-danger-400',
      },
      {
        id: 'preparacao-kits',
        label: 'Preparação de Kits',
        icon: Icons.Package,
        path: '/cirurgias/kits',
        iconColor: 'text-danger-400',
      },
      {
        id: 'acompanhamento',
        label: 'Acompanhamento',
        icon: Icons.Calendar,
        path: '/cirurgias/acompanhamento',
        iconColor: 'text-danger-400',
      },
      {
        id: 'pos-cirurgico',
        label: 'Pós-Cirúrgico',
        icon: Icons.CheckCircle,
        path: '/cirurgias/pos-cirurgico',
        iconColor: 'text-danger-400',
      },
    ],
  },

  // 7. ESTOQUE INTELIGENTE (4 sub-módulos)
  {
    id: 'estoque-ia',
    label: 'Estoque Inteligente',
    icon: Icons.Package,
    path: '/estoque',
    iconColor: 'text-primary',
    children: [
      {
        id: 'estoque-dashboard',
        label: 'Visão Geral',
        icon: Icons.Activity,
        path: '/estoque/dashboard',
        iconColor: 'text-primary-400',
      },
      {
        id: 'containers-iot',
        label: 'Containers IoT',
        icon: Icons.Database,
        path: '/estoque/containers',
        iconColor: 'text-primary-400',
      },
      {
        id: 'scanner-rfid',
        label: 'Scanner RFID',
        icon: Icons.Scan,
        path: '/estoque/scanner',
        iconColor: 'text-primary-400',
      },
      {
        id: 'inventario',
        label: 'Inventário',
        icon: Icons.ClipboardList,
        path: '/estoque/inventario',
        iconColor: 'text-primary-400',
      },
    ],
  },

  // 8. CONSIGNAÇÃO AVANÇADA (5 sub-módulos)
  {
    id: 'consignacao',
    label: 'Consignação Avançada',
    icon: Icons.Archive,
    path: '/consignacao',
    iconColor: 'text-secondary',
    children: [
      {
        id: 'consignacao-avancada',
        label: 'Visão Geral',
        icon: Icons.BarChart3,
        path: '/consignacao/dashboard',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'materiais-consignados',
        label: 'Materiais Consignados',
        icon: Icons.Package,
        path: '/consignacao/materiais',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'faturamento-consignacao',
        label: 'Faturamento',
        icon: Icons.FileText,
        path: '/consignacao/faturamento',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'financeiro-consignacao',
        label: 'Financeiro',
        icon: Icons.DollarSign,
        path: '/consignacao/financeiro',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'hospitais-consignacao',
        label: 'Hospitais',
        icon: Icons.Building2,
        path: '/consignacao/hospitais',
        iconColor: 'text-secondary-500',
      },
    ],
  },

  // 9. LOGÍSTICA AVANÇADA (4 sub-módulos)
  {
    id: 'logistica',
    label: 'Logística Avançada',
    icon: Icons.Navigation,
    path: '/logistica',
    iconColor: 'text-warning',
    children: [
      {
        id: 'rastreamento',
        label: 'Rastreamento Real-Time',
        icon: Icons.Target,
        path: '/logistica/rastreamento',
        iconColor: 'text-warning-400',
      },
      {
        id: 'entregas',
        label: 'Entregas Ativas',
        icon: Icons.Truck,
        path: '/logistica/entregas',
        iconColor: 'text-warning-400',
      },
      {
        id: 'rotas',
        label: 'Otimização de Rotas',
        icon: Icons.Globe,
        path: '/logistica/rotas',
        iconColor: 'text-warning-400',
      },
      {
        id: 'transportadoras',
        label: 'Transportadoras ANVISA',
        icon: Icons.Plane,
        path: '/logistica/transportadoras',
        iconColor: 'text-warning-400',
      },
    ],
  },

  // 10. FATURAMENTO AVANÇADO
  {
    id: 'faturamento-avancado',
    label: 'Faturamento Avançado',
    icon: Icons.Receipt,
    path: '/faturamento',
    iconColor: 'text-success-600',
  },

  // 11. FINANCEIRO AVANÇADO (5 sub-módulos)
  {
    id: 'financeiro',
    label: 'Financeiro Avançado',
    icon: Icons.DollarSign,
    path: '/financeiro',
    iconColor: 'text-success',
    children: [
      {
        id: 'financeiro-dashboard',
        label: 'Dashboard Financeiro',
        icon: Icons.BarChart3,
        path: '/financeiro/dashboard',
        iconColor: 'text-success-500',
      },
      {
        id: 'dda-bancario',
        label: 'DDA Bancário',
        icon: Icons.Building2,
        path: '/financeiro/dda',
        iconColor: 'text-success-500',
      },
      {
        id: 'sefaz-nfe',
        label: 'SEFAZ NFe',
        icon: Icons.FileText,
        path: '/financeiro/sefaz',
        iconColor: 'text-success-500',
      },
      {
        id: 'conciliacao',
        label: 'Conciliação',
        icon: Icons.BarChart3,
        path: '/financeiro/conciliacao',
        iconColor: 'text-success-500',
      },
      {
        id: 'faturamento-financeiro',
        label: 'Faturamento',
        icon: Icons.DollarSign,
        path: '/financeiro/faturamento',
        iconColor: 'text-success-500',
      },
    ],
  },

  // 12. ANALYTICS & BI (4 sub-módulos)
  {
    id: 'analytics',
    label: 'Analytics & BI',
    icon: Icons.BarChart3,
    path: '/analytics',
    iconColor: 'text-primary-600',
    children: [
      {
        id: 'paineis-controle',
        label: 'Painéis Controle',
        icon: Icons.BarChart3,
        path: '/analytics/paineis',
        iconColor: 'text-primary-500',
      },
      {
        id: 'relatorios-ia',
        label: 'Relatórios IA',
        icon: Icons.FileText,
        path: '/analytics/relatorios',
        iconColor: 'text-primary-500',
      },
      {
        id: 'kpis',
        label: 'KPIs',
        icon: Icons.TrendingUp,
        path: '/analytics/kpis',
        iconColor: 'text-primary-500',
      },
      {
        id: 'previsoes',
        label: 'Previsões IA',
        icon: Icons.Lightbulb,
        path: '/analytics/previsoes',
        iconColor: 'text-primary-500',
      },
    ],
  },

  // 13. COMPLIANCE & AUDITORIA (3 sub-módulos)
  {
    id: 'compliance',
    label: 'Compliance & Auditoria',
    icon: Icons.Shield,
    path: '/compliance',
    iconColor: 'text-danger',
    children: [
      {
        id: 'auditorias',
        label: 'Auditorias',
        icon: Icons.Shield,
        path: '/compliance/auditorias',
        iconColor: 'text-danger-500',
      },
      {
        id: 'anvisa',
        label: 'Regulamentações ANVISA',
        icon: Icons.FileText,
        path: '/compliance/anvisa',
        iconColor: 'text-danger-500',
      },
      {
        id: 'documentos',
        label: 'Documentos',
        icon: Icons.FileText,
        path: '/compliance/documentos',
        iconColor: 'text-danger-500',
      },
    ],
  },

  // 14. RASTREABILIDADE OPME (5 sub-módulos)
  {
    id: 'rastreabilidade',
    label: 'Rastreabilidade OPME',
    icon: Icons.Activity,
    path: '/rastreabilidade',
    iconColor: 'text-success',
    children: [
      {
        id: 'rastreabilidade-dashboard',
        label: 'Dashboard Rastreamento',
        icon: Icons.BarChart3,
        path: '/rastreabilidade/dashboard',
        iconColor: 'text-success-500',
      },
      {
        id: 'rastreamento-produtos',
        label: 'Produtos Rastreados',
        icon: Icons.Package,
        path: '/rastreabilidade/produtos',
        iconColor: 'text-success-500',
      },
      {
        id: 'tracking-materiais',
        label: 'Por Paciente',
        icon: Icons.Users,
        path: '/rastreabilidade/pacientes',
        iconColor: 'text-success-500',
      },
      {
        id: 'historico-produtos',
        label: 'Histórico & Alertas',
        icon: Icons.AlertTriangle,
        path: '/rastreabilidade/historico',
        iconColor: 'text-success-500',
      },
      {
        id: 'mapa-rastreabilidade',
        label: 'Mapa Geográfico',
        icon: Icons.MapPin,
        path: '/rastreabilidade/mapa',
        iconColor: 'text-success-500',
      },
    ],
  },

  // 15. MANUTENÇÃO PREVENTIVA (5 sub-módulos)
  {
    id: 'manutencao',
    label: 'Manutenção Preventiva',
    icon: Icons.Wrench,
    path: '/manutencao',
    iconColor: 'text-warning',
    children: [
      {
        id: 'manutencao-dashboard',
        label: 'Visão Geral',
        icon: Icons.BarChart3,
        path: '/manutencao/dashboard',
        iconColor: 'text-warning-500',
      },
      {
        id: 'equipamentos-medicos',
        label: 'Equipamentos Médicos',
        icon: Icons.Wrench,
        path: '/manutencao/equipamentos',
        iconColor: 'text-warning-500',
      },
      {
        id: 'agendamento-manutencao',
        label: 'Agendamentos',
        icon: Icons.Calendar,
        path: '/manutencao/agendamentos',
        iconColor: 'text-warning-500',
      },
      {
        id: 'performance-equipamentos',
        label: 'Performance',
        icon: Icons.TrendingUp,
        path: '/manutencao/performance',
        iconColor: 'text-warning-500',
      },
      {
        id: 'historico-manutencao',
        label: 'Histórico',
        icon: Icons.ClipboardList,
        path: '/manutencao/historico',
        iconColor: 'text-warning-500',
      },
    ],
  },

  // 16. ANALYTICS PREDITIVO IA (5 sub-módulos)
  {
    id: 'analytics-predicao',
    label: 'Analytics Preditivo IA',
    icon: Icons.Cpu,
    path: '/analytics-ia',
    iconColor: 'text-secondary',
    children: [
      {
        id: 'analytics-ia-dashboard',
        label: 'Visão Geral',
        icon: Icons.BarChart3,
        path: '/analytics-ia/dashboard',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'predicoes-ia',
        label: 'Predições',
        icon: Icons.Lightbulb,
        path: '/analytics-ia/predicoes',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'modelos-ia',
        label: 'Modelos IA',
        icon: Icons.Cpu,
        path: '/analytics-ia/modelos',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'tendencias-mercado',
        label: 'Tendências',
        icon: Icons.TrendingUp,
        path: '/analytics-ia/tendencias',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'insights-ia',
        label: 'Insights',
        icon: Icons.Lightbulb,
        path: '/analytics-ia/insights',
        iconColor: 'text-secondary-500',
      },
    ],
  },

  // 17. TELEMETRIA IoT
  {
    id: 'telemetria-iot',
    label: 'Telemetria IoT',
    icon: Icons.Activity,
    path: '/telemetria',
    iconColor: 'text-primary',
  },

  // 18. RELATÓRIOS REGULATÓRIOS
  {
    id: 'relatorios-regulatorios',
    label: 'Relatórios Regulatórios',
    icon: Icons.Shield,
    path: '/relatorios-regulatorios',
    iconColor: 'text-danger',
  },

  // 19. IA CENTRAL (3 sub-módulos)
  {
    id: 'ia-central',
    label: 'IA Central',
    icon: Icons.Lightbulb,
    path: '/ia-central',
    iconColor: 'text-secondary',
    children: [
      {
        id: 'central-ia-dashboard',
        label: 'Dashboard IA',
        icon: Icons.BarChart3,
        path: '/ia-central/dashboard',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'orquestrador-ia',
        label: 'Orquestrador',
        icon: Icons.Zap,
        path: '/ia-central/orquestrador',
        iconColor: 'text-secondary-500',
      },
      {
        id: 'chatbot-metrics',
        label: 'Chatbot Analytics',
        icon: Icons.MessageSquare,
        path: '/ia-central/chatbot',
        iconColor: 'text-secondary-500',
      },
    ],
  },

  // 20. API GATEWAY
  {
    id: 'api-gateway',
    label: 'API Gateway',
    icon: Icons.Globe,
    path: '/api-gateway',
    iconColor: 'text-secondary',
  },
];

export const IcarusSidebar: React.FC<IcarusSidebarProps> = ({ collapsed, onNavigate }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderItem = (item: SidebarItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <div key={item.id} className="mb-1">
        <Link
          to={item.path || '#'}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            }
            if (onNavigate) {
              onNavigate(item.id);
            }
          }}
          className={cn(
            'flex items-center px-3 py-2.5 mx-2 rounded-xl transition-all duration-200 group',
            active 
              ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(45,212,191,0.15)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          {collapsed ? (
            <Tooltip content={item.label} placement="right" color="primary">
              <Icon size={20} className={cn(active && "text-primary")} />
            </Tooltip>
          ) : (
            <>
              <Icon size={20} className={cn("mr-3", active ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
              {hasChildren && (
                <ChevronDown 
                  size={16} 
                  className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")} 
                />
              )}
            </>
          )}
        </Link>

        {!collapsed && hasChildren && isExpanded && (
          <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
            {item.children?.map((child) => {
              const childActive = isActive(child.path);
              return (
                <Link
                  key={child.id}
                  to={child.path || '#'}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                    childActive 
                      ? "text-primary font-medium bg-primary/5" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  )}
                >
                  <child.icon size={16} className="mr-2" />
                  <span className="truncate">{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col',
        'bg-[#0b0d16]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl',
        collapsed ? 'w-[88px]' : 'w-[290px]'
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-white/5 mb-4">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-6 w-full")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Activity className="text-white" size={24} />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-lg font-bold text-white tracking-tight truncate">
                ICARUS
              </span>
              <span className="text-[10px] font-semibold text-primary tracking-widest uppercase truncate">
                Enterprise v5.0
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        <div className="space-y-1">{sidebarModules.map((item) => renderItem(item))}</div>
      </div>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-white/5 bg-white/5">
        <button className={cn(
          "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group",
          collapsed ? "justify-center" : ""
        )}>
          <Avatar
            src="https://i.pravatar.cc/150?u=admin"
            isBordered
            color="primary"
            size="sm"
          />
          {!collapsed && (
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm font-bold text-white truncate w-full text-left">
                Roberto Silva
              </span>
              <span className="text-xs text-slate-400 truncate w-full text-left">Gerente Comercial</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
