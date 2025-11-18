import React from 'react';
import { isFeatureEnabled } from '@/lib/flags';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VoiceBiometricsManager(): JSX.Element {
  const ffOn = isFeatureEnabled('FF_VOICE_BIOMETRICS');
  return (
    <div className="p-6">
      {!ffOn && (
        <div className="p-3 mb-4 rounded bg-yellow-100 text-yellow-900 orx-text-sm">
          Recurso em rollout: FF_VOICE_BIOMETRICS desabilitado
        </div>
      )}
      <h1 className="orx-text-xl orx-font-semibold mb-2">Voice Biometrics</h1>
      <p className="orx-text-sm text-muted-foreground mb-4">Gestão de amostras de voz e verificação biométrica.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="orx-text-base">Perfis cadastrados</CardTitle></CardHeader>
          <CardContent>
            <div className="orx-text-2xl orx-font-semibold">324</div>
            <div className="orx-text-xs text-muted-foreground">Total global</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="orx-text-base">Taxa de match</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="default">98.1%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="orx-text-base">Tentativas falhas</CardTitle></CardHeader>
          <CardContent>
            <div className="orx-text-2xl orx-font-semibold">3</div>
            <div className="orx-text-xs text-muted-foreground">Últimas 24h</div>
          </CardContent>
        </Card>
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
