// React is automatically imported in JSX transform
import { isFeatureEnabled } from '@/lib/flags';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SystemHealthDashboard(): JSX.Element {
  const ffOn = isFeatureEnabled('FF_SYSTEM_HEALTH');
  return (
    <div className="p-6">
      {!ffOn && (
        <div className="p-3 mb-4 rounded bg-yellow-100 text-yellow-900 orx-text-sm">
          Recurso em rollout: FF_SYSTEM_HEALTH desabilitado
        </div>
      )}
      <h1 className="orx-text-xl orx-orx-font-semibold mb-2">System Health Dashboard</h1>
      <p className="orx-text-sm text-muted-foreground mb-4">
        Saúde do sistema, uptime e métricas de latência.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="orx-text-base">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">99.93%</Badge>
              <span className="orx-text-xs text-muted-foreground">Últimos 30 dias</span>
            </div>
            <Progress value={99.93} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="orx-text-base">Erro (5xx)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="orx-text-2xl orx-orx-font-semibold">0.42%</div>
            <div className="orx-text-xs text-muted-foreground">p95 últimas 24h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="orx-text-base">Latência p95</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="orx-text-2xl orx-orx-font-semibold">312 ms</div>
            <div className="orx-text-xs text-muted-foreground">/api/ml/vector-search</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 mt-6">
        <section>
          <h2 className="orx-orx-font-medium">Objetivo</h2>
          <p className="orx-text-sm">Descrição breve do objetivo do módulo.</p>
        </section>
        <section>
          <h2 className="orx-orx-font-medium">Funcionalidades</h2>
          <ul className="list-disc ml-6 orx-text-sm">
            <li>Placeholder 1</li>
            <li>Placeholder 2</li>
          </ul>
        </section>
        <section>
          <h2 className="orx-orx-font-medium">Passo a passo</h2>
          <ol className="list-decimal ml-6 orx-text-sm">
            <li>Passo 1</li>
            <li>Passo 2</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
