# 🚀 Configurar Credenciais no Vercel

**Projeto**: [icarus-oficial](https://vercel.com/daxs-projects-5db3d203/icarus-oficial/)  
**Data**: 18 de novembro de 2025

---

## 🎯 OBJETIVO

Configurar as **15 credenciais de integração** no Vercel para que o sistema funcione em produção com todas as integrações ativas.

---

## 📋 MÉTODO 1: Interface Web do Vercel (RECOMENDADO)

### Passo 1: Acessar Configurações

1. **Acesse**: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables
2. **Clique em**: "Add New Variable"

### Passo 2: Adicionar as 15 Credenciais

Para cada credencial abaixo:

1. **Name**: Cole o nome da variável (ex: `TWILIO_ACCOUNT_SID`)
2. **Value**: Cole o valor da credencial
3. **Environment**: Selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Clique em**: "Save"

---

## 📱 CREDENCIAIS - COMUNICAÇÃO (8)

### 1. Twilio SMS

```
Name:  VITE_TWILIO_ACCOUNT_SID
Value: [Seu Account SID do Twilio]

Name:  VITE_TWILIO_AUTH_TOKEN
Value: [Seu Auth Token do Twilio]

Name:  VITE_TWILIO_PHONE_NUMBER
Value: [Seu número Twilio no formato +1234567890]
```

### 2. WhatsApp Business

```
Name:  VITE_WHATSAPP_ACCESS_TOKEN
Value: [Token da WhatsApp Business API]
```

### 3. SendGrid Email

```
Name:  VITE_SENDGRID_API_KEY
Value: [Sua API Key do SendGrid]

Name:  VITE_SENDGRID_FROM_EMAIL
Value: [Email verificado no SendGrid]
```

### 4. Mailchimp

```
Name:  VITE_MAILCHIMP_API_KEY
Value: [Sua API Key do Mailchimp]

Name:  VITE_MAILCHIMP_DC
Value: [Seu Data Center, ex: us1, us2, us3]
```

---

## 🏥 CREDENCIAIS - OPME (6)

### 5. Abbott Track&Trace

```
Name:  VITE_ABBOTT_API_KEY
Value: [Sua API Key Abbott]
```

### 6. Medtronic VISION

```
Name:  VITE_MEDTRONIC_CLIENT_ID
Value: [Seu Client ID Medtronic]

Name:  VITE_MEDTRONIC_CLIENT_SECRET
Value: [Seu Client Secret Medtronic]
```

### 7. J&J TraceLink

```
Name:  VITE_JJ_TRACELINK_TOKEN
Value: [Seu Token J&J TraceLink]
```

### 8. Stryker Connect

```
Name:  VITE_STRYKER_API_KEY
Value: [Sua API Key Stryker]
```

### 9. Boston Scientific iTrace

```
Name:  VITE_BOSTON_SCIENTIFIC_TOKEN
Value: [Seu Token Boston Scientific]
```

---

## 🔗 CREDENCIAIS - APIs (1)

### 10. InfoSimples (SEFAZ/Receita)

```
Name:  VITE_INFOSIMPLES_TOKEN
Value: [Seu Token InfoSimples]
```

---

## 📋 MÉTODO 2: CLI do Vercel

Se preferir usar a linha de comando:

```bash
# Para cada credencial
npx vercel env add VITE_TWILIO_ACCOUNT_SID production
# Cole o valor quando solicitado

# Ou use este script
npm run sync:vercel
```

---

## 🔄 MÉTODO 3: Sincronizar do Banco Local

Se você já configurou as credenciais no **Gerenciador Local** (`http://localhost:5173/integracoes/credenciais`):

```bash
# Execute o script de sincronização
node scripts/sync-credentials-to-vercel.mjs
```

Este script irá:
1. Ler as credenciais do Supabase
2. Gerar os comandos necessários
3. Guiá-lo na configuração

---

## ✅ VERIFICAR CONFIGURAÇÃO

Após adicionar todas as credenciais:

1. **Acesse**: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables
2. **Verifique** que todas as 15 variáveis estão listadas
3. **Faça um novo deploy** para aplicar as mudanças:
   - Vá em: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/deployments
   - Clique em "Redeploy" no último deployment

---

## 🎯 CHECKLIST

### Comunicação (8)
- [ ] `VITE_TWILIO_ACCOUNT_SID`
- [ ] `VITE_TWILIO_AUTH_TOKEN`
- [ ] `VITE_TWILIO_PHONE_NUMBER`
- [ ] `VITE_WHATSAPP_ACCESS_TOKEN`
- [ ] `VITE_SENDGRID_API_KEY`
- [ ] `VITE_SENDGRID_FROM_EMAIL`
- [ ] `VITE_MAILCHIMP_API_KEY`
- [ ] `VITE_MAILCHIMP_DC`

### OPME (6)
- [ ] `VITE_ABBOTT_API_KEY`
- [ ] `VITE_MEDTRONIC_CLIENT_ID`
- [ ] `VITE_MEDTRONIC_CLIENT_SECRET`
- [ ] `VITE_JJ_TRACELINK_TOKEN`
- [ ] `VITE_STRYKER_API_KEY`
- [ ] `VITE_BOSTON_SCIENTIFIC_TOKEN`

### APIs (1)
- [ ] `VITE_INFOSIMPLES_TOKEN`

**Total**: 15/15 ✅

---

## 🔐 SEGURANÇA

### ⚠️ IMPORTANTE

- ✅ Nunca commite credenciais no Git
- ✅ Use apenas variáveis de ambiente
- ✅ Configure em **Production, Preview e Development**
- ✅ Faça redeploy após adicionar todas

### 🔒 Onde Obter as Credenciais?

1. **Twilio**: https://console.twilio.com/
2. **WhatsApp Business**: https://business.facebook.com/
3. **SendGrid**: https://app.sendgrid.com/settings/api_keys
4. **Mailchimp**: https://admin.mailchimp.com/account/api/
5. **Abbott**: Contate seu representante Abbott
6. **Medtronic**: https://vision.medtronic.com/
7. **J&J**: https://www.tracelink.com/
8. **Stryker**: https://connect.stryker.com/
9. **Boston Scientific**: Contate seu representante
10. **InfoSimples**: https://www.infosimples.com/

---

## 🚀 RESULTADO ESPERADO

Após configurar todas as credenciais:

```
✅ Sistema em Produção com 15 Integrações Ativas

📱 Envio de SMS/WhatsApp/Email funcionando
🏥 Rastreabilidade OPME completa
🔍 Validação SEFAZ/Receita em tempo real
📊 Monitoramento completo das integrações
```

---

## 📚 LINKS ÚTEIS

- [Dashboard Vercel](https://vercel.com/daxs-projects-5db3d203/icarus-oficial/)
- [Env Variables](https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables)
- [Deployments](https://vercel.com/daxs-projects-5db3d203/icarus-oficial/deployments)
- [Gerenciador Local](http://localhost:5173/integracoes/credenciais)

---

**Configuração estimada**: 10-15 minutos  
**Próximo passo**: Redeploy no Vercel para aplicar as mudanças 🚀

