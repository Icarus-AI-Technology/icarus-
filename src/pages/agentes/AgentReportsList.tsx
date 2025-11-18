import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Eye, Download, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type ReportStatus =
  | "draft"
  | "pending_review"
  | "reviewed"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

interface StatusConfig {
  variant: BadgeVariant;
  label: string;
}

const STATUS_CONFIG: Record<ReportStatus, StatusConfig> = {
  draft: { variant: "secondary", label: "Rascunho" },
  pending_review: { variant: "default", label: "Aguardando Revisão" },
  reviewed: { variant: "default", label: "Revisado" },
  approved: { variant: "default", label: "Aprovado" },
  published: { variant: "default", label: "Publicado" },
  rejected: { variant: "destructive", label: "Rejeitado" },
  archived: { variant: "secondary", label: "Arquivado" },
};

interface AgentReport {
  report_id: string;
  title: string;
  report_type: string;
  status: string;
  created_at: string;
  published_at?: string;
  reviewer_user_id?: string;
  version: number;
}

export function AgentReportsList() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();

    const subscription = supabase
      .channel("reports-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_reports",
        },
        () => {
          loadReports();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadReports() {
    try {
      const { data, error } = await supabase
        .from("agent_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }

  function isReportStatus(value: string): value is ReportStatus {
    return value in STATUS_CONFIG;
  }

  function getStatusBadge(status: string) {
    const config = isReportStatus(status)
      ? STATUS_CONFIG[status]
      : STATUS_CONFIG.draft;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function getReportTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      consumo_opme: "Consumo OPME",
      compliance_summary: "Compliance",
      previsao_demanda: "Previsão de Demanda",
      analise_custo: "Análise de Custo",
      benchmark_fornecedores: "Benchmark Fornecedores",
      custom: "Personalizado",
    };
    return labels[type] || type;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Gerados</CardTitle>
        <CardDescription>Relatórios criados pelos agentes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum relatório encontrado
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.report_id}>
                  <TableCell className="orx-orx-font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getReportTypeLabel(report.report_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">v{report.version}</Badge>
                  </TableCell>
                  <TableCell className="orx-text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="orx-text-sm text-muted-foreground">
                    {report.published_at
                      ? formatDistanceToNow(new Date(report.published_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status === "published" && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {report.status === "pending_review" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
