/**
 * APP STEP 2: Dashboard + Topbar + Sidebar (SEM rotas extras)
 */
import { useState, useEffect } from"react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from"react-router-dom";
import { BrainCircuit, Home } from"lucide-react";
import Dashboard from"./pages/DashboardPrincipal";
import { IcarusTopbar } from"./components/layout/IcarusTopbar";
import { IcarusSidebar } from"./components/layout/IcarusSidebar";
import { ChatbotWithResearch } from"./components/oraclusx-ds/ChatbotWithResearch";
import { Analytics } from '@vercel/analytics/react';
import { useActivityTracker } from './hooks/useActivityTracker';
import { useErrorHandler } from './hooks/useErrorHandler';

// Módulos de Cadastros
import { DashboardCadastros } from"./pages/cadastros/DashboardCadastros";
import TabelasPrecos from"./pages/cadastros/TabelasPrecos";
import CadastroMedicos from"./pages/cadastros/CadastroMedicos";
import CadastroHospitais from"./pages/cadastros/CadastroHospitais";
import CadastroPacientes from"./pages/cadastros/CadastroPacientes";
import CadastroConvenios from"./pages/cadastros/CadastroConvenios";
import CadastroFornecedores from"./pages/cadastros/CadastroFornecedores";
import CadastroProdutosOPME from"./pages/cadastros/CadastroProdutosOPME";
import CadastroEquipesMedicas from"./pages/cadastros/CadastroEquipesMedicas";
import CadastroTransportadoras from"./pages/cadastros/CadastroTransportadoras";

// Módulos de Compras
import GestaoCotacoes from"./pages/compras/GestaoCotacoes";
import PedidosCompra from"./pages/compras/PedidosCompra";
import NotasCompra from"./pages/compras/NotasCompra";

// Módulos de Integrações
import GerenciadorCredenciais from"./pages/integracoes/GerenciadorCredenciais";

// Componente interno para rastrear navegação
function NavigationTracker() {
  const location = useLocation();
  const { trackPageView } = useActivityTracker();

  useEffect(() => {
    const path = location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    const modulo = pathParts[0] || 'dashboard';
    const subModulo = pathParts[1];

    trackPageView(modulo, subModulo);
  }, [location, trackPageView]);

  return null;
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Aplica a classe"dark" no <html> para funcionar corretamente
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  console.log("✅ App Step 2 - Dashboard + Topbar + Sidebar");

  return (
    <Router>
      {/* Navigation Tracker */}
      <NavigationTracker />
      
      <div 
        style={{
          minHeight:"100vh",
          background:"var(--orx-bg-light)", // Background adaptável
          position:"relative"
        }}
      >
        {/* Brand Container - Icarus - HORIZONTAL, alinhado com topbar */}
        <div 
          style={{
            position:"fixed",
            top:"16px",
            left:"16px",
            width: sidebarCollapsed ?"64px" :"290px",
            height:"64px", // Mesma altura da topbar
            zIndex: 100,
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            transition:"all 0.3s ease"
          }}
        >
          <div
            style={{
              width:"100%",
              height:"100%",
              padding:"0 1rem",
              borderRadius:"8px", // rounded-lg (consistente com NeomorphicIconBox)
              background:"rgba(99, 102, 241, 0.85)", // MESMO INDIGO DO CHATBOT com 85% opacidade (Liquid Glass)
              backdropFilter:"blur(20px) saturate(200%)", // INTENSIFICADO: blur 16px → 20px, saturate 180% → 200%
              WebkitBackdropFilter:"blur(20px) saturate(200%)", // Safari
              border:"1px solid rgba(255, 255, 255, 0.22)", // INTENSIFICADO: 0.18 → 0.22 (borda mais visível)
              boxShadow: `
                14px 14px 28px rgba(99, 102, 241, 0.35),
                -7px -7px 18px rgba(255, 255, 255, 0.08),
                inset 2px 2px 10px rgba(0, 0, 0, 0.18),
                inset -2px -2px 10px rgba(255, 255, 255, 0.12),
                0 10px 40px 0 rgba(31, 38, 135, 0.45)
              `,
              display:"flex",
              flexDirection:"row", // HORIZONTAL
              alignItems:"center",
              justifyContent: sidebarCollapsed ?"center" :"center", // CENTRALIZADO sempre
              gap: sidebarCollapsed ?"0" :"0.875rem",
              transition:"all 300ms cubic-bezier(0.4, 0, 0.2, 1)", // Mesma animação do NeomorphicIconBox
              cursor:"pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform ="scale(1.03) translateY(-2px)"; // INTENSIFICADO: 1.02 → 1.03, -1px → -2px
              e.currentTarget.style.background ="rgba(99, 102, 241, 0.95)"; // Aumenta opacidade no hover
              e.currentTarget.style.backdropFilter ="blur(24px) saturate(220%)"; // INTENSIFICADO: 20px → 24px, 200% → 220%
              e.currentTarget.style.WebkitBackdropFilter ="blur(24px) saturate(220%)";
              e.currentTarget.style.boxShadow = `
                18px 18px 36px rgba(99, 102, 241, 0.4),
                -9px -9px 22px rgba(255, 255, 255, 0.1),
                inset 2px 2px 12px rgba(0, 0, 0, 0.2),
                inset -2px -2px 12px rgba(255, 255, 255, 0.15),
                0 14px 50px 0 rgba(31, 38, 135, 0.55)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform ="scale(1)";
              e.currentTarget.style.background ="rgba(99, 102, 241, 0.85)";
              e.currentTarget.style.backdropFilter ="blur(20px) saturate(200%)";
              e.currentTarget.style.WebkitBackdropFilter ="blur(20px) saturate(200%)";
              e.currentTarget.style.boxShadow = `
                14px 14px 28px rgba(99, 102, 241, 0.35),
                -7px -7px 18px rgba(255, 255, 255, 0.08),
                inset 2px 2px 10px rgba(0, 0, 0, 0.18),
                inset -2px -2px 10px rgba(255, 255, 255, 0.12),
                0 10px 40px 0 rgba(31, 38, 135, 0.45)
              `;
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform ="scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform ="scale(1.03) translateY(-2px)";
            }}
          >
            <BrainCircuit 
              size={sidebarCollapsed ? 24 : 32}
              color="#ffffff" 
              strokeWidth={2} 
              style={{ transition:"all 0.3s ease", flexShrink: 0 }}
            />
            {!sidebarCollapsed && (
              <h2 style={{
                fontSize:"1.5rem", // Aumentado de 1.125rem para 1.5rem
                fontFamily:"var(--orx-font-family)",
                fontWeight: 700,
                color:"#ffffff",
                margin: 0,
                lineHeight: 1,
                whiteSpace:"nowrap"
              }}>
                ICARUS v5.0
              </h2>
            )}
          </div>
          </div>

        {/* Sidebar - Alinhada com Icarus container */}
        <nav
          className="neumorphic-container fixed left-4"
          style={{ 
            top: '96px', // 16px (top) + 64px (altura Icarus) + 16px (gap)
            width: sidebarCollapsed ? '64px' : '290px',
            padding: sidebarCollapsed ? '16px 8px' : '16px',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 112px)', // Ajustado para novo top
            overflowY: 'auto',
            zIndex: 40,
            borderRadius: '1.25rem',
            boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
            background: 'var(--orx-bg-light)' // Background adaptável
          }}
        >
          <IcarusSidebar 
            collapsed={sidebarCollapsed}
            onNavigate={(path) => console.log("Navigate to:", path)}
          />
          
          {!sidebarCollapsed && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center gap-2 opacity-60">
                <BrainCircuit size={20} style={{ color: 'var(--orx-primary)' }} />
                <span style={{ 
                  fontSize: 'var(--orx-font-size-xs)', 
                  textAlign: 'center', 
                  lineHeight: '1.2',
                  color: 'var(--orx-text-primary)'
                }}>
                  Powered by<br />
                  <strong>Icarus AI Technology</strong>
                </span>
              </div>
            </div>
          )}
            </nav>

        {/* Topbar */}
        <IcarusTopbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Main Content - Expande quando sidebar colapsa */}
        <main style={{
          marginLeft: sidebarCollapsed ?"88px" :"314px", // Dinâmico: 64px + 24px = 88px | 290px + 24px = 314px
          marginRight:"16px",
          marginTop:"96px",
          transition:"margin-left 0.3s ease" // Transição suave
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
                      <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Módulo Cadastros Inteligentes */}
                      <Route path="/cadastros" element={<DashboardCadastros />} />
                      <Route path="/cadastros/medicos" element={<CadastroMedicos />} />
                      <Route path="/cadastros/hospitais" element={<CadastroHospitais />} />
                      <Route path="/cadastros/pacientes" element={<CadastroPacientes />} />
                      <Route path="/cadastros/convenios" element={<CadastroConvenios />} />
                      <Route path="/cadastros/fornecedores" element={<CadastroFornecedores />} />
                      <Route path="/cadastros/produtos" element={<CadastroProdutosOPME />} />
                      <Route path="/cadastros/equipes" element={<CadastroEquipesMedicas />} />
                      <Route path="/cadastros/transportadoras" element={<CadastroTransportadoras />} />
                      <Route path="/cadastros/tabelas-precos" element={<TabelasPrecos />} />
                      
                      {/* Módulo Compras e Fornecedores */}
                      <Route path="/compras/cotacoes" element={<GestaoCotacoes />} />
                      <Route path="/compras/pedidos" element={<PedidosCompra />} />
                      <Route path="/compras/notas" element={<NotasCompra />} />
                      
                      {/* Integrações */}
                      <Route path="/integracoes/credenciais" element={<GerenciadorCredenciais />} />
              </Routes>
            </div>
          </main>

          {/* Chatbot Flutuante - Assistente ICARUS AI (consolidado) */}
        <ChatbotWithResearch
          position="bottom-right"
          researcherHost="http://localhost:8000"
        />
      </div>
      
      {/* Vercel Analytics */}
      <Analytics />
    </Router>
  );
}

export default App;

