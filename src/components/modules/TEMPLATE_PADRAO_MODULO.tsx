/**
 * TEMPLATE PADRÃO - MÓDULOS ICARUS v5.0
 * OraclusX Design System - 100% Conforme
 * 
 * ESTRUTURA OBRIGATÓRIA:
 * 1. Imports organizados
 * 2. Interfaces TypeScript
 * 3. Componente principal
 * 4. Hook useDocumentTitle
 * 5. Backend integration (hooks)
 * 6. Estados locais
 * 7. Handlers
 * 8. Helpers (formatação)
 * 9. JSX estruturado:
 *    - Header com título + badge
 *    - NavigationBar (categorias)
 *    - KPIs (4 cards)
 *    - Tabs (se aplicável)
 *    - Conteúdo principal
 * 10. Export default
 */

import React, { useState, useEffect } from"react";
import { Card } from"@/components/oraclusx-ds";
import { TrendingUp, Loader2, Search, Plus, Eye, Edit2, Trash2, Download, CheckCircle, Clock, DollarSign, AlertCircle } from"lucide-react";
import { useDocumentTitle } from"@/hooks"; // OBRIGATÓRIO
// import { useToast } from"@/contexts/ToastContext"; // OBRIGATÓRIO
// import { useNomeDoHook } from"@/hooks"; // Hook do backend (se aplicável)

// INTERFACES TypeScript (OBRIGATÓRIO)
// interface ItemType {
//   id: string;
//   // ... propriedades
//   created_at: string;
//   updated_at: string;
// }

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

// COMPONENTE PRINCIPAL
export default function NomeDoModulo() {
  // 1. HOOK DE TÍTULO (OBRIGATÓRIO)
  useDocumentTitle("Título do Módulo");

  // 2. NAVEGAÇÃO INTERNA
  const [activeCategory, setActiveCategory] = useState<string>("dashboard");
  const [activeTab, setActiveTab] = useState<string>("todos");

  // 3. BACKEND INTEGRATION (se aplicável)
  // const {
  //   items,
  //   loading,
  //   error,
  //   fetchItems,
  //   createItem,
  //   updateItem,
  //   deleteItem,
  // } = useNomeDoHook();
  
// const { addToast } = useToast();

  // 4. ESTADOS LOCAIS
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 5. KPIS (SEMPRE 4 CARDS)
  const kpis: KPI[] = [
    {
      title:"Total Itens",
      value:"0", // ou loading ?"..." : items.length
      trend:"+12%",
      icon: TrendingUp,
      color:"blue",
    },
    {
      title:"Ativos",
      value:"0",
      trend:"+5",
      icon: CheckCircle,
      color:"green",
    },
    {
      title:"Pendentes",
      value:"0",
      trend:"-2",
      icon: Clock,
      color:"yellow",
    },
    {
      title:"Valor Total",
      value:"R$ 0",
      trend:"+8%",
      icon: DollarSign,
      color:"purple",
    },
  ];

  // 6. CATEGORIAS NAVEGAÇÃO (botões com badges)
  const categories: Category[] = [
    { id:"dashboard", label:"Dashboard", icon: TrendingUp, count: 0, trend:"+0" },
    { id:"lista", label:"Lista Completa", icon: Eye, count: 0, trend:"+0" },
    { id:"relatorios", label:"Relatórios", icon: Download, count: 0 },
  ];

  // 7. EFEITOS
  useEffect(() => {
    // Carregar dados do backend
    // fetchItems();
  }, []);

  // useEffect(() => {
  //   if (error) {
  //     addToast(error,"error");
  //   }
  // }, [error, addToast]);

  // 8. HANDLERS
  /*
  const handleCreate = async () => {
    const result = await createItem(data);
    if (result) {
      addToast("Item criado com sucesso!","success");
    }
  };

  const handleUpdate = async (id: string) => {
    const result = await updateItem(id, data);
    if (result) {
      addToast("Item atualizado com sucesso!","success");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const result = await deleteItem(id);
    if (result) {
      addToast("Item excluído com sucesso!","success");
    }
  };

  // 9. HELPERS (formatação)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style:"currency",
      currency:"BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };
  */

  // 10. RENDER FUNCTIONS
  const renderDashboard = () => (
    <div className="space-y-6">
      <Card className="neuro-raised p-6">
        <h3 className="text-body-lg text-[var(--text-primary)] mb-4 font-medium">
          Dashboard Principal
        </h3>
        <p className="text-[var(--text-secondary)]">
          Conteúdo do dashboard aqui
        </p>
      </Card>
    </div>
  );

  const renderLista = () => (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <button 
            onClick={() => {/* handleCreate(data); */}}
            className="neuro-button px-6 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
          <button className="neuro-button-secondary px-4 py-2 rounded-xl">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl neuro-inset text-body-sm"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Tabela / Grid */}
      {!loading && (
        <Card className="neuro-raised overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] font-medium">
                    ID
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] font-medium">
                    Nome
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] font-medium">
                    Status
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Mapear items aqui */}
                <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                  <td className="p-4 text-[var(--text-primary)]">001</td>
                  <td className="p-4 text-[var(--text-primary)]">Exemplo</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs bg-success/5 text-success font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Ativo
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
                      <button className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all text-error">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Empty State */}
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">Nenhum item encontrado</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  // 11. JSX PRINCIPAL (ESTRUTURA PADRÃO)
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER (OBRIGATÓRIO) */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Título do Módulo
            </h1>
            <p className="text-[var(--text-secondary)]">
              Descrição breve do módulo e suas funcionalidades
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success/50 animate-pulse" />
            <span className="text-body-sm text-[var(--text-primary)] font-medium">
              Realtime Sync
            </span>
          </div>
        </div>

        {/* NAVIGATION BAR (OBRIGATÓRIO se tem categorias) */}
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
              <span className="text-body-xs text-[var(--text-primary)] font-medium">
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

        {/* KPIS (OBRIGATÓRIO - 4 CARDS) */}
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
                    <p className="text-body-xs text-success mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
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

        {/* TABS (OPCIONAL - se aplicável) */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {["todos","ativos","inativos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ?"neuro-raised text-[var(--primary)]"
                  :"text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* CONTEÚDO PRINCIPAL (baseado em activeCategory) */}
        {activeCategory ==="dashboard" && renderDashboard()}
        {activeCategory ==="lista" && renderLista()}
        {activeCategory ==="relatorios" && (
          <Card className="neuro-raised p-12 text-center">
            <Download className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 font-medium">
              Relatórios
            </h3>
            <p className="text-[var(--text-secondary)]">
              Módulo de relatórios em desenvolvimento
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// CHECKLIST DE CONFORMIDADE:
// [ ] useDocumentTitle implementado
// [ ] Hooks de backend integrados (se aplicável)
// [ ] Header com título + badge
// [ ] NavigationBar com badges de contagem
// [ ] 4 KPIs cards
// [ ] Loading states (Loader2)
// [ ] Empty states
// [ ] Toast notifications
// [ ] Formatação de moeda/data
// [ ] Responsivo (grid responsivo)
// [ ] Classes neuromórficas (neuro-raised, neuro-inset)
// [ ] Cores via CSS variables (var(--primary))
// [ ] Ícones Lucide React
// [ ] TypeScript interfaces
// [ ] Export default

