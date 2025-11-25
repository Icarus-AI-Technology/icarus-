# 🚀 GUIA RÁPIDO - Formulário de Contato

## ⚡ Início Rápido (3 minutos)

### 1️⃣ Iniciar Desenvolvimento

```bash
cd /Users/daxmeneghel/icarus-make
pnpm dev
```

### 2️⃣ Acessar Formulário

Abra no navegador:

```
http://localhost:3000/contato
```

### 3️⃣ Testar API

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "subject": "Dúvida sobre o sistema",
    "message": "Olá, gostaria de mais informações sobre o ICARUS."
  }'
```

**Resposta esperada:**

```json
{ "ok": true }
```

---

## 📋 Campos do Formulário

| Campo        | Tipo     | Obrigatório | Validação                     |
| ------------ | -------- | ----------- | ----------------------------- |
| **Nome**     | text     | ✅ Sim      | Min: 2, Max: 100 caracteres   |
| **Email**    | email    | ✅ Sim      | Formato válido, Max: 160      |
| **Assunto**  | text     | ✅ Sim      | Min: 3, Max: 120 caracteres   |
| **Mensagem** | textarea | ✅ Sim      | Min: 10, Max: 4000 caracteres |
| **Telefone** | text     | ❌ Não      | Opcional                      |

---

## 🎨 Estados da UI

### 1. **Idle** (Inicial)

- Formulário vazio
- Botão "Enviar" ativo
- Sem mensagens

### 2. **Sending** (Enviando)

- Botão desabilitado
- Texto: "Enviando..."
- Cursor: wait

### 3. **Success** (Sucesso)

- ✅ Mensagem verde: "Mensagem enviada com sucesso!"
- Formulário resetado automaticamente
- Campos limpos

### 4. **Error** (Erro)

- ❌ Mensagem vermelha com erro específico
- Formulário mantém dados
- Possibilidade de reenvio

---

## 🔧 Integração Backend

### Opção 1: Supabase (Recomendado)

**1. Criar tabela:**

```sql
CREATE TABLE mensagens_contato (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  assunto TEXT,
  mensagem TEXT NOT NULL,
  status TEXT DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. Habilitar no código:**

Edite `/api/contact.ts` (linha 92), descomente:

```typescript
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
  );

  await supabase.from("mensagens_contato").insert({
    nome: data.name,
    email: data.email,
    telefone: data.phone,
    assunto: data.subject,
    mensagem: data.message,
    status: "novo",
  });
}
```

### Opção 2: SendGrid (Email)

**1. Instalar:**

```bash
pnpm add @sendgrid/mail
```

**2. Adicionar ao código:**

```typescript
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: "contato@icarusai.com.br",
  from: process.env.SENDGRID_FROM_EMAIL!,
  subject: `[Contato] ${data.subject}`,
  text: data.message,
  html: `
    <h2>Nova mensagem de contato</h2>
    <p><strong>De:</strong> ${data.name} (${data.email})</p>
    <p><strong>Assunto:</strong> ${data.subject}</p>
    <p><strong>Mensagem:</strong></p>
    <p>${data.message}</p>
  `,
});
```

**3. Configurar variáveis:**

```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@icarusai.com.br
```

### Opção 3: Twilio (SMS)

```typescript
import twilio from "twilio";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

await client.messages.create({
  body: `📧 Nova mensagem de ${data.name}: ${data.subject}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: "+5511999999999",
});
```

---

## 🎯 Personalização

### Alterar cores

Edite `/src/pages/Contato.tsx` (linha 160):

```tsx
<button
  style={{
    background: "rgba(99, 102, 241, 0.95)",  // Mude a cor aqui
    color: "#fff"
  }}
>
```

### Adicionar campos

1. Adicione no schema (linha 6-23):

```typescript
const contactSchema = z.object({
  // ... campos existentes
  company: z.string().optional(),
  city: z.string().optional(),
});
```

2. Adicione campo no JSX (após linha 154):

```tsx
<div className="mb-4">
  <label className="block mb-2 font-medium" htmlFor="company">
    Empresa (opcional)
  </label>
  <input
    id="company"
    type="text"
    className="neumorphic-input w-full"
    {...register("company")}
  />
</div>
```

### Customizar canais (linha 175-193)

Exemplo:

```tsx
<div className="neumorphic-card">
  <h2 className="text-xl font-semibold mb-3">Nossos Canais</h2>
  <div className="space-y-4 text-sm">
    <div>
      <p className="font-medium">📞 Telefone</p>
      <a href="tel:+5511999999999">+55 11 99999-9999</a>
    </div>
    <div>
      <p className="font-medium">💬 WhatsApp</p>
      <a href="https://wa.me/5511999999999">Fale conosco</a>
    </div>
  </div>
</div>
```

---

## 🐛 Troubleshooting

### Erro: "Cannot POST /api/contact"

**Solução:** Certifique-se que o servidor está na porta 3000

```bash
# Verifique vite.config.ts
server: {
  port: 3000,
}
```

### Erro: "Network Error"

**Solução:** Verifique CORS no backend

```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
```

### Formulário não reseta após envio

**Solução:** Verifique se `reset()` está sendo chamado:

```typescript
// Em Contato.tsx, linha 64
setStatus("success");
reset(); // ← Deve estar aqui
```

### Validação não funciona

**Solução:** Verifique o `resolver`:

```typescript
useForm<ContactFormData>({
  resolver: zodResolver(contactSchema), // ← Deve estar configurado
  mode: "onBlur",
});
```

---

## 📊 Monitoramento

### Logs em Desenvolvimento

Todos os envios são logados no console:

```bash
📧 Nova mensagem de contato: {
  name: 'João Silva',
  email: 'joao@example.com',
  subject: 'Dúvida',
  message: '...',
  timestamp: '2025-10-26T...'
}
```

### Logs em Produção (Vercel)

```bash
vercel logs
# ou
vercel logs --follow
```

---

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] `VITE_SUPABASE_URL` definida
- [ ] `VITE_SUPABASE_ANON_KEY` definida
- [ ] `SENDGRID_API_KEY` (se usar email)
- [ ] Tabela `mensagens_contato` criada no Supabase
- [ ] RLS (Row Level Security) configurado
- [ ] Testes locais passando
- [ ] Build sem erros (`pnpm build`)

---

## 🔗 Links Relacionados

- **Documentação completa:** `RELATORIO_WEBDESIGN_COMPLETO.md`
- **Componentes DS:** `/src/components/oraclusx-ds/`
- **Estilos:** `/src/styles/globals.css`
- **API:** `/api/contact.ts`

---

**✨ Pronto para uso! Sistema validado e testado.**

_Gerado pelo Agente Webdesign Expert_
