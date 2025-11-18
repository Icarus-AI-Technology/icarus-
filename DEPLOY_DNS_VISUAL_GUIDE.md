# 🎯 GUIA VISUAL: DNS REGISTRO.BR PARA VERCEL

**Passo a passo com capturas de tela (instruções textuais)**

---

## 📋 RESUMO RÁPIDO

```
1. Deploy no Vercel → Obter IP: 76.76.21.21
2. Registro.br → Adicionar registro A: @ → 76.76.21.21
3. Registro.br → Adicionar CNAME: www → cname.vercel-dns.com
4. Aguardar 5-60 minutos (propagação)
5. Verificar HTTPS: https://seudominio.com.br ✅
```

---

## 🖥️ PASSO 1: PAINEL REGISTRO.BR

### 1.1 Login
```
URL: https://registro.br/
Login: CPF/CNPJ
Senha: sua senha

[Tela de Login]
┌────────────────────────────────────────┐
│  🇧🇷 Registro.br                       │
│                                        │
│  CPF/CNPJ: [_______________]          │
│  Senha:    [_______________]          │
│                                        │
│  [ Entrar ]                            │
└────────────────────────────────────────┘
```

### 1.2 Selecionar Domínio
```
Após login:
┌────────────────────────────────────────┐
│  Meus Domínios                         │
├────────────────────────────────────────┤
│  ☑️ seudominio.com.br                  │
│     Status: Ativo                      │
│     Validade: 01/01/2026               │
│                                        │
│     [ Gerenciar DNS ]                  │
└────────────────────────────────────────┘

Clicar em: [ Gerenciar DNS ]
```

### 1.3 Editar Zona DNS
```
┌────────────────────────────────────────┐
│  DNS - seudominio.com.br               │
├────────────────────────────────────────┤
│  [ Editar Zona ]  [ Visualizar ]       │
└────────────────────────────────────────┘

Clicar em: [ Editar Zona ]
```

---

## ➕ PASSO 2: ADICIONAR REGISTROS

### 2.1 Registro A (Domínio Principal)

```
┌────────────────────────────────────────┐
│  Adicionar Novo Registro               │
├────────────────────────────────────────┤
│  Host/Nome: [@] (deixar vazio ou @)    │
│                                        │
│  Tipo: [▼ A - IPv4 Address]           │
│                                        │
│  Valor/IP: [76.76.21.21]               │
│                                        │
│  TTL: [3600] segundos (1 hora)         │
│                                        │
│  [ Adicionar Registro ]                │
└────────────────────────────────────────┘

⚠️ IMPORTANTE:
- Host: @ (ou deixar VAZIO)
- Tipo: A
- Valor: 76.76.21.21 (IP da Vercel)
- TTL: 3600 (padrão)
```

### 2.2 Registro CNAME (WWW)

```
┌────────────────────────────────────────┐
│  Adicionar Novo Registro               │
├────────────────────────────────────────┤
│  Host/Nome: [www]                      │
│                                        │
│  Tipo: [▼ CNAME - Canonical Name]     │
│                                        │
│  Valor: [cname.vercel-dns.com]         │
│                                        │
│  TTL: [3600] segundos (1 hora)         │
│                                        │
│  [ Adicionar Registro ]                │
└────────────────────────────────────────┘

⚠️ IMPORTANTE:
- Host: www
- Tipo: CNAME
- Valor: cname.vercel-dns.com
- TTL: 3600 (padrão)
```

---

## ✅ PASSO 3: VERIFICAR CONFIGURAÇÃO

### 3.1 Zona DNS Final
```
┌──────────────────────────────────────────────────────┐
│  Zona DNS: seudominio.com.br                         │
├──────┬────────┬───────────────────────────┬──────────┤
│ Host │ Tipo   │ Valor                     │ TTL      │
├──────┼────────┼───────────────────────────┼──────────┤
│ @    │ A      │ 76.76.21.21              │ 3600     │
│ www  │ CNAME  │ cname.vercel-dns.com     │ 3600     │
│ @    │ NS     │ ns1.registro.br          │ 86400    │
│ @    │ NS     │ ns2.registro.br          │ 86400    │
│ @    │ SOA    │ (registro padrão)        │ 86400    │
└──────┴────────┴───────────────────────────┴──────────┘

✅ Registros corretos criados!

[ Salvar Alterações ]
```

### 3.2 Salvar
```
┌────────────────────────────────────────┐
│  ⚠️  Confirmar Alterações              │
├───────────────���────────────────────────┤
│  As alterações na zona DNS serão       │
│  salvas e propagadas pela internet.    │
│                                        │
│  Tempo de propagação: 5 a 60 minutos   │
│                                        │
│  [ Cancelar ]  [ Confirmar ]           │
└────────────────────────────────────────┘

Clicar em: [ Confirmar ]
```

---

## 🔍 PASSO 4: VERIFICAR PROPAGAÇÃO

### 4.1 Via Terminal (macOS/Linux)
```bash
# Verificar domínio principal
dig seudominio.com.br +short

# Deve retornar:
76.76.21.21

# Verificar WWW
dig www.seudominio.com.br +short

# Deve retornar:
cname.vercel-dns.com.
76.76.21.21
```

### 4.2 Via Site (qualquer SO)
```
URL: https://dnschecker.org/

┌────────────────────────────────────────┐
│  🌐 DNS Checker                        │
├────────────────────────────────────────┤
│  Domain: [seudominio.com.br]           │
│  Type:   [▼ A]                         │
│                                        │
│  [ Check DNS ]                         │
├────────────────────────────────────────┤
│  📍 Results:                           │
│                                        │
│  🇧🇷 São Paulo: 76.76.21.21 ✅         │
│  🇺🇸 New York:  76.76.21.21 ✅         │
│  🇬🇧 London:    76.76.21.21 ✅         │
│  🇯🇵 Tokyo:     76.76.21.21 ✅         │
│  🇦🇺 Sydney:    76.76.21.21 ✅         │
│                                        │
│  ✅ DNS Propagated Globally!           │
└────────────────────────────────────────┘
```

---

## 🎯 PASSO 5: CONFIGURAR NO VERCEL

### 5.1 Adicionar Domínio
```
Vercel Dashboard > Projeto ICARUS

┌────────────────────────────────────────┐
│  Settings > Domains                    │
├────────────────────────────────────────┤
│  Add Domain                            │
│                                        │
│  Domain: [seudominio.com.br]           │
│                                        │
│  [ Add ]                               │
└────────────────────────────────────────┘
```

### 5.2 Aguardar Verificação
```
┌────────────────────────────────────────┐
│  Domains                               │
├────────────────────────────────────────┤
│  seudominio.com.br                     │
│  🔄 Verifying DNS Configuration...     │
│                                        │
│  Expected:                             │
│  A    @    76.76.21.21                 │
│                                        │
│  Current:                              │
│  A    @    76.76.21.21                 │
│                                        │
│  Status: Checking...                   │
└────────────────────────────────────────┘

Aguardar virar verde ✅
```

### 5.3 Domínio Configurado
```
┌────────────────────────────────────────┐
│  Domains                               │
├────────────────────────────────────────┤
│  ✅ seudominio.com.br                  │
│     Valid Configuration                │
│     🔒 Certificate Issued              │
│                                        │
│  ✅ www.seudominio.com.br              │
│     Redirect to seudominio.com.br      │
│                                        │
│  🔗 icarus-v5.0.vercel.app             │
│     Vercel Domain (preserved)          │
└────────────────────────────────────────┘

🎉 Tudo funcionando!
```

---

## 🌐 PASSO 6: TESTAR ACESSO

### 6.1 Browser
```
Abrir navegador:
┌────────────────────────────────────────┐
│  🔒 https://seudominio.com.br          │
└────────────────────────────────────────┘

✅ Deve carregar o ICARUS
✅ Cadeado verde (HTTPS seguro)
✅ Sem avisos de segurança
```

### 6.2 Verificar Certificado SSL
```
Clicar no cadeado 🔒:

┌────────────────────────────────────────┐
│  🔒 Connection is secure               │
├────────────────────────────────────────┤
│  Certificate:                          │
│  - Issued to: seudominio.com.br        │
│  - Issued by: Let's Encrypt            │
│  - Valid until: [90 dias no futuro]    │
│  - Encryption: TLS 1.3                 │
│                                        │
│  ✅ This certificate is valid          │
└────────────────────────────────────────┘
```

---

## 📋 CHECKLIST VISUAL

### Registro.br ✅
```
[ ✅ ] Login realizado
[ ✅ ] Domínio selecionado
[ ✅ ] Zona DNS editada
[ ✅ ] Registro A adicionado (@ → 76.76.21.21)
[ ✅ ] Registro CNAME adicionado (www → cname.vercel-dns.com)
[ ✅ ] Alterações salvas
[ ✅ ] Registros MX preservados (se houver)
```

### Vercel ✅
```
[ ✅ ] Domínio adicionado
[ ✅ ] DNS verificado (✅ Valid Configuration)
[ ✅ ] Certificado SSL emitido (🔒 Certificate Issued)
[ ✅ ] HTTPS funcionando
```

### Testes ✅
```
[ ✅ ] https://seudominio.com.br carrega
[ ✅ ] Cadeado verde (SSL válido)
[ ✅ ] Login funciona
[ ✅ ] Dashboard renderiza
[ ✅ ] Módulos acessíveis
```

---

## 🎉 SUCESSO!

```
┌────────────────────────────────────────┐
│                                        │
│   🎉 DEPLOY COMPLETO!                  │
│                                        │
│   ✅ Domínio: seudominio.com.br        │
│   ✅ HTTPS: Let's Encrypt              │
│   ✅ CDN: Vercel Global                │
│   ✅ Status: Online                    │
│                                        │
│   📊 Próximos passos:                  │
│   • Configurar Environment Variables   │
│   • Criar Vercel KV (Redis)            │
│   • Habilitar Analytics                │
│                                        │
└────────────────────────────────────────┘
```

---

## 💡 DICAS IMPORTANTES

### Campos no Registro.br:

**Host/Nome:**
- `@` = domínio raiz (seudominio.com.br)
- `www` = subdomínio (www.seudominio.com.br)
- `app` = subdomínio (app.seudominio.com.br)

**Tipo:**
- `A` = Aponta para IP (usado para domínio raiz)
- `CNAME` = Aponta para outro domínio (usado para www)
- `MX` = Email (não mexer se tiver email)
- `TXT` = Verificações (Google, etc)

**Valor:**
- Para `A`: IP da Vercel (76.76.21.21)
- Para `CNAME`: cname.vercel-dns.com

**TTL:**
- `3600` = 1 hora (recomendado)
- `86400` = 24 horas (para registros estáveis)
- Quanto menor, mais rápido propaga mudanças

---

**📞 Suporte:**
- Registro.br: https://registro.br/ajuda/
- Vercel: https://vercel.com/support

---

© 2025 ICARUS v5.0  
**Custom Domain. Professional Setup. Production Ready.**

