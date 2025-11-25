/**
 * Dashboard de IA - Página Principal
 * Centraliza todas as funcionalidades de IA do ICARUS v5.0
 */

import { useState } from 'react';
import { Brain, TrendingUp, Activity, Shield, MessageSquare, Sparkles } from 'lucide-react';
import { PrevisaoEstoque } from '@/components/ai/PrevisaoEstoque';
import { AnaliseFinanceira } from '@/components/ai/AnaliseFinanceira';
import { PrevisaoCirurgias } from '@/components/ai/PrevisaoCirurgias';
import { AlertasCompliance } from '@/components/ai/AlertasCompliance';
import { ChatIA } from '@/components/ai/ChatIA';

type TabType = 'estoque' | 'financeiro' | 'cirurgias' | 'compliance' | 'chat';

export default function DashboardIA() {
  const [activeTab, setActiveTab] = useState<TabType>('estoque');

  const tabs = [
    { id: 'estoque' as TabType, label: 'Estoque IA', icon: TrendingUp, color: 'text-blue-600' },
    {
      id: 'financeiro' as TabType,
      label: 'Financeiro IA',
      icon: Activity,
      color: 'text-green-600',
    },
    { id: 'cirurgias' as TabType, label: 'Cirurgias IA', icon: Brain, color: 'text-purple-600' },
    { id: 'compliance' as TabType, label: 'Compliance IA', icon: Shield, color: 'text-orange-600' },
    { id: 'chat' as TabType, label: 'Chat IA', icon: MessageSquare, color: 'text-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="orx-text-3xl orx-orx-font-bold text-slate-900 dark:text-white">
              Dashboard de Inteligência Artificial
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Previsões, análises e insights impulsionados por IA
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-slate-600 dark:text-slate-400">Modelos Ativos</p>
                <p className="orx-text-2xl orx-orx-font-bold text-slate-900 dark:text-white">12</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="orx-text-xs text-green-600 dark:text-green-400 mt-2">
              ✓ Todos operacionais
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-slate-600 dark:text-slate-400">Taxa de Acerto</p>
                <p className="orx-text-2xl orx-orx-font-bold text-slate-900 dark:text-white">
                  94.2%
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="orx-text-xs text-slate-600 dark:text-slate-400 mt-2">Média ponderada</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-slate-600 dark:text-slate-400">Previsões Hoje</p>
                <p className="orx-text-2xl orx-orx-font-bold text-slate-900 dark:text-white">
                  1,247
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="orx-text-xs text-slate-600 dark:text-slate-400 mt-2">+18% vs ontem</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-slate-600 dark:text-slate-400">Economia Mensal</p>
                <p className="orx-text-2xl orx-orx-font-bold text-slate-900 dark:text-white">
                  $402
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="orx-text-xs text-slate-600 dark:text-slate-400 mt-2">80% Ollama grátis</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg orx-orx-font-medium transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {activeTab === 'estoque' && <PrevisaoEstoque />}
          {activeTab === 'financeiro' && <AnaliseFinanceira />}
          {activeTab === 'cirurgias' && <PrevisaoCirurgias />}
          {activeTab === 'compliance' && <AlertasCompliance />}
          {activeTab === 'chat' && <ChatIA />}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <p className="orx-text-sm text-slate-700 dark:text-slate-300">
              <strong>Powered by:</strong> Ollama (Llama 3.1) + GPT-4 Turbo + Claude 3.5 Sonnet
              <span className="ml-2 text-slate-600 dark:text-slate-400">•</span>
              <span className="ml-2">Abbott Score: 98.2%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
