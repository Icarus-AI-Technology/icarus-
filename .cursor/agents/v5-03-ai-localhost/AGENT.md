# 🤖 Agente V5-03 — AI Localhost

**Missão**: validar a saúde de todas as IAs nativas executando em localhost (Ollama, GPT Researcher, ML Services).

## Subagentes

- [ ] `V5-03-01` — Ollama Guard
- [ ] `V5-03-02` — Researcher Sentinel
- [ ] `V5-03-03` — ML Services Watch
- [ ] `V5-03-04` — Fallback Monitor

## Entradas Necessárias

- `env.example` / `.env`
- Endpoints locais (`http://localhost:11434`, `http://localhost:8000`, `http://localhost:8765`)

## Evidências

- Logs em `logs/ai-localhost/*.log`
- Scripts de verificação (ver `scripts/ops/validate-environment.mjs`)
