export default function Welcome() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '0.813rem', marginBottom: '1rem' }}>🎉 Bem-vindo ao ICARUS v5.0</h1>
      <p style={{ fontSize: '0.813rem', marginBottom: '2rem' }}>Gestão elevada pela IA</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--orx-bg-light)', borderRadius: '1rem' }}>
          <h3>Sistema Operacional</h3>
          <p style={{ fontSize: '0.813rem', fontWeight: 'bold' }}>100%</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--orx-bg-light)', borderRadius: '1rem' }}>
          <h3>Módulos Ativos</h3>
          <p style={{ fontSize: '0.813rem', fontWeight: 'bold' }}>10</p>
        </div>
      </div>
    </div>
  );
}
