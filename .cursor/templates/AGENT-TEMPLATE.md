# [EMOJI] AGENTE [XX]: [NOME]

## 📋 Identificação

- **ID:** `[01-09]`
- **Nome:** `[nome-do-agente]`
- **Emoji:** [EMOJI]
- **Grupo Paralelo:** `[1, 2, 3, ou sequential]`
- **Dependências:** `[lista de IDs de agentes]`
- **Tempo Estimado:** `[15-90 min]`
- **Subagentes:** `[número]`

---

## 🎯 Missão

[Descrição clara e objetiva da missão principal do agente]

---

## 📦 Escopo de Auditoria

### Arquivos/Diretórios a Auditar

```
[Lista de paths]
src/components/...
src/pages/...
```

### Critérios de Validação

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

---

## 🔄 Protocolo de Execução

### Fase 1: Pré-requisitos (5 min)

```bash
# Comandos de verificação
npm run type-check
npm run lint
```

**Validações:**
- [ ] Ambiente configurado
- [ ] Dependências instaladas
- [ ] Dependências de outros agentes satisfeitas

---

### Fase 2: Inicialização (2 min)

```typescript
// Atualizar STATUS.json
const status = {
  agent_id: '[XX]',
  status: 'running',
  start_time: new Date().toISOString(),
  progress: 0,
  current_task: 'Inicializando...'
};
```

**Ações:**
1. Carregar configuração
2. Verificar recursos necessários
3. Adquirir locks (se necessário)
4. Iniciar logging

---

### Fase 3: Execução de Subagentes (XX min)

#### Subagente [X.1]: [Nome]

**Responsabilidade:** [Descrição]

**Script de auditoria:**
```bash
# Comandos específicos
[comandos]
```

**Validações:**
- [ ] Validação A
- [ ] Validação B

**Output esperado:**
```json
{
  "subagent": "X.1",
  "status": "completed",
  "issues": 0,
  "warnings": 2
}
```

---

[Repetir para cada subagente]

---

### Fase 4: Consolidação (5 min)

**Ações:**
1. Consolidar resultados de todos os subagentes
2. Calcular score final
3. Identificar gaps críticos
4. Gerar lista de recomendações

---

### Fase 5: Geração de Relatório (5 min)

**Template do relatório:**

```markdown
# [EMOJI] RELATÓRIO - AGENTE [XX]

## Resumo Executivo
- Total auditado: X items
- Issues críticos: Y
- Warnings: Z
- Score: W/100

## Detalhamento
[Seções detalhadas por subagente]

## Gaps Críticos
- [ ] Gap 1
- [ ] Gap 2

## Recomendações
1. Recomendação 1
2. Recomendação 2
```

---

### Fase 6: Finalização (2 min)

```typescript
// Atualizar STATUS.json
const status = {
  agent_id: '[XX]',
  status: 'completed',
  end_time: new Date().toISOString(),
  progress: 100,
  current_task: 'Concluído'
};
```

**Ações:**
1. Salvar REPORT.md
2. Atualizar STATUS.json
3. Liberar locks
4. Notificar orquestrador
5. Enviar mensagens para agentes dependentes

---

## 🔒 Gerenciamento de Locks

### Recursos de Leitura (Não requer lock)

```json
[
  "path/to/read/1",
  "path/to/read/2"
]
```

### Recursos de Escrita (Requer lock exclusivo)

```json
[
  ".cursor/agents/[XX]-[name]/STATUS.json",
  ".cursor/agents/[XX]-[name]/REPORT.md"
]
```

---

## 📡 Comunicação

### Dependências (Aguardar)

- **Agente [YY]:** Aguardar conclusão antes de iniciar
- **Agente [ZZ]:** Consumir dados de [arquivo/mensagem]

### Notificações (Informar)

- **Agente [WW]:** Enviar mensagem quando [condição]
- **Orquestrador:** Notificar conclusão

---

## 🚫 Anti-Padrões Específicos

❌ Anti-padrão 1: [Descrição]  
❌ Anti-padrão 2: [Descrição]  
❌ Anti-padrão 3: [Descrição]  

---

## ✅ Checklist Final

- [ ] Todas as tarefas concluídas
- [ ] Todos os subagentes executados
- [ ] STATUS.json atualizado
- [ ] REPORT.md gerado
- [ ] Locks liberados
- [ ] Logs salvos
- [ ] Orquestrador notificado
- [ ] Mensagens enviadas

---

## 📊 Métricas de Sucesso

- **Score mínimo:** 80/100
- **Issues críticos:** 0
- **Warnings:** < 10
- **Tempo execução:** < [tempo estimado]

---

## 🐛 Troubleshooting

### Problema 1
**Sintoma:** [Descrição do problema]  
**Causa:** [Causa raiz]  
**Solução:** [Como resolver]

### Problema 2
[Repetir estrutura]

---

**Data de Criação:** 2025-10-25T14:57:02.615Z  
**Versão:** 1.0.0  
**Status:** Template Base
