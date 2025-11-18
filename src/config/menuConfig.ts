/**
 * Sistema de Navegação com Controle de Permissões
 * Filtra itens do menu baseado nas permissões do usuário
 */

import { useAuth } from '@/contexts/AuthContext';
import type { ComponentType, SVGProps } from 'react';
import {
  LayoutDashboard,
  Activity,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Users,
  Settings,
  BarChart3,
  Truck,
  ClipboardCheck,
  MessageSquare,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  titulo: string;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  rota: string;
  permissao?: string;
  recurso?: string;
  acao?: string;
  badge?: string | number;
  submenu?: MenuItem[];
}

/**
 * Configuração completa do menu do sistema
 * Cada item pode ter:
 * - permissao: código da permissão específica
 * - recurso + acao: verificação por recurso e ação
 * Se nenhum for especificado, o item é visível para todos os usuários autenticados
 */
export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    titulo: 'Dashboard',
    icone: LayoutDashboard,
    rota: '/dashboard',
    // Todos têm acesso ao dashboard
  },
  {
    id: 'cirurgias',
    titulo: 'Cirurgias',
    icone: Activity,
    rota: '/cirurgias',
    recurso: 'cirurgias',
    acao: 'read',
  },
  {
    id: 'estoque',
    titulo: 'Estoque',
    icone: Package,
    rota: '/estoque',
    recurso: 'estoque',
    acao: 'read',
    submenu: [
      {
        id: 'estoque-consulta',
        titulo: 'Consultar Estoque',
        icone: Package,
        rota: '/estoque/consulta',
        recurso: 'estoque',
        acao: 'read',
      },
      {
        id: 'estoque-movimentacoes',
        titulo: 'Movimentações',
        icone: Activity,
        rota: '/estoque/movimentacoes',
        recurso: 'estoque',
        acao: 'update',
      },
      {
        id: 'estoque-consignacao',
        titulo: 'Consignação',
        icone: Truck,
        rota: '/estoque/consignacao',
        recurso: 'estoque',
        acao: 'manage',
      },
    ],
  },
  {
    id: 'compras',
    titulo: 'Compras',
    icone: ShoppingCart,
    rota: '/compras',
    recurso: 'compras',
    acao: 'read',
  },
  {
    id: 'vendas',
    titulo: 'Vendas & CRM',
    icone: DollarSign,
    rota: '/vendas',
    recurso: 'vendas',
    acao: 'read',
  },
  {
    id: 'financeiro',
    titulo: 'Financeiro',
    icone: FileText,
    rota: '/financeiro',
    recurso: 'financeiro',
    acao: 'read',
    submenu: [
      {
        id: 'financeiro-contas-pagar',
        titulo: 'Contas a Pagar',
        icone: FileText,
        rota: '/financeiro/contas-pagar',
        recurso: 'financeiro',
        acao: 'read',
      },
      {
        id: 'financeiro-contas-receber',
        titulo: 'Contas a Receber',
        icone: DollarSign,
        rota: '/financeiro/contas-receber',
        recurso: 'financeiro',
        acao: 'read',
      },
      {
        id: 'financeiro-fluxo-caixa',
        titulo: 'Fluxo de Caixa',
        icone: BarChart3,
        rota: '/financeiro/fluxo-caixa',
        recurso: 'financeiro',
        acao: 'read',
      },
    ],
  },
  {
    id: 'compliance',
    titulo: 'Compliance',
    icone: ClipboardCheck,
    rota: '/compliance',
    recurso: 'compliance',
    acao: 'read',
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios',
    icone: BarChart3,
    rota: '/relatorios',
    recurso: 'relatorios',
    acao: 'read',
  },
  {
    id: 'workflow-builder',
    titulo: 'Workflow Builder',
    icone: Activity,
    rota: '/modules/workflow-builder',
    recurso: 'workflows',
    acao: 'manage',
  },
  {
    id: 'campanhas',
    titulo: 'Campanhas',
    icone: MessageSquare,
    rota: '/modules/campanhas',
    recurso: 'marketing',
    acao: 'manage',
  },
  {
    id: 'system-health',
    titulo: 'System Health',
    icone: Activity,
    rota: '/modules/system-health',
    recurso: 'observability',
    acao: 'read',
  },
  {
    id: 'chatbot',
    titulo: 'Assistente IA',
    icone: MessageSquare,
    rota: '/chatbot',
    // Chatbot disponível para todos
  },
  {
    id: 'usuarios',
    titulo: 'Usuários',
    icone: Users,
    rota: '/usuarios',
    recurso: 'usuarios',
    acao: 'read',
  },
  {
    id: 'configuracoes',
    titulo: 'Configurações',
    icone: Settings,
    rota: '/configuracoes',
    recurso: 'configuracoes',
    acao: 'read',
  },
];

/**
 * Hook para obter menu filtrado por permissões do usuário
 */
export function useMenuFiltrado() {
  const { usuario, temPermissao, temAcessoRecurso, permissoes } = useAuth();

  if (!usuario) {
    return [];
  }

  // CEO e SYSTEM_ALL têm acesso a tudo
  const temAcessoTotal = permissoes.some(p => p.codigo === 'SYSTEM_ALL');

  const filtrarItem = (item: MenuItem): boolean => {
    // Se tem acesso total, mostrar tudo
    if (temAcessoTotal) return true;

    // Se não tem permissão específica e não tem recurso, mostrar (público para autenticados)
    if (!item.permissao && !item.recurso) return true;

    // Verificar permissão específica
    if (item.permissao && !temPermissao(item.permissao)) return false;

    // Verificar recurso e ação
    if (item.recurso && !temAcessoRecurso(item.recurso, item.acao)) return false;

    return true;
  };

  const filtrarRecursivo = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(filtrarItem)
      .map(item => {
        if (item.submenu) {
          const submenuFiltrado = filtrarRecursivo(item.submenu);
          return {
            ...item,
            submenu: submenuFiltrado.length > 0 ? submenuFiltrado : undefined,
          };
        }
        return item;
      });
  };

  return filtrarRecursivo(menuItems);
}

/**
 * Hook para obter KPIs filtrados por permissões do usuário
 */
export function useKPIsFiltrados() {
  const { temAcessoRecurso, permissoes } = useAuth();

  const temAcessoTotal = permissoes.some(p => p.codigo === 'SYSTEM_ALL');

  const todosKPIs = [
    {
      id: 'cirurgias_mes',
      titulo: 'Cirurgias no Mês',
      valor: 0,
      recurso: 'cirurgias',
      acao: 'read',
    },
    {
      id: 'estoque_valor',
      titulo: 'Valor em Estoque',
      valor: 0,
      recurso: 'estoque',
      acao: 'read',
    },
    {
      id: 'compras_pendentes',
      titulo: 'Compras Pendentes',
      valor: 0,
      recurso: 'compras',
      acao: 'read',
    },
    {
      id: 'contas_receber',
      titulo: 'Contas a Receber',
      valor: 0,
      recurso: 'financeiro',
      acao: 'read',
    },
    {
      id: 'oportunidades_abertas',
      titulo: 'Oportunidades',
      valor: 0,
      recurso: 'vendas',
      acao: 'read',
    },
    {
      id: 'nao_conformidades',
      titulo: 'Não Conformidades',
      valor: 0,
      recurso: 'compliance',
      acao: 'read',
    },
  ];

  if (temAcessoTotal) {
    return todosKPIs;
  }

  return todosKPIs.filter(kpi => temAcessoRecurso(kpi.recurso, kpi.acao));
}

