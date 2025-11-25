import { lazy } from 'react';
import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Activity } from 'lucide-react';

const AgentDashboardPage = lazy(() =>
  import('@/pages/agentes/AgentDashboard').then((module) => ({
    default: module.AgentDashboard,
  }))
);

type AppRoute = RouteObject & {
  meta?: {
    title: string;
    requiresAuth?: boolean;
    permissions?: string[];
  };
};

export const agentesRoute: AppRoute = {
  path: '/agentes',
  element: <AgentDashboardPage />,
  meta: {
    title: 'Agentes IA',
    requiresAuth: true,
    permissions: ['agentes:view'],
  },
};

export interface SidebarItem {
  title: string;
  icon: ReactNode;
  href: string;
  badge?: string;
  description?: string;
}

export const agentesSidebarItem: SidebarItem = {
  title: 'Agentes IA',
  icon: <Activity size={18} />,
  href: '/agentes',
  badge: 'NOVO',
  description: 'Sistema de análise com IA',
};

export default agentesRoute;
