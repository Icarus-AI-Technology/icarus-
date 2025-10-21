# 🎯 APLICAÇÃO MANUAL DA MIGRAÇÃO

**Como você não tem as variáveis de ambiente configuradas, vou criar instruções para aplicar via Supabase Dashboard:**

---

## ✅ PASSO A PASSO SIMPLES

### **1. Acessar SQL Editor**

Abra este link:
```
https://supabase.com/dashboard/project/ttswvavcisdnonytslom/sql
```

### **2. Copiar a Migração**

Abra o arquivo:
```
supabase/migrations/0009_tutores_economia_corrigido.sql
```

Copie TODO o conteúdo (Ctrl+A, Ctrl+C ou Cmd+A, Cmd+C)

### **3. Colar no SQL Editor**

- Cole o conteúdo copiado
- Clique em "RUN" (botão verde) ou pressione Ctrl+Enter

### **4. Aguardar Execução**

Você verá uma das mensagens:
- ✅ **"Success. No rows returned"** = SUCESSO!
- ❌ **Mensagem de erro** = Ver troubleshooting abaixo

---

## ⏱️ TEMPO ESTIMADO

- Copiar: 10 segundos
- Colar: 5 segundos
- Executar: 30-60 segundos
- **Total: ~2 minutos**

---

## ✅ COMO VALIDAR

Após executar, rode esta query no SQL Editor:

```sql
SELECT 
  table_name,
  'Criada/Atualizada' as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'feature_flags',
    'feature_flags_audit',
    'conhecimento_base',
    'legislacao_updates',
    'notificacoes_legislacao',
    'tutor_logs',
    'certificacoes_usuario'
  )
ORDER BY table_name;
```

**Resultado esperado:** 7 tabelas listadas

---

## 🚨 TROUBLESHOOTING

### Erro: "relation already exists"

**Solução:** Ignorar, a migração usa `IF NOT EXISTS`

### Erro: "permission denied"

**Solução:** Certifique-se de estar logado como proprietário do projeto

### Erro: "type 'vector' does not exist"

**Solução:** Executar primeiro:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 📞 PRECISA DE AJUDA?

1. **Dashboard:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom
2. **Arquivo da migração:** `supabase/migrations/0009_tutores_economia_corrigido.sql`
3. **Guia completo:** `docs/tutores/GUIA_APLICACAO_MIGRACAO.md`

---

**© 2025 ICARUS v5.0**

