/**
 * APP STEP 1: Testando apenas o Dashboard Principal
 */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/DashboardPrincipal";

function App() {
  console.log("✅ App Step 1 - Apenas Dashboard");

  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--orx-bg-light, var(--orx-bg-light))",
          padding: "2rem",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
