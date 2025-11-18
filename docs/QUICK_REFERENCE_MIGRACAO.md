# Quick Reference - Migração icarus-make → icarus-v5.0

## 🚀 Comando Rápido

```bash
@Orquestrador-ICARUS run migrar-make-para-v5
```

## 📋 Checklist Pré-Migração

- [ ] Commit ou stash do trabalho em progresso
- [ ] Ambos os repositórios acessíveis
- [ ] Supabase CLI configurado
- [ ] Node.js e npm atualizados

## 🔄 Etapas do Processo

| # | Etapa | Output | Tempo Estimado |
|---|-------|--------|----------------|
| 1 | `scan-diff` | `backups/migration/icarus-make.diff` | ~1 min |
| 2 | `backup-prod-root` | `backups/migration/icarus-v5.0-pre-migration.tar.gz` | ~2-5 min |
| 3 | `sync-make-para-v5` | Sincronização rsync | ~2-3 min |
| 4 | `git-status-resumo` | Git status output | ~5 seg |
| 5 | `rodar-testes` | Testes + build | ~5-10 min |
| 6 | `verificar-supabase` | Status Supabase | ~30 seg |
| 7 | `relatorio-final` | `backups/migration/relatorio-migracao.md` | ~5 seg |
| 8 | `remover-make-opcional` | Instruções | ~5 seg |

**Tempo Total Estimado**: 15-25 minutos

## 📦 Arquivos Gerados

```
icarus-v5.0/
└── backups/
    └── migration/
        ├── icarus-make.diff                      # Diff completo
        ├── icarus-v5.0-pre-migration.tar.gz     # Backup
        └── relatorio-migracao.md                 # Relatório
```

## 🛡️ Arquivos Protegidos

❌ **NUNCA são alterados**:
- `.git/`
- `node_modules/`

## ⚡ Comandos Individuais

```bash
# Apenas diff
@Migracao-Repo:scan-diff

# Apenas backup
@Migracao-Repo:backup-prod-root

# Apenas sincronização
@Migracao-Repo:sync-make-para-v5

# Apenas testes
@Migracao-Repo:rodar-testes

# Apenas Supabase
@Migracao-Repo:verificar-supabase
```

## 🔙 Rollback de Emergência

```bash
cd /users/daxmeneghel
tar -xzf icarus-v5.0/backups/migration/icarus-v5.0-pre-migration.tar.gz
```

## ⚠️ Remoção do icarus-make

**NUNCA executado automaticamente!**

Após validação completa manual:

```bash
rm -rf /users/daxmeneghel/icarus-make
```

## 🎯 Pós-Migração

1. ✅ Revisar `relatorio-migracao.md`
2. ✅ Verificar `git status`
3. ✅ Rodar testes e2e específicos
4. ✅ Commit das alterações
5. ✅ Validar em ambiente de staging
6. ✅ Considerar remoção do icarus-make

## 🆘 Em Caso de Erro

1. **Não entre em pânico!** 
2. Você tem backup completo
3. Revise os logs
4. Execute rollback se necessário
5. Execute etapas individualmente

## 📞 Referências Rápidas

- **Config**: `.cursor/agents.json`
- **Agente**: `Migracao-Repo`
- **Docs**: `docs/PLAYBOOK_MIGRACAO_MAKE_PARA_V5.md`

---

**Tip**: Sempre revise o relatório antes de fazer commit! 📝

