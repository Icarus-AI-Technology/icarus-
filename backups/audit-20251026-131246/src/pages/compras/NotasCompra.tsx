import React, { useState } from "react";
import { ModulePage } from "@/components/templates/ModulePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotasCompra(): JSX.Element {
  const [numeroNota, setNumeroNota] = useState("");
  const [tipoNota, setTipoNota] = useState("entrada");
  const [data, setData] = useState("");

  return (
    <ModulePage
      title="Notas de Compra"
      description="Registro e controle de notas fiscais de compra"
      iconLabel="📄"
    >
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Nota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Número da nota"
            value={numeroNota}
            onChange={(e) => setNumeroNota(e.target.value)}
          />
          <Select value={tipoNota} onValueChange={setTipoNota}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </CardContent>
      </Card>
    </ModulePage>
  );
}
