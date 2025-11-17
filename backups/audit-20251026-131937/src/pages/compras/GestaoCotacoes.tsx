import React, { useState } from "react";
import { ModulePage } from "@/components/templates/ModulePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function GestaoCotacoes(): JSX.Element {
  const [form, setForm] = useState({
    fornecedor: "",
    status: "",
    total: "",
    prazo: "",
  });
  const [internalNotes, setInternalNotes] = useState("");

  const handleChange =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <ModulePage
      title="Gestão de Cotações"
      description="Coordene e acompanhe cotações de materiais OPME"
      iconLabel="📝"
    >
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Cotação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Fornecedor"
                value={form.fornecedor}
                onChange={handleChange("fornecedor")}
              />
              <Input
                placeholder="Status"
                value={form.status}
                onChange={handleChange("status")}
              />
              <Input
                placeholder="Total"
                value={form.total}
                onChange={handleChange("total")}
              />
              <Input
                placeholder="Prazo"
                value={form.prazo}
                onChange={handleChange("prazo")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Observações para a equipe..."
              rows={5}
            />
            <Button className="mt-3" variant="default">
              Salvar
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  );
}
