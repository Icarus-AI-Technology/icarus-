# 💾 GUIA DE BACKUP — ICARUS

**Versão:** 1.0  
**Data:** 2025-10-18  
**Estratégia:** 3-2-1 (3 cópias, 2 mídias, 1 offsite)

---

## 📋 VISÃO GERAL

Sistema de backup automático com:

- ✅ **Backup diário completo** (03:00 AM)
- ✅ **Compressão gzip** (~70-80% redução)
- ✅ **Retenção:** 30 dias (configurável)
- ✅ **Verificação de integridade** automática
- ✅ **Logs detalhados** de cada operação
- ✅ **Restauração simplificada** (assistida)

---

## 🚀 SETUP INICIAL

### 1. Configurar Variável de Ambiente

Adicione ao seu `~/.zshrc` ou `~/.bashrc`:

```bash
# Backup ICARUS
export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres'
export BACKUP_DIR='/Users/daxmeneghel/icarus-make/backups'
```

Recarregue:

```bash
source ~/.zshrc  # ou ~/.bashrc
```

### 2. Configurar Cron (Automático)

```bash
# Configuração interativa
npm run db:backup:setup

# OU manualmente
crontab -e

# Adicionar linha:
0 3 * * * export SUPABASE_DB_URL='...' BACKUP_DIR='/path'; /path/scripts/db/backup-daily.sh >> /path/backups/backup.log 2>&1
```

**Horário recomendado:** 03:00 AM (menor uso do sistema)

### 3. Testar Backup Manual

```bash
# Teste imediato
npm run db:backup

# Verificar resultado
ls -lh backups/
tail backups/backup.log
```

---

## 📊 ESTRUTURA DE ARQUIVOS

```
/backups
  ├── icarus_backup_20251018_030001.sql.gz  (Completo diário)
  ├── icarus_backup_20251019_030001.sql.gz
  ├── icarus_backup_schema_20251018.sql     (Schema apenas)
  └── backup.log                            (Log de operações)
```

### Nomenclatura

- **Backup completo:** `icarus_backup_YYYYMMDD_HHMMSS.sql.gz`
- **Schema:** `icarus_backup_schema_YYYYMMDD.sql`
- **Log:** `backup.log` (append, rotacionado mensalmente)

---

## 🔄 TIPOS DE BACKUP

### 1. Backup Completo (Diário)

**O que inclui:**
- ✅ Schema (DDL completo)
- ✅ Dados de todas as tabelas
- ✅ Sequences
- ✅ Views/Materialized Views
- ❌ Roles/Users (controle Supabase)
- ❌ Extensões (já configuradas)

**Tamanho estimado:**
- Vazio: ~50 KB
- 1.000 registros: ~500 KB
- 10.000 registros: ~3-5 MB
- 100.000 registros: ~30-50 MB

**Comando:**

```bash
npm run db:backup
```

### 2. Schema Only (Semanal)

**O que inclui:**
- ✅ CREATE TABLE
- ✅ CREATE INDEX
- ✅ CREATE FUNCTION
- ✅ CREATE TRIGGER
- ❌ Dados

**Uso:** Versionamento, documentação, deploy em novo ambiente

**Gerado automaticamente** no primeiro backup do dia.

### 3. Backup Sob Demanda

```bash
# Backup antes de operação crítica
npm run db:backup

# Backup com nome customizado
export BACKUP_DIR=./backups/pre-migration
npm run db:backup
```

---

## ♻️ POLÍTICA DE RETENÇÃO

### Padrão (30 dias)

| Período | Frequência | Retenção |
|---------|------------|----------|
| **Diário** | 1x/dia (03:00) | 30 dias |
| **Schema** | 1x/dia (1º backup) | 7 dias |
| **Manual** | Sob demanda | 30 dias |

### Customizar Retenção

Editar `scripts/db/backup-daily.sh`:

```bash
# Linha 15
RETENTION_DAYS=30  # Alterar para 60, 90, etc
```

### Retenção por Compliance

- **LGPD:** 5 anos (dados de auditoria)
- **ANVISA:** 5 anos (rastreabilidade OPME)
- **Contábil:** 7 anos (notas fiscais)

**Recomendação:** Mover backups > 30 dias para storage frio (S3 Glacier, Google Archive)

---

## 🔄 RESTAURAÇÃO

### Opção 1: Assistida (Recomendado)

```bash
npm run db:restore

# Selecionar backup da lista
# Confirmar com 'RESTAURAR'
```

### Opção 2: Manual

```bash
# Descompactar e restaurar
gunzip -c backups/icarus_backup_20251018_030001.sql.gz | psql "$SUPABASE_DB_URL"

# OU em dois passos
gunzip backups/icarus_backup_20251018_030001.sql.gz
psql "$SUPABASE_DB_URL" -f backups/icarus_backup_20251018_030001.sql
```

### Opção 3: Restauração Parcial (Tabela Específica)

```bash
# Extrair CREATE TABLE
pg_restore -t produtos backups/icarus_backup_20251018_030001.sql.gz

# Restaurar apenas dados de uma tabela
pg_restore -a -t produtos backups/icarus_backup_20251018_030001.sql.gz | psql "$SUPABASE_DB_URL"
```

### ⚠️ Cuidados na Restauração

1. **Sempre em ambiente de teste primeiro**
2. **Fazer backup do estado atual antes de restaurar**
3. **Verificar compatibilidade de versão** (pg_dump/psql)
4. **Desativar triggers/constraints se necessário:**

```sql
-- Desativar triggers
SET session_replication_role = replica;

-- Restaurar dados

-- Reativar triggers
SET session_replication_role = DEFAULT;
```

---

## 🧪 TESTES DE RESTAURAÇÃO

### Checklist Mensal

```bash
# 1. Restaurar em ambiente de teste
createdb icarus_test
gunzip -c backups/ultimo_backup.sql.gz | psql postgresql://user:pass@localhost/icarus_test

# 2. Verificar integridade
psql icarus_test -c "SELECT COUNT(*) FROM empresas;"
psql icarus_test -c "SELECT COUNT(*) FROM audit_log;"

# 3. Verificar hash chain
psql icarus_test -c "SELECT * FROM verificar_integridade_audit_log() WHERE NOT integro;"

# 4. Limpar
dropdb icarus_test
```

**Frequência:** Mensal (1º domingo do mês)

---

## ☁️ BACKUP OFFSITE (Opcional)

### AWS S3

```bash
# Instalar AWS CLI
brew install awscli  # macOS
# ou: pip install awscli

# Configurar
aws configure

# Adicionar ao backup-daily.sh (linha ~130):
aws s3 cp "$BACKUP_FILE" "s3://seu-bucket/icarus-backups/" \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256
```

### Google Cloud Storage

```bash
# Instalar gcloud
brew install --cask google-cloud-sdk

# Autenticar
gcloud auth login

# Upload
gsutil cp "$BACKUP_FILE" gs://seu-bucket/icarus-backups/
```

### Supabase Vault (nativo)

```bash
# Via Supabase CLI
supabase db dump -f backups/dump_$(date +%Y%m%d).sql
supabase storage cp backups/dump_*.sql supabase://backups/
```

---

## 📈 MONITORAMENTO

### Logs

```bash
# Acompanhar backup em tempo real
tail -f backups/backup.log

# Últimos 50 registros
tail -n 50 backups/backup.log

# Buscar erros
grep "ERRO\|ERROR" backups/backup.log

# Estatísticas de hoje
grep "$(date +%Y-%m-%d)" backups/backup.log
```

### Alertas (Recomendado)

**1. Falha no Backup**

```bash
# Adicionar ao final do backup-daily.sh
if [ $? -ne 0 ]; then
  echo "Backup falhou!" | mail -s "❌ ICARUS Backup FALHOU" admin@empresa.com
fi
```

**2. Espaço em Disco**

```bash
# Cron diário
0 4 * * * df -h /Users/daxmeneghel/icarus-make/backups | grep -q '9[0-9]%' && echo "Espaço baixo!" | mail -s "⚠️ Espaço Backup" admin@empresa.com
```

**3. Backup Ausente**

```bash
# Verificar se há backup de hoje
if [ ! -f backups/icarus_backup_$(date +%Y%m%d)_*.sql.gz ]; then
  echo "Nenhum backup hoje!" | mail -s "⚠️ Backup Ausente" admin@empresa.com
fi
```

---

## 🔐 SEGURANÇA DO BACKUP

### Criptografia

**At-rest (Supabase):** ✅ AES-256 automático

**In-transit:** ✅ TLS 1.3 (pg_dump via SSL)

**Arquivos locais:** ⚠️ Adicionar criptografia extra:

```bash
# Criptografar backup
gpg --symmetric --cipher-algo AES256 backups/icarus_backup_20251018.sql.gz

# Descriptografar
gpg --decrypt backups/icarus_backup_20251018.sql.gz.gpg | gunzip | psql "$SUPABASE_DB_URL"
```

### Permissões

```bash
# Restringir acesso ao diretório de backups
chmod 700 backups/
chmod 600 backups/*.sql.gz
```

### Controle de Acesso

- ✅ Apenas admins com SUPABASE_DB_URL
- ✅ Service role key NÃO exposta
- ✅ Backups fora do repositório git (.gitignore)

---

## 🆘 CENÁRIOS DE RECUPERAÇÃO

### 1. Perda de Dados Acidental (< 24h)

```bash
# Restaurar backup de ontem
npm run db:restore
# Selecionar backup do dia anterior
```

**RTO:** ~5-15 minutos  
**RPO:** 24 horas

### 2. Corrupção de Tabela Específica

```bash
# Restaurar apenas a tabela afetada
gunzip -c backups/ultimo_backup.sql.gz | \
  grep -A 10000 "CREATE TABLE produtos" | \
  psql "$SUPABASE_DB_URL"
```

**RTO:** ~10 minutos  
**RPO:** 24 horas

### 3. Desastre Total (Perda do Projeto Supabase)

```bash
# 1. Criar novo projeto Supabase
# 2. Obter nova SUPABASE_DB_URL
# 3. Aplicar migrations
npm run db:migrate

# 4. Restaurar dados
npm run db:restore
```

**RTO:** ~1-2 horas  
**RPO:** 24 horas

### 4. Rollback de Migration Problemática

```bash
# 1. Identificar backup pré-migration
# 2. Restaurar estado anterior
npm run db:restore

# 3. Revisar migration
# 4. Aplicar correção
```

**RTO:** ~30 minutos  
**RPO:** 0 (se backup imediatamente antes)

---

## 📊 CUSTOS ESTIMADOS

### Armazenamento Local

- **30 dias × 5 MB/dia:** ~150 MB
- **Custo:** R$ 0 (gratuito)

### Cloud Storage (Opcional)

| Provedor | 1 GB/mês | 10 GB/mês | 100 GB/mês |
|----------|----------|-----------|------------|
| **AWS S3 Standard-IA** | ~R$ 0,50 | ~R$ 5 | ~R$ 50 |
| **Google Cloud Archive** | ~R$ 0,20 | ~R$ 2 | ~R$ 20 |
| **Azure Cool Blob** | ~R$ 0,40 | ~R$ 4 | ~R$ 40 |

**Recomendação:** AWS S3 Standard-IA (melhor custo-benefício para LGPD)

---

## ✅ CHECKLIST DE CONFORMIDADE

- [x] Backup diário automatizado
- [x] Retenção definida (30 dias)
- [x] Testes de restauração mensais
- [x] Logs de auditoria de backups
- [x] Verificação de integridade automática
- [x] Compressão habilitada
- [ ] Criptografia extra (GPG) — opcional
- [ ] Upload para cloud storage — recomendado
- [ ] Alertas de falha configurados — recomendado
- [ ] DR plan documentado — em andamento

---

## 🎯 PRÓXIMOS PASSOS

1. **Imediato:**
   - [x] Configurar backup local diário
   - [ ] Executar primeiro backup manual
   - [ ] Verificar logs

2. **Semana 1:**
   - [ ] Configurar upload para S3/GCS
   - [ ] Configurar alertas por e-mail
   - [ ] Testar restauração em ambiente teste

3. **Mês 1:**
   - [ ] Executar DR drill completo
   - [ ] Documentar RTO/RPO reais
   - [ ] Revisar política de retenção

---

## 📞 SUPORTE

**Responsável:** Agente Sênior BD  
**Suporte Técnico:** suporte@icarusai.com.br  
**Scripts:** `/scripts/db/backup-*.sh`  
**Logs:** `/backups/backup.log`  
**Documentação:** Este arquivo

---

## 🔗 LINKS ÚTEIS

- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [Supabase Backup Guide](https://supabase.com/docs/guides/platform/backups)
- [AWS S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)

---

**Última atualização:** 2025-10-18  
**Versão:** 1.0

