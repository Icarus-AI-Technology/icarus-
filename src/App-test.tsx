import { BrowserRouter as Router, Routes, Route } from"react-router-dom";

function TestPage() {
  return (
    <div style={{ padding:"2rem" }}>
      <h1 style={{ fontSize:"2rem", color:"var(--orx-primary)" }}>
        🎉 ICARUS v5.0 FUNCIONANDO!
      </h1>
      <p>Se você vê esta mensagem, o React está rodando corretamente.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight:"100vh", background:"var(--orx-bg-light)" }}>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/dashboard" element={<TestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

