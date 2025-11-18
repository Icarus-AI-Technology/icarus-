import React from 'react';
import { isFeatureEnabled } from '@/lib/flags';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/contexts/ToastContext';

export default function VideoCallsManager(): JSX.Element {
  const ffOn = isFeatureEnabled('FF_VIDEO_CALLS');
  const { addToast } = useToast();
  return (
    <div className="p-6">
      {!ffOn && (
        <div className="p-3 mb-4 rounded bg-yellow-100 text-yellow-900 orx-text-sm">
          Recurso em rollout: FF_VIDEO_CALLS desabilitado
        </div>
      )}
      <h1 className="orx-text-xl orx-font-semibold mb-2">Video Calls</h1>
      <p className="orx-text-sm text-muted-foreground mb-4">Gerenciamento e métricas de videochamadas.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="orx-text-base">Reuniões hoje</CardTitle></CardHeader>
          <CardContent>
            <div className="orx-text-2xl orx-font-semibold">19</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="orx-text-base">Duração média</CardTitle></CardHeader>
          <CardContent>
            <div className="orx-text-2xl orx-font-semibold">28m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="orx-text-base">Status</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="default">Estável</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => addToast('Chamada iniciada', 'success')}>Mostrar Toast (sucesso)</button>
        <button className="px-3 py-2 rounded bg-stone-200 text-stone-900" onClick={() => addToast('Conexão instável', 'warning')}>Mostrar Toast (aviso)</button>
      </div>

      <div className="grid gap-3 mt-6">
        <section>
          <h2 className="orx-font-medium">Objetivo</h2>
          <p className="orx-text-sm">Descrição breve do objetivo do módulo.</p>
        </section>
        <section>
          <h2 className="orx-font-medium">Funcionalidades</h2>
          <ul className="list-disc ml-6 orx-text-sm">
            <li>Placeholder 1</li>
            <li>Placeholder 2</li>
          </ul>
        </section>
        <section>
          <h2 className="orx-font-medium">Passo a passo</h2>
          <ol className="list-decimal ml-6 orx-text-sm">
            <li>Passo 1</li>
            <li>Passo 2</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
