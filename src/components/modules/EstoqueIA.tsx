/**
 * Módulo 4: Estoque IA
 * Gestão inteligente de estoque com IA, scanner e alertas automáticos
 * 
 * FUNCIONALIDADES:
 * - Dashboard com IA predictions
 * - Scanner de código de barras/QR
 * - Alertas de estoque baixo
 * - Alertas de vencimento
 * - Containers IA
 */

import { useState, useEffect } from"react";
import { Card } from"@/components/oraclusx-ds";
import {
  Package,
  Bot,
  QrCode,
  TrendingUp,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Filter,
  Edit2,
  Eye,
  Trash2,
  Calendar,
  Boxes,
  BarChart3,
  Download,
} from"lucide-react";
import { useDocumentTitle, useMateriais } from"@/hooks";
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

export default function EstoqueIA() {
  useDocumentTitle("Estoque IA");

  const [activeCategory, setActiveCategory] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("todos");

  const {
    materiais,
    loading,
    error,
    getResumoEstoque,
    getMateriaisAbaixoMinimo,
    getMateriaisProximosVencimento,
    deleteMaterial,
  } = useMateriais();
  const { addToast } = useToast();

  const [resumo, setResumo] = useState({
    totalItens: 0,
    totalAtivos: 0,
    valorTotal: 0,
    alertasEstoque: 0,
    alertasVencimento: 0,
  });
  const [materiaisAlerta, setMateriaisAlerta] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const categories: Category[] = [
    { id:"dashboard", label:"Dashboard IA", icon: Bot, count: materiais.length, trend:"+12" },
    { id:"materiais", label:"Materiais OPME", icon: Package, count: materiais.length, trend:"+8" },
    { id:"alertas", label:"Alertas", icon: AlertCircle, count: materiaisAlerta.length, trend:"-3" },
    { id:"scanner", label:"Scanner", icon: QrCode, count: 0, trend:"0" },
    { id:"containers", label:"Containers IA", icon: Boxes, count: 15, trend:"+2" },
    { id:"predicoes", label:"Predições IA", icon: BarChart3, count: 0, trend:"0" },
    { id:"relatorios", label:"Relatórios", icon: TrendingUp, count: 0, trend:"0" },
  ];

  const kpis: KPI[] = [
    {
      title:"Total Itens",
      value: resumo.totalItens,
      trend:"+12 novos",
      icon: Package,
      color:"blue",
    },
    {
      title:"Valor Total",
      value: `R$ ${(resumo.valorTotal / 1000).toFixed(1)}k`,
      trend:"+8.3%",
      icon: TrendingUp,
      color:"green",
    },
    {
      title:"Estoque Baixo",
      value: resumo.alertasEstoque,
      trend: materiaisAlerta.length > 0 ?"Atenção!" :"Tudo OK",
      icon: AlertCircle,
      color:"red",
    },
    {
      title:"Próx. Vencimento",
      value: resumo.alertasVencimento,
      trend:"30 dias",
      icon: Calendar,
      color:"yellow",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumoData = await getResumoEstoque();
        const abaixoMinimo = await getMateriaisAbaixoMinimo();
        const proximosVencimento = await getMateriaisProximosVencimento(30);
        setResumo(resumoData);
        setMateriaisAlerta([...abaixoMinimo, ...proximosVencimento]);
      } catch (_err) {
        addToast(
          err instanceof Error ? err.message :"Erro ao carregar dados de estoque","error"
        );
      }
    };
    if (!loading) {
      fetchData();
    }
  }, [
    loading,
    getResumoEstoque,
    getMateriaisAbaixoMinimo,
    getMateriaisProximosVencimento,
    addToast,
  ]);

  useEffect(() => {
    if (error) {
      addToast(error,"error");
    }
  }, [error, addToast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este material?")) return;
    try {
      await deleteMaterial(id);
      addToast("Material excluído com sucesso!","success");
    } catch {
      addToast("Erro ao excluir material","error");
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return"R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style:"currency",
      currency:"BRL",
    }).format(value);
  };

  const filteredMateriais = materiais.filter((material) => {
    const descricaoMatch = material.descricao
      ? material.descricao.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    const codigoMatch = material.codigo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSearch = descricaoMatch || codigoMatch;

    const matchTab =
      activeTab ==="todos" ? true :
      activeTab ==="ativos" ? (material.quantidade_estoque || 0) > 0 :
      activeTab ==="baixo" ? (material.quantidade_estoque || 0) <= (material.quantidade_minima || 0) :
      false;

    return matchSearch && matchTab;
  });

  const renderDashboard = () => (
    <div className="space-y-6">
      <Card className="neuro-raised p-6">
        <h3 className="text-body-lg text-[var(--text-primary)] mb-4 flex items-center gap-2" style={{ fontWeight: 500 }}>
          <Bot className="w-5 h-5 text-[var(--primary)]" />
          IA Predictions - Estoque Inteligente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-body-sm text-[var(--text-secondary)] mb-2">Precisão IA</p>
            <p className="text-heading-lg font-display text-[var(--primary)]">99.2%</p>
          </div>
          <div>
            <p className="text-body-sm text-[var(--text-secondary)] mb-2">Alertas Automáticos</p>
            <p className="text-heading-lg font-display text-[var(--text-primary)]">{materiaisAlerta.length}</p>
          </div>
          <div>
            <p className="text-body-sm text-[var(--text-secondary)] mb-2">Containers Ativos</p>
            <p className="text-heading-lg font-display text-[var(--text-primary)]">15</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderLista = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <button className="neuro-button px-6 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Material
          </button>
          <button className="neuro-button-secondary px-4 py-2 rounded-xl">
            <Filter className="w-4 h-4" />
          </button>
          <button className="neuro-button-secondary px-4 py-2 rounded-xl">
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl neuro-inset text-body-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
        {[
          { id:"todos", label:"Todos" },
          { id:"ativos", label:"Em Estoque" },
          { id:"baixo", label:"Estoque Baixo" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ?"neuro-raised text-[var(--primary)]"
                :"text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {!loading && (
        <Card className="neuro-raised overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Código</th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Descrição</th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Quantidade</th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Mínimo</th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Valor Unit.</th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Status</th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMateriais.map((material) => {
                  const isLow = (material.quantidade_estoque || 0) <= (material.quantidade_minima || 0);
                  return (
                    <tr
                      key={material.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <td className="p-4 text-[var(--text-primary)]" style={{ fontWeight: 500 }}>{material.codigo}</td>
                      <td className="p-4 text-[var(--text-primary)]">{material.descricao}</td>
                      <td className="p-4">
                        <span className={`font-display ${isLow ?"text-error" :"text-[var(--text-primary)]"}`}>
                          {material.quantidade_estoque || 0}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">{material.quantidade_minima || 0}</td>
                      <td className="p-4 text-[var(--text-primary)]">{formatCurrency(material.valor_unitario)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs font-medium ${
                          isLow ?"text-error bg-destructive/5" :"text-success bg-success/5"
                        }`}>
                          {isLow ?"Estoque Baixo" :"OK"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredMateriais.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">Nenhum material encontrado</p>
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Estoque IA</h1>
            <p className="text-[var(--text-secondary)]">
              Gestão inteligente de estoque com IA, alertas automáticos e scanner
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <Bot className="w-4 h-4 text-[var(--primary)] animate-pulse" />
            <span className="text-body-sm text-[var(--text-primary)]" style={{ fontWeight: 500 }}>IA: 99.2%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200 ${
                activeCategory === category.id ?"neuro-raised scale-105" :"neuro-flat hover:neuro-raised"
              }`}
            >
              <category.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs text-[var(--text-primary)]" style={{ fontWeight: 500 }}>{category.label}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-body-lg font-display text-[var(--text-primary)]">{category.count}</span>
                {category.trend && category.trend !=="0" && (
                  <TrendingUp className="w-3 h-3 text-success" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="neuro-raised p-6 h-[140px]">
              <div className="flex items-start justify-between h-full">
                <div>
                  <p className="text-body-sm text-[var(--text-secondary)] mb-1">{kpi.title}</p>
                  <h3 className="text-heading font-display text-[var(--text-primary)]">{kpi.value}</h3>
                  {kpi.trend && (
                    <p
                      className={`text-body-xs mt-2 flex items-center gap-1 ${
                        kpi.color ==="red"
                          ?"text-error"
                          : kpi.color ==="yellow"
                          ?"text-warning"
                          :"text-success"
                      }`}
                    >
                      {kpi.color ==="red" && <TrendingUp className="w-3 h-3" />}
                      {kpi.trend}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {activeCategory ==="dashboard" && renderDashboard()}
        {activeCategory ==="materiais" && renderLista()}
        {activeCategory ==="alertas" && renderLista()}
        {activeCategory ==="scanner" && renderDashboard()}
        {activeCategory ==="containers" && renderDashboard()}
        {activeCategory ==="predicoes" && renderDashboard()}
        {activeCategory ==="relatorios" && renderDashboard()}
      </div>
    </div>
  );
}