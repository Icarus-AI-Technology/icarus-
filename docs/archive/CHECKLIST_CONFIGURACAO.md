# ✅ CHECKLIST INTERATIVO - CONFIGURAÇÃO

Use este checklist para acompanhar o progresso da configuração.

---

## 🔍 PARTE 1: SENTRY (15 minutos)

### Passo 1: Obter DSN do Sentry
- [ ] **1.1** Acessar: https://sentry.io/organizations/new-ortho-tecnologia-endocirur/
- [ ] **1.2** Fazer login (se necessário)
- [ ] **1.3** Verificar se projeto `react-native` existe
  - Se SIM: Acessar projeto
  - Se NÃO: Criar novo projeto (Platform: JavaScript/React)
- [ ] **1.4** Copiar o **DSN** (Client Keys)
  - Formato: `https://abc123@o1234.ingest.sentry.io/7654321`

**DSN copiado?** ✅ Anote aqui: `_________________________________`

---

### Passo 2: Configurar Variáveis na Vercel

- [ ] **2.1** Acessar: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

- [ ] **2.2** Adicionar variável 1:
  - Name: `VITE_SENTRY_DSN`
  - Value: `(seu DSN copiado no passo 1.4)`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Clicar **Save**

- [ ] **2.3** Adicionar variável 2:
  - Name: `VITE_SENTRY_ORG`
  - Value: `new-ortho-tecnologia-endocirur`
  - Environments: ✅ Production
  - Clicar **Save**

- [ ] **2.4** Adicionar variável 3:
  - Name: `VITE_SENTRY_PROJECT`
  - Value: `react-native` (ou nome do seu projeto)
  - Environments: ✅ Production
  - Clicar **Save**

- [ ] **2.5** Adicionar variável 4:
  - Name: `VITE_APP_VERSION`
  - Value: `5.0.0`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Clicar **Save**

- [ ] **2.6** Adicionar variável 5:
  - Name: `VITE_ENVIRONMENT`
  - Value: `production`
  - Environments: ✅ Production
  - Clicar **Save**

**Todas as 5 variáveis adicionadas?** ✅

---

### Passo 3: Deploy na Vercel

Escolha uma opção:

**Opção A: Via Git (Recomendado)**
```bash
git add .
git commit -m "feat: add Sentry monitoring"
git push
```
- [ ] **3.1** Executar comandos acima
- [ ] **3.2** Aguardar deploy automático na Vercel
- [ ] **3.3** Verificar se deploy concluiu sem erros

**Opção B: Via CLI**
```bash
cd /Users/daxmeneghel/icarus-make
vercel --prod
```
- [ ] **3.1** Executar comando acima
- [ ] **3.2** Aguardar build e deploy
- [ ] **3.3** Copiar URL do deploy

**Deploy concluído?** ✅

---

### Passo 4: Testar Sentry

- [ ] **4.1** Abrir app em produção:
  - URL: https://icarus-oficial-daxs-projects-5db3d203.vercel.app

- [ ] **4.2** Abrir DevTools (F12)

- [ ] **4.3** Ir na aba **Console**

- [ ] **4.4** Verificar se aparece:
  ```
  [Sentry] Inicializado com sucesso
  ```

- [ ] **4.5** No console, executar:
  ```javascript
  throw new Error('Teste Sentry - Funcionando!');
  ```

- [ ] **4.6** Verificar no dashboard Sentry:
  - Acessar: https://sentry.io/organizations/new-ortho-tecnologia-endocirur/issues/
  - Deve aparecer o erro "Teste Sentry - Funcionando!"

**Erro apareceu no Sentry?** ✅

---

### Passo 5: Configurar Alertas (Opcional)

- [ ] **5.1** No Sentry, ir em: Settings → Alerts
- [ ] **5.2** Criar alerta: "Erro novo detectado"
- [ ] **5.3** Adicionar seu email para notificações
- [ ] **5.4** (Opcional) Integrar com Slack/Discord

---

## 🎉 SENTRY CONFIGURADO!

**Se todos os checkboxes acima estão marcados, o Sentry está funcionando!**

---

## 💾 PARTE 2: BACKUP (30 minutos)

### Método Recomendado: GitHub Actions

#### Passo 1: Criar Workflow File

- [ ] **1.1** Criar diretório:
  ```bash
  mkdir -p .github/workflows
  ```

- [ ] **1.2** Criar arquivo `.github/workflows/backup.yml`

- [ ] **1.3** Copiar conteúdo do template abaixo para o arquivo

**Template:**
```yaml
name: Database Backup

on:
  schedule:
    # Todos os dias às 03:00 UTC
    - cron: '0 3 * * *'
  workflow_dispatch: # Permite execução manual

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
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
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/*.dump.gz
          retention-days: 30
```

---

#### Passo 2: Obter Connection String do Supabase

- [ ] **2.1** Acessar: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/database

- [ ] **2.2** Copiar "Connection string" (modo: URI)
  - Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

- [ ] **2.3** Substituir `[PASSWORD]` pela senha real

**Connection string copiada?** ✅

---

#### Passo 3: Adicionar Secret no GitHub

- [ ] **3.1** Ir no repositório GitHub do projeto

- [ ] **3.2** Acessar: Settings → Secrets and variables → Actions

- [ ] **3.3** Clicar em **New repository secret**

- [ ] **3.4** Adicionar:
  - Name: `DATABASE_URL`
  - Value: (connection string copiada no passo 2.3)
  - Clicar **Add secret**

**Secret adicionado?** ✅

---

#### Passo 4: Commit e Push

```bash
git add .github/workflows/backup.yml
git commit -m "feat: add automatic database backup"
git push
```

- [ ] **4.1** Executar comandos acima

- [ ] **4.2** Verificar no GitHub: Actions tab
  - Deve aparecer o workflow "Database Backup"

---

#### Passo 5: Testar Backup Manual

- [ ] **5.1** No GitHub, ir em: Actions → Database Backup

- [ ] **5.2** Clicar em "Run workflow"

- [ ] **5.3** Aguardar conclusão (2-5 min)

- [ ] **5.4** Verificar se backup foi criado com sucesso

- [ ] **5.5** Baixar artifact para testar (opcional)

**Backup funcionando?** ✅

---

## 🎉 BACKUP CONFIGURADO!

**Se todos os checkboxes acima estão marcados, o backup está funcionando!**

---

## 📊 RESUMO FINAL

### Sentry
- [x] Código implementado
- [ ] DSN configurado
- [ ] Deploy realizado
- [ ] Teste validado

### Backup
- [x] Código implementado
- [ ] Workflow criado
- [ ] Secret configurado
- [ ] Teste validado

---

## 🆘 TROUBLESHOOTING

### Sentry não inicializa
- Verifique se `VITE_SENTRY_DSN` está na Vercel
- Verifique se fez redeploy após adicionar variáveis
- Limpe cache do browser (Ctrl+Shift+R)

### Erro não aparece no Sentry
- Aguarde 1-2 minutos (delay normal)
- Verifique se DSN está correto
- Verifique logs do console

### Backup falha
- Verifique se `DATABASE_URL` está correto
- Verifique se senha tem caracteres especiais (URL encode)
- Verifique logs do GitHub Actions

---

## ✅ CONCLUSÃO

Quando todos os checkboxes estiverem marcados:
- ✅ Sentry monitorando erros em tempo real
- ✅ Backup diário automático às 03:00 UTC
- ✅ Sistema 100% configurado e operacional!

**Próxima revisão:** 7 dias (verificar se tudo está funcionando)

