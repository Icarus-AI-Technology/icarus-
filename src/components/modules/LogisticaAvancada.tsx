import { useState, useEffect } from"react";
import { Card } from"@/components/oraclusx-ds";
import {
  Truck,
  Package,
  Clock,
  TrendingUp,
  Search,
  Plus,
  Route,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Navigation,
  User,
} from"lucide-react";
import { useDocumentTitle, useEntregas } from"@/hooks";
import type { Entrega } from"@/hooks/useEntregas";
import { useToast } from"@/contexts/ToastContext";

interface KPI {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  trend?: string;
}

export default function LogisticaAvancada() {
  useDocumentTitle("Logística Avançada IA");
  
  // Navegação
  const [activeCategory, setActiveCategory] = useState("entregas");
  const [activeTab, setActiveTab] = useState("todas");
  
  // Backend Integration
  const {
    entregas,
    loading,
    error,
    getEstatisticas,
    getEntregasAtrasadas,
  } = useEntregas();
  const { addToast } = useToast();

  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    emTransito: 0,
    entregues: 0,
    atrasadas: 0,
    taxaEntrega: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [entregasAtrasadas, setEntregasAtrasadas] = useState<Entrega[]>([]);

  useEffect(() => {
    getEstatisticas().then(setStats);
    getEntregasAtrasadas().then(setEntregasAtrasadas);
  }, [getEstatisticas, getEntregasAtrasadas, entregas]);

  useEffect(() => {
    if (error) {
      addToast(error,"error");
    }
  }, [error, addToast]);

  // Categorias
  const categories: Category[] = [
    { 
      id:"entregas", 
      label:"Entregas Ativas", 
      icon: Truck, 
      count: stats.emTransito + stats.pendentes,
      trend:"+5"
    },
    { 
      id:"rotas", 
      label:"Rotas Otimizadas", 
      icon: Route, 
      count: 12,
      trend:"+2"
    },
    { 
      id:"motoristas", 
      label:"Motoristas", 
      icon: User, 
      count: 18,
      trend:"+1"
    },
    { 
      id:"pendencias", 
      label:"Pendências", 
      icon: AlertCircle, 
      count: stats.atrasadas,
      trend:"-2"
    },
    {
      id:"rastreamento",
      label:"Rastreamento",
      icon: Navigation,
      count: stats.total,
    },
    {
      id:"relatorios",
      label:"Relatórios",
      icon: Download,
      count: 0,
    },
  ];

  // KPIs
  const kpis: KPI[] = [
    {
      title:"Entregas Ativas",
      value: stats.emTransito + stats.pendentes,
      trend:"+8 hoje",
      icon: Truck,
      color:"blue",
    },
    {
      title:"Taxa de Entrega",
      value: `${stats.taxaEntrega.toFixed(1)}%`,
      trend:"+2.3%",
      icon: CheckCircle,
      color:"green",
    },
    {
      title:"Concluídas",
      value: stats.entregues,
      trend: `Total: ${stats.total}`,
      icon: Package,
      color:"indigo",
    },
    {
      title:"Atrasadas",
      value: stats.atrasadas,
      trend: stats.atrasadas > 0 ?"Atenção!" :"Em dia",
      icon: AlertCircle,
      color:"red",
    },
  ];

  // Helpers
  const getStatusColor = (status: Entrega['status']): string => {
    const colors: Record<Entrega['status'], string> = {
      pendente:"text-secondary bg-surface",
      coletado:"text-accent bg-blue-50",
      em_transito:"text-primary bg-indigo-50",
      saiu_entrega:"text-purple-600 bg-purple-50",
      entregue:"text-success bg-success/5",
      devolvido:"text-orange-600 bg-orange-50",
      cancelado:"text-error bg-destructive/5",
    };
    return colors[status] ||"text-secondary bg-surface";
  };

  const getStatusLabel = (status: Entrega['status']): string => {
    const labels: Record<Entrega['status'], string> = {
      pendente:"Pendente",
      coletado:"Coletado",
      em_transito:"Em Trânsito",
      saiu_entrega:"Saiu p/ Entrega",
      entregue:"Entregue",
      devolvido:"Devolvido",
      cancelado:"Cancelado",
    };
    return labels[status] || status;
  };

  const formatDate = (date?: string) => {
    if (!date) return"-";
    return new Date(date).toLocaleDateString("pt-BR");
  };


  // Filtrar entregas
  const filteredEntregas = entregas.filter((entrega) => {
    const matchSearch = 
      entrega.codigo_rastreio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrega.destino_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrega.transportadora?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchTab = 
      activeTab ==="todas" ? true :
      activeTab ==="ativas" ? ['pendente', 'coletado', 'em_transito', 'saiu_entrega'].includes(entrega.status) :
      activeTab ==="entregues" ? entrega.status === 'entregue' :
      activeTab ==="atrasadas" ? entregasAtrasadas.some(e => e.id === entrega.id) :
      false;

    return matchSearch && matchTab;
  });

  // Render Functions
  const renderEntregas = () => (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <button className="neuro-button px-6 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Entrega
          </button>
          <button className="neuro-button-secondary px-4 py-2 rounded-xl">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar entrega..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl neuro-inset text-body-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
        {[
          { id:"todas", label:"Todas" },
          { id:"ativas", label:"Ativas" },
          { id:"entregues", label:"Entregues" },
          { id:"atrasadas", label:"Atrasadas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl orx-font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ?"neuro-raised text-[var(--primary)]"
                :"text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
            {tab.id ==="atrasadas" && stats.atrasadas > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-error text-body-xs font-display">
                {stats.atrasadas}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Tabela */}
      {!loading && (
        <Card className="neuro-raised overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-font-medium">
                    Código
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-font-medium">
                    Destino
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-font-medium">
                    Previsão
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-font-medium">
                    Transportadora
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-font-medium">
                    Status
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntregas.map((entrega) => (
                  <tr
                    key={entrega.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-[var(--text-primary)] orx-font-medium">
                          {entrega.codigo_rastreio}
                        </p>
                        <p className="text-body-xs text-[var(--text-secondary)]">
                          {entrega.volumes || 1} volume(s)
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-[var(--text-primary)]">{entrega.destino_nome}</p>
                        <p className="text-body-xs text-[var(--text-secondary)]">
                          {entrega.destino_cidade}/{entrega.destino_estado}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {formatDate(entrega.data_previsao)}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {entrega.transportadora ||"-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs orx-font-medium ${getStatusColor(entrega.status)}`}
                      >
                        {getStatusLabel(entrega.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all"
                          title="Ver detalhes"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all"
                          title="Rastrear"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEntregas.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">Nenhuma entrega encontrada</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Logística Avançada IA
            </h1>
            <p className="text-[var(--text-secondary)]">
              Sistema inteligente de rotas, entregas e rastreamento em tempo real com otimização IA
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success/50 animate-pulse" />
            <span className="text-body-sm text-[var(--text-primary)] orx-font-medium">
              {stats.emTransito} em trânsito
            </span>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200 ${
                activeCategory === category.id
                  ?"neuro-raised scale-105"
                  :"neuro-flat hover:neuro-raised"
              }`}
            >
              <category.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs text-[var(--text-primary)] orx-font-medium">
                {category.label}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-body-lg font-display text-[var(--text-primary)]">
                  {category.count}
                </span>
                {category.trend && (
                  <TrendingUp className="w-3 h-3 text-success" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="neuro-raised p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-body-sm text-[var(--text-secondary)] mb-1">
                    {kpi.title}
                  </p>
                  <h3 className="text-heading font-display text-[var(--text-primary)]">
                    {kpi.value}
                  </h3>
                  {kpi.trend && (
                    <p className={`text-body-xs mt-2 flex items-center gap-1 ${
                      kpi.color === 'red' ? 'text-error' : 'text-success'
                    }`}>
                      {kpi.color !== 'red' && <TrendingUp className="w-3 h-3" />}
                      {kpi.color === 'red' && <AlertCircle className="w-3 h-3" />}
                      {kpi.trend}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-xl neuro-inset">
                  <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content */}
        {activeCategory ==="entregas" && renderEntregas()}
        {activeCategory ==="rotas" && (
          <Card className="neuro-raised p-12 text-center">
            <Route className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-font-medium">
              Rotas Otimizadas IA
            </h3>
            <p className="text-[var(--text-secondary)]">
              Sistema de otimização de rotas com algoritmos de IA em desenvolvimento
            </p>
          </Card>
        )}
        {activeCategory ==="motoristas" && (
          <Card className="neuro-raised p-12 text-center">
            <User className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-font-medium">
              Gestão de Motoristas
            </h3>
            <p className="text-[var(--text-secondary)]">
              Módulo de gestão e avaliação de motoristas em desenvolvimento
            </p>
          </Card>
        )}
        {activeCategory ==="pendencias" && (
          <Card className="neuro-raised p-6">
            <h3 className="text-body-lg text-[var(--text-primary)] mb-4 flex items-center gap-2 orx-font-medium">
              <AlertCircle className="w-5 h-5 text-error" />
              Entregas Atrasadas ({entregasAtrasadas.length})
            </h3>
            <div className="space-y-3">
              {entregasAtrasadas.map((entrega) => (
                <div 
                  key={entrega.id}
                  className="p-4 rounded-xl neuro-inset flex items-center justify-between"
                >
                  <div>
                    <p className="text-[var(--text-primary)] orx-font-medium">
                      {entrega.codigo_rastreio}
                    </p>
                    <p className="text-body-sm text-[var(--text-secondary)]">
                      {entrega.destino_nome} - Previsão: {formatDate(entrega.data_previsao)}
                    </p>
                  </div>
                  <button className="neuro-button px-4 py-2 rounded-lg text-body-sm">
                    Resolver
                  </button>
                </div>
              ))}
              {entregasAtrasadas.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)]">
                    Nenhuma entrega atrasada! 🎉
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
        {(activeCategory ==="rastreamento" || activeCategory ==="relatorios") && (
          <Card className="neuro-raised p-12 text-center">
            <Download className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-font-medium">
              {categories.find(c => c.id === activeCategory)?.label}
            </h3>
            <p className="text-[var(--text-secondary)]">
              Módulo em desenvolvimento
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
