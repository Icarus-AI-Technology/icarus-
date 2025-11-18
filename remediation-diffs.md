ICARUS v5.0 — Remediation Diffs (P0 foco em build/type-check)

1) Declarar módulo gpt-researcher (evitar TS2307)

Sugestão: criar `src/types/gpt-researcher.d.ts`.

```ts
declare module 'gpt-researcher' {
  const GPTResearcher: any;
  export default GPTResearcher;
}
```

2) Ajuste em GPTResearcherExamples.tsx (onLog e setState tipado)

Trocar o handler `onLog` para usar `metadata.sources` (compatível com hook atual) e garantir tipos de `setResultados`.

```diff
--- a/src/components/examples/GPTResearcherExamples.tsx
+++ b/src/components/examples/GPTResearcherExamples.tsx
@@
   } = useGPTResearcher({
     host: 'http://localhost:8000',
-    onLog: (data) => {
-      if (data.content === 'research_complete' && data.metadata?.result) {
-        setResultados(prev => [...prev, data.metadata.result]);
-      }
-    }
+    onLog: (data) => {
+      if (data.content === 'research_complete') {
+        const output = typeof data.output === 'string' ? data.output : '';
+        setResultados((prev: PesquisaResultado[]) => [
+          ...prev,
+          { content: output || 'Pesquisa concluída', output, metadata: data.metadata }
+        ]);
+      }
+    }
   });
```

3) GestaoContratos — dependências date-fns e `Spinner`

- Instalar: `npm i -D date-fns @types/date-fns`
- Substituir `Spinner` por `Loader2` (lucide-react) como placeholder.

```diff
--- a/src/components/modules/GestaoContratos.tsx
+++ b/src/components/modules/GestaoContratos.tsx
@@
-import { ptBR } from "date-fns/locale";
+import { ptBR } from "date-fns/locale";
@@
-          <div className="flex items-center justify-center py-12">
-            <Spinner size="lg" />
-          </div>
+          <div className="flex items-center justify-center py-12">
+            <Loader2 className="w-6 h-6 animate-spin" />
+          </div>
```

4) GestaoContratos — colunas `Table` sem `accessor` inválido

Se o componente `Table` não aceitar `accessor`, manter apenas `header` e `cell` acessando `row` tipado.

```diff
--- a/src/components/modules/GestaoContratos.tsx
+++ b/src/components/modules/GestaoContratos.tsx
@@
       columns=[
         {
           header: "Contrato",
-          accessor: "titulo",
           cell: ({ row }) => (
             <div className="space-y-1">
               <p className="text-body-sm font-medium text-[var(--text-primary)]">{row.titulo}</p>
               <p className="text-body-xs text-[var(--text-secondary)]">#{row.numero_contrato}</p>
             </div>
           ),
         },
```

Repita o mesmo padrão para as demais colunas que usam `accessor`.

5) CorreiosService — `getMockCotacao` (usar params derivados)

`getMockCotacao` espera campos não presentes em `CotacaoParams`. Gerar parâmetros derivados a partir de `CotacaoParams` antes de calcular valores.

```diff
--- a/src/lib/services/transportadoras/nacionais/CorreiosService.ts
+++ b/src/lib/services/transportadoras/nacionais/CorreiosService.ts
@@
-  private getMockCotacao(params: CotacaoParams): CotacaoResult {
-    const servico = this.SERVICOS[params.codServico as keyof typeof this.SERVICOS];
-    const basePrice = params.peso * 5 + params.comprimento * 0.1;
-    const urgencyMultiplier = params.codServico === '40290' ? 3 : 
-                              params.codServico === '40215' ? 2 : 1;
+  private getMockCotacao(params: { codServico: string; cepOrigem: string; cepDestino: string; peso: number; comprimento: number; altura: number; largura: number; valorDeclarado: number; }): CotacaoResult {
+    const servico = this.SERVICOS[params.codServico as keyof typeof this.SERVICOS];
+    const basePrice = params.peso * 5 + params.comprimento * 0.1;
+    const urgencyMultiplier = params.codServico === '40290' ? 3 : 
+                              params.codServico === '40215' ? 2 : 1;
@@
   }
```

E ajustar a chamada no `cotarFrete` para passar os campos derivados (já montados em `calcularPrecoPrazo`).

6) Scripts QA no package.json

```diff
--- a/package.json
+++ b/package.json
@@ "scripts": {
   "validate:all": "npm run type-check && npm run lint && npm run build",
+  "qa:a11y": "axe http://localhost:4173/ --tags wcag2a,wcag2aa",
+  "qa:perf": "lighthouse http://localhost:4173/ --preset=desktop --output=json --output-path=./docs/lh-root.json",
+  "qa:ds": "node -e \"require('child_process').execSync('rg -n \\\"\\\\b(bg|text|border|ring)-(red|blue|green|purple|indigo|yellow|pink|gray|slate|stone|neutral|zinc|emerald|teal|cyan|sky|violet|fuchsia|rose|orange|amber)-\\\\d{1,3}\\\\b\\\" src',{stdio:'inherit'})\""
 }
```

Notas
- Após aplicar os diffs acima, rodar: `npm run type-check` → `npm run build` → `npm run preview`.
- Em seguida, executar `qa:a11y`, `qa:perf` e revisar `docs/` atualizados.


