# Playbook de Migração: icarus-make → icarus-v5.0

## 📋 Visão Geral

Este documento descreve o novo playbook **migrar-make-para-v5** adicionado ao Orquestrador-ICARUS, que automatiza a migração completa do ambiente de desenvolvimento `/users/daxmeneghel/icarus-make/` para o repositório oficial `/users/daxmeneghel/icarus-v5.0/`.

## 🎯 Objetivo

Migrar todo o trabalho desenvolvido no sandbox `icarus-make` para o repositório oficial `icarus-v5.0`, garantindo:

- ✅ Deduplicação de arquivos
- ✅ Preferência por versões mais recentes
- ✅ Backup completo antes da migração
- ✅ Execução de testes após a migração
- ✅ Verificação de integridade do Supabase
- ✅ Segurança contra sobrescrita de arquivos críticos (.git, node_modules)

## 🚀 Como Usar

### Comando Principal

No Cursor, na raiz do projeto, execute:

```bash
@Orquestrador-ICARUS run migrar-make-para-v5
```

## 📝 Etapas Executadas

O playbook executa as seguintes etapas em ordem:

### 1. **scan-diff** 
Gera um diff completo entre os dois repositórios para auditoria.
- **Output**: `backups/migration/icarus-make.diff`

### 2. **backup-prod-root**
Cria um backup comprimido do repositório oficial ANTES da migração.
- **Output**: `backups/migration/icarus-v5.0-pre-migration.tar.gz`
- **Exclusões**: `.git` e `node_modules`

### 3. **sync-make-para-v5**
Sincroniza arquivos do `icarus-make` para `icarus-v5.0` usando rsync.
- **Modo**: `--update` (prioriza arquivos mais recentes)
- **Exclusões**: `.git` e `node_modules`

### 4. **git-status-resumo**
Exibe o status do Git após a sincronização.
- Mostra quais arquivos foram alterados/adicionados

### 5. **rodar-testes**
Executa a suite completa de testes:
- `npm install` (se necessário)
- `npm run lint`
- `npm test`
- `npm run build`

### 6. **verificar-supabase**
Verifica a integridade do backend Supabase:
- `supabase status`
- `supabase functions list`

### 7. **relatorio-final**
Gera um relatório completo da migração.
- **Output**: `backups/migration/relatorio-migracao.md`

### 8. **remover-make-opcional**
Exibe instruções para remoção OPCIONAL do diretório `icarus-make`.
- ⚠️ **ATENÇÃO**: Esta etapa NÃO executa a remoção automaticamente
- Requer confirmação manual do usuário

## 📦 Deliverables

Após a execução, você terá:

1. **backups/migration/icarus-make.diff** - Diff completo entre os repositórios
2. **backups/migration/icarus-v5.0-pre-migration.tar.gz** - Backup do estado anterior
3. **backups/migration/relatorio-migracao.md** - Relatório detalhado da migração

## 🛡️ Políticas de Segurança

### Arquivos Protegidos (denyWrite)

Os seguintes diretórios/arquivos NUNCA serão sobrescritos:

- `/users/daxmeneghel/icarus-v5.0/.git`
- `/users/daxmeneghel/icarus-v5.0/node_modules`
- `/users/daxmeneghel/icarus-make/.git`
- `/users/daxmeneghel/icarus-make/node_modules`

### Regras de Segurança

1. ✅ Nunca apagar ou sobrescrever `.git` nem `node_modules`
2. ✅ Qualquer comando de remoção definitiva (`rm -rf`) é tratado como OPCIONAL
3. ✅ Remoção só é executada após confirmação explícita do usuário

## 🔧 Agente Migracao-Repo

O novo agente **Migracao-Repo** foi criado especificamente para gerenciar este processo:

### Ferramentas Disponíveis
- `bash` - Scripts de sincronização
- `git` - Controle de versão
- `node` - Testes e builds
- `deno` - Runtime adicional
- `supabase` - Verificação de backend

### Comandos Individuais

Você pode executar comandos individuais se necessário:

```bash
@Migracao-Repo:scan-diff
@Migracao-Repo:backup-prod-root
@Migracao-Repo:sync-make-para-v5
@Migracao-Repo:git-status-resumo
@Migracao-Repo:rodar-testes
@Migracao-Repo:verificar-supabase
@Migracao-Repo:relatorio-final
@Migracao-Repo:remover-make-opcional
```

## 📊 Fluxo de Trabalho Recomendado

1. **Antes da Migração**
   - Commit ou stash de qualquer trabalho em progresso
   - Certifique-se de que ambos os repositórios estão acessíveis

2. **Durante a Migração**
   - Execute: `@Orquestrador-ICARUS run migrar-make-para-v5`
   - Monitore a saída de cada etapa
   - Verifique se há erros nos testes

3. **Após a Migração**
   - Revise o relatório em `backups/migration/relatorio-migracao.md`
   - Verifique o `git status` no repositório oficial
   - Execute testes adicionais se necessário (e2e)
   - Commit as alterações relevantes
   - **Somente após validação completa**: considere remover o diretório `icarus-make`

## ⚠️ Avisos Importantes

### Remoção do icarus-make

A remoção do diretório `/users/daxmeneghel/icarus-make/` é:

- ❌ **NÃO automática**
- ✅ **OPCIONAL**
- ⚠️ **Requer validação manual completa**

Para remover manualmente após validação:

```bash
rm -rf /users/daxmeneghel/icarus-make
```

### Rollback em Caso de Problemas

Se algo der errado durante a migração, você pode restaurar o estado anterior:

```bash
cd /users/daxmeneghel
tar -xzf icarus-v5.0/backups/migration/icarus-v5.0-pre-migration.tar.gz
```

## 🔍 Troubleshooting

### Problema: Testes falhando

**Solução**: 
- Verifique os logs do `npm test`
- Execute testes individualmente para identificar o problema
- Revise as alterações no `git status`

### Problema: Supabase não está respondendo

**Solução**:
- Verifique se o Supabase CLI está instalado
- Execute `supabase login` se necessário
- Verifique as variáveis de ambiente

### Problema: Conflitos de arquivos

**Solução**:
- Revise o diff em `backups/migration/icarus-make.diff`
- Resolva conflitos manualmente
- Use o backup para restaurar se necessário

## 📚 Referências

- Arquivo de configuração: `.cursor/agents.json`
- Agente responsável: `Migracao-Repo`
- Orquestrador: `Orquestrador-ICARUS`

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Revise o relatório de migração
2. Verifique os logs de cada etapa
3. Consulte o diff gerado
4. Use o backup para rollback se necessário

---

**Última atualização**: Novembro 2025  
**Versão do playbook**: 1.0

