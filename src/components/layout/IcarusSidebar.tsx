/**
 * ICARUS v5.0 - Sidebar Completa
 * 58 módulos organizados hierarquicamente
 * Design: Neuromórfico Premium 3D (OraclusX DS)
 */

import React, { useState } from"react";
import { Link, useLocation } from"react-router-dom";
import { ChevronDown, ChevronRight, type LucideIcon } from"lucide-react";
import * as Icons from"lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: SidebarItem[];
  badge?: string;
  status?:"healthy" |"warning" |"critical";
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
    id:"dashboard",
    label:"Dashboard Principal",
    icon: Icons.Home,
    path:"/dashboard",
    iconColor:"text-indigo-500",
  },

  // 2. CADASTROS INTELIGENTES (9 sub-módulos)
  {
    id:"cadastros",
    label:"Cadastros Inteligentes",
    icon: Icons.ClipboardList,
    path:"/cadastros",
    iconColor:"text-indigo-500",
    children: [
      {
        id:"medicos",
        label:"Médicos",
        icon: Icons.Stethoscope,
        path:"/cadastros/medicos",
        iconColor:"text-indigo-400",
      },
      {
        id:"hospitais",
        label:"Hospitais",
        icon: Icons.Building2,
        path:"/cadastros/hospitais",
        iconColor:"text-indigo-400",
      },
      {
        id:"pacientes",
        label:"Pacientes",
        icon: Icons.UserCheck,
        path:"/cadastros/pacientes",
        iconColor:"text-indigo-400",
      },
      {
        id:"convenios",
        label:"Convênios",
        icon: Icons.Shield,
        path:"/cadastros/convenios",
        iconColor:"text-indigo-400",
      },
      {
        id:"fornecedores",
        label:"Fornecedores",
        icon: Icons.Truck,
        path:"/cadastros/fornecedores",
        iconColor:"text-indigo-400",
      },
      {
        id:"produtos-opme",
        label:"Produtos OPME",
        icon: Icons.Package,
        path:"/cadastros/produtos",
        iconColor:"text-indigo-400",
      },
      {
        id:"tabelas-precos",
        label:"Tabelas de Preços",
        icon: Icons.DollarSign,
        path:"/cadastros/tabelas-precos",
        iconColor:"text-green-500",
      },
      {
        id:"equipes-medicas",
        label:"Equipes Médicas",
        icon: Icons.Users,
        path:"/cadastros/equipes",
        iconColor:"text-indigo-400",
      },
      {
        id:"transportadoras",
        label:"Transportadoras",
        icon: Icons.Plane,
        path:"/cadastros/transportadoras",
        iconColor:"text-indigo-400",
      },
    ],
  },

  // 3. COMPRAS E FORNECEDORES (6 sub-módulos)
  {
    id:"compras",
    label:"Compras e Fornecedores",
    icon: Icons.ShoppingCart,
    path:"/compras",
    iconColor:"text-blue-500",
    children: [
      {
        id:"cotacoes",
        label:"Gestão de Cotações",
        icon: Icons.FileSearch,
        path:"/compras/cotacoes",
        iconColor:"text-blue-400",
      },
      {
        id:"pedidos-compra",
        label:"Pedidos de Compra",
        icon: Icons.ShoppingBag,
        path:"/compras/pedidos",
        iconColor:"text-blue-400",
      },
      {
        id:"notas-compra",
        label:"Notas de Compra",
        icon: Icons.FileText,
        path:"/compras/notas",
        iconColor:"text-blue-400",
      },
      {
        id:"compras-internacionais",
        label:"Compras Internacionais",
        icon: Icons.Globe,
        path:"/compras/internacionais",
        iconColor:"text-blue-400",
      },
      {
        id:"ia-compras",
        label:"IA para Compras",
        icon: Icons.Cpu,
        path:"/compras/ia",
        iconColor:"text-blue-400",
      },
      {
        id:"integracao-fornecedores",
        label:"Integração Fornecedores",
        icon: Icons.Link,
        path:"/compras/integracao",
        iconColor:"text-blue-400",
      },
    ],
  },

  // 4. GESTÃO DE CONTRATOS (5 sub-módulos)
  {
    id:"contratos",
    label:"Gestão de Contratos",
    icon: Icons.FileText,
    path:"/contratos",
    iconColor:"text-indigo-600",
    children: [
      {
        id:"gestao-contratos",
        label:"Dashboard Contratos",
        icon: Icons.BarChart3,
        path:"/contratos/dashboard",
        iconColor:"text-indigo-500",
      },
      {
        id:"contratos-fornecedores",
        label:"Contratos Fornecedores",
        icon: Icons.Building2,
        path:"/contratos/fornecedores",
        iconColor:"text-indigo-500",
      },
      {
        id:"contratos-hospitais",
        label:"Contratos Hospitais",
        icon: Icons.Building2,
        path:"/contratos/hospitais",
        iconColor:"text-indigo-500",
      },
      {
        id:"renovacoes",
        label:"Renovações",
        icon: Icons.RefreshCcw,
        path:"/contratos/renovacoes",
        iconColor:"text-indigo-500",
      },
      {
        id:"vencimentos-contratos",
        label:"Vencimentos",
        icon: Icons.AlertTriangle,
        path:"/contratos/vencimentos",
        iconColor:"text-indigo-500",
      },
    ],
  },

  // 5. VENDAS & CRM (4 sub-módulos)
  {
    id:"crm-vendas",
    label:"Vendas & CRM",
    icon: Icons.Briefcase,
    path:"/crm",
    iconColor:"text-purple-500",
    children: [
      {
        id:"prospecoes",
        label:"Prospecções",
        icon: Icons.TrendingUp,
        path:"/crm/prospecoes",
        iconColor:"text-purple-400",
      },
      {
        id:"propostas-comerciais",
        label:"Propostas Comerciais",
        icon: Icons.FileText,
        path:"/crm/propostas",
        iconColor:"text-purple-400",
      },
      {
        id:"relacionamento-medicos",
        label:"Relacionamento Médicos",
        icon: Icons.Stethoscope,
        path:"/crm/relacionamento",
        iconColor:"text-purple-400",
      },
      {
        id:"vendas",
        label:"Vendas & Contratos",
        icon: Icons.BarChart3,
        path:"/crm/vendas",
        iconColor:"text-purple-400",
      },
    ],
  },

  // 6. GESTÃO DE CIRURGIAS (4 sub-módulos)
  {
    id:"cirurgias",
    label:"Gestão de Cirurgias",
    icon: Icons.Ambulance,
    path:"/cirurgias",
    iconColor:"text-red-500",
    children: [
      {
        id:"pedidos-pendentes",
        label:"Pedidos Pendentes",
        icon: Icons.Clock,
        path:"/cirurgias/pendentes",
        iconColor:"text-red-400",
      },
      {
        id:"preparacao-kits",
        label:"Preparação de Kits",
        icon: Icons.Package,
        path:"/cirurgias/kits",
        iconColor:"text-red-400",
      },
      {
        id:"acompanhamento",
        label:"Acompanhamento",
        icon: Icons.Calendar,
        path:"/cirurgias/acompanhamento",
        iconColor:"text-red-400",
      },
      {
        id:"pos-cirurgico",
        label:"Pós-Cirúrgico",
        icon: Icons.CheckCircle,
        path:"/cirurgias/pos-cirurgico",
        iconColor:"text-red-400",
      },
    ],
  },

  // 7. ESTOQUE INTELIGENTE (4 sub-módulos)
  {
    id:"estoque-ia",
    label:"Estoque Inteligente",
    icon: Icons.Package,
    path:"/estoque",
    iconColor:"text-teal-500",
    children: [
      {
        id:"estoque-dashboard",
        label:"Visão Geral",
        icon: Icons.Activity,
        path:"/estoque/dashboard",
        iconColor:"text-teal-400",
      },
      {
        id:"containers-iot",
        label:"Containers IoT",
        icon: Icons.Database,
        path:"/estoque/containers",
        iconColor:"text-teal-400",
      },
      {
        id:"scanner-rfid",
        label:"Scanner RFID",
        icon: Icons.Scan,
        path:"/estoque/scanner",
        iconColor:"text-teal-400",
      },
      {
        id:"inventario",
        label:"Inventário",
        icon: Icons.ClipboardList,
        path:"/estoque/inventario",
        iconColor:"text-teal-400",
      },
    ],
  },

  // 8. CONSIGNAÇÃO AVANÇADA (5 sub-módulos)
  {
    id:"consignacao",
    label:"Consignação Avançada",
    icon: Icons.Archive,
    path:"/consignacao",
    iconColor:"text-purple-600",
    children: [
      {
        id:"consignacao-avancada",
        label:"Visão Geral",
        icon: Icons.BarChart3,
        path:"/consignacao/dashboard",
        iconColor:"text-purple-500",
      },
      {
        id:"materiais-consignados",
        label:"Materiais Consignados",
        icon: Icons.Package,
        path:"/consignacao/materiais",
        iconColor:"text-purple-500",
      },
      {
        id:"faturamento-consignacao",
        label:"Faturamento",
        icon: Icons.FileText,
        path:"/consignacao/faturamento",
        iconColor:"text-purple-500",
      },
      {
        id:"financeiro-consignacao",
        label:"Financeiro",
        icon: Icons.DollarSign,
        path:"/consignacao/financeiro",
        iconColor:"text-purple-500",
      },
      {
        id:"hospitais-consignacao",
        label:"Hospitais",
        icon: Icons.Building2,
        path:"/consignacao/hospitais",
        iconColor:"text-purple-500",
      },
    ],
  },

  // 9. LOGÍSTICA AVANÇADA (4 sub-módulos)
  {
    id:"logistica",
    label:"Logística Avançada",
    icon: Icons.Navigation,
    path:"/logistica",
    iconColor:"text-orange-500",
    children: [
      {
        id:"rastreamento",
        label:"Rastreamento Real-Time",
        icon: Icons.Target,
        path:"/logistica/rastreamento",
        iconColor:"text-orange-400",
      },
      {
        id:"entregas",
        label:"Entregas Ativas",
        icon: Icons.Truck,
        path:"/logistica/entregas",
        iconColor:"text-orange-400",
      },
      {
        id:"rotas",
        label:"Otimização de Rotas",
        icon: Icons.Globe,
        path:"/logistica/rotas",
        iconColor:"text-orange-400",
      },
      {
        id:"transportadoras",
        label:"Transportadoras ANVISA",
        icon: Icons.Plane,
        path:"/logistica/transportadoras",
        iconColor:"text-orange-400",
      },
    ],
  },

  // 10. FATURAMENTO AVANÇADO
  {
    id:"faturamento-avancado",
    label:"Faturamento Avançado",
    icon: Icons.Receipt,
    path:"/faturamento",
    iconColor:"text-emerald-600",
  },

  // 11. FINANCEIRO AVANÇADO (5 sub-módulos)
  {
    id:"financeiro",
    label:"Financeiro Avançado",
    icon: Icons.DollarSign,
    path:"/financeiro",
    iconColor:"text-green-600",
    children: [
      {
        id:"financeiro-dashboard",
        label:"Dashboard Financeiro",
        icon: Icons.BarChart3,
        path:"/financeiro/dashboard",
        iconColor:"text-green-500",
      },
      {
        id:"dda-bancario",
        label:"DDA Bancário",
        icon: Icons.Building2,
        path:"/financeiro/dda",
        iconColor:"text-green-500",
      },
      {
        id:"sefaz-nfe",
        label:"SEFAZ NFe",
        icon: Icons.FileText,
        path:"/financeiro/sefaz",
        iconColor:"text-green-500",
      },
      {
        id:"conciliacao",
        label:"Conciliação",
        icon: Icons.BarChart3,
        path:"/financeiro/conciliacao",
        iconColor:"text-green-500",
      },
      {
        id:"faturamento-financeiro",
        label:"Faturamento",
        icon: Icons.DollarSign,
        path:"/financeiro/faturamento",
        iconColor:"text-green-500",
      },
    ],
  },

  // 12. ANALYTICS & BI (4 sub-módulos)
  {
    id:"analytics",
    label:"Analytics & BI",
    icon: Icons.BarChart3,
    path:"/analytics",
    iconColor:"text-blue-600",
    children: [
      {
        id:"paineis-controle",
        label:"Painéis Controle",
        icon: Icons.BarChart3,
        path:"/analytics/paineis",
        iconColor:"text-blue-500",
      },
      {
        id:"relatorios-ia",
        label:"Relatórios IA",
        icon: Icons.FileText,
        path:"/analytics/relatorios",
        iconColor:"text-blue-500",
      },
      {
        id:"kpis",
        label:"KPIs",
        icon: Icons.TrendingUp,
        path:"/analytics/kpis",
        iconColor:"text-blue-500",
      },
      {
        id:"previsoes",
        label:"Previsões IA",
        icon: Icons.Lightbulb,
        path:"/analytics/previsoes",
        iconColor:"text-blue-500",
      },
    ],
  },

  // 13. COMPLIANCE & AUDITORIA (3 sub-módulos)
  {
    id:"compliance",
    label:"Compliance & Auditoria",
    icon: Icons.Shield,
    path:"/compliance",
    iconColor:"text-red-600",
    children: [
      {
        id:"auditorias",
        label:"Auditorias",
        icon: Icons.Shield,
        path:"/compliance/auditorias",
        iconColor:"text-red-500",
      },
      {
        id:"anvisa",
        label:"Regulamentações ANVISA",
        icon: Icons.FileText,
        path:"/compliance/anvisa",
        iconColor:"text-red-500",
      },
      {
        id:"documentos",
        label:"Documentos",
        icon: Icons.FileText,
        path:"/compliance/documentos",
        iconColor:"text-red-500",
      },
    ],
  },

  // 14. RASTREABILIDADE OPME (5 sub-módulos)
  {
    id:"rastreabilidade",
    label:"Rastreabilidade OPME",
    icon: Icons.Activity,
    path:"/rastreabilidade",
    iconColor:"text-green-600",
    children: [
      {
        id:"rastreabilidade-dashboard",
        label:"Dashboard Rastreamento",
        icon: Icons.BarChart3,
        path:"/rastreabilidade/dashboard",
        iconColor:"text-green-500",
      },
      {
        id:"rastreamento-produtos",
        label:"Produtos Rastreados",
        icon: Icons.Package,
        path:"/rastreabilidade/produtos",
        iconColor:"text-green-500",
      },
      {
        id:"tracking-materiais",
        label:"Por Paciente",
        icon: Icons.Users,
        path:"/rastreabilidade/pacientes",
        iconColor:"text-green-500",
      },
      {
        id:"historico-produtos",
        label:"Histórico & Alertas",
        icon: Icons.AlertTriangle,
        path:"/rastreabilidade/historico",
        iconColor:"text-green-500",
      },
      {
        id:"mapa-rastreabilidade",
        label:"Mapa Geográfico",
        icon: Icons.MapPin,
        path:"/rastreabilidade/mapa",
        iconColor:"text-green-500",
      },
    ],
  },

  // 15. MANUTENÇÃO PREVENTIVA (5 sub-módulos)
  {
    id:"manutencao",
    label:"Manutenção Preventiva",
    icon: Icons.Wrench,
    path:"/manutencao",
    iconColor:"text-orange-600",
    children: [
      {
        id:"manutencao-dashboard",
        label:"Visão Geral",
        icon: Icons.BarChart3,
        path:"/manutencao/dashboard",
        iconColor:"text-orange-500",
      },
      {
        id:"equipamentos-medicos",
        label:"Equipamentos Médicos",
        icon: Icons.Wrench,
        path:"/manutencao/equipamentos",
        iconColor:"text-orange-500",
      },
      {
        id:"agendamento-manutencao",
        label:"Agendamentos",
        icon: Icons.Calendar,
        path:"/manutencao/agendamentos",
        iconColor:"text-orange-500",
      },
      {
        id:"performance-equipamentos",
        label:"Performance",
        icon: Icons.TrendingUp,
        path:"/manutencao/performance",
        iconColor:"text-orange-500",
      },
      {
        id:"historico-manutencao",
        label:"Histórico",
        icon: Icons.ClipboardList,
        path:"/manutencao/historico",
        iconColor:"text-orange-500",
      },
    ],
  },

  // 16. ANALYTICS PREDITIVO IA (5 sub-módulos)
  {
    id:"analytics-predicao",
    label:"Analytics Preditivo IA",
    icon: Icons.Cpu,
    path:"/analytics-ia",
    iconColor:"text-cyan-600",
    children: [
      {
        id:"analytics-ia-dashboard",
        label:"Visão Geral",
        icon: Icons.BarChart3,
        path:"/analytics-ia/dashboard",
        iconColor:"text-cyan-500",
      },
      {
        id:"predicoes-ia",
        label:"Predições",
        icon: Icons.Lightbulb,
        path:"/analytics-ia/predicoes",
        iconColor:"text-cyan-500",
      },
      {
        id:"modelos-ia",
        label:"Modelos IA",
        icon: Icons.Cpu,
        path:"/analytics-ia/modelos",
        iconColor:"text-cyan-500",
      },
      {
        id:"tendencias-mercado",
        label:"Tendências",
        icon: Icons.TrendingUp,
        path:"/analytics-ia/tendencias",
        iconColor:"text-cyan-500",
      },
      {
        id:"insights-ia",
        label:"Insights",
        icon: Icons.Lightbulb,
        path:"/analytics-ia/insights",
        iconColor:"text-cyan-500",
      },
    ],
  },

  // 17. TELEMETRIA IoT
  {
    id:"telemetria-iot",
    label:"Telemetria IoT",
    icon: Icons.Activity,
    path:"/telemetria",
    iconColor:"text-blue-600",
  },

  // 18. RELATÓRIOS REGULATÓRIOS
  {
    id:"relatorios-regulatorios",
    label:"Relatórios Regulatórios",
    icon: Icons.Shield,
    path:"/relatorios-regulatorios",
    iconColor:"text-red-600",
  },

  // 19. IA CENTRAL (3 sub-módulos)
  {
    id:"ia-central",
    label:"IA Central",
    icon: Icons.Lightbulb,
    path:"/ia-central",
    iconColor:"text-cyan-600",
    children: [
      {
        id:"central-ia-dashboard",
        label:"Dashboard IA",
        icon: Icons.BarChart3,
        path:"/ia-central/dashboard",
        iconColor:"text-cyan-500",
      },
      {
        id:"orquestrador-ia",
        label:"Orquestrador",
        icon: Icons.Zap,
        path:"/ia-central/orquestrador",
        iconColor:"text-cyan-500",
      },
      {
        id:"chatbot-metrics",
        label:"Chatbot Analytics",
        icon: Icons.MessageSquare,
        path:"/ia-central/chatbot",
        iconColor:"text-cyan-500",
      },
    ],
  },

  // 20. API GATEWAY
  {
    id:"api-gateway",
    label:"API Gateway",
    icon: Icons.Globe,
    path:"/api-gateway",
    iconColor:"text-cyan-600",
  },
];

export const IcarusSidebar: React.FC<IcarusSidebarProps> = ({
  collapsed,
  onNavigate,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path +"/");
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case"healthy":
        return"bg-green-500";
      case"warning":
        return"bg-yellow-500";
      case"critical":
        return"bg-red-500";
      default:
        return"bg-gray-400";
    }
  };

  const renderItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <Link
          to={item.path ||"#"}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            }
            if (onNavigate) {
              onNavigate(item.id);
            }
          }}
          className={`flex items-center neumorphic-button py-2 ${
            active ?"neumorphic-button-active" :""
          }`}
          style={{
            gap: collapsed ?"0" :"8px",
            paddingLeft: collapsed ?"8px" : `${12 + level * 12}px`,
            paddingRight: collapsed ?"8px" :"12px",
            justifyContent: collapsed ?"center" :"flex-start",
            transition:"all 0.3s ease",
            marginBottom:"7px", // Aumentado de 6px para 7px
            fontSize: level === 0 ?"0.8125rem" :"0.75rem",
            fontWeight: level === 0 ? 600 : 500,
          }}
          title={item.label}
        >
          <div className="flex items-center gap-2 flex-1">
            <Icon size={level === 0 ? 18 : 16} className={item.iconColor} />
            {!collapsed && (
              <>
                <span className="flex-1" style={{ color: 'var(--orx-text-primary)' }}>
                  {item.label}
                </span>
                {item.status && (
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}
                  />
                )}
                {item.badge && (
                  <span className="px-2 py-0.5 bg-red-500 text-white rounded-full" style={{  fontSize: '0.813rem' , fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <div style={{ color: 'var(--orx-text-primary)' }}>
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </Link>

        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-1">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {sidebarModules.map((item) => renderItem(item))}
    </div>
  );
};

IcarusSidebar.displayName ="IcarusSidebar";

export default IcarusSidebar;

