import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/oraclusx-ds/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

type EmpresaOption = { id: string; nome: string };

type ReportPayload = {
  report_id: string;
  title: string;
  report_url: string | null;
  summary: string | null;
};

export function AgentTaskRunner() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('full');
  const [empresaId, setEmpresaId] = useState<string>('');
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'creating' | 'waiting' | 'completed' | 'error'>('idle');
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadEmpresas() {
      const { data, error } = await supabase.from('empresas').select('id, nome').order('nome', { ascending: true }).limit(20);
      if (!active) return;
      if (error) {
        console.error('Erro ao carregar empresas', error);
        return;
      }
      setEmpresas(data ?? []);
      if (!empresaId && data && data.length > 0) {
        setEmpresaId(data[0].id);
      }
    }

    loadEmpresas();
    return () => {
      active = false;
    };
  }, [empresaId]);

  useEffect(() => {
    if (!currentTaskId) return;
    const channel = supabase
      .channel(`agent_reports:${currentTaskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_reports',
          filter: `task_id=eq.${currentTaskId}`,
        },
        (payload) => {
          const newReport = payload.new as ReportPayload;
          setReport(newReport);
          setStatus('completed');
          setLogs((prev) => [...prev, `🎯 Relatório publicado: ${newReport.title}`]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTaskId]);

  const canSubmit = useMemo(() => query.trim().length > 10 && !!empresaId, [query, empresaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setStatus('creating');
    setLogs([]);
    setReport(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const insertPayload = {
        query_text: query,
        task_type: 'ai_orchestrator',
        status: 'pending',
        empresa_id: empresaId,
        user_id: user.id,
        metadata: {
          audit_scope: scope,
        },
      };

      const { data: insertData, error: insertError } = await supabase.from('agent_tasks').insert(insertPayload).select('task_id').single();

      if (insertError || !insertData) {
        throw insertError ?? new Error('Não foi possível criar a tarefa.');
      }

      setLogs((prev) => [...prev, '✅ Tarefa criada no Supabase']);
      setCurrentTaskId(insertData.task_id);
      setStatus('waiting');

      const { error: invokeError } = await supabase.functions.invoke('start-agent-task', {
        body: { task_id: insertData.task_id, audit_scope: scope },
      });

      if (invokeError) {
        throw invokeError;
      }

      setLogs((prev) => [...prev, '🚀 Worker iniciado via Edge Function']);
      toast.success('Tarefa enviada para os agentes IA!');
    } catch (error) {
      console.error(error);
      setStatus('error');
      const description = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Não foi possível iniciar a tarefa', { description });
      setLogs((prev) => [...prev, `⚠️ ${description}`]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Agendar análise inteligente</CardTitle>
        <p className="text-sm text-muted-foreground">
          Este exemplo insere um registro em agent_tasks, dispara a Edge Function start-agent-task e acompanha o relatório publicado via Realtime.
        </p>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Consulta / objetivo</Label>
            <Textarea
              placeholder="Ex: Auditar consumo de OPME e validar conformidade ANVISA do hospital X"
              value={query}
              rows={4}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Escopo da auditoria</Label>
              <Select value={scope} onValueChange={(value) => setScope(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o escopo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Completa (schema + dados + storage + performance)</SelectItem>
                  <SelectItem value="schema">Apenas Schema</SelectItem>
                  <SelectItem value="dados">Somente Dados</SelectItem>
                  <SelectItem value="storage">Buckets / Storage</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={empresaId} onValueChange={(value) => setEmpresaId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={!canSubmit || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Criar tarefa e chamar agentes
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold">Status atual: {status}</p>
          <div className="rounded-md bg-muted p-3 text-sm space-y-1">
            {logs.length === 0 ? <p className="text-muted-foreground">Nenhum evento ainda.</p> : logs.map((line, idx) => <p key={idx}>{line}</p>)}
          </div>

          {report && (
            <div className="rounded-md border p-3 space-y-1">
              <p className="text-sm font-semibold">{report.title}</p>
              <p className="text-sm text-muted-foreground">{report.summary ?? 'Sem resumo'}</p>
              {report.report_url && (
                <a
                  href={report.report_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  Abrir PDF publicado
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        Realtime habilitado via supabase.channel('agent_reports'). Atualize as policies para restringir acesso por empresa.
      </CardFooter>
    </Card>
  );
}

