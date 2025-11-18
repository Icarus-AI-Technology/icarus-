# 🔄 TEMPLATE DE PLANO DE ROLLBACK

**Data:** 2025-10-20  
**Equipe:** AGENTE_EQUIPE_ECONOMIA_AI_TUTORES  
**Versão:** 1.0.0

---

## 🎯 OBJETIVO

Template padronizado para **rollback seguro** de substituições de serviços, garantindo **zero regressão** e **continuidade operacional**.

---

## 📋 INFORMAÇÕES DA SUBSTITUIÇÃO

| Campo | Descrição |
|-------|-----------|
| **Nome da Mudança** | _Ex: Substituição OpenAI → Ollama_ |
| **Data de Deploy** | _AAAA-MM-DD HH:MM_ |
| **Responsável** | _Nome + E-mail_ |
| **Ambiente** | _Staging / Production_ |
| **Criticidade** | _Baixa / Média / Alta / Crítica_ |

---

## 🔍 PRÉ-REQUISITOS PARA ROLLBACK

- [ ] **Backup completo** do estado anterior (configs, banco, código)
- [ ] **Feature flag** ativa e testada
- [ ] **Logs detalhados** de antes/depois da mudança
- [ ] **Métricas baseline** capturadas (performance, custos, erros)
- [ ] **Plano de comunicação** com stakeholders definido

---

## 📊 CRITÉRIOS DE ROLLBACK (Triggers)

### **Automático (Immediate Rollback)**

- [ ] **Uptime < 99%** (indisponibilidade detectada)
- [ ] **Error rate > 5%** (erros críticos em produção)
- [ ] **Latência > 2x baseline** (degradação severa)
- [ ] **Data loss** detectada (inconsistências no banco)

### **Manual (Avaliação Necessária)**

- [ ] **Satisfação usuário < 3.0/5.0** (feedback negativo)
- [ ] **Custos > 20% acima do previsto** (economia não realizada)
- [ ] **Funcionalidade degradada** (mesmo sem erros críticos)
- [ ] **Complexidade operacional** muito alta (suporte sobrecarregado)

---

## 🛠️ PROCEDIMENTO DE ROLLBACK

### **Fase 1: AVALIAÇÃO (5 minutos)**

1. **Confirmar trigger**: Qual critério foi atingido?
2. **Verificar logs**: Evidências do problema
3. **Notificar equipe**: Alerta no canal de emergência
4. **Documentar**: Timestamp + descrição do problema

### **Fase 2: ROLLBACK TÉCNICO (15 minutos)**

#### **Opção A: Feature Flag (Recomendado)**

```bash
# Desativar nova feature via flag
curl -X POST https://api.icarus.tech/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"flag": "ollama_enabled", "value": false}'

# Ativar serviço anterior
curl -X POST https://api.icarus.tech/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"flag": "openai_fallback", "value": true}'
```

**Tempo estimado**: 30 segundos  
**Impacto**: Zero downtime

#### **Opção B: Reverter Deploy**

```bash
# Git: Reverter commit
git revert <commit-hash> --no-edit
git push origin main

# Deploy automático (CI/CD)
# OU deploy manual:
npm run build
npm run deploy
```

**Tempo estimado**: 5-10 minutos  
**Impacto**: Downtime de 2-5 minutos

#### **Opção C: Restaurar Backup (Último Recurso)**

```bash
# Banco de dados
npm run db:restore -- --backup-id=<backup-id>

# Configurações
cp .env.backup .env

# Rebuild e deploy
npm run build
npm run deploy
```

**Tempo estimado**: 10-30 minutos  
**Impacto**: Downtime de 10-30 minutos

### **Fase 3: VERIFICAÇÃO (10 minutos)**

- [ ] **Health check**: Endpoints críticos respondendo
- [ ] **Smoke tests**: Fluxos principais funcionando
- [ ] **Logs limpos**: Sem erros críticos nos últimos 5 minutos
- [ ] **Métricas normalizadas**: Latência, error rate, uptime
- [ ] **Notificar usuários**: "Serviço restaurado"

### **Fase 4: POST-MORTEM (24-48h após)**

- [ ] **Documentar causa raiz**: O que falhou?
- [ ] **Análise de impacto**: Quantos usuários afetados? Por quanto tempo?
- [ ] **Lições aprendidas**: O que poderia ter sido evitado?
- [ ] **Ações corretivas**: Melhorias para próxima vez
- [ ] **Atualizar runbook**: Adicionar novos learnings

---

## 📝 EXEMPLO DE ROLLBACK: OLLAMA → OPENAI

### **Contexto**

- **Mudança**: Substituir OpenAI por Ollama local (Tutores IA)
- **Deploy**: 2025-10-25 14:00
- **Trigger**: Latência média subiu de 300ms para 1.2s (4x baseline)

### **Procedimento Executado**

**14:15** - Trigger detectado (latência > 2x baseline)  
**14:16** - Equipe notificada (Slack #emergencias)  
**14:17** - Rollback via feature flag:

```bash
# Desativar Ollama
curl -X POST https://api.icarus.tech/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"flag": "ollama_enabled", "value": false}'

# Resultado: Tráfego migrado para OpenAI em 10s
```

**14:18** - Verificação: latência voltou a 320ms  
**14:20** - Smoke tests: 100% sucesso  
**14:25** - Notificação usuários: "Serviço estabilizado"

**Post-mortem (26/10)**:
- Causa: Ollama não estava com GPU ativada (CPU-only → lento)
- Impacto: 10 minutos de degradação, 0 downtime
- Lições: Sempre validar GPU antes de deploy
- Ação: Adicionar check de GPU no CI/CD

---

## 🔐 RESPONSABILIDADES

| Papel | Responsabilidade |
|-------|------------------|
| **Dev Sênior A** | Executar rollback técnico (feature flags, deploy) |
| **Dev Sênior B** | Verificar integridade do banco de dados |
| **DevOps** | Monitorar métricas, logs e infraestrutura |
| **Tech Lead** | Decisão final de rollback (se não automático) |
| **Product Owner** | Comunicação com stakeholders |

---

## ✅ CHECKLIST PRÉ-DEPLOY (Prevenir Rollbacks)

Antes de **qualquer** substituição de serviço:

- [ ] **Benchmark completo**: ≥95% da qualidade atual
- [ ] **Feature flag configurada**: Rollback em 30s
- [ ] **A/B test em staging**: 100% dos fluxos testados
- [ ] **Monitoring ativo**: Alertas configurados para triggers
- [ ] **Backup recente**: < 24h de idade
- [ ] **Runbook atualizado**: Equipe sabe o que fazer
- [ ] **Janela de deploy**: Horário de baixo tráfego
- [ ] **Equipe disponível**: Pelo menos 2 pessoas on-call
- [ ] **Plano B documentado**: Este template preenchido

---

## 📞 CONTATOS DE EMERGÊNCIA

| Função | Nome | Telefone | E-mail |
|--------|------|----------|--------|
| Tech Lead | _TBD_ | _TBD_ | _TBD_ |
| DevOps | _TBD_ | _TBD_ | _TBD_ |
| DBA | _TBD_ | _TBD_ | _TBD_ |
| Suporte Externo (Supabase) | - | - | support@supabase.com |

---

## 🎯 METAS DE RECUPERAÇÃO

| Métrica | Meta |
|---------|------|
| **MTTR** (Mean Time To Recovery) | < 15 minutos |
| **RTO** (Recovery Time Objective) | < 30 minutos |
| **RPO** (Recovery Point Objective) | < 1 hora |
| **Zero Data Loss** | 100% |

---

## 📚 HISTÓRICO DE ROLLBACKS

| Data | Mudança | Motivo | Tempo de Recovery | Lições Aprendidas |
|------|---------|--------|-------------------|-------------------|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

---

**© 2025 ICARUS v5.0 - AGENTE_EQUIPE_ECONOMIA_AI_TUTORES**

---

## 📖 REFERÊNCIAS

- [AWS Well-Architected Framework - Reliability](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/)
- [Google SRE Book - Managing Incidents](https://sre.google/sre-book/managing-incidents/)
- [Netflix Chaos Engineering](https://netflixtechblog.com/chaos-engineering-upgraded-878d341f15fa)

