import { useState, useEffect } from"react";
import { BrowserRouter as Router, Routes, Route } from"react-router-dom";
import { ToastProvider } from"@/contexts";
import { BrainCircuit } from"lucide-react";
import { IcarusTopbar } from"./components/layout/IcarusTopbar";
import { IcarusSidebar } from"./components/layout/IcarusSidebar";
import { ModulePlaceholder } from"./components/layout/ModulePlaceholder";
import { ChatbotWithResearch } from"./components/oraclusx-ds/ChatbotWithResearch";

// Páginas Principais
import Dashboard from"./pages/DashboardPrincipal";
import ConsignacaoAvancada from"./pages/ConsignacaoAvancada";
import ComplianceAuditoria from"./pages/ComplianceAuditoria";

// Módulos Implementados (Novos)
import FaturamentoNFeCompleto from"./pages/modules/FaturamentoNFeCompleto";
import GestaoUsuariosPermissoes from"./pages/modules/GestaoUsuariosPermissoes";
import APIGatewayDashboard from"./pages/modules/APIGatewayDashboard";
import BIDashboardInterativo from"./pages/modules/BIDashboardInterativo";
import LicitacoesPropostas from"./pages/modules/LicitacoesPropostas";
import GestaoContabil from"./pages/modules/GestaoContabil";
import RelatoriosRegulatorios from"./pages/modules/RelatoriosRegulatorios";
import Microsoft365IntegrationPanel from"./pages/modules/Microsoft365IntegrationPanel";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newMode ?"dark" :"light");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme ==="dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ?"dark" :"light");
  }, [darkMode]);

  return (
    <Router>
      <ToastProvider>
        <div className={`min-h-screen ${darkMode ?"dark" :""}`} style={{ background: 'transparent' }}>
          {/* Brand Container - ACIMA da Topbar (formato imagem, 20% menor e centralizado) */}
          <div 
            className="fixed top-4 left-4 z-50 flex justify-center" 
            style={{ 
              width: sidebarCollapsed ? '64px' : '255px',
              transition: 'width 0.3s ease'
            }}
          >
            <div 
              className="neumorphic-card text-center"
              style={{
                width: sidebarCollapsed ? '56px' : '144px',
                background: 'linear-gradient(135deg, var(--orx-primary), #a855f7, var(--orx-pink-500))',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
                padding: sidebarCollapsed ? '0.8rem' : '1.2rem 0.8rem',
                borderRadius: '1rem',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
            >
              <div className="flex justify-center mb-2">
                <BrainCircuit 
                  size={sidebarCollapsed ? 32 : 45} 
                  style={{ 
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                  strokeWidth={2}
                />
              </div>
              {!sidebarCollapsed && (
                <>
                  <h2 style={{ 
                    fontSize: '1.1rem',
                    fontFamily: 'var(--orx-font-family)',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.25rem',
                    letterSpacing: '0.02em'
                  }}>
                    Icarus v5.0
                  </h2>
                  <p style={{
                    fontSize: '0.6rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    lineHeight: '1.3'
                  }}>
                    Gestão elevada pela IA
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Topbar Completa - Conforme documentação */}
          <IcarusTopbar
            sidebarCollapsed={sidebarCollapsed}
            darkMode={darkMode}
            unreadCount={unreadNotifications}
            onToggleSidebar={toggleSidebar}
            onToggleDarkMode={toggleDarkMode}
            onOpenNotifications={() => console.log("Abrir notificações")}
            onOpenSettings={() => console.log("Abrir configurações")}
            onOpenHelp={() => console.log("Abrir ajuda")}
            userName="Roberto Silva"
            userRole="Gerente Comercial"
          />

          {/* Navegação - Sidebar Completa com 58 módulos */}
          <nav 
            className="fixed left-4 z-40 neumorphic-card space-y-2" 
            style={{ 
              top: '172px', 
              width: sidebarCollapsed ? '64px' : '255px',
              padding: sidebarCollapsed ? '16px 8px' : '16px',
              transition: 'width 0.3s ease, padding 0.3s ease',
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 188px)',
              overflowY: 'auto',
              borderRadius: '1.25rem', // ADICIONADO: bordas arredondadas
              boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)' // ADICIONADO: sombras neumórficas
            }}
          >
            <IcarusSidebar collapsed={sidebarCollapsed} />
            
            {!sidebarCollapsed && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center gap-2 opacity-60">
                  <BrainCircuit size={20} style={{ color: 'var(--orx-primary)' }} />
                  <span style={{ fontSize: 'var(--orx-font-size-xs)', textAlign: 'center', lineHeight: '1.2' }}>
                    Powered by<br />
                    <strong>Icarus AI Technology</strong>
                  </span>
                </div>
              </div>
            )}
            </nav>

          {/* Main content - Container neumórfico alinhado com topbar */}
          <main style={{ 
            marginLeft: '279px', 
            marginRight: '16px', 
            marginTop: '96px'
          }}>
            <div 
              className="neumorphic-card p-6" 
              style={{
                minHeight:"calc(100vh - 112px)",
                borderRadius:"1.25rem",
                boxShadow:"var(--orx-shadow-light-1), var(--orx-shadow-light-2)",
                background:"var(--orx-bg-light)"
              }}
            >
              <Routes>
                {/* Home vai direto para Dashboard */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Módulos Completos Implementados */}
                <Route path="/consignacao/*" element={<ConsignacaoAvancada />} />
                <Route path="/compliance/*" element={<ComplianceAuditoria />} />
                <Route path="/faturamento-nfe" element={<FaturamentoNFeCompleto />} />
                <Route path="/usuarios-permissoes" element={<GestaoUsuariosPermissoes />} />
                <Route path="/api-gateway" element={<APIGatewayDashboard />} />
                <Route path="/bi-dashboard" element={<BIDashboardInterativo />} />
                <Route path="/licitacoes" element={<LicitacoesPropostas />} />
                <Route path="/gestao-contabil" element={<GestaoContabil />} />
                <Route path="/relatorios-regulatorios" element={<RelatoriosRegulatorios />} />
                <Route path="/microsoft365" element={<Microsoft365IntegrationPanel />} />
                
                {/* Cadastros */}
                <Route path="/cadastros" element={<ModulePlaceholder title="Cadastros Inteligentes" />} />
                <Route path="/cadastros/medicos" element={<ModulePlaceholder title="Cadastro de Médicos" />} />
                <Route path="/cadastros/equipes" element={<ModulePlaceholder title="Equipes Médicas" />} />
                <Route path="/cadastros/hospitais" element={<ModulePlaceholder title="Hospitais & Clínicas" />} />
                <Route path="/cadastros/convenios" element={<ModulePlaceholder title="Convênios" />} />
                <Route path="/cadastros/fornecedores" element={<ModulePlaceholder title="Fornecedores" />} />
                <Route path="/cadastros/produtos" element={<ModulePlaceholder title="Produtos OPME" />} />
                
                {/* Compras */}
                <Route path="/compras" element={<ModulePlaceholder title="Compras e Fornecedores" />} />
                <Route path="/compras/cotacoes" element={<ModulePlaceholder title="Cotações" />} />
                <Route path="/compras/propostas" element={<ModulePlaceholder title="Propostas" />} />
                <Route path="/compras/avaliacao" element={<ModulePlaceholder title="Avaliação de Fornecedores" />} />
                
                {/* Contratos */}
                <Route path="/contratos" element={<ModulePlaceholder title="Gestão de Contratos" />} />
                <Route path="/contratos/dashboard" element={<ModulePlaceholder title="Dashboard Contratos" />} />
                <Route path="/contratos/fornecedores" element={<ModulePlaceholder title="Contratos Fornecedores" />} />
                <Route path="/contratos/hospitais" element={<ModulePlaceholder title="Contratos Hospitais" />} />
                <Route path="/contratos/renovacoes" element={<ModulePlaceholder title="Renovações" />} />
                <Route path="/contratos/vencimentos" element={<ModulePlaceholder title="Vencimentos" />} />
                
                {/* CRM e Vendas */}
                <Route path="/crm" element={<ModulePlaceholder title="Vendas & CRM" />} />
                <Route path="/crm/prospecoes" element={<ModulePlaceholder title="Prospecções" />} />
                <Route path="/crm/propostas" element={<ModulePlaceholder title="Propostas Comerciais" />} />
                <Route path="/crm/relacionamento" element={<ModulePlaceholder title="Relacionamento Médicos" />} />
                <Route path="/crm/vendas" element={<ModulePlaceholder title="Vendas & Contratos" />} />
                
                {/* Cirurgias */}
                <Route path="/cirurgias" element={<ModulePlaceholder title="Gestão de Cirurgias" />} />
                <Route path="/cirurgias/pendentes" element={<ModulePlaceholder title="Pedidos Pendentes" />} />
                <Route path="/cirurgias/kits" element={<ModulePlaceholder title="Preparação de Kits" />} />
                <Route path="/cirurgias/acompanhamento" element={<ModulePlaceholder title="Acompanhamento" />} />
                <Route path="/cirurgias/pos-cirurgico" element={<ModulePlaceholder title="Pós-Cirúrgico" />} />
                
                {/* Estoque */}
                <Route path="/estoque" element={<ModulePlaceholder title="Estoque Inteligente" />} />
                <Route path="/estoque/dashboard" element={<ModulePlaceholder title="Visão Geral - Estoque" />} />
                <Route path="/estoque/containers" element={<ModulePlaceholder title="Containers IoT" />} />
                <Route path="/estoque/scanner" element={<ModulePlaceholder title="Scanner RFID" />} />
                <Route path="/estoque/inventario" element={<ModulePlaceholder title="Inventário" />} />
                
                {/* Logística */}
                <Route path="/logistica" element={<ModulePlaceholder title="Logística Avançada" />} />
                <Route path="/logistica/rastreamento" element={<ModulePlaceholder title="Rastreamento Real-Time" />} />
                <Route path="/logistica/entregas" element={<ModulePlaceholder title="Entregas Ativas" />} />
                <Route path="/logistica/rotas" element={<ModulePlaceholder title="Otimização de Rotas" />} />
                <Route path="/logistica/transportadoras" element={<ModulePlaceholder title="Transportadoras ANVISA" />} />
                
                {/* Faturamento e Financeiro */}
                <Route path="/faturamento" element={<ModulePlaceholder title="Faturamento Avançado" />} />
                <Route path="/financeiro" element={<ModulePlaceholder title="Financeiro Avançado" />} />
                <Route path="/financeiro/dashboard" element={<ModulePlaceholder title="Dashboard Financeiro" />} />
                <Route path="/financeiro/dda" element={<ModulePlaceholder title="DDA Bancário" />} />
                <Route path="/financeiro/sefaz" element={<ModulePlaceholder title="SEFAZ NFe" />} />
                <Route path="/financeiro/conciliacao" element={<ModulePlaceholder title="Conciliação" />} />
                <Route path="/financeiro/faturamento" element={<ModulePlaceholder title="Faturamento Financeiro" />} />
                
                {/* Analytics */}
                <Route path="/analytics" element={<ModulePlaceholder title="Analytics & BI" />} />
                <Route path="/analytics/paineis" element={<ModulePlaceholder title="Painéis de Controle" />} />
                <Route path="/analytics/relatorios" element={<ModulePlaceholder title="Relatórios IA" />} />
                <Route path="/analytics/kpis" element={<ModulePlaceholder title="KPIs" />} />
                <Route path="/analytics/previsoes" element={<ModulePlaceholder title="Previsões IA" />} />
                
                {/* Rastreabilidade */}
                <Route path="/rastreabilidade" element={<ModulePlaceholder title="Rastreabilidade OPME" />} />
                <Route path="/rastreabilidade/dashboard" element={<ModulePlaceholder title="Dashboard Rastreamento" />} />
                <Route path="/rastreabilidade/produtos" element={<ModulePlaceholder title="Produtos Rastreados" />} />
                <Route path="/rastreabilidade/pacientes" element={<ModulePlaceholder title="Por Paciente" />} />
                <Route path="/rastreabilidade/historico" element={<ModulePlaceholder title="Histórico & Alertas" />} />
                <Route path="/rastreabilidade/mapa" element={<ModulePlaceholder title="Mapa Geográfico" />} />
                
                {/* Manutenção */}
                <Route path="/manutencao" element={<ModulePlaceholder title="Manutenção Preventiva" />} />
                <Route path="/manutencao/dashboard" element={<ModulePlaceholder title="Visão Geral - Manutenção" />} />
                <Route path="/manutencao/equipamentos" element={<ModulePlaceholder title="Equipamentos Médicos" />} />
                <Route path="/manutencao/agendamentos" element={<ModulePlaceholder title="Agendamentos" />} />
                <Route path="/manutencao/performance" element={<ModulePlaceholder title="Performance" />} />
                <Route path="/manutencao/historico" element={<ModulePlaceholder title="Histórico" />} />
                
                {/* Analytics IA */}
                <Route path="/analytics-ia" element={<ModulePlaceholder title="Analytics Preditivo IA" />} />
                <Route path="/analytics-ia/dashboard" element={<ModulePlaceholder title="Visão Geral - Analytics IA" />} />
                <Route path="/analytics-ia/predicoes" element={<ModulePlaceholder title="Predições" />} />
                <Route path="/analytics-ia/modelos" element={<ModulePlaceholder title="Modelos IA" />} />
                <Route path="/analytics-ia/tendencias" element={<ModulePlaceholder title="Tendências" />} />
                <Route path="/analytics-ia/insights" element={<ModulePlaceholder title="Insights" />} />
                
                {/* Telemetria e Relatórios */}
                <Route path="/telemetria" element={<ModulePlaceholder title="Telemetria IoT" />} />
                <Route path="/relatorios-regulatorios" element={<ModulePlaceholder title="Relatórios Regulatórios" />} />
                
                {/* IA Central */}
                <Route path="/ia-central" element={<ModulePlaceholder title="IA Central" />} />
                <Route path="/ia-central/dashboard" element={<ModulePlaceholder title="Dashboard IA" />} />
                <Route path="/ia-central/orquestrador" element={<ModulePlaceholder title="Orquestrador" />} />
                <Route path="/ia-central/chatbot" element={<ModulePlaceholder title="Chatbot Analytics" />} />
                
                {/* API Gateway */}
                <Route path="/api-gateway" element={<ModulePlaceholder title="API Gateway" />} />
                
                {/* 404 - Not Found */}
                <Route path="*" element={
                  <div className="neumorphic-card p-8 text-center">
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                      404 - Página Não Encontrada
                    </h1>
                    <p>A página que você está procurando não existe.</p>
                  </div>
                } />
              </Routes>
            </div>
          </main>

          {/* Chatbot com GPT Researcher - FAB Global */}
        <ChatbotWithResearch
          position="bottom-right"
          researcherHost="http://localhost:8000"
        />
      </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
