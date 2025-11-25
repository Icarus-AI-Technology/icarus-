/**
 * Showcase - Componentes Neumórficos 3D Premium
 *
 * Página de demonstração de todos os componentes do design system neumórfico.
 */

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Package, Search, Mail, User, Lock } from 'lucide-react';
import { CardKpi, MiniCard, NeumoTextarea, NeumoSearchBar, Input } from '@/components/oraclusx-ds';
import { Button } from '@/components/oraclusx-ds/Button';

export default function NeumoShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="min-h-screen bg-orx-bg-app p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="orx-text-4xl orx-orx-font-bold text-orx-text-primary mb-4">
            Design System Neumórfico 3D Premium
          </h1>
          <p className="orx-text-lg text-orx-text-secondary">
            Componentes de UI com profundidade, elegância e microinterações.
          </p>
        </div>

        {/* CardKpi Section */}
        <section>
          <h2 className="orx-text-2xl orx-orx-font-bold text-orx-text-primary mb-6">Cards KPI</h2>
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
          <h2 className="orx-text-2xl orx-orx-font-bold text-orx-text-primary mb-6">Mini Cards</h2>
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
            <MiniCard title="Tickets Abertos" value="8" icon={Mail} variant="danger" />
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
          <h2 className="orx-text-2xl orx-orx-font-bold text-orx-text-primary mb-6">
            Barras de Busca
          </h2>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
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
              <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                Busca Pequena
              </label>
              <NeumoSearchBar size="sm" placeholder="Busca rápida..." showFilters={false} />
            </div>

            <div>
              <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                Busca Grande
              </label>
              <NeumoSearchBar size="lg" placeholder="Busca avançada com múltiplos critérios..." />
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section>
          <h2 className="orx-text-2xl orx-orx-font-bold text-orx-text-primary mb-6">
            Campos de Entrada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <Input
              variant="neumo"
              label="Nome Completo"
              placeholder="Digite seu nome"
              leftIcon={User}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="Como você gostaria de ser chamado"
            />

            <Input
              variant="neumo"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={Mail}
              required
            />

            <Input
              variant="neumo"
              label="Senha"
              type="password"
              placeholder="********"
              leftIcon={Lock}
              required
            />

            <Input
              variant="neumo"
              label="Com Erro"
              placeholder="Campo inválido"
              leftIcon={Mail}
              error="Este campo é obrigatório"
            />

            <Input
              variant="neumo"
              label="Desabilitado"
              placeholder="Campo desabilitado"
              disabled
              value="Não editável"
            />

            <Input
              variant="neumo"
              label="Tamanho Pequeno"
              inputSize="sm"
              placeholder="Input menor"
            />
          </div>
        </section>

        {/* Textarea Section */}
        <section>
          <h2 className="orx-text-2xl orx-orx-font-bold text-orx-text-primary mb-6">
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
          <h2 className="orx-text-2xl orx-orx-font-bold text-orx-text-primary mb-6">Botões</h2>
          <div className="space-y-6">
            {/* Variantes */}
            <div>
              <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-3">
                Variantes
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="neumo" color="primary">
                  Primary
                </Button>
                <Button variant="neumo" color="secondary">
                  Secondary
                </Button>
                <Button variant="neumo" color="success">
                  Success
                </Button>
                <Button variant="neumo" color="warning">
                  Warning
                </Button>
                <Button variant="neumo" color="danger">
                  Danger
                </Button>
                <Button variant="neumo" color="ghost">
                  Ghost
                </Button>
                <Button variant="neumo">
                  Neumo
                </Button>
              </div>
            </div>

            {/* Tamanhos */}
            <div>
              <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-3">
                Tamanhos
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="neumo" size="sm">
                  Pequeno
                </Button>
                <Button variant="neumo" size="md">
                  Médio
                </Button>
                <Button variant="neumo" size="lg">
                  Grande
                </Button>
              </div>
            </div>

            {/* Com Ícones */}
            <div>
              <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-3">
                Com Ícones
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="neumo" leftIcon={Search}>
                  Buscar
                </Button>
                <Button variant="neumo" rightIcon={TrendingUp} color="success">
                  Crescimento
                </Button>
                <Button variant="neumo" leftIcon={Package} rightIcon={TrendingUp}>
                  Produtos em Alta
                </Button>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-3">
                Estados
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="neumo" isLoading>
                  Carregando
                </Button>
                <Button variant="neumo" disabled>
                  Desabilitado
                </Button>
                <Button variant="neumo" fullWidth color="primary">
                  Largura Total
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dark Mode Toggle */}
        <section className="text-center pt-8">
          <Button
            variant="neumo"
            onClick={() => {
              document.documentElement.classList.toggle('dark');
            }}
          >
            Alternar Modo Claro/Escuro
          </Button>
        </section>
      </div>
    </div>
  );
}
