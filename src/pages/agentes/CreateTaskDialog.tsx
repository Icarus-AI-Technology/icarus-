import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

interface OrchestratorResponse {
  task_id: string;
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    query_text: "",
    task_type: "master_planning",
    priority: "5",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Obter organization_id do usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado");

      const { data: userOrg, error: userOrgError } = await supabase
        .from("user_organizations")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (userOrgError) throw userOrgError;
      if (!userOrg) throw new Error("Organização não encontrada");

      // Chamar orchestrator
      const { data, error } =
        await supabase.functions.invoke<OrchestratorResponse>(
          "orchestrator",
          {
            body: {
              query_text: formData.query_text,
              organization_id: userOrg.organization_id,
              priority: parseInt(formData.priority, 10),
              task_type: formData.task_type,
            },
          },
        );

      if (error) throw error;

      toast.success("Análise iniciada com sucesso!", {
        description: `Task ID: ${data?.task_id ?? "desconhecido"}`,
      });

      // Reset form
      setFormData({
        query_text: "",
        task_type: "master_planning",
        priority: "5",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      const description =
        error instanceof Error ? error.message : "Erro ao criar análise";
      toast.error("Erro ao criar análise", {
        description,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Análise com Agentes IA</DialogTitle>
            <DialogDescription>
              Descreva o que você deseja analisar. O orquestrador irá decompor
              em subtarefas e executar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="query">Consulta / Objetivo</Label>
              <Textarea
                id="query"
                placeholder="Ex: Analisar consumo de materiais OPME do último trimestre"
                value={formData.query_text}
                onChange={(e) =>
                  setFormData({ ...formData, query_text: e.target.value })
                }
                rows={4}
                required
              />
              <p className="orx-text-sm text-muted-foreground">
                Seja específico sobre o que você quer analisar
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Análise</Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, task_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master_planning">
                      Análise Completa (Recomendado)
                    </SelectItem>
                    <SelectItem value="data_internal">
                      Apenas Dados Internos
                    </SelectItem>
                    <SelectItem value="compliance">
                      Apenas Compliance
                    </SelectItem>
                    <SelectItem value="benchmark">Apenas Benchmark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Baixa</SelectItem>
                    <SelectItem value="3">3 - Baixa-Média</SelectItem>
                    <SelectItem value="5">5 - Média</SelectItem>
                    <SelectItem value="7">7 - Alta</SelectItem>
                    <SelectItem value="9">9 - Urgente</SelectItem>
                    <SelectItem value="10">10 - Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.query_text}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Iniciar Análise
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
