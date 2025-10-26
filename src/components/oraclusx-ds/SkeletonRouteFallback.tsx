import React from "react";
import { useLocation } from "react-router-dom";

function Bar({ w = "100%", h = 16, mb = 8, opacity = 0.08 }) {
  const widthClass = typeof w === 'string' && w.endsWith('%') ? `w-[${w}]` : typeof w === 'number' ? `w-[${w}px]` : 'w-full';
  const heightClass = typeof h === 'number' ? `h-[${h}px]` : `h-[${h}]`;
  const mbClass = typeof mb === 'number' ? `mb-[${mb}px]` : `mb-[${mb}]`;
  const bgClass = `bg-[rgba(0,0,0,${opacity})]`;
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`rounded ${widthClass} ${heightClass} ${mbClass} ${bgClass}`}
    />
  );
}

function Card({ children, minHeight = 140 }: { children?: React.ReactNode; minHeight?: number }) {
  const minHClass = `min-h-[${minHeight}px]`;
  return (
    <div className={`neumorphic-card p-6 rounded-2xl animate-pulse bg-[var(--orx-bg-light)] ${minHClass}`}>
      {children}
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="neumorphic-card p-6 rounded-2xl animate-pulse mb-4 bg-[var(--orx-bg-light)]">
      <Bar w="40%" h={24} opacity={0.10} />
      <Bar w="60%" h={14} opacity={0.06} />
    </div>
  );
}

function SkeletonKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <Card><Bar w="50%" /><Bar w="30%" h={12} /></Card>
      <Card><Bar w="40%" /><Bar w="35%" h={12} /></Card>
      <Card><Bar w="45%" /><Bar w="20%" h={12} /></Card>
      <Card><Bar w="30%" /><Bar w="25%" h={12} /></Card>
    </div>
  );
}

function SkeletonFilters({ columns = 4 }: { columns?: number }) {
  const gridClass = columns === 4 ? 'lg:grid-cols-4' : columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
  // Tailwind safelist: lg:grid-cols-4 lg:grid-cols-3 lg:grid-cols-2
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridClass} gap-4`}>
        <div>
          <Bar w="80%" h={12} opacity={0.06} />
          <Bar w="100%" h={34} opacity={0.08} />
        </div>
        <div>
          <Bar w="70%" h={12} opacity={0.06} />
          <Bar w="100%" h={34} opacity={0.08} />
        </div>
        <div className="hidden lg:block">
          <Bar w="60%" h={12} opacity={0.06} />
          <Bar w="100%" h={34} opacity={0.08} />
        </div>
        <div className="hidden lg:block">
          <Bar w="50%" h={12} opacity={0.06} />
          <Bar w="100%" h={34} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="100px" h={36} opacity={0.10} />
        <Bar w="120px" h={36} opacity={0.08} />
        <Bar w="80px" h={36} opacity={0.06} />
      </div>
    </div>
  );
}

function SkeletonFiltersCotacoes() {
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {/* Busca */}
        <div>
          <Bar w="40%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Status */}
        <div>
          <Bar w="35%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Prioridade */}
        <div>
          <Bar w="45%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="120px" h={36} opacity={0.10} />
        <Bar w="100px" h={36} opacity={0.08} />
      </div>
    </div>
  );
}

function SkeletonFiltersPedidos() {
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {/* Busca */}
        <div>
          <Bar w="40%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Status */}
        <div>
          <Bar w="35%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Departamento */}
        <div>
          <Bar w="55%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="140px" h={36} opacity={0.10} />
        <Bar w="110px" h={36} opacity={0.08} />
      </div>
    </div>
  );
}

function SkeletonFiltersNotas() {
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {/* Busca */}
        <div>
          <Bar w="40%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Período (Data Início e Fim) */}
        <div>
          <Bar w="50%" h={12} opacity={0.06} />
          <div className="flex items-center gap-2">
            <Bar w="48%" h={36} opacity={0.08} />
            <Bar w="48%" h={36} opacity={0.08} />
          </div>
        </div>
        {/* Status */}
        <div>
          <Bar w="35%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="120px" h={36} opacity={0.10} />
        <Bar w="100px" h={36} opacity={0.08} />
        <Bar w="100px" h={36} opacity={0.06} />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SkeletonFiltersPeriodo3() {
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {/* Busca */}
        <div>
          <Bar w="45%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Período */}
        <div>
          <Bar w="50%" h={12} opacity={0.06} />
          <div className="flex items-center gap-2">
            <Bar w="48%" h={36} opacity={0.08} />
            <Bar w="48%" h={36} opacity={0.08} />
          </div>
        </div>
        {/* Seleção genérica (ex.: Centro de Custo, Tipo, Categoria) */}
        <div>
          <Bar w="60%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="120px" h={36} opacity={0.10} />
        <Bar w="100px" h={36} opacity={0.08} />
        <Bar w="100px" h={36} opacity={0.06} />
      </div>
    </div>
  );
}

function SkeletonFiltersRelatorios() {
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4`}>
        {/* Busca */}
        <div>
          <Bar w="45%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Período */}
        <div>
          <Bar w="50%" h={12} opacity={0.06} />
          <div className="flex items-center gap-2">
            <Bar w="48%" h={36} opacity={0.08} />
            <Bar w="48%" h={36} opacity={0.08} />
          </div>
        </div>
        {/* Categoria */}
        <div>
          <Bar w="60%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Conta Contábil */}
        <div>
          <Bar w="65%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Agrupar por */}
        <div>
          <Bar w="55%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="120px" h={36} opacity={0.10} />
        <Bar w="100px" h={36} opacity={0.08} />
        <Bar w="100px" h={36} opacity={0.06} />
      </div>
    </div>
  );
}

function SkeletonFiltersFinanceiro() {
  return (
    <div className={`neumorphic-card p-4 rounded-2xl mb-4 animate-pulse bg-[var(--orx-bg-light)]`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4`}>
        {/* Busca */}
        <div>
          <Bar w="45%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Período (Data Início e Fim) */}
        <div>
          <Bar w="50%" h={12} opacity={0.06} />
          <div className="flex items-center gap-2">
            <Bar w="48%" h={36} opacity={0.08} />
            <Bar w="48%" h={36} opacity={0.08} />
          </div>
        </div>
        {/* Centro de Custo */}
        <div>
          <Bar w="70%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Tipo (Receita/Despesa) */}
        <div>
          <Bar w="55%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Categoria */}
        <div>
          <Bar w="60%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Conta Contábil */}
        <div>
          <Bar w="65%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
        {/* Agrupar por */}
        <div>
          <Bar w="55%" h={12} opacity={0.06} />
          <Bar w="100%" h={36} opacity={0.08} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Bar w="120px" h={36} opacity={0.10} />
        <Bar w="100px" h={36} opacity={0.08} />
        <Bar w="100px" h={36} opacity={0.06} />
      </div>
    </div>
  );
}

function SkeletonCompras() {
  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFilters columns={4} />
      <Card minHeight={320}>
        {/* Cabeçalho da tabela */}
        <div className="flex items-center gap-4 mb-3">
          <Bar w="18%" h={12} opacity={0.08} />
          <Bar w="22%" h={12} opacity={0.08} />
          <Bar w="20%" h={12} opacity={0.08} />
          <Bar w="15%" h={12} opacity={0.08} />
          <Bar w="10%" h={12} opacity={0.08} />
        </div>
        {/* Linhas */}
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 mb-2">
            <Bar w="18%" h={10} opacity={0.06} />
            <Bar w="22%" h={10} opacity={0.06} />
            <Bar w="20%" h={10} opacity={0.06} />
            <Bar w="15%" h={10} opacity={0.06} />
            <Bar w="10%" h={10} opacity={0.06} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function SkeletonCirurgias() {
  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFilters columns={3} />
      {/* Kanban placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0,1,2].map((i) => (
          <Card key={i} minHeight={300}>
            <Bar w="50%" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="neumorphic-card p-3 rounded-xl mb-2 bg-[var(--orx-bg-light)]">
                <Bar w="70%" h={12} opacity={0.08} />
                <Bar w="40%" h={10} opacity={0.06} />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SkeletonFinanceiro() {
  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFiltersFinanceiro />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card minHeight={220}><Bar w="60%" /><Bar w="95%" h={12} /><Bar w="95%" h={12} /><Bar w="80%" h={12} /></Card>
        <Card minHeight={220}><Bar w="55%" /><Bar w="90%" h={12} /><Bar w="85%" h={12} /><Bar w="75%" h={12} /></Card>
      </div>
      <Card minHeight={260}><Bar w="50%" /><Bar w="95%" h={12} /><Bar w="92%" h={12} /><Bar w="88%" h={12} /></Card>
    </div>
  );
}

function SkeletonEstoque() {
  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFilters columns={4} />
      {/* Tabela placeholder */}
      <Card minHeight={300}>
        <Bar w="30%" />
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 mb-2">
            <Bar w="30%" h={12} opacity={0.06} />
            <Bar w="15%" h={12} opacity={0.06} />
            <Bar w="20%" h={12} opacity={0.06} />
            <Bar w="25%" h={12} opacity={0.06} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function SkeletonCadastros() {
  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <SkeletonHeader />
      <SkeletonFilters columns={4} />
      {/* Cards de KPIs específicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card><Bar w="60%" /><Bar w="40%" h={12} /></Card>
        <Card><Bar w="55%" /><Bar w="30%" h={12} /></Card>
        <Card><Bar w="50%" /><Bar w="35%" h={12} /></Card>
        <Card><Bar w="45%" /><Bar w="25%" h={12} /></Card>
      </div>

      {/* Tabela de cadastros */}
      <Card minHeight={360}>
        {/* Cabeçalho da tabela */}
        <div className="flex items-center gap-4 mb-3">
          <Bar w="20%" h={12} opacity={0.08} />
          <Bar w="25%" h={12} opacity={0.08} />
          <Bar w="20%" h={12} opacity={0.08} />
          <Bar w="15%" h={12} opacity={0.08} />
          <Bar w="10%" h={12} opacity={0.08} />
        </div>
        {/* Linhas */}
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 mb-2">
            <Bar w="20%" h={10} opacity={0.06} />
            <Bar w="25%" h={10} opacity={0.06} />
            <Bar w="20%" h={10} opacity={0.06} />
            <Bar w="15%" h={10} opacity={0.06} />
            <Bar w="10%" h={10} opacity={0.06} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function SkeletonDefault() {
  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFilters columns={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card minHeight={220}><Bar w="70%" /><Bar w="90%" h={12} /><Bar w="80%" h={12} /></Card>
        <Card minHeight={220}><Bar w="55%" /><Bar w="88%" h={12} /><Bar w="82%" h={12} /></Card>
      </div>
    </div>
  );
}

export default function SkeletonRouteFallback() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/relatorios")) return (
    <div className="p-4">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFiltersRelatorios />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card minHeight={220}><Bar w="70%" /><Bar w="90%" h={12} /><Bar w="80%" h={12} /></Card>
        <Card minHeight={220}><Bar w="55%" /><Bar w="88%" h={12} /><Bar w="82%" h={12} /></Card>
      </div>
    </div>
  );
  if (pathname.startsWith("/compras/notas-v2") || pathname.startsWith("/compras/notas")) return (
    <div className="p-4">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFiltersNotas />
      <SkeletonCompras />
    </div>
  );
  if (pathname.startsWith("/compras/cotacoes")) return (
    <div className="p-4">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFiltersCotacoes />
      <SkeletonCompras />
    </div>
  );
  if (pathname.startsWith("/compras/pedidos")) return (
    <div className="p-4">
      <SkeletonHeader />
      <SkeletonKPIs />
      <SkeletonFiltersPedidos />
      <SkeletonCompras />
    </div>
  );
  if (pathname.startsWith("/compras")) return <SkeletonCompras />;
  if (pathname.startsWith("/cirurgias")) return <SkeletonCirurgias />;
  if (pathname.startsWith("/financeiro")) return <SkeletonFinanceiro />;
  if (pathname.startsWith("/estoque")) return <SkeletonEstoque />;
  if (pathname.startsWith("/cadastros")) return <SkeletonCadastros />;
  return <SkeletonDefault />;
}


