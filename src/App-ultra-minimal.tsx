function App() {
  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      background: 'var(--orx-bg-light)'
    }}>
      <h1 style={{ color: 'var(--orx-primary)', fontSize: '2rem', marginBottom: '1rem' }}>
        ✅ ICARUS Frontend - Teste Ultra Mínimo
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Se você está vendo esta mensagem, o React está funcionando!
      </p>
      <ul style={{ marginTop: '1rem', fontSize: '1rem' }}>
        <li>✅ React: OK</li>
        <li>✅ Vite: OK</li>
        <li>✅ TypeScript: OK</li>
        <li>✅ Build: OK</li>
      </ul>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#059669', marginBottom: '0.5rem' }}>Próximo Passo:</h2>
        <p>Restaurar componentes gradualmente para identificar qual está quebrando.</p>
      </div>
    </div>
  );
}

export default App;

