import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/contexts";

// Componente de teste simples
function Welcome() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>✅ Welcome - ICARUS v5.0</h1>
      <p>Se você está vendo esta mensagem, o roteamento funciona!</p>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <Router>
      <ToastProvider>
        <div className={`neumorphic-container ${darkMode ? "dark" : ""}`}>
          {/* Header Simplificado */}
          <header className="neumorphic-card fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 m-4 h-16">
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--orx-primary)",
              }}
            >
              Icarus Make
            </h1>

            <button
              onClick={toggleDarkMode}
              className="neumorphic-button p-2"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </header>

          {/* Main Content */}
          <main className="pt-24 p-6">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route
                path="*"
                element={
                  <div>
                    <h1>404 - Não Encontrado</h1>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
