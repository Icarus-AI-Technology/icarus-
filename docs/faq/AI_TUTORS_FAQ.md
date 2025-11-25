# FAQ - AI Tutors & Agents

**Data:** 28 de outubro de 2025  
**Versão:** 1.0  
**Respostas rápidas para perguntas frequentes**

---

## 📋 Categorias
- [Geral](#geral)
- [Uso e Funcionalidades](#uso-e-funcionalidades)
- [Segurança e Privacidade](#segurança-e-privacidade)
- [Performance e Confiabilidade](#performance-e-confiabilidade)
- [Administração](#administração)
- [Técnico](#técnico)

---

## Geral

### O que são AI Tutors?
Assistentes inteligentes integrados em cada módulo do ICARUS que fornecem sugestões contextuais, alertas proativos e insights automáticos baseados em dados reais.

### Qual a diferença entre Tutores e Agentes?
- **Tutores:** Sugestões inline em cada módulo (95 tutores)
- **Agentes:** IA especializada em domínios específicos via Edge Functions (4 agentes: Clinical, Operations, Procurement, Logistics)

### Todos os módulos têm tutores?
✅ Sim! 100% dos 58 módulos core têm tutores integrados:
- 11 tutores específicos (módulos críticos)
- 84 tutores genéricos (categorização automática)

### Como os tutores "aprendem"?
Através de:
- **Feedback explícito:** Seu 👍/👎 nas sugestões
- **Feedback implícito:** Ações executadas vs. ignoradas
- **Dados históricos:** Padrões identificados ao longo do tempo
- **Benchmarks:** Comparação com melhores práticas

### Preciso de treinamento para usar?
Não é obrigatório, mas recomendado:
- Uso básico: intuitivo e auto-explicativo
- Uso avançado: treinamento de 2h para operadores, 4h para gestores

---

## Uso e Funcionalidades

### Como ativar os tutores?
Os tutores já estão ativos por padrão em todos os módulos. Basta acessar qualquer módulo para vê-los.

### Posso desativar os tutores?
✅ Sim! Vá em **Configurações → Preferências → AI Tutors** e:
- Desative completamente
- Ajuste prioridade mínima (ex: só críticos)
- Pause temporariamente

### Como fornecer feedback?
Clique nos botões 👍 (útil) ou 👎 (não útil) em cada sugestão. Opcionalmente, adicione um comentário explicativo.

### O que fazer se uma sugestão estiver errada?
1. Clique em 👎 (não útil)
2. Adicione comentário: "Sugestão incorreta porque..."
3. Dispense a sugestão
4. Se recorrente, reporte via `suporte@icarus.com.br`

### Posso solicitar análises específicas?
✅ Sim! Use o botão **"Solicitar Análise"** no painel do tutor:
1. Digite sua solicitação (ex: "Analise estoque de OPME")
2. Aguarde processamento (~5-10s)
3. Receba sugestões personalizadas

### As sugestões consideram meu histórico?
Sim! Os tutores analisam:
- Suas ações passadas
- Perfil da sua instituição
- Padrões do seu setor
- Contexto atual do módulo

### Quanto tempo as sugestões ficam visíveis?
- **Críticas:** Até serem executadas ou dispensadas
- **Importantes:** 48 horas
- **Informativas:** 24 horas

### Posso salvar sugestões para depois?
✅ Sim! Clique em "Salvar para depois" e acesse em **Menu → Sugestões Salvas**.

---

## Segurança e Privacidade

### Os tutores têm acesso aos meus dados pessoais?
Os tutores acessam apenas dados necessários para gerar sugestões, respeitando:
- **RBAC:** Só vê dados do seu perfil
- **LGPD:** Dados anônimos quando possível
- **Auditoria:** Todos os acessos são logados

### Minhas ações são monitoradas?
Sim, para fins de:
- **Melhoria:** Aprender padrões e refinar sugestões
- **Auditoria:** Compliance e rastreabilidade
- **Segurança:** Detectar anomalias

Você pode solicitar seus dados via **LGPD → Portabilidade**.

### Quem tem acesso às minhas interações com tutores?
- **Você:** Sempre
- **Seu supervisor:** Se configurado nas políticas da empresa
- **Administradores:** Apenas dados agregados (não individualizados)
- **CEO:** Insights consolidados (anônimos)

### Os dados são compartilhados com terceiros?
❌ **Não!** Todos os dados ficam no seu Supabase (self-hosted ou cloud isolado).

### Posso deletar meu histórico de interações?
✅ Sim! Vá em **Configurações → Privacidade → AI Tutors** e clique em "Deletar Histórico". Isso remove:
- Feedback fornecido
- Ações executadas
- Sugestões salvas

⚠️ Ação irreversível!

---

## Performance e Confiabilidade

### Quanto tempo os tutores levam para carregar?
- **Médio:** <2s
- **Máximo aceitável:** <3s
- **Se > 3s:** Considere limpar cache ou reportar

### Os tutores funcionam offline?
❌ Não. Tutores requerem conexão para:
- Buscar dados em tempo real
- Processar via Edge Functions
- Sincronizar feedback

### O que acontece se o sistema AI falhar?
O ICARUS continua funcionando normalmente! Os tutores são **não-bloqueantes**:
- Módulos operam sem tutores
- Funcionalidades core não são afetadas
- Alertas críticos são enviados para a equipe técnica

### Os tutores aumentam o consumo de dados?
Impacto mínimo:
- **Sugestões:** ~5-10 KB por módulo
- **Dashboard AI:** ~50-100 KB
- **Total estimado:** <5 MB/dia de uso intensivo

### Qual a precisão dos tutores?
- **Overall:** >85% de precisão
- **Críticos:** >95% (maior rigor)
- **Informativos:** >75% (exploratórios)

---

## Administração

### Como adicionar tutores a novos módulos?
Use o script:
```bash
bash scripts/add-tutor-to-module.sh <module-name>
```

Ou siga o guia: `docs/deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md`

### Como monitorar o uso dos tutores?
Acesse o **AI System Dashboard** em `/admin/ai-dashboard`:
- KPIs em tempo real
- Taxa de aceitação por módulo
- Status dos agentes
- Top 10 módulos ativos

### Como configurar alertas críticos?
```sql
-- No Supabase SQL Editor
INSERT INTO ceo_consolidated_alerts (
  title, priority, category, threshold_config
) VALUES (
  'Estoque Crítico',
  'critical',
  'operations',
  '{"metric": "stock_level", "operator": "<", "value": 10}'
);
```

### Como customizar sugestões por instituição?
Edite `src/services/ai/AIOrchestrator.ts`:
```typescript
// Adicionar regras específicas
if (context.hospital_id === 'hospital_abc') {
  suggestions.push({
    type: 'tip',
    content: 'Regra específica do Hospital ABC',
    priority: 'high'
  });
}
```

### Como integrar com sistemas externos?
Via Edge Functions. Exemplo:
```typescript
// supabase/functions/custom-integration/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Sua lógica de integração
  const data = await externalAPI.getSuggestions();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});
```

### Como gerenciar permissões de IA?
Via RBAC. Exemplo:
```sql
-- Operadores: só sugestões operacionais
UPDATE user_roles 
SET ai_permissions = '{"view": ["operational"], "execute": ["operational"]}'
WHERE role = 'operador';

-- Gestores: todas exceto configuração
UPDATE user_roles 
SET ai_permissions = '{"view": ["all"], "execute": ["operational", "strategic"]}'
WHERE role = 'gestor';

-- Admins: acesso total
UPDATE user_roles 
SET ai_permissions = '{"view": ["all"], "execute": ["all"], "configure": true}'
WHERE role = 'admin';
```

---

## Técnico

### Qual tecnologia os tutores usam?
- **Frontend:** React + TypeScript
- **Backend:** Supabase (Postgres + Edge Functions Deno)
- **IA:** Modelos locais (Ollama) + APIs externas (OpenAI, Anthropic)
- **Infra:** Self-hosted ou Supabase Cloud

### Como os tutores se comunicam com agentes?
Via **AIOrchestrator**:
1. Tutor solicita sugestões
2. Orchestrator identifica categoria do módulo
3. Chama agente especializado (Edge Function)
4. Agente processa e retorna insights
5. Orchestrator formata e retorna ao tutor

### Posso criar meus próprios agentes?
✅ Sim! Siga o template:
```typescript
// supabase/functions/agent-custom/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { module, context } = await req.json();
  
  // Sua lógica de IA
  const insights = await generateCustomInsights(module, context);
  
  return new Response(JSON.stringify({ insights }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

Deploy:
```bash
supabase functions deploy agent-custom
```

### Como debugar problemas nos tutores?
1. **Console do navegador:**
   ```javascript
   window.DEBUG_AI = true; // Habilita logs detalhados
   ```

2. **Logs do Supabase:**
   ```bash
   supabase functions logs agent-clinical --tail
   ```

3. **Queries no banco:**
   ```sql
   SELECT * FROM ai_tutor_insights
   WHERE module_name = 'cirurgias'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

### Como rodar testes dos tutores?
```bash
# Testes unitários (Vitest)
pnpm test

# Testes E2E (Playwright)
pnpm dev  # Terminal 1
npx playwright test  # Terminal 2

# Com cobertura
pnpm test:coverage

# UI mode
pnpm vitest --ui
npx playwright test --ui
```

### Como contribuir com melhorias?
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Implemente e teste
4. Commit: `git commit -m "feat(ai): minha melhoria"`
5. Push: `git push origin feature/minha-melhoria`
6. Abra PR no GitHub

### Onde encontrar a documentação técnica completa?
- **Especificação:** `ICARUS_V5_SPEC_COMPLETO.md`
- **Deployment:** `docs/deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md`
- **Testes:** `docs/testing/AI_SYSTEM_TESTS_GUIDE.md`
- **Monitoramento:** `docs/monitoring/AI_AGENTS_MONITORING_GUIDE.md`
- **Troubleshooting:** `docs/troubleshooting/AI_TUTORS_TROUBLESHOOTING.md`

---

## Não encontrou sua pergunta?

**Contato:**
- 📧 Email: suporte@icarus.com.br
- 💬 Chat: `/help` no sistema
- 📞 Telefone: (11) 1234-5678
- 🎓 Treinamento: agendar via RH

**Documentação:**
- `AI_TUTORS_USER_GUIDE.md` - Guia completo do usuário
- `AI_TUTORS_TROUBLESHOOTING.md` - Solução de problemas

---

**Versão:** 1.0  
**Última atualização:** 28/10/2025  
© 2025 ICARUS v5.0 - Sistema Enterprise OPME

