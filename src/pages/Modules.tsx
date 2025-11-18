/**
 * Página: Módulos ICARUS v5.0
 * Lista completa dos 58 módulos enterprise
 */

import { useDocumentTitle } from"@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/oraclusx-ds";
import {
  LayoutDashboard,
  Package,
  Stethoscope,
  DollarSign,
  Users,
  Settings,
  ShoppingCart,
  Truck,
  FileText,
  BarChart3,
  Shield,
  Award,
  Briefcase,
  Wrench,
  Radio,
  FileCheck,
  Bot,
  Webhook,
  Smartphone,
  Activity,
  Building2,
  Bell,
  Database,
  Calculator,
} from"lucide-react";

interface Module {
  id: string;
  name: string;
  category: string;
  status:"completed" |"in_progress" |"planned";
  icon: LucideIcon;
  description: string;
}

const modules: Module[] = [
  // CORE (8 módulos)
  {
    id:"dashboard",
    name:"Dashboard Principal",
    category:"Core",
    status:"completed",
    icon: LayoutDashboard,
    description:"Visão geral com KPIs e métricas IA",
  },
  {
    id:"estoque-ia",
    name:"Estoque IA",
    category:"Core",
    status:"completed",
    icon: Package,
    description:"Gestão inteligente com reposição automática",
  },
  {
    id:"cirurgias",
    name:"Cirurgias & Procedimentos",
    category:"Core",
    status:"in_progress",
    icon: Stethoscope,
    description:"Kanban cirúrgico e materiais OPME",
  },
  {
    id:"financeiro",
    name:"Financeiro Avançado",
    category:"Core",
    status:"in_progress",
    icon: DollarSign,
    description:"DDA, SEFAZ, NFe e conciliação",
  },
  {
    id:"cadastros",
    name:"Gestão de Cadastros",
    category:"Core",
    status:"in_progress",
    icon: Users,
    description:"Médicos, hospitais, convênios",
  },
  {
    id:"config",
    name:"Configurações Sistema",
    category:"Core",
    status:"completed",
    icon: Settings,
    description:"Usuários, APIs e certificados",
  },
  {
    id:"compras",
    name:"Compras & Gestão",
    category:"Core",
    status:"planned",
    icon: ShoppingCart,
    description:"Cotações e gestão de propostas",
  },
  {
    id:"crm",
    name:"CRM & Vendas",
    category:"Core",
    status:"planned",
    icon: Briefcase,
    description:"Pipeline e relacionamento",
  },

  // BUSINESS (10 módulos)
  {
    id:"analytics",
    name:"Analytics BI",
    category:"Business",
    status:"planned",
    icon: BarChart3,
    description:"Business Intelligence e relatórios",
  },
  {
    id:"compliance",
    name:"Compliance & Auditoria",
    category:"Business",
    status:"planned",
    icon: Shield,
    description:"ANVISA, SEFAZ e conformidade",
  },
  {
    id:"qualidade",
    name:"Qualidade & Certificação",
    category:"Business",
    status:"planned",
    icon: Award,
    description:"ISO e certificações",
  },
  {
    id:"rh",
    name:"RH & Gestão de Pessoas",
    category:"Business",
    status:"planned",
    icon: Users,
    description:"RH inteligente com IA",
  },
  {
    id:"relatorios-fin",
    name:"Relatórios Financeiros",
    category:"Business",
    status:"planned",
    icon: FileText,
    description:"DRE, Balanço e Fluxo de Caixa",
  },
  {
    id:"contabil",
    name:"Gestão Contábil",
    category:"Business",
    status:"planned",
    icon: Calculator,
    description:"Contabilidade completa",
  },
  {
    id:"compras-inter",
    name:"Compras Internacionais",
    category:"Business",
    status:"planned",
    icon: ShoppingCart,
    description:"Importação e compliance",
  },
  {
    id:"auditoria",
    name:"Auditoria Interna",
    category:"Business",
    status:"planned",
    icon: FileCheck,
    description:"Auditorias e trilhas",
  },
  {
    id:"documentos",
    name:"Gestão de Documentos",
    category:"Business",
    status:"planned",
    icon: FileText,
    description:"DMS enterprise",
  },
  {
    id:"riscos",
    name:"Gestão de Riscos",
    category:"Business",
    status:"planned",
    icon: Shield,
    description:"Análise e mitigação",
  },

  // OPERATIONS (8 módulos)
  {
    id:"manutencao",
    name:"Manutenção Preventiva",
    category:"Operations",
    status:"planned",
    icon: Wrench,
    description:"Equipamentos médicos",
  },
  {
    id:"consignacao",
    name:"Consignação Avançada",
    category:"Operations",
    status:"planned",
    icon: Package,
    description:"Rastreamento em tempo real",
  },
  {
    id:"telemetria",
    name:"Telemetria Avançada",
    category:"Operations",
    status:"planned",
    icon: Radio,
    description:"IoT e monitoramento",
  },
  {
    id:"relatorios-reg",
    name:"Relatórios Regulatórios",
    category:"Operations",
    status:"planned",
    icon: FileText,
    description:"ANVISA e compliance",
  },
  {
    id:"ia-central",
    name:"IA Central",
    category:"Operations",
    status:"planned",
    icon: Bot,
    description:"Orquestrador IA",
  },
  {
    id:"api-gateway",
    name:"API Gateway",
    category:"Operations",
    status:"planned",
    icon: Webhook,
    description:"Gateway centralizado",
  },
  {
    id:"mobile",
    name:"Mobile App",
    category:"Operations",
    status:"planned",
    icon: Smartphone,
    description:"React Native app",
  },
  {
    id:"monitoring",
    name:"Monitoramento Produção",
    category:"Operations",
    status:"planned",
    icon: Activity,
    description:"Health checks e logs",
  },

  // INTEGRATION (6 módulos)
  {
    id:"his-ris",
    name:"Integração HIS/RIS",
    category:"Integration",
    status:"planned",
    icon: Building2,
    description:"Sistemas hospitalares",
  },
  {
    id:"notificacoes",
    name:"Notificações Inteligentes",
    category:"Integration",
    status:"planned",
    icon: Bell,
    description:"Push e email automático",
  },
  {
    id:"portais",
    name:"Portais OPME",
    category:"Integration",
    status:"planned",
    icon: Database,
    description:"Integração portais",
  },
  {
    id:"certificacao-sys",
    name:"Sistema de Certificação",
    category:"Integration",
    status:"planned",
    icon: Award,
    description:"Certificados digitais",
  },
  {
    id:"custos",
    name:"Custos de Procedimentos",
    category:"Integration",
    status:"planned",
    icon: Calculator,
    description:"Análise de custos IA",
  },
  {
    id:"logistica",
    name:"Logística Avançada",
    category:"Integration",
    status:"planned",
    icon: Truck,
    description:"Rotas otimizadas IA",
  },
];

export default function ModulesPage() {
  useDocumentTitle("Módulos");

  const stats = {
    total: modules.length,
    completed: modules.filter((m) => m.status ==="completed").length,
    inProgress: modules.filter((m) => m.status ==="in_progress").length,
    planned: modules.filter((m) => m.status ==="planned").length,
  };

  const categories = ["Core","Business","Operations","Integration"];

  const getStatusBadge = (status: Module["status"]) => {
    const badges = {
      completed:"bg-success/50/10 text-success dark:text-green-400",
      in_progress:"bg-warning/50/10 text-warning dark:text-yellow-400",
      planned:"bg-surface0/10 text-secondary dark:text-muted",
    };

    const labels = {
      completed:"Completo",
      in_progress:"Em Progresso",
      planned:"Planejado",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-body-xs orx-orx-font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neumorphic-card">
        <h1 className="text-heading-lg font-display mb-2">Módulos ICARUS v5.0</h1>
        <p className="text-muted-foreground">
          Sistema enterprise com {modules.length} módulos especializados em
          gestão OPME
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle className="text-body-sm">Total de Módulos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-lg font-display">{stats.total}</p>
          </CardContent>
        </Card>

        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle className="text-body-sm text-success dark:text-green-400">
              Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-lg font-display text-success dark:text-green-400">
              {stats.completed}
            </p>
          </CardContent>
        </Card>

        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle className="text-body-sm text-warning dark:text-yellow-400">
              Em Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-lg font-display text-warning dark:text-yellow-400">
              {stats.inProgress}
            </p>
          </CardContent>
        </Card>

        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle className="text-body-sm text-secondary dark:text-muted">
              Planejados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-lg font-display text-secondary dark:text-muted">
              {stats.planned}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modules by Category */}
      {categories.map((category) => {
        const categoryModules = modules.filter((m) => m.category === category);

        return (
          <div key={category} className="space-y-4">
            <h2 className="text-heading font-display text-primary dark:text-gray-100">
              {category} ({categoryModules.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryModules.map((module) => {
                const Icon = module.icon;

                return (
                  <Card
                    key={module.id}
                    variant="default"
                    padding="md"
                    className="hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon
                          size={24}
                          className="text-primary dark:text-indigo-400"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-primary dark:text-gray-100" style={{ fontWeight: 500 }}>
                            {module.name}
                          </h3>
                          {getStatusBadge(module.status)}
                        </div>

                        <p className="text-body-sm text-secondary dark:text-muted">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

