# 🌐 DEPLOY VERCEL COM DOMÍNIO REGISTRO.BR

**Guia Completo:** Deploy + Configuração DNS Registro.br  
**Tempo Total:** ~30-60 minutos (aguardar propagação DNS)

---

## 📋 PRÉ-REQUISITOS

✅ Domínio registrado no Registro.br (ex: `seudominio.com.br`)  
✅ Acesso ao painel DNS do Registro.br  
✅ Código do ICARUS no GitHub  
✅ Conta Vercel (grátis)

---

## 🚀 PARTE 1: DEPLOY INICIAL NO VERCEL (10 min)

### Opção A: Via GitHub (RECOMENDADO)

**Passo 1: Push para GitHub**
```bash
cd /Users/daxmeneghel/icarus-make

# Adicionar remote (se ainda não tiver)
git remote add origin https://github.com/seu-usuario/icarus-make.git

# Push
git add .
git commit -m "Deploy Vercel production"
git push origin main
```

**Passo 2: Importar no Vercel**
```bash
1. Acessar: https://vercel.com/new
2. Import Git Repository
3. Selecionar: seu-usuario/icarus-make
4. Configure Project:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
5. Environment Variables: (adicionar depois)
6. Deploy!
```

**Resultado:** URL temporária (ex: `icarus-make.vercel.app`)

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/daxmeneghel/icarus-make
vercel

# Deploy produção
vercel --prod
```

---

## 🌐 PARTE 2: ADICIONAR DOMÍNIO PRÓPRIO (5 min)

### No Dashboard Vercel:

```bash
1. Acessar projeto: https://vercel.com/seu-usuario/icarus-make
2. Settings > Domains
3. Add Domain
4. Digite seu domínio: seudominio.com.br
5. Add
```

**Vercel mostrará 3 opções de configuração DNS. Para Registro.br, usar Opção 2:**

```
⚠️ Domain is not configured correctly

Configure your domain by adding these records:

A Record:
  Type: A
  Name: @
  Value: 76.76.21.21

CNAME Record (opcional, para www):
  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
```

---

## 🔧 PARTE 3: CONFIGURAR DNS NO REGISTRO.BR (10 min)

### Passo 1: Acessar Painel Registro.br

```bash
1. Acessar: https://registro.br/
2. Login com CPF/CNPJ
3. Meus Domínios
4. Selecionar: seudominio.com.br
5. DNS > Editar Zona
```

### Passo 2: Configurar Registros DNS

**IMPORTANTE:** Registro.br tem interface própria. Seguir exatamente:

#### Configuração 1: Domínio Principal (seudominio.com.br)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGISTRO A (IPv4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Host/Nome:  @  (ou deixar vazio)
Tipo:       A
Valor:      76.76.21.21
TTL:        3600 (1 hora)

Clique em: Adicionar
```

#### Configuração 2: WWW (www.seudominio.com.br) - OPCIONAL

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGISTRO CNAME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Host/Nome:  www
Tipo:       CNAME
Valor:      cname.vercel-dns.com
TTL:        3600 (1 hora)

Clique em: Adicionar
```

**Tela do Registro.br deve ficar assim:**

```
┌────────────────────────────────────────────────┐
│ Zona DNS: seudominio.com.br                    │
├────────────────────────────────────────────────┤
│ Host    Tipo    Valor                     TTL  │
├────────────────────────────────────────────────┤
│ @       A       76.76.21.21               3600 │
│ www     CNAME   cname.vercel-dns.com      3600 │
│ (outros registros padrão)                      │
└────────────────────────────────────────────────┘
```

### Passo 3: Salvar Alterações

```bash
1. Revisar configurações
2. Clicar em: Salvar
3. Confirmar alterações
```

**⚠️ ATENÇÃO:** 
- Não remover registros MX (email) se houver
- Não remover registros NS (nameservers)
- Apenas adicionar os registros A e CNAME acima

---

## ⏱️ PARTE 4: AGUARDAR PROPAGAÇÃO DNS (5-60 min)

### O que acontece agora:

```
1. Registro.br atualiza zona DNS (instantâneo)
2. DNS propaga pela internet (5-60 minutos)
3. Vercel detecta configuração (automático)
4. Vercel emite certificado SSL (automático)
5. HTTPS fica disponível (automático)
```

### Verificar Propagação:

**Ferramenta Online:**
```bash
# Acessar:
https://dnschecker.org/

# Inserir:
seudominio.com.br

# Verificar se IP 76.76.21.21 aparece em várias localizações
```

**Via Terminal:**
```bash
# macOS/Linux
dig seudominio.com.br +short
# Deve retornar: 76.76.21.21

# Windows
nslookup seudominio.com.br
# Deve retornar: 76.76.21.21

# Verificar WWW
dig www.seudominio.com.br +short
# Deve retornar: cname.vercel-dns.com -> 76.76.21.21
```

---

## ✅ PARTE 5: VALIDAR NO VERCEL (5 min)

### Verificar Status:

```bash
1. Voltar para: Vercel Dashboard > Settings > Domains
2. Status do domínio deve mudar de:
   ⚠️ Invalid Configuration
   Para:
   ✅ Valid Configuration

3. Aguardar certificado SSL:
   🔄 Issuing Certificate...
   Para:
   ✅ Certificate Issued
```

### Testar Acesso:

```bash
# HTTP (redireciona para HTTPS automaticamente)
http://seudominio.com.br

# HTTPS (seguro)
https://seudominio.com.br

# WWW (se configurou)
https://www.seudominio.com.br
```

**✅ Se abrir o ICARUS, tudo funcionou!**

---

## 🔒 HTTPS AUTOMÁTICO

### Vercel cuida de tudo automaticamente:

✅ **Certificado SSL Let's Encrypt** (grátis)  
✅ **Renovação automática** (a cada 90 dias)  
✅ **Redirecionamento HTTP → HTTPS** (forçado)  
✅ **HSTS Headers** (segurança máxima)  
✅ **TLS 1.3** (protocolo mais recente)

**Nada precisa ser configurado manualmente!**

---

## 🎯 CONFIGURAÇÕES AVANÇADAS (OPCIONAL)

### 1. Redirecionar WWW para Raiz (ou vice-versa)

**No Vercel Dashboard:**
```bash
Settings > Domains > seudominio.com.br > Edit

Redirect:
☑️ Redirect www.seudominio.com.br to seudominio.com.br

Ou vice-versa:
☑️ Redirect seudominio.com.br to www.seudominio.com.br
```

### 2. Subdomínios (ex: app.seudominio.com.br)

**Adicionar no Registro.br:**
```
Host:   app
Tipo:   CNAME
Valor:  cname.vercel-dns.com
TTL:    3600
```

**Adicionar no Vercel:**
```bash
Settings > Domains > Add Domain
Digite: app.seudominio.com.br
```

### 3. Email (Preservar MX Records)

**⚠️ IMPORTANTE:** Se você usa email no domínio (ex: contato@seudominio.com.br), **NÃO REMOVER** os registros MX existentes:

```
┌────────────────────────────────────────────────┐
│ MANTER ESTES REGISTROS (não alterar):         │
├────────────────────────────────────────────────┤
│ @    MX   10   mx1.hostinger.com         3600 │
│ @    MX   20   mx2.hostinger.com         3600 │
└────────────────────────────────────────────────┘
```

---

## 🆘 TROUBLESHOOTING

### Problema 1: "Domain is not configured correctly"

**Causa:** DNS ainda não propagou ou configurado errado

**Solução:**
```bash
1. Verificar registros no Registro.br:
   - Tipo A: @ → 76.76.21.21
   - Tipo CNAME: www → cname.vercel-dns.com

2. Testar DNS:
   dig seudominio.com.br +short
   # Deve retornar: 76.76.21.21

3. Aguardar até 60 minutos (propagação)

4. Limpar cache DNS local:
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
```

### Problema 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Causa:** Certificado SSL ainda sendo emitido

**Solução:**
```bash
1. Aguardar 5-10 minutos
2. Verificar status no Vercel:
   Settings > Domains > Certificate Status
3. Forçar renovação (se necessário):
   Settings > Domains > Renew Certificate
```

### Problema 3: Site não carrega (timeout)

**Causa:** DNS apontando errado

**Solução:**
```bash
1. Verificar IP correto:
   ping seudominio.com.br
   # Deve resolver para 76.76.21.21

2. Se resolver para IP diferente:
   - Editar zona DNS no Registro.br
   - Corrigir valor do registro A
   - Aguardar propagação
```

### Problema 4: "Too Many Redirects"

**Causa:** Loop de redirecionamento HTTP/HTTPS

**Solução:**
```bash
1. Verificar configurações Vercel:
   Settings > Domains
   - Desabilitar redirecionamentos duplicados

2. Limpar cache do navegador:
   Ctrl+Shift+Delete (Chrome/Edge)
   Cmd+Shift+Delete (Safari)
```

### Problema 5: Email parou de funcionar

**Causa:** Registros MX removidos acidentalmente

**Solução:**
```bash
1. Acessar Registro.br > DNS
2. Adicionar novamente registros MX do provedor de email
   (Verificar com provedor: Hostinger, Titan, Google, etc.)

Exemplo Hostinger:
  @  MX  10  mx1.hostinger.com
  @  MX  20  mx2.hostinger.com
```

---

## 📊 CHECKLIST FINAL

### DNS Registro.br:
- [ ] Registro A criado (@ → 76.76.21.21)
- [ ] Registro CNAME criado (www → cname.vercel-dns.com)
- [ ] Alterações salvas
- [ ] Registros MX preservados (se houver email)

### Vercel:
- [ ] Domínio adicionado
- [ ] Status: Valid Configuration ✅
- [ ] Certificado SSL: Issued ✅
- [ ] HTTPS funcionando

### Testes:
- [ ] https://seudominio.com.br carrega
- [ ] https://www.seudominio.com.br carrega
- [ ] Redirecionamento HTTP→HTTPS funciona
- [ ] Certificado SSL válido (cadeado verde)

---

## 🎉 DEPLOY COMPLETO!

### URLs Funcionando:

```
✅ https://seudominio.com.br
✅ https://www.seudominio.com.br (opcional)
✅ https://icarus-make.vercel.app (URL Vercel mantida)
```

### Próximos Passos:

1. **Configurar Environment Variables** (se ainda não fez):
   ```bash
   Settings > Environment Variables
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_OPENROUTER_API_KEY
   ```

2. **Criar Vercel KV** (Redis):
   ```bash
   Storage > Create > KV (Redis)
   Nome: icarus-queue
   ```

3. **Habilitar Analytics**:
   ```bash
   Analytics > Enable
   ```

4. **Testar Funcionalidades**:
   - Login
   - Módulos
   - Auto-preenchimento CNPJ/CEP
   - Monitoramento (/monitoring)

---

## 📚 RECURSOS ÚTEIS

### Documentação Oficial:
- **Vercel Domains:** https://vercel.com/docs/concepts/projects/domains
- **Registro.br DNS:** https://registro.br/tecnologia/ferramentas/dns/
- **DNS Checker:** https://dnschecker.org/

### Suporte:
- **Vercel Support:** https://vercel.com/support
- **Registro.br:** https://registro.br/ajuda/

---

## 💡 DICAS PRO

### 1. Múltiplos Domínios
Você pode adicionar vários domínios ao mesmo projeto:
```bash
- seudominio.com.br (principal)
- seudominio.com (internacional)
- app.seudominio.com.br (subdomínio)
```

### 2. Preview Deployments
Cada branch Git gera uma URL preview automática:
```bash
main → https://seudominio.com.br
develop → https://icarus-make-git-develop-seu-usuario.vercel.app
feature → https://icarus-make-git-feature-seu-usuario.vercel.app
```

### 3. Rollback Instantâneo
Se algo der errado, rollback em 1 clique:
```bash
Deployments > [versão anterior] > Promote to Production
```

### 4. Monitoramento
Ativar alertas de downtime:
```bash
Settings > Notifications > Deployment Notifications
☑️ Email notifications
☑️ Slack/Discord webhooks
```

---

## ✨ RESULTADO FINAL

**Antes:**
- URL: `icarus-make.vercel.app`
- HTTPS: ✅ (Vercel SSL)
- Domínio: genérico

**Depois:**
- URL: `seudominio.com.br` 🎯
- HTTPS: ✅ (SSL próprio)
- Domínio: profissional
- Email: funcionando (se configurado)

**Tempo setup:** ~30-60 min (incluindo propagação DNS)  
**Custo adicional:** $0 (domínio já pago no Registro.br)  
**Manutenção:** Zero (Vercel cuida de tudo)

---

**🌐 ICARUS v5.0 NO AR COM DOMÍNIO PRÓPRIO!**

© 2025 ICARUS v5.0  
**Production Ready. Custom Domain. Enterprise SSL. Zero Configuration.**

