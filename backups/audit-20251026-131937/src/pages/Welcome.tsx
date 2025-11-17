import { Activity, TrendingUp, Users, DollarSign } from "lucide-react";
import { useDocumentTitle } from "@/hooks";

export default function Welcome() {
  useDocumentTitle("Bem-vindo");

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="neumorphic-card text-center py-12">
        <h2 className="text-display font-display mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Bem-vindo ao Icarus Make
        </h2>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
          Design neumórfico moderno importado do Figma. Uma experiência visual
          única e elegante para suas aplicações.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neumorphic-card">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-body-sm  text-muted-foreground"
              style={{ fontWeight: 500 }}
            >
              Total de Usuários
            </h3>
            <Users className="text-primary" size={20} />
          </div>
          <p className="text-heading-lg font-display">2,543</p>
          <p className="text-body-xs text-muted-foreground mt-2">
            +12% em relação ao mês anterior
          </p>
        </div>

        <div className="neumorphic-card">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-body-sm  text-muted-foreground"
              style={{ fontWeight: 500 }}
            >
              Receita
            </h3>
            <DollarSign className="text-success" size={20} />
          </div>
          <p className="text-heading-lg font-display">R$ 45,231</p>
          <p className="text-body-xs text-muted-foreground mt-2">
            +8% em relação ao mês anterior
          </p>
        </div>

        <div className="neumorphic-card">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-body-sm  text-muted-foreground"
              style={{ fontWeight: 500 }}
            >
              Atividade
            </h3>
            <Activity className="text-purple-500" size={20} />
          </div>
          <p className="text-heading-lg font-display">89%</p>
          <p className="text-body-xs text-muted-foreground mt-2">
            Taxa de engajamento
          </p>
        </div>

        <div className="neumorphic-card">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-body-sm  text-muted-foreground"
              style={{ fontWeight: 500 }}
            >
              Crescimento
            </h3>
            <TrendingUp className="text-orange-500" size={20} />
          </div>
          <p className="text-heading-lg font-display">+23%</p>
          <p className="text-body-xs text-muted-foreground mt-2">
            Taxa de crescimento mensal
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neumorphic-card">
          <h3 className="text-heading-sm font-display mb-4">
            🎨 Design Neumórfico
          </h3>
          <p className="text-muted-foreground mb-4">
            Interface moderna com efeitos de sombra suaves que criam uma
            sensação tridimensional única.
          </p>
          <ul className="space-y-2 text-body-sm">
            <li>✓ Sombras suaves e realistas</li>
            <li>✓ Transições fluidas</li>
            <li>✓ Cores harmoniosas</li>
            <li>✓ Responsivo e adaptável</li>
          </ul>
        </div>

        <div className="neumorphic-card">
          <h3 className="text-heading-sm font-display mb-4">🌓 Modo Escuro</h3>
          <p className="text-muted-foreground mb-4">
            Alterne facilmente entre os modos claro e escuro para uma
            experiência personalizada.
          </p>
          <ul className="space-y-2 text-body-sm">
            <li>✓ Tema claro otimizado</li>
            <li>✓ Tema escuro elegante</li>
            <li>✓ Transição suave</li>
            <li>✓ Preferências salvas</li>
          </ul>
        </div>
      </div>

      {/* CTA Section */}
      <div className="neumorphic-card text-center py-8">
        <h3 className="text-heading font-display mb-4">Pronto para começar?</h3>
        <p className="text-muted-foreground mb-6">
          Explore o dashboard e descubra todas as funcionalidades.
        </p>
        <button
          className="neumorphic-button px-8 py-3 text-body-lg"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
          }}
        >
          Explorar Dashboard
        </button>
      </div>
    </div>
  );
}
