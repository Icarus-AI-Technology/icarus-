# Subagente V5-03-04 — Fallback Monitor

**Responsável por**: ativar planos de contingência quando serviços IA estiverem indisponíveis.

## Tasks

- Garantir fallback para respostas baseadas em contexto (`ChatbotWithResearch`)
- Atualizar métricas de disponibilidade (SLA) em `logs/ai-localhost/availability.json`
- Informar agente V5-01 sobre degradações prolongadas
