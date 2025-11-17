/**
 * APP STEP 2: Dashboard + Topbar + Sidebar (SEM rotas extras)
 */
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import Dashboard from "./pages/DashboardPrincipal";
import { IcarusTopbar } from "./components/layout/IcarusTopbar";
import { IcarusSidebar } from "./components/layout/IcarusSidebar";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  console.log("✅ App Step 2 - Dashboard + Topbar + Sidebar");

  return (
    <Router>
      <div
        className={darkMode ? "dark" : ""}
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
        }}
      >
        {/* Brand Container - Icarus (z-index maior que sidebar) */}
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            width: "255px",
            zIndex: 100, // Maior que sidebar
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: sidebarCollapsed ? "64px" : "144px",
              padding: sidebarCollapsed ? "0.8rem" : "1.2rem 0.8rem",
              borderRadius: "1rem",
              background:
                "linear-gradient(135deg, var(--orx-primary), #a855f7, var(--orx-pink-500))",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
            }}
          >
            <BrainCircuit
              size={sidebarCollapsed ? 32 : 45}
              color="#ffffff"
              strokeWidth={2}
              style={{ transition: "all 0.3s ease" }}
            />
            {!sidebarCollapsed && (
              <>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontFamily: "var(--orx-font-family)",
                    fontWeight: 700,
                    color: "#ffffff",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Icarus v5.0
                </h2>
                <p
                  style={{
                    fontSize: "0.6rem",
                    fontFamily: "var(--orx-font-family)",
                    fontWeight: 700,
                    color: "#ffffff",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Gestão elevada pela IA
                </p>
              </>
            )}
          </div>
        </div>

        {/* Sidebar com wrapper nav */}
        <nav
          className="neumorphic-container fixed left-4"
          style={{
            top: "172px",
            width: sidebarCollapsed ? "64px" : "255px",
            padding: sidebarCollapsed ? "16px 8px" : "16px",
            transition: "width 0.3s ease, padding 0.3s ease",
            overflow: "hidden",
            maxHeight: "calc(100vh - 188px)",
            overflowY: "auto",
            zIndex: 40, // Menor que Brand Container (z-index: 100)
            borderRadius: "1.25rem", // ADICIONADO: bordas arredondadas
            boxShadow: "var(--orx-shadow-light-1), var(--orx-shadow-light-2)", // ADICIONADO: sombras neumórficas
          }}
        >
          <IcarusSidebar
            collapsed={sidebarCollapsed}
            onNavigate={(path) => console.log("Navigate to:", path)}
          />

          {!sidebarCollapsed && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center gap-2 opacity-60">
                <BrainCircuit
                  size={20}
                  style={{ color: "var(--orx-primary)" }}
                />
                <span
                  style={{
                    fontSize: "var(--orx-font-size-xs)",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  Powered by
                  <br />
                  <strong>Icarus AI Technology</strong>
                </span>
              </div>
            </div>
          )}
        </nav>

        {/* Topbar */}
        <IcarusTopbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Main Content */}
        <main
          style={{
            marginLeft: "279px",
            marginRight: "16px",
            marginTop: "96px",
          }}
        >
          <div
            className="neumorphic-card p-6"
            style={{
              minHeight: "calc(100vh - 112px)",
              borderRadius: "1.25rem",
              boxShadow: "var(--orx-shadow-light-1), var(--orx-shadow-light-2)",
              background: "var(--orx-bg-light)",
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
