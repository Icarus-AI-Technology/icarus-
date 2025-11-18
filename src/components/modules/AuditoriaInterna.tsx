import React, { useState } from"react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from"@/components/oraclusx-ds";
import { Search, FileText, Shield, CheckCircle, Settings, TrendingUp } from"lucide-react";
export const AuditoriaInterna: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("geral");
  const categories = [
    { id:"geral", label:"Geral", icon: Search, count: 124, trend:"+15" },
    { id:"detalhes", label:"Detalhes", icon: FileText, count: 89, trend:"+8" },
    { id:"analytics", label:"Analytics", icon: Shield, count: 56, trend:"+12" },
    { id:"config", label:"Config", icon: CheckCircle, count: 34, trend:"+5" }
  ];
  const kpis = [
    { title:"Total", value:"303", trend:"+40", icon: Search, color:"blue" },
    { title:"Taxa", value:"97.7%", trend:"+2%", icon: FileText, color:"green" },
    { title:"IA", value:"97.7%", trend:"on", icon: Settings, color:"indigo" },
    { title:"Perf", value:"98%", trend:"+1%", icon: TrendingUp, color:"yellow" }
  ];
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div><h1 className="text-heading-lg font-display text-primary dark:text-gray-100 mb-2">Auditoria Interna IA</h1><p className="text-secondary dark:text-muted">Sistema IA</p></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full"><Settings className="text-inverse animate-spin-slow" size={20} /><div className="text-left"><p className="text-inverse text-body-sm orx-font-medium">IA</p><p className="text-indigo-100 text-body-xs">97.7%</p></div></div>
        </header>
        <div className="mb-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{categories.map((category) => {const Icon = category.icon; const isActive = activeCategory === category.id; return (<button key={category.id} onClick={() => setActiveCategory(category.id)} className={`relative p-4 rounded-xl transition-all duration-200 ${isActive ?"bg-primary text-inverse shadow-lg scale-105" :"bg-surface dark:bg-card hover:shadow-md"}`}><div className="flex flex-col items-center gap-2"><div className={`p-2 rounded-lg ${isActive ?"bg-surface/20" :"bg-surface dark:bg-muted"}`}><Icon size={24} /></div><div className="text-center"><p className="text-body-xs mb-1 orx-font-medium">{category.label}</p><span className="text-heading font-display text-[0.813rem]">{category.count}</span></div></div></button>);})}</div></div>
        <div className="grid gap-4 md:grid-cols-4 mb-6">{kpis.map((kpi, i) => {const Icon = kpi.icon; const colors = {blue:"bg-blue-100 dark:bg-blue-900/30 text-accent",green:"bg-success/10 dark:bg-green-900/30 text-success",indigo:"bg-indigo-100 dark:bg-indigo-900/30 text-primary",yellow:"bg-warning/10 dark:bg-yellow-900/30 text-warning"}; return (<Card key={i} padding="md"><div className="flex items-start justify-between"><div><p className="text-body-sm text-secondary dark:text-muted">{kpi.title}</p><p className="text-heading font-display text-primary dark:text-gray-100 mt-1">{kpi.value}</p><Badge variant="default" size="sm" className="mt-2">{kpi.trend}</Badge></div><div className={`p-3 rounded-lg ${colors[kpi.color as keyof typeof colors]}`}><Icon size={24} /></div></div></Card>);})}</div>
        <Card><CardHeader><CardTitle>Auditoria Interna IA</CardTitle></CardHeader><CardContent><div className="text-center py-12"><Search size={64} className="mx-auto text-muted mb-4" /><p className="text-secondary dark:text-muted">Módulo IA</p></div></CardContent></Card>
      </div>
    </div>
  );
};
export default AuditoriaInterna;
