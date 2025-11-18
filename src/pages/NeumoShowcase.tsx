/**
 * Showcase - Componentes Neumórficos 3D Premium
 * 
 * Página de demonstração de todos os componentes do design system neumórfico.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Search,
  Mail,
  User,
  Lock,
} from 'lucide-react';
import {
  CardKpi,
  MiniCard,
  NeumoInput,
  NeumoTextarea,
  NeumoButton,
  NeumoSearchBar,
} from '@/components/oraclusx-ds';

export default function NeumoShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="min-h-screen bg-orx-bg-app p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orx-text-primary mb-4">
            Design System Neumórfico 3D Premium
          </h1>
          <p className="text-lg text-orx-text-secondary">
            Componentes de UI com profundidade, elegância e microinterações.
          </p>
        </div>

        {/* CardKpi Section */}
        <section>
          <h2 className="text-2xl font-bold text-orx-text-primary mb-6">
            Cards KPI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardKpi
              label="Receita Total"
              value="R$ 2.8M"
              icon={DollarSign}
              trend={{ direction: 'up', percentage: 12.5 }}
              tone="primary"
            />
            <CardKpi
              label="Novos Usuários"
              value="1.847"
              icon={Users}
              trend={{ direction: 'up', percentage: 8.3 }}
              tone="success"
            />
            <CardKpi
              label="Produtos Vendidos"
              value="12.4K"
              icon={Package}
              trend={{ direction: 'down', percentage: 3.2 }}
              tone="warning"
            />
            <CardKpi
              label="Taxa de Conversão"
              value="3.2%"
              icon={TrendingUp}
              trend={{ direction: 'neutral', percentage: 0 }}
              tone="info"
            />
          </div>
        </section>

        {/* MiniCard Section */}
        <section>
          <h2 className="text-2xl font-bold text-orx-text-primary mb-6">
            Mini Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MiniCard
              title="Pedidos Hoje"
              value="127"
              icon={Package}
              variant="default"
              trend={{ direction: 'up', value: '+12%' }}
            />
            <MiniCard
              title="Usuários Online"
              value="342"
              icon={Users}
              variant="success"
              hint="Máximo: 500"
            />
            <MiniCard
              title="Estoque Baixo"
              value="23"
              icon={Package}
              variant="warning"
              trend={{ direction: 'down', value: '-5%' }}
            />
            <MiniCard
              title="Tickets Abertos"
              value="8"
              icon={Mail}
              variant="danger"
            />
            <MiniCard
              title="Margem Lucro"
              value="18.5%"
              icon={TrendingUp}
              variant="info"
              trend={{ direction: 'up', value: '+2.1%' }}
            />
          </div>
        </section>

        {/* Search Bar Section */}
        <section>
          <h2 className="text-2xl font-bold text-orx-text-primary mb-6">
            Barras de Busca
          </h2>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-orx-text-primary mb-2">
                Busca Padrão
              </label>
              <NeumoSearchBar
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar produtos, clientes..."
                onFiltersClick={() => alert('Filtros')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orx-text-primary mb-2">
                Busca Pequena
              </label>
              <NeumoSearchBar
                size="sm"
                placeholder="Busca rápida..."
                showFilters={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orx-text-primary mb-2">
                Busca Grande
              </label>
              <NeumoSearchBar
                size="lg"
                placeholder="Busca avançada com múltiplos critérios..."
              />
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section>
          <h2 className="text-2xl font-bold text-orx-text-primary mb-6">
            Campos de Entrada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <NeumoInput
              label="Nome Completo"
              placeholder="Digite seu nome"
              leftIcon={User}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="Como você gostaria de ser chamado"
            />

            <NeumoInput
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={Mail}
              required
            />

            <NeumoInput
              label="Senha"
              type="password"
              placeholder="********"
              leftIcon={Lock}
              required
            />

            <NeumoInput
              label="Com Erro"
              placeholder="Campo inválido"
              leftIcon={Mail}
              error="Este campo é obrigatório"
            />

            <NeumoInput
              label="Desabilitado"
              placeholder="Campo desabilitado"
              disabled
              value="Não editável"
            />

            <NeumoInput
              label="Tamanho Pequeno"
              size="sm"
              placeholder="Input menor"
            />
          </div>
        </section>

        {/* Textarea Section */}
        <section>
          <h2 className="text-2xl font-bold text-orx-text-primary mb-6">
            Área de Texto
          </h2>
          <div className="space-y-4 max-w-2xl">
            <NeumoTextarea
              label="Mensagem"
              placeholder="Digite sua mensagem..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              hint="Mínimo de 10 caracteres"
              rows={4}
            />

            <NeumoTextarea
              label="Com Contador"
              placeholder="Digite até 200 caracteres..."
              maxLength={200}
              showCharCount
              rows={3}
            />

            <NeumoTextarea
              label="Com Erro"
              placeholder="Campo obrigatório"
              error="Por favor, preencha este campo"
              rows={3}
            />
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-bold text-orx-text-primary mb-6">
            Botões
          </h2>
          <div className="space-y-6">
            {/* Variantes */}
            <div>
              <h3 className="text-lg font-semibold text-orx-text-primary mb-3">
                Variantes
              </h3>
              <div className="flex flex-wrap gap-3">
                <NeumoButton variant="primary">Primary</NeumoButton>
                <NeumoButton variant="secondary">Secondary</NeumoButton>
                <NeumoButton variant="success">Success</NeumoButton>
                <NeumoButton variant="warning">Warning</NeumoButton>
                <NeumoButton variant="danger">Danger</NeumoButton>
                <NeumoButton variant="ghost">Ghost</NeumoButton>
                <NeumoButton variant="neumo">Neumo</NeumoButton>
              </div>
            </div>

            {/* Tamanhos */}
            <div>
              <h3 className="text-lg font-semibold text-orx-text-primary mb-3">
                Tamanhos
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <NeumoButton size="sm">Pequeno</NeumoButton>
                <NeumoButton size="md">Médio</NeumoButton>
                <NeumoButton size="lg">Grande</NeumoButton>
              </div>
            </div>

            {/* Com Ícones */}
            <div>
              <h3 className="text-lg font-semibold text-orx-text-primary mb-3">
                Com Ícones
              </h3>
              <div className="flex flex-wrap gap-3">
                <NeumoButton leftIcon={Search}>Buscar</NeumoButton>
                <NeumoButton rightIcon={TrendingUp} variant="success">
                  Crescimento
                </NeumoButton>
                <NeumoButton leftIcon={Package} rightIcon={TrendingUp}>
                  Produtos em Alta
                </NeumoButton>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 className="text-lg font-semibold text-orx-text-primary mb-3">
                Estados
              </h3>
              <div className="flex flex-wrap gap-3">
                <NeumoButton loading>Carregando</NeumoButton>
                <NeumoButton disabled>Desabilitado</NeumoButton>
                <NeumoButton fullWidth variant="primary">
                  Largura Total
                </NeumoButton>
              </div>
            </div>
          </div>
        </section>

        {/* Dark Mode Toggle */}
        <section className="text-center pt-8">
          <NeumoButton
            variant="neumo"
            onClick={() => {
              document.documentElement.classList.toggle('dark');
            }}
          >
            Alternar Modo Claro/Escuro
          </NeumoButton>
        </section>
      </div>
    </div>
  );
}

