import React from "react";
import { isFeatureEnabled } from "@/lib/flags";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/contexts/ToastContext";

export default function VoiceAnalyticsDashboard(): JSX.Element {
  const ffOn = isFeatureEnabled("FF_VOICE_ANALYTICS");
  const { addToast } = useToast();
  return (
    <div className="p-6">
      {!ffOn && (
        <div className="p-3 mb-4 rounded bg-yellow-100 text-yellow-900 text-sm">
          Recurso em rollout: FF_VOICE_ANALYTICS desabilitado
        </div>
      )}
      <h1 className="text-xl font-semibold mb-2">Voice Analytics</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Métricas de chamadas e reconhecimento de voz.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chamadas/dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">128</div>
            <div className="text-xs text-muted-foreground">Média móvel</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Acurácia ASR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">94.2%</Badge>
            </div>
            <Progress value={94.2} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sentimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Positivo</div>
            <div className="text-xs text-muted-foreground">Últimas 24h</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className="px-3 py-2 rounded bg-indigo-600 text-white"
          onClick={() => addToast("Métricas atualizadas!", "success")}
        >
          Mostrar Toast (sucesso)
        </button>
        <button
          className="px-3 py-2 rounded bg-stone-200 text-stone-900"
          onClick={() => addToast("Falha ao sincronizar ASR", "error")}
        >
          Mostrar Toast (erro)
        </button>
      </div>

      <div className="grid gap-3 mt-6">
        <section>
          <h2 className="font-medium">Objetivo</h2>
          <p className="text-sm">Descrição breve do objetivo do módulo.</p>
        </section>
        <section>
          <h2 className="font-medium">Funcionalidades</h2>
          <ul className="list-disc ml-6 text-sm">
            <li>Placeholder 1</li>
            <li>Placeholder 2</li>
          </ul>
        </section>
        <section>
          <h2 className="font-medium">Passo a passo</h2>
          <ol className="list-decimal ml-6 text-sm">
            <li>Passo 1</li>
            <li>Passo 2</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
