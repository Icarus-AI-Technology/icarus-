# 🔄 GUIA DE BACKUP AUTOMÁTICO - SUPABASE

**Projeto:** ICARUS v5.0  
**Supabase Project:** gvbkviozlhxorjoavmky  
**Data:** 18/11/2025

---

## 📋 OPÇÕES DE BACKUP

### ✅ OPÇÃO 1: Backup via Dashboard Supabase (Recomendado)

#### Backup Manual Imediato

1. **Acesse:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/database/backups

2. **Criar Backup Manual:**
   - Clique em "Create a backup"
   - Aguarde processamento (2-5 minutos)
   - Backup ficará disponível para download

3. **Download do Backup:**
   - Clique em "Download" no backup criado
   - Salve em local seguro

#### Backup Automático (Plano Pro)

**Nota:** Supabase Pro Plan inclui backups automáticos diários.

**Para habilitar:**

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/billing
2. Upgrade para Pro Plan (se necessário)
3. Backups automáticos são habilitados automaticamente:
   - **Daily backups:** 7 dias de retenção
   - **Weekly backups:** 4 semanas de retenção  
   - **Monthly backups:** 3 meses de retenção

**Custo:** ~$25/mês (Pro Plan)

---

### ✅ OPÇÃO 2: Backup via pg_dump (Linha de Comando)

#### Pré-requisitos

```bash
# Instalar PostgreSQL client tools
# macOS:
brew install postgresql@15

# Linux (Ubuntu/Debian):
sudo apt install postgresql-client-15
```

#### Obter Credenciais de Conexão

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/database
2. Copie a "Connection string" (modo Direct connection)

#### Script de Backup Manual

```bash
#!/bin/bash
# Configurações
PROJECT_REF="gvbkviozlhxorjoavmky"
BACKUP_DIR="./backups/daily"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório
mkdir -p "$BACKUP_DIR"

# Backup completo
pg_dump "postgresql://postgres.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" \
    -U postgres \
    -F c \
    -f "$BACKUP_DIR/backup_${DATE}.dump"

# Compactar
gzip "$BACKUP_DIR/backup_${DATE}.dump"

echo "Backup concluído: backup_${DATE}.dump.gz"
```

**Executar:**
```bash
chmod +x backup.sh
./backup.sh
```

---

### ✅ OPÇÃO 3: Backup Automático com GitHub Actions

#### Criar arquivo `.github/workflows/backup.yml`

```yaml
name: Database Backup

on:
  schedule:
    # Roda todos os dias às 03:00 UTC
    - cron: '0 3 * * *'
  workflow_dispatch: # Permite execução manual

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Install PostgreSQL Client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client
      
      - name: Create Backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          DATE=$(date +%Y%m%d_%H%M%S)
          mkdir -p backups
          pg_dump "$DATABASE_URL" -F c -f "backups/backup_${DATE}.dump"
          gzip "backups/backup_${DATE}.dump"
      
      - name: Upload to GitHub Releases
        uses: softprops/action-gh-release@v1
        with:
          tag_name: backup-${{ github.run_number }}
          files: backups/*.dump.gz
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Configurar Secrets:**

1. Vá em: Repository → Settings → Secrets → Actions
2. Adicione: `DATABASE_URL` com a connection string do Supabase

---

### ✅ OPÇÃO 4: Backup para AWS S3/Google Cloud Storage

#### Script com Upload para S3

```bash
#!/bin/bash
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).dump.gz"

# Fazer backup
pg_dump "$DATABASE_URL" -F c | gzip > "$BACKUP_FILE"

# Upload para S3
aws s3 cp "$BACKUP_FILE" "s3://seu-bucket/backups/icarus/$BACKUP_FILE"

# Limpar arquivo local
rm "$BACKUP_FILE"

# Limpar backups antigos (>30 dias) no S3
aws s3 ls "s3://seu-bucket/backups/icarus/" | \
    while read -r line; do
        createDate=$(echo "$line" | awk '{print $1" "$2}')
        createDate=$(date -d "$createDate" +%s)
        olderThan=$(date -d "30 days ago" +%s)
        if [[ $createDate -lt $olderThan ]]; then
            fileName=$(echo "$line" | awk '{print $4}')
            aws s3 rm "s3://seu-bucket/backups/icarus/$fileName"
        fi
    done
```

---

## ⚙️ CONFIGURAÇÃO RECOMENDADA

### Para Produção (Recomendado)

**Estratégia 3-2-1:**
- **3** cópias dos dados
- **2** tipos de mídia diferentes
- **1** cópia offsite

**Implementação:**

1. ✅ **Backup Primário:** Supabase Pro Plan (backups automáticos)
   - Daily: 7 dias
   - Weekly: 4 semanas
   - Monthly: 3 meses

2. ✅ **Backup Secundário:** GitHub Actions + GitHub Releases
   - Daily backups
   - Retenção: ilimitada (ou conforme espaço)

3. ✅ **Backup Terciário:** AWS S3 ou Google Cloud Storage
   - Weekly backups
   - Retenção: 6 meses
   - Storage classe: Standard-IA (menor custo)

### Para Desenvolvimento

- **Opção 2:** Backup manual via pg_dump conforme necessário
- **Frequência:** Semanal ou antes de mudanças grandes

---

## 🧪 TESTAR RESTAURAÇÃO

**IMPORTANTE:** Sempre teste a restauração dos backups!

### Restaurar de .dump.gz

```bash
# Descompactar
gunzip backup_20251118.dump.gz

# Restaurar (em database de teste!)
pg_restore -d "postgresql://postgres:password@localhost/test_db" \
    -v backup_20251118.dump

# Verificar
psql "postgresql://postgres:password@localhost/test_db" \
    -c "SELECT count(*) FROM empresas;"
```

---

## 📊 MONITORAMENTO DE BACKUPS

### Criar Checklist

```markdown
## Backup Health Check (Mensal)

- [ ] Verificar último backup no dashboard Supabase
- [ ] Testar download de 1 backup aleatório
- [ ] Verificar espaço em storage (S3/GCS)
- [ ] Testar restauração em ambiente de teste
- [ ] Documentar anomalias
```

### Alertas

Configure alertas para:
- ⚠️ Backup falhou
- ⚠️ Espaço de storage < 20%
- ⚠️ Último backup > 48h

---

## 💰 CUSTOS ESTIMADOS

### Supabase Pro Plan
- **Custo:** $25/mês
- **Inclui:** Backups automáticos + outras features Pro

### Self-hosted (GitHub Actions + S3)
- **GitHub Actions:** Grátis (2.000 minutos/mês)
- **AWS S3 Standard-IA:**
  - Storage: ~$0.0125/GB/mês
  - Estimativa backup 5GB: ~$0.06/mês
- **Total:** ~$0.06/mês (praticamente grátis!)

---

## 🎯 RECOMENDAÇÃO FINAL

### Para ICARUS em Produção:

**Implementar:**

1. ✅ **Supabase Pro Plan** (se orçamento permitir)
   - Backups automáticos confiáveis
   - Suporte prioritário
   - Outras features Pro úteis

**OU**

2. ✅ **GitHub Actions + AWS S3** (custo baixo)
   - Backup diário automático
   - Retenção de 30 dias
   - Custo mínimo (~$0.06/mês)

**MAIS:**

3. ✅ **Backup manual mensal** (redundância)
   - Via dashboard Supabase
   - Download e armazenamento local/externo
   - Free

---

## 📁 SCRIPTS CRIADOS

### Disponíveis no Projeto:

- ✅ `scripts/backup-database.sh` - Backup via Supabase CLI (requer Docker)
- ✅ `configs/crontab-backup.txt` - Configuração cron job
- ✅ Este guia: `BACKUP_GUIDE.md`

---

## 🔗 LINKS ÚTEIS

- **Backups Dashboard:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/database/backups
- **Docs Supabase Backup:** https://supabase.com/docs/guides/platform/backups
- **Connection Strings:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/database

---

## ✅ PRÓXIMOS PASSOS

1. **Imediato:** Criar backup manual via dashboard
2. **Esta semana:** Implementar GitHub Actions backup
3. **Este mês:** Considerar upgrade para Pro Plan
4. **Recorrente:** Teste mensal de restauração

---

**Implementação:** Script disponível  
**Status:** ⚠️ Requer escolha de método  
**Prioridade:** Alta  
**Tempo:** 1-2h (dependendo do método)

