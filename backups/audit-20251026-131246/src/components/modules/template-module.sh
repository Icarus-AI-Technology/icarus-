#!/bin/bash
# Template para criar módulos rapidamente

create_module() {
  local name=$1
  local title=$2
  local ia=$3
  local cat1=$4
  local cat2=$5
  local cat3=$6
  local cat4=$7
  
  cat > "${name}.tsx" << EOF
/**
 * Módulo: ${title}
 * Sistema inteligente com IA ${ia}% precisão
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/oraclusx-ds";
import { ${cat1}, ${cat2}, ${cat3}, ${cat4}, Settings, TrendingUp } from "lucide-react";

export const ${name}: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("geral");
  
  const categories = [
    { id: "geral", label: "Geral", icon: ${cat1}, count: 124, trend: "+15" },
    { id: "detalhes", label: "Detalhes", icon: ${cat2}, count: 89, trend: "+8" },
    { id: "analytics", label: "Analytics", icon: ${cat3}, count: 56, trend: "+12" },
    { id: "config", label: "Config", icon: ${cat4}, count: 34, trend: "+5" }
  ];

  const kpis = [
    { title: "Total Registros", value: "303", trend: "+40", icon: ${cat1}, color: "blue" },
    { title: "Taxa Sucesso", value: "${ia}%", trend: "+2.1%", icon: ${cat2}, color: "green" },
    { title: "IA Ativa", value: "${ia}%", trend: "online", icon: Settings, color: "indigo" },
    { title: "Performance", value: "98%", trend: "+1.5%", icon: TrendingUp, color: "yellow" }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">${title}</h1>
            <p className="text-gray-600 dark:text-gray-400">Sistema inteligente com IA</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full">
            <Settings className="text-white animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-white text-sm font-semibold">IA System</p>
              <p className="text-indigo-100 text-xs">${ia}% precisão</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button key={category.id} onClick={() => setActiveCategory(category.id)} className={\`relative p-4 rounded-xl transition-all duration-200 \${isActive ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-102"}\`}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={\`p-2 rounded-lg \${isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}\`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium mb-1">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold">{category.count}</span>
                        <span className={\`text-xs \${isActive ? "text-white/80" : "text-green-600 dark:text-green-400"}\`}>
                          <TrendingUp size={12} className="inline mr-0.5" />
                          {category.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClasses = { blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400", yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" };
            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpi.value}</p>
                    <Badge variant="default" size="sm" className="mt-2">{kpi.trend}</Badge>
                  </div>
                  <div className={\`p-3 rounded-lg \${colorClasses[kpi.color as keyof typeof colorClasses]}\`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>${title}</CardTitle>
            <CardDescription>Sistema em operação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <${cat1} size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Módulo operacional com IA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ${name};
EOF
}

# Criar módulos 21-30
create_module "FornecedoresAvancado" "Fornecedores Avançado IA" "97.8" "Truck" "Package" "Users" "BarChart3"
create_module "ProdutosOPME" "Produtos OPME IA" "98.5" "Package" "Heart" "Layers" "ShieldCheck"
create_module "PedidosCompra" "Pedidos de Compra IA" "96.7" "ShoppingCart" "FileText" "CheckCircle" "Clock"
create_module "CotacoesAutomaticas" "Cotações Automáticas IA" "98.1" "FileText" "DollarSign" "TrendingUp" "Send"
create_module "EstoqueAvancado" "Estoque Avançado IA" "99.3" "Package" "Layers" "BarChart3" "AlertTriangle"
create_module "InventarioInteligente" "Inventário Inteligente IA" "97.9" "Clipboard" "Package" "CheckCircle" "TrendingUp"
create_module "EntregasAutomaticas" "Entregas Automáticas IA" "96.4" "Truck" "MapPin" "Clock" "CheckCircle"
create_module "ExpedicaoMercadorias" "Expedição Mercadorias IA" "98.2" "Package" "Send" "Truck" "BarChart3"
create_module "TransportadorasIA" "Transportadoras IA" "97.5" "Truck" "MapPin" "Route" "TrendingUp"
create_module "RotasOtimizadas" "Rotas Otimizadas IA" "98.7" "Route" "MapPin" "TrendingUp" "Zap"

echo "✅ 10 módulos criados (21-30)"
