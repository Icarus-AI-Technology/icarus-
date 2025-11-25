# Chatbot - Proximos Passos
Atualizado em 2025-11-23 23:24:31

- Registrar integracoes pendentes no arquivo backups/proximos-passos/option1-chatbot-20251123-232431.log
- Validar prompts em `src/hooks/useChatbot.ts`
- Garantir que a Edge Function de IA esta disponivel (opcao 3 deste menu)
- Revisar documentacao em `docs/DOCUMENTACAO_CHATBOT.md`

## Atualização 2025-11-24 00:25

- ✅ `ANTHROPIC_API_KEY` e `ANTHROPIC_FINANCE_MODEL` confirmadas nos secrets do projeto (ver configuração Supabase/Vercel).
- ✅ `src/hooks/useChatbot.ts` agora invoca a Edge Function `ai-tutor-financeiro`; em caso de erro, realiza fallback para o mecanismo de FAQs.
- ✅ `vite.config.js` inclui proxy `/api` para rodar o chatbot + endpoints locais com `pnpm dev`.
