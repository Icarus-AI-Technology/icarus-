import { StrictMode } from"react";
import { createRoot } from"react-dom/client";
import"./styles/globals.css";

// Componente de teste simples
function TestApp() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'var(--orx-primary)' }}>✅ ICARUS Frontend Test</h1>
      <p>Se você está vendo esta mensagem, o React está funcionando!</p>
      <p>Servidor: Vite Dev Server</p>
      <p>Status: ✅ OK</p>
    </div>
  );
}

const root = document.getElementById("root");

if (root) {
  console.log("✅ Root element found");
  try {
    createRoot(root).render(
      <StrictMode>
        <TestApp />
      </StrictMode>
    );
    console.log("✅ App rendered successfully");
  } catch (_error) {
    console.error("❌ Render error:", error);
    root.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; color: var(--orx-error);">
        <h1>❌ Erro no Render</h1>
        <pre>${error}</pre>
      </div>
    `;
  }
} else {
  console.error("❌ Root element not found!");
}

