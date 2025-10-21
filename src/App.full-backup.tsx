import { useState, useEffect } from"react";
import { BrowserRouter as Router, Routes, Route, Link } from"react-router-dom";
import { ToastProvider } from"@/contexts";
import { Tooltip } from"@/components/oraclusx-ds";
import {
  Moon,
  Sun,
  Menu,
  Home,
  LayoutDashboard,
  Settings,
  Palette,
  Package,
  Grid3x3,
  Stethoscope,
  DollarSign,
  Briefcase,
  Users,
  FileText,
  ShoppingBag,
  Truck,
  QrCode,
} from"lucide-react";
import Dashboard from"./pages/Dashboard";
import DashboardPrincipal from"./pages/DashboardPrincipal";
import Welcome from"./pages/Welcome";
import Showcase from"./pages/Showcase";
import Modules from"./pages/Modules";
import Login from"./pages/Login";
import Signup from"./pages/Signup";
import NotFound from"./pages/NotFound";
import Unauthorized from"./pages/Unauthorized";
import ServerError from"./pages/ServerError";
// Módulos Core e já roteados
import EstoqueIA from"./components/modules/EstoqueIA";
import CirurgiasProcedimentos from"./components/modules/CirurgiasProcedimentos";
import FinanceiroAvancado from"./components/modules/FinanceiroAvancado";
import GestãoCadastros from"./components/modules/GestãoCadastros";
import Faturamento from"./components/modules/Faturamento";
import ComprasFornecedores from"./components/modules/ComprasFornecedores";
import LogisticaAvancada from"./components/modules/LogisticaAvancada";
import RastreabilidadeOPME from"./components/modules/RastreabilidadeOPME";
import BIAnalytics from"./components/modules/BIAnalytics";

// Novos módulos refatorados (OraclusX DS Premium)
import ConsignacaoAvancada from"./pages/ConsignacaoAvancada";
import ComplianceAuditoria from"./pages/ComplianceAuditoria";
import AutenticacaoAvancada from"./components/modules/AutenticacaoAvancada";
import SistemaNotificacoes from"./components/modules/SistemaNotificacoes";
import IntegracoesExternas from"./components/modules/IntegracoesExternas";
import ChatEnterprise from"./components/modules/ChatEnterprise";
import NFeAutomatica from"./components/modules/NFeAutomatica";
import AgendamentoCirurgico from"./components/modules/AgendamentoCirurgico";
import GestaoContratos from"./components/modules/GestaoContratos";
import DashboardContratos from"./components/modules/DashboardContratos";
import RelatoriosAvancados from"./components/modules/RelatoriosAvancados";
import ConfiguracoesSistema from"./components/modules/ConfiguracoesSistema";
import CRMVendas from"./components/modules/CRMVendas";

// Novos módulos Analytics & BI
import AnalyticsBI from"./components/modules/AnalyticsBI";
import AnalyticsPredicao from"./components/modules/AnalyticsPredicao";
import ChatBotMetrics from"./components/modules/ChatBotMetrics";
import ModulosAnalytics from"./components/modules/ModulosAnalytics";
import ModulosAvancados from"./components/modules/ModulosAvancados";
import ModulosCompliance from"./components/modules/ModulosCompliance";

// RH & Pessoas
import AvaliacaoDesempenho from"./components/modules/AvaliacaoDesempenho";
import BeneficiosColaboradores from"./components/modules/BeneficiosColaboradores";
import CapacitacaoIA from"./components/modules/CapacitacaoIA";
import EscalasFuncionarios from"./components/modules/EscalasFuncionarios";
import FolhaPagamento from"./components/modules/FolhaPagamento";
import OnboardingDigital from"./components/modules/OnboardingDigital";
import PerformanceEquipes from"./components/modules/PerformanceEquipes";
import PontoEletronico from"./components/modules/PontoEletronico";
import RecrutamentoIA from"./components/modules/RecrutamentoIA";
import SegurancaTrabalho from"./components/modules/SegurancaTrabalho";
import TreinamentoEquipes from"./components/modules/TreinamentoEquipes";

// Estoque & Inventário
import EstoqueAvancado from"./components/modules/EstoqueAvancado";
import GestaoInventario from"./components/modules/GestaoInventario";
import InventarioInteligente from"./components/modules/InventarioInteligente";

// Compras & Fornecedores
import ComprasInternacionais from"./components/modules/ComprasInternacionais";
import CotacoesAutomaticas from"./components/modules/CotacoesAutomaticas";
import FornecedoresAvancado from"./components/modules/FornecedoresAvancado";
import NotasCompra from"./components/modules/NotasCompra";
import PedidosCompra from"./components/modules/PedidosCompra";
import ViabilidadeImportacao from"./components/modules/ViabilidadeImportacao";

// Logística & Frota
import CombustivelIA from"./components/modules/CombustivelIA";
import EntregasAutomaticas from"./components/modules/EntregasAutomaticas";
import ExpedicaoMercadorias from"./components/modules/ExpedicaoMercadorias";
import FrotaVeiculos from"./components/modules/FrotaVeiculos";
import LogisticaTransportadoras from"./components/modules/LogisticaTransportadoras";
import ManutencaoFrota from"./components/modules/ManutencaoFrota";
import RotasOtimizadas from"./components/modules/RotasOtimizadas";
import TelemetriaVeiculos from"./components/modules/TelemetriaVeiculos";
import TransportadorasIA from"./components/modules/TransportadorasIA";

// Vendas & Marketing
import AnunciosPagos from"./components/modules/AnunciosPagos";
import CampanhasAutomaticas from"./components/modules/CampanhasAutomaticas";
import ContasReceberIA from"./components/modules/ContasReceberIA";
import ConversaoVendas from"./components/modules/ConversaoVendas";
import EmailMarketing from"./components/modules/EmailMarketing";
import GestaoLeads from"./components/modules/GestaoLeads";
import LeadsQualificados from"./components/modules/LeadsQualificados";
import MarketingDigital from"./components/modules/MarketingDigital";
import RedesSociais from"./components/modules/RedesSociais";
import RelacionamentoCliente from"./components/modules/RelacionamentoCliente";
import SEOOtimizado from"./components/modules/SEOOtimizado";

// Produtos & OPME
import CertificacoesAnvisa from"./components/modules/CertificacoesAnvisa";
import GruposProdutosOPME from"./components/modules/GruposProdutosOPME";
import ProdutosOPME from"./components/modules/ProdutosOPME";
import QualidadeOPME from"./components/modules/QualidadeOPME";
import TabelasPrecos from"./components/modules/TabelasPrecos";

// Financeiro & Relatórios
import RelatoriosExecutivos from"./components/modules/RelatoriosExecutivos";
import RelatoriosFinanceiros from"./components/modules/RelatoriosFinanceiros";

// Sistemas, Automação & Compliance
import AutomacaoIA from"./components/modules/AutomacaoIA";
import AuditoriaInterna from"./components/modules/AuditoriaInterna";
import ComplianceRegulatorio from"./components/modules/ComplianceRegulatorio";
import GestaoRiscos from"./components/modules/GestaoRiscos";
import IACentral from"./components/modules/IACentral";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Sincronizar theme com localStorage
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

  // Sistema de Navegação por Custom Events
  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ module: string; params?: unknown }>;
      const { module, params } = customEvent.detail;
      
      console.log(`📍 Navegando para módulo: ${module}`, params);
      
      // Mapear módulos para rotas
      const moduleRoutes: Record<string, string> = {
        'crm-vendas': '/crm-vendas',
        'faturamento': '/faturamento',
        'faturamento-nfe': '/nfe-automatica',
        'cadastros': '/cadastros',
        'relatorios-executivos': '/relatorios-executivos',
        'configuracoes': '/configuracoes',
        'dashboard-principal': '/dashboard-principal',
        'estoque': '/estoque-ia',
        'cirurgias': '/cirurgias',
        'financeiro': '/financeiro',
        'compras': '/compras-fornecedores',
        'logistica': '/logistica-avancada'
      };
      
      const route = moduleRoutes[module];
      if (route) {
        // Navegar para rota (se estiver usando React Router)
        window.location.hash = route;
      }
    };

    window.addEventListener('navigate', handleNavigate);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  return (
    <Router>
      <ToastProvider>
        <div className={`neumorphic-container ${darkMode ?"dark" :""}`}>
        {/* Skip Navigation Link (A11y) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-inverse focus:rounded-md focus:shadow-lg"
        >
          Pular para conteúdo principal
        </a>

        {/* Header - 64px conforme spec */}
        <header
          role="banner"
          aria-label="Cabeçalho principal"
          className="neumorphic-card fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 m-4 h-16"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="neumorphic-button p-2"
              aria-label="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 style={{ 
              fontSize: 'var(--orx-font-size-2xl)',
              fontFamily: 'var(--orx-font-family)',
              fontWeight: 600,
              background: 'linear-gradient(to right, var(--orx-primary), var(--orx-primary-hover))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Icarus Make
            </h1>
          </div>

          <button
            onClick={toggleDarkMode}
            className="neumorphic-button p-2"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        <div className="flex pt-24">
          {/* Sidebar - Transition 200ms conforme spec */}
          <aside
            role="navigation"
            aria-label="Menu lateral"
            className={`fixed left-0 top-24 bottom-0 transition-all duration-200 ${
              sidebarOpen
                ?"translate-x-0 w-[260px]"
                :"-translate-x-full w-[80px]"
            }`}
          >
            <nav
              aria-label="Navegação principal"
              className={`neumorphic-card h-full m-4 p-4 ${sidebarOpen ?"w-[260px]" :"w-[80px]"}`}
            >
              <ul className="space-y-2">
                <li>
                  <Tooltip content="Home" position="right">
                    <Link
                      to="/"
                      className="flex items-center gap-3 neumorphic-button w-full text-left"
                    >
                      <Home size={20} />
                      {sidebarOpen && <span>Home</span>}
                    </Link>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip content="Dashboard" position="right">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 neumorphic-button w-full text-left"
                    >
                      <LayoutDashboard size={20} />
                      {sidebarOpen && <span>Dashboard</span>}
                    </Link>
                  </Tooltip>
                </li>
                  <li>
                    <Tooltip content="Módulos" position="right">
                      <Link
                        to="/modules"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Grid3x3 size={20} />
                        {sidebarOpen && <span>Módulos</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Design System" position="right">
                      <Link
                        to="/showcase"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Palette size={20} />
                        {sidebarOpen && <span>Design System</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Estoque IA" position="right">
                      <Link
                        to="/estoque-ia"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Package size={20} />
                        {sidebarOpen && <span>Estoque IA</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Cirurgias" position="right">
                      <Link
                        to="/cirurgias"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Stethoscope size={20} />
                        {sidebarOpen && <span>Cirurgias</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Financeiro" position="right">
                      <Link
                        to="/financeiro"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <DollarSign size={20} />
                        {sidebarOpen && <span>Financeiro</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Faturamento" position="right">
                      <Link
                        to="/faturamento"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <FileText size={20} />
                        {sidebarOpen && <span>Faturamento</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Compras" position="right">
                      <Link
                        to="/compras"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <ShoppingBag size={20} />
                        {sidebarOpen && <span>Compras</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Logística" position="right">
                      <Link
                        to="/logistica"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Truck size={20} />
                        {sidebarOpen && <span>Logística</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Rastreabilidade" position="right">
                      <Link
                        to="/rastreabilidade"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <QrCode size={20} />
                        {sidebarOpen && <span>Rastreabilidade</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="Cadastros" position="right">
                      <Link
                        to="/cadastros"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Users size={20} />
                        {sidebarOpen && <span>Cadastros</span>}
                      </Link>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip content="CRM & Vendas" position="right">
                      <Link
                        to="/crm-vendas"
                        className="flex items-center gap-3 neumorphic-button w-full text-left"
                      >
                        <Briefcase size={20} />
                        {sidebarOpen && <span>CRM & Vendas</span>}
                      </Link>
                    </Tooltip>
                  </li>
                <li>
                  <Tooltip content="Configurações" position="right">
                    <button className="flex items-center gap-3 neumorphic-button w-full text-left">
                      <Settings size={20} />
                      {sidebarOpen && <span>Configurações</span>}
                    </button>
                  </Tooltip>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content - Margin 284px conforme spec (260px sidebar + 24px gap) */}
          <main
            id="main-content"
            role="main"
            aria-label="Conteúdo principal"
            className={`flex-1 transition-all duration-200 ${
              sidebarOpen ?"ml-[284px]" :"ml-0"
            }`}
          >
            <div className="p-6">
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Rotas Privadas */}
                <Route path="/" element={<Welcome />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard-principal" element={<DashboardPrincipal />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/showcase" element={<Showcase />} />
                <Route path="/estoque-ia" element={<EstoqueIA />} />
                <Route path="/cirurgias" element={<CirurgiasProcedimentos />} />
                <Route path="/financeiro" element={<FinanceiroAvancado />} />
                <Route path="/faturamento" element={<Faturamento />} />
                <Route path="/compras" element={<ComprasFornecedores />} />
                <Route path="/logistica" element={<LogisticaAvancada />} />
                <Route path="/rastreabilidade" element={<RastreabilidadeOPME />} />
                <Route path="/consignacao" element={<ConsignacaoAvancada />} />
                <Route path="/compliance-auditoria" element={<ComplianceAuditoria />} />
                <Route path="/bi-analytics" element={<BIAnalytics />} />
                <Route path="/autenticacao" element={<AutenticacaoAvancada />} />
                <Route path="/notificacoes" element={<SistemaNotificacoes />} />
                <Route path="/integracoes" element={<IntegracoesExternas />} />
                <Route path="/chat" element={<ChatEnterprise />} />
                <Route path="/nfe-automatica" element={<NFeAutomatica />} />
                <Route path="/agendamento" element={<AgendamentoCirurgico />} />
                <Route path="/contratos" element={<GestaoContratos />} />
                <Route path="/dashboard-contratos" element={<DashboardContratos />} />
                <Route path="/relatorios" element={<RelatoriosAvancados />} />
                <Route path="/configuracoes" element={<ConfiguracoesSistema />} />
                <Route path="/cadastros" element={<GestãoCadastros />} />
                <Route path="/crm-vendas" element={<CRMVendas />} />
                
                {/* Analytics & BI */}
                <Route path="/analytics-bi" element={<AnalyticsBI />} />
                <Route path="/analytics-predicao" element={<AnalyticsPredicao />} />
                <Route path="/chatbot-metrics" element={<ChatBotMetrics />} />
                <Route path="/modulos-analytics" element={<ModulosAnalytics />} />
                <Route path="/modulos-avancados" element={<ModulosAvancados />} />
                <Route path="/modulos-compliance" element={<ModulosCompliance />} />
                
                {/* RH & Pessoas */}
                <Route path="/avaliacao-desempenho" element={<AvaliacaoDesempenho />} />
                <Route path="/beneficios" element={<BeneficiosColaboradores />} />
                <Route path="/capacitacao-ia" element={<CapacitacaoIA />} />
                <Route path="/escalas-funcionarios" element={<EscalasFuncionarios />} />
                <Route path="/folha-pagamento" element={<FolhaPagamento />} />
                <Route path="/onboarding-digital" element={<OnboardingDigital />} />
                <Route path="/performance-equipes" element={<PerformanceEquipes />} />
                <Route path="/ponto-eletronico" element={<PontoEletronico />} />
                <Route path="/recrutamento-ia" element={<RecrutamentoIA />} />
                <Route path="/seguranca-trabalho" element={<SegurancaTrabalho />} />
                <Route path="/treinamento-equipes" element={<TreinamentoEquipes />} />
                
                {/* Estoque & Inventário */}
                <Route path="/estoque-avancado" element={<EstoqueAvancado />} />
                <Route path="/gestao-inventario" element={<GestaoInventario />} />
                <Route path="/inventario-inteligente" element={<InventarioInteligente />} />
                
                {/* Compras & Fornecedores */}
                <Route path="/compras-internacionais" element={<ComprasInternacionais />} />
                <Route path="/cotacoes-automaticas" element={<CotacoesAutomaticas />} />
                <Route path="/fornecedores-avancado" element={<FornecedoresAvancado />} />
                <Route path="/notas-compra" element={<NotasCompra />} />
                <Route path="/pedidos-compra" element={<PedidosCompra />} />
                <Route path="/viabilidade-importacao" element={<ViabilidadeImportacao />} />
                
                {/* Logística & Frota */}
                <Route path="/combustivel-ia" element={<CombustivelIA />} />
                <Route path="/entregas-automaticas" element={<EntregasAutomaticas />} />
                <Route path="/expedicao-mercadorias" element={<ExpedicaoMercadorias />} />
                <Route path="/frota-veiculos" element={<FrotaVeiculos />} />
                <Route path="/logistica-transportadoras" element={<LogisticaTransportadoras />} />
                <Route path="/manutencao-frota" element={<ManutencaoFrota />} />
                <Route path="/rotas-otimizadas" element={<RotasOtimizadas />} />
                <Route path="/telemetria-veiculos" element={<TelemetriaVeiculos />} />
                <Route path="/transportadoras-ia" element={<TransportadorasIA />} />
                
                {/* Vendas & Marketing */}
                <Route path="/anuncios-pagos" element={<AnunciosPagos />} />
                <Route path="/campanhas-automaticas" element={<CampanhasAutomaticas />} />
                <Route path="/contas-receber-ia" element={<ContasReceberIA />} />
                <Route path="/conversao-vendas" element={<ConversaoVendas />} />
                <Route path="/email-marketing" element={<EmailMarketing />} />
                <Route path="/gestao-leads" element={<GestaoLeads />} />
                <Route path="/leads-qualificados" element={<LeadsQualificados />} />
                <Route path="/marketing-digital" element={<MarketingDigital />} />
                <Route path="/redes-sociais" element={<RedesSociais />} />
                <Route path="/relacionamento-cliente" element={<RelacionamentoCliente />} />
                <Route path="/seo-otimizado" element={<SEOOtimizado />} />
                
                {/* Produtos & OPME */}
                <Route path="/certificacoes-anvisa" element={<CertificacoesAnvisa />} />
                <Route path="/grupos-produtos-opme" element={<GruposProdutosOPME />} />
                <Route path="/produtos-opme" element={<ProdutosOPME />} />
                <Route path="/qualidade-opme" element={<QualidadeOPME />} />
                <Route path="/tabelas-precos" element={<TabelasPrecos />} />
                
                {/* Financeiro & Relatórios */}
                <Route path="/relatorios-executivos" element={<RelatoriosExecutivos />} />
                <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
                
                {/* Sistemas, Automação & Compliance */}
                <Route path="/automacao-ia" element={<AutomacaoIA />} />
                <Route path="/auditoria-interna" element={<AuditoriaInterna />} />
                <Route path="/compliance" element={<ComplianceRegulatorio />} />
                <Route path="/gestao-riscos" element={<GestaoRiscos />} />
                <Route path="/ia-central" element={<IACentral />} />
                
                {/* Páginas de Erro */}
                <Route path="/403" element={<Unauthorized />} />
                <Route path="/500" element={<ServerError />} />
                
                {/* Catch-all - 404 (deve ser a última rota) */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Chatbot com GPT Researcher - TEMPORARIAMENTE DESABILITADO PARA DEBUG */}
        {/* <ChatbotWithResearch
          position="bottom-right"
          researcherHost="http://localhost:8000"
          onMessageSent={(message) => {
            console.log("User sent:", message);
          }}
        /> */}
      </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
