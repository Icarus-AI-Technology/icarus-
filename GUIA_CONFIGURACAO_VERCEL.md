# 🚀 GUIA: Configurar Credenciais no Vercel - icarus-oficial

**Projeto**: [icarus-oficial](https://vercel.com/daxs-projects-5db3d203/icarus-oficial)  
**Data**: 18 de novembro de 2025

---

## 📋 PASSO A PASSO

### **Passo 1: Acessar Configurações do Projeto**

1. Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

2. Ou navegue manualmente:
   - Vá para: https://vercel.com/daxs-projects-5db3d203/icarus-oficial
   - Clique em **"Settings"** (menu superior)
   - Clique em **"Environment Variables"** (menu lateral)

---

### **Passo 2: Adicionar as 15 Credenciais**

Para cada credencial abaixo, clique em **"Add New"** e preencha:

#### 📱 **Comunicação (8 variáveis)**

```
Name:  VITE_TWILIO_ACCOUNT_SID
Value: [Cole seu Account SID do Twilio]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_TWILIO_AUTH_TOKEN
Value: [Cole seu Auth Token do Twilio]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_TWILIO_PHONE_NUMBER
Value: [Cole seu número Twilio, ex: +5511999999999]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_WHATSAPP_ACCESS_TOKEN
Value: [Cole seu Access Token do WhatsApp Business]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_SENDGRID_API_KEY
Value: [Cole sua API Key do SendGrid]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_SENDGRID_FROM_EMAIL
Value: [Cole seu email verificado no SendGrid]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_MAILCHIMP_API_KEY
Value: [Cole sua API Key do Mailchimp]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_MAILCHIMP_DC
Value: [Cole seu Data Center, ex: us1, us2, us3]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 🏥 **OPME (6 variáveis)**

```
Name:  VITE_ABBOTT_API_KEY
Value: [Cole sua API Key da Abbott]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_MEDTRONIC_CLIENT_ID
Value: [Cole seu Client ID da Medtronic]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_MEDTRONIC_CLIENT_SECRET
Value: [Cole seu Client Secret da Medtronic]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_JJ_TRACELINK_TOKEN
Value: [Cole seu Token da J&J TraceLink]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_STRYKER_API_KEY
Value: [Cole sua API Key da Stryker]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name:  VITE_BOSTON_SCIENTIFIC_TOKEN
Value: [Cole seu Token da Boston Scientific]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 🔗 **APIs (1 variável)**

```
Name:  VITE_INFOSIMPLES_TOKEN
Value: [Cole seu Token do InfoSimples]
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **Passo 3: Salvar Cada Variável**

Após preencher cada variável:
1. Verifique que **TODOS os 3 ambientes** estão selecionados:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
2. Clique em **"Save"**

---

### **Passo 4: Sincronizar com Supabase Local**

Após adicionar todas as 15 variáveis no Vercel, execute no terminal:

```bash
cd /Users/daxmeneghel/icarus-make
pnpm run sync:from-vercel
```

Este comando irá:
1. ✅ Baixar as variáveis do Vercel
2. ✅ Sincronizar com o banco Supabase
3. ✅ Atualizar os registros de credenciais
4. ✅ Mostrar o status de cada credencial

---

### **Passo 5: Verificar Status**

Após a sincronização, verifique se tudo está correto:

```bash
pnpm run credentials:status
```

Você deve ver:
```
✅ Configuradas: 15/15
⏳ Disponíveis para configuração: 0/15
```

---

### **Passo 6: Acessar Interface Local**

Verifique visualmente na interface:

```
http://localhost:5173/integracoes/credenciais
```

Todas as credenciais devem mostrar:
- ✅ Status verde (Configurada)
- Valores mascarados (****)

---

## 🔐 ONDE OBTER AS CREDENCIAIS

### **Comunicação**

1. **Twilio**
   - URL: https://console.twilio.com/
   - Account SID: Dashboard principal
   - Auth Token: Dashboard principal (abaixo do Account SID)
   - Phone Number: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

2. **WhatsApp Business**
   - URL: https://business.facebook.com/
   - Acesse WhatsApp Business API
   - Gere um Access Token permanente

3. **SendGrid**
   - URL: https://app.sendgrid.com/settings/api_keys
   - Crie uma API Key com permissões de envio
   - From Email: Configure em https://app.sendgrid.com/settings/sender_auth

4. **Mailchimp**
   - URL: https://admin.mailchimp.com/account/api/
   - Crie uma API Key
   - Data Center: Está na própria API Key (ex: `xxxxx-us1` → DC é `us1`)

### **OPME**

5. **Abbott Track&Trace**
   - Contate seu representante comercial Abbott
   - Solicite acesso à API Track&Trace

6. **Medtronic VISION**
   - URL: https://vision.medtronic.com/
   - Faça cadastro e solicite credenciais OAuth2

7. **J&J TraceLink**
   - URL: https://www.tracelink.com/
   - Cadastre-se e solicite token de acesso

8. **Stryker Connect**
   - URL: https://connect.stryker.com/
   - Solicite API Key através do portal

9. **Boston Scientific iTrace**
   - Contate seu representante Boston Scientific
   - Solicite token de acesso à API iTrace

### **APIs**

10. **InfoSimples (SEFAZ/Receita)**
    - URL: https://www.infosimples.com/
    - Crie uma conta
    - Dashboard → API Keys → Gere um token

---

## ⚠️ IMPORTANTE: PREFIXO VITE_

**TODAS as variáveis DEVEM ter o prefixo `VITE_` no Vercel!**

❌ **Errado:**
```
TWILIO_ACCOUNT_SID
SENDGRID_API_KEY
```

✅ **Correto:**
```
VITE_TWILIO_ACCOUNT_SID
VITE_SENDGRID_API_KEY
```

**Por quê?**
- O projeto usa Vite como bundler
- Vite só expõe variáveis com prefixo `VITE_` no frontend
- Sem o prefixo, as credenciais não serão acessíveis

---

## 🔄 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Configure no Vercel                                      │
│    → https://vercel.com/.../icarus-oficial/settings/...    │
│    → Adicione 15 variáveis com prefixo VITE_               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Sincronize com Supabase                                  │
│    → pnpm run sync:from-vercel                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Verifique o Status                                       │
│    → pnpm run credentials:status                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Acesse a Interface                                       │
│    → http://localhost:5173/integracoes/credenciais         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Teste as Integrações                                     │
│    → SMS, WhatsApp, Email, OPME                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST

### Vercel
- [ ] Acessar configurações do projeto
- [ ] Adicionar VITE_TWILIO_ACCOUNT_SID
- [ ] Adicionar VITE_TWILIO_AUTH_TOKEN
- [ ] Adicionar VITE_TWILIO_PHONE_NUMBER
- [ ] Adicionar VITE_WHATSAPP_ACCESS_TOKEN
- [ ] Adicionar VITE_SENDGRID_API_KEY
- [ ] Adicionar VITE_SENDGRID_FROM_EMAIL
- [ ] Adicionar VITE_MAILCHIMP_API_KEY
- [ ] Adicionar VITE_MAILCHIMP_DC
- [ ] Adicionar VITE_ABBOTT_API_KEY
- [ ] Adicionar VITE_MEDTRONIC_CLIENT_ID
- [ ] Adicionar VITE_MEDTRONIC_CLIENT_SECRET
- [ ] Adicionar VITE_JJ_TRACELINK_TOKEN
- [ ] Adicionar VITE_STRYKER_API_KEY
- [ ] Adicionar VITE_BOSTON_SCIENTIFIC_TOKEN
- [ ] Adicionar VITE_INFOSIMPLES_TOKEN

### Sincronização
- [ ] Executar `pnpm run sync:from-vercel`
- [ ] Verificar `pnpm run credentials:status`
- [ ] Acessar interface local
- [ ] Confirmar 15/15 configuradas

### Produção
- [ ] Fazer redeploy no Vercel
- [ ] Testar em produção

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Ver status atual
pnpm run credentials:status

# Sincronizar do Vercel
pnpm run sync:from-vercel

# Sincronizar para o Vercel
pnpm run sync:vercel

# Adicionar via script interativo
bash scripts/add-vercel-credentials.sh
```

---

## 📊 RESULTADO ESPERADO

Após configurar tudo:

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          ✅ SISTEMA 100% OPERACIONAL                        ║
║                                                              ║
║   📱 SMS/WhatsApp/Email funcionando                         ║
║   🏥 Rastreabilidade OPME completa                          ║
║   🔍 Validação SEFAZ em tempo real                          ║
║   📊 15 integrações ativas                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

**Projeto**: https://vercel.com/daxs-projects-5db3d203/icarus-oficial  
**Última atualização**: 18 de novembro de 2025

