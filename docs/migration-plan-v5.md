# Plano de Migração — ICARUS v5.0

**Objetivo**: migrar apenas os artefatos necessários do ambiente de desenvolvimento `/Users/daxmeneghel/icarus-make` para o ambiente de produção `/Users/daxmeneghel/icarus-v5.0`, mantendo segregação total.

## 1. Estrutura de Diretórios

- **Desenvolvimento**: `/Users/daxmeneghel/icarus-make`
  - Contém todo o código-fonte, documentação e ferramentas auxiliares.
- **Produção**: `/Users/daxmeneghel/icarus-v5.0`
  - Deve receber somente artefatos aprovados (build, migrations, scripts necessários).

## 2. Itens a Migrar

| Categoria                | Origem                                                        | Destino               | Observações                        |
| ------------------------ | ------------------------------------------------------------- | --------------------- | ---------------------------------- |
| Build Frontend           | `dist/` ou `npm run build`                                    | `icarus-v5.0/app`     | Regerar build antes de copiar.     |
| Código Fonte crítico     | `src/`, `supabase/`, `scripts/ops/`                           | `icarus-v5.0/source`  | Migrar somente arquivos aprovados. |
| Configurações            | `vercel.json`, `package.json`, `tsconfig.json`                | `icarus-v5.0/config`  | Revisar variáveis de ambiente.     |
| Documentação de operação | `docs/migration-schedule-v5.md`, `ICARUS_V5_SPEC_COMPLETO.md` | `icarus-v5.0/docs`    | Somente versões finais.            |
| Scripts de implantação   | `deploy-vercel.sh`, `deploy-supabase.sh`                      | `icarus-v5.0/scripts` | Garantir permissões corretas.      |

## 3. Itens a Permanecer no Dev

- Diretórios temporários (`node_modules`, `logs/`, `test-results/`, `.cursor/`)
- Artefatos de auditoria e rascunhos (`backups/`, `playwright-report/`)
- Ferramentas de desenvolvimento (`storybook-static`, `mock-*`, `ml-services/` se não usado em produção)

## 4. Sequência Recomendada

1. **Preparar ambiente**
   - Criar diretório `/Users/daxmeneghel/icarus-v5.0` (se ainda não existir)
   - Configurar `.env.production` baseado em `env.example`
2. **Validar qualidade**
   - Executar `scripts/ops/run-missing-tests.sh`
   - Conferir ambiente com `scripts/ops/validate-environment.mjs`
3. **Congelar versão**
   - Atualizar `CHANGELOG.md` e `docs/migration-schedule-v5.md`
   - Marcar commit/tag de release
4. **Gerar artefatos**
   - `npm ci && npm run build`
   - Exportar supabase migrations necessárias
5. **Copiar arquivos**
   - Usar `rsync` com allowlist (`rsync -av --files-from=migration-allowlist.txt ./ /Users/daxmeneghel/icarus-v5.0/`)
6. **Configurar produção**
   - Instalar dependências mínimas (`npm ci --omit=dev`)
   - Configurar variáveis Vercel/Supabase
7. **Verificar**
   - Executar smoke tests no diretório de produção
   - Atualizar checklist pré-deploy

## 5. Lista de Verificação (pré-cópia)

- [ ] Testes unitários e E2E executados
- [ ] Variáveis de ambiente validadas
- [ ] Dependências sem divergências críticas
- [ ] Migrations e Edge Functions auditadas
- [ ] Plano de rollback definido

## 6. Segurança

- Usar cópia incremental apenas após validação
- Garantir que chaves/API estejam somente em arquivos seguros (`.env.production` fora do controle de versão)
- Revisar permissões de arquivos executáveis (`chmod +x scripts/*.sh`)

## 7. Próximos Passos

- Manter arquivo `docs/migration-schedule-v5.md` atualizado com datas e responsáveis
- Integrar pipeline de deploy contínuo após validações finais
