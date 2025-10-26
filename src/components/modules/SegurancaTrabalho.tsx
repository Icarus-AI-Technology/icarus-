import React, { useState } from"react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from"@/components/oraclusx-ds";
import { Shield, HardHat, Users, CheckCircle, Settings, TrendingUp } from"lucide-react";
export const SegurancaTrabalho: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("geral");
  const categories = [
    { id:"geral", label:"Geral", icon: Shield, count: 124, trend:"+15" },
    { id:"detalhes", label:"Detalhes", icon: HardHat, count: 89, trend:"+8" },
    { id:"analytics", label:"Analytics", icon: Users, count: 56, trend:"+12" },
    { id:"config", label:"Config", icon: CheckCircle, count: 34, trend:"+5" }
  ];
  const kpis = [
    { title:"Total", value:"303", trend:"+40", icon: Shield, color:"blue" },
    { title:"Taxa", value:"98.4%", trend:"+2%", icon: HardHat, color:"green" },
    { title:"IA", value:"98.4%", trend:"on", icon: Settings, color:"indigo" },
    { title:"Perf", value:"98%", trend:"+1%", icon: TrendingUp, color:"yellow" }
  ];
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div><h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Segurança Trabalho IA</h1><p className="text-[var(--text-secondary)]">Sistema IA</p></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] rounded-full"><Settings className="text-[var(--primary-foreground)] animate-spin-slow" size={20} /><div className="text-left"><p className="text-[var(--primary-foreground)] text-body-sm font-medium">IA</p><p className="text-[var(--primary-foreground)]/70 text-body-xs">98.4%</p></div></div>
        </header>
        <div className="mb-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{categories.map((category) => {const Icon = category.icon; const isActive = activeCategory === category.id; return (<button key={category.id} onClick={() => setActiveCategory(category.id)} className={`relative p-4 rounded-xl transition-all duration-200 ${isActive ?"neuro-raised text-[var(--primary)] scale-105" :"bg-surface dark:bg-card"}`}><div className="flex flex-col items-center gap-2"><div className={`p-2 rounded-lg ${isActive ?"bg-surface/20" :"bg-surface dark:bg-muted"}`}><Icon size={24} /></div><div className="text-center"><p className="text-body-xs mb-1 font-medium">{category.label}</p><span className="text-heading font-display text-[0.813rem]">{category.count}</span></div></div></button>);})}</div></div>
        <div className="grid gap-4 md:grid-cols-4 mb-6">{kpis.map((kpi, i) => {const Icon = kpi.icon; const colors = {blue:"bg-[var(--accent)]/10 text-[var(--accent-foreground)]",green:"bg-success/10 text-success",indigo:"bg-[var(--primary)]/10 text-[var(--primary)]",yellow:"bg-warning/10 text-warning"}; return (<Card key={i} padding="md"><div className="flex items-start justify-between"><div><p className="text-body-sm text-[var(--text-secondary)]">{kpi.title}</p><p className="text-heading font-display text-[var(--text-primary)] mt-1">{kpi.value}</p><Badge variant="default" size="sm" className="mt-2">{kpi.trend}</Badge></div><div className={`p-3 rounded-lg ${colors[kpi.color as keyof typeof colors]}`}><Icon size={24} /></div></div></Card>);})}</div>
        <Card><CardHeader><CardTitle>Segurança Trabalho IA</CardTitle></CardHeader><CardContent><div className="text-center py-12"><Shield size={64} className="mx-auto text-muted mb-4" /><p className="text-secondary dark:text-muted">Módulo IA</p></div></CardContent></Card>
      </div>
    </div>
  );
};
export default SegurancaTrabalho;
