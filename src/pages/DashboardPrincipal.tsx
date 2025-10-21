/**
 * Dashboard Principal - ICARUS v5.0
 * Design conforme Figma (mini-cards com background colorido)
 */

import {
  Activity,
  Users,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText as FileIcon,
  ShoppingCart,
  UserPlus,
  BarChart3,
  Settings,
} from"lucide-react";
import { NeomorphicIconBox } from"../components/oraclusx-ds/NeomorphicIconBox";

export default function DashboardPrincipal() {
  // KPIs conforme Figma
  const kpis = [
    { 
      title:"Sistema Status", 
      subtitle:"", 
      value:"98%", 
      trend:"+2.3%", 
      trendUp: true,
      icon: Activity, 
      colorVariant:"indigo",
      iconColor:"#ffffff"
    },
    { 
      title:"Médicos", 
      subtitle:"Ativos", 
      value:"1.847", 
      trend:"+12.5%", 
      trendUp: true,
      icon: Users, 
      colorVariant:"purple",
      iconColor:"#ffffff"
    },
    { 
      title:"Produtos", 
      subtitle:"OPME", 
      value:"12.4K", 
      trend:"+5.2%", 
      trendUp: true,
      icon: Package, 
      colorVariant:"orange",
      iconColor:"#ffffff"
    },
    { 
      title:"Pedidos", 
      subtitle:"Urgentes", 
      value:"89", 
      trend:"-8.1%", 
      trendUp: false,
      icon: Calendar, 
      colorVariant:"red",
      iconColor:"#ffffff"
    },
  ];

  const bigKpis = [
    {
      title:"Faturamento Mensal",
      value:"R$ 3.8M",
      subtitle:"R$ 127K",
      subtitleLabel:"média diária",
      trend:"+15.3%",
      trendUp: true,
      icon: DollarSign,
      colorVariant:"green",
      iconColor:"#ffffff"
    },
    {
      title:"Distribuição Geográfica",
      value:"147",
      subtitle:"28",
      subtitleLabel:"cidades",
      trend:"+8.7%",
      trendUp: true,
      icon: MapPin,
      colorVariant:"purple",
      iconColor:"#ffffff"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              style={{
                fontSize: '0.813rem',
                fontFamily:"var(--orx-font-family)",
                fontWeight: 600,
                color:"var(--orx-text-primary)",
                marginBottom:"0.5rem",
              }}
            >
            Dashboard Principal
          </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
            Visão geral do sistema ICARUS v5.0
          </p>
        </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="neumorphic-button colored-button flex items-center gap-2 px-6 py-3"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(16, 185, 129, 0.85)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.813rem',
                boxShadow: `
                  10px 10px 20px rgba(16, 185, 129, 0.3),
                  -5px -5px 14px rgba(255, 255, 255, 0.05),
                  inset 2px 2px 8px rgba(0, 0, 0, 0.15),
                  inset -2px -2px 8px rgba(255, 255, 255, 0.1)
                `,
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform ="scale(1.03) translateY(-2px)";
                e.currentTarget.style.background ="rgba(16, 185, 129, 0.95)";
                e.currentTarget.style.backdropFilter ="blur(16px) saturate(200%)";
                e.currentTarget.style.WebkitBackdropFilter ="blur(16px) saturate(200%)";
                e.currentTarget.style.boxShadow = `
                  14px 14px 28px rgba(16, 185, 129, 0.35),
                  -7px -7px 18px rgba(255, 255, 255, 0.08),
                  inset 2px 2px 10px rgba(0, 0, 0, 0.18),
                  inset -2px -2px 10px rgba(255, 255, 255, 0.12)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform ="scale(1)";
                e.currentTarget.style.background ="rgba(16, 185, 129, 0.85)";
                e.currentTarget.style.backdropFilter ="blur(12px) saturate(180%)";
                e.currentTarget.style.WebkitBackdropFilter ="blur(12px) saturate(180%)";
                e.currentTarget.style.boxShadow = `
                  10px 10px 20px rgba(16, 185, 129, 0.3),
                  -5px -5px 14px rgba(255, 255, 255, 0.05),
                  inset 2px 2px 8px rgba(0, 0, 0, 0.15),
                  inset -2px -2px 8px rgba(255, 255, 255, 0.1)
                `;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform ="scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform ="scale(1.03) translateY(-2px)";
              }}
            >
              <RefreshCw size={18} style={{ color:"white" }} />
              Atualizar Dados
            </button>
            <button
              className="neumorphic-button colored-button flex items-center gap-2 px-6 py-3"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background:"rgba(139, 92, 246, 0.85)", // Roxo com 85% opacidade (Liquid Glass)
                backdropFilter:"blur(12px) saturate(180%)",
                WebkitBackdropFilter:"blur(12px) saturate(180%)",
                border:"1px solid rgba(255, 255, 255, 0.18)",
                borderRadius:"8px",
                color:"white",
                fontWeight: 600,
                fontSize: '0.813rem',
                boxShadow: `
                  10px 10px 20px rgba(139, 92, 246, 0.3),
                  -5px -5px 14px rgba(255, 255, 255, 0.05),
                  inset 2px 2px 8px rgba(0, 0, 0, 0.15),
                  inset -2px -2px 8px rgba(255, 255, 255, 0.1)
                `,
                transition:"all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                cursor:"pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform ="scale(1.03) translateY(-2px)";
                e.currentTarget.style.background ="rgba(139, 92, 246, 0.95)";
                e.currentTarget.style.backdropFilter ="blur(16px) saturate(200%)";
                e.currentTarget.style.WebkitBackdropFilter ="blur(16px) saturate(200%)";
                e.currentTarget.style.boxShadow = `
                  14px 14px 28px rgba(139, 92, 246, 0.35),
                  -7px -7px 18px rgba(255, 255, 255, 0.08),
                  inset 2px 2px 10px rgba(0, 0, 0, 0.18),
                  inset -2px -2px 10px rgba(255, 255, 255, 0.12)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform ="scale(1)";
                e.currentTarget.style.background ="rgba(139, 92, 246, 0.85)";
                e.currentTarget.style.backdropFilter ="blur(12px) saturate(180%)";
                e.currentTarget.style.WebkitBackdropFilter ="blur(12px) saturate(180%)";
                e.currentTarget.style.boxShadow = `
                  10px 10px 20px rgba(139, 92, 246, 0.3),
                  -5px -5px 14px rgba(255, 255, 255, 0.05),
                  inset 2px 2px 8px rgba(0, 0, 0, 0.15),
                  inset -2px -2px 8px rgba(255, 255, 255, 0.1)
                `;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform ="scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform ="scale(1.03) translateY(-2px)";
              }}
            >
              <FileText size={18} style={{ color:"white" }} />
              Relatório Completo
            </button>
          </div>
        </div>

        {/* KPIs Grid - 4 colunas */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-6"
              style={{
                background:"var(--orx-bg-light)",
                boxShadow:"var(--orx-shadow-light-1), var(--orx-shadow-light-2)",
                borderRadius:"1.25rem",
                transition:"transform 0.2s ease, box-shadow 0.2s ease",
                cursor:"pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform ="translateY(-4px)";
                e.currentTarget.style.boxShadow ="0 12px 24px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform ="translateY(0)";
                e.currentTarget.style.boxShadow ="var(--orx-shadow-light-1), var(--orx-shadow-light-2)";
              }}
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-4">
                <NeomorphicIconBox
                  icon={kpi.icon}
                  colorVariant={kpi.colorVariant}
                  size="md"
                  iconColor={kpi.iconColor}
                />
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                      marginBottom:"0.25rem",
                    }}
                  >
                    {kpi.title}
                  </p>
                  {kpi.subtitle && (
                    <p
                      style={{
                        fontSize: '0.813rem',
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                        opacity: 0.7,
                      }}
                    >
                      {kpi.subtitle}
                    </p>
                  )}
            </div>
              </div>

              {/* Value */}
              <div className="mb-2">
                <p
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    color:"var(--orx-text-primary)",
                    fontFamily:"var(--orx-font-family)",
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </p>
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1">
                {kpi.trendUp ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: kpi.trendUp ?"var(--orx-success)" :"var(--orx-error)",
                    fontFamily:"var(--orx-font-family)",
                  }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Big KPIs - 2 colunas */}
        <div className="grid grid-cols-2 gap-6">
          {bigKpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-8"
              style={{
                background:"var(--orx-bg-light)",
                boxShadow:"var(--orx-shadow-light-1), var(--orx-shadow-light-2)",
                borderRadius:"1.5rem",
                transition:"transform 0.2s ease, box-shadow 0.2s ease",
                cursor:"pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform ="translateY(-4px)";
                e.currentTarget.style.boxShadow ="0 16px 32px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform ="translateY(0)";
                e.currentTarget.style.boxShadow ="var(--orx-shadow-light-1), var(--orx-shadow-light-2)";
              }}
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-6">
                <NeomorphicIconBox
                  icon={kpi.icon}
                  colorVariant={kpi.colorVariant}
                  size="lg"
                  iconColor={kpi.iconColor}
                />
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-primary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    {kpi.title}
                  </p>
              </div>
            </div>

              {/* Value + Subtitle */}
              <div className="flex items-end gap-6 mb-4">
                <div>
                  <p
                    style={{
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      color:"var(--orx-text-primary)",
                      fontFamily:"var(--orx-font-family)",
                      lineHeight: 1,
                    }}
                  >
                    {kpi.value}
                  </p>
                </div>
                <div className="pb-2">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    {kpi.subtitle}
                  </p>
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                      opacity: 0.7,
                    }}
                  >
                    {kpi.subtitleLabel}
                  </p>
              </div>
            </div>

              {/* Trend */}
              <div className="flex items-center gap-1">
                {kpi.trendUp ? (
                  <TrendingUp size={18} className="text-green-500" />
                ) : (
                  <TrendingDown size={18} className="text-red-500" />
                )}
                <span
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: kpi.trendUp ?"var(--orx-success)" :"var(--orx-error)",
                    fontFamily:"var(--orx-font-family)",
                  }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div 
          className="neumorphic-card p-6"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"var(--orx-shadow-light-1), var(--orx-shadow-light-2)",
            borderRadius:"1.25rem",
          }}
        >
          <div className="mb-4">
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: 600,
              color:"var(--orx-text-primary)",
              fontFamily:"var(--orx-font-family)",
              marginBottom:"0.25rem"
            }}>
              Ações Rápidas
            </h3>
            <p style={{
              fontSize: '0.813rem',
              color:"var(--orx-text-secondary)",
              fontFamily:"var(--orx-font-family)",
            }}>
              Acesso rápido às operações mais utilizadas
            </p>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {[
              { icon: Plus, label:"Novo Pedido", color:"var(--orx-primary)" },
              { icon: FileIcon, label:"Nova NF", color:"var(--orx-primary)" },
              { icon: ShoppingCart, label:"Orçamento", color:"var(--orx-primary)" },
              { icon: UserPlus, label:"Cadastro", color:"var(--orx-primary)" },
              { icon: BarChart3, label:"Relatórios", color:"var(--orx-primary)" },
              { icon: Settings, label:"Configurar", color:"var(--orx-primary)" },
            ].map((action, index) => (
              <button
                key={index}
                className="neumorphic-button colored-button flex  items-center justify-center gap-2 p-4"
                style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                  background: action.color,
                  color:"white",
                  borderRadius:"1rem",
                  border:"none",
                  boxShadow:"0 4px 12px rgba(99, 102, 241, 0.3)",
                  transition:"all 0.2s ease",
                  minHeight:"80px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform ="translateY(-2px)";
                  e.currentTarget.style.boxShadow ="0 6px 16px rgba(99, 102, 241, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform ="translateY(0)";
                  e.currentTarget.style.boxShadow ="0 4px 12px rgba(99, 102, 241, 0.3)";
                }}
              >
                <action.icon size={24} strokeWidth={2} style={{ color:"white" }} />
                <span style={{
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  fontFamily:"var(--orx-font-family)",
                  textAlign:"center"
                }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
            </div>
      </div>
    </div>
  );
}
