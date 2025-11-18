/**
 * Módulo: Cirurgias
 * Gerenciamento de cirurgias e procedimentos cirúrgicos
 */

import { useState } from "react";
import { Card } from "@/components/oraclusx-ds";
import { Activity } from 'lucide-react';
import { useDocumentTitle } from "@/hooks";
import { AITutor, AISuggestion } from "@/components/shared/AITutor";

export default function Cirurgias() {
  useDocumentTitle("Cirurgias");
  
  const [suggestions] = useState<AISuggestion[]>([
    {
      id: 'cirurgia-alerta-1',
      type: 'action',
      title: 'Cirurgia pendente de OPME',
      description: 'A cirurgia agendada para amanhã ainda não tem OPME separada. Garanta a disponibilidade imediata.',
      confidence: 95,
      priority: 'high',
      action: {
        label: 'Separar OPME',
        handler: async () => {
          console.log('Separar OPME');
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    }
  ]);

  const kpis = [
    { title: "Cirurgias Hoje", value: "3", icon: Activity, color: "blue" },
    { title: "Agendadas", value: "8", icon: Calendar, color: "green" },
    { title: "Médicos", value: "12", icon: Users, color: "indigo" },
    { title: "Tempo Médio", value: "2.5h", icon: Clock, color: "purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Cirurgias
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gerenciamento completo de cirurgias e procedimentos
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-12 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="col-span-12 sm:col-span-6 lg:col-span-3">
              <Card className="neuro-raised p-6 h-[140px]">
                <div className="flex items-start justify-between h-full">
                  <div>
                    <p className="text-body-sm text-[var(--text-secondary)] mb-1">{kpi.title}</p>
                    <h3 className="text-heading font-display text-[var(--text-primary)]">{kpi.value}</h3>
                  </div>
                  <div className="p-3 rounded-xl neuro-inset">
                    <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <Card className="neuro-raised p-12 text-center">
          <Activity className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2" style={{ fontWeight: 500 }}>
            Módulo de Cirurgias
          </h3>
          <p className="text-[var(--text-secondary)]">Interface de gerenciamento em desenvolvimento</p>
        </Card>
      </div>

      {/* AI Tutor */}
      <AITutor
        module="Cirurgias"
        suggestions={suggestions}
        onFeedback={(id, feedback) => {
          console.log(`Feedback ${feedback} para sugestão ${id}`);
        }}
        onRefresh={async () => {
          console.log('Refresh sugestões de cirurgias');
          await new Promise((resolve) => setTimeout(resolve, 600));
        }}
        minimizable
        compact={true}
      />
    </div>
  );
}

