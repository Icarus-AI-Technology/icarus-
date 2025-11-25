# 📧 CONTATOS OFICIAIS — ICARUS AI

**Empresa:** ICARUS OPME  
**Data de registro:** 2025-10-18  
**Versão:** 1.0

---

## 📬 E-MAILS INSTITUCIONAIS

### **Suporte Técnico**
- **E-mail:** suporte@icarusai.com.br
- **Finalidade:** Dúvidas técnicas, problemas no sistema, solicitações de suporte
- **SLA:** Resposta em até 24h (dias úteis)
- **Horário:** Segunda a sexta, 9h às 18h

### **Proteção de Dados (DPO)**
- **E-mail:** dpo@icarusai.com.br
- **Finalidade:** Questões de privacidade, LGPD, direitos dos titulares
- **Base legal:** LGPD Art. 41
- **SLA:** Resposta em até 15 dias (conforme LGPD Art. 18)
- **Horário:** Segunda a sexta, 9h às 18h

### **Comercial** (se aplicável)
- **E-mail:** contato@icarusai.com.br
- **Finalidade:** Vendas, parcerias, informações comerciais

### **Administrativo** (se aplicável)
- **E-mail:** admin@icarusai.com.br
- **Finalidade:** Questões administrativas, financeiras, contratos

---

## 🔐 DIRETRIZES DE USO

### **Suporte Técnico (suporte@icarusai.com.br)**

**Quando usar:**
- ✅ Problemas de login
- ✅ Erros no sistema
- ✅ Dúvidas sobre funcionalidades
- ✅ Solicitações de treinamento
- ✅ Bugs e melhorias
- ✅ Integração de dados
- ✅ Configurações técnicas

**Não usar para:**
- ❌ Questões de LGPD/privacidade (usar DPO)
- ❌ Solicitações comerciais (usar contato/comercial)

---

### **DPO (dpo@icarusai.com.br)**

**Quando usar:**
- ✅ Solicitações de acesso aos dados (DSR)
- ✅ Correção de dados pessoais
- ✅ Anonimização/exclusão de conta
- ✅ Reclamações sobre privacidade
- ✅ Dúvidas sobre uso de dados
- ✅ Comunicação de incidentes
- ✅ Revogação de consentimento

**Não usar para:**
- ❌ Suporte técnico geral (usar suporte@)
- ❌ Vendas/comercial

---

## 📋 PUBLICAÇÃO

### **Footer do Site**

```html
<footer>
  <div className="grid md:grid-cols-3 gap-8">
    
    <!-- Coluna 1: Contato -->
    <div>
      <h4 className="font-semibold mb-2">📞 Contato</h4>
      <p className="text-sm">
        📧 Suporte: 
        <a href="mailto:suporte@icarusai.com.br" 
           className="text-blue-600 hover:underline">
          suporte@icarusai.com.br
        </a>
      </p>
      <p className="text-sm">
        📱 Telefone: (XX) XXXX-XXXX
      </p>
    </div>
    
    <!-- Coluna 2: Legal -->
    <div>
      <h4 className="font-semibold mb-2">⚖️ Legal</h4>
      <ul className="space-y-1 text-sm">
        <li><a href="/politica-privacidade">Política de Privacidade</a></li>
        <li><a href="/termos-uso">Termos de Uso</a></li>
      </ul>
    </div>
    
    <!-- Coluna 3: DPO -->
    <div>
      <h4 className="font-semibold mb-2">🛡️ Proteção de Dados</h4>
      <p className="text-sm mb-1">Encarregado (LGPD Art. 41):</p>
      <p className="text-sm">
        📧 <a href="mailto:dpo@icarusai.com.br" 
              className="text-blue-600 hover:underline">
          dpo@icarusai.com.br
        </a>
      </p>
    </div>
    
  </div>
</footer>
```

---

### **Página de Contato**

```tsx
// src/pages/Contato.tsx

export default function Contato() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fale Conosco</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Suporte Técnico */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🛠️</span>
            <h2 className="text-xl font-semibold">Suporte Técnico</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Problemas técnicos, dúvidas sobre o sistema
          </p>
          <a 
            href="mailto:suporte@icarusai.com.br"
            className="text-blue-600 hover:underline font-medium"
          >
            suporte@icarusai.com.br
          </a>
          <p className="text-sm text-gray-500 mt-2">
            Resposta em até 24h (dias úteis)
          </p>
        </div>
        
        {/* DPO */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🛡️</span>
            <h2 className="text-xl font-semibold">Proteção de Dados</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Questões de privacidade, LGPD, seus dados
          </p>
          <a 
            href="mailto:dpo@icarusai.com.br"
            className="text-blue-600 hover:underline font-medium"
          >
            dpo@icarusai.com.br
          </a>
          <p className="text-sm text-gray-500 mt-2">
            Resposta em até 15 dias (LGPD)
          </p>
        </div>
        
      </div>
    </div>
  );
}
```

---

### **E-mail Assinatura Padrão**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Nome do Funcionário]
[Cargo]
ICARUS OPME

📧 suporte@icarusai.com.br
🌐 www.icarusai.com.br
📱 (XX) XXXX-XXXX

🛡️ Dúvidas sobre LGPD: dpo@icarusai.com.br
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 REDIRECIONAMENTOS (Opcional)

Se você tiver outros domínios, configure aliases:

```bash
# Aliases de e-mail
help@icarusai.com.br        → suporte@icarusai.com.br
support@icarusai.com.br     → suporte@icarusai.com.br
ajuda@icarusai.com.br       → suporte@icarusai.com.br

privacidade@icarusai.com.br → dpo@icarusai.com.br
lgpd@icarusai.com.br        → dpo@icarusai.com.br
```

---

## 📊 MÉTRICAS DE SUPORTE (Sugerido)

### **KPIs a Monitorar**

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Tempo de primeira resposta** | < 4h | Google Workspace / Zendesk |
| **Tempo de resolução** | < 24h | Ticket system |
| **Taxa de satisfação** | > 90% | Survey pós-atendimento |
| **Volume de tickets** | - | Relatório mensal |

---

## 🛠️ CONFIGURAÇÃO TÉCNICA

### **Google Workspace / Microsoft 365**

```yaml
E-mail: suporte@icarusai.com.br
Tipo: Grupo / Lista de Distribuição
Membros:
  - funcionario1@icarusai.com.br
  - funcionario2@icarusai.com.br
  - funcionario3@icarusai.com.br

Auto-resposta: Ativada
Mensagem:
  "Obrigado por entrar em contato com o suporte ICARUS.
   Sua mensagem foi recebida e será respondida em até 24h.
   
   Para questões de privacidade/LGPD, use: dpo@icarusai.com.br
   
   Atenciosamente,
   Equipe ICARUS"

Resposta fora de horário: Ativada
Retenção: 1 ano
```

---

### **Sistema de Tickets (Recomendado)**

**Opções gratuitas/baratas:**
- **Freshdesk** (gratuito até 10 agentes)
- **Zoho Desk** (R$ 40/mês)
- **osTicket** (open source, gratuito)

**Integração:**
- Forward de `suporte@icarusai.com.br` para o sistema
- Categorias: Bug, Dúvida, Feature Request, Outro
- SLA automático: 24h para primeira resposta

---

## 📧 TEMPLATES DE RESPOSTA

### **Template 1: Primeira Resposta (Suporte)**

```
Assunto: Re: [Assunto original]

Olá [Nome],

Obrigado por entrar em contato com o suporte ICARUS!

Recebemos sua solicitação sobre: [resumo do problema]

Nossa equipe está analisando e retornaremos com uma solução em breve.

Número do ticket: #[XXXX]

Atenciosamente,
Equipe de Suporte ICARUS
suporte@icarusai.com.br
```

### **Template 2: Solicitação DSR (DPO)**

```
Assunto: Solicitação de Dados Pessoais - LGPD

Prezado(a) [Nome],

Recebemos sua solicitação de acesso aos dados pessoais em [data].

Conforme LGPD Art. 18, responderemos em até 15 dias.

Para confirmar sua identidade, por favor, responda este e-mail 
informando:
- CPF
- Data de nascimento
- Último login no sistema (aprox.)

Protocolo: #DPO-[XXXX]

Atenciosamente,
[Nome do DPO]
Encarregado de Proteção de Dados
dpo@icarusai.com.br
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Configuração Inicial**

- [ ] Criar e-mail `suporte@icarusai.com.br`
- [ ] Criar e-mail `dpo@icarusai.com.br`
- [ ] Configurar auto-resposta (fora de horário)
- [ ] Adicionar membros do time ao grupo
- [ ] Testar envio/recebimento
- [ ] Configurar assinatura padrão

### **Publicação**

- [ ] Adicionar no footer do site
- [ ] Criar página `/contato`
- [ ] Atualizar página `/suporte` (se existir)
- [ ] Adicionar em e-mails transacionais
- [ ] Atualizar documentação interna

### **Processos**

- [ ] Definir SLA (24h para suporte)
- [ ] Criar templates de resposta
- [ ] Treinar equipe em LGPD (DPO)
- [ ] Configurar sistema de tickets (opcional)
- [ ] Definir escalation matrix

---

## 🔒 SEGURANÇA

### **Boas Práticas**

- ✅ **2FA habilitado** em todos os e-mails corporativos
- ✅ **Criptografia TLS** para envio/recebimento
- ✅ **Backup diário** de e-mails (retenção 1 ano)
- ✅ **Filtro anti-spam** configurado
- ✅ **DMARC/SPF/DKIM** configurados para domínio

### **Confidencialidade**

```
IMPORTANTE:
- Não compartilhar dados pessoais de clientes por e-mail
- Usar links seguros (HTTPS) para compartilhar arquivos
- Não incluir senhas em e-mails
- Validar identidade em solicitações de DSR (DPO)
```

---

## 📞 RESUMO

| Canal | E-mail | Finalidade |
|-------|--------|------------|
| **Suporte** | suporte@icarusai.com.br | Técnico, bugs, dúvidas |
| **DPO** | dpo@icarusai.com.br | LGPD, privacidade, DSR |
| **Comercial** | contato@icarusai.com.br | Vendas, parcerias |

---

**Registrado em:** 2025-10-18  
**Atualizado em:** 2025-10-18  
**Versão:** 1.0  
**Responsável:** Agente Sênior BD

---

## 📝 CHANGELOG

| Data | Alteração |
|------|-----------|
| 2025-10-18 | Registro inicial: suporte@icarusai.com.br + dpo@icarusai.com.br |

