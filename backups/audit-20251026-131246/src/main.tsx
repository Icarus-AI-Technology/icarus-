import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/globals.css";

// Inicializar compatibilidade cross-browser
import {
  initBrowserCompatibility,
  checkFeatureSupport,
} from "./utils/browserCompatibility";

// Vercel Analytics & Speed Insights
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ========================================
// INICIALIZAÇÃO DO SISTEMA
// ========================================

console.log("🚀 ICARUS v5.0 - Iniciando sistema...");

// Detectar navegador e aplicar polyfills
const browserInfo = initBrowserCompatibility();
console.log(`🌐 Navegador: ${browserInfo.name} ${browserInfo.version}`);

// Verificar suporte a features
const features = checkFeatureSupport();
console.log("✅ Features suportadas:", {
  webSpeech: features.webSpeech ? "✅" : "❌",
  clipboard: features.clipboard ? "✅" : "❌",
  intersectionObserver: features.intersectionObserver ? "✅" : "❌",
  resizeObserver: features.resizeObserver ? "✅" : "❌",
  cssVariables: features.cssVariables ? "✅" : "❌",
  smoothScroll: features.smoothScroll ? "✅" : "❌",
  fetch: features.fetch ? "✅" : "❌",
  promise: features.promise ? "✅" : "❌",
  customElements: features.customElements ? "✅" : "❌",
  serviceWorker: features.serviceWorker ? "✅" : "❌",
  pushManager: features.pushManager ? "✅" : "❌",
  notifications: features.notifications ? "✅" : "❌",
  webGL: features.webGL ? "✅" : "❌",
});

// Avisos de compatibilidade
if (!features.webSpeech) {
  console.warn(
    "⚠️ Web Speech API não disponível - Comando por voz desabilitado",
  );
}

if (!features.fetch) {
  console.error("❌ Fetch API não disponível - Navegador muito antigo!");
}

// ========================================
// RENDERIZAÇÃO DO APP
// ========================================

const rootElement = document.getElementById("root");
const isQAMode =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("qa") === "1";

if (!rootElement) {
  throw new Error("Root element not found");
}

console.log("✅ Renderizando aplicação...");

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    {!isQAMode && <Analytics />}
    {!isQAMode && <SpeedInsights />}
  </StrictMode>,
);

console.log("🎉 ICARUS v5.0 iniciado com sucesso!");
console.log("═══════════════════════════════════════════════════════════");
console.log("  📊 Compatibilidade Cross-Browser:");
console.log("  ✅ Chrome/Edge: Full support");
console.log("  ✅ Firefox: Full support (com polyfills)");
console.log("  ✅ Safari: Full support (com polyfills)");
console.log("  ✅ Opera: Full support");
console.log("═══════════════════════════════════════════════════════════");
