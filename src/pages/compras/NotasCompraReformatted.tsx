import React, { useState } from 'react';
import { ModulePage } from '@/components/templates/ModulePage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NotasCompraReformatted(): JSX.Element {
  const [arquivo, setArquivo] = useState<File | null>(null);

  return (
    <ModulePage
      title="Notas de Compra (Reformatado)"
      description="Upload e reconciliação de notas fiscais reformadas"
      icon={<span role="img" aria-label="Nota">📑</span>}
    >
      <Card>
        <CardHeader>
          <CardTitle>Upload DANFE</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
              type="file"
            accept="application/pdf,image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setArquivo(file);
            }}
          />
          {arquivo && <p className="text-sm text-muted-foreground mt-2">{arquivo.name}</p>}
        </CardContent>
      </Card>
    </ModulePage>
  );
}
